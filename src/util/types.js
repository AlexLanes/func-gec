/**
* @typedef {( import("@azure/functions").InvocationContext & { retry: import("./retry").Retry } )} IContext
*/

/**
* @typedef {{ 
*      tabela: string, 
*      descricao: string, 
*      casoMoagem: string, 
*      dataCriacao: string, 
*      responsavel: string, 
*      dataAlteracao: string, 
*      identificador: string
* }} ICarga
*/

/**
 * @typedef {{ 
 *      u_message: string, 
 *      sys_created_on: string, 
 *      sys_updated_on: string, 
 *      sys_updated_by: string,
 *      u_response_code: string, 
 *      short_description: string
 * }} IControleAPI
 */

/**
* @typedef {{
*      u_date: string,
*      u_offer: string,
*      u_volume: string,
*      u_offer_range: string
* }} IOferta
*/

/**
* @typedef {{
*      u_ldc: string,
*      u_date: string,
*      u_volume_m3: string,
*      u_delivery_point: string
* }} IDemanda
*/

/**
* @typedef {{
*      date: string,
*      type: string,
*      level: string,
*      value_pct: string,
*      physical_block_name: string
* }} IDisponibilidade
*/

export default {}