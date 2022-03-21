

export function shortenString(text: string, maxWidth: number, fontSize:string, fontFamily: string) {
    
    function getTextWidth (text: string){
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return
        const font = fontSize+ " " + fontFamily
        context.font = font
        
        return context.measureText(text).width;
    }

    // if (channelName.length > 22) {
    //     channelName = channelName.substring(0,21) + "..."
    // }

    const textWidth = getTextWidth(text)
    if (textWidth && textWidth > maxWidth) {
        let counter = 0;

        let newText = text.substring(0,counter) + "..."
        let newTextWidth = getTextWidth(newText)
        
        while (newTextWidth && newTextWidth < maxWidth) {

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

export const formatStreamTime = (streamTime = 0, videoLength = 0) => {
    const sTimeInSec = streamTime / 1000
    const vTimeInSec = videoLength / 1000

    const streamHours = Math.floor((sTimeInSec / (60 * 60)) % 60);
    const streamMins = Math.floor((sTimeInSec / 60) % 60);
    const streamSecs = Math.floor(sTimeInSec % 60);

    const videoHours = Math.floor((vTimeInSec / (60 * 60)) % 60);
    const videoMins = Math.floor((vTimeInSec / 60) % 60);
    const videoSecs = Math.floor(vTimeInSec % 60);

    const percentage = ((sTimeInSec * 100) / vTimeInSec).toFixed(3) || "0";

    let formattedStreamTime, formattedVideoLength;
    if (videoHours > 0) {
        formattedStreamTime = `${streamHours}:${streamMins
            .toString()
            .padStart(2, '0')}:${streamSecs.toString().padStart(2, '0')}`;
        formattedVideoLength = `${videoHours}:${videoMins
            .toString()
            .padStart(2, '0')}:${videoSecs.toString().padStart(2, '0')}`;
    } else {
        formattedStreamTime = `${streamMins}:${streamSecs
            .toString()
            .padStart(2, '0')}`;
        formattedVideoLength = `${videoMins}:${videoSecs
            .toString()
            .padStart(2, '0')}`;
    }
    return {
        formattedStreamTime: formattedStreamTime,
        formattedVideoLenght: formattedVideoLength,
        percentage: percentage,
    };
};

export const areArraysEqual = (array1: any[], array2: any[]) => {

    if (!array1 || !array2) return false;

    // compare lengths - can save a lot of time
    if (array1.length !== array2.length) return false;

    for (var i = 0, l = array1.length; i < l; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array1[i].equals(array2[i])) return false;
        } else if (array1[i] !== array2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

export const returnInitials = (name: string) => {
    const names = name.split(" ");
    let initials = "";
    names.forEach(name => {
        initials += name[0];
    });
    return initials.toUpperCase();
}

export const makeImageUrl = (
    guildID: string,
    hash: string,
    { format = 'webp', size } = { size: 128 }
) => {
    const root = 'https://cdn.discordapp.com';
    if (hash) {
        return `${root}/icons/${guildID}/${hash}.${format}${
            size ? `?size=${size}` : ''
        }`;
    } else {
        return 'https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png';
    }
}