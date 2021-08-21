import React from 'react'
import styled from 'styled-components'
import config from 'config.js'
import Scrollbars from 'react-custom-scrollbars'

const ChannelName = styled.div`
    padding-bottom:6px;
    margin-left: 6px;
    line-height: 20px;
    font-weight: 600;
    overflow: hidden;


`
const HashtagDiv = styled.div`

    margin-left: 6px;
`
const VoiceChannelWrapper = styled.div`
    display:flex;
    flex-direction: column;


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
const VoiceChannelTitleWrapper = styled.div`
    display:flex;
    flex-direction: row;
    align-items: center;
`
const ChannelMembersWrapper = styled.div`
    display: flex;
    flex-direction: column;
    
    margin-left: 40px;

`
const ChannelMember = styled.span`
    margin-top:4px;

    &.emphasis {
        color: transparent;
        font-weight: 600;
        font-family: "Fira Code";


        background-clip: text;
        -webkit-background-clip: text;
    }
`
const VoiceChannel = (props) => {
    const volumeIcon = <svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z" aria-hidden="true"></path></svg>

    /**
     * props.channelMembers = [
     *  displayName:"oddiz"
     *  userID: 133713371337
     * ...
     * ]
     */
    const botdizDiscordId = config.botdiz_discordId
    const renderChannelMembers = props.channelMembers.map((member,index) => {
        return(
            <ChannelMember key={index} className={parseInt(member.userId) === botdizDiscordId? "emphasis drac-bg-animated" : ""}>
                {member.displayName}
            </ChannelMember>
        )
    })

    function getTextWidth(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const element = getComputedStyle(document.getElementById("voice_channels_wrapper"))
        const font = element.fontSize+ " " + element.fontFamily
        context.font = font
        
        return context.measureText(text).width;
    }

    let channelName = props.channelName
    // if (channelName.length > 22) {
    //     channelName = channelName.substring(0,21) + "..."
    // }

    const channelNameWidth = getTextWidth(channelName)

    if (channelNameWidth > 150) {
        let counter = 5;

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
        <VoiceChannelWrapper onClick={props.onClickFunc}>
            <VoiceChannelTitleWrapper>
                <HashtagDiv>
                    {volumeIcon} 
                </HashtagDiv>
                <ChannelName>
                    {channelName}
                </ChannelName>
            </VoiceChannelTitleWrapper>
            <ChannelMembersWrapper>
                {renderChannelMembers}
            </ChannelMembersWrapper>
        </VoiceChannelWrapper>
    )
}


const VoiceChannelSectionWrapper = styled.div`
    height: 100%;
    width: 200px;
    flex-shrink:0;

    background-color: #2f3136;
    display: flex;
    flex-direction: column;

    font-size:14px;

`
export default class VoiceChannelSection extends React.Component{
    constructor(props) {
        super(props)

        this.state = {
            audioPlayerStatus: props.audioPlayerStatus,
            voiceChannels: []
        }

        this.websocket = props.websocket
        this.token = props.token
        this.guildId = props.guildId
    }
    componentDidMount() {
        //setup ws listener
        this.websocket.addEventListener("message", this.voiceChannelSectionListener)

        this.getVoiceChannels()

        this.setupChannelListener()
    }

    componentWillUnmount() {
        this.websocket.removeEventListener("message", this.voiceChannelSectionListener)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(
            this.props.audioPlayerStatus === nextProps.audioPlayerStatus && 
            this.guildId === nextProps.guildId &&
            this.state === nextState 
            
        ) {
            return false
        } else {
            return true
        }
    }

    componentDidUpdate() {
        const botdizDiscordId = config.botdiz_discordId

        let botFound = false
        for (const voiceChannel of this.state.voiceChannels) {
            for(const member of voiceChannel.members)
                if(botdizDiscordId === parseInt(member.userId)) {
                    botFound = true
            }
        }

        this.props.setVoiceChannelStatus(botFound)
    }
    setupChannelListener = () => {
        const listenerId = this.guildId

        const message = JSON.stringify({
            type: `addVoiceChannelListener`,
            listenerId: listenerId,
            token: this.token,
            command:`RPC_listenVoiceChannels`,
            //need guildid
            params: [listenerId]
        })

        this.websocket.send(message)
    }

    getVoiceChannels = () => {
        const message = JSON.stringify({
            type: "get",
            token: this.token,
            command: "RPC_getVoiceChannels",
            params: [this.guildId]
        })

        this.websocket.send(message)
    }

    voiceChannelSectionListener = (reply) => {
        try {
            let parsedReply = JSON.parse(reply.data)
            if (parsedReply.command === "RPC_getVoiceChannels") {
                this.setState({voiceChannels: parsedReply.result})
            }

            if (parsedReply.event === "voicechannel_update") {
                /* Reply format
                {
                    event: "voicechannel_change",
                    listenerId: listenerID,
                    guildId: guildId
                }
                */
                this.getVoiceChannels()
            }


        } catch (error) {
            console.log(error, " Error while trying to process voice channel command")
        }
    }

    voiceChannelClickHandler = (event) => {
        const clickedElement = event.currentTarget
        //index of song in queue array
        const channelIndex = [...clickedElement.parentElement.children].indexOf(clickedElement);
        const clickedChannel = this.state.voiceChannels[channelIndex]

        const message = JSON.stringify({
            type: "exec",
            token: this.token,
            command: "RPC_joinVoiceChannel",
            params: [this.guildId, clickedChannel.id] 
        })

        this.websocket.send(message)
    }
    
    render() {
        const guildVoiceChannels = this.state.voiceChannels
        let voiceChannelRender;
        if (guildVoiceChannels) {
            voiceChannelRender = guildVoiceChannels.map((channel,index) => {
                return(
                    <VoiceChannel 
                        key={index} 
                        onClickFunc={this.voiceChannelClickHandler}
                        channelName={channel.name}
                        channelMembers={channel.members}
                        audioPlayerStatus={this.state.audioPlayerStatus}
                        setVoiceChannelStatus={this.props.setVoiceChannelStatus}
                    />
                )
            })
    
        }
        
        return(
            <VoiceChannelSectionWrapper id="voice_channels_wrapper">
                <Scrollbars
                    autoHide
                    autoHideTimeout={1500}
                    autoHideDuration={200}
                >
                    {voiceChannelRender}
                </Scrollbars>
            </VoiceChannelSectionWrapper>
        )   
    }
}