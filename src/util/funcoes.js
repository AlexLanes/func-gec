"use strict"

// externo
import Https from "node:https"
import Request from "node-fetch"
import JsonSchema from "json-schema"

/**
 * Função sleep do Python => await sleep(1)
 * @param   { number } [1] seconds 
 * @returns { Promise<void> }
 */
export async function sleep (seconds = 1) {
    return new Promise( _ => setTimeout(_, seconds * 1000) )
}

/**
 * Validar se o item é válido para o schema
 * @param   { any } item                    item a ser validado
 * @param   { any } schema                  json-schema de validação
 * @returns { JsonSchema.ValidationResult } resposta da validação
 */
export function validar_schema (item, schema) {
    return JsonSchema.validate(item, schema)
}

/**
 * Validar se as variáveis de ambiente foram configuradas.
 * Lança erro caso 1 ou mais propriedades no objeto sejam undefined
 * @param   { Record<string, string | undefined> } env
 * @throws  { Error } Lista de nomes das propriedades que sejam undefined
 * @returns { void }
 */
export function validar_env (env) {
    /** @type { string[] } */
    let variaveis = []
    
    for (let key in env) {
        if (env[key] == undefined) variaveis.push(key)
    }

    if (variaveis.length >= 1)
        throw new Error(`As variaveis de ambiente [${variaveis}] nao foram configuradas`)
}

/**
 * Função genérica para realizar http requests e padronizar resposta
 * @param { string } url                        url do request 
 * @param { string } method                     método http
 * @param { URLSearchParams } querys            query parameters
 * @param { Record<string, string> } headers    objeto com os headers
 * @param { string } body                       body como texto
 */
export async function send_request (url, method, querys = undefined, headers = undefined, body = undefined) {
    /** @type { import("node-fetch").RequestInit } */
    let config = {
        body: body,
        method: method,
        headers: headers,
        // confiança no certificado do host no url
        agent: new Https.Agent({
            rejectUnauthorized: false
        })
    },
    response = await Request(`${ url }?${ querys?.toString() ?? "" }`, config)
    
    return {
        codigo: response.status,
        headers: response.headers.raw(),
        body: await response.text()
    }
}

/**
 * Obter o datetime de agora no formato ISO 8601
 * @param { number } offsetHoras Alterar as horas e a timezone. Defaul: Z
 * @param { boolean } millisegundos Flag para indicar se os millisegundos devem estar presente. Default: true
 */
export function json_datetime (offsetHoras = 0, millisegundos = true) {
    let epoch = Date.now(),
        offset = offsetHoras * 60 * 60 * 1000,
        data = new Date(epoch + offset).toJSON()
    
    if (!millisegundos) data = data.replace(/\.\d+/g, "")
    if (offsetHoras != 0) {
        let sinal = (offsetHoras >= 1) ? "+" : "-",
            horas = Math.abs(offsetHoras).toString().padStart(2, "0"),
            timezone = `${ sinal }${ horas }:00`
        data = data.replace(/Z/g, timezone)
    }
    
    return data
}