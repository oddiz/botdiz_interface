import { DISCORD_LOGIN_URL } from 'components/Login/Login';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { config } from '../../config';
import LoadingGear from './Gear-0.2s-200px.svg';

const DiscordCallbackWrapper = styled.div`
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;
const LoadingGearIcon = styled.img`
    height: 70px;
    width: 70px;
`;
const LoadingText = styled.span`
    color: white;
    font-family: 'Fira Code';
    font-size: 22px;

    overflow-wrap: break-word;
`;
const ErrorText = styled.span`
    color: var(--red);
    font-family: 'Fira Code';
    font-size: 22px;

    padding: 0 5%;
    margin: 10px 0;
    text-align: center;
    word-break: keep-all;
`;
const SuccessText = styled.span`
    color: #00b85f;
    font-family: 'Fira Code';
    font-size: 22px;
`;
const SaveMeButton = styled.a`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    margin-top: 50px;

    color: #202225;
    font-size: 30px;
    font-weight: 700;
    height: 50px;
    width: 200px;

    background: linear-gradient(
        var(--gradientDegree),
        var(--green) 0%,
        var(--yellow) 50%,
        var(--pink) 100%
    );
    background-size: 200% 100%;

    border-radius: 8px;

    cursor: pointer;

    text-decoration: none;

    transition: linear 0.2s all;

    &:hover {
        background-position-x: 100%;
    }
`;
export const DiscordCallback: React.FC = () => {
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const DiscordCallbackInit = async () => {
        const authCode = new URLSearchParams(window.location.search).get(
            'code',
        );

        if (!authCode) {
            console.log('No code available.');
            setError(true);
            setErrorMessage('No code available.');

            return;
        }
        const response = await fetch(config.botdiz_server + '/discordlogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                code: authCode,
            }),
        }).then((data) => data);

        const parsedResponse = await response.json();

        console.log(parsedResponse);
        if (parsedResponse.result === 'success') {
            setSuccess(true);
            setError(false);
            setSuccessMessage('Login successful');
            window.opener.postMessage({
                event: 'discord_login',
                result: 'success',
                message: 'Login successful',
            });
            window.close();

            //window.open(botdizUrl, '_self');
        } else if (parsedResponse.status === 'error') {
            setSuccess(false);
            setError(true);
            setErrorMessage(parsedResponse.message);
            window.opener.postMessage({
                event: 'discord_login',
                result: 'failed',
                message: parsedResponse.message,
            });
        }
    };
    useEffect(() => {
        DiscordCallbackInit();
    }, []);

    const handleSaveMe = async () => {
        window.open(DISCORD_LOGIN_URL, '_self');
    };

    if (error) {
        return (
            <DiscordCallbackWrapper>
                <ErrorText>Failed to login via Discord.</ErrorText>

                <ErrorText>Contact oddiz if issue persists</ErrorText>

                <SaveMeButton onClick={handleSaveMe}>Retry</SaveMeButton>
            </DiscordCallbackWrapper>
        );
    }

    if (success) {
        return (
            <DiscordCallbackWrapper>
                <SuccessText>{successMessage}</SuccessText>
            </DiscordCallbackWrapper>
        );
    }

    return (
        <DiscordCallbackWrapper>
            <LoadingGearIcon src={LoadingGear} />
            <LoadingText>Logging in with Discord</LoadingText>
        </DiscordCallbackWrapper>
    );
};
