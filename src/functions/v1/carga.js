"use strict"

// externo
import { app as App } from "@azure/functions"
// interno
import { Retry } from "../../util/retry.js"
import oferta from "../../fluxos/v1/oferta.js"
import demanda from "../../fluxos/v1/demanda.js"
import { validar_schema } from "../../util/funcoes.js"
import disponibilidade from "../../fluxos/v1/disponibilidade.js"

const JSON_SCHEMA = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "identificador": {
            "type": "string",
            "pattern": "\\w+"
        },
        "tabela": {
            "type": "string",
            "enum": [
                "x_petro_gas_energy_moagen_maximum_offer", 
                "x_petro_gas_energy_moagen_maximum_demand",
                "x_petro_gas_energy_physical_block_availability_consumption_level"
            ]
        },
        "descricao": {
            "type": "string"
        },
        "responsavel": {
            "type": "string"
        },
        "casoMoagem": {
            "type": "string",
            "description": "Formato dd-MM-yyyy HH:mm",
            "pattern": "(0[1-9]|[12]\\d|3[01])-(0[1-9]|1[0-2])-(\\d{4}) ([01]\\d|2[0-3]):([0-5]\\d)"
        },
        "dataCriacao": {
            "type": "string",
            "description": "Formato yyyy-MM-dd HH:mm:ss",
            "pattern": "(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01]) ([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)"
        },
        "dataAlteracao": {
            "type": "string",
            "description": "Formato yyyy-MM-dd HH:mm:ss",
            "pattern": "(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01]) ([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)"
        }
    },
    "required": [
        "identificador",
        "tabela",
        "descricao",
        "responsavel",
        "casoMoagem",
        "dataCriacao",
        "dataAlteracao"
    ]
}

App.http('carga', {
    methods: ["PUT"],
    authLevel: "function",
    route: "v1/carga",
    handler: async (request, context) => {
        console.info(`id(${ context.invocationId }) | info(metodo: '${ request.method }', url: '${ request.url }', user: '${ request.user}') | Requisicao para a funcao de carga`)
        
        // validação do tipo do conteúdo recebido
        let content = request.headers.get("content-type") ?? ""
        if (!content.includes("json")) {
            console.error(`id(${ context.invocationId }) | erro(esperado: '*/json', recebido: '${ content }') | Header 'Content-Type' com valor invalido`)
            return { status: 415 }
        }
        
        // validação do corpo da requisição
        /** 
         * @type { import("../../util/types.js").ICarga }
         */
        let body = await request.json(),
            validacao = validar_schema(body, JSON_SCHEMA)
        if (!validacao.valid) {
            console.error(`id(${ context.invocationId }) | erro(${ JSON.stringify(validacao.errors) }) | Body com conteudo invalido`)
            return { status: 400, jsonBody: validacao.errors }
        }

        // criação da política de Retry no `context`
        let retry = new Retry()
        context.retry = retry

        // roteamento para execução do fluxo async de acordo com o nome da tabela
        switch (body.tabela) {
            case "x_petro_gas_energy_moagen_maximum_offer": 
                retry.agendar(oferta, [body, context])
                break
            case "x_petro_gas_energy_moagen_maximum_demand": 
                retry.agendar(demanda, [body, context])
                break
            case "x_petro_gas_energy_physical_block_availability_consumption_level":
                retry.agendar(disponibilidade, [body, context])
                break
        }
        
        let resposta = { 
            status: 202,
            jsonBody: { 
                id: context.invocationId,
                mensagem: "iniciado o processamento"
            }
        }
        
        // retorno imediato 202
        console.info(`id(${ context.invocationId }) | info(${ JSON.stringify(resposta) }) | Resposta para a funcao de carga`)
        return resposta
    }
})