import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { config } from 'config';
import { IoRefresh } from 'react-icons/io5';

import { useRecoilState, useRecoilValue } from 'recoil';
import { connectionState } from 'components/App/Atoms';
import { discordGuildsState } from './Atoms';
import GuildCard, { GuildCardSkeleton } from './MyGuildsList/GuildCard';
import GuildsContent from './MyGuildsContent/GuildsContent';

import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

const GuildsWrapper = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: row;

    background: #36393f;
    overflow: hidden;
`;

const GuildsListWrapper = styled.div`
    height: 100%;
    width: 350px;

    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    background: #2f3136;
`;
export interface BotdizGuild {
    id: string;
    icon: string | null;
    name: string;
    iconUrl: string;
    dj_access: boolean;
    administrator: boolean;
    botdiz_guild: boolean;
    owner?: boolean;
}

type DiscordGuildsResponse =
    | {
          status: 'success';
          result: BotdizGuild[];
      }
    | { status: 'failed' };

const MyGuilds = () => {
    const [activeGuild, setActiveGuild] = useState<BotdizGuild | null>(null);
    const [discordGuilds, setDiscordGuilds] =
        useRecoilState(discordGuildsState);
    const [refreshButtonKey, setRefreshButtonKey] = useState(0);
    const [refreshButtonHidden, setRefreshButtonHidden] = useState(true);
    const { token } = useRecoilValue(connectionState);

    const getDiscordGuilds = useCallback(async () => {
        if (discordGuilds.length > 0) return;

        let discordGuildsReply: DiscordGuildsResponse = await fetch(
            config.botdiz_server + '/discordguilds',
            {
                method: 'GET',
                credentials: 'include',
            },
        ).then((reply) => reply.json());

        if (discordGuildsReply.status === 'success') {
            const discordGuilds = discordGuildsReply.result;

            discordGuilds.sort((a, b) =>
                a.botdiz_guild === b.botdiz_guild ? 0 : a.botdiz_guild ? -1 : 1,
            );

            setDiscordGuilds(discordGuilds);
            setRefreshButtonHidden(true);
            setActiveGuild(null);
        }
    }, [discordGuilds.length, setDiscordGuilds]);

    useEffect(() => {
        if (!token) return;
        getDiscordGuilds();
    }, [getDiscordGuilds, token]);

    const guildCardClicked: React.MouseEventHandler<HTMLDivElement> = (
        event,
    ) => {
        const clickedNode = event.currentTarget;
        const clickedParent = clickedNode.parentElement;
        if (!clickedParent) return;

        const clickedIndex = [...clickedParent.children].indexOf(clickedNode);
        const clickedGuild = discordGuilds[clickedIndex];

        if (clickedGuild.iconUrl === null) {
            clickedGuild.iconUrl = '';
        }
        setActiveGuild(clickedGuild);
    };

    const addBotdizClicked = () => {
        setRefreshButtonKey(refreshButtonKey + 1);
        setRefreshButtonHidden(false);
    };

    let renderGuilds;
    if (discordGuilds.length > 0) {
        renderGuilds = discordGuilds.map((guild, index) => {
            return (
                <GuildCard
                    key={index}
                    guild={guild}
                    onClick={guildCardClicked}
                />
            );
        });
    } else {
        renderGuilds = [];
        for (let i = 0; i <= 4; i++) {
            renderGuilds.push(<GuildCardSkeleton key={i} />);
        }
    }

    return (
        <GuildsWrapper>
            <GuildsListWrapper>
                <SimpleBar autoHide>{renderGuilds}</SimpleBar>
                <RefreshButton
                    key={refreshButtonKey}
                    hidden={refreshButtonHidden}
                    refreshClicked={getDiscordGuilds}
                />
            </GuildsListWrapper>

            <GuildsContent
                key={activeGuild?.name}
                activeGuild={activeGuild}
                addBotdizClicked={addBotdizClicked}
            />
        </GuildsWrapper>
    );
};

const RefreshButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    height: 40px;
    width: 240px;

    position: absolute;

    background: #04c33a66;
    bottom: 0;
    left: 60px;

    border-top-left-radius: 10px;
    border-top-right-radius: 10px;

    color: white;
    font-size: 24px;

    cursor: pointer;

    overflow: hidden;

    transform: ${(props) =>
        props.hidden ? 'translateY(40px)' : 'translateY(0px)'};

    transition: linear 0.1s all;

    &:hover {
        background: #04c33ab6;
    }
`;
function RefreshButton(props: { hidden: any; refreshClicked: () => void }) {
    const [hidden, setHidden] = useState(props.hidden);

    const buttonClicked = () => {
        setHidden(true);
        props.refreshClicked();
    };
    return (
        <RefreshButtonWrapper hidden={hidden} onClick={buttonClicked}>
            <IoRefresh
                style={{
                    fontSize: '30px',
                    marginRight: '10px',
                }}
            />
            Refresh Guilds
        </RefreshButtonWrapper>
    );
}

export default MyGuilds;
