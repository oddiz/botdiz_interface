
import React from 'react'
import styled from 'styled-components'

import { SongInfo } from './Footer/SongInfo'
import { PlayerControls } from './Footer/PlayerControls'
import { Queue } from './Queue'
// width: ${props => props.percentage}%;  //will get this value from props
const InnerBar = styled.div`
    height:100%;

    background-color: #b3b3b3;
    border-radius: 10px;
`
const OuterBar = styled.div`
    height:100%;
    width: 100%;

    background-color: #535353;

    border-radius: 10px;
`
const ProgressBarWrapper = styled.div`
    height: 5px;
    padding: 0 10px;
    width: 60%;
`
function ProgressBar (props) {
    return(
        <ProgressBarWrapper>
            <OuterBar>
                <InnerBar style={{width: props.percentage+"%"}} />
            </OuterBar>
        </ProgressBarWrapper>
    )
}


const TotalTime = styled.span`
    font-size: 10px;

    color: white;
`
const CurrentTime = styled.span`
    font-size: 10px;

    color: white;
`
const SongSliderWrapper = styled.div`
    height: 30%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    color: white;  
`
const MPControlsWrapper = styled.div`
    height: 70%;
    display:flex;
    flex-direction: row;

    justify-content: center;
`
const MPFooterWrapper = styled.div`
    height: 80px;
    min-width: 250px;
    display:flex;
    flex-direction: column;

    justify-content: center;

    background-color: #2A2A2A;
`
const InvisibleFlexAligner = styled.div`

    height: 100%;
    width: 250px;

    flex-shrink: 1;

    margin-left: auto;
`
const MusicPlayerContent = styled.div`
    height: 100%;
    flex: 1 1 50px; 

    overflow-x: hidden;
    overflow-y: scroll;

`
const MusicPlayerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    width: 100%;
    height: 100%;

`
export default class MusicPlayer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playerInfo: {
                queue: [],
                currentTitle: "",
                streamTime: 0,
                videoLenght: 0,
                audioPlayerStatus: "idle", //"playing", "paused", "idle",
                videoThumnailUrl: ""
            }
        }

        this.token = props.token
        this.websocket = props.websocket
        this.activeGuild = props.activeGuild
        this.setupMusicPlayerListener = this.setupMusicPlayerListener.bind(this)
        this.formatTime = this.formatTime.bind(this)
        this.queueDeleteClicked = this.queueDeleteClicked.bind(this)
        this.queueSkipClicked = this.queueSkipClicked.bind(this)
    }
    componentDidMount() {
        this.setupMusicPlayerListener()
    }
    componentWillUnmount() {
        this.websocket.send(JSON.stringify({
            type: 'clearListeners',
            token: this.token
        }))
    }
    async setupMusicPlayerListener() {
        let guildId;
        try {
            guildId = this.activeGuild.id
        } catch{
            console.log("No idle guilds")
            return
        }
        
        const message = JSON.stringify({
            type: 'listenMusicPlayer',
            listenerId: guildId,
            token: this.token,
            command: 'RPC_ListenMusicPlayer',
            //params guildid
            params: [guildId]
        })

        this.websocket.send(message)

        this.websocket.onmessage = (reply) => {
            let parsedReply;

            try {
                parsedReply = JSON.parse(reply.data)
            } catch (error) {
                console.log("Unable to parse reply")
                return
            }

            this.setState({ playerInfo: parsedReply.message })

        }
    }

    formatTime() {
        const streamTime = this.state.playerInfo.streamTime || 0
        const streamHours = Math.floor(streamTime / (60 * 60) % 60)
        const streamMins = Math.floor(streamTime / (60) % 60)
        const streamSecs = Math.floor(streamTime % 60)
        
        const videoLenght= this.state.playerInfo.videoLength || 0; //secs
        const videoHours = Math.floor((videoLenght / (60 *60)) % 60)
        const videoMins = Math.floor((videoLenght / 60) % 60)
        const videoSecs = Math.floor(videoLenght % 60)
        
        
        const percentage = ((streamTime * 100) / videoLenght).toFixed(1) || 0

        let formattedStreamTime, formattedVideoLength
        if (videoHours > 0){
            
            formattedStreamTime = `${streamHours}:${streamMins.toString().padStart(2,0)}:${streamSecs.toString().padStart(2, '0')}`
            formattedVideoLength = `${videoHours}:${videoMins.toString().padStart(2, 0)}:${videoSecs.toString().padStart(2, '0')}`

        } else {
            
            formattedStreamTime = `${streamMins}:${streamSecs.toString().padStart(2, '0')}`
            formattedVideoLength = `${videoMins}:${videoSecs.toString().padStart(2, '0')}`
            
        }
        return {
            formattedStreamTime: formattedStreamTime,
            formattedVideoLenght:  formattedVideoLength,
            percentage: percentage
        }
    }

    async queueDeleteClicked (event){
        console.log(event.currentTarget.parentElement)

        const clickedElement = event.currentTarget.parentElement
        //index of song in queue array
        const songIndex = [...clickedElement.parentElement.children].indexOf(clickedElement);

        const RPCMessage = JSON.stringify({
            token: this.token,
            type: "exec",
            command: "RPC_deleteQueueSong",
            //should take 2 params: guildid, index of to be deleted song
            params: [this.activeGuild.id, songIndex]
        })
        
        this.websocket.send(RPCMessage)
    }
    async queueSkipClicked (event) {
        console.log(event.currentTarget.parentElement)

        const clickedElement = event.currentTarget.parentElement
        //index of song in queue array
        const activeIndex = [...clickedElement.parentElement.children].indexOf(clickedElement);

        const RPCMessage = JSON.stringify({
            token: this.token,
            type: "exec",
            command: "RPC_skipSong",
            //should take 2 params: guildid, skip amount
            //skip amount should be +1 accounting the current song
            params: [this.activeGuild.id, activeIndex + 1]
        })

        this.websocket.send(RPCMessage)
    }
    render() {
        const formattedTime = this.formatTime()
        
        return(
            <MusicPlayerWrapper id="musicplayer_wrapper">          
                <MusicPlayerContent id="musicplayer_content">

                    <Queue
                        key={this.state.playerInfo.queue.length}
                        queue={this.state.playerInfo.queue} 
                        currentSong={{
                            title: this.state.playerInfo.currentTitle,
                            videoThumbnailUrl: this.state.playerInfo.videoThumbnailUrl,
                            videoLenght: this.state.playerInfo.videoLenght
                        }}
                        queueDeleteClicked={this.queueDeleteClicked}
                        queueSkipClicked={this.queueSkipClicked}
                    />

                </MusicPlayerContent>
                <MPFooterWrapper>
                    <MPControlsWrapper>
                        <SongInfo imgUrl={this.state.playerInfo.videoThumbnailUrl} songTitle={this.state.playerInfo.currentTitle} />
                        <PlayerControls 
                            token={this.token} 
                            guildId={this.activeGuild.id} 
                            websocket={this.websocket} 
                            audioPlayerStatus={this.state.playerInfo.audioPlayerStatus} 
                        />
                        <InvisibleFlexAligner />
                    </MPControlsWrapper>
                    <SongSliderWrapper>
                        <CurrentTime>
                            {formattedTime.formattedStreamTime}
                        </CurrentTime>
                        <ProgressBar percentage={formattedTime.percentage} />
                        <TotalTime>
                            {formattedTime.formattedVideoLenght}
                        </TotalTime>
                    </SongSliderWrapper>
                </MPFooterWrapper>
            </MusicPlayerWrapper>
        )
    }
}


// export default class MusicPlayer extends React.Component {
//     constructor (props) {
//         super(props)
//         this.state = {
//             audioplayer: {
//                 playing: false,
//                 volume: 1
//             },
            
//         }
        
//         this.activeGuild = props.activeGuild
//         this.token = props.token
//         this.websocket = props.websocket


//     }

    

    

//     render() {
//         return(
//             <MusicPlayerWrapper id="wrapper">
//                 <MusicPlayerPageContent id="footer" token={this.token} websocket={this.websocket} activeGuild={this.activeGuild}/>
//             </MusicPlayerWrapper>
//         )
//     }
// }

