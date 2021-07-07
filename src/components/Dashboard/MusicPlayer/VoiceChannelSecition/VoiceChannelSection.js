import React from 'react'
import styled from 'styled-components'


const VoiceChannelSectionWrapper = styled.div`
    height: 100%;
    width: 200px;

    background-color: #2f3136;
    display: flex;
    flex-direction: column;

`
export default class VoiceChannelSection extends React.Component{
    constructor(props) {
        super(props)

        this.state = {

        }

    }
    
    
    render() {

        
        
        return(
            <VoiceChannelSectionWrapper>

            </VoiceChannelSectionWrapper>
        )   
    }
}