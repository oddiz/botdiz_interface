import React from 'react';
import styled from 'styled-components'
import GuildBar from './GuildBar'
import GuildOptions from './GuildOptions'
import ChatPage from './Chat/ChatPage'
import MusicPlayer from './MusicPlayer/MusicPlayer'
import config from '../../config'


const DashboardWrapper = styled.div`
    width: 100%;
    height: 100%;

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

`
const GuildOptionsContent = styled.div`
    flex-grow: 1;
    height:calc(100% - var(--guild-options-height));
`
export default class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            //activeGuild:
            allGuilds: [],
            activeOption: "Chat",
            userPlaylists: null
        }
        this.websocket = props.websocket
        this.token = props.token

        
        
        this.setupWebsocketListener = this.setupWebsocketListener.bind(this)
        this.guildOptionsClickHandler = this.guildOptionsClickHandler.bind(this)
        this.GuildBarOnClick = this.GuildBarOnClick.bind(this)
    }
    
    async componentDidMount(){
        this.setupWebsocketListener()
        //ask for guilds 
        this.getGuilds()
        //get playlist info if exists and store it in dashboard page
        this.getPlaylists()
    }
    setupWebsocketListener() {
        
        this.websocket.onmessage = (reply) => {
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
                const mappedGuilds = parsedReply.result.map( GuildObj => {
                    return {
                        id: GuildObj.id,
                        icon: GuildObj.icon
                    }
                })

                this.setState({allGuilds: mappedGuilds})
            } else {
                console.log("Reply is recognized", parsedReply)
            }
        }
    }

    async getPlaylists() {
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
            this.setState({userPlaylists: playlists})
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
                        key={this.state.activeGuild}
                        token={this.token} 
                        websocket={this.websocket} 
                        activeGuild={this.state.activeGuild}
                        onKeyDownFunc={this.chatInputKeyboardEvent} 
                    />
                )
                
            case "Music Player":
                
                return (
                    <MusicPlayer 
                        key={this.state.activeGuild}
                        token={this.token}
                        activeGuild={this.state.activeGuild}
                        websocket={this.websocket}
                        playlists={this.state.userPlaylists}
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
        
        this.setState({activeGuild: this.state.allGuilds[activeIndex]})
    }

    render() {
        
        return (
            <DashboardWrapper id="dashboard_wrapper" key={this.state.activeGuild?.id}>
                <GuildBar
                    key={this.state.activeGuild?.id}
                    allGuilds={this.state.allGuilds} 
                    GuildBarOnClick={this.GuildBarOnClick} 
                    activeGuild={this.state.activeGuild} 
                />

                <DashboardContent>
                    {this.state.activeGuild && <GuildOptions onClickFunc={this.guildOptionsClickHandler} />}
                    <GuildOptionsContent id="guild_options_content" key={this.state.activeGuild?.id}>
                        {this.RenderGuildOptionContent()}
                        

                    </GuildOptionsContent>

                </DashboardContent>
            </DashboardWrapper>
            
        )
    }
}