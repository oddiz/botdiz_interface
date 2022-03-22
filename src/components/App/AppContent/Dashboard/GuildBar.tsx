import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { RiAdminFill, RiHeadphoneFill } from 'react-icons/ri';
import { InterfaceGuildObject } from './Dashboard';
import { useRecoilValue } from 'recoil';
import { activeGuildState } from './Atoms';
import ReactTooltip from 'react-tooltip';
import { makeImageUrl, returnInitials } from 'components/helpers';

const GuildIconWrapper = styled.div`
    position: relative;
    width: 48px;
    height: 48px;

    border-radius: 48px;
    margin: 4px 0;

    cursor: pointer;

    &.active::after {
        content: '';
        position: absolute;
        display: inline-block;

        width: 4px;
        margin-top: 9px;
        border-radius: 0 4px 4px 0;
        background-color: #808691;
        height: 38px;
        left: -5px;
        top: 0;
    }
`;

const GuildIconImg = styled.img`
    width: 48px;
    height: 48px;

    margin-left: 1px;
    border-radius: 48px;

    transition: linear all 0.2s;
    border: 3px solid transparent;

    font-size: 10px;
    color: white;
    &:hover {
        border: 3px solid #808691;
    }
`;
const GuildIconDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 48px;
    height: 48px;

    margin-left: 1px;
    border-radius: 48px;

    background: #36393f;

    border: 3px solid transparent;

    color: #b5bbc5;
    font-family: Whitney, Helvetica Neue, Helvetica, Arial, sans-serif;
    font-size: 14px;

    transition: linear all 0.2s;
    &:hover {
        border: 3px solid #808691;
    }

    &.guildicon__tooltip {
        z-index: 9999;
    }
`;
/*
const GuildTooltip = styled.div`
    position: absolute;
    left: 70px;
    top: 14px;


    font-size: 14px;
    border: 1px solid #808691;
    border-radius: 4px;
    padding: 0px 7px;
    background-color: #36393f;
    color: white;

`;
*/
const GuildRoleIconWrapper = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 18px;
    height: 18px;

    border-radius: 1000px;
    background: #42464d;

    z-index: 2;

    left: 35px;
    bottom: -10px;
`;

const GuildRoleIcon = styled.span`
    color: white;
    fill: white;
    outline-color: white;
    font-size: 12px;
`;

interface GuildIconProps {
    guildID: string;
    iconHash: string;
    guild: InterfaceGuildObject;
    GuildBarOnClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    guildBarClicked: () => void;
}

function GuildIcon(props: GuildIconProps) {
    const guild = props.guild;
    const activeGuild = useRecoilValue(activeGuildState);
    const guildIconRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!activeGuild) return;

        const activeGuildIcon = document.getElementById(activeGuild.id);
        if (activeGuildIcon) activeGuildIcon.classList.add('active');

        return () => {};
    }, [activeGuild]);

    const guildIconClicked = async (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        const eventTarget = event.currentTarget;

        const guildIconNodes =
            eventTarget.parentElement?.parentElement?.children;

        if (!guildIconNodes) return;

        for (const guildIconNode of guildIconNodes) {
            guildIconNode.classList.remove('active');
        }
        await new Promise((resolve) => setTimeout(resolve, 40));

        eventTarget.parentElement.classList.add('active');
        props.GuildBarOnClick(event);
        props.guildBarClicked();
    };
    /*
    const onMouseHoverGuildBar = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        switch (event.type) {
            case 'mouseenter':
                setShowTooltip(true);
                break;
            case 'mouseleave':
                setShowTooltip(false);
                break;

            default:
                break;
        }
    };
    */
    if (!guildIconRef) return <></>;

    return (
        <GuildIconWrapper id={guild.id} ref={guildIconRef}>
            {props.iconHash ? (
                <GuildIconImg
                    src={makeImageUrl(props.guildID, props.iconHash, {
                        size: 128,
                    })}
                    data-tip
                    data-for={'guildIcon-tooltip-' + guild.id}
                    alt="Guild Icon"
                    onClick={guildIconClicked}
                    //onMouseEnter={onMouseHoverGuildBar}
                    //onMouseLeave={onMouseHoverGuildBar}
                />
            ) : (
                <GuildIconDiv
                    data-tip
                    data-for={'guildIcon-tooltip-' + guild.id}
                    onClick={guildIconClicked}
                    //    onMouseEnter={onMouseHoverGuildBar}
                    //    onMouseLeave={onMouseHoverGuildBar}
                >
                    {returnInitials(guild.name)}
                </GuildIconDiv>
            )}
            <ReactTooltip
                id={'guildIcon-tooltip-' + guild.id}
                place="right"
                type="dark"
                effect="solid"
                className="z_index_9999"
            >
                <span style={{ whiteSpace: 'nowrap' }}>{guild.name}</span>
            </ReactTooltip>

            <GuildRoleIconWrapper>
                <GuildRoleIcon>
                    {guild.administrator || guild.owner ? (
                        <RiAdminFill />
                    ) : guild.dj_access ? (
                        <RiHeadphoneFill />
                    ) : (
                        ''
                    )}
                </GuildRoleIcon>
            </GuildRoleIconWrapper>
        </GuildIconWrapper>
    );
}

const GuildIconsBar = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    width: 64px;

    background-color: #202225;
`;
const GuildIcons = styled.div<{ guildActive: boolean }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;

    margin-left: 10px;
    transform: ${(props) =>
        props.guildActive ? 'translateY(29px)' : 'translateY(0px)'};

    transition: ease-in-out 0.2s all;
    &:before {
        display: block;
        content: '';
        height: 2px;
        width: 32px;
        border-radius: 1px;
        background-color: #36393f;
        margin-bottom: 5px;
        margin-left: 10px;
    }
`;
interface GuildBarProps {
    allGuilds: InterfaceGuildObject[];
    GuildBarOnClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}
export default function GuildBar(props: GuildBarProps) {
    let guildList = props.allGuilds;
    const activeGuild = useRecoilValue(activeGuildState);
    const [guildActive, setGuildActive] = useState(!!activeGuild);

    const guildBarClicked = () => {
        setGuildActive(true);
    };

    const guildListRender = guildList.map((guild) => (
        <GuildIcon
            key={guild.id}
            guildID={guild.id}
            iconHash={guild.icon}
            guild={guild}
            GuildBarOnClick={props.GuildBarOnClick}
            guildBarClicked={guildBarClicked}
        />
    ));

    return (
        <GuildIconsBar id="guild_bar">
            <GuildIcons guildActive={guildActive}>{guildListRender}</GuildIcons>
        </GuildIconsBar>
    );
}
