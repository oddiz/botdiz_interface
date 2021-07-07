import React, { useState } from 'react'
import styled from 'styled-components'

const ChatContentWrapper = styled.div`
    flex-grow: 1;
    display:flex;
    flex-direction: column;

    width:auto;
    

    
    
    background-color: #36393f;
`

const MIWrapper = styled.div`
    width: auto;
    flex: 0 0 2px;
    margin: 4px 16px;
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

    const activeGuild = props.activeGuild
    const activeChannel = props.activeChannel
    const websocket = props.websocket
    const token = props.token
    const [inputValue, setInputValue] = useState(""); 

    const onKeyDownEvent = (event) => {
        if (event.keyCode === 13) {
            console.log("You pressed enter!!")

            console.log(inputValue)

            //send a message to channel

            const message = {
                token: token,
                type: "exec",
                command: "RPC_sendMessage",
                //should take 3 params: guildid channelid message
                params: [activeGuild.id, activeChannel.id, inputValue]
            }

            websocket.send(JSON.stringify(message))

            setInputValue("")

        }
    }
    return(
        <MIWrapper onKeyDown={onKeyDownEvent}>
            <MIinput 
                onChange={(event) => {setInputValue(event.target.value)}} 
                type="text"
                value={inputValue}
            ></MIinput>
        </MIWrapper>
    )
}

const ChatRoomWrapper = styled.div`
    display:flex;
    flex-direction: column;
    overflow-y: scroll;
    flex: 1 1 50px;
    padding: 0px 16px;
    

`

const MessageWrapper = styled.div`
    display:flex;
    flex-direction: column;
`

const Message = styled.div`
    display: flex;
    flex-direction: row;
    
    
    width: 100%;
    font-size: 16px;
    color: white;

    margin: 10px;

`
const MessageAuthor = styled.div`
    font-weight: 700;
    height: 100%;
    min-width: 100px;

    color: #f3c340;
    
`
const MessageContent = styled.div`
    height: 100%;
    flex-grow: 1;
    padding-left: 10px;

    overflow-wrap: break-word;
    word-wrap: break-word;
`

const MessageSeperator = styled.span`
    display:block;
    align-self:center;
    width: 70%;
    height: 2px;
    background-color: #42454a;

    border-radius: 5px;
`


const AlwaysScrollToBottom = () => {
    const elementRef = React.useRef();
    React.useEffect(() => elementRef.current.scrollIntoView({behaviour: "auto", block: "nearest"}));
    return <div style={{ float:"left", clear: "both" }} ref={elementRef} />;
  };

function ChatRoom(props) {

    //array of messages
    const messages = props.activeChannelMessages 
    /**
     * message object:
     * {
     *      type: 'DEFAULT',
     *      author: 'oddiz',
     *      content: 'test message'
     * }
     */
    if (!messages) {
        return (
            <ChatRoomWrapper />
        )
    }
    const mappedMessages = messages.map((message, index) => {
        return (
            <MessageWrapper key={"wrapper_" + index}>
                <MessageSeperator />
                <Message>
                    <MessageAuthor style={{color: message.authorColor || "inherit" }}>
                        {message.author}:
                    </MessageAuthor>
                    <MessageContent>
                        {message.content}
                    </MessageContent>
                </Message>
            </MessageWrapper>
        )
    })
    return(
        <ChatRoomWrapper key={messages.length}>
            {mappedMessages.reverse()}
            <AlwaysScrollToBottom />
        </ChatRoomWrapper>
    )
}


export default class ChatContent extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeChannelMessages: null,
            listeners: [],
        }
        this.activeGuild = props.activeGuild
        this.activeChannel = props.activeChannel
        this.websocket = props.websocket
        this.token = props.token
        this.getChannelMessages = this.getChannelMessages.bind(this)
        
    }


    componentDidMount(){
        
        this.getChannelMessages()

        //setup listener for new messages
        this.setupListener()
    }

    componentWillUnmount() {
        this.websocket.send(JSON.stringify({
            type: 'clearListeners',
            token: this.token
        }))
    }

    async setupListener() {

        const listenerId = this.activeChannel.id

        const message = JSON.stringify({
            type: `addTextChannelListener`,
            listenerId: listenerId,
            token: this.token,
            command:`RPC_listenTextChannel`,
            //need guildid, channelid
            params: [this.activeGuild.id, this.activeChannel.id]
        })

        this.websocket.send(message)

        

    }

    async getChannelMessages() {
        if (!this.activeChannel) {
            console.log("No active channels")
            return
        }
        const message = JSON.stringify({
            type:"get",
            token: this.token,
            command: "RPC_getTextChannelContent",
            params: [this.activeGuild.id, this.activeChannel.id]
        })

        this.websocket.send(message)

        this.websocket.onmessage = (reply) => {
            let parsedReply;
            
            try {
                parsedReply = JSON.parse(reply.data)
            } catch (error) {
                console.log("Unable to parse reply")
            }

            if(parsedReply.result && parsedReply.token === this.token && parsedReply.command === "RPC_getTextChannelContent") {

                

                this.setState({activeChannelMessages: parsedReply.result})

                return
            }

            if (parsedReply.event === "new_message") {
                let currentMessages = this.state.activeChannelMessages
                
                currentMessages.unshift(parsedReply.message)
                this.setState({activeChannelMessages: currentMessages})
                
                
            }


        }
    }


    render() {
        return(
            <ChatContentWrapper>
                
                <ChatRoom activeChannelMessages={this.state.activeChannelMessages}/>
                
                <MessageInput 
                    activeGuild = {this.activeGuild}
                    activeChannel = {this.activeChannel}
                    websocket = {this.websocket}
                    token = {this.token}
                />
            </ChatContentWrapper>
        )
    }
}