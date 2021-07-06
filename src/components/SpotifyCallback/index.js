import React from 'react'
import styled from 'styled-components'
import config from '../../config'
import LoadingGear from './Gear-0.2s-200px.svg'

const SpotfiyCallbackWrapper = styled.div`
    height: 100%;
    width: 100%;

    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const LoadingGearIcon = styled.img`
    height:70px;
    width: 70px;


`
const LoadingText = styled.span`
    color: white;
    font-family:"Fira Code";
    font-size: 22px;
`
const ErrorText = styled.span`
    color: var(--red);
    font-family:"Fira Code";
    font-size: 22px;
`
const SuccessText = styled.span`
    color: #00b85f;
    font-family:"Fira Code";
    font-size: 22px;
`
export default class SpotfiyCallback extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            working: true,
            success: false,
            successMessage: "",
        }
    }

    async componentDidMount() {

        const authCode = new URLSearchParams(window.location.search).get("code")

        
        const redirectURI = window.location.origin + window.location.pathname

        if (!authCode){
            console.log("No code available.")
            this.setState({error: {
                text:"No code provided. Please use the spotify button inside music player."
            }})
            return
        }
        const response = await fetch(config.botdiz_server + '/playlists', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                code: authCode,
                redirect_uri: redirectURI
            })
        }).then(data => data)
        
        const parsedResponse = await response.json()

        console.log(parsedResponse)
        if (parsedResponse.status === "success") {
            this.setState({success: true, successMessage: parsedResponse.message})
        } else if (parsedResponse.status === "error") {
            this.setState({error: {
                text: parsedResponse.message
            }})
        }

    }




    render() {

        if(this.state.error) {
            return(
                <SpotfiyCallbackWrapper>
                    <ErrorText>
                        {this.state.error.text}
                    </ErrorText>
                </SpotfiyCallbackWrapper>
            )
        }

        if(this.state.success) {

            return(
                <SpotfiyCallbackWrapper>
                    <SuccessText>
                        {this.state.successMessage} 
                    </SuccessText>
                </SpotfiyCallbackWrapper>
            )
        }

        return(
            <SpotfiyCallbackWrapper>
                <LoadingGearIcon src={LoadingGear} />
                <LoadingText>
                    Getting playlists from Spotify
                </LoadingText>
            </SpotfiyCallbackWrapper>
        )
    }
}