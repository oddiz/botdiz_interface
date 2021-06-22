import React from "react";
import PropTypes from "prop-types"
import config from '../../config'

import "./Login.css"


async function loginUser(credentials) {
    return fetch(config.botdiz_server + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    }).then(data => data.json())
}

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
        }
        
        this.setToken = props.setToken
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const response = await loginUser({
            username: this.state.username,
            password: this.state.password
        });
        this.setToken(response.token)

    }

    render() {
        return(
            <div className="login_wrapper">
                <h1>You need to login</h1>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        <p>Username</p>
                        <input type="text" onChange={(input) => {
                            this.setState({username: input.target.value})
                            }}/>
                    </label>
                    <label>
                        <p>Password</p>
                        <input type="password" onChange={(input) => {
                            this.setState({password: input.target.value})
                            }} />
                    </label>
                    <div>
                        <button type="submit" onClick={() => {
                            
                        }}>Submit</button>
                    </div>
                </form>
            </div>
        )
    }
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
}