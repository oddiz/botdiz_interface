import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import Scrollbars from 'react-custom-scrollbars'
import { useRecoilValue } from 'recoil'
import { activeGuildState } from '../Atoms'
import { activeTextChannelState } from './Atoms'
import { connectionState } from 'components/App/Atoms'

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

   
function MessageInput() {

    const activeGuild = useRecoilValue(activeGuildState)
    const activeChannel = useRecoilValue(activeTextChannelState)
    const [inputValue, setInputValue] = useState(""); 

    const { websocket, token } = useRecoilValue(connectionState)
    const onKeyDownEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
        console.log(event.code)
        console.log(event.keyCode)

        if (event.keyCode === 13) { //when enter is pressed


            //send a message to channel
            if (!(activeGuild && activeChannel)) {
                console.log("active guild or active channel is null")
                return 
            }

            const message = {
                token: token,
                type: "exec",
                command: "RPC_sendMessage",
                //should take 3 params: guildid channelid message
                params: [activeGuild.id, activeChannel.id, inputValue]
            }

            websocket?.send(JSON.stringify(message))

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
    overflow-x: hidden;
    flex: 1 1 ;
    
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        display:none
    }
`

const MessageWrapper = styled.div`
    display:flex;
    flex-direction: column;
`

const Message = styled.div`
    display: flex;
    flex-direction: row;
    
    
    flex: 1 1 auto;
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
    const elementRef = React.useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        
        if(elementRef && elementRef.current) {
            elementRef?.current?.scrollIntoView({behavior: "smooth", block: "nearest"})
        }
    },);
    return <div style={{ float:"left", clear: "both" }} ref={elementRef} />;
};
interface ChatRoomMessage {
    type: string;
    author: string;
    authorColor?: string | null;
    content: string;
}
function ChatRoom(props: { activeChannelMessages: ChatRoomMessage[] | null }) {

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
    const mappedMessages = messages.map((message: ChatRoomMessage, index) => {
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
    console.log(mappedMessages)
    return(
        <ChatRoomWrapper className="" key={messages.length}>
            <Scrollbars
                autoHide
                autoHideTimeout={1500}
                autoHideDuration={200}
                renderView={({ style, ...props }) =>
            <div {...props} style={{ ...style, overflowX:"hidden" }}/>
        }
                
            >
                {mappedMessages.reverse()}
                <AlwaysScrollToBottom />
            </Scrollbars>
        </ChatRoomWrapper>
    )
}

const Unauthorized = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    
    height:100%;
    width:100%;

    font-size: 28px;
    color: var(--red);

    word-wrap: normal;
`

const ChatContent = () => {

    const activeGuild = useRecoilValue(activeGuildState)
    const activeChannel = useRecoilValue(activeTextChannelState)
    const { token, websocket } = useRecoilValue(connectionState)
    const [activeChannelMessages, setActiveChannelMessages] = useState<ChatRoomMessage[] |null | "unauthorized">(null)

    useEffect(() => {
        const getChannelMessages = async() => {
            if (!activeChannel) {
                console.log("No active channels")
                return
            }
            if (!activeGuild) return
    
            if (!websocket) {
                console.log("No websocket")
                return
            }
            const message = JSON.stringify({
                type:"get",
                token: token,
                command: "RPC_getTextChannelContent",
                params: [activeGuild?.id, activeChannel?.id]
            })
    
            websocket.send(message)
    
            websocket.onmessage = (reply) => {
                let parsedReply;
                
                try {
                    parsedReply = JSON.parse(reply.data)
                } catch (error) {
                    console.log("Unable to parse reply")
                    return
                }
    
                
                if(parsedReply.result && parsedReply.command === "RPC_getTextChannelContent") {
                    
                    if(parsedReply.result.status === "unauthorized") {
                        console.log("Not authorized to see the channel content")
                        setActiveChannelMessages("unauthorized")
                        return
                    }
    
                    if(parsedReply.result.status ==="failed") {
                        console.log("failed to get channel messages")
                        return
                    }
                    
                    if(parsedReply.result.status === "success") {
                        setActiveChannelMessages(parsedReply.result.messages)
    
                        return
                    }
    
                }
    
                if (parsedReply.event === "new_message" && (activeChannelMessages !== "unauthorized")) {
                    const newMessage = parsedReply as WebsocketNewMessageEvent
                    let currentMessages = activeChannelMessages || []
                    
                    
                    currentMessages.unshift(newMessage.message)
                    setActiveChannelMessages(currentMessages)
                    
                }
            }
        }
        const setupListener = async() => {

            const guildId = activeChannel?.id
            if (!guildId) return
            if (!websocket) return
            const message = JSON.stringify({
                type: `addTextChannelListener`,
                token: token,
                command:`RPC_listenTextChannel`,
                //need guildid, channelid
                guildId: guildId,
                channelId: activeChannel.id
            })
    
            websocket.send(message)
    
            
    
        }
        if(!token || !websocket) return
        getChannelMessages()
        setupListener()
      return () => {
        if(!websocket) return
        websocket.send(JSON.stringify({
            type: 'clearListeners',
            token: token
        }))
      }
    }, [token, websocket])
    
   

    

    type WebsocketNewMessageEvent = {
        event: 'new_message',
        listenerId: string,
        message: ChatRoomMessage
    }
    

    if(activeChannelMessages === "unauthorized") {
        return(
            <Unauthorized>
                ⛔ Bot is not authorized to see this channel's content ⛔
            </Unauthorized>
        )
    }

    if (!activeChannel || !activeGuild) {
        return (<ChatContentWrapper />)
    }
    return(
        <ChatContentWrapper>
            
            <ChatRoom activeChannelMessages={activeChannelMessages}/>
            
            <MessageInput />
        </ChatContentWrapper>
    )
}

export default ChatContent