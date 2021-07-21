import React from 'react'
import styled from 'styled-components'
import { ImSpotify } from 'react-icons/im'
import Scrollbars from 'react-custom-scrollbars'
import config from 'config.js'
import './Playlist.css'


const PlaylistWrapper = styled.div`
    height:100%;
    width: 200px;
    flex-shrink: 0;
    background-color: #2f3136; 

    display: flex;
    flex-direction: column;
`
const PlaylistItemsWrapper = styled.div`
    flex-grow: 1;
    flex-shrink: 0;
    display:flex;
    flex-direction: column;

    overflow-y: scroll;
    overflow-x: hidden;


`
const PlaylistItemWrapper = styled.div`
    box-sizing: border-box;
    
    padding: 10px 0px;
    padding-left: 15px;

    flex-shrink: 0;
    word-break: normal;

    cursor:pointer;

`
const PlaylistItemName = styled.span`
    font-size: 16px;
    color: #b3b3b3;

    &:hover {
        color: white;
    }
`
const ImportSpotifyButton =styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: row;

    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    height: 40px;
    

    margin: 10px 10px;

    background-color: #1DB954;
    border-radius: 100px;

    cursor: pointer;
`
const ButtonText = styled.span`
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
    margin-left: 10px;
    margin-right: 10px;
    color: white;

`
const SpotifyLogo = styled(ImSpotify)`
    font-size: 24px;
    color: white;

`
export default class Playlist extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            processingPlaylist: false,
        }
        this.websocket = props.websocket
        this.playlists = props.playlists|| {items: []}
        this.playerButtonClicked = props.playerButtonClicked

        this.token = props.token
        this.activeGuild = props.activeGuild
        this.playlistClicked = this.playlistClicked.bind(this)
    }

    componentDidMount() {
        this.websocket.addEventListener("message", this.listenWebsocketReply)
    }

    componentWillUnmount() {
        this.websocket.removeEventListener("message", this.listenWebsocketReply)
    }

    listenWebsocketReply = async (reply) => {

                
        let parsedReply;
        
        try {
            parsedReply = JSON.parse(reply.data)
            
        } catch (error) {
            console.log(error)
            return
        }

        if (parsedReply.command !== "RPC_addSpotifyPlaylist") {
            //only listen to add spotify playlist command replies
            return
        }

        console.log(parsedReply)

        if (parsedReply.status === "success") {
            this.setState({processingPlaylist: false})
            this.clickedElement.classList.remove("loading")
            this.clickedElement.classList.add("success")

            console.log("sucesssss")
        } else if (parsedReply.status === "failed") {
            this.clickedElement.classList.remove("loading")
            this.clickedElement.classList.remove("failed")
            await new Promise(resolve => setTimeout(resolve, 50));
            this.clickedElement.classList.add("failed")
            this.setState({processingPlaylist: false})
        }

    
}
    async playlistClicked(event) {
        const clickedElement = event.currentTarget
        //index of song in queue array
        const playlistIndex = [...clickedElement.parentElement.children].indexOf(clickedElement);

        //signal parent element that playlist is clicked so loading bar can be shown
        this.playerButtonClicked()

        const clickedPlaylist = this.playlists.items[parseInt(playlistIndex)]
        clickedElement.classList.remove("loading")
        await new Promise(resolve => setTimeout(resolve, 50));
        clickedElement.classList.add("loading")
        clickedElement.classList.remove("failed")
        clickedElement.classList.remove("success")
        if (!this.props.inVoiceChannel) {
            
            console.log("Bot is not in a voice channel. Can't add playlist")
            clickedElement.classList.remove("loading")
            if (clickedElement.classList.contains("failed")) {
                clickedElement.classList.remove("failed")
            }
            //need to delay so animation can register
            await new Promise(resolve => setTimeout(resolve, 5));
            clickedElement.classList.add("failed")
            this.setState({processingPlaylist: false})
            return
        }
        if(this.state.processingPlaylist) {
            console.log("Trying to add another playlist")
            clickedElement.classList.remove("loading")
            if (clickedElement.classList.contains("failed")) {
                clickedElement.classList.remove("failed")
            }
            await new Promise(resolve => setTimeout(resolve, 50));

            clickedElement.classList.add("failed")
            return
        }

        this.setState({processingPlaylist: true})

        const response = await fetch(config.botdiz_server+"/playlists/"+clickedPlaylist.id, {
            method:"POST",
            credentials:"include",
        })

        const parsedResponse = await response.json()
        
        
        if (parsedResponse.status === "success") {
            const message = JSON.stringify({
                token: this.token,
                type:"exec",
                command: "RPC_addSpotifyPlaylist",
                params: [this.activeGuild.id, parsedResponse.result]
            })
            this.websocket.send(message)

            this.clickedElement = clickedElement
            //this.websocket.removeEventListener("message", listenWebsocketReply)
            
        } else {
            clickedElement.classList.remove("loading")
            clickedElement.classList.remove("failed")
            await new Promise(resolve => setTimeout(resolve, 50));
            clickedElement.classList.add("failed")
            this.setState({processingPlaylist: false})
        }

    }

    handleSpotifyButton = async () => {
        const botdizCallbackUrl = config.botdiz_interface+"/spotifycallback"
        const encodedbotdizCallbackUrl = encodeURIComponent(botdizCallbackUrl)
        const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=e860aedd3a4546819cae9dd390574c69&response_type=code&redirect_uri=${encodedbotdizCallbackUrl}&scope=playlist-read-private`

        console.log(spotifyAuthUrl)

        window.open(spotifyAuthUrl, "_blank")
    }

    render() {

        const processedPlaylists = this.playlists.items.map((playlist, index) => {
            return(
                <PlaylistItemWrapper key={index} onClick={this.playlistClicked}>
                    <PlaylistItemName>
                        {playlist.name}
                    </PlaylistItemName>
                </PlaylistItemWrapper>
            )
        })
        


        return(
            <PlaylistWrapper>
                    <Scrollbars
                        autoHide
                        autoHideTimeout={1500}
                        autoHideDuration={200}
                    >
                <h2 style={{color: "white", marginLeft:"10px", marginBottom:"25px"}}>Playlists</h2>
                <PlaylistItemsWrapper className="hide_scrollbar">
                        {processedPlaylists}
                        
                        <ImportSpotifyButton onClick={this.handleSpotifyButton}>
                            <SpotifyLogo />
                            <ButtonText>
                                {this.playlists.items.length > 0 ? "Refresh Playlists": "Import Playlists"}
                                
                            </ButtonText>
                        </ImportSpotifyButton>
                </PlaylistItemsWrapper>
                    </Scrollbars>
            </PlaylistWrapper>
        )
    }
} 