import React, { useState } from 'react';
import styled from "styled-components";

import { RiAdminFill, RiHeadphoneFill } from 'react-icons/ri'

function makeImageUrl(guildID, hash, { format = 'webp', size } = {size:128}) {
    const root = "https://cdn.discordapp.com"
    if(hash) {
        return `${root}/icons/${guildID}/${hash}.${format}${size ? `?size=${size}` : ''}`;
    } else {
        return 'https://discord.com/assets/f9bb9c4af2b9c32a2c5ee0014661546d.png'
    }
}

const GuildIconWrapper = styled.div`

    position:relative;
    width: 48px;
    height: 48px;

    border-radius: 48px;
    margin: 4px 0;

    cursor: pointer;

    &.active::after {
        content:"";
        position:absolute;
        display: inline-block;
        
        width:4px;
        margin-top:9px;
        border-radius: 0 4px 4px 0;
        background-color: #808691;
        height: 38px;
        left:-5px;
    }
`
const GuildRoleIconWrapper = styled.div`
    position:absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width:18px;
    height: 18px;

    border-radius: 1000px;
    background: #42464D;

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
function GuildIcon(props) {
    const guild = props.guild

    const guildIconClicked = async (event) => {
        const eventTarget = event.currentTarget

        const guildIconNodes = eventTarget.parentElement.parentElement.children
        for (const guildIconNode of guildIconNodes) {
            guildIconNode.classList.remove("active")
        }
        await new Promise(resolve => setTimeout(resolve, 40));
        
        eventTarget.parentElement.classList.add("active")
        props.GuildBarOnClick(event)
        props.guildBarClicked()
    }
    return(

        <GuildIconWrapper >
            <GuildIconImg 
                src={makeImageUrl(props.guildID, props.iconHash, { size: 128})}
                alt="Guild Icon"
                onClick={guildIconClicked}
            />
            <GuildRoleIconWrapper>
                <GuildRoleIcon>
                    {guild.administrator || guild.owner ? <RiAdminFill /> : guild.dj_access? <RiHeadphoneFill /> : ""}
                </GuildRoleIcon>
            </GuildRoleIconWrapper>
        </GuildIconWrapper>
    )
}


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
    

    background-color: #202225;
`
const GuildIcons = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width:100%;

    margin-left:10px;
    transform: ${props => props.guildActive? "translateY(29px)": "translateY(0px)"};
    
    transition: ease-in-out 0.2s all;
    &:before{
        display: block;
        content: "";
        height: 2px;
        width: 32px;
        border-radius: 1px;
        background-color: #36393f;
        margin-bottom: 5px;
        margin-left:10px;
    }
    
`
export default function GuildBar(props) {
    let guildList = props.allGuilds
    const [guildActive, setGuildActive] = useState(false)

    const guildBarClicked = () => {
        setGuildActive(true)
    }

    const guildListRender = guildList.map(guild => (
        <GuildIcon
            key={guild.id}
            id={guild.id} 
            guildID={guild.id}
            iconHash={guild.icon}
            guild={guild}
            GuildBarOnClick = {props.GuildBarOnClick}
            guildBarClicked = {guildBarClicked}
        />

    ))
    
    return(
        <GuildIconsBar id="guild_bar">
            <GuildIcons guildActive={guildActive}>
                {guildListRender}
            </GuildIcons>
        </GuildIconsBar>
    )
}