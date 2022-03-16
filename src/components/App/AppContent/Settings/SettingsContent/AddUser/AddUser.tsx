import { useState } from 'react'
import styled from 'styled-components';
import { Button } from '@dracula/dracula-ui'
import {config} from 'config'
import { useRecoilValue } from 'recoil';
import { connectionState } from 'components/App/Atoms';
const AddUserInput = styled.input`
    box-sizing: border-box;
    width: 50%;
    height: 40px;

    font-size: 18px;

    background-color: #5D626D;
    color: white;
    caret-color: white;
    
    outline:none;
    border: none;
    border-radius: 5px;

    padding-left: 0.5em;

    &:focus {
    }
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

interface AddSuperUserReply {
    status: 'success' | 'failed' |"unauthorized";
    message: string;
}
const AddUser = () => {

    const { token } = useRecoilValue(connectionState);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [ avatarURL, setAvatarURL] = useState("");
    const [ addUserResponse, setAddUserResponse] = useState<AddSuperUserReply | null>(null)


    const handleAddUserSubmit = async () => {

        if (password.length < 32) {
            console.log("password must be at least 32 characters long")
            return
        }
        
        
        const response: AddSuperUserReply | void = await fetch(config.botdiz_server+"/addsuperuser", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({
                token: token,
                username: username,
                password: password,
                avatarURL: avatarURL
            })

        })
        .then(res=> res.json())
        .catch(err => console.log("error while sending fetch to addsuperuser", err))

        if(!response) return
        console.log(response)

        setAddUserResponse(response)
        setUsername("")
        setPassword("")
    }
    return(
        <AddUserWrapper>

            {addUserResponse && <h3 style={{color: addUserResponse.status === "success"? "var(--green)": "var(--red)"}}> {addUserResponse.message}</h3>}

            <InputSection>
                Username
                <AddUserInput onChange={(evt) => {
                    setUsername(evt.target.value)
                }} 
                />
            </InputSection>

            <InputSection>
                Password
                <AddUserInput onChange={(evt) => {setPassword(evt.target.value)}}/>
            </InputSection>
            
            <InputSection>
                Avatar URL
                <AddUserInput onChange={(evt) => {setAvatarURL(evt.target.value)}}/>
            </InputSection>
            <Button 
                color = "green"
                size= "md"
                mt="md"
                style={{width: "10em"}}
                onClick={handleAddUserSubmit}
            >
                Confirm
            </Button>
        </AddUserWrapper>
    )
}

export default AddUser