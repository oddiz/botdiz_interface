
import React from 'react'
import styled from 'styled-components'

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
`
const MPFooterWrapper = styled.div`
    height: 80px;
    min-width: 250px;
    display:flex;
    flex-direction: column;

    justify-content: center;

    background-color: #2A2A2A;
`
class MusicPlayerFooter extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playerInfo: {
                queue: [],
                currentTitle: "",
                streamTime: 0,
                videoLenght: 0,
                audioPlayerStatus: "",
            }
        }
        
        this.websocket = props.websocket
        this.activeGuild = props.activeGuild
        this.setupMusicPlayerListener = this.setupMusicPlayerListener.bind(this)
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
        const guildId = this.activeGuild.id
        
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

            //console.log("Parsed reply from music player: ", parsedReply.message)

            this.setState({ playerInfo: parsedReply.message })

        }
    }

    render() {
        const streamTime = this.state.playerInfo.streamTime || 0
        const streamHours = Math.floor(streamTime / (60 * 60) % 60)
        const streamMins = Math.floor(streamTime / (60) % 60)
        const streamSecs = Math.floor(streamTime % 60)
        
        const videoLenght= this.state.playerInfo.videoLength || 0; //secs
        const videoHours = Math.floor((videoLenght / (60 *60)) % 60)
        const videoMins = Math.floor((videoLenght / 60) % 60)
        const videoSecs = Math.floor(videoLenght % 60)
        
        
        const percentage = ((streamTime * 100) / videoLenght).toFixed(1) || 0

        return(
            <MPFooterWrapper>
                <MPControlsWrapper>
                    
                </MPControlsWrapper>
                <SongSliderWrapper>
                    <CurrentTime>
                        {`${streamHours}:${streamMins.toString().padStart(2,0)}:${streamSecs.toString().padStart(2, '0')}`}
                    </CurrentTime>
                    <ProgressBar percentage={percentage} />
                    <TotalTime>
                        {`${videoHours}:${videoMins.toString().padStart(2, 0)}:${videoSecs.toString().padStart(2, '0')}`}
                    </TotalTime>
                </SongSliderWrapper>
            </MPFooterWrapper>
        )
    }
}

const MusicPlayerContent = styled.div`
    flex-grow: 1;   
`
const MusicPlayerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    width: 100%;
    height: 100%;

`
export default class MusicPlayer extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            audioplayer: {
                playing: false,
                volume: 1
            },
            
        }
        
        this.activeGuild = props.activeGuild
        this.token = props.token
        this.websocket = props.websocket


    }

    

    

    render() {
        return(
            <MusicPlayerWrapper id="wrapper">
                <MusicPlayerContent id= "content"  > 

                </MusicPlayerContent>
                <MusicPlayerFooter id="footer" websocket={this.websocket} activeGuild={this.activeGuild}  />
            </MusicPlayerWrapper>
        )
    }
}

