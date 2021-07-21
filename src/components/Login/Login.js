import React from "react";
import config from '../../config'
import "./Login.css"
import '@dracula/dracula-ui/styles/dracula-ui.css'
import { Card, Text, Box, Input, Button, Heading} from '@dracula/dracula-ui'
import ReCAPTCHA from 'react-google-recaptcha'
import LoadingIcon from './loading.svg'
import DiscordIcon from './dclogo.svg'
import styled from 'styled-components';


async function loginUser(credentials) {
    return fetch(config.botdiz_server + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
    })
    .then(reply => reply.json())
    .then(data => data)
    .catch(err => err)
}
const LoadingIconWrapper = styled.img`
    height: 100%;
`;
const LoginWithDiscord = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    height: 40px;
    width: 308px;

    margin-top: 0.3em;
    margin-left: 3px;

    border-radius: 0.5em;
    background: #5865f2;

    font-weight: 700;
    color: white;

    cursor: pointer;

    &:hover {
        background: #7983f5;
    }
`
const LoginWithDiscordIcon = styled.img`
    height: 70%;
    margin-right: 0.8em;
` 
export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            loggedIn: false,
            loading: false
        }
        
        this.reCaptchaRef = React.createRef()
        this.reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITEKEY
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(event) {
        event.preventDefault();
        if(this.state.loading) {
            console.log("Already trying to log in")

            return
        }
        this.setState({loading: true, loginError: null})

        const reCaptchaToken = await this.reCaptchaRef.current.executeAsync()

        const credentials = {
            username: this.state.username,
            password: this.state.password,
            reCaptchaToken: reCaptchaToken
        }

        if (!(credentials.username && credentials.password)){
            this.setState({loginError: {status: 404, message: "Cannot leave username or password empty"}})

            return
        }
        const response = await loginUser(credentials);
        console.log(response)
        if (response.result === "OK") {
            console.log("Login successful")
            
            this.setState({loggedIn: true})
            window.location.reload()
        } else {
            this.setState({loginError: {status: response.status, message: response.message }, loading: false})

        }

    }

    handleDiscordLogin = async () => {
        console.log("discord")
        let discordUrl;
        if (process.env.NODE_ENV === "development") {
            discordUrl= "https://discord.com/api/oauth2/authorize?client_id=857957046297034802&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdiscordlogin&response_type=code&scope=identify%20email%20guilds"
        } else {
            discordUrl= "https://discord.com/api/oauth2/authorize?client_id=851497395190890518&redirect_uri=https%3A%2F%2Fbotdiz.kaansarkaya.com%2Fdiscordlogin&response_type=code&scope=identify%20email%20guilds"
        }
        window.open(discordUrl,"_self")
    }


    render() {
        function renderError(self){
            if(self.state.loginError) {
                return (
                <Card variant="subtle" color="pink" p="md" mt="md">
                    <Text color="pink">{self.state.loginError.message}</Text>
                </Card>
                )
            }
        }

        
        return(
            <div className="login_wrapper">
                {renderError(this)}
                <Box
                    variant="subtle"
                    color="purpleCyan"
                    rounded="lg"
                    as="div"
                    height="auto"
                    width="sm"
                    m="md"
                    borderColor="pink"
                    style={{
                        padding:"3px"
                    }}
                    
                >
                    <Box
                        style={{backgroundColor: "#1d1e26"}}
                        className="drac-black-secondary"
                        p="md"
                        color=""
                        rounded="lg"
                        as="div"
                        height="full"
                        width="auto"
                    >
                        <Heading 
                            m="xxs"
                            style={{
                                marginBottom: "1.2em",
                            }}
                        >
                            Botdiz Login
                        </Heading>
                        <form onSubmit={this.handleSubmit} style={{display: "flex", flexDirection: "column"}}>
                                <Input
                                    color="purple"
                                    variant="normal"
                                    borderSize="md"
                                    placeholder="Username"
                                    m="xxs"
                                    style={{marginLeft:0}}
                                    onChange={(input) => {
                                        this.setState({username: input.target.value})
                                        }}
                                />                                  
                                <Input
                                    borderSize="md"
                                    color="purple"
                                    variant="normal"
                                    placeholder="Password"
                                    style={{marginLeft:0}}
                                    m="xxs"
                                    onChange={(input) => {
                                        this.setState({password: input.target.value})
                                        }}
                                    type="password"
                                />
                            <Button
                                type="submit" 
                                color="animated" 
                                mt="md"
                                style={
                                    {
                                        marginLeft:0, 
                                        width: "308px", 
                                        alignSelf: "center"
                                    }
                                }
                                
                                onClick={() => {
                                    
                                }}
                            >

                                {this.state.loading ? <LoadingIconWrapper src={LoadingIcon} alt="loading_icon" /> : "Login"}
                            </Button>
                        </form>
                        <LoginWithDiscord
                            onClick={this.handleDiscordLogin}
                        >
                            <LoginWithDiscordIcon src={DiscordIcon} />
                            Login With Discord
                        </LoginWithDiscord>
                    </Box>
                
                
                </Box>
                <ReCAPTCHA
                    style={{display: "inline-block"}}
                    theme="dark"
                    size="invisible"
                    ref={this.reCaptchaRef}
                    sitekey={this.reCaptchaKey}

                />
            </div>
        )
    }
}

