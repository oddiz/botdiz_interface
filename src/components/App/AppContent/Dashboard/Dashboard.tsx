import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components'
import GuildBar from './GuildBar'
import GuildOptions from './GuildOptions'
import ChatPage from './Chat/ChatPage'
import MusicPlayer from './MusicPlayer/MusicPlayer'
import { useRecoilValue } from 'recoil';
import { accountData, connectionState } from 'components/App/Atoms';
import SpotifyApi from 'spotify-web-api-node'
import NoGuilds from './NoGuilds';

const DashboardWrapper = styled.div`
    width: 100%;
    height: 100%;
    
    flex-grow: 1;
    display: flex;
    flex-direction: row;

    
`

const DashboardContent = styled.div`
    flex-grow: 1;

    display:flex;
    flex-direction: column;
    height:100%;
    width:100%;
    overflow-x: hidden;

    background-color: #202225;

`
const GuildOptionsContent = styled.div`
    flex-grow: 1;
    height:calc(100% - var(--guild-options-height));
    border-top-left-radius: 5px;

    background-color: #36393f;
`

export interface AllowedGuild {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: number;
    features: string[];
    permissions_new: string;
    iconUrl?: string;
    administrator?: boolean;
    dj_access?: boolean
}

export interface InterfaceGuildObject {
    id: string;
    icon: string;
    dj_access?: boolean,
    administrator?: boolean ,
    owner: boolean
}

export interface DbSpotifyData {
    auth_token: string;
    refresh_token: string;
    expires: number;
    playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse
}
const Dashboard = () => {

    const [allGuilds, setAllGuilds] = useState<InterfaceGuildObject[] | null>([])
    const [activeOption, setActiveOption] = useState("")
    
    const [activeGuild, setActiveGuild] = useState<InterfaceGuildObject | null>(null)
    const {websocket, token} = useRecoilValue(connectionState)
    let _isMounted = useRef(false)

    useEffect(() => {
        _isMounted.current = true;
        const getGuilds = async () => {
        
            if(!websocket) {
                return
            }
    
            const message = {
                type:"get",
                token: token,
                command: "RPC_getGuilds",
                params: []
            }
            
            websocket.send(JSON.stringify(message))
    
        }
        if(websocket?.readyState === WebSocket.OPEN) {
            websocket.addEventListener("message", websocketDashboardListener, {once:true})

            console.log(allGuilds)
            getGuilds()
        }

        return () => {
            _isMounted.current = false
            if(websocket) {
                websocket.removeEventListener("message", websocketDashboardListener)
            }
        }

    }, [websocket, allGuilds, token])

    const websocketDashboardListener = (reply: MessageEvent<any>) => {
        //console.log("reply recieved" ,reply)
        let parsedReply;

        try {
            parsedReply = JSON.parse(reply.data)
            
        } catch (error) {
            console.log(error)
            return
        }
        
        console.log(parsedReply)

        if(!parsedReply.result) {
            console.log("Reply is not valid or empty: ", parsedReply)
            return
        }
        //get Guild command
        if(parsedReply.command === "RPC_getGuilds") {
            if (parsedReply.result.length === 0) {
                setAllGuilds(null)

                return
            }
            console.log("Guilds recieved: ", parsedReply.result)
            const replyGuilds = parsedReply.result as AllowedGuild[]
            const mappedGuilds = replyGuilds.map( GuildObj => {
                return {
                    id: GuildObj.id,
                    icon: GuildObj.icon,
                    dj_access: GuildObj.dj_access,
                    administrator: GuildObj.administrator,
                    owner: GuildObj.owner
                }
            })
            if (_isMounted.current){
                setAllGuilds(mappedGuilds)
            }
        } else {
            console.log("Reply is recognized", parsedReply)
        }
    }

    

    

    

    

    const RenderGuildOptionContent = () => {
        switch (activeOption) {
            case "Chat":
                
                return (
                    <ChatPage />
                )
                
            case "Music Player":
                
                return (
                    <MusicPlayer/>
                )
                
            default:
                return <></>
                
        }

        
    }

    const guildOptionsClickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        const menuItem = target.innerText
        
        setActiveOption(menuItem)
    }


    const GuildBarOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
        
        const clickedElement = event.target as HTMLElement
        const parentOfParentClicked = clickedElement.parentElement?.parentElement 
        if ( !parentOfParentClicked) return
        const activeIndex = [...parentOfParentClicked.children].indexOf(clickedElement.parentElement);
        
        if(allGuilds) {
            setActiveGuild(allGuilds[activeIndex])
            setActiveOption("Music Player")
        }
    }

    if(allGuilds === null) {
        return(
            <DashboardWrapper id="dashboard_wrapper" >
                <NoGuilds 

                />
            </DashboardWrapper>
        )
    }

    return (
        <DashboardWrapper id="dashboard_wrapper" >
            <GuildBar
                allGuilds={allGuilds} 
                GuildBarOnClick={GuildBarOnClick} 
            />

            <DashboardContent>
                {activeGuild && 
                <GuildOptions 
                    onClickFunc={guildOptionsClickHandler} 
                />}
                <GuildOptionsContent 
                    id="guild_options_content" 
                    key={activeGuild?.id}
                    
                >
                    {RenderGuildOptionContent()}
                    
                </GuildOptionsContent>

            </DashboardContent>
        </DashboardWrapper>
        
    )
}



export default Dashboard