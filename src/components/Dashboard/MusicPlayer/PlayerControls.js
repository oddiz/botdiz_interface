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
`
const PauseButton = styled(IoPauseCircle)`
    font-size: 2em;
    color: white;
    margin: 0 5px;
    transition: linear 0.2s all;

    cursor: pointer;

`
const PlayButton = styled(IoPlayCircle)`
    font-size: 2em;
    color: white;
    margin: 0 5px;
    transition: linear 0.2s all;

    cursor: pointer;

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
`
const PlayerControlsWrapper = styled.div`
    height:100%;
    justify-self: center;
    display: flex;

    flex-direction: row;
    align-items: center;
    justify-content: center;
`
export function PlayerControls (props) {
    
    const guildId = props.guildId
    const websocket = props.websocket
    const token = props.token

    function pauseClicked () {
        console.log("pause clicked")
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
        console.log("play clicked")
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
        console.log("stop clicked")
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
        console.log("skip clicked")
        const message = JSON.stringify({
            token: token,
            type: "exec",
            command: "RPC_skipPlayer",
            //should take 3 params: guildid
            params: [guildId]
        })

        websocket.send(message)
    }
    let PlayPause;
    if (props.audioPlayerStatus === "playing") {
        PlayPause = (
            <PauseButton onClick={pauseClicked} />
            )
        } else {
        PlayPause = (
            <PlayButton onClick={playClicked} />
        )
    }

    return (
        <PlayerControlsWrapper>
            <StopButton onClick={stopClicked} />
            {PlayPause}
            <SkipButton onClick={skipClicked} />
            {/* <PlayPauseButton />
            <SkipButton /> */}
        </PlayerControlsWrapper>
    )

}