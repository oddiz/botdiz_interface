import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import Scrollbars from 'react-custom-scrollbars'
import {config} from 'config'
import './Playlist.css'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ImSpotify } from 'react-icons/im'
import {IoRefresh} from 'react-icons/io5'
import { DbSpotifyData } from '../../Dashboard'
import { useRecoilState, useRecoilValue } from 'recoil'
import { connectionState } from 'components/App/Atoms'
import { activeGuildState } from '../../Atoms'
import { controlsDisabledState, inVoiceChannelState } from '../Atoms'



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

const Playlist = () => {
    
    const [userPlaylists, setUserPlaylists] = useState<DbSpotifyData["playlists"] | null>(null);
    const [processingPlaylist, setProcessingPlaylist] = useState<boolean>(false);
    const [playlistRefreshHidden, setPlaylistRefreshHidden] = useState<boolean>(true);
    
    const [, setControlsDisabled] = useRecoilState(controlsDisabledState)
    
    const { websocket, token } = useRecoilValue(connectionState)
    const activeGuild = useRecoilValue(activeGuildState)
    const inVoiceChannel = useRecoilValue(inVoiceChannelState)
    
    let lastClickedPlaylist = useRef<HTMLElement | null>(null);

    const listenWebsocketReply = async (reply: MessageEvent) => {

            
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
            setProcessingPlaylist(false)
            if (lastClickedPlaylist.current) {
                lastClickedPlaylist.current.classList.remove("loading")
                lastClickedPlaylist.current.classList.add("success")
            }

        } else if (parsedReply.status === "failed") {
            toast.error('Failed to add playlist');
            if (lastClickedPlaylist.current) {
                lastClickedPlaylist.current.classList.remove("loading")
                lastClickedPlaylist.current.classList.remove("failed")
                await new Promise(resolve => setTimeout(resolve, 50));
                lastClickedPlaylist.current.classList.add("failed")
            }
            setProcessingPlaylist(false)
        }
    }
    useEffect(() => {
        
        websocket?.addEventListener("message", listenWebsocketReply)

        getPlaylists()

        return () => {
            
            websocket?.removeEventListener("message", listenWebsocketReply)
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [websocket])
    
    
    const getPlaylists = async () => {
        try {
            const response = await fetch(config.botdiz_server + '/playlists', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => res.json())
            .catch(err => {
                console.log(err)
                return
            })
            
            if(response.status !== "success") return
            const playlists: DbSpotifyData["playlists"] = response.savedPlaylists

            setUserPlaylists(playlists)
            

        } catch (error) {
            console.log("error while trying to get playlist: ", error)
        }
    }

    
    const playlistClicked = async (event: React.MouseEvent<HTMLDivElement>) => {
        const clickedElement = event.currentTarget
        if(!clickedElement || !clickedElement.parentElement || !userPlaylists) return
        //index of song in queue array
        const playlistIndex = [...clickedElement.parentElement.children].indexOf(clickedElement);

        
        const clickedPlaylist = userPlaylists.items[playlistIndex]
        clickedElement.classList.remove("loading")
        await new Promise(resolve => setTimeout(resolve, 50));
        clickedElement.classList.add("loading")
        clickedElement.classList.remove("failed")
        clickedElement.classList.remove("success")

        if (!inVoiceChannel) {
            toast.error('Bot is not in a voice channel');
            clickedElement.classList.remove("loading")
            if (clickedElement.classList.contains("failed")) {
                clickedElement.classList.remove("failed")
            }
            //need to delay so animation can register
            await new Promise(resolve => setTimeout(resolve, 50));
            clickedElement.classList.add("failed")
            setProcessingPlaylist(false)
            return
        }
        if(processingPlaylist) {
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
        setControlsDisabled(true)
        setProcessingPlaylist(true)

        console.log(clickedPlaylist)

        const response = await fetch(config.botdiz_server+"/playlists/"+clickedPlaylist.id, {
            method:"POST",
            credentials:"include",
        })

        const parsedResponse = await response.json()
        
        
        if (parsedResponse.status === "success" && activeGuild && websocket) {
            const message = JSON.stringify({
                token: token,
                type:"exec",
                command: "RPC_addSpotifyPlaylist",
                params: [activeGuild.id, parsedResponse.result]
            })
            websocket.send(message)

            //this.websocket.removeEventListener("message", listenWebsocketReply)
            
        } else {
            toast.error("Failed to get user's playlists");

            clickedElement.classList.remove("loading")
            clickedElement.classList.remove("failed")
            await new Promise(resolve => setTimeout(resolve, 50));
            clickedElement.classList.add("failed")
            setProcessingPlaylist(false)
            setControlsDisabled(false)
        }
        
        lastClickedPlaylist.current = clickedElement
    }

    const handleSpotifyButton = async () => {
        const botdizCallbackUrl = config.botdiz_interface+"/spotifycallback"
        const encodedbotdizCallbackUrl = encodeURIComponent(botdizCallbackUrl)
        const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=e860aedd3a4546819cae9dd390574c69&response_type=code&redirect_uri=${encodedbotdizCallbackUrl}&scope=playlist-read-private`


        setPlaylistRefreshHidden(false)
        //window.location.href = spotifyAuthUrl
        //window.location.reload()
        window.open(spotifyAuthUrl)

        return
    }


    const processedPlaylists = userPlaylists?.items.map((playlist, index) => {
        return(
            <PlaylistItemWrapper key={index} onClick={playlistClicked}>
                <PlaylistItemName>
                    {playlist.name}
                </PlaylistItemName>
            </PlaylistItemWrapper>
        )
    }) || <></>
    


    return(
        <PlaylistWrapper >
            
            <Scrollbars
                autoHide
                autoHideTimeout={1500}
                autoHideDuration={200}
                id="spotify_list"
            >
                <PlaylistRefreshButton 
                    getPlaylists={getPlaylists} 
                    hidden={playlistRefreshHidden}
                />
                <h2 style={{color: "white", marginLeft: "20px", marginBottom:"25px"}}>Playlists</h2>
                <PlaylistItemsWrapper className="hide_scrollbar" >
                    {processedPlaylists}
                    
                    <ImportSpotifyButton onClick={handleSpotifyButton}>
                        <SpotifyLogo />
                        <ButtonText>
                            {userPlaylists && userPlaylists.items.length > 0 ? "Refresh Playlists": "Import Playlists"}
                            
                        </ButtonText>
                    </ImportSpotifyButton>
                </PlaylistItemsWrapper>
            </Scrollbars>
        </PlaylistWrapper>
    )
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
function PlaylistRefreshButton(props: { hidden: boolean, getPlaylists: () => void }) {
    const [hidden, setHidden] = useState(props.hidden)

    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        buttonRef?.current?.scrollIntoView({behavior: "smooth", block: "nearest"})
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

export default Playlist