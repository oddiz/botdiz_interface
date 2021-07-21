import React from 'react'
import styled from 'styled-components'
import config from '../../config'
import LoadingGear from './Gear-0.2s-200px.svg'

const DiscordCallbackWrapper = styled.div`
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

    
    overflow-wrap: break-word;
`
const ErrorText = styled.span`
    color: var(--red);
    font-family:"Fira Code";
    font-size: 22px;

    padding: 0 10%;

    text-align: center;
`
const SuccessText = styled.span`
    color: #00b85f;
    font-family:"Fira Code";
    font-size: 22px;
`
const SaveMeButton = styled.a`
    display:flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    margin-top: 50px;

    color: #202225;
    font-size: 30px;
    font-weight: 700;
    height: 50px;
    width: 200px;

    background: linear-gradient(var(--gradientDegree),var(--green) 0% ,var(--yellow) 50%,var(--pink) 100%);
    background-size: 200% 100%;

    border-radius: 8px;

    cursor:pointer;

    text-decoration: none;

    transition: linear 0.2s all;
    
    &:hover{
        background-position-x: 100%;
    }

`
export default class DiscordCallback extends React.Component {
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
                text:"No code provided"
            }})
            return
        }
        const response = await fetch(config.botdiz_server + '/discordlogin', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                code: authCode,
            })
        }).then(data => data)
        
        const parsedResponse = await response.json()

        console.log(parsedResponse)
        if (parsedResponse.result === "OK") {
            this.setState({success: true, successMessage: "Login successful"})
            let botdizUrl;
            if (process.env.NODE_ENV === "development") {
                botdizUrl = "http://localhost:3000/app"
            } else {
                botdizUrl = "https://botdiz.kaansarkaya.com/app"
            }
            window.open(botdizUrl,"_self")
        } else if (parsedResponse.status === "error") {
            this.setState({error: {
                text: parsedResponse.message
            }})
        }

    }


    handleSaveMe = async () => {
        let botdizUrl;
            if (process.env.NODE_ENV === "development") {
                botdizUrl = "http://localhost:3000/app"
            } else {
                botdizUrl = "https://botdiz.kaansarkaya.com/app"
            }
            window.open(botdizUrl,"_self")
    }

    render() {

        if(this.state.error) {
            return(
                <DiscordCallbackWrapper>
                    <ErrorText style={{"word-break": "keep-all"}}>
                        Failed to login via Discord. Try again later. 
                        <br />Contact oddiz if issue persists
                    </ErrorText>
                    <SaveMeButton onClick={this.handleSaveMe}>
                        Retry
                    </SaveMeButton>
                </DiscordCallbackWrapper>
            )
        }

        if(this.state.success) {

            return(
                <DiscordCallbackWrapper>
                    <SuccessText>
                        {this.state.successMessage} You can now close this window. 
                    </SuccessText>
                    
                </DiscordCallbackWrapper>
            )
        }

        return(
            <DiscordCallbackWrapper>
                <LoadingGearIcon src={LoadingGear} />
                <LoadingText>
                    Logging in with Discord
                </LoadingText>
            </DiscordCallbackWrapper>
        )
    }
}