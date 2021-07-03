import React from "react";
import config from '../../config'
import "./Login.css"
import '@dracula/dracula-ui/styles/dracula-ui.css'
import { Card, Text, Box, Input, Button, Heading} from '@dracula/dracula-ui'
import ReCAPTCHA from 'react-google-recaptcha'


async function loginUser(credentials) {
    return fetch(config.botdiz_server + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
    }).then(data => data)
}

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            loggedIn: false,
        }
        
        this.reCaptchaRef = React.createRef()
        this.reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITEKEY
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(event) {
        event.preventDefault();

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

        const responseBody = await response.json()

        if (response.status === 200) {
            console.log("Login successful")
            
            this.setState({loggedIn: true})
            window.location.reload()
        } else {
            this.setState({loginError: {status: response.status, message: responseBody.message }})
        }

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
                    p= "xxs"
                    m="md"
                    borderColor="pink"
                    
                    
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

                                Login
                            </Button>
                        </form>
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

