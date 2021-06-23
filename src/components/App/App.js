import React from 'react';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import './App.css';
import Dashboard from '../Dashboard/Dashboard';
import Preferences from '../Preferences/Preferences';
import Navbar from '../Navbar/Navbar'
import Login from '../Login/Login';
import config from '../../config'

class App extends React.Component {
    constructor(props) {
        super(props)
        console.log(config.botdiz_server + "/validate")
        
        this.state = {
            token: localStorage.getItem("token"),
            wsMessage: null
        };

        
        this.validateToken = this.validateToken.bind(this);
        this.getToken = this.getToken.bind(this);
        this.setToken = this.setToken.bind(this);
        this.setupWebsocket = this.setupWebsocket.bind(this);
    }

    componentDidMount() {
        
        
        //if there is token stored in local storage get it
        this.getToken()
            .catch(err => console.log(err, "Error while trying to get token."))
        this.setupWebsocket()
    }


    setupWebsocket() {
        const ws = new WebSocket('ws://localhost:8080')
        const self = this;

        ws.onopen = () => {
            console.log("Connected to websocket")
            self.setState({ ws: ws})
        }
    
        ws.onclose = () => {
            console.log("Socket is closed.")
        }
        
        ws.onmessage = (message) => {
            self.setState({ wsMessage: message })
        }

    }
    
/**
 * Validates the token on server and returns if validated or not.
 * @param {string} token 
 * @returns boolean
 */
    async validateToken(token) {
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
        } else {
            
            return (
                <div className="app_wrapper">
                    <BrowserRouter>
                        <Navbar />
                        <Switch>
                            <Route path="/dashboard">
                                <Dashboard wsMessage= {this.state.wsMessage} />
                            </Route>
                            <Route path="/preferences">
                                <Preferences />
                            </Route>
                        </Switch>
                    </BrowserRouter>
                </div>
            );
        }
    }
}

export default App;
