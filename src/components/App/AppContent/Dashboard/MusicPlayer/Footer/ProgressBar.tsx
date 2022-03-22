import styled from 'styled-components';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { connectionState } from 'components/App/Atoms';
import { activeGuildState } from '../../Atoms';
import { currentSongState, formattedStreamTimeState } from '../Atoms';

let lastSeekEvent = 0;

const ProgressBarWrapper = styled.div`
    height: 5px;
    padding: 0 10px;
    width: 60%;

    cursor: ${lastSeekEvent + 1000 > Date.now() ? 'no-drop' : 'pointer'};
`;

const InnerBar = styled.div`
    height: 100%;

    background-color: #b3b3b3;
    border-radius: 10px;

    //transition: linear 1s all;
`;

const OuterBar = styled.div`
    height: 100%;
    width: 100%;

    position: relative;

    background-color: #535353;

    border-radius: 10px;

    display: flex;
    flex-direction: row;
    align-items: center;
`;
const PlayerDot = styled.div`
    height: 12px;
    width: 12px;
    background-color: gray;
    border-radius: 100%;
    position: relative;
    left: -5px;
    ${ProgressBarWrapper}:hover & {
        background-color: #66cc99;
    }
    //transition: linear 1s all;
`;

function ProgressBar() {
    const { token, websocket } = useRecoilValue(connectionState);
    const activeGuild = useRecoilValue(activeGuildState);
    const currentSong = useRecoilValue(currentSongState);
    const formattedTime = useRecoilValue(formattedStreamTimeState);
    const OuterBarRef = useRef<HTMLDivElement>(null);

    const onProgressbarClick = (clickedPercentage: number) => {
        if (!websocket) return;
        if (!activeGuild) return;
        const videoLenghtInMs = currentSong?.info.length;
        if (!videoLenghtInMs) return;
        const seekTo = Math.floor((videoLenghtInMs * clickedPercentage) / 100);

        const RPCMessage = JSON.stringify({
            token: token,
            type: 'exec',
            command: 'RPC_seekTo',
            params: [activeGuild.id, seekTo],
        });
        websocket.send(RPCMessage);
    };

    let dragMode = false;
    const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
        const target = event.target as HTMLDivElement;

        if (lastSeekEvent + 1000 > Date.now()) {
            console.log('too soon');
            return;
        } else if (dragMode) {
            return;
        } else if (target.id === 'player__dot') {
            return;
        } else {
            const percentage =
                (event.nativeEvent.offsetX / event.currentTarget.offsetWidth) *
                100;
            onProgressbarClick(percentage);
            lastSeekEvent = Date.now();
        }
    };
    const onStop: DraggableEventHandler = (e) => {
        if (lastSeekEvent + 1000 > Date.now()) {
            console.log('too soon');
            return;
        }
        //const percentage = e.nativeEvent.offsetX / e.currentTarget.offsetWidth *100
        const outerBarWidth = OuterBarRef.current?.offsetWidth;
        if (!outerBarWidth) return;

        const rect = OuterBarRef.current?.getBoundingClientRect();

        // @ts-ignore
        const x = Math.floor(e.clientX || 0 - rect.left);

        const percentage = (x / outerBarWidth) * 100;

        dragMode = false;

        onProgressbarClick(percentage);
        lastSeekEvent = Date.now();
    };

    const onStart: DraggableEventHandler = () => {
        //disable progressbar updates
        dragMode = true;
    };

    return (
        <ProgressBarWrapper>
            <OuterBar ref={OuterBarRef} onMouseDown={onMouseDown}>
                <InnerBar style={{ width: formattedTime.percentage + '%' }} />
                <Draggable
                    axis="x"
                    bounds="parent"
                    onStop={onStop}
                    onStart={onStart}
                    position={{ x: 0, y: 0 }}
                >
                    <PlayerDot id="player__dot" />
                </Draggable>
            </OuterBar>
        </ProgressBarWrapper>
    );
}

export default ProgressBar;
