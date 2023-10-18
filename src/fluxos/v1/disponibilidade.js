"use strict"

// interno
import { AgendarRetry } from "../../util/retry.js"
import { Database, controle_atualizacao_gec } from "../../util/database.js"
import { validar_env, send_request, json_datetime } from "../../util/funcoes.js"

// variáveis de ambiente
const ENV = { 
    // API GEC Controle
    gec_controle_basic_auth: process.env["gec_controle_basic_auth"], 
    gec_controle_apikey: process.env["gec_controle_apikey"], 
    gec_controle_limit: process.env["gec_controle_limit"], 
    gec_controle_host: process.env["gec_controle_host"],
    // Conexão GEC Database
    gec_database_user: process.env["gec_database_user"], 
    gec_database_password: process.env["gec_database_password"],
    gec_database_connection: process.env["gec_database_connection"]
}

/**
 * Informar o término do processamento na tabela Service Now de controle `u_integration_control`
 * @param   { string } identificador 
 * @param   { string } status 
 * @param   { string } mensagem 
 * @returns { Promise<import("../../util/types.js").IControleAPI> }
 */
async function controle_atualizacao_api (identificador, status, mensagem) {
    let querys = new URLSearchParams({
        "sysparm_fields": "u_message, short_description, u_response_code, sys_created_on, sys_updated_on, sys_updated_by",
    }),
    headers = {
        "Authorization": ENV.gec_controle_basic_auth,
        "apikey": ENV.gec_controle_apikey,
        "Accept": "application/json",
        "Content-Type": "application/json"
    },
    body = {
        "u_message": mensagem,
        "u_response_code": status
    },
    response = await send_request(
        `https://${ ENV.gec_controle_host }:443/ge/pre-operacao/v1/controle/dados-controle-gec/${ identificador }`, 
        "PUT", querys, headers, JSON.stringify(body)
    )
    
    // sucesso
    if (response.codigo == 200 && response.headers["content-type"]?.at(0)?.includes("json"))
        return JSON.parse(response.body)?.result ?? {}
    // erro
    else throw new Error(`Status/conteudo inesperado ao informar controle na tabela do Service Now: ${ JSON.stringify(response) }`)
}

/**
 * Persistir as disponibilidades na tabela `GEC.ISRH_DISPONIBILIDADE_BLOCO_PAT`
 * - Realiza a mutação das `disponibilidades`
 * @param   { string } casoMoagem
 * @param   { import("../../util/types.js").IDisponibilidade[] } disponibilidades
 * @param   { Database } conexao
 * @returns { Promise<number> } linhas afetadas
 */
async function persistir_dados (casoMoagem, disponibilidades, conexao) {
    if (disponibilidades.length == 0) return 0

    let datetime = json_datetime(-3, false).replace("-03:00", "")
    for (let disponibilidade of disponibilidades) {
        disponibilidade.agora = datetime
        disponibilidade.casoMoagem = casoMoagem
        disponibilidade.value_pct = parseFloat(disponibilidade.value_pct)
        // `date` e `level` são nomes reservados e não podem ser utilizados como bind
        disponibilidade.data = disponibilidade.date
        disponibilidade.nivel = disponibilidade.level
        delete disponibilidade.date
        delete disponibilidade.level
    }

    let sql = await conexao.execute_many(
        `INSERT INTO GEC.ISRH_DISPONIBILIDADE_BLOCO_PAT (ISCI_DF_CASO_MOAG, BLFI_CD_BLOCO_FISICO_ISRH, PACA_CD_PATAMAR_CARGA_ISRH, IDBP_DF_DISPONIBILIDADE_BLOCO, IDBP_DS_TIPO_REGISTRO, IDBP_PR_DISPONIBILIDADE, IDBP_DF_GRAVACAO_DISPONIBILIDA)
        VALUES (TO_DATE(:casoMoagem, 'dd-MM-yyyy hh24:mi'), :physical_block_name, :nivel, TO_DATE(:data, 'yyyy-MM-dd'), :type, :value_pct, TO_DATE(:agora, 'yyyy-MM-dd"T"hh24:mi:ss'))`,
        disponibilidades
    )
    return sql?.rowsAffected ?? 0
}

/**
 * Obter dados da tabela via API Rest
 * @param   { string } grouping data de agrupamento
 * @param   { number } offset   itens a serem pulados
 * @throws  { Error }           erro caso o codigo não seja 200 ou o conteúdo não seja json
 * @returns { Promise<{ next: boolean, disponibilidades: import("../../util/types.js").IDisponibilidade[] }> } retorna as disponibilidades e se há próxima página
 */
async function obter_dados_tabela (grouping, offset) {
    let querys = new URLSearchParams({
        "sysparm_query": `grouping_identifier=${ grouping }`,
        "sysparm_limit": ENV.gec_controle_limit,
        "sysparm_offset": offset,
        "sysparm_fields": "physical_block_name,level,date,type,value_pct",
    }), 
    headers = {
        "Authorization": ENV.gec_controle_basic_auth,
        "apikey": ENV.gec_controle_apikey,
        "Accept": "application/json"
    },
    response = await send_request(
        `https://${ ENV.gec_controle_host }:443/ge/pre-operacao/v1/controle/x_petro_gas_energy_physical_block_availability_consumption_level`, 
        "GET", querys, headers
    )
    
    // sucesso
    if (response.codigo == 200 && response.headers["content-type"]?.at(0)?.includes("json")) {
        let result = JSON.parse(response.body)?.result ?? []
        return {
            next: result.length == parseInt(ENV.gec_controle_limit),
            disponibilidades: result
        }
    // erro
    } else throw new Error(`Status/conteudo inesperado ao obter os dados da tabela Service Now: ${ JSON.stringify(response) }`)
}

/**
 * Fluxo de carga da tabela `x_petro_gas_energy_physical_block_availability_consumption_level`
 * - 1 - Informar o início na tabela GEC de controle
 * - 2 - Obter dados da tabela via API do Service Now
 * - 3 - Persistir os dados na tabela `GEC.ISRH_DISPONIBILIDADE_BLOCO_PAT`
 * - 4 - Informar o término do processamento na tabela SNOW de controle
 * - 5 - Informar o término do processamento na tabela GEC de controle
 * @param   { import("../../util/types.js").ICarga }    body    corpo de requisição
 * @param   { import("../../util/types.js").IContext }  context contexto da requisição
 * @throws  { AgendarRetry }
 * @returns { Promise<void> }
 */
export default async (body, context) => {
    /** 
     * Armazenar a conexão do database para poder fechar no `try` e `catch`
     * @type { Database } 
     */
    let conexao
    console.info(`id(${ context.invocationId }) | retry(${ JSON.stringify(context.retry) }) | Inicio do fluxo disponibilidade`)

    try {
        // Validar se as variáveis de ambiente foram configuradas
        validar_env(ENV)
        
        // Criar conexão com o banco de dados
        conexao = new Database(ENV.gec_database_user, ENV.gec_database_password, ENV.gec_database_connection)
        await conexao.conectar()

        // Informar o início na tabela de controle
        await controle_atualizacao_gec(conexao, body, 0, "processing", "Solicitação de atualização recebida. Processamento da carga da tabela será iniciado.")
        await conexao.commit()
        
        // Extrair os dados da tabela do Service Now - Paginação
        // Persistir os dados na tabela do GEC
        let total = 0,
            offset = 0,
            proximaPagina = true

        while (proximaPagina) {
            let dados = await obter_dados_tabela(body.casoMoagem, offset),
                linhasAfetadas = await persistir_dados(body.casoMoagem, dados.disponibilidades, conexao)
            
            proximaPagina = dados.next
            offset += dados.disponibilidades.length
            total += parseInt(linhasAfetadas)
        }

        // Informar o término do processamento na tabela SNOW de controle
        let controleAPI = await controle_atualizacao_api(body.identificador, "success", "A listagem foi processada")
        
        // Informar o término do processamento com sucesso na tabela GEC de controle
        /** @type { import("../../util/types.js").ICarga } */
        let carga = {
            identificador: body.identificador,
            tabela: body.tabela,
            descricao: controleAPI.short_description,
            responsavel: controleAPI.sys_updated_by,
            casoMoagem: body.casoMoagem,
            dataCriacao: controleAPI.sys_created_on,
            dataAlteracao: controleAPI.sys_updated_on
        }
        await controle_atualizacao_gec(conexao, carga, total, controleAPI.u_response_code, controleAPI.u_message)
        await conexao.commit()
        await conexao.close()

        console.info(`id(${ context.invocationId }) | retry(${ JSON.stringify(context.retry) }) | Fim do fluxo disponibilidade`)

    } catch(erro) {
        console.error(`id(${ context.invocationId }) | retry(${ JSON.stringify(context.retry) }) | erro(${ erro?.message }) | Erro inesperado no fluxo disponibilidade`)
        
        await conexao.rollback()
        await controle_atualizacao_gec(conexao, body, 0, "error", `id(${ context.invocationId }) | Falha na consulta dos dados ou na persistência da tabela de disponibilidade.`)
        await conexao.commit()
        await conexao.close()
        
        await controle_atualizacao_api(body.identificador, "error", "Erro na execução da carga")

        // realizar nova tentativa se possível
        throw new AgendarRetry()
    }
}