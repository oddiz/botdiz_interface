import { Skeleton } from '@mui/material';
import { useState } from 'react';
import styled from 'styled-components';
import { BotdizGuild } from '../MyGuilds';

const GuildCardWrapper = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 100px;

    padding: 10px 0;
    padding-left: 10px;

    flex-shrink: 0;

    display: flex;
    flex-direction: row;
    align-items: center;

    cursor: pointer;

    &:hover {
        background: #36393f;
    }
    &:last-child {
        margin-bottom: 50px;
    }
`;
const GuildIcon = styled.div`
    width: 25%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    & img {
        width: 80%;
        border-radius: 999px;
    }
`;
const GuildContent = styled.div`
    flex: 1 0 0;

    display: flex;
    flex-direction: column;
    align-items: center;

    height: 100%;
`;
const GuildName = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    height: 50%;
    color: white;
    font-weight: 600;
    font-size: 1.2em;
`;
const Seperator = styled.span`
    width: 90%;
    height: 2px;

    background: #55585f;
    border-radius: 10px;
`;
export const GuildCardSkeleton = () => {
    return (
        <GuildCardWrapper style={{ background: '' }}>
            <GuildIcon>
                <Skeleton
                    animation="wave"
                    variant="circular"
                    width="68px"
                    height="68px"
                    sx={{
                        '&:after': {
                            background:
                                'linear-gradient(90deg, transparent, rgba(119, 118, 118, 0.14), transparent)',
                        },
                    }}
                    className="guild_card_skeleton"
                />
            </GuildIcon>
            <GuildContent>
                <GuildName>
                    <Skeleton
                        animation="wave"
                        variant="text"
                        width="200px"
                        height="40px"
                        sx={{
                            '&:after': {
                                background:
                                    'linear-gradient(90deg, transparent, rgba(119, 118, 118, 0.14), transparent)',
                            },
                        }}
                    />
                </GuildName>
                <Skeleton
                    animation="wave"
                    variant="text"
                    width="230px"
                    height="2px"
                    sx={{
                        '&:after': {
                            background:
                                'linear-gradient(90deg, transparent, rgba(119, 118, 118, 0.14), transparent)',
                        },
                    }}
                />
                <GuildBadgesWrapper>
                    <Skeleton
                        animation="wave"
                        variant="text"
                        width="200px"
                        height="20px"
                        sx={{
                            '&:after': {
                                background:
                                    'linear-gradient(90deg, transparent, rgba(119, 118, 118, 0.14), transparent)',
                            },
                        }}
                    />
                </GuildBadgesWrapper>
            </GuildContent>
        </GuildCardWrapper>
    );
};
type IGuildBadges = ('Owner' | 'Administrator' | 'DJ' | 'Botdiz Guild')[];
function GuildCard(props: {
    guild: BotdizGuild;
    onClick: React.MouseEventHandler<HTMLDivElement> | undefined;
}) {
    const guild = props.guild;

    const guildBadges: IGuildBadges = [];

    if (guild.owner) {
        guildBadges.push('Owner');
    } else if (guild.administrator) {
        guildBadges.push('Administrator');
    } else if (guild.dj_access) {
        guildBadges.push('DJ');
    }

    if (guild.botdiz_guild) {
        guildBadges.push('Botdiz Guild');
    }

    return (
        <GuildCardWrapper onClick={props.onClick}>
            <GuildIcon>
                <img src={guild?.iconUrl || ''} alt="Guild Icon" />
            </GuildIcon>
            <GuildContent>
                <GuildName>{guild.name}</GuildName>
                <Seperator />

                <GuildBadges badges={guildBadges} />
            </GuildContent>
        </GuildCardWrapper>
    );
}

const GuildBadgesWrapper = styled.div`
    display: flex;
    flex-grow: 1;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;
function GuildBadges(props: { badges: IGuildBadges }) {
    const badges = props.badges;

    const parsedBadges = badges.map((badge, index) => {
        let color;
        if (badge === 'Owner') {
            color = '#3db3d8';
        } else if (badge === 'Administrator') {
            color = '#04c33a';
        } else if (badge === 'Botdiz Guild') {
            color = '#9d3dd8';
        } else if (badge === 'DJ') {
            color = '#e74c3c';
        } else {
            color = '#2c2c2c';
        }

        return <GuildBadge key={index} color={color} name={badge} />;
    });
    return <GuildBadgesWrapper>{parsedBadges}</GuildBadgesWrapper>;
}
const GuildBadgeWrapper = styled.div`
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;

    padding: 2px 5px;
    border-radius: 5px;
    background: ${(props) => props.color};

    font-size: 12px;
    font-weight: 500;
    font-family: 'Fira Code';

    margin: 0 5px;

    &:first-child {
        margin-left: 0;
    }
    &:last-child {
        margin-right: 0;
    }
`;
function GuildBadge(props: { name: string; color: string }) {
    const badgeName = props.name;
    let badgeColor = props.color;
    return (
        <GuildBadgeWrapper color={badgeColor}>{badgeName}</GuildBadgeWrapper>
    );
}

export default GuildCard;
