import React from 'react'
import styled from 'styled-components';
import { Button } from '@dracula/dracula-ui'
import config from '../../../../../config'
const AddUserInput = styled.input`
    width: 50%;
    height: 30px;

    background-color: #5D626D;
`;
const InputSection = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 1em;
    
`;

const AddUserWrapper = styled.div`
    display: flex;
    flex-direction: column;

    color: white;
  
`;
export default class AddUser extends React.Component {
    constructor(props) {
        super(props)

        this.state= {
            username: "",
            password: ""
        }

        this.token = props.token
    }
    handleAddUserSubmit = async () => {
        
        this.setState({
            username: "a",
            password: "a"
        })
        if (this.state.password.length < 32) {
            console.log("password must be at least 32 characters long")
            return
        }
        
        
        console.log(this.state, this.state.password, this.token)
        const response = await fetch(config.botdiz_server+"/addsuperuser", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({
                token: this.token,
                username: this.state.username,
                password: this.state.password,
                avatarURL: this.state.avatarURL
            })

        })
        .then(res=> res.json())
        .then(data => data)
        .catch(err => console.log("error while sending fetch to addsuperuser", err))

        console.log(response)
        this.setState({addUserResponse: response})
    }
    render() {
        return(
            <AddUserWrapper>

                {this.state.addUserResponse && <h3 style={{color: this.state.addUserResponse.isSuccessful? "var(--green)": "var(--red)"}}> {this.state.addUserResponse.message}</h3>}

                <InputSection>
                    Username
                    <AddUserInput onChange={(evt) => {
                        this.setState({username: evt.target.value})
                    }} 
                    />
                </InputSection>

                <InputSection>
                    Password
                    <AddUserInput onChange={(evt) => {this.setState({password: evt.target.value})}}/>
                </InputSection>
                
                <InputSection>
                    Avatar URL
                    <AddUserInput onChange={(evt) => {this.setState({avatarURL: evt.target.value})}}/>
                </InputSection>
                <Button 
                    color = "green"
                    size= "md"
                    mt="md"
                    style={{width: "10em"}}
                    onClick={this.handleAddUserSubmit}
                >
                    Add User
                </Button>
            </AddUserWrapper>
        )
    }
}