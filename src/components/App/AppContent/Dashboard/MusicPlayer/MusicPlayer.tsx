import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { IoAddCircleOutline } from 'react-icons/io5';
import { SongInfo } from './Footer/SongInfo';
import { PlayerControls } from './Footer/PlayerControls';
import { Queue } from './Queue';
import MuiProgressBar from './Footer/MuiProgressBar';
import VoiceChannelSection from './VoiceChannelSecition/VoiceChannelSection';
import AddSong from './Footer/AddSong';
import Playlist from './PlaylistsSection/Playlist';
import { SkipVote } from './Footer/SkipVote';

import { toast } from 'react-toastify';
import { useRecoilState, useRecoilValue } from 'recoil';
import { connectionState } from 'components/App/Atoms';
import { activeGuildState } from '../Atoms';
import {
    audioPlayerQueueState,
    BotdizShoukakuTrack,
    controlsDisabledState,
    currentSongState,
    formattedStreamTimeState,
    inVoiceChannelState,
    QueueTrack,
    SkipVoteData,
    streamTimeState,
    skipVoteDataState,
    audioPlayerStatusState,
    AudioPlayerStatus,
} from './Atoms';
import { useCallback } from 'react';
import { PlayerUpdate } from 'shoukaku';

export interface QueueUpdateEvent {
    op: 'queueUpdate';
    queue: QueueTrack[];
    guildId: string;
}
export interface SkipVoteEvent {
    op: 'skipVoteUpdate';
    skipVoteData: SkipVoteData;
    guildId: string;
}
export interface CurrentSongUpdateEvent {
    op: 'currentSongUpdate';
    currentSong: BotdizShoukakuTrack | null;
    guildId: string;
}
export interface PlayerStatusUpdateEvent {
    op: 'playerStatusUpdate';
    status: AudioPlayerStatus;
    guildId: string;
}
export interface CurrentSongUpdateEvent {
    op: 'currentSongUpdate';
    currentSong: BotdizShoukakuTrack | null;
    guildId: string;
}

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
    const [inVoiceChannel] = useRecoilState(inVoiceChannelState);
    const [, setControlsDisabled] = useRecoilState(controlsDisabledState);
    const [queueState, setQueueState] = useRecoilState(audioPlayerQueueState);
    const [currentSong, setCurrentSong] = useRecoilState(currentSongState);
    const [, setStreamTime] = useRecoilState(streamTimeState);
    const [, setSkipVoteData] = useRecoilState(skipVoteDataState);
    const [, setPlayerStatus] = useRecoilState(audioPlayerStatusState);

    const { websocket, token } = useRecoilValue(connectionState);
    const activeGuild = useRecoilValue(activeGuildState);
    const [addSongVisible, setAddSongVisible] = useState(false);

    const musicPlayerListenerSet = useRef(false);
    let queueLock = useRef(false);

    const processMusicPlayerUpdate = useCallback(
        (reply: { data: string; }) => {
            let parsedReply;

            try {
                parsedReply = JSON.parse(reply.data);
            } catch (error) {
                console.log('Unable to parse reply');
                return;
            }

            switch (parsedReply.op) {
                case 'playerUpdate':
                    const updateReply = parsedReply as PlayerUpdate;

                    if (updateReply?.state?.position)
                        setStreamTime(updateReply?.state?.position);

                    break;

                case 'skipVoteUpdate':
                    const skipVoteReply = parsedReply as SkipVoteEvent;

                    setSkipVoteData(skipVoteReply.skipVoteData);
                    break;
                case 'currentSongUpdate':
                    const currentSongReply =
                        parsedReply as CurrentSongUpdateEvent;

                    setCurrentSong(currentSongReply.currentSong);
                    break;
                case 'playerStatusUpdate':
                    const playerStatusReply =
                        parsedReply as PlayerStatusUpdateEvent;

                    setPlayerStatus(playerStatusReply.status);
                    break;
                case 'queueUpdate':
                    const queueReply = parsedReply as QueueUpdateEvent;

                    setQueueState({
                        queue: queueReply.queue,
                        guildId: queueReply.guildId,
                    });
                    break;
                default:
                    break;
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

            if (
                parsedReply.status === 'rate_limited' ||
                RpcCommands.includes(parsedReply.command)
            ) {
                setControlsDisabled(false);
            }
        },
        [
            setControlsDisabled,
            setCurrentSong,
            setPlayerStatus,
            setQueueState,
            setSkipVoteData,
            setStreamTime,
        ],
    );

    const setupMusicPlayerListener = useCallback(() => {
        if (musicPlayerListenerSet.current) return;

        const guildId = activeGuild?.id;

        if (!guildId) {
            console.log('No idle guilds');
            return;
        }
        if (!websocket) {
            console.log('No websocket');
            return;
        }
        console.log('setting up music player');

        websocket.addEventListener('message', processMusicPlayerUpdate);

        const message = JSON.stringify({
            type: 'listenMusicPlayer',
            listenerId: guildId,
            token: token,
            command: 'RPC_ListenMusicPlayer',
            //params guildid
            guildId: guildId,
        });

        websocket.send(message);

        return () => {
            websocket.removeEventListener('message', processMusicPlayerUpdate);
        };
    }, [activeGuild?.id, websocket, token, processMusicPlayerUpdate]);

    useEffect(() => {
        if (websocket?.readyState === WebSocket.OPEN) {
            setupMusicPlayerListener();
            musicPlayerListenerSet.current = true;
        }
    }, [websocket, token, setupMusicPlayerListener]);

    useEffect(() => {
        return () => {
            console.log('clearing music player listener');
            websocket?.send(
                JSON.stringify({
                    type: 'clearListeners',
                    token: token,
                }),
            );
        };
    }, [token, websocket]);

    const addSongClicked = async () => {
        if (!inVoiceChannel) {
            return;
        }
        setAddSongVisible(true);

        document.querySelector('#root')?.classList.add('blurred');
    };

    const backdropClicked = async (event: React.MouseEvent<HTMLDivElement>) => {
        const clickTarget = event.target as HTMLDivElement;
        if (clickTarget.id === 'search_backdrop') {
            document
                .getElementById('music_search_wrapper')
                ?.classList.remove('visible');
            document.querySelector('#root')?.classList.remove('blurred');

            await new Promise((resolve) => setTimeout(resolve, 400));
            setAddSongVisible(false);
        }
    };

    const searchBoxKeyboardHandler = async (
        event: React.KeyboardEvent<HTMLDivElement>,
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
            if (queueLock.current) {
                return;
            }
            const searchElement = document.getElementById(
                'music_search_input',
            ) as HTMLInputElement | undefined;
            const searchInput = searchElement?.value;

            const message = JSON.stringify({
                token: token,
                type: 'exec',
                command: 'RPC_playCommand',
                params: [activeGuild.id, searchInput],
            });

            websocket.send(message);
            queueLock.current = true;
        }
    };

    useEffect(() => {
        setAddSongVisible(false);
        document.querySelector('#root')?.classList.remove('blurred');
        queueLock.current = false;
    }, [currentSong, queueState]);

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
                            className={inVoiceChannel ? '' : 'disabled'}
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
                    <MuiProgressBar />
                    <TotalTime>{formattedTime.formattedVideoLenght}</TotalTime>
                </SongSliderWrapper>
            </MPFooterWrapper>
        </MusicPlayerWrapper>
    );
};

export default MusicPlayer;
