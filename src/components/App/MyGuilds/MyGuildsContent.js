import React, { useState } from 'react'
import styled from 'styled-components';
import Switch from 'react-switch'
import config from 'config'
import Scrollbars from 'react-custom-scrollbars';
import { Button, Select, Text } from '@dracula/dracula-ui'
import ConnectionContext from '../ConnectionContext';

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

    margin-bottom: 50px;

    display: flex;
    flex-direction: column;

    &:last-child {
        margin-bottom: 400px;
    }
    
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
const Roles = styled.div`
    
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`
const SettingSubtitle = styled.div`
    color: white;
    font-size: 18px;
    font-family: "Whitney Book Regular";
    font-weight: 500;
    margin-top: 25px;
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

        this.accountInfo = props.accountInfo

    }

    async componentDidMount() {
        if ((this.state.activeGuild?.id && 
            this.state.activeGuild?.botdiz_guild &&
            (this.state.activeGuild?.owner || this.state.activeGuild?.administrator)) 
            ||
            (this.accountInfo.is_admin &&
            this.state.activeGuild?.id)
            ) {
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
                            <Setting id="music_player_access">
                                <SettingHeader>
                                    <SettingTitle>
                                        Music Player Access
                                    </SettingTitle>
                                    <SettingDescription>
                                        Only members with specified roles can access the music player on Botdiz Interface.
                                    </SettingDescription>
                                </SettingHeader>
                                <SettingContent>
                                    <SettingSubtitle>
                                        Allowed Roles:
                                    </SettingSubtitle>
                                    <Roles>

                                        {parseRoleCheckboxes}
                                    </Roles>
                                    
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

                            <Setting id="subscriptions">
                                <SettingHeader>
                                    <SettingTitle>
                                        Subscriptions
                                    </SettingTitle>
                                    <SettingDescription>
                                        Add various subscriptions to text channels  
                                    </SettingDescription>
                                </SettingHeader>
                                <ConnectionContext.Consumer>
                                    {values =>
                                        <SubscriptionsContent 
                                            websocket = {values.websocket}
                                            token = {values.token}
                                            guildId = {this.state.activeGuild.id}
                                        />
                                    }

                                </ConnectionContext.Consumer>
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

class SubscriptionsContent extends React.Component {
    constructor(props) {
        super(props)
        this.state= {
            textChannels: [],
            epicSubActive: false,
            epicSubChannelName: "default",
            epicSubChannelId: null,
            epicSubSubmitButtonDisabled: true,
            epicSelectReady: false
        }

        this.websocket = props.websocket
        this.guildId = props.guildId
        this.token = props.token

        this.channelSwitchRef = React.createRef()
    }

    async componentDidMount() {
        this.websocket.addEventListener("message", this.listenWebsocket)
        await this.getTextChannels()

    }

    componentWillUnmount() {
        this.websocket.removeEventListener("message", this.listenWebsocket)
    }

    getSubscriptions = async () => {
        try {
            const reply = await fetch(config.botdiz_server + "/botdizguild/subscriptions/" + this.guildId, {
                method: "GET",
                credentials: "include"
            })
            .then(reply => reply.json())


            const guildSubs = reply.result
            let epicSubActive = false
            let epicSubChannelId = null
            let epicSubChannelName = "default"

            for (const sub of guildSubs) {
                if (sub.type === "epic_deals") {
                    epicSubActive = sub.active || false
                    epicSubChannelId = sub.subscribed_channel
                    for (const textChannel of this.state.textChannels) {
                        if (parseInt(sub.subscribed_channel) === parseInt(textChannel.id)){
                            epicSubChannelName = textChannel.name
                        }
                    }
                    break
                }
            }
            this.setState({
                epicSubActive: epicSubActive,
                guildSubs: guildSubs,
                epicSubChannelName: epicSubChannelName,
                epicSubChannelId: epicSubChannelId,
                epicSelectReady: true
            })

        } catch (error) {
            console.log(error)
        }
    }
    listenWebsocket = async (reply) => {
        let parsedReply;
        try {
            parsedReply = JSON.parse(reply.data)
        } catch (error) {
            console.log("Unable to parse reply")
        }
        
        if(parsedReply.command !== "RPC_getTextChannels") {
            return
        }

        if (parsedReply.result.status === "unauthorized") {
            return
        }
        

        if(Array.isArray(parsedReply.result) && parsedReply.token === this.token) {

            await this.setState(
                {
                    textChannels: parsedReply.result,
                    error: null
                }
            )

            await this.getSubscriptions()

        }
    }
    getTextChannels = async () => {
        if(!this.guildId){
            return
        }
        const message = JSON.stringify({
            type:"get",
            token: this.token,
            command: "RPC_getTextChannels",
            params: [this.guildId]
        })

        this.websocket.send(message)
    }
    epicDealChannelSelected = async (event) => {


        let selectedChannelId;
        for (const channel of this.state.textChannels) {
            if (channel.name === event.target.value) {
                selectedChannelId = channel.id
                break
            }
        }

        this.setState(
            {
                epicSubSubmitButtonDisabled: false,
                epicSubChannelId: selectedChannelId
            }
        )
    }
    handleEpicSubSwitch = async (checked) => {
        this.setState({epicSubActive: checked})

        if(this.state.epicSubChannelId || !checked) {
           this.setState({epicSubSubmitButtonDisabled: false}) 
        }
    }

    handleEpicSubAccessButton = async () => {
        console.log(this.channelSwitchRef.current.value)
        console.log(this.state.epicSubChannelId)
        console.log(this.state.epicSubActive)

        this.setState({
            savingSettings: true
        })
        const reply = await fetch(config.botdiz_server + `/botdizguild/subscriptions/${this.guildId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            credentials: 'include',
            body: JSON.stringify({
                type: "epic_deals",
                active: this.state.epicSubActive,
                subscribed_channel: this.state.epicSubChannelId
            })
        })
        .then(reply => reply.json())

        if(reply.status === "success") {
            this.setState({
                savingSettings: false,
                epicSubSubmitButtonDisabled: true,
                saveStatus: "✔️"
            })
        } else {
            this.setState({
                savingSettings: false,
                epicSubSubmitButtonDisabled: true,
                saveStatus: "❌"
            })
        }
    }
    render() {
        
        const renderTextChannels = this.state.textChannels.map((textChannel, index) => 
           <option key={index}>{textChannel.name}</option> 
        )

        return(
            <SettingContent>
                <SettingSubtitle>
                    Epic Game Deals:
                </SettingSubtitle>
                <SettingDescription style={{fontSize: "12px"}}>
                    Every week epic games releases new set of free games. Get notification every cycle.
                </SettingDescription>
                <ActiveSwitch>
                    <Text
                        style={{
                            fontSize:"14px",
                            marginRight: "10px"
                        }}
                    >
                        Active:
                    </Text>
                    <Switch 
                        checked={this.state.epicSubActive}
                        onChange={this.handleEpicSubSwitch}
                        height={22}
                        width={44}
                        name={"epic_active_switch"}
                        offColor={"#42464D"}
                        onColor={"#2fcc6f"}
                        onHandleColor="#FFFFFF"    
                    />
                </ActiveSwitch>
                {this.state.epicSelectReady && 
                <ChannelSelector>
                    <Select 
                        defaultValue={this.state.epicSubChannelName} 
                        color="purple" 
                        onChange={this.epicDealChannelSelected} 
                        ref={this.channelSwitchRef} 
                    >
                        <option value="default" disabled={true}>
                            Select text channel
                        </option>
                        {renderTextChannels}
                    </Select>
                </ChannelSelector>}
                <SubmitButtonWrapper>
                    <Button
                        color="green"
                        size="md"
                        disabled={this.state.epicSubSubmitButtonDisabled}
                        onClick={this.handleEpicSubAccessButton}
                        mr="xxs"
                    >
                        Apply
                    </Button>
                    {this.state.saveStatus}
                </SubmitButtonWrapper>
            </SettingContent>
        )
    }
}
const ActiveSwitch = styled.div`
    display: flex;
    flex-direction: row;

    align-items: center;

    margin-top: 10px;
    
`
const ChannelSelector = styled.div`
    margin-top: 20px;
    width: 300px;

    
`
export default GuildsContent