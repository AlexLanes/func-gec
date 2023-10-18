"use strict"

// interno
import { sleep } from "./funcoes.js"

export class AgendarRetry extends Error {
    /**
     * Classe esperada para realizar uma nova tentiva no agendamento do Retry
     */
    constructor () {
      super()
      this.name = "AgendarRetry"
    }
}

export class Retry {
    /** 
     * Tentativa atual
     * @type { number } 
     */
    tentativa
    /** 
     * Número máximo de tentativas
     * @type { number } 
     * */
    tentativasMaximas
    /**
     * Segundos de espera até a próxima tentativa
     * @type { number | false }
     */
    proximaTentativa

    /**
     * Classe de controle de novas tentivas, caso ocorra erro nos fluxos.
     * Método exponential backoff retry - Duplica o tempo de espera até a próxima tentativa
     */
    constructor () {
        this.tentativa = 0
        this.proximaTentativa = parseInt(process?.env["retry_tempo_inicial"] ?? "30")
        this.tentativasMaximas = parseInt(process?.env["retry_tentativas_maximas"] ?? "1")
    }

    /**
     * - Verificar se é possível realizar uma nova tentativa. 
     * - Aumentar a tentativa atual e dobrar o tempo da proxima tentativa
     * @returns { boolean }
     */
    #nova_tentativa () {
        this.tentativa++
        this.proximaTentativa = (this.tentativa < this.tentativasMaximas)
            ? this.proximaTentativa * 2 // dobrado o tempo da próxima tentativa
            : false                     // não haverá próxima tentativa
        return this.tentativa <= this.tentativasMaximas
    }

    /**
     * Realizar a execução da `funcao` com os `argumentos` e, caso ocorra o erro `AgendarRetry`, agendar novas tentativas
     * - Não são realizadas novas tentativas para erros diferentes de `AgendarRetry`
     * @param   { () => Promise<any> } funcao     função que será realizada as tentativas
     * @param   { any[] }              argumentos argumentos necessários para chamar a função
     * @returns { Promise<any> }
     */
    async agendar (funcao, argumentos) {
        while (this.#nova_tentativa()) {
            try { 
                return await funcao(...argumentos) 
            } catch(erro) {
                if (!erro instanceof AgendarRetry) break    // ignorar demais erros
                await sleep(this.proximaTentativa)          // AgendarRetry 
            }
        }
    }
}