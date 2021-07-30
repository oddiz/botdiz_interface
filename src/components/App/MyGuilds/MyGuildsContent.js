import React, { useState } from 'react'
import styled from 'styled-components';
import Switch from 'react-switch'
import config from 'config'
import Scrollbars from 'react-custom-scrollbars';
import { Button } from '@dracula/dracula-ui'

const GuildsContentWrapper = styled.div`
    flex-grow: 1;
    width: 700px;
    height: 100%;

    display: flex;
    flex-direction: column;
    
    align-items: center;

    padding-left:40px;
`;
const Header = styled.div`
    width: 100%;
    height: 64px;

    margin-top: 40px;

    display: flex;
    flex-direction: row;

    align-items: center;
    
`
const GuildIcon = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    & img {
        height: 100%;
        border-radius: 999px;
    }
`
const GuildTitle = styled.span`
    color: white;
    font-size: 24px;
    font-weight: 600;

    margin-left: 20px;
`
const SettingsWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 30px;

    

`
const Setting = styled.div`
    width: 100%;


    display: flex;
    flex-direction: column;
    
`
const SettingHeader = styled.div`
    display: flex;
    flex-direction: column;
    
    width:100%;
`;
const SettingTitle = styled.div`
    font-size: 26px;
    font-family: "Whitney Book Regular";
    color: white;
`;
const SettingDescription = styled.div`
    font-size: 14px;
    font-family: "Fira Code";

    margin-top: 15px;

    color: #707683;
`;
const SettingContent = styled.div`
    width: 100%;
    max-width: 1000px;
    flex-grow: 1;

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`
const CheckBoxWrapper = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    margin-bottom: 0px;
    width: 333px;
    
    align-items: center;
`
const SubmitButtonWrapper = styled.div`
    margin-top: 25px;
`
const AddGuildButtonWrapper = styled.div`
    display: block;
    width: 100%;

    margin-top: 50px;
`
class GuildsContent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            activeGuild: props.activeGuild || null,
            activeGuildDetails: {},
            djRoles: [],
            MPSubmitButtonDisabled: true
        }

    }

    async componentDidMount() {
        if (this.state.activeGuild?.id && 
            this.state.activeGuild?.botdiz_guild &&
            (this.state.activeGuild?.owner || this.state.activeGuild?.administrator)) {
            const guildDetails = await this.getGuildInfo(this.state.activeGuild.id)
            const djRoles = await this.getDjRoles(this.state.activeGuild.id)
            this.setState(
                {
                    activeGuildDetails: guildDetails,
                    djRoles: djRoles || [],
                }
            )
        }

    }

    getGuildInfo = async (guildId) => {
        try {

            const reply = await fetch(config.botdiz_server + '/discordguild', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    guild_id: guildId
                })
            })
            .then(reply => reply.json())
            
            if (reply.status === 'success') {
                return reply.result
            } else {
                return false
            }
            
        } catch (error) {
            console.log("Error while trying to get guild info with guild id: ", guildId)            
        }

    }

    getDjRoles = async (guildId) => {
        const reply = await fetch(config.botdiz_server + `/botdizguild/${guildId}`, {
            method: 'GET',
            credentials: 'include',
        })
        .then(reply => reply.json())

        if (reply.status === "success") {
            return reply.result.dj_roles || []
        } else {
            return []
        }
    }

    djRoleCheckBoxChanged = (roleId, value) => {
        const djRoles = this.state.djRoles
        /* 
        djRoles = [
            "123123123",
            "3223232232"
            ...
        ]
        */
        if (value === true) {
            if (!djRoles.includes(roleId)) {
                djRoles.push(roleId)
            }
        } else if (value === false) {
            if (djRoles.includes(roleId)) {
                const roleIndex = djRoles.indexOf(roleId)
                djRoles.splice(roleIndex, 1)
            }
        }
        this.setState(
            {
                djRoles: djRoles,
                MPSubmitButtonDisabled: false,
                saveStatus: null
            }
        )

    }

    handleMPAccessButton = async () => {
        this.setState({
            savingSettings: true
        })
        const reply = await fetch(config.botdiz_server + `/botdizguild/${this.state.activeGuild.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            credentials: 'include',
            body: JSON.stringify({
                dj_roles: this.state.djRoles
            })
        })
        .then(reply => reply.json())

        if(reply.status === "success") {
            this.setState({
                savingSettings: false,
                MPSubmitButtonDisabled: true,
                saveStatus: "✔️"
            })
        } else {
            this.setState({
                savingSettings: false,
                MPSubmitButtonDisabled: true,
                saveStatus: "❌"
            })
        }
    }

    addGuildButtonHandler = () => {
        let inviteLink
        if (process.env.NODE_ENV === "development") {
            inviteLink = "https://discord.com/oauth2/authorize?client_id=857957046297034802&scope=bot+applications.commands&permissions=2184309832"

        } else {
            inviteLink = "https://discord.com/oauth2/authorize?client_id=851497395190890518&scope=bot+applications.commands&permissions=2184309832"
        }
        window.open(inviteLink, "_blank")
        this.props.addBotdizClicked()
        
    }

    render() {
        if (!this.state.activeGuild.id) {
            return(
                <div />
            )
        }

        if (!this.state.activeGuild.botdiz_guild && (this.state.activeGuild.administrator || this.state.activeGuild.owner)) {
            return(
                <GuildsContentWrapper>
                    <Header>
                        <GuildIcon>
                            <img src={this.state.activeGuild.iconUrl} alt="Guild Icon" />
                        </GuildIcon>
                        <GuildTitle>
                            {this.state.activeGuild.name}
                        </GuildTitle>
                    </Header>
                    <AddGuildButtonWrapper>
                        <Button
                            size= "lg"
                            color = "animated"
                            onClick={this.addGuildButtonHandler}
                            style={{
                                background: "linear-gradient(130deg, rgba(102,204,153,1) 0%, rgba(149,208,159,1) 33%, rgba(255,248,167,1) 66%, rgba(255,198,147,1) 100%)",
                            }}
                        >
                            <span style={{fontWeight: 600}}>
                                Add Botdiz To Your Guild
                            </span>
                        </Button>

                    </AddGuildButtonWrapper>
                </GuildsContentWrapper>
            )
        }

        if (this.state.activeGuild.botdiz_guild &&
            this.state.activeGuild.dj_access &&
            !(this.state.activeGuild.administrator || this.state.activeGuild.owner)) {
            return(
                <GuildsContentWrapper>
                    <Header>
                        <GuildIcon>
                            <img src={this.state.activeGuild.iconUrl} alt="Guild Icon" />
                        </GuildIcon>
                        <GuildTitle>
                            {this.state.activeGuild.name}
                        </GuildTitle>
                    </Header>
                    <SettingsWrapper>
                        <SettingTitle>
                            You have access to music player! 👍
                        </SettingTitle>

                    </SettingsWrapper>
                </GuildsContentWrapper>
            )
        }
        
        if (this.state.activeGuild.botdiz_guild &&
            !this.state.activeGuild.dj_access &&
            !(this.state.activeGuild.administrator || this.state.activeGuild.owner)) {
            return(
                <GuildsContentWrapper>
                    <Header>
                        <GuildIcon>
                            <img src={this.state.activeGuild.iconUrl} alt="Guild Icon" />
                        </GuildIcon>
                        <GuildTitle>
                            {this.state.activeGuild.name}
                        </GuildTitle>
                    </Header>
                    <SettingsWrapper>
                        <SettingTitle>
                            You don't have access to this guild's Music Player
                        </SettingTitle>

                        <SettingTitle style={{marginTop: "20px"}}>
                            Ask an administrator for access
                        </SettingTitle>

                    </SettingsWrapper>
                </GuildsContentWrapper>
            )
        }

        

        let parseRoleCheckboxes
        if(this.state.activeGuildDetails?.roles) {
            parseRoleCheckboxes = this.state.activeGuildDetails.roles.map((role, index) => {
                const defaultChecked = this.state.djRoles.includes(role.id)
                return (
                    <RoleCheckBox
                        key={index}
                        roleColor={role.color === "0"? "#FFFFFF" : `#${role.color}`}
                        roleId={role.id}
                        roleName={role.name}
                        defaultChecked={defaultChecked}
                        roleOnChange={this.djRoleCheckBoxChanged}
                    />
                )
            })

        }
        return(
            <GuildsContentWrapper>
                <Scrollbars
                    autoHide
                    autoHideTimeout={1500}
                    autoHideDuration={200}
                >
                    <Header>
                        <GuildIcon>
                            <img src={this.state.activeGuild.iconUrl} alt="Guild Icon" />
                        </GuildIcon>
                        <GuildTitle>
                            {this.state.activeGuild.name}
                        </GuildTitle>
                    </Header>
                    <SettingsWrapper>
                            <Setting>
                                <SettingHeader>
                                    <SettingTitle>
                                        Music Player Access
                                    </SettingTitle>
                                    <SettingDescription>
                                        Only members with specified roles can access the music player on Botdiz Interface.
                                    </SettingDescription>
                                </SettingHeader>
                                    <span style={{
                                        color: "white",
                                        fontSize: "18px",
                                        fontFamily: "Whitney Book Regular",
                                        fontWeight: 500,
                                        marginTop: "25px"
                                    }}>
                                        Allowed Roles:
                                    </span>
                                    
                                <SettingContent>
                                    {parseRoleCheckboxes}
                                    
                                </SettingContent>

                                <SubmitButtonWrapper>
                                    <Button
                                        color="green"
                                        size="md"
                                        disabled={this.state.MPSubmitButtonDisabled}
                                        onClick={this.handleMPAccessButton}
                                        mr="xxs"
                                    >
                                        Apply
                                    </Button>
                                    {this.state.saveStatus}
                                </SubmitButtonWrapper>

                            </Setting>


                    </SettingsWrapper>
                </Scrollbars>
            </GuildsContentWrapper>
        )
    }
}


const CheckBoxLabel = styled.label`
    margin-left: 5px;
    cursor: pointer;
`
function RoleCheckBox (props) {
    
    const defaultChecked = props?.defaultChecked || false
    const roleColor = props?.roleColor || "white"
    const roleId = props?.roleId || "demo"
    const roleName = props?.roleName || "Placeholder" 
    
    const [checked, setChecked] = useState(defaultChecked)

    const handleSwitch = (checked) => {
        setChecked(checked)
        props.roleOnChange(roleId, checked)
    }
    return (
        <CheckBoxWrapper>
            <Switch 
                id={roleId} 
                checked={checked}
                onChange={handleSwitch}
                height={22}
                width={44}
                name={roleName}
                offColor={"#42464D"}
                onColor={roleColor === "#FFFFFF"? "#2fcc6f" : roleColor}
                onHandleColor="#FFFFFF"
                
            />
            <CheckBoxLabel htmlFor={roleId} className="drac-text drac-text-white" style={{color: `${roleColor}`}}>
            {roleName}
            </CheckBoxLabel>
        </CheckBoxWrapper>
    )
}

export default GuildsContent