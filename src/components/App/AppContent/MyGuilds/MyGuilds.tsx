import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components';
import {config} from 'config'
import Scrollbars from 'react-custom-scrollbars'
import {IoRefresh} from 'react-icons/io5'

import GuildsContent from './MyGuildsContent'
import { useRecoilState, useRecoilValue } from 'recoil';
import { connectionState } from 'components/App/Atoms';
import { discordGuildsState } from './Atoms';

const GuildsWrapper = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: row;

    background: #36393f;
    overflow:hidden;
`;

const GuildsListWrapper = styled.div`
    height: 100%;
    width: 350px;

    flex-shrink:0;
    display: flex;
    flex-direction: column;
    


    background: #2f3136;
`
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

type DiscordGuildsResponse = {
    status: "success";
    result: BotdizGuild[];
} | { status: "failed"}

const MyGuilds = () => {
    
    const [activeGuild, setActiveGuild] = useState<BotdizGuild | null>(null)
    const [discordGuilds, setDiscordGuilds] = useRecoilState(discordGuildsState)
    const [refreshButtonKey, setRefreshButtonKey] = useState(0)
    const [refreshButtonHidden, setRefreshButtonHidden] = useState(true)
    const { token } = useRecoilValue(connectionState)

    const getDiscordGuilds = useCallback(async () => {

        if(discordGuilds.length > 0) return

        let discordGuildsReply: DiscordGuildsResponse = await fetch(config.botdiz_server+"/discordguilds", {
            method: "GET",
            credentials: "include"
        })
        .then(reply => reply.json())
        
        if (discordGuildsReply.status === "success") {
            const discordGuilds = discordGuildsReply.result
            
            discordGuilds.sort((a,b) => (a.botdiz_guild === b.botdiz_guild) ? 0 : a.botdiz_guild ? -1 : 1)
            
            setDiscordGuilds(discordGuilds)
            setRefreshButtonHidden(true)
            setActiveGuild(null)

            
        }
    }, [discordGuilds.length, setDiscordGuilds])

    useEffect(() => {
        if (!token) return
        getDiscordGuilds()
    
      
    }, [getDiscordGuilds, token])
    

    
    

    const guildCardClicked: React.MouseEventHandler<HTMLDivElement> = (event) => {
        const clickedNode = event.currentTarget
        const clickedParent = clickedNode.parentElement
        if(!clickedParent) return

        const clickedIndex = [...clickedParent.children].indexOf(clickedNode);
        const clickedGuild = discordGuilds[clickedIndex]

        if (clickedGuild.iconUrl === null) {
            clickedGuild.iconUrl = ""
        }
        setActiveGuild(clickedGuild)
    }

    const addBotdizClicked = () => {

        setRefreshButtonKey(refreshButtonKey + 1)
        setRefreshButtonHidden(false)

    }
    const renderGuilds = discordGuilds.map((guild, index) => {
        return (
            <GuildCard 
                key={index}
                guild={guild}
                onClick={guildCardClicked}
                
            />
        )
    })
    
    return (
        <GuildsWrapper>
            
            <GuildsListWrapper>
                <Scrollbars
                    autoHide
                    autoHideTimeout={1500}
                    autoHideDuration={200}
                >
                    {renderGuilds}

                </Scrollbars>
                <RefreshButton 
                    key={refreshButtonKey}
                    hidden={refreshButtonHidden}
                    refreshClicked={getDiscordGuilds}
                    
                />
            </GuildsListWrapper>

            <GuildsContent
                key={activeGuild?.name}
                activeGuild = {activeGuild}
                addBotdizClicked={addBotdizClicked}

            />

        </GuildsWrapper>
    )
    
}

const RefreshButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    height: 40px;
    width: 240px;

    position:absolute;

    background: #04c33a66;
    bottom: 0;
    left: 60px;

    border-top-left-radius: 10px;
    border-top-right-radius: 10px;

    color: white;
    font-size: 24px;

    cursor: pointer;

    overflow: hidden;

    transform: ${props => props.hidden? "translateY(40px)": "translateY(0px)" };

    transition: linear 0.1s all;

    &:hover {
        background: #04c33ab6;
    }
`;
function RefreshButton (props: { hidden: any; refreshClicked: () => void; }) {

    const [hidden, setHidden] = useState(props.hidden)

    const buttonClicked = () => {
        setHidden(true)
        props.refreshClicked()
    }
    return (
        <RefreshButtonWrapper
            hidden={hidden}
            onClick={buttonClicked}
        >
            <IoRefresh style= {{
                fontSize: "30px",
                marginRight: "10px"
            }} />
            Refresh Guilds
        </RefreshButtonWrapper>
    )
}

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

`
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
`
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

    background: #55585F;
    border-radius: 10px;
`;

type IGuildBadges = ("Owner" | "Administrator" | "DJ" | "Botdiz Guild")[]
function GuildCard (props: { guild: BotdizGuild; onClick: React.MouseEventHandler<HTMLDivElement> | undefined; }) {
    const guild = props.guild
    
    const guildBadges: IGuildBadges = []

    if(guild.owner) {
        guildBadges.push("Owner")
    } else if (guild.administrator) {
        guildBadges.push("Administrator")
    } else if (guild.dj_access) {
        guildBadges.push("DJ")
    }

    if(guild.botdiz_guild) {
        guildBadges.push("Botdiz Guild")
    }

    return (
        <GuildCardWrapper onClick={props.onClick}>
            <GuildIcon>
                <img src={guild?.iconUrl|| ""} alt="Guild Icon" />
            </GuildIcon>
            <GuildContent>
                <GuildName>
                    {guild.name}
                </GuildName>
                <Seperator />

                <GuildBadges 
                    badges={guildBadges}
                />
            </GuildContent>
        </GuildCardWrapper>
    )
}

const GuildBadgesWrapper = styled.div`
    display: flex;
    flex-grow: 1;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`
function GuildBadges(props: { badges: IGuildBadges; }) {
    const badges = props.badges

    const parsedBadges = badges.map((badge, index) => {
        let color 
        if (badge ==="Owner") {
            color = "#3db3d8"
        } else if (badge === "Administrator") {
            color = "#04c33a"
        } else if (badge === "Botdiz Guild") {
            color = "#9d3dd8"
        } else if (badge === "DJ") {
            color = "#e74c3c"
        } else {
            color = "#2c2c2c"
        }

        return (
            <GuildBadge
                key={index} 
                color={color}
                name={badge}
            />
        )
    })
    return (
        <GuildBadgesWrapper>
            {parsedBadges}
        </GuildBadgesWrapper>
    )
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
    background: ${props => props.color};

    font-size: 12px;
    font-weight: 500;
    font-family: "Fira Code";

    margin: 0 5px;
    
    &:first-child {
        margin-left: 0;
    }
    &:last-child {
        margin-right: 0;
    }

`;
function GuildBadge (props: { name: string; color: string; }) {
    const badgeName = props.name
    let badgeColor = props.color
    return(
        <GuildBadgeWrapper
            color={badgeColor}
        >
            {badgeName}
        </GuildBadgeWrapper>
    )
}
export default MyGuilds