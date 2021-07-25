import React, { useState } from 'react'
import styled from 'styled-components';
import Switch from 'react-switch'
import config from 'config'

const GuildsContentWrapper = styled.div`
    flex-grow: 1;
    width: 700px;
    height: 100%;

    display: flex;
    flex-direction: column;
    
    align-items: center;

    padding-top: 40px;
    padding-left:40px;
`;
const Header = styled.div`
    width: 100%;
    height: 64px;

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
    

`
const Setting = styled.div`
    width: 100%;

    margin-top: 30px;

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
    margin-right: 100px;
    
    align-items: center;
`
class GuildsContent extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            activeGuild: props.activeGuild || null,
            activeGuildDetails: {}
        }

    }

    async componentDidMount() {
        if (this.state.activeGuild?.id) {
            const guildDetails = await this.getGuildInfo(this.state.activeGuild.id)
            this.setState({activeGuildDetails: guildDetails})
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

    render() {
        if (!this.state.activeGuild.id) {
            return(
                <div />
            )
        }
        let parseRoleCheckboxes
        if(this.state.activeGuildDetails?.roles) {
            parseRoleCheckboxes = this.state.activeGuildDetails.roles.map((role, index) => {

                return (
                    <RoleCheckBox
                        key={index}
                        roleColor={role.color === "0"? "#FFFFFF" : `#${role.color}`}
                        roleId={role.id}
                        roleName={role.name}
                    />
                )
            })

        }
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
                    <Setting>
                        <SettingHeader>
                            <SettingTitle>
                                Music Player Access
                            </SettingTitle>
                            <SettingDescription>
                                Only members with specified roles can access the music player on Botdiz Interface when logged in with their discord account.
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

                    </Setting>

                </SettingsWrapper>
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
                offColor={"#56595f"}
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