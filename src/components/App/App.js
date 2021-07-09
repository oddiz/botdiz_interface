import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Dashboard from './Dashboard/Dashboard';
import Settings from './Settings/SettingsPage';
import Navbar from './Navbar/Navbar'
import Login from '../Login/Login';
import config from 'config'
import styled from 'styled-components'
import NotFoundPage from '../../404'

const AppWrapper = styled.div`
    width: 100vw;
    height: 100vh;
    
    display:flex;
    flex-direction: column;
    background-color: #36393f;
`
const AppContentWrapper = styled.div`
    flex-grow: 1;
    flex-shrink: 1;

    overflow-y: visible;
    overflow-x: hidden;

`;
let retryCounter = 0
class App extends React.Component {
    constructor(props) {
        super(props)
        
        
        this.state = {
            sessionActive: false,
            wsMessage: null,
            websocket: null,
            accountInfo: null,
            token: null,
        };
        
        this.validateSession = this.validateSession.bind(this);
        this.setupWebsocket = this.setupWebsocket.bind(this);

    }

    componentDidMount() {
        const self = this
        async function run() {
            await self.validateSession()
            //    .catch(err => console.log(err, "Error while trying to get token."))
            
            if(self.state.sessionValidated){
                self.setupWebsocket()
            }
        }
        run()
    }
    async validateSession() {
        
        const response = await fetch(config.botdiz_server + "/validate", {
            method: 'GET',
            credentials: 'include'
        }).then(data=>data)

        const responseBody = await response.json() 
        

        if (responseBody.isValidated) {
            this.setState(
                {
                    token: responseBody.token,
                    sessionValidated: true,
                    accountInfo: responseBody.accountInfo
                }
            )
        }

        return responseBody

    }

    setupWebsocket() {
        try {
            if(this.state.websocket.readyState === WebSocket.OPEN){
                this.state.websocket.close()

                return
            }
            console.log("Closed existing websocket")
        } catch (error) {
            //silently fail
        }
        if(this.state.websocket === "connecting") {
            //already trying to connect
            return
        }
        const ws = new WebSocket(config.botdiz_websocket_server)
        const self = this;
    
       

        ws.onopen = () => {
            retryCounter = 0
            console.log("Connected to websocket")
            self.setState({ websocket: ws})
        }
    
        ws.onclose = (data) => {
            console.log("Socket is closed. Trying to reconnect")
            
            //check for validation
            //if not validated reload the window so login page shows

            const response = this.validateSession()

            if (!response.isValidated) {
                window.location.reload()
            }
            self.setState({ websocket: ws})
            if (retryCounter < 5) {
                self.setupWebsocket()
                retryCounter += 1;
            } else {
                console.log("Tried to reconnect 5 times but failed. Reconnect manually.")
                return
            }
        }
        
        

    }
    //const [token, setToken] = useState();
    render() {
        if (!this.state.sessionValidated) {
            return <Login />
        }
        
        if(!(this.state.websocket?.readyState === WebSocket.OPEN)) {
            return (
                <div></div>
            )
        }
        
            
        return (
            <BrowserRouter>
                
                <AppWrapper id="app_wrapper" key={Math.floor(Math.random()*10000)}>
                    <Navbar 
                        key={this.state.websocket?.readyState+"_navbar"}
                        accountInfo={this.state.accountInfo} 
                        token={this.state.token}
                        setupWebsocket={this.setupWebsocket} 
                        websocket={this.state.websocket}
                        location={this.state.location} 
                        />

                    <AppContentWrapper id="app_content_wrapper">
                        <Switch>
                            <Route exact path="/app">
                                <Redirect to="/app/dashboard" />
                            </Route>
                            <Route exact path={["/app/dashboard", "/app/home"]}>
                                <Dashboard 
                                    key={this.state.websocket?.readyState}
                                    token={this.state.token} 
                                    websocket={this.state.websocket}
                                    wsMessage= {this.state.wsMessage} 
                                />
                            </Route>
                            <Route path="/app/settings" render={(props) => 
                                <Settings 
                                    accountInfo={this.state.accountInfo}
                                    token={this.state.token}
                                    {...props}
                                />
                            }>
                            </Route>
                            <Route exact path="/404">
                                <NotFoundPage />
                            </Route>
                            {/* IF NO PATH IS FOUND */}
                            <Route>
                                <Redirect to='/404' />
                            </Route>
                        </Switch>
                    </AppContentWrapper>
                </AppWrapper>
                        
            </BrowserRouter>
        );
        
    }
}

export default App;
