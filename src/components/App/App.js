import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import Dashboard from './AppContent/Dashboard/Dashboard';
import MyGuilds from './AppContent/MyGuilds/MyGuilds'
import Settings from './AppContent/Settings/SettingsPage';
import Navbar from './Navbar/Navbar'
import Login from '../Login/Login';
import config from 'config'
import styled from 'styled-components'
import NotFoundPage from '../../404'
import ConnectionContext from './ConnectionContext';
import BotdizStats from './AppContent/BotdizStats/BotdizStats';
import { ToastContainer } from 'react-toastify';

const AppWrapper = styled.div`
    width: 100%;
    height: 100vh;

    
    display:flex;
    flex-direction: column;
    background-color: #36393f;
`
const AppContentWrapper = styled.div`
    flex-grow: 1;
    flex-shrink: 1;
    min-height: 250px;

    overflow-y: visible;
    overflow-x: hidden;

    display: flex;
    flex-direction: row;
    justify-content: center;

`;
let retryCounter = 0
class App extends React.Component {
    constructor(props) {
        super(props)
        
        
        this.state = {
            sessionValidated: false,
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
            
            ws.onmessage = (message) => {
                let parsedMessage
                try {
                parsedMessage = JSON.parse(message.data)
                    
                } catch (error) {
                    console.log("error while trying to parse ws message on App.js")
                }

                if (parsedMessage.status === "error" && parsedMessage.message === "already connected") {
                    self.setState({alreadyConnected: true})
                }
            }
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
        if(this.state.alreadyConnected) {
            return(
                <div 
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }} 
                >
                    <div 
                        style= {{
                            width: "80%",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "center",
                            paddingTop: "50px"
                        }}
                    >
                        <span style={{fontSize:"64px", marginBottom: "20px"}}>
                            ⛔
                        </span>
                        <span style={{fontSize: "36px", color: "var(--red)"}}>
                            You are already connected to Dashboard on another window or tab!
                        </span>
                    </div>
                </div>
            )
        }
        
            
        return (
            <BrowserRouter>
            
                <ToastContainer 
                    position="top-center"
                    autoClose={3000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <ConnectionContext.Provider value={{
                    websocket: this.state.websocket,
                    token: this.state.token
                }} >

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
                                <Route exact path={["/app/dashboard", "/app/home"]}>
                                    <Dashboard 
                                        key={this.state.websocket?.readyState}
                                        token={this.state.token} 
                                        websocket={this.state.websocket}
                                        wsMessage= {this.state.wsMessage}
                                        accountInfo={this.state.accountInfo} 
                                    />
                                </Route>
                                <Route path="/app/myguilds">
                                    <MyGuilds 
                                        token={this.token}
                                        websocket={this.websocket}
                                        accountInfo={this.state.accountInfo} 
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
                                <Route path="/app/stats">
                                    <BotdizStats 
                                        websocket = {this.state.websocket}
                                        token={this.state.token}
                                    />
                                </Route>
                                <Route exact path="/app">
                                    <Redirect to='/app/dashboard' />
                                </Route>
                                <Route exact path="/404">
                                    <NotFoundPage />
                                </Route>
                                <Route>
                                    {/* IF NO PATH IS FOUND */}
                                    <Redirect to='/404' />
                                </Route>
                            </Switch>
                        </AppContentWrapper>
                    </AppWrapper>
                        
                </ConnectionContext.Provider>
            </BrowserRouter>
        );
        
    }
}

export default App;
