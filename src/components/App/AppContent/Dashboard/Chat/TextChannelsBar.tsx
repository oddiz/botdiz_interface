import React, { useEffect } from 'react';
import { connectionState } from 'components/App/Atoms';
import Scrollbars from 'react-custom-scrollbars';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { activeGuildState } from '../Atoms';
import {
    activeTextChannelState,
    ChatPageErrorMessageState,
    guildTextChannelsState,
} from './Atoms';

const TextChannelWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    padding: 10px 0;
    color: #72767d;

    margin: 0 2px;
    border-radius: 4px;

    cursor: pointer;

    &:hover {
        color: #dcddde;
        background-color: #34363c;
    }

    &.active {
        color: white;
        background-color: #52545c;
    }
`;

const HashtagDiv = styled.div`
    margin-left: 6px;
`;

const ChannelName = styled.div`
    padding-bottom: 6px;
    margin-left: 6px;
    line-height: 20px;
    font-weight: 600;
    overflow: hidden;
`;

function getTextWidth(text: string) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const channelBarElement = document.getElementById('channels_bar');
    if (!channelBarElement || !context) return;
    const element = getComputedStyle(channelBarElement);
    const font = element.fontSize + ' ' + element.fontFamily;
    context.font = font;

    return context.measureText(text).width;
}

interface TextChannelProps {
    channelName: string;
}

const TextChannelComponent = (props: TextChannelProps) => {
    const hashtag = (
        <svg width="24" height="24" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"
            ></path>
        </svg>
    );

    let channelName = props.channelName;
    // if (channelName.length > 22) {
    //     channelName = channelName.substring(0,21) + "..."
    // }

    const [activeChannel, setActiveChannel] = useRecoilState(
        activeTextChannelState,
    );
    const channelNameWidth = getTextWidth(channelName) || 100;
    const textChannels = useRecoilValue(guildTextChannelsState);
    const isActive = activeChannel?.name === channelName;

    if (channelNameWidth > 150) {
        let counter = 10;

        let newChannelName = channelName.substring(0, counter) + '...';
        let newChannelWidth = getTextWidth(newChannelName) || 999;

        while (newChannelWidth < 150) {
            counter++;
            newChannelName = channelName.substring(0, counter) + '...';
            newChannelWidth = getTextWidth(newChannelName) || 999;
        }

        channelName = newChannelName;
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!event) return;

        const clickedElement = event.currentTarget;
        if (!clickedElement || !clickedElement.parentElement) return;
        const activeIndex = [...clickedElement.parentElement.children].indexOf(
            clickedElement,
        );

        setActiveChannel(textChannels[activeIndex]);
        //console.log(this.state.activeChannel)
    };

    return (
        <TextChannelWrapper
            className={isActive ? 'active' : ''}
            onClick={handleClick}
        >
            <HashtagDiv>{hashtag}</HashtagDiv>
            <ChannelName>{channelName}</ChannelName>
        </TextChannelWrapper>
    );
};

const ChannelsBarWrapper = styled.div`
    box-sizing: border-box;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;

    width: 200px;
    height: 100%;

    font-size: 14px;
    padding-bottom: 6px;
    line-height: 20px;
    font-weight: 600;

    background-color: #2f3136;
`;

export type TextChannel = {
    name: string;
    id: string;
};
type unauthorizedResponse = {
    status: 'unauthorized';
};
type getTextChannelsSuccess = {
    status: 'success';
    channels: TextChannel[];
};
type getTextChannelsFailed = {
    status: 'failed';
    command: 'RPC_getTextChannels';
};
type getTextChannelsResult =
    | getTextChannelsSuccess
    | getTextChannelsFailed
    | unauthorizedResponse;

type getTextChannelsReturn = {
    command: 'RPC_getTextChannels';
    result: getTextChannelsResult;
};
const ChannelsBar = () => {
    const activeGuild = useRecoilValue(activeGuildState);
    const { websocket, token } = useRecoilValue(connectionState);
    const [textChannels, setTextChannels] = useRecoilState(
        guildTextChannelsState,
    );
    const [, setErrorMessage] = useRecoilState(ChatPageErrorMessageState);
    let textChannelRender;

    useEffect(() => {
        const textChannelsWebsocketHandler = (reply: MessageEvent) => {
            let parsedReply;
            try {
                parsedReply = JSON.parse(reply.data) as getTextChannelsReturn;
            } catch (error) {
                console.log('Unable to parse reply');
            }
            if (!parsedReply) return;

            if (parsedReply.command !== 'RPC_getTextChannels') {
                return;
            }

            if (parsedReply.result.status === 'unauthorized') {
                setErrorMessage(
                    'You are not authorized to view text channels!',
                );

                return;
            }

            if (parsedReply.result.status === 'success') {
                setTextChannels(parsedReply.result.channels);
                setErrorMessage(null);
            }

            if (parsedReply.result.status === 'failed') {
                setErrorMessage('Failed to get text channels');
            }
        };
        if (!websocket) return;

        websocket.addEventListener('message', textChannelsWebsocketHandler);

        return () => {
            websocket.removeEventListener(
                'message',
                textChannelsWebsocketHandler,
            );
        };
    }, [setErrorMessage, setTextChannels, websocket]);

    useEffect(() => {
        const getTextChannels = async () => {
            if (!activeGuild) {
                return;
            }
            if (!websocket) {
                return;
            }
            const message = JSON.stringify({
                type: 'get',
                token: token,
                command: 'RPC_getTextChannels',
                params: [activeGuild.id],
            });

            websocket.send(message);
        };

        getTextChannels();
    }, [activeGuild, setErrorMessage, setTextChannels, token, websocket]);

    if (textChannels) {
        textChannelRender = textChannels.map((channel, index) => {
            return (
                <TextChannelComponent key={index} channelName={channel.name} />
            );
        });
    }

    return (
        <ChannelsBarWrapper id="channels_bar">
            <Scrollbars autoHide autoHideTimeout={1500} autoHideDuration={200}>
                {textChannelRender}
            </Scrollbars>
        </ChannelsBarWrapper>
    );
};

export default ChannelsBar;
