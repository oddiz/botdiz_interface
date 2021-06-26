import React from 'react'
import styled from 'styled-components'

const ChatContentWrapper = styled.div`

    flex-grow: 1;
    display:flex;
    flex-direction: column;

    width:auto;
    height: 100%;
    
    background-color: #36393f;
`

    const MIWrapper = styled.div`
        width: auto;

        margin: 0px 16px;
        margin-bottom: 12px;
        padding: 10px 16px;

        background-color: #40444b;

        border-radius: 8px;
        
    `

    const MIinput = styled.input`
        font-size: 15px;

        width: 100%;
        color: white;
        background-color: #ffffff00;
        border: none;
        outline: none;

        &:focus {
            border: none;
        }
    `

   
function MessageInput(props) {


    return(
        <MIWrapper>
            <MIinput type="text"></MIinput>
        </MIWrapper>
    )
}

const ChatRoomWrapper = styled.div`
    flex-grow:1;
    padding: 0px 16px;

`

function ChatRoom(props) {

    //array of messages
    const messages = props.activeChannelMessages 

    return(
        <ChatRoomWrapper>
            <h2>Chat</h2>
        </ChatRoomWrapper>
    )
}


export default class ChatContent extends React.Component {
    constructor(props) {
        super(props)

        this.activeChannel = props.activeChannel
        this.activeChannelMessages = props.activeChannelMessages
    }

    render() {
        return(
            <ChatContentWrapper>
                
                <ChatRoom activeChannelMessages={this.activeChannelMessages}/>

                <MessageInput  />
            </ChatContentWrapper>
        )
    }
}