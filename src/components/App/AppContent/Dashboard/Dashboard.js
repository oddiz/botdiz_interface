import React, { useState } from 'react';
import styled from 'styled-components'
import GuildBar from './GuildBar'
import GuildOptions from './GuildOptions'
import ChatPage from './Chat/ChatPage'
import MusicPlayer from './MusicPlayer/MusicPlayer'
import config from 'config.js'
import {IoRefresh} from 'react-icons/io5'

import { Box, Heading, Text, Button } from '@dracula/dracula-ui'


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
export default class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            //activeGuild:
            allGuilds: [],
            activeOption: "",
            userPlaylists: null
        }
        this.websocket = props.websocket
        this.token = props.token

        
        
        this.setupWebsocketListener = this.setupWebsocketListener.bind(this)
        this.guildOptionsClickHandler = this.guildOptionsClickHandler.bind(this)
        this.GuildBarOnClick = this.GuildBarOnClick.bind(this)
    }
    
    async componentDidMount(){
        this._isMounted = true
        if (this.websocket?.readyState === WebSocket.OPEN) {
            this.setupWebsocketListener()
            //ask for guilds 
            this.getGuilds()
            //get playlist info if exists and store it in dashboard page
            this.getPlaylists()
        }
    }
    componentWillUnmount(){
        this._isMounted = false
        if (this.websocket) {
            this.websocket.removeEventListener("message", this.websocketDashboardListener)
        }
    }

    websocketDashboardListener = (reply) => {
        //console.log("reply recieved" ,reply)
        let parsedReply;

        try {
            parsedReply = JSON.parse(reply.data)
            
        } catch (error) {
            console.log(error)
            return
        }
        

        if(parsedReply.token !== this.token) {
            console.log("Websocket reply token mismatch.")
            return
        }

        if(!parsedReply.result) {
            console.log("Reply is not valid or empty: ", parsedReply)
            return
        }
        //get Guild command
        if(parsedReply.command === "RPC_getGuilds") {
            if (parsedReply.result.length === 0) {
                this.setState({allGuilds: "no_guilds"})

                return
            }
            const mappedGuilds = parsedReply.result.map( GuildObj => {
                return {
                    id: GuildObj.id,
                    icon: GuildObj.icon,
                    dj_access: GuildObj.dj_access,
                    administrator: GuildObj.administrator,
                    owner: GuildObj.owner
                }
            })
            if (this._isMounted){
                this.setState({allGuilds: mappedGuilds})
            }
        } else {
            console.log("Reply is recognized", parsedReply)
        }
    }
    setupWebsocketListener() {
        
        this.websocket.addEventListener("message", this.websocketDashboardListener, {once:true})
    }

    getPlaylists = async () => {
        try {
            const response = await fetch(config.botdiz_server + '/playlists', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => res)
            .catch(err => {
                console.log(err)
                return err
            })
            
            const responseBody = await response.json()
            const playlists = responseBody.savedPlaylists

            if(this._isMounted) {
                this.setState({userPlaylists: playlists})
            }

            return playlists
        } catch (error) {
            console.log("error while trying to get playlist: ", error)
        }
    }

    async getGuilds() {
        
        if(!this.websocket || this.websocket === "connecting") {
            return
        }

        const message = {
            type:"get",
            token: this.props.token,
            command: "RPC_getGuilds",
            params: []
        }
        
        
        this.websocket.send(JSON.stringify(message))
        
        
        

    }
    RenderGuildOptionContent() {
        switch (this.state.activeOption) {
            case "Chat":
                
                
                return (
                    <ChatPage
                        key={this.state.activeGuild.id}
                        token={this.token} 
                        websocket={this.websocket} 
                        activeGuild={this.state.activeGuild}
                        onKeyDownFunc={this.chatInputKeyboardEvent} 
                    />
                )
                
            case "Music Player":
                
                return (
                    <MusicPlayer 
                        key={this.state.activeGuild.id + this.state.userPlaylists?.items.length}
                        token={this.token}
                        activeGuild={this.state.activeGuild}
                        websocket={this.websocket}
                        playlists={this.state.userPlaylists}
                        getPlaylists={this.getPlaylists}
                    />
                )
                
            default:
                return <></>
                
        }

        
    }

    guildOptionsClickHandler(event) {
        const menuitem = event.target.innerText
        
        
        this.setState({activeOption: menuitem})
        
    }


    GuildBarOnClick(event) {
        
        const clickedElement = event.target
        const activeIndex = [...clickedElement.parentElement.parentElement.children].indexOf(clickedElement.parentElement);
        
        this.setState(
            {
                activeGuild: this.state.allGuilds[activeIndex],
                activeOption: "Music Player"
            }
        )
    }

    render() {

        

        if(this.state.allGuilds === "no_guilds") {
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
                    allGuilds={this.state.allGuilds} 
                    GuildBarOnClick={this.GuildBarOnClick} 
                />

                <DashboardContent>
                    {this.state.activeGuild && 
                    <GuildOptions 
                        onClickFunc={this.guildOptionsClickHandler} 
                        activeGuild={this.state.activeGuild}
                        isAdmin={this.props.accountInfo.is_admin}
                    />}
                    <GuildOptionsContent 
                        id="guild_options_content" 
                        key={this.state.activeGuild?.id}
                        getPlaylists={this.getPlaylists}
                    >
                        {this.RenderGuildOptionContent()}
                        
                    </GuildOptionsContent>

                </DashboardContent>
            </DashboardWrapper>
            
        )
    }
}

const NoGuildsWrapper = styled.div`
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;
const ButtonsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;
function NoGuilds (props) {

    const [buttonClicked, setButtonClicked] = useState(false)

    const addGuildButtonHandler = () => {
        let inviteLink
        if (process.env.NODE_ENV === "development") {
            inviteLink = "https://discord.com/oauth2/authorize?client_id=857957046297034802&scope=bot+applications.commands&permissions=2184309832"

        } else {
            inviteLink = "https://discord.com/oauth2/authorize?client_id=851497395190890518&scope=bot+applications.commands&permissions=2184309832"
        }
        window.open(inviteLink, "_blank")
        setButtonClicked(true)
        
    }
    const refreshClicked = () => {
        window.location.reload()
    }

    return(
        <NoGuildsWrapper>
            <Box
                width= "xl"
                rounded="lg"
                p="md"
                style={{
                    border: "solid 4px #606570",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    fontWeight: "600"
                }}
            >
                <Heading
                    m="xl"
                    size="2xl"
                    color= "red"
                    style={{
                        textAlign: "center",
                        marginBottom: "10px",
                    }}
                >
                    No Guilds Found 
                </Heading>
                <Text
                    as="p"
                >
                    Start by clicking <span style={{fontSize: "24px", fontFamily: "Whitney Semibold Regular", color:"#8d9196"}}>My Guilds</span> to see the guilds you can add Botdiz to. 

                </Text>


                <Text
                    mt="lg"
                    mb="sm"
                    as="p"
                    align="center"
                >
                    Or click the button below!
                </Text>
                <ButtonsWrapper>
                    <Button
                        size= "lg"
                        color = "animated"
                        onClick={addGuildButtonHandler}
                        style={{
                            background: "linear-gradient(130deg, rgba(102,204,153,1) 0%, rgba(149,208,159,1) 33%, rgba(255,248,167,1) 66%, rgba(255,198,147,1) 100%)",
                        }}
                    >
                        <span style={{fontWeight: 600}}>
                            Add Botdiz To Your Guild
                        </span>
                    </Button>
                    {buttonClicked && 
                    <Button
                        color= "green"
                        onClick={refreshClicked}
                        ml="xs"
                        style={{
                            height:"48px",
                            width: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px"
                        }}
                    >
                        <IoRefresh 
                            style={{
                                width:"100%",
                                height: "100%",
                                stroke: "black",
                                strokeWidth: "10"
                            }}
                        />
                    </Button>}
                </ButtonsWrapper>
            </Box>
        </NoGuildsWrapper>
    )
}