
import React from 'react'
import styled from 'styled-components'
import { IoAddCircleOutline } from 'react-icons/io5'
import { SongInfo } from './Footer/SongInfo'
import { PlayerControls } from './Footer/PlayerControls'
import { Queue } from './Queue'
import VoiceChannelSection from './VoiceChannelSecition/VoiceChannelSection'
import AddSong from './Footer/AddSong'
import Playlist from './PlaylistsSection/Playlist'

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

    background-color: #2B2E32;

    border-top: solid 1px #484848;
`
const InvisibleFlexAligner = styled.div`
    display:flex;
    flex-direction: row;
    height: 100%;
    width: 250px;

    flex-shrink: 1;

    justify-content: flex-end;
    margin-left: auto;
`
const MusicPlayerContent = styled.div`
    height: 100%;
    flex: 1 1 50px; 

    display: flex;
    flex-direction: row;

    overflow-x: hidden;

`
const MusicPlayerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    width: 100%;
    height: 100%;

`
const AddSongIcon = styled(IoAddCircleOutline)`
    height: 100%;

    font-size: 60px;

    margin-left: auto;
    margin-right: 15px;
    margin-top:12px;
    color: #ffffff99;

    cursor: pointer;

    border-radius: 1000px;

    &:hover {
        color: #ffffff
    }
    &.disabled {
        cursor: not-allowed;

        color: #ffffff19;
    }
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
            },
            inVoiceChannel: false
        }

        this.token = props.token
        this.websocket = props.websocket
        this.activeGuild = props.activeGuild
        this.addSongVisible = false


        this.setupMusicPlayerListener = this.setupMusicPlayerListener.bind(this)
        this.formatTime = this.formatTime.bind(this)
        this.queueDeleteClicked = this.queueDeleteClicked.bind(this)
        this.queueSkipClicked = this.queueSkipClicked.bind(this)
        this.addSongClicked = this.addSongClicked.bind(this)
    }
    componentDidMount() {
        if (this.websocket?.readyState === WebSocket.OPEN) {
            this.setupMusicPlayerListener()
        }

    }
    componentWillUnmount() {
        this.websocket.send(JSON.stringify({
            type: 'clearListeners',
            token: this.token
        }))
    }  

    setVoiceChannelStatus = (bool) => {
        this.setState({inVoiceChannel: bool})
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
                if(parsedReply.status) {
                    
                }
            } catch (error) {
                console.log("Unable to parse reply")
                return
            }
            if(parsedReply.event === "musicplayer_update"){
                this.setState({ playerInfo: parsedReply.message })
            }

            const RpcCommands = [
                "RPC_pausePlayer",
                "RPC_resumePlayer",
                "RPC_skipSong",
                "RPC_stopPlayer",
                "RPC_deleteQueueSong",
                "RPC_playCommand",
                "RPC_addSpotifyPlaylist"
            ]

            if(RpcCommands.includes(parsedReply.command)) {
                this.setState({controlsDisabled: false})
            }

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

        if (this.state.controlsDisabled) {
            //already processing something

            return
        }
        this.setState({controlsDisabled: true})

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
        if (this.state.controlsDisabled) {
            //already processing something
            
            return
        }
        this.setState({controlsDisabled: true})

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
    async addSongClicked (event) {
        if (!this.state.inVoiceChannel) {
            return
        }
        this.setState({addSongVisible: true})
        document.querySelector("#root").classList.add("blurred")
    
    }

    backdropClicked = async (event) => {

        if (event.target.id ==="search_backdrop") {
            document.getElementById("music_search_wrapper").classList.remove("visible")
            document.querySelector("#root").classList.remove("blurred")

            await new Promise(resolve => setTimeout(resolve, 400));
            this.setState({addSongVisible: false})
        }

    }
    searchBoxKeyboardHandler = async (event) => {
        
        const pressedKey = event.key;
        if(pressedKey === "Escape") {
            document.getElementById("music_search_wrapper").classList.remove("visible")
            document.querySelector("#root").classList.remove("blurred")
            await new Promise(resolve => setTimeout(resolve, 200));
            this.setState({addSongVisible: false})
        }

        if(pressedKey === "Enter") {
            if (this.state.queueLock) {
                
                return
            }
            const searchInput = document.getElementById("music_search_input").value

            const message = JSON.stringify({
                token: this.token,
                type: "exec",
                command: "RPC_playCommand",
                params: [this.activeGuild.id, searchInput]
            })

            this.websocket.send(message)
            const self = this
            const startTime = new Date().getTime()
            const cachedQueueLength = this.state.playerInfo.queue.length
            const cachedCurrentTitle = this.state.playerInfo.currentTitle
            this.setState({queueLock: true})

            //wait for a song to be added to queue
            async function waitForSongChange() {
                const time = new Date().getTime()
                if (
                    (cachedQueueLength === self.state.playerInfo.queue.length) &&
                    (cachedCurrentTitle === self.state.playerInfo.currentTitle) && 
                    (time < startTime + (1000 * 10))
                    ) {
                    setTimeout(waitForSongChange, 250)
                    return
                }
                
                document.getElementById("music_search_wrapper").classList.remove("visible")
                document.querySelector("#root").classList.remove("blurred")
                await new Promise(resolve => setTimeout(resolve, 200));
                self.setState({addSongVisible: false, queueLock: false})

            }

            waitForSongChange()
        }
    }

    playerButtonClicked = async () => {
        //disable buttons until success message is recieved
        this.setState({controlsDisabled: true})
    }
    render() {
        const formattedTime = this.formatTime()
        
        
        return(
            <MusicPlayerWrapper id="musicplayer_wrapper" >          
                <MusicPlayerContent id="musicplayer_content">
                    <VoiceChannelSection 
                        websocket={this.websocket}
                        token={this.token}
                        audioPlayerStatus={this.state.playerInfo.audioPlayerStatus}
                        guildId={this.activeGuild?.id}
                        setVoiceChannelStatus={this.setVoiceChannelStatus}
                    />
                    <Queue
                        key={this.state.playerInfo.queue.length+this.state.controlsDisabled}
                        queue={this.state.playerInfo.queue} 
                        currentSong={{
                            title: this.state.playerInfo.currentTitle,
                            videoThumbnailUrl: this.state.playerInfo.videoThumbnailUrl,
                            videoLenght: this.state.playerInfo.videoLenght
                        }}
                        queueDeleteClicked={this.queueDeleteClicked}
                        queueSkipClicked={this.queueSkipClicked}
                        controlsDisabled={this.state.controlsDisabled}
                    />
                    <Playlist 
                        websocket={this.websocket}
                        playlists={this.props.playlists}
                        activeGuild={this.activeGuild}
                        token={this.token}
                        inVoiceChannel={this.state.inVoiceChannel}
                        playerButtonClicked={this.playerButtonClicked}
                    />

                </MusicPlayerContent>
                <MPFooterWrapper>
                    <MPControlsWrapper>
                        <SongInfo 
                            imgUrl={this.state.playerInfo.videoThumbnailUrl} 
                            songTitle={this.state.playerInfo.currentTitle} 
                        />
                        <PlayerControls
                            key={this.state.controlsDisabled}
                            token={this.token} 
                            guildId={this.activeGuild.id} 
                            websocket={this.websocket} 
                            audioPlayerStatus={this.state.playerInfo.audioPlayerStatus}
                            controlsDisabled={this.state.controlsDisabled}
                            playerButtonClicked={this.playerButtonClicked}
                        />
                        <InvisibleFlexAligner>
                                <AddSongIcon
                                    key={this.addSongVisible}
                                    id="add_song_icon"
                                    onClick={this.addSongClicked}
                                    className={this.state.inVoiceChannel? "":"disabled"}
                                    
                                />
                            {this.state.addSongVisible && <AddSong searchBoxKeyboardHandler={this.searchBoxKeyboardHandler} backdropClicked={this.backdropClicked} />}

                        </InvisibleFlexAligner>
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

