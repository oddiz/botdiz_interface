import { connectionState } from 'components/App/Atoms'
import { IoPlayCircle, IoPauseCircle, IoPlaySkipForward, IoStopCircle,IoShuffle } from 'react-icons/io5'
import { useRecoilState, useRecoilValue } from 'recoil'
import styled from 'styled-components'
import { activeGuildState } from '../../Atoms'
import { audioPlayerStatusState, controlsDisabledState } from '../Atoms'

const SkipButton = styled(IoPlaySkipForward)`
    font-size: 1.5em;
    color: #b3b3b3;

    margin: 0 5px;
    
    cursor: pointer;

    &:hover {
        color: white;
    }

    &.disabled {
        cursor: not-allowed;
        color: #72767d;
    }
`
const PauseButton = styled(IoPauseCircle)`
    font-size: 3.5em;
    color: white;
    margin: 0 5px;
    transition: linear 0.2s all;

    cursor: pointer;

    &.disabled {
        cursor: not-allowed;
        color: #72767d;

    }

`
const PlayButton = styled(IoPlayCircle)`
    font-size: 3.5em;
    color: white;
    margin: 0 5px;
    transition: linear 0.2s all;

    cursor: pointer;

    &.disabled {
        cursor: not-allowed;
        color: #72767d;

    }

`
const StopButton = styled(IoStopCircle)`
    font-size: 2em;
    color: #ff9580d5;
    margin: 0 5px;
    transition: linear 0.2s all;

    cursor: pointer;

    &:hover {
        color: #ff9580
    }
    &.disabled {
        cursor: not-allowed;
        color: #72767d;

    }
`
const ShuffleButton = styled(IoShuffle)`
    font-size: 1.7em;
    color: white;
    margin: 0 5px;

    cursor: pointer;

    &:hover {
        color: #00b85fBF
    }
    &:active {
        transform: translateY(2px);
    }
    &.active {
        color: #00b85f;

    }
`

// phantom button to center elements
const PhantomButton = styled(IoShuffle)`
    font-size: 1.7em;
    color: white;
    margin: 0 5px;
    transition: linear 0.2s all;
    visibility: hidden;

    cursor: pointer;

    &:hover {
        color: #ff9580
    }
    &.disabled {
        cursor: not-allowed;
        color: #72767d;

    }
`
const PlayerControlsWrapper = styled.div`
    height:100%;
    justify-self: center;
    display: flex;
    position: relative;

    flex-direction: row;
    align-items: center;
    justify-content: center;
`
const Loading = styled.div`
    width: 100vw;
    height: 3px;

    position:absolute;
    top: 0;

    animation: animatedGradient 3s ease infinite alternate;
`

export function PlayerControls () {
    
    const { token, websocket } = useRecoilValue(connectionState)
    const guildId = useRecoilValue(activeGuildState)?.id
    const audioPlayerStatus = useRecoilValue(audioPlayerStatusState)

    const [controlsDisabled, setControlsDisabled] = useRecoilState(controlsDisabledState)

    function shuffleClicked () {
        if(controlsDisabled) {
            return
        }
        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_shuffleQueue",
            //should take 1 param: guildid
            params: [guildId]
        })

        websocket?.send(message)
    }
    function pauseClicked () {
        if(controlsDisabled) {
            return
        }
        setControlsDisabled(true)
        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_pausePlayer",
            //should take 1 param: guildid
            params: [guildId]
        })

        websocket?.send(message)
    }
    function playClicked () {
        if(controlsDisabled) {
            return
        }
        setControlsDisabled(true)

        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_resumePlayer",
            //should take 3 params: guildid
            params: [guildId]
        })

        websocket?.send(message)
    }
    
    function stopClicked () {
        if(controlsDisabled) {
            return
        }
        setControlsDisabled(true)

        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_stopPlayer",
            //should take 3 params: guildid
            params: [guildId]
        })

        websocket?.send(message)
    }
    function skipClicked () {
        if(controlsDisabled) {
            return
        }
        setControlsDisabled(true)

        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_skipSong",
            //should take 3 params: guildid
            params: [guildId, 1]
        })

        websocket?.send(message)
    }
    let PlayPause;
    if (audioPlayerStatus === "PLAYING") {
        PlayPause = (
            <PauseButton onClick={pauseClicked} className={controlsDisabled? "disabled":""} />
            )
        } else {
        PlayPause = (
            <PlayButton onClick={playClicked} className={controlsDisabled? "disabled":""} />
        )
    }

    return (
        <PlayerControlsWrapper>
            {controlsDisabled && <Loading className="drac-bg-animated" />}
            <ShuffleButton onClick={shuffleClicked} className={controlsDisabled? "disabled":""}/>
            <StopButton onClick={stopClicked} className={controlsDisabled? "disabled":""} />
            {PlayPause}
            <SkipButton onClick={skipClicked} className={controlsDisabled? "disabled":""} />
            <PhantomButton />
            {/* <PlayPauseButton />
            <SkipButton /> */}
        </PlayerControlsWrapper>
    )

}