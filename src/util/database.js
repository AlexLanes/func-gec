"use strict"

// externo
import OracleDB from "oracledb"

/**
 * Classe de configuração e utilização do Database
 */
export class Database {
    /**
     * Configurar uma nova conexão
     * @param { string } user             Usuario
     * @param { string } password         Senha
     * @param { string } connectionString Conexão URL
     */
    constructor (user, password, connectionString) {
        this.config = {
            user: user,
            password: password,
            connectionString: connectionString
        }
    }

    /**
     * Aguardar a conexão ser estabelecida
     * @throws Caso a conexão não tenha sido estabelecida com sucesso
     */
    async conectar () {
        this.conexao = await OracleDB.getConnection(this.config)
    }

    /**
     * Realizar 1 ou mais operações sql
     * @param { string } sqlParametrizado Sql de insert parametrizado por nomes( :nome, :idade )
     * @param { Record<string, (string|number)>[] } parametros Parâmetros nomeados no `sqlParametrizado`. Cada objeto no array representa 1 execução
     * @throws Erro caso informe os parâmetros e não seja compatível com os parâmetros do `sqlParametrizado`
     */
    async execute_many (sqlParametrizado, parametros) {
        return await this.conexao.executeMany(sqlParametrizado, parametros)
    }

    /**
     * Comittar as alterações realizadas na conexao
     */
    async commit () {
        await this.conexao.commit()
    }

    /**
     * Desfazer as alterações da transação atual
     */
    async rollback () {
        await this.conexao.rollback()
    }

    /**
     * Encerrar conexao atual
     */
    async close () {
        await this.conexao.close()
    }
}

/**
 * Realizar o `UPSERT` na tabela de controle `GEC.ISRH_CONTROLE_INTEGRACAO`
 * @param { Database } conexao                  conexão do database
 * @param { import("./types").ICarga } carga    objeto com os dados de carga
 * @param { number } qtdRegistros               quantidade de registros persistidos no GEC
 * @param { string } status                     status da persistência no GEC
 * @param { string } mensagem                   mensagem da persistência no GEC
 */
export async function controle_atualizacao_gec (conexao, carga, qtdRegistros, status, mensagem) {
    let sql = `
    MERGE INTO GEC.ISRH_CONTROLE_INTEGRACAO
    USING (SELECT 1 FROM DUAL) 
        ON (ISCI_CD_CONTROLE_INTEGRACAO = :identificador) 
    WHEN NOT MATCHED THEN 
        INSERT (ISCI_CD_CONTROLE_INTEGRACAO, ISCI_NM_TABELA_INTEGRACAO, ISCI_DS_TABELA_INTEGRACAO, ISCI_DF_CASO_MOAG, ISCI_QN_TOTAL_REGISTROS, ISCI_DS_SITUACAO_REGISTRO, ISCI_TX_MENSAGEM_ERRO, ISCI_DF_CRIACAO_REGISTRO, ISCI_DF_ATUALIZACAO_REGISTRO, ISCI_TX_RESPONSAVEL_ATUALIZACA) 
        VALUES (:identificador, :tabela, :descricao, TO_DATE(:casoMoagem, 'dd-MM-yyyy hh24:mi'), :qtdRegistros, :status, :mensagem, TO_DATE(:dataCriacao, 'yyyy-MM-dd hh24:mi:ss'), TO_DATE(:dataAlteracao, 'yyyy-MM-dd hh24:mi:ss'), :responsavel) 
    WHEN MATCHED THEN 
        UPDATE SET 
            ISCI_NM_TABELA_INTEGRACAO = :tabela,
            ISCI_DS_TABELA_INTEGRACAO = :descricao,
            ISCI_DF_CASO_MOAG = TO_DATE(:casoMoagem, 'dd-MM-yyyy hh24:mi'),
            ISCI_QN_TOTAL_REGISTROS = :qtdRegistros, 
            ISCI_DS_SITUACAO_REGISTRO = :status,
            ISCI_TX_MENSAGEM_ERRO = :mensagem,
            ISCI_DF_CRIACAO_REGISTRO = TO_DATE(:dataCriacao, 'yyyy-MM-dd hh24:mi:ss'), 
            ISCI_DF_ATUALIZACAO_REGISTRO = TO_DATE(:dataAlteracao, 'yyyy-MM-dd hh24:mi:ss'), 
            ISCI_TX_RESPONSAVEL_ATUALIZACA = :responsavel
    `
    
    return await conexao.execute_many(sql, [{
        ...carga,
        qtdRegistros: qtdRegistros,
        status: status,
        mensagem: mensagem
    }])
}