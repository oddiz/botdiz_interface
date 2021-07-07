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
    height: calc(100% - var(--navbar-height));
    flex-grow: 1;
    background-color: #36393f;
`

class App extends React.Component {
    constructor(props) {
        super(props)
        
        
        this.state = {
            sessionActive: false,
            wsMessage: null,
            websocket: null,
            accountInfo: null,
            token: null
        };
        this.retryCounter = 0;
        
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
        this.setState({ websocket: ws })
    
       

        ws.onopen = () => {
            self.retryCounter = 0
            console.log("Connected to websocket")
            self.setState({ websocket: ws})
        }
    
        ws.onclose = (data) => {
            console.log("Socket is closed. Trying to reconnect")
            
            self.setState({ websocket: ws})
            if (self.retryCounter < 5) {
                self.retryCounter ++;
                self.setupWebsocket()
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
                <div className="app_wrapper">
                    <Navbar 
                        key={this.state.websocket?.readyState}
                        accountInfo={this.state.accountInfo} 
                        token={this.state.token}
                        setupWebsocket={this.setupWebsocket} 
                        websocket={this.state.websocket} 
                        />
                    <AppContent id="appcontent" key={Math.floor(Math.random()*10000)}>
                        <Switch>
                            <Route exact path="/app">
                                <Redirect to="/app/dashboard" />
                            </Route>
                            <Route exact path={["/app/dashboard", "/app/home"]}>
                                <Dashboard 
                                    key={this.state.websocket?.readyState}
                                    token={this.state.token} 
                                    websocket={this.state.websocket}
                                    wsMessage= {this.state.wsMessage} />
                            </Route>
                            <Route exact path="/app/preferences">
                                <Preferences />
                            </Route>
                            {/* IF NO PATH IS FOUND */}
                            <Route>
                                <Redirect to='/app/404' />
                            </Route>
                        </Switch>
                    </AppContent>
                        
                </div>
            </BrowserRouter>
        );
        
    }
}

export default App;
