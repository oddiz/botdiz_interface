import { IoPlayCircle, IoPauseCircle, IoPlaySkipForward, IoStopCircle } from 'react-icons/io5'
import styled from 'styled-components'

const SkipButton = styled(IoPlaySkipForward)`
    font-size: 1em;
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
    font-size: 2em;
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
    font-size: 2em;
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
    font-size: 1.5em;
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

export function PlayerControls (props) {
    
    const guildId = props.guildId
    const websocket = props.websocket
    const token = props.token
    const controlsDisabled = props.controlsDisabled
    const playerButtonClicked = props.playerButtonClicked

    function pauseClicked () {
        if(controlsDisabled) {
            return
        }
        console.log("pause clicked")
        playerButtonClicked()
        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_pausePlayer",
            //should take 1 param: guildid
            params: [guildId]
        })

        websocket.send(message)
    }
    function playClicked () {
        if(controlsDisabled) {
            return
        }
        console.log("play clicked")
        playerButtonClicked()

        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_resumePlayer",
            //should take 3 params: guildid
            params: [guildId]
        })

        websocket.send(message)
    }
    
    function stopClicked () {
        if(controlsDisabled) {
            return
        }
        console.log("stop clicked")
        playerButtonClicked()

        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_stopPlayer",
            //should take 3 params: guildid
            params: [guildId]
        })

        websocket.send(message)
    }
    function skipClicked () {
        if(controlsDisabled) {
            return
        }
        console.log("skip clicked")
        playerButtonClicked()

        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_skipSong",
            //should take 3 params: guildid
            params: [guildId, 1]
        })

        websocket.send(message)
    }
    let PlayPause;
    if (props.audioPlayerStatus === "playing") {
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
            <StopButton onClick={stopClicked} className={controlsDisabled? "disabled":""} />
            {PlayPause}
            <SkipButton onClick={skipClicked} className={controlsDisabled? "disabled":""} />
            {/* <PlayPauseButton />
            <SkipButton /> */}
        </PlayerControlsWrapper>
    )

}