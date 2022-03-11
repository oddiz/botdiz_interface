import React from 'react'
import styled from 'styled-components'
import ChatContent from './ChatRoomContent'
import Scrollbars from 'react-custom-scrollbars'

const ChatWrapper = styled.div`
    flex-grow: 1;
    
    display:flex;
    flex-direction: row;

    width: 100%;
    height: 100%;




`

const TextChannelWrapper = styled.div`
    display:flex;
    flex-direction: row;
    align-items: center;


    padding: 10px 0;
    color: #72767d;

    margin: 0 2px;
    border-radius: 4px;

    cursor: pointer;

    &:hover {
        color:#dcddde;
        background-color: #34363c;
    }

    &.active {
        color: white;
        background-color: #52545C;
    }

`
const HashtagDiv = styled.div`

    margin-left: 6px;
`

const ChannelName = styled.div`
    padding-bottom:6px;
    margin-left: 6px;
    line-height: 20px;
    font-weight: 600;
    overflow: hidden;



`

function getTextWidth(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const element = getComputedStyle(document.getElementById("channels_bar"))
    const font = element.fontSize+ " " + element.fontFamily
    context.font = font
    
    return context.measureText(text).width;
}

const TextChannel = (props) => {
    const hashtag = <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"></path></svg>

    let channelName = props.channelName
    // if (channelName.length > 22) {
    //     channelName = channelName.substring(0,21) + "..."
    // }

    const channelNameWidth = getTextWidth(channelName)

    if (channelNameWidth > 150) {
        let counter = 10;

        let newChannelName = channelName.substring(0,counter) + "..."
        let newChannelWidth = getTextWidth(newChannelName)
        
        while (newChannelWidth < 150) {
            counter ++
            newChannelName = channelName.substring(0,counter) + "..."
            newChannelWidth = getTextWidth(newChannelName)
        }

        channelName = newChannelName    
    }

    
    return (
        <TextChannelWrapper className={props.isActive? "active": ""} onClick={props.onClickFunc}>
            <HashtagDiv>
                {hashtag} 
            </HashtagDiv>
            <ChannelName>
                {channelName}
            </ChannelName>
        </TextChannelWrapper>
    )
}


const ChannelsBarWrapper = styled.div`
    box-sizing: border-box;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;

    width: 200px;
    height: 100%;

    font-size: 14px;
    padding-bottom:6px;
    line-height: 20px;
    font-weight: 600;

    background-color: #2f3136;

`


const ChannelsBar = (props) => {

    const guildTextChannels = props.activeGuildTextChannels
    let textChannelRender = ""

    
    if (guildTextChannels) {
        textChannelRender = guildTextChannels.map((channel,index) => {
            return(
                <TextChannel 
                    key={index} 
                    isActive={props.activeChannel?.id === channel.id} 
                    onClickFunc={props.onClickFunc} 
                    channelName={channel.name} 
                />
            )
        })
    }

    return (
        <ChannelsBarWrapper id="channels_bar">
            <Scrollbars
                autoHide
                autoHideTimeout={1500}
                autoHideDuration={200}
            >

                {textChannelRender}
            </Scrollbars>
        </ChannelsBarWrapper>
    )
}



export default class ChatPage extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            activeGuild: props.activeGuild,
            activeGuildTextChannels: null,
            activeChannel: null,
            //activeChannelMessages
            //
        }
        
        this.guildTextChannels = props.guildTextChannels

        this.token = props.token
        this.websocket = props.websocket
        this.getTextChannels = this.getTextChannels.bind(this)
        this.channelClicked = this.channelClicked.bind(this)
    }

    componentDidMount(){
         this.getTextChannels()
    }

    async getTextChannels() {
        if(!this.props.activeGuild){
            return
        }
        const message = JSON.stringify({
            type:"get",
            token: this.props.token,
            command: "RPC_getTextChannels",
            params: [this.props.activeGuild.id]
        })

        
        this.websocket.send(message)

        this.websocket.onmessage = (reply) => {
            let parsedReply;
            try {
                parsedReply = JSON.parse(reply.data)
            } catch (error) {
                console.log("Unable to parse reply")
            }
            
            if(parsedReply.command !== "RPC_getTextChannels") {
                return
            }

            if (parsedReply.result.status === "unauthorized") {
                this.setState({error: "You are not authorized to view text channels!"})

                return
            }
            

            
            this.setState(
                {
                    activeGuildTextChannels: parsedReply.result,
                    error: null
                }
            )
            

        }
    }

    

    
    async channelClicked(event) {
        const clickedElement = event.currentTarget
        const activeIndex = [...clickedElement.parentElement.children].indexOf(clickedElement);
        

        await this.setState({activeChannel: this.state.activeGuildTextChannels[activeIndex]})
        //console.log(this.state.activeChannel)
        

    }
    


    render() {

        if(this.state.error) {
            return (
                <div style={{textAlign: "center", fontSize:"36px", color: "red", width:"100%"}}>
                    {this.state.error}
                </div>
            )
        }

        if (this.state.activeChannel && this.state.activeGuild) {
            this.ChatContentComponent = (
                <ChatContent 
                    key={this.state.activeChannel.id}
                    token={this.token}
                    activeChannel={this.state.activeChannel || null}
                    activeGuild={this.state.activeGuild || null}
                    websocket={this.websocket}
                />
            ) 
        }
        
        return (
            <ChatWrapper key={this.activeChannel?.id}>
                
                
                <ChannelsBar 
                    key={this.activeChannel?.id}
                    onClickFunc={this.channelClicked} 
                    activeGuildTextChannels={this.state.activeGuildTextChannels} 
                    activeChannel={this.state.activeChannel || null} 
                />
                {this.ChatContentComponent}
            </ChatWrapper>
        )
    }

}