import styled from 'styled-components';
import Draggable from 'react-draggable';
import { useRef } from 'react';

let lastSeekEvent

const ProgressBarWrapper = styled.div`
    height: 5px;
    padding: 0 10px;
    width: 60%;

    cursor: ${props => lastSeekEvent + 1000 > Date.now()? "no-drop" : "pointer"};
    
`

const InnerBar = styled.div`
    height:100%;

    background-color: #b3b3b3;
    border-radius: 10px;

    //transition: linear 1s all;
`

const OuterBar = styled.div`
    height:100%;
    width: 100%;

    position: relative;

    background-color: #535353;

    border-radius: 10px;

    display: flex;
    flex-direction: row;
    align-items: center;
    
`
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
`

function ProgressBar (props) {

    const OuterBarRef = useRef(null);


    let dragMode = false;
    const onMouseDown = (e) => {
        if(lastSeekEvent + 1000 > Date.now()){
            console.log("too soon")
            return
        } else if (dragMode) {
            return
        } else if (e.target.id === "player__dot") {
            return
        } else {
            const percentage = e.nativeEvent.offsetX / e.currentTarget.offsetWidth *100
            props.onProgressbarClick(percentage)
            lastSeekEvent = Date.now()
        }


    }
    const onStop = (e) => {
        if(lastSeekEvent + 1000 > Date.now()){
            console.log("too soon")
            return
        }
        //const percentage = e.nativeEvent.offsetX / e.currentTarget.offsetWidth *100
        const outerBarWidth = OuterBarRef.current.offsetWidth;
        
        const rect = OuterBarRef.current.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);


        const percentage = x / outerBarWidth *100

        dragMode = false;

        props.onProgressbarClick(percentage)
        lastSeekEvent = Date.now()

    }

    const onStart = () => {
        //disable progressbar updates
        dragMode = true;

    }


    return(
        <ProgressBarWrapper>
            <OuterBar ref={OuterBarRef}  onMouseDown={onMouseDown} >
                <InnerBar  style={{width: props.percentage+"%"}} />
                <Draggable
                    axis='x'
                    bounds="parent"
                    onStop={onStop}
                    onStart={onStart}
                    position={{x: 0, y: 0}}
                >
                    <PlayerDot percentage={props.percentage} id="player__dot"/>
                </Draggable>
            </OuterBar>
            
        </ProgressBarWrapper>
    )
}

export default ProgressBar