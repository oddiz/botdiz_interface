import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { config } from 'config';
import Scrollbars from 'react-custom-scrollbars';
import { useRecoilState, useRecoilValue } from 'recoil';
import { connectionState } from 'components/App/Atoms';
import { activeGuildState } from '../../Atoms';
import { inVoiceChannelState } from '../Atoms';
import { GuildMember } from 'discord.js';
import { ReactComponent as VolumeIcon } from './VolumeIcon.svg';
const ChannelName = styled.div`
    padding-bottom: 6px;
    margin-left: 6px;
    line-height: 20px;
    font-weight: 600;
    overflow: hidden;
`;
const HashtagDiv = styled.div`
    margin-left: 6px;
`;
const VoiceChannelWrapper = styled.div`
    display: flex;
    flex-direction: column;

    padding: 10px 5px;
    color: #72767d;

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
const VoiceChannelTitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;
const ChannelMembersWrapper = styled.div`
    display: flex;
    flex-direction: column;

    margin-left: 40px;
`;
const ChannelMember = styled.span`
    margin-top: 4px;

    &.emphasis {
        color: transparent;
        font-weight: 600;
        font-family: 'Fira Code';

        background-clip: text;
        -webkit-background-clip: text;
    }
`;

interface VoiceChannelProps {
    voiceChannelClicked: (event: React.MouseEvent<HTMLDivElement>) => void;
    channelName: string;
    channelMembers: IVoiceChannel['members'];
}
const VoiceChannel = (props: VoiceChannelProps) => {
    const botdizDiscordId = config.botdiz_discordId;

    const renderChannelMembers =
        props.channelMembers &&
        props.channelMembers.map((member, index) => {
            return (
                <ChannelMember
                    key={index}
                    className={
                        member.userId === botdizDiscordId
                            ? 'emphasis drac-bg-animated'
                            : ''
                    }
                >
                    {member.displayName}
                </ChannelMember>
            );
        });

    function getTextWidth(text: string) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return null;

        const VSWrapperElement = document.getElementById(
            'voice_channels_wrapper',
        );
        if (!VSWrapperElement) return null;

        const element = getComputedStyle(VSWrapperElement);
        const font = element.fontSize + ' ' + element.fontFamily;
        context.font = font;

        return context.measureText(text).width;
    }

    let channelName = props.channelName;

    const channelNameWidth = getTextWidth(channelName);

    const maxWidth = 130;
    if (channelNameWidth && channelNameWidth > maxWidth) {
        let counter = 5;

        let newChannelName = channelName.substring(0, counter) + '...';
        let newChannelWidth = getTextWidth(newChannelName);

        while (newChannelWidth && newChannelWidth < maxWidth) {
            counter++;
            newChannelName = channelName.substring(0, counter) + '...';
            newChannelWidth = getTextWidth(newChannelName);
        }

        channelName = newChannelName;
    }

    return (
        <VoiceChannelWrapper onClick={props.voiceChannelClicked}>
            <VoiceChannelTitleWrapper>
                <HashtagDiv>
                    <VolumeIcon />
                </HashtagDiv>
                <ChannelName>{channelName}</ChannelName>
            </VoiceChannelTitleWrapper>
            <ChannelMembersWrapper>
                {renderChannelMembers}
            </ChannelMembersWrapper>
        </VoiceChannelWrapper>
    );
};

const VoiceChannelSectionWrapper = styled.div`
    width: 200px;
    flex-shrink: 0;

    background-color: #2f3136;
    display: flex;
    flex-direction: column;
    border-top-left-radius: 5px;

    font-size: 14px;
`;
interface FixedGuildMember extends GuildMember {
    userId: string;
}
export interface IVoiceChannel {
    name: string;
    id: string;
    members: FixedGuildMember[];
}
const VoiceChannelSection = () => {
    const { token, websocket } = useRecoilValue(connectionState);
    const activeGuild = useRecoilValue(activeGuildState);
    const guildId = activeGuild?.id;

    const [voiceChannels, setVoiceChannels] = useState<IVoiceChannel[]>([]);
    const [, setInvoiceChannel] = useRecoilState(inVoiceChannelState);

    useEffect(() => {
        const voiceChannelSectionListener = (reply: MessageEvent) => {
            try {
                let parsedReply = JSON.parse(reply.data);
                const result = parsedReply.result;
                if (
                    parsedReply.command === 'RPC_getVoiceChannels' &&
                    result.status === 'success'
                ) {
                    setVoiceChannels(result.voiceChannels);
                }

                if (parsedReply.event === 'voicechannel_update') {
                    /* Reply format
                    {
                        event: "voicechannel_change",
                        listenerId: listenerID,
                        guildId: guildId
                    }
                    */
                    getVoiceChannels();
                }
            } catch (error) {
                console.log(
                    error,
                    ' Error while trying to process voice channel command',
                );
            }
        };

        const getVoiceChannels = () => {
            if (!websocket) {
                console.log(
                    'Tried to get voice channels but there was no websocket',
                );
                return;
            }
            if (!token) {
                console.log('No token');
                return;
            }
            if (!guildId) {
                console.log('No guildId');
                return;
            }
            const message = JSON.stringify({
                type: 'get',
                token: token,
                command: 'RPC_getVoiceChannels',
                params: [guildId],
            });

            websocket.send(message);
        };

        const setupChannelListener = () => {
            if (!websocket) {
                console.log(
                    'Tried to setup channel listener but there was no websocket',
                );
                return;
            }

            const messageSubVoiceUpdates = JSON.stringify({
                type: `addVoiceChannelListener`,
                guildId: guildId,
                token: token,
                command: `RPC_listenVoiceChannels`,
            });

            websocket.send(messageSubVoiceUpdates);
        };

        websocket?.addEventListener('message', voiceChannelSectionListener);
        getVoiceChannels();
        setupChannelListener();

        return () => {
            websocket?.removeEventListener(
                'message',
                voiceChannelSectionListener,
            );
        };
    }, [guildId, token, websocket]);

    useEffect(() => {
        const botdizDiscordId = config.botdiz_discordId;

        let botFound = false;
        for (const voiceChannel of voiceChannels) {
            if (!voiceChannel.members) continue;
            const botMember = voiceChannel.members.find(
                (member) => member.userId === botdizDiscordId,
            );
            if (botMember) {
                botFound = true;
            }
        }

        setInvoiceChannel(botFound);
    }, [setInvoiceChannel, voiceChannels]);

    const voiceChannelClickHandler = (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {
        const clickedElement = event.currentTarget;
        const clickedEleParent = clickedElement.parentElement;

        if (!clickedEleParent) return;

        if (!websocket) return;
        //index of song in queue array
        const channelIndex =
            [...clickedEleParent.children].indexOf(clickedElement) - 1;

        const clickedChannel = voiceChannels[channelIndex];

        const message = JSON.stringify({
            type: 'exec',
            token: token,
            command: 'RPC_joinVoiceChannel',
            params: [guildId, clickedChannel.id],
        });

        websocket.send(message);
    };

    let voiceChannelRender = null;
    if (voiceChannels && voiceChannels.length > 0) {
        voiceChannelRender = voiceChannels.map((channel, index) => {
            return (
                <VoiceChannel
                    key={index}
                    voiceChannelClicked={voiceChannelClickHandler}
                    channelName={channel.name}
                    channelMembers={channel.members}
                />
            );
        });
    }

    return (
        <VoiceChannelSectionWrapper id="voice_channels_wrapper">
            <Scrollbars autoHide autoHideTimeout={1500} autoHideDuration={200}>
                <div style={{ height: '20px', width: '100%' }} />
                {voiceChannelRender}
            </Scrollbars>
        </VoiceChannelSectionWrapper>
    );
};

export default VoiceChannelSection;
