import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { config } from '../../config';
import LoadingGear from './Gear-0.2s-200px.svg';

const SpotifyCallbackWrapper = styled.div`
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
`;
const ErrorText = styled.span`
    color: var(--red);
    font-family: 'Fira Code';
    font-size: 22px;
`;
const SuccessText = styled.span`
    color: #00b85f;
    font-family: 'Fira Code';
    font-size: 22px;
`;

const SpotfiyCallback = () => {
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function getSpotifyPlaylists() {
            const authCode = new URLSearchParams(window.location.search).get(
                'code',
            );

            const redirectURI =
                window.location.origin + window.location.pathname;

            if (!authCode) {
                console.log('No code available.');
                setError(true);
                setErrorMessage(
                    'No code provided. Please use the spotify button inside music player.',
                );

                return;
            }
            const response = await fetch(config.botdiz_server + '/playlists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    code: authCode,
                    redirect_uri: redirectURI,
                }),
            }).then((data) => data);

            const parsedResponse = await response.json();

            if (parsedResponse.status === 'success') {
                setSuccess(true);
                setSuccessMessage(parsedResponse.message);
            } else if (parsedResponse.status === 'error') {
                setError(true);
                setErrorMessage(parsedResponse.message);
            }
        }

        getSpotifyPlaylists();
    }, []);

    if (error) {
        return (
            <SpotifyCallbackWrapper>
                <ErrorText>{errorMessage}</ErrorText>
            </SpotifyCallbackWrapper>
        );
    }

    if (success) {
        return (
            <SpotifyCallbackWrapper>
                <SuccessText>
                    {successMessage}. Close this window and refresh dashboard
                </SuccessText>
            </SpotifyCallbackWrapper>
        );
    }

    return (
        <SpotifyCallbackWrapper>
            <LoadingGearIcon src={LoadingGear} />
            <LoadingText>Getting playlists from Spotify</LoadingText>
        </SpotifyCallbackWrapper>
    );
};

export default SpotfiyCallback;
