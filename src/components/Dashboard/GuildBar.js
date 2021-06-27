import React from 'react';
import styled from "styled-components";

function makeImageUrl(guildID, hash, { format = 'webp', size } = {}) {
    const root = "https://cdn.discordapp.com"
    return `${root}/icons/${guildID}/${hash}.${format}${size ? `?size=${size}` : ''}`;
}

const Pill = styled.span`
    position:absolute;
    display: inline-block;
    
    width:4px;
    margin-top:9px;
    border-radius: 0 4px 4px 0;
    background-color: #808691;
    height: 38px;
    left:0;
`

function GuildIcon(props) {
    
    return(

        <GuildIconWrapper >
            {props.isActive ? <Pill /> : ""}
            <GuildIconImg 
                src={makeImageUrl(props.guildID, props.iconHash, { size: 128})}
                alt="Guild Icon"
                onClick={(event) => {props.GuildBarOnClick(event)}}
            />
        </GuildIconWrapper>
    )
}

const GuildIconWrapper = styled.div`

    
    width: 48px;
    height: 48px;

    border-radius: 48px;
    margin: 4px 0;

    cursor: pointer;

`

const GuildIconImg = styled.img`
    width: 48px;
    height: 48px;

    margin-left: 1px;
    border-radius: 48px;

    transition: linear all 0.2s;
    border: 3px solid transparent;

    &:hover {
        border: 3px solid #808691;
    }


`
const GuildIconsBar = styled.div`
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    width: 64px;
    height: 100%;

    padding-top: 30px;
    background-color: #202225;

    &:before{
        content: "";
        height: 2px;
        width: 32px;
        border-radius: 1px;
        background-color: #36393f;
        margin-bottom: 5px;
    }

`

export default function GuildBar(props) {
    let guildList = props.allGuilds
    const activeGuild = props.activeGuild

    const guildListRender = guildList.map(guild => (
        <GuildIcon
            key={guild.id}
            id={guild.id} 
            guildID={guild.id}
            iconHash={guild.icon}
            isActive={guild.id === activeGuild?.id ? true : false}
            GuildBarOnClick = {props.GuildBarOnClick}
        />

    ))
    
    return(
        <GuildIconsBar> 
            {guildListRender}
        </GuildIconsBar>
    )
}