import React from 'react'
import styled from 'styled-components'
import {IoRefresh, IoSettings} from 'react-icons/io5'

const SettingsIcon = styled(IoSettings)`
    
    font-size:2.5em;
    color: #757C89;
    margin: 0 5px;
    transition: linear 0.2s all;
    &:hover {
        color: #ffffea
    }
`
const SettingsButtonWrapper = styled.div`

`
function SettingsButton(props) {
    return (
        <SettingsButtonWrapper id="settings_button" onClick={props.onClick}>
            <SettingsIcon />
        </SettingsButtonWrapper>
    )
}

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
function WebsocketStatus(props) {
    let color = props.websocket? "#8aff80" : "#FF5230"
    
    if(props.websocket === "connecting"){
        color = "#ffff80"
    }
    
    return(
        <WebsocketStatusWrapper>
            <WebsocketStatusText>Websocket:</WebsocketStatusText>
            <WebsocketStatusIcon color={color} />
        </WebsocketStatusWrapper>
    )
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
                <WebsocketStatus id="websocket_status" websocket={this.websocket} />
                <RefreshButton onClick={this.handleClick} id="refresh_btton" />
                <SettingsButton onClick={this.handleClick} id="settings_button" />
            </StatusWrapper>
        )
    }
}