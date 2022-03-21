import styled from 'styled-components';
import { useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { connectionState } from 'components/App/Atoms';
import { activeGuildState } from '../../Atoms';
import { currentSongState, formattedStreamTimeState } from '../Atoms';
import Slider from '@mui/material/Slider';

let lastSeekEvent = 0;

const ProgressBarWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
    padding: 0 10px;
    width: 60%;
    height: 23px;

    cursor: ${lastSeekEvent + 1000 > Date.now()? "no-drop" : "pointer"};
    
`

function MuiProgressBar () {
    const { token, websocket } = useRecoilValue(connectionState);
    const activeGuild = useRecoilValue(activeGuildState);
    const currentSong = useRecoilValue(currentSongState);
    const formattedTime = useRecoilValue(formattedStreamTimeState);
    const [position, setPosition] = useState(32);
    const [dragging, setDragging] = useState(false);

    const seekTo = useCallback( (clickedPercentage: number) => {
        if (!websocket) return;
        if (!activeGuild) return;
        const videoLenghtInMs = currentSong?.info.length
        if (!videoLenghtInMs) return;
        const seekTo = Math.floor((videoLenghtInMs * clickedPercentage) / 100);

        const RPCMessage = JSON.stringify({
            token: token,
            type: 'exec',
            command: 'RPC_seekTo',
            params: [activeGuild.id, seekTo],
        });
        websocket.send(RPCMessage);
    },[websocket, activeGuild, currentSong?.info.length, token] );

    const onChangeHandler = (e: Event, v: number | number[]) => {
        //Started dragging
        setDragging(true)
        
        if(v instanceof Array) return
        setPosition(v);
    }

    const onChangeEnded = () => {

        seekTo(position/1000)
        setTimeout(() => {
            //Can't get feedback from seek result so wait 2 seconds then, 
            //sync back to audioplayer state to prevent jitter
            setDragging(false)

        }, 2000);
    }

    return(
        <ProgressBarWrapper>
            <Slider
					aria-label="time-indicator"
					size="small"
					value={dragging? position: parseFloat(formattedTime.percentage) * 1000}
					min={0}
					step={1}
					max={100 * 1000}
					onChange={onChangeHandler}
                    onChangeCommitted = {onChangeEnded}                    
					sx={{
						color: "#b3b3b3",
						height: 4,
                        transition: "linear 0.2s all",
						"& .MuiSlider-thumb": {
							width: 8,
							height: 8,
							transition: "0.3s cubic-bezier(.47,1.64,.41,.8)",
							"&:before": {
								boxShadow: "0 2px 12px 0 rgba(0,0,0,0.4)",
							},
							"&:hover, &.Mui-focusVisible": {
								boxShadow: `0px 0px 0px 8px ${
									"rgb(255 255 255 / 16%)"
								}`,
							},
							"&.Mui-active": {
								width: 20,
								height: 20,
							},
						},
						"& .MuiSlider-rail": {
							opacity: 0.28,
						},
					}}
				/>
            
        </ProgressBarWrapper>
    )
}

export default MuiProgressBar