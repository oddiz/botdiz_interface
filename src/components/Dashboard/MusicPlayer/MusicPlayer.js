import React from 'react'
import styled from 'styled-components'

const MusicPlayerWrapper = styled.div`
    flex-shrink: 1;
    width: 100%;

`

export default class MusicPlayer extends React.Component {
   

    render() {
        return(
            <MusicPlayerWrapper>
                <h2>Music Player</h2>

            </MusicPlayerWrapper>
        )
    }
}