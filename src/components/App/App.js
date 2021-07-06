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
            if(this.state.websocket){
                this.state.websocket.close()
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
        this.setState({ websocket: "connecting" })

        ws.onopen = () => {
            console.log("Connected to websocket")
            self.setState({ websocket: ws})
        }
        
        ws.onmessage = () => {
            console.log("this thing on???")
        }
    
        ws.onclose = () => {
            console.log("Socket is closed.")
            self.setState( { websocket: null })
        }
        
        

    }
    //const [token, setToken] = useState();
    render() {
        if (!this.state.sessionValidated) {
            return <Login />
        }
        
        if(!(this.state.websocket && this.state.websocket !== "connecting")) {
            return (
                <div></div>
            )
        }
        
            
        return (
            <BrowserRouter>
                <div className="app_wrapper">
                    <Navbar 
                        accountInfo={this.state.accountInfo} 
                        token={this.state.token}
                        setupWebsocket={this.setupWebsocket} 
                        websocket={this.state.websocket} 
                        />
                    <AppContent id="appcontent" key={Math.floor(Math.random()*10000)}>
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
                        
                </div>
            </BrowserRouter>
        );
        
    }
}

export default App;
