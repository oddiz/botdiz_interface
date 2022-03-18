import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import Switch from 'react-switch';
import { config } from 'config';
import Scrollbars from 'react-custom-scrollbars';
import { Button } from '@dracula/dracula-ui';
import { useRecoilValue } from 'recoil';
import { accountData } from 'components/App/Atoms';
import { BotdizGuild } from './MyGuilds';
import { Guild } from 'discord.js';
import SubscriptionsContent from './SubscriptionsContent';

const GuildsContentWrapper = styled.div`
    flex-grow: 1;
    width: 700px;
    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;

    padding-left: 40px;
`;
const Header = styled.div`
    width: 100%;
    height: 64px;

    margin-top: 40px;

    display: flex;
    flex-direction: row;

    align-items: center;
`;
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
`;
const GuildTitle = styled.span`
    color: white;
    font-size: 24px;
    font-weight: 600;

    margin-left: 20px;
`;
const SettingsWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 30px;
`;
const Setting = styled.div`
    width: 100%;

    margin-bottom: 50px;

    display: flex;
    flex-direction: column;

    &:last-child {
        margin-bottom: 400px;
    }
`;
const SettingHeader = styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;
`;
const SettingTitle = styled.div`
    font-size: 26px;
    font-family: 'Whitney Book Regular';
    color: white;
`;
export const SettingDescription = styled.div`
    font-size: 14px;
    font-family: 'Fira Code';

    margin-top: 15px;

    color: #707683;
`;
export const SettingContentWrapper = styled.div`
    width: 100%;
    max-width: 1000px;
    flex-grow: 1;
`;
const CheckBoxWrapper = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    margin-bottom: 0px;
    width: 333px;

    align-items: center;
`;
export const SubmitButtonWrapper = styled.div`
    margin-top: 25px;
`;
const AddGuildButtonWrapper = styled.div`
    display: block;
    width: 100%;

    margin-top: 50px;
`;
const Roles = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`;
export const SettingSubtitle = styled.div`
    color: white;
    font-size: 18px;
    font-family: 'Whitney Book Regular';
    font-weight: 500;
    margin-top: 25px;
`;
const GuildsContent = (props: {
    activeGuild: BotdizGuild | null;
    addBotdizClicked: () => void;
}) => {
    const accountInfo = useRecoilValue(accountData);
    const activeGuild = props.activeGuild || null;
    const [activeGuildDetails, setActiveGuildDetails] =
        useState<DiscordGuildDetails | null>(null);
    const [djRoles, setDjRoles] = useState<string[]>([]);
    const [MPSubmitButtonDisabled, setMPSubmitButtonDisabled] = useState(true);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    const getGuildDetails = useCallback(async (guildId: string) => {
        try {
            const reply: DiscordGuildReply = await fetch(
                config.botdiz_server + '/discordguild/' + guildId,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }
            ).then((reply) => reply.json());

            if (reply.status === 'success') {
                return reply.result;
            } else {
                return null;
            }
        } catch (error) {
            console.log(
                'Error while trying to get guild info with guild id: ',
                guildId, error
            );
            return null;
        }
    }, []);

    useEffect(() => {
        if (!activeGuild) return;

        if (!accountInfo.is_admin) {
            if (!activeGuild.botdiz_guild) return;
            if (!(activeGuild.owner || activeGuild.administrator)) return;
        }

        const getGuildInfo = async () => {
            const guildDetails = await getGuildDetails(activeGuild.id);
            const djRoles = await getDjRoles(activeGuild.id);

            setActiveGuildDetails(guildDetails);
            setDjRoles(djRoles);
        };

        getGuildInfo();
        return () => {};
    }, [activeGuild, accountInfo, getGuildDetails]);

    type DiscordGuildRole = {
        id: string;
        name: string;
        color: string;
    };
    type DiscordGuildDetails = {
        guild: Guild;
        roles: DiscordGuildRole[];
    };
    type DiscordGuildReply =
        | {
              status: 'success';
              result: DiscordGuildDetails;
          }
        | {
              status: 'failed';
              message: 'string';
          };

    const getDjRoles = async (guildId: string) => {
        const reply = await fetch(
            config.botdiz_server + `/botdizguild/${guildId}`,
            {
                method: 'GET',
                credentials: 'include',
            }
        ).then((reply) => reply.json());

        if (reply.status === 'success') {
            return reply.result.dj_roles || [];
        } else {
            return [];
        }
    };

    const djRoleCheckBoxChanged = (roleId: string, value: boolean) => {
        const newDjRoles = djRoles;
        /* 
        djRoles = [
            "123123123",
            "3223232232"
            ...
        ]
        */
        if (value === true) {
            if (!djRoles.includes(roleId)) {
                newDjRoles.push(roleId);
            }
        } else if (value === false) {
            if (djRoles.includes(roleId)) {
                const roleIndex = djRoles.indexOf(roleId);
                newDjRoles.splice(roleIndex, 1);
            }
        }
        setDjRoles(newDjRoles);
        setMPSubmitButtonDisabled(false);
        setSaveStatus(null);
    };

    const handleMPAccessButton = async () => {
        if (!activeGuild) return;


        const reply = await fetch(
            config.botdiz_server + `/botdizguild/${activeGuild.id}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    dj_roles: djRoles,
                }),
            }
        ).then((reply) => reply.json());

        if (reply.status === 'success') {
            setMPSubmitButtonDisabled(true);
            setSaveStatus('✔️');
        } else {
            console.log(
                'Error while trying to save guild info with guild id: ',
                activeGuild.id
            );
            console.log('Reason: ' + reply.message);
            setMPSubmitButtonDisabled(true);
            setSaveStatus('❌');
        }
    };

    const addGuildButtonHandler = () => {
        let inviteLink;
        if (process.env.NODE_ENV === 'development') {
            inviteLink =
                'https://discord.com/oauth2/authorize?client_id=857957046297034802&scope=bot+applications.commands&permissions=2184309832';
        } else {
            inviteLink =
                'https://discord.com/oauth2/authorize?client_id=851497395190890518&scope=bot+applications.commands&permissions=2184309832';
        }
        window.open(inviteLink, '_blank');
        props.addBotdizClicked();
    };

    if (!activeGuild?.id) {
        return <div />;
    }

    if (
        !activeGuild.botdiz_guild &&
        (activeGuild.administrator || activeGuild.owner)
    ) {
        return (
            <GuildsContentWrapper>
                <Header>
                    <GuildIcon>
                        <img src={activeGuild.iconUrl || ''} alt="Guild Icon" />
                    </GuildIcon>
                    <GuildTitle>{activeGuild.name}</GuildTitle>
                </Header>
                <AddGuildButtonWrapper>
                    <Button
                        size="lg"
                        color="animated"
                        onClick={addGuildButtonHandler}
                        style={{
                            background:
                                'linear-gradient(130deg, rgba(102,204,153,1) 0%, rgba(149,208,159,1) 33%, rgba(255,248,167,1) 66%, rgba(255,198,147,1) 100%)',
                        }}
                    >
                        <span style={{ fontWeight: 600 }}>
                            Add Botdiz To Your Guild
                        </span>
                    </Button>
                </AddGuildButtonWrapper>
            </GuildsContentWrapper>
        );
    }

    if (
        activeGuild.botdiz_guild &&
        activeGuild.dj_access &&
        !(activeGuild.administrator || activeGuild.owner)
    ) {
        return (
            <GuildsContentWrapper>
                <Header>
                    <GuildIcon>
                        <img src={activeGuild.iconUrl} alt="Guild Icon" />
                    </GuildIcon>
                    <GuildTitle>{activeGuild.name}</GuildTitle>
                </Header>
                <SettingsWrapper>
                    <SettingTitle>
                        You have access to music player! 👍
                    </SettingTitle>
                </SettingsWrapper>
            </GuildsContentWrapper>
        );
    }

    if (
        activeGuild.botdiz_guild &&
        !activeGuild.dj_access &&
        !(activeGuild.administrator || activeGuild.owner)
    ) {
        return (
            <GuildsContentWrapper>
                <Header>
                    <GuildIcon>
                        <img src={activeGuild.iconUrl} alt="Guild Icon" />
                    </GuildIcon>
                    <GuildTitle>{activeGuild.name}</GuildTitle>
                </Header>
                <SettingsWrapper>
                    <SettingTitle>
                        You don't have access to this guild's Music Player
                    </SettingTitle>

                    <SettingTitle style={{ marginTop: '20px' }}>
                        Ask an administrator for access
                    </SettingTitle>
                </SettingsWrapper>
            </GuildsContentWrapper>
        );
    }

    let parseRoleCheckboxes;
    if (activeGuildDetails?.roles) {
        parseRoleCheckboxes = activeGuildDetails.roles.map((role, index) => {
            const defaultChecked = djRoles.includes(role.id);
            return (
                <RoleCheckBox
                    key={index}
                    roleColor={
                        role.color === '0' ? '#FFFFFF' : `#${role.color}`
                    }
                    roleId={role.id}
                    roleName={role.name}
                    defaultChecked={defaultChecked}
                    roleOnChange={djRoleCheckBoxChanged}
                />
            );
        });
    }
    return (
        <GuildsContentWrapper>
            <Scrollbars autoHide autoHideTimeout={1500} autoHideDuration={200}>
                <Header>
                    <GuildIcon>
                        <img src={activeGuild.iconUrl} alt="Guild Icon" />
                    </GuildIcon>
                    <GuildTitle>{activeGuild.name}</GuildTitle>
                </Header>
                <SettingsWrapper>
                    <Setting id="music_player_access">
                        <SettingHeader>
                            <SettingTitle>Music Player Access</SettingTitle>
                            <SettingDescription>
                                Only members with specified roles can access the
                                music player on Botdiz Interface.
                            </SettingDescription>
                        </SettingHeader>
                        <SettingContentWrapper>
                            <SettingSubtitle>Allowed Roles:</SettingSubtitle>
                            <Roles>{parseRoleCheckboxes}</Roles>
                        </SettingContentWrapper>

                        <SubmitButtonWrapper>
                            <Button
                                color="green"
                                size="md"
                                disabled={MPSubmitButtonDisabled}
                                onClick={handleMPAccessButton}
                                mr="xxs"
                            >
                                Apply
                            </Button>
                            {saveStatus}
                        </SubmitButtonWrapper>
                    </Setting>

                    <Setting id="subscriptions">
                        <SettingHeader>
                            <SettingTitle>Subscriptions</SettingTitle>
                            <SettingDescription>
                                Add various subscriptions to text channels
                            </SettingDescription>
                        </SettingHeader>

                        <SubscriptionsContent guildId={activeGuild.id} />
                    </Setting>
                </SettingsWrapper>
            </Scrollbars>
        </GuildsContentWrapper>
    );
};

const CheckBoxLabel = styled.label`
    margin-left: 5px;
    cursor: pointer;
`;
function RoleCheckBox(props: {
    defaultChecked: boolean;
    roleColor: string;
    roleId: string;
    roleName: string;
    roleOnChange: (roleId: string, checked: boolean) => void;
}) {
    const defaultChecked = props?.defaultChecked || false;
    const roleColor = props?.roleColor || 'white';
    const roleId = props?.roleId || 'demo';
    const roleName = props?.roleName || 'Placeholder';

    const [checked, setChecked] = useState(defaultChecked);

    const handleSwitch = (checked: boolean) => {
        setChecked(checked);
        props.roleOnChange(roleId, checked);
    };
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
            <CheckBoxLabel
                htmlFor={roleId}
                className="drac-text drac-text-white"
                style={{ color: `${roleColor}` }}
            >
                {roleName}
            </CheckBoxLabel>
        </CheckBoxWrapper>
    );
}

export default GuildsContent;
