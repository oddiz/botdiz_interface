import { connectionState } from 'components/App/Atoms';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import CountUp from 'react-countup';

const WebsocketStatusIcon = styled.span`
    height: 10px;
    width: 10px;

    margin: 0 5px;
    border: 1px solid white;
    border-radius: 10px;
    margin-top: 2px;
    transition: linear 0.2s all;
    background-color: ${(props) => props.color};
`;
const WebsocketStatusWrapper = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;
const WebsocketStatusText = styled.p`
    font-family: 'Fira Code';
    margin: 0 5px;
    color: #ffffea;
    font-size: 16px;
`;
const WebsocketStatus: React.FC = () => {
    const [lastSentPingTime, setLastSentPingTime] = useState(0);
    const [latency, setLatency] = useState(0);
    const [lastLatency, setLastLatency] = useState(0);
    const { websocket } = useRecoilValue(connectionState);

    const indicatorColor =
        websocket?.readyState === WebSocket.OPEN
            ? '#8aff80'
            : websocket?.readyState === WebSocket.CONNECTING
            ? '#ffff80'
            : '#FF5230';

    const _isMountedRef = useRef(false);

    interface PingReply {
        event: 'pong';
        result: 'success';
    }

    useEffect(() => {
        const ping = () => {
            try {
                if (!websocket) return;
                websocket.send(
                    JSON.stringify({
                        type: 'ping',
                    }),
                );

                if (_isMountedRef.current) {
                    setLastSentPingTime(new Date().getTime());
                }
            } catch (error) {
                console.error('Error trying to send ping.');
            }
        };

        const pingListener = (reply: MessageEvent) => {
            try {
                const parsedReply: PingReply = JSON.parse(reply.data);

                if (parsedReply.event === 'pong') {
                    const newLatency = new Date().getTime() - lastSentPingTime;
                    if (_isMountedRef.current) {
                        setLastLatency(latency);
                        setLatency(newLatency > 1000 ? 999 : newLatency);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };
        let pingInterval: NodeJS.Timer;
        _isMountedRef.current = true;
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            pingInterval = setInterval(ping, 2000);
            websocket.addEventListener('message', pingListener);
        }

        return () => {
            _isMountedRef.current = false;
            if (websocket) {
                websocket.removeEventListener('message', pingListener);
                clearInterval(pingInterval);
            }
        };
    }, [lastSentPingTime, latency, websocket]);

    return (
        <WebsocketStatusWrapper id="websocket_status">
            <WebsocketStatusText>
                <CountUp start={lastLatency} end={latency} duration={0.5} /> ms
            </WebsocketStatusText>
            <WebsocketStatusIcon color={indicatorColor} />
        </WebsocketStatusWrapper>
    );
};

export default WebsocketStatus;
