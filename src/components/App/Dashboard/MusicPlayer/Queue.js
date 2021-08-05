/* eslint-disable no-extend-native */
import { useEffect, useState } from 'react';
import { RiDeleteBin5Fill } from 'react-icons/ri'
import { IoPlaySkipForward } from 'react-icons/io5'
import styled from 'styled-components'
import Scrollbars from 'react-custom-scrollbars'
import { ReactSortable } from "react-sortablejs";

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length !== array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] !== array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

const QueueWrapper = styled.div`

    padding-top: 0px;
    padding-left: 30px;
    padding-right: 30px;
    flex-grow:1;
    flex-shrink: 1;
    color: white;
   
    overflow-y: scroll;

    min-width: 300px;
    max-width: 800px;
    -ms-overflow-style: none;
    scrollbar-width: none;

    & h4 {
        color: #b3b3b3;
    }

    &::-webkit-scrollbar {
        display:none
    }
`

export function Queue(props) {


    return (
        <Scrollbars
            autoHide
            autoHideTimeout={1500}
            autoHideDuration={200}
        >
            <QueueWrapper>
                <h2>Queue</h2>
                <h4>Current Song</h4>
                {props.currentSong.title && <CurrentSong currentSong={props.currentSong} />}
                <h4>Next Up</h4>
                <NextUp
                    key={props.queue}
                    token={props.token}
                    guildId={props.guildId}
                    websocket={props.websocket}
                    queueDeleteClicked={props.queueDeleteClicked} 
                    queue={props.queue} 
                    queueSkipClicked={props.queueSkipClicked}
                    controlsDisabled={props.controlsDisabled}
                />
            </QueueWrapper>
        </Scrollbars>
    )
}

const SongWrapper = styled.div`
    box-sizing: border-box;
    padding: 5px 10px;
    min-height:40px;
    display: flex;
    flex-direction: row;

    align-items: center;


    border-radius: 10px;
    
    &:hover {
        background: #4B4F58;
    }
`
const StyledThumbnail = styled.img`
    height: 40px;
    min-width: 72px;
    border-radius: 10px;
    margin-right: 20px;
    
`
const SongTitle = styled.div`
    font-size: 14px;
    margin-left:10px;
    width:400px;
    flex-grow: 1;
`
const ListIndex = styled.span`
    flex-shrink: 0;
    margin-right: 15px;
    width:36px;
    font-size: 22px;
`
function CurrentSong (props) {

    return (
        <SongWrapper>
            <ListIndex>1</ListIndex>
            <StyledThumbnail src={props.currentSong.videoThumbnailUrl} alt=""></StyledThumbnail>
            <SongTitle>
                {props.currentSong.title}
            </SongTitle>
        </SongWrapper>
    )
}

const NextUpWrapper = styled.div`
    display: flex;
    flex-direction: column;
    cursor: grab;
`
const DeleteIcon = styled(RiDeleteBin5Fill)`
    margin: 0 5px;
    font-size: 18px;
    flex-shrink: 0;
    color: #b3b3b3;
    cursor:pointer;

    &:hover{
        color: white;
    }
    &.disabled {
        cursor: not-allowed;
        color: #72767d;
    }
`
const SkipIcon = styled(IoPlaySkipForward)`
    font-size: 18px;
    flex-shrink: 0;
    color: #b3b3b3;
    cursor:pointer;

    &:hover{
        color: white;
    }
    &.disabled {
        cursor: not-allowed;
        color: #72767d;
    }
`
function NextUp(props) {
    const [queueCache, setQueueCache] = useState([])
    const [queue,setQueue] = useState(props.queue)

    const updateQueue = (queue) => {
        const message = JSON.stringify({
            type: "exec",
            token: props.token,
            command: "RPC_updateQueue",
            params: [props.guildId, queue]
        })

        props.websocket.send(message)
    }

    useEffect(() => {

        const parseSongs = []
        for (const song of queue) {
            parseSongs.push(song.videoTitle)
        }
        if(queueCache.equals(parseSongs) || queueCache.length === 0) {

        } else {
            console.log("time to update!")
            updateQueue(queue)
        }
        setQueueCache(parseSongs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queue])

    const queueSongs = queue.map((song, index) => {
        const thumbnailUrl = `https://img.youtube.com/vi/${song.videoId}/0.jpg`
        return (
            <SongWrapper key={song.videoTitle+index}>
                <ListIndex>{index+2}</ListIndex>
                {song.videoId && <StyledThumbnail src={thumbnailUrl} alt="" />}
                <SongTitle>{song.videoTitle}</SongTitle>
                <DeleteIcon onClick={props.queueDeleteClicked} className={props.controlsDisabled? "disabled": ""} />
                <SkipIcon onClick={props.queueSkipClicked} className={props.controlsDisabled? "disabled": ""} />
            </SongWrapper>
        )
    })

    return(
        <NextUpWrapper>
            <ReactSortable 
                list={queue} 
                setList={setQueue}
                animation={200}
            >
                {queueSongs}
            </ReactSortable>
        </NextUpWrapper>
    )
}