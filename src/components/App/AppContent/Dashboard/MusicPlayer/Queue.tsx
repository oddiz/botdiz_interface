/* eslint-disable no-extend-native */
import { useEffect, useMemo, useRef, useState } from 'react';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import { IoPlaySkipForward } from 'react-icons/io5';
import styled from 'styled-components';
import Scrollbars from 'react-custom-scrollbars';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
    audioPlayerCurrentSongState,
    audioPlayerQueueState,
    controlsDisabledState,
    playerInfoState,
    QueueTrack,
} from './Atoms';
import { connectionState } from 'components/App/Atoms';
import { activeGuildState } from '../Atoms';




function useDidUpdateEffect(fn: any, inputs:any) {
    const didMountRef = useRef(false);
  
    useEffect(() => {
      if (didMountRef.current) { 
        return fn();
      }
      didMountRef.current = true;
    }, inputs);
  }

// Hide method from for-in loops
Object.defineProperty(Array.prototype, 'equals', { enumerable: false });

const QueueWrapper = styled.div`
    padding-top: 0px;
    padding-left: 30px;
    padding-right: 30px;
    flex-grow: 1;
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
        display: none;
    }
`;

export const Queue = () => {
    const playerInfo = useRecoilValue(playerInfoState);

    return (
        <Scrollbars autoHide autoHideTimeout={1500} autoHideDuration={200}>
            <QueueWrapper>
                <h2>Queue</h2>
                <h4>Current Song</h4>
                {playerInfo.currentTitle && <CurrentSong />}
                <h4>Next Up</h4>
                <NextUp />
            </QueueWrapper>
        </Scrollbars>
    );
};

const SongWrapper = styled.div<{ recommended?: boolean }>`
    box-sizing: border-box;
    padding: 5px 10px;
    min-height: 40px;
    display: flex;
    flex-direction: row;

    align-items: center;

    background: ${(props) => (props.recommended ? '#0538064f' : '')};

    border-radius: 10px;

    &:hover {
        background: #4b4f58;
    }
`;
const StyledThumbnail = styled.img`
    height: 40px;
    min-width: 72px;
    border-radius: 10px;
    margin-right: 20px;
`;
const SongTitle = styled.div`
    font-size: 14px;
    margin-left: 10px;
    width: 400px;
    flex-grow: 1;
`;
const ListIndex = styled.span`
    flex-shrink: 0;
    margin-right: 15px;
    width: 36px;
    font-size: 22px;
`;
function CurrentSong() {
    const currentSong = useRecoilValue(audioPlayerCurrentSongState);

    return (
        <SongWrapper>
            <ListIndex>1</ListIndex>
            <StyledThumbnail
                src={currentSong.videoThumbnailUrl}
                alt=""
            ></StyledThumbnail>
            <SongTitle>{currentSong.title}</SongTitle>
        </SongWrapper>
    );
}

const NextUpWrapper = styled.div`
    display: flex;
    flex-direction: column;
    cursor: grab;
`;
const DeleteIcon = styled(RiDeleteBin5Fill)`
    margin: 0 5px;
    font-size: 18px;
    flex-shrink: 0;
    color: #b3b3b3;
    cursor: pointer;

    &:hover {
        color: white;
    }
    &.disabled {
        cursor: not-allowed;
        color: #72767d;
    }
`;
const SkipIcon = styled(IoPlaySkipForward)`
    font-size: 18px;
    flex-shrink: 0;
    color: #b3b3b3;
    cursor: pointer;

    &:hover {
        color: white;
    }
    &.disabled {
        cursor: not-allowed;
        color: #72767d;
    }
`;

function NextUp() {
    
    const [queue, setQueue] = useRecoilState(audioPlayerQueueState);
    const { token, websocket } = useRecoilValue(connectionState);
    const [controlsDisabled, setControlsDisabled] = useRecoilState(controlsDisabledState)
    const activeGuild = useRecoilValue(activeGuildState)
    const [sortableQueue, setSortableQueue] = useState<QueueTrack[] | null>([]);

    const queueDeleteClicked = async (event: React.MouseEvent<SVGElement>) => {

        if (controlsDisabled) {
            //already processing something
            return
        }

        if (!websocket) {
            //only possible if websocket connection is lost somehow
            console.log("No websocket")
            return
        }

        if (!activeGuild) {
            console.log("No active guild")
            return
        }
        setControlsDisabled(true)

        const clickedElement = event.currentTarget.parentElement
        const clickedElementParent = clickedElement?.parentElement
        if (!clickedElementParent) return
        //index of song in queue array
        const songIndex = [...clickedElementParent.children].indexOf(clickedElement);
        

        const RPCMessage = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_deleteQueueSong",
            //should take 2 params: guildid, index of to be deleted song
            params: [activeGuild.id, songIndex]
        })
        
        websocket.send(RPCMessage)
    }

    const queueSkipClicked = async (event: React.MouseEvent<SVGElement>) => {
        if (controlsDisabled) {
            //already processing something
            return
        }

        if (!websocket) {
            //only possible if websocket connection is lost somehow
            console.log("No websocket")
            return
        }

        if (!activeGuild) {
            console.log("No active guild")
            return
        }
        setControlsDisabled(true)

        const clickedElement = event.currentTarget.parentElement
        const clickedElementParent = clickedElement?.parentElement
        if (!clickedElementParent) return
        //index of song in queue array
        const activeIndex = [...clickedElementParent.children].indexOf(clickedElement);

        const RPCMessage = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_skipSong",
            //should take 2 params: guildid, skip amount
            //skip amount should be +1 accounting the current song
            params: [activeGuild.id, activeIndex + 1]
        })

        websocket.send(RPCMessage)
    }
    /*
    useEffect(() => {
        const parseSongs = [];
        for (const song of queue) {
            parseSongs.push(song.info?.title);
        }
        if (queueCache.equals(parseSongs) || queueCache.length === 0) {
        } else {
            console.log('time to update!');
            updateQueue(queue);
        }
        setQueueCache(parseSongs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queue]);
    */
    
    useEffect(() => {
        
        setQueue([])
      
    }, [activeGuild])
    
    
    
    
    
    const updateQueue = () => {
        if(!activeGuild?.id) return

        const message = JSON.stringify({
            type: 'exec',
            token: token,
            command: 'RPC_updateQueue',
            params: [activeGuild.id, sortableQueue],
        });

        websocket?.send(message);
    };
    useDidUpdateEffect(() => {
        console.log("time to update")

        updateQueue()
    
      
    }, [sortableQueue])
    
    type InterfaceQueueItem = ItemInterface & QueueTrack;

    const parsedQueueSongs: InterfaceQueueItem[] = queue.map((song, index) => {
        return {
            ...song,
            id: index,
        };
    });

    const queueSongs = parsedQueueSongs.map((song, index) => {
        //const thumbnailUrl = `https://img.youtube.com/vi/${song.videoId}/0.jpg`

        const thumbnailUrl = song.thumbnail;
        return (
            <SongWrapper
                recommended={song.recommendedSong || false}
                key={index}
            >
                <ListIndex>{index + 2}</ListIndex>
                {thumbnailUrl && (
                    <StyledThumbnail src={thumbnailUrl} alt="" />
                )}
                <SongTitle>
                    {song.info?.title}
                    <i>
                        <em>
                            {song.recommendedSong
                                ? ' - Botdiz Recommended'
                                : ''}
                        </em>
                    </i>
                </SongTitle>
                <DeleteIcon
                    onClick={queueDeleteClicked}
                    className={controlsDisabled ? 'disabled' : ''}
                />
                <SkipIcon
                    onClick={queueSkipClicked}
                    className={controlsDisabled ? 'disabled' : ''}
                />
            </SongWrapper>
        );
    });

    return (
        <NextUpWrapper>
            <ReactSortable
                list={parsedQueueSongs}
                setList={
                    setSortableQueue
                }
                animation={200}
            >
                {queueSongs}
            </ReactSortable>
        </NextUpWrapper>
    );
}
