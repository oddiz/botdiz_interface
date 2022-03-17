import { IPlayerInfo } from "components/App/AppContent/Dashboard/MusicPlayer/Atoms";


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

export const formatStreamTime = (playerInfo: IPlayerInfo) => {
    const streamTime = playerInfo.streamTime || 0;
    const streamHours = Math.floor((streamTime / (60 * 60)) % 60);
    const streamMins = Math.floor((streamTime / 60) % 60);
    const streamSecs = Math.floor(streamTime % 60);

    const videoLenght = playerInfo.videoLength || 0; //secs
    const videoHours = Math.floor((videoLenght / (60 * 60)) % 60);
    const videoMins = Math.floor((videoLenght / 60) % 60);
    const videoSecs = Math.floor(videoLenght % 60);

    const percentage = ((streamTime * 100) / videoLenght).toFixed(1) || 0;

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