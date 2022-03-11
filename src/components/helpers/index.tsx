
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

}

export function shortenString(text, maxWidth, fontSize, fontFamily) {
    function getTextWidth (text){
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const font = fontSize+ " " + fontFamily
        context.font = font
        
        return context.measureText(text).width;
    }

    // if (channelName.length > 22) {
    //     channelName = channelName.substring(0,21) + "..."
    // }

    const textWidth = getTextWidth(text)
    if (textWidth > maxWidth) {
        let counter = 0;

        let newText = text.substring(0,counter) + "..."
        let newTextWidth = getTextWidth(newText)
        
        while (newTextWidth < maxWidth) {

            counter ++
            newText = text.substring(0,counter) + "..."
            newTextWidth = getTextWidth(newText)

            if(counter > 100) {
                //avoid accidental infinite loop
                break
            }
        }

        return newText       
    } else {
        return text
    }
    
}