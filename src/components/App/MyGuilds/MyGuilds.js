import React from 'react'
import styled from 'styled-components';
import config from 'config.js'
import Scrollbars from 'react-custom-scrollbars'

import GuildsContent from './MyGuildsContent'

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
class Guilds extends React.Component {
    constructor(props) {
        super(props)

        this.state= {
            activeGuild: {},
            discordGuilds: []
        }

        this.token = props.token

    }

    async componentDidMount() {
        let discordGuilds = await this.getDiscordGuilds()

        if (!discordGuilds) {
            discordGuilds = []
        }
        discordGuilds.sort((a,b) => a.botdiz_guild === b.botdiz_guild ? -1 : 1)

        this.setState({discordGuilds: discordGuilds})
    }
    
    getDiscordGuilds = async () => {
        const discordGuilds = await fetch(config.botdiz_server+"/discordguilds", {
            method: "GET",
            credentials: "include"
        })
        .then(reply => reply.json())
        

        if (discordGuilds.status === "success") {
            return discordGuilds.result
        }
    }
    /* 
    discordGuild = {
        "id": "854409105431330836",
        "name": "botdiz test",
        "icon": "b396da8cf5224d94c0ffa137d186c4ad",
        "owner": true,
        "permissions": 2147483647,
        "features": [],
        "permissions_new": "274877906943",
        "botdiz_guild": true,
        "administrator": true
    }
    */

    guildCardClicked = (event) => {
        const clickedNode = event.currentTarget
        const clickedIndex = [...clickedNode.parentElement.children].indexOf(clickedNode);

        const clickedGuild = this.state.discordGuilds[clickedIndex]

        this.setState({ activeGuild: clickedGuild})
    }
    render() {
        const renderGuilds = this.state.discordGuilds.map((guild, index) => {
            return (
                <GuildCard 
                    key={index}
                    guild={guild}
                    onClick={this.guildCardClicked}
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
                </GuildsListWrapper>

                <GuildsContent
                    key={this.state.activeGuild.name}
                    activeGuild = {this.state.activeGuild}
                />

            </GuildsWrapper>
        )
    }
    
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

function GuildCard (props) {
    const guild = props.guild
    

    const guildBadges = []

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
                <img src={guild.iconUrl} alt="Guild Icon" />
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
function GuildBadges(props) {
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
function GuildBadge (props) {
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
export default Guilds