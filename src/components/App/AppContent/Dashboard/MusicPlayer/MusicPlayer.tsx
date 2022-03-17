import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { IoAddCircleOutline } from 'react-icons/io5';
import { SongInfo } from './Footer/SongInfo';
import { PlayerControls } from './Footer/PlayerControls';
import { Queue } from './Queue';
import ProgressBar from './Footer/ProgressBar';
import VoiceChannelSection from './VoiceChannelSecition/VoiceChannelSection';
import AddSong from './Footer/AddSong';
import Playlist from './PlaylistsSection/Playlist';
import { SkipVote } from './Footer/SkipVote';
import { toast } from 'react-toastify';
import { useRecoilState, useRecoilValue } from 'recoil';
import { accountData, connectionState } from 'components/App/Atoms';
import { activeGuildState } from '../Atoms';
import {
    audioPlayerQueueState,
    controlsDisabledState,
    formattedStreamTimeState,
    inVoiceChannelState,
    IPlayerInfo,
    playerInfoState,
    QueueTrack,
} from './Atoms';
import { act } from 'react-dom/test-utils';
import { areArraysEqual } from 'components/helpers';

// width: ${props => props.percentage}%;  //will get this value from props

const TotalTime = styled.span`
    font-size: 10px;

    color: white;
`;
const CurrentTime = styled.span`
    font-size: 10px;

    color: white;
`;
const SongSliderWrapper = styled.div`
    box-sizing: border-box;
    height: 30%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    color: white;
    padding: 0 30px;
`;
const MPControlsWrapper = styled.div`
    position: relative;
    height: 70%;
    display: flex;
    flex-direction: row;

    justify-content: center;
`;
const MPFooterWrapper = styled.div`
    height: 90px;
    min-width: 250px;
    display: flex;
    flex-direction: column;

    justify-content: center;

    background-color: #2b2e32;

    border-top: solid 1px #484848;
`;
const InvisibleFlexAligner = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 250px;

    flex-shrink: 1;

    justify-content: flex-end;
    margin-left: auto;
`;
const MusicPlayerContent = styled.div`
    height: 100%;
    flex: 1 1 50px;

    display: flex;
    flex-direction: row;

    overflow-x: hidden;
`;
const MusicPlayerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    width: 100%;
    height: 100%;
`;
const AddSongIcon = styled(IoAddCircleOutline)`
    height: 100%;

    font-size: 60px;

    margin-left: auto;
    margin-right: 15px;
    margin-top: 12px;
    color: #ffffff99;

    cursor: pointer;

    border-radius: 1000px;

    &:hover {
        color: #ffffff;
    }
    &.disabled {
        cursor: not-allowed;

        color: #ffffff19;
    }
`;
const MusicPlayer = () => {
    const [playerInfo, setPlayerInfo] = useRecoilState(playerInfoState);
    const [inVoiceChannel, ] =
        useRecoilState(inVoiceChannelState);
    const [, setControlsDisabled] = useRecoilState(
        controlsDisabledState
    );
    const [queue, setQueue] = useRecoilState(audioPlayerQueueState);

    const { websocket, token } = useRecoilValue(connectionState);
    const activeGuild = useRecoilValue(activeGuildState);
    const [addSongVisible, setAddSongVisible] = useState(false);
    const websocketPlayerInfo = useRef<IPlayerInfo | null>(null);
    const queueCache = useRef<QueueTrack[]>([])

    const setupMusicPlayerListener = async () => {
        const guildId = activeGuild?.id;

        if (!guildId) {
            console.log('No idle guilds');
            return;
        }
        if (!websocket) {
            console.log('No websocket');
            return;
        }

        const message = JSON.stringify({
            type: 'listenMusicPlayer',
            listenerId: guildId,
            token: token,
            command: 'RPC_ListenMusicPlayer',
            //params guildid
            guildId: guildId,
        });

        websocket.send(message);

        websocket.onmessage = (reply) => {
            let parsedReply;

            try {
                parsedReply = JSON.parse(reply.data);
            } catch (error) {
                console.log('Unable to parse reply');
                return;
            }
            if (parsedReply.event === 'musicplayer_update') {
                const {
                    currentTitle,
                    streamTime,
                    videoLength,
                    audioPlayerStatus,
                    videoThumbnailUrl,
                    skipVoteData,
                    queue
                } = parsedReply.message;

                const newWebsocketInfo = {
                    currentTitle: currentTitle,
                    streamTime: streamTime,
                    videoLength: videoLength,
                    audioPlayerStatus: audioPlayerStatus,
                    videoThumbnailUrl: videoThumbnailUrl,
                    skipVoteData: skipVoteData,
                }
                
                
                 
                if (JSON.stringify(websocketPlayerInfo.current) !== JSON.stringify(newWebsocketInfo)) {
                    setPlayerInfo(newWebsocketInfo);
                    websocketPlayerInfo.current = newWebsocketInfo
                }
                
                
                
                if(!areArraysEqual(queueCache.current, queue)) {
                    //if arrays are not equal, update queue
                    setQueue(parsedReply.message.queue);
                    queueCache.current = queue
                }
            }

            if (
                parsedReply.event === 'exec_command_status' &&
                parsedReply.status === 'failed'
            ) {
                toast.error(parsedReply.message);
            }

            const RpcCommands = [
                'RPC_pausePlayer',
                'RPC_resumePlayer',
                'RPC_skipSong',
                'RPC_stopPlayer',
                'RPC_deleteQueueSong',
                'RPC_playCommand',
                'RPC_addSpotifyPlaylist',
            ];

            if (RpcCommands.includes(parsedReply.command)) {
                setControlsDisabled(false);
            }
        };
    };
    useEffect(() => {
        if (websocket?.readyState === WebSocket.OPEN) {
            setupMusicPlayerListener();
        }
        return () => {
            websocket?.send(
                JSON.stringify({
                    type: 'clearListeners',
                    token: token,
                })
            );
        };
    }, [websocket, token, activeGuild]);

    
    const addSongClicked = async () => {
        if (!inVoiceChannel) {
            return;
        }
        setAddSongVisible(true);

        document.querySelector('#root')?.classList.add('blurred');
    };

    const backdropClicked = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.currentTarget.id === 'search_backdrop') {
            document
                .getElementById('music_search_wrapper')
                ?.classList.remove('visible');
            document.querySelector('#root')?.classList.remove('blurred');

            await new Promise((resolve) => setTimeout(resolve, 400));
            setAddSongVisible(false);
        }
    };

    let queueLock = false;

    const searchBoxKeyboardHandler = async (
        event: React.KeyboardEvent<HTMLDivElement>
    ) => {
        if (!websocket) return;
        if (!activeGuild) return;

        const pressedKey = event.key;
        if (pressedKey === 'Escape') {
            document
                .getElementById('music_search_wrapper')
                ?.classList.remove('visible');
            document.querySelector('#root')?.classList.remove('blurred');
            await new Promise((resolve) => setTimeout(resolve, 200));
            setAddSongVisible(false);
        }

        if (pressedKey === 'Enter') {
            if (queueLock) {
                return;
            }
            const searchElement = document.getElementById(
                'music_search_input'
            ) as HTMLInputElement | undefined;
            const searchInput = searchElement?.value;

            const message = JSON.stringify({
                token: token,
                type: 'exec',
                command: 'RPC_playCommand',
                params: [activeGuild.id, searchInput],
            });

            websocket.send(message);
            const startTime = new Date().getTime();
            const cachedQueueLength = queue.length;
            const cachedCurrentTitle = playerInfo.currentTitle;
            queueLock = true;

            //wait for a song to be added to queue
            async function waitForSongChange() {
                const time = new Date().getTime();
                if (
                    cachedQueueLength === queue.length &&
                    cachedCurrentTitle === playerInfo.currentTitle &&
                    time < startTime + 1000 * 10
                ) {
                    setTimeout(waitForSongChange, 250);
                    return;
                }

                document
                    .getElementById('music_search_wrapper')
                    ?.classList.remove('visible');
                document.querySelector('#root')?.classList.remove('blurred');
                await new Promise((resolve) => setTimeout(resolve, 200));

                setAddSongVisible(false);
                queueLock = false;
            }

            waitForSongChange();
        }
    };

    

    const formattedTime = useRecoilValue(formattedStreamTimeState);

    return (
        <MusicPlayerWrapper id="musicplayer_wrapper">
            <MusicPlayerContent id="musicplayer_content">
                <VoiceChannelSection />
                <Queue />
                <Playlist />
            </MusicPlayerContent>
            <MPFooterWrapper>
                <MPControlsWrapper>
                    <SkipVote />
                    <SongInfo />
                    <PlayerControls />
                    <InvisibleFlexAligner>
                        <AddSongIcon
                            id="add_song_icon"
                            onClick={addSongClicked}
                            className={
                                inVoiceChannel ? '' : 'disabled'
                            }
                        />
                        {addSongVisible && (
                            <AddSong
                                searchBoxKeyboardHandler={
                                    searchBoxKeyboardHandler
                                }
                                backdropClicked={backdropClicked}
                            />
                        )}
                    </InvisibleFlexAligner>
                </MPControlsWrapper>
                <SongSliderWrapper>
                    <CurrentTime>
                        {formattedTime.formattedStreamTime}
                    </CurrentTime>
                    <ProgressBar />
                    <TotalTime>
                        {formattedTime.formattedVideoLenght}
                    </TotalTime>
                </SongSliderWrapper>
            </MPFooterWrapper>
        </MusicPlayerWrapper>
    );
};

export default MusicPlayer;
