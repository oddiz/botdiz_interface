import config from 'config'

/**
 * 
 * @param {object} message - Payload to send to the server. {
 *   type: "GET"
 *   token:  
 *   command:
 *   params:
 * } 
 * @param {function} onSuccess - function to be called if successful
 * @param {*} onError - function to be called if not successful
 */
export async function sendGetCommand (websocket, message, onSuccess, onError) {
    const botdizServer = config.botdiz_server

}