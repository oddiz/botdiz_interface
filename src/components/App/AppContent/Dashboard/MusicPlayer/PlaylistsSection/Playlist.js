import React, { useState } from 'react'
import styled from 'styled-components'
import Scrollbars from 'react-custom-scrollbars'
import config from 'config.js'
import './Playlist.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ImSpotify } from 'react-icons/im'
import {IoRefresh} from 'react-icons/io5'



const PlaylistWrapper = styled.div`
    height:100%;
    width: 250px;
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
    
    padding: 8px 0px;
    padding-left: 20px;

    flex-shrink: 0;
    word-break: normal;
    color: #b3b3b3;
    cursor:pointer;
    &:hover {
        color: white;
    }

`
const PlaylistItemName = styled.span`
    font-size: 16px;

    
`
const ImportSpotifyButton =styled.div`
    box-sizing: border-box;
    display: flex;
    flex-direction: row;

    align-items: center;
    justify-content: center;

    flex-shrink: 0;

    height: 40px;
    

    margin: 10px 30px;

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
            playlistRefreshHidden: true,
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


        if (parsedReply.status === "success") {
            this.setState({processingPlaylist: false})
            this.clickedElement.classList.remove("loading")
            this.clickedElement.classList.add("success")

        } else if (parsedReply.status === "failed") {
            toast.error('Failed to add playlist');

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

        
        const clickedPlaylist = this.playlists.items[parseInt(playlistIndex)]
        clickedElement.classList.remove("loading")
        await new Promise(resolve => setTimeout(resolve, 50));
        clickedElement.classList.add("loading")
        clickedElement.classList.remove("failed")
        clickedElement.classList.remove("success")
        if (!this.props.inVoiceChannel) {
            toast.error('Bot is not in a voice channel');
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
            toast.error('Already trying to add another playlist');

            clickedElement.classList.remove("loading")
            if (clickedElement.classList.contains("failed")) {
                clickedElement.classList.remove("failed")
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            
            clickedElement.classList.add("failed")
            return
        }
        
        //signal parent element that playlist is clicked so loading bar can be shown
        this.playerButtonClicked()
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
            toast.error("Failed to get user's playlists");

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


        this.setState({playlistRefreshHidden: false})
        //window.location.href = spotifyAuthUrl
        //window.location.reload()
        window.open(spotifyAuthUrl)

        return
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
            <PlaylistWrapper >
                <ToastContainer 
                    position="top-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <Scrollbars
                    autoHide
                    autoHideTimeout={1500}
                    autoHideDuration={200}
                    id="spotify_list"
                >
                    <PlaylistRefreshButton 
                        key={this.state.playlistRefreshHidden}
                        getPlaylists={this.props.getPlaylists} 
                        hidden={this.state.playlistRefreshHidden}
                        ref={this.refreshButton}
                    />
                    <h2 style={{color: "white", marginLeft: "20px", marginBottom:"25px"}}>Playlists</h2>
                    <PlaylistItemsWrapper className="hide_scrollbar" >
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

const PlaylistRefreshButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;

    display: ${props => props.hidden? "none": "flex"};

    height:40px;
    width: 100%;

`
const PlaylistButton = styled.div`
    width: 60%;
    height: 100%;
    
    background: #66cc99;
    
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    color: white;
    font-size: 20px;

    cursor:pointer;
`
function PlaylistRefreshButton(props) {
    const [hidden, setHidden] = useState(props.hidden)

    const buttonRef = React.useRef();

    React.useEffect(() => {
        buttonRef.current.scrollIntoView({behaviour: "auto", block: "nearest"})
    }, [hidden])

    const refreshClicked = () => {
        props.getPlaylists()
        setHidden(true)
    }


    return (
        <PlaylistRefreshButtonWrapper
            hidden={hidden}
            ref={buttonRef}
        >
            <PlaylistButton
                onClick={refreshClicked}
            >
                <IoRefresh />
                <span style={{position:"relative", bottom: "2px", marginLeft: "5px"}}>
                    Refresh
                </span>
            </PlaylistButton>
        </PlaylistRefreshButtonWrapper>
    )
}

