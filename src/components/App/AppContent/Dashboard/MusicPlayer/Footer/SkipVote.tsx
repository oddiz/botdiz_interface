import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { IoPlaySkipForward } from 'react-icons/io5'
import { shortenString } from 'components/helpers';


const SkipVoteWrapper = styled.div`

    position: absolute;

    height:110px;
    background: #2f3136;
    width: 250px;
    border-top: solid 1px #484848;
    border-left: solid 1px #484848;
    border-right: solid 1px #484848;

    left: calc(50% - 100px );
    top: -110px;

    display: flex;
    flex-direction: column;

    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
`

const SkipButton = styled(IoPlaySkipForward)`
    font-size: 3em;

    color: ${props => props.buttoncolor};

    padding-top: 4px;
    margin: 0 5px;
    
    cursor: pointer;

    &:hover {
        color: white;
    }

    &.disabled {
        cursor: not-allowed;
    }
`

const SkipInfo = styled.div`
    text-align: center;
    color: white;
    height: 20px;
    font-size: 14px;

    margin-bottom: 10px;
`

const Header = styled.div`
    width: 100%;
    font-size: 18px;
    font-weight: 600;
    text-align: center;

    color: white;
`


const SkipContent = styled.div`
    display: flex;
    flex-direction: row;
    
    justify-content: center;
`;

const VoteInfo = styled.div`
    margin-top: 5px;
    color: white;
    font-size: 32px;
`
export function SkipVote (props) {
    const data = props.skipVoteData
    
    /* 
    data = 
    {
        voteActive: true,
        skipData: {
            currentSong: Shoukaku track Object,
            skipAmount: int,
            invokedUser: {user object}
        },
        skipVoteData: {
            voiceChannelMembers: [
                {
                    tag: "oddiz#1231",
                    username: "oddiz",
                    id: "123123123123",

                },
                {...},
                {...}
            ],
            votedUsers: ["123123123123",]
        },
        
    }
    
    */
   
   const [voted, setVoted] = useState(false) 
    function skipClicked () {
        if(voted) {
            //already voted
            return
        }
        const message = JSON.stringify({
            token: props.token,
            type: "exec",
            command: "RPC_skipSong",
            //should take 3 params: guildid
            params: [props.guildId, 1]
        })

        props.websocket.send(message)
    }

    const websocketOnMessage = (message) => {
        if(message.data.includes("RPC_skipSong")) {
            const parsedMessage = JSON.parse(message.data)
            if(parsedMessage.status === "success") {
                setVoted(true)
            } else if (parsedMessage.status === "failed") {
                if(parsedMessage.message === "You already voted") {
                    setVoted(true)
                }
            }

            
        }
    }

    
    useEffect(() => {
        props.websocket.addEventListener("message", websocketOnMessage)
        return () => {
            console.log("cleaning up websocket listener")
            props.websocket.removeEventListener("message", websocketOnMessage)
        }
    }, [props.websocket])

    useEffect(() => {
        //reset voted status when vote is active
        setVoted(false)
    }, [data?.voteActive])
    
    if(data?.voteActive && data.skipVoteData) {
        return(
            <SkipVoteWrapper>
                <Header id="skip_info_header">
                    Skip vote in progress!
                </Header>
                <SkipInfo>
                    <em><b>{data.skipData.invokedUser.displayName}</b></em> would like to skip {data.skipData.skipAmount > 1? data.skipData.skipAmount+ " songs!": "this song."}
                </SkipInfo>
                <SkipContent>
                            
                    <SkipButton 
                        onClick={skipClicked}
                        buttoncolor={voted ? "#bbdda2": "#b3b3b3"}
                        className={voted ? "disabled": ""}
                    />
                    <VoteInfo>
                        {`${data.skipVoteData.votedUsers.length} / ${data.skipVoteData.voiceChannelMembers.length}`}
                    </VoteInfo>
                </SkipContent>
            </SkipVoteWrapper>
        )
    } else {
        return (<div/>)
    }

}