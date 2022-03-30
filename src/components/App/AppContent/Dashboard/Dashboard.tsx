import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import GuildBar from './GuildBar';
import ChatPage from './Chat/ChatPage';
import MusicPlayer from './MusicPlayer/MusicPlayer';
import { useRecoilState, useRecoilValue } from 'recoil';
import { connectionState } from 'components/App/Atoms';
import NoGuilds from './NoGuilds';
import { activeGuildState, allGuildsState } from './Atoms';

const DashboardWrapper = styled.div`
    width: 100%;
    height: 100%;

    flex-grow: 1;
    display: flex;
    flex-direction: row;
`;

const DashboardContent = styled.div`
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow-x: hidden;

    background-color: #202225;
`;
const GuildOptionsContent = styled.div`
    flex-grow: 1;
    height: calc(100% - var(--guild-options-height));
    border-top-left-radius: 5px;
    overflow: hidden;
    background-color: #36393f;
`;

export interface AllowedGuild {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: number;
    features: string[];
    permissions_new: string;
    iconUrl?: string;
    administrator?: boolean;
    dj_access?: boolean;
}

export interface InterfaceGuildObject {
    id: string;
    icon: string;
    dj_access?: boolean;
    administrator?: boolean;
    owner: boolean;
    name: string;
}

export interface DbSpotifyData {
    auth_token: string;
    refresh_token: string;
    expires: number;
    playlists: SpotifyApi.ListOfCurrentUsersPlaylistsResponse;
}
const Dashboard = () => {
    const [allGuilds, setAllGuilds] = useRecoilState(allGuildsState);

    const [activeGuild, setActiveGuild] =
        useRecoilState<InterfaceGuildObject | null>(activeGuildState);
    const [activeOption, setActiveOption] = useState(
        activeGuild ? 'Music Player' : '',
    );
    const { websocket, token } = useRecoilValue(connectionState);
    let _isMounted = useRef(false);

    useEffect(() => {}, [activeGuild]);

    const websocketDashboardListener = useCallback(
        (reply: MessageEvent<any>) => {
            if ((allGuilds && allGuilds.length > 0) || allGuilds === null)
                return;
            //console.log("reply recieved" ,reply)
            let parsedReply;

            try {
                parsedReply = JSON.parse(reply.data);
            } catch (error) {
                console.log(error);
                return;
            }

            if (!parsedReply.result) {
                console.log('Reply is not valid or empty: ', parsedReply);
                return;
            }
            //get Guild command
            if (parsedReply.command === 'RPC_getGuilds') {
                if (parsedReply.result.length === 0) {
                    setAllGuilds([]);

                    return;
                }
                const replyGuilds = parsedReply.result as AllowedGuild[];
                const mappedGuilds = replyGuilds.map((GuildObj) => {
                    return {
                        id: GuildObj.id,
                        icon: GuildObj.icon,
                        dj_access: GuildObj.dj_access,
                        administrator: GuildObj.administrator,
                        owner: GuildObj.owner,
                        name: GuildObj.name,
                    };
                });
                if (_isMounted.current) {
                    setAllGuilds(mappedGuilds);
                }
            } else {
                console.log('Reply is not recognized', parsedReply);
            }
        },
        [allGuilds, setAllGuilds],
    );

    const getGuilds = useCallback(async () => {
        if (!websocket) {
            return;
        }

        if (allGuilds.length > 0) return;
        if (!token) return;

        const message = {
            type: 'get',
            token: token,
            command: 'RPC_getGuilds',
            params: [],
        };

        websocket.send(JSON.stringify(message));
    }, [allGuilds.length, token, websocket]);

    useEffect(() => {
        _isMounted.current = true;

        if (!(websocket && token)) return;
        if (websocket?.readyState === WebSocket.OPEN) {
            websocket.addEventListener('message', websocketDashboardListener, {
                once: true,
            });

            getGuilds();
        }

        return () => {
            _isMounted.current = false;
            if (websocket) {
                websocket.removeEventListener(
                    'message',
                    websocketDashboardListener,
                );
            }
        };
    }, [websocket, token, websocketDashboardListener, getGuilds]);

    const RenderGuildOptionContent = useCallback(() => {
        switch (activeOption) {
            case 'Chat':
                return <ChatPage />;

            case 'Music Player':
                return <MusicPlayer />;

            default:
                return <></>;
        }
    }, [activeOption]);

    const GuildBarOnClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const clickedElement = event.target as HTMLElement;
        const parentOfParentClicked =
            clickedElement.parentElement?.parentElement;
        if (!parentOfParentClicked) return;
        const activeIndex = [...parentOfParentClicked.children].indexOf(
            clickedElement.parentElement,
        );
        if (allGuilds) {
            console.log(allGuilds[activeIndex]);
            setActiveGuild(allGuilds[activeIndex]);
            setActiveOption('Music Player');
        }
    };

    if (allGuilds === null) {
        return (
            <DashboardWrapper id="dashboard_wrapper">
                <NoGuilds />
            </DashboardWrapper>
        );
    }

    return (
        <DashboardWrapper id="dashboard_wrapper">
            <GuildBar allGuilds={allGuilds} GuildBarOnClick={GuildBarOnClick} />

            <DashboardContent>
                <GuildOptionsContent
                    id="guild_options_content"
                    key={activeGuild?.id}
                >
                    {RenderGuildOptionContent()}
                </GuildOptionsContent>
            </DashboardContent>
        </DashboardWrapper>
    );
};

export default Dashboard;
