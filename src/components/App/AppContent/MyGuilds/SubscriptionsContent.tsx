import { Button, Select, Switch, Text } from "@dracula/dracula-ui";
import { connectionState } from "components/App/Atoms";
import { config } from "config";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import { SettingContentWrapper, SettingDescription, SettingSubtitle, SubmitButtonWrapper } from "./MyGuildsContent";

interface DbGuildSubscriptions {
    type: string;
    active: boolean;
    subscribed_channel: string;
    last_posted_channel: string;
    last_posted_content_hash: string;
}
const SubscriptionsContent = (props: { guildId: string; }) => {
	
    const [textChannels, setTextChannels] = useState<getTextChannelsSuccess["channels"]>([]);
    const [epicSubActive, setEpicSubActive] = useState(false);
    const [epicSubChannelName, setEpicSubChannelName] = useState("default");
    const [epicSubChannelId, setEpicSubChannelId] = useState<string | null>(null);
    const [epicSubSubmitButtonDisabled, setEpicSubSubmitButtonDisabled] = useState(true);
    const [epicSelectReady, setEpicSelectReady] = useState(false);
    const [ saveStatus, setSaveStatus ] = useState("");
    const { token , websocket } = useRecoilValue(connectionState) 
    const channelSwitchRef = useRef<HTMLSelectElement>(null)

    const guildId = props.guildId;
    useEffect(() => {
        websocket?.addEventListener("message", listenWebsocket);
		getTextChannels()
    
      return () => {
        websocket?.removeEventListener("message", listenWebsocket);
      }
      
    }, [])
    
    
	const getSubscriptions = async () => {
		try {
			const reply = await fetch(config.botdiz_server + "/botdizguild/subscriptions/" + guildId, {
				method: "GET",
				credentials: "include",
			}).then((reply) => reply.json());

            if (reply.status === "failed") return

			const guildSubs: DbGuildSubscriptions[] = reply.result;
			let epicSubActive = false;
			let epicSubChannelId = null;
			let epicSubChannelName = "default";

			for (const sub of guildSubs) {
				if (sub.type === "epic_deals") {
					epicSubActive = sub.active || false;
					epicSubChannelId = sub.subscribed_channel;
					for (const textChannel of textChannels) {
						if (parseInt(sub.subscribed_channel) === parseInt(textChannel.id)) {
							epicSubChannelName = textChannel.name;
						}
					}
					break;
				}
			}

            
			
            setEpicSubActive(epicSubActive)
            setEpicSubChannelName(epicSubChannelName)
            setEpicSubChannelId(epicSubChannelId)
            setEpicSelectReady(true)

		} catch (error) {
			console.log(error);
		}
	};
    type unauthorizedResponse = {
        status: 'unauthorized';
    }
    type getTextChannelsSuccess = {
        status: 'success',
        channels: { name: string, id: string }[];
    }
    type getTextChannelsFailed = {
        status: 'failed',
        command: 'RPC_getTextChannels'
    }
    type getTextChannelsReturn = getTextChannelsSuccess | getTextChannelsFailed | unauthorizedResponse

	const listenWebsocket = async (reply: MessageEvent) => {
		let parsedReply;
		try {
			parsedReply = JSON.parse(reply.data);
		} catch (error) {
			console.log("Unable to parse reply");

            return
		}

		if (parsedReply.command !== "RPC_getTextChannels") return
        
        const textChannelsReply: getTextChannelsReturn = parsedReply.result;
        
        if (textChannelsReply.status === "unauthorized") {
            console.error("Unauthorized");
            return;
        }
        if(textChannelsReply.status === "success") {
            setTextChannels(textChannelsReply.channels)
        }

		await getSubscriptions();
	};
	const getTextChannels = async () => {
		if (!guildId) {
			return;
		}
		const message = JSON.stringify({
			type: "get",
			token: token,
			command: "RPC_getTextChannels",
			params: [guildId],
		});

		websocket?.send(message);
	};
	const epicDealChannelSelected: React.ChangeEventHandler<HTMLSelectElement> = async (event) => {
		let selectedChannelId;
		for (const channel of textChannels) {
			if (channel.name === event.target.value) {
				selectedChannelId = channel.id;
				break;
			}
		}

        if(!selectedChannelId) return

        setEpicSubSubmitButtonDisabled(false);
        setEpicSubChannelId(selectedChannelId);

		
	};

	const handleEpicSubSwitch = async (checked: any) => {
        console.log(checked)
        setEpicSubActive(checked)
		if (epicSubChannelId || !checked) {
            setEpicSubSubmitButtonDisabled(false);
		}
	};

	const handleEpicSubAccessButton: React.MouseEventHandler<HTMLButtonElement> = async () => {
		console.log(channelSwitchRef.current?.value);
		console.log(epicSubChannelId);
		console.log(epicSubActive);

		
		const reply = await fetch(config.botdiz_server + `/botdizguild/subscriptions/${guildId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				type: "epic_deals",
				active: epicSubActive,
				subscribed_channel: epicSubChannelId,
			}),
		}).then((reply) => reply.json());

		if (reply.status === "success") {
            setEpicSubSubmitButtonDisabled(true);
            setSaveStatus("✔️")
		} else {
            setEpicSubSubmitButtonDisabled(true);
            setSaveStatus("❌")
		}
	};
    const renderTextChannels = textChannels.map((textChannel, index) => (
        <option key={index}>{textChannel.name}</option>
    ));

    return (
        <SettingContentWrapper>
            <SettingSubtitle>Epic Game Deals:</SettingSubtitle>
            <SettingDescription style={{ fontSize: "12px" }}>
                Every week epic games releases new set of free games. Get notification every cycle.
            </SettingDescription>
            <ActiveSwitch>
                <Text
                    style={{
                        fontSize: "14px",
                        marginRight: "10px",
                    }}
                >
                    Active:
                </Text>
                <Switch
                    checked={epicSubActive}
                    onChange={handleEpicSubSwitch}
                    height={22}
                    width={44}
                    name={"epic_active_switch"}
                    color={"cyanGreen"}
                />
            </ActiveSwitch>
            {epicSelectReady && (
                <ChannelSelector>
                    <Select
                        defaultValue={epicSubChannelName}
                        color="purple"
                        onChange={epicDealChannelSelected}
                        ref={channelSwitchRef}
                    >
                        <option value="default" disabled={true}>
                            Select text channel
                        </option>
                        {renderTextChannels}
                    </Select>
                </ChannelSelector>
            )}
            <SubmitButtonWrapper>
                <Button
                    color="green"
                    size="md"
                    disabled={epicSubSubmitButtonDisabled}
                    onClick={handleEpicSubAccessButton}
                    mr="xxs"
                >
                    Apply
                </Button>
                {saveStatus}
            </SubmitButtonWrapper>
        </SettingContentWrapper>
    );
}
const ActiveSwitch = styled.div`
	display: flex;
	flex-direction: row;

	align-items: center;

	margin-top: 10px;
`;
const ChannelSelector = styled.div`
	margin-top: 20px;
	width: 300px;
`;

export default SubscriptionsContent;