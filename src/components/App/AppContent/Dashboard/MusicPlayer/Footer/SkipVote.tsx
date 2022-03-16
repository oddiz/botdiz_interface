import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { IoPlaySkipForward } from 'react-icons/io5';
import { useRecoilValue } from 'recoil';
import { skipVoteDataState } from '../Atoms';
import { connectionState } from 'components/App/Atoms';
import { activeGuildState } from '../../Atoms';

const SkipVoteWrapper = styled.div`
    position: absolute;

    height: 110px;
    background: #2f3136;
    width: 250px;
    border-top: solid 1px #484848;
    border-left: solid 1px #484848;
    border-right: solid 1px #484848;

    left: calc(50% - 100px);
    top: -110px;

    display: flex;
    flex-direction: column;

    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
`;

const SkipButton = styled(IoPlaySkipForward)<{ buttoncolor: string }>`
    font-size: 3em;

    color: ${(props) => props.buttoncolor};

    padding-top: 4px;
    margin: 0 5px;

    cursor: pointer;

    &:hover {
        color: white;
    }

    &.disabled {
        cursor: not-allowed;
    }
`;

const SkipInfo = styled.div`
    text-align: center;
    color: white;
    height: 20px;
    font-size: 14px;

    margin-bottom: 10px;
`;

const Header = styled.div`
    width: 100%;
    font-size: 18px;
    font-weight: 600;
    text-align: center;

    color: white;
`;

const SkipContent = styled.div`
    display: flex;
    flex-direction: row;

    justify-content: center;
`;

const VoteInfo = styled.div`
    margin-top: 5px;
    color: white;
    font-size: 32px;
`;
export function SkipVote() {
    const skipVoteData = useRecoilValue(skipVoteDataState);
    const { websocket, token } = useRecoilValue(connectionState);
    const guildId = useRecoilValue(activeGuildState)?.id;

    const [voted, setVoted] = useState(false);

    function skipClicked() {
        if (voted) return; //already voted
        if (!guildId) return;

        const message = JSON.stringify({
            token: token,
            type: 'exec',
            command: 'RPC_skipSong',
            //should take 3 params: guildid
            params: [guildId, 1],
        });

        websocket?.send(message);
    }

    const websocketOnMessage = (message: MessageEvent) => {
        if (message.data.includes('RPC_skipSong')) {
            const parsedMessage = JSON.parse(message.data);
            if (parsedMessage.status === 'success') {
                setVoted(true);
            } else if (parsedMessage.status === 'failed') {
                if (parsedMessage.message === 'You already voted') {
                    setVoted(true);
                }
            }
        }
    };

    useEffect(() => {
        if (!websocket) return;

        websocket.addEventListener('message', websocketOnMessage);
        return () => {
            console.log('cleaning up websocket listener');
            websocket.removeEventListener('message', websocketOnMessage);
        };
    }, [websocket]);

    useEffect(() => {
        //reset voted status when vote is active
        setVoted(false);
    }, [skipVoteData.voteActive]);

    if (skipVoteData?.voteActive && skipVoteData.skipData) {
        const skipAmount = skipVoteData.skipData.skipAmount;
        const invokedUser = skipVoteData.skipData.invokedUser;
        const userData = skipVoteData.userData;
        if (!userData) return <></>;

        return (
            <SkipVoteWrapper>
                <Header id="skip_info_header">Skip vote in progress!</Header>
                <SkipInfo>
                    <em>
                        <b>{invokedUser.displayName}</b>
                    </em>{' '}
                    would like to skip{' '}
                    {skipAmount > 1 ? skipAmount + ' songs!' : 'this song.'}
                </SkipInfo>
                <SkipContent>
                    <SkipButton
                        onClick={skipClicked}
                        buttoncolor={voted ? '#bbdda2' : '#b3b3b3'}
                        className={voted ? 'disabled' : ''}
                    />
                    <VoteInfo>
                        {`${userData.votedUsers.length} / ${userData.voiceChannelMembers.length}`}
                    </VoteInfo>
                </SkipContent>
            </SkipVoteWrapper>
        );
    } else {
        return <div />;
    }
}
