import React from 'react'
import styled from 'styled-components'
import {IoRefresh} from 'react-icons/io5'
import CountUp from 'react-countup';

import AccountSection from './AccountSection'
const WebsocketStatusIcon = styled.span`
    height: 10px;
    width: 10px;

    margin: 0 5px;
    border: 1px solid white;
    border-radius: 10px;
    margin-top: 2px;
    transition: linear 0.2s all;
    background-color: ${props => props.color};
`
const WebsocketStatusWrapper = styled.div`
    height: 100%;
    display:flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`
const WebsocketStatusText = styled.p`
    font-family: "Fira Code";
    margin: 0 5px;
    color: #ffffea;
    font-size:16px;
`
class WebsocketStatus extends React.Component {
    constructor (props) {
        super(props) 
        this.state = {
            lastSentPingTime: 0,
            latency: 0,
            lastLatency: 0
        }
        this.indicatorColor = props.websocket?.readyState === WebSocket.OPEN? "#8aff80" : "#FF5230"
        
        if(this.props.websocket?.readyState === WebSocket.CONNECTING){
            this.indicatorColor = "#ffff80"
        }

        this.websocket = props.websocket

        this.pingListener = this.pingListener.bind(this)
    }

    ping = () => {
        this.websocket.send(JSON.stringify({
            type:"ping"
        }))
        if(this._isMounted) {
            this.setState({lastSentPingTime: new Date().getTime()})
        }
    }

    pingListener(reply) {
        try {
            const parsedReply = JSON.parse(reply.data)

            if (parsedReply.event === "pong") {
                const latency = new Date().getTime() - this.state.lastSentPingTime
                if(this._isMounted) {
                    this.setState(
                        {
                            lastLatency: this.state.latency,
                            latency: latency > 1000? 999 : latency
                        }
                    )
                }
            }

        } catch (error) {
            console.log(error)
        }
    }
    
    componentDidMount() {
        this._isMounted = true
        if (this.websocket.readyState === WebSocket.OPEN) {
            this.pingInterval = setInterval(this.ping, 2000)
            this.websocket.addEventListener("message", this.pingListener)
        }

    }

    componentWillUnmount() {
        this._isMounted = false
        if (this.websocket) {
            this.websocket.removeEventListener("message", this.pingListener)
            clearInterval(this.ping)
        }

    }
     
    
    render() {
        return(
            <WebsocketStatusWrapper>
                <WebsocketStatusText>
                    <CountUp 
                        start={this.state.lastLatency}
                        end={this.state.latency}
                        duration={0.5}
                    /> ms
                </WebsocketStatusText>
                <WebsocketStatusIcon color={this.indicatorColor} />
            </WebsocketStatusWrapper>
        )

    }
}

const RefreshIcon = styled(IoRefresh)`
    margin: 0 5px;
    margin-left:2px;
    margin-top:3px;
    font-size:1.5em;
    color: #757C89;
    transition: linear 0.2s all;
    &:hover {
        color: #ffffea
    }
    
`
const RefreshButtonWrapper = styled.div`
    
    
`
function RefreshButton(props) {

    return (
        <RefreshButtonWrapper id="refresh_button" onClick={props.onClick}>
            <RefreshIcon />
        </RefreshButtonWrapper>
    )
}

const StatusWrapper = styled.div`
    height: 100%;
    padding: 0 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    transition: linear 0.2s all;
`
export default class Status extends React.Component {
    constructor(props) {
        super (props)

        this.websocket = props.websocket
        this.setupWebsocket = props.setupWebsocket

        this.account = props.account

        this.handleClick = this.handleClick.bind(this)
    }
 
    handleClick(event) {
        const clicked = event.currentTarget.id
        switch (clicked) {
            case "settings_button":
                console.log("settings clicked")
                
                break;
            case "refresh_button":
                this.setupWebsocket()

                break
            default:
                break;
        }

    }

    render() {
        return(
            <StatusWrapper >
                <WebsocketStatus key={this.websocket} id="websocket_status" websocket={this.websocket} />
                <RefreshButton onClick={this.handleClick} id="refresh_btton" />
                <AccountSection menuItemClicked={this.props.menuItemClicked} token={this.props.token} onClick={this.handleClick} account={this.account} id="account_section" />
            </StatusWrapper>
        )
    }
}