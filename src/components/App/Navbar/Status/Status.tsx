import React from 'react';
import styled from 'styled-components';
import { IoRefresh } from 'react-icons/io5';
import WebsocketStatus from './WebsocketStatus';
import AccountSection from './AccountSection/AccountSection';

const RefreshIcon = styled(IoRefresh)`
    margin: 0 5px;
    margin-left: 2px;
    margin-top: 3px;
    font-size: 1.5em;
    color: #757c89;
    transition: linear 0.2s all;
    &:hover {
        color: #ffffea;
    }
`;
const RefreshButtonWrapper = styled.div``;
const StatusWrapper = styled.div`
    height: 100%;
    padding: 0 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    transition: linear 0.2s all;
`;

interface StatusProps {
    setupWebsocket: () => void;
}
const Status = (props: StatusProps) => {
    const handleClick = (event: React.MouseEvent) => {
        const clicked = event.currentTarget.id;
        switch (clicked) {
            case 'settings_button':
                console.log('settings clicked');

                break;
            case 'refresh_button':
                props.setupWebsocket();

                break;
            default:
                break;
        }
    };

    return (
        <StatusWrapper>
            <WebsocketStatus />
            <RefreshButtonWrapper id="refresh_button" onClick={handleClick}>
                <RefreshIcon />
            </RefreshButtonWrapper>
            <AccountSection />
        </StatusWrapper>
    );
};

export default Status;
