import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Dashboard from '../Dashboard/Dashboard';
import Preferences from '../Preferences/Preferences';
import Navbar from '../Navbar/Navbar'
import Login from '../Login/Login';
import config from '../../config'
import styled from 'styled-components'

const AppContent = styled.div`
    width: 100vw;
    flex-grow: 1;
    background-color: #36393f;
`

class App extends React.Component {
    constructor(props) {
        super(props)
        console.log(config.botdiz_server + "/validate")
        
        this.state = {
            token: localStorage.getItem("token"),
            wsMessage: null,
            websocket: null
        };

        
        this.validateToken = this.validateToken.bind(this);
        this.getToken = this.getToken.bind(this);
        this.setToken = this.setToken.bind(this);
        this.setupWebsocket = this.setupWebsocket.bind(this);
    }

    componentDidMount() {
        
        
        //if there is token stored in local storage get it
        this.getToken()
        //    .catch(err => console.log(err, "Error while trying to get token."))
        this.setupWebsocket()
    }


    setupWebsocket() {
        const ws = new WebSocket('ws://localhost:8080')
        const self = this;

        ws.onopen = () => {
            console.log("Connected to websocket")
            self.setState({ websocket: ws})
        }
        
        ws.onmessage = () => {
            console.log("this thing on???")
        }
    
        ws.onclose = () => {
            console.log("Socket is closed.")
        }
        
        

    }
    
/**
 * Validates the token on server and returns if validated or not.
 * @param {string} token 
 * @returns boolean
 */
    async validateToken(token) {
        return true
        return fetch(config.botdiz_server + "/validate", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => response.json())
        .then(responseJson => {
            return responseJson.isValidated
        }).catch(err => {
            console.log("Error while fetching validation: ", err)
            return false
        })

        
    }

    getToken() {
        
        return new Promise((resolve, reject) => {
            const token = localStorage.getItem("token");
            if (token) {
                this.validateToken(token).then(isValidated => {
                    if (isValidated) {
                        console.log("token is validated")
                        this.setState({ token: token })  //true or false
                        
                        resolve(token) 
                    } else {
                        console.log("token is not validated")
                        this.setState({ token: false })
                        
                        resolve(false)
                    }

                })
                .catch(err => {
                    reject("Error while trying to validate token: " + err)
                })
            
            }
            resolve(false)
        })
    }

    async setToken(token) {
        const isValidated = await this.validateToken(token)
        console.log(isValidated, "result from validate token")
        if (isValidated) {
            this.setState({token: token})
            localStorage.setItem("token", token)
            console.log("token updated", this.state)
        } else {
            this.setState({token: false})
        }
    }
    //const [token, setToken] = useState();
    render() {

        if(!this.state.token) {
            return <Login setToken={this.setToken} />
        }
        if(!this.state.websocket) {
            return (
                <div>
                    <h2>
                        Connecting to Websocket
                    </h2>
                </div>
            )
        }
            
        return (
            <div className="app_wrapper">
                <BrowserRouter>
                    <Navbar />
                    <AppContent key={Math.floor(Math.random()*10000)}>
                        <Switch>
                            <Route exact path="/">
                                <Redirect to="/dashboard" />
                            </Route>
                            <Route path={["/dashboard", "/home"]}>
                                <Dashboard 
                                    token={this.state.token} 
                                    websocket={this.state.websocket}
                                    wsMessage= {this.state.wsMessage} />
                            </Route>
                            <Route path="/preferences">
                                <Preferences />
                            </Route>
                        </Switch>
                    </AppContent>
                </BrowserRouter>
                
            </div>
        );
        
    }
}

export default App;
