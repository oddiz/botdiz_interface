import React from 'react';
import styled from 'styled-components'
import GuildBar from './GuildBar'
import GuildOptions from './GuildOptions'
import ChatPage from './Chat/ChatPage'
import MusicPlayer from './MusicPlayer/MusicPlayer'


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
`
export default class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            //activeGuild:
            allGuilds: [{
                id: '237628149901426688',
                icon: '270e4b47e61b25d11ccf21c34aac2e09'
            },
            
            ],
            activeOption: "Chat"
        }
        this.websocket = props.websocket
        this.token = props.token

        
        
        this.guildOptionsClickHandler = this.guildOptionsClickHandler.bind(this)
        this.GuildBarOnClick = this.GuildBarOnClick.bind(this)
    }
    
    async componentDidMount(){
        //ask for guilds 
        this.getGuilds()
    }

    async getGuilds() {
        
        if(!this.websocket) {
            return
        }

        const message = {
            type:"get",
            token: this.props.token,
            command: "RPC_getGuilds",
            params: []
        }
        
        
        this.websocket.send(JSON.stringify(message))
        
        
        this.websocket.onmessage = (reply) => {
            //console.log("reply recieved" ,reply)
            let parsedReply;
            
            try {
                parsedReply = JSON.parse(reply.data)
                
            } catch (error) {
                console.log(error)
                return
            }

            if(parsedReply.result && parsedReply.token === this.token && parsedReply.command === "RPC_getGuilds") {
                const mappedGuilds = parsedReply.result.map( GuildObj => {
                    return {
                        id: GuildObj.id,
                        icon: GuildObj.icon
                    }
                })

                this.setState({allGuilds: mappedGuilds})
            } else {
                console.log("Reply is not valid", reply)
            }
        }

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
                    <MusicPlayer />
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
            <DashboardWrapper>
                <GuildBar
                    key={this.state.activeGuild?.id}
                    allGuilds={this.state.allGuilds} 
                    GuildBarOnClick={this.GuildBarOnClick} 
                    activeGuild={this.state.activeGuild} 
                />

                <DashboardContent>
                    <GuildOptions onClickFunc={this.guildOptionsClickHandler} />
                    <GuildOptionsContent key={this.state.activeGuild?.id}>
                        {this.RenderGuildOptionContent()}
                        

                    </GuildOptionsContent>

                </DashboardContent>
            </DashboardWrapper>
            
        )
    }
}