import styled from 'styled-components'

const SongTitle = styled.div`
    font-size: 12px;
    font-weight: 600;

    word-break: keep-all;
    text-align: center;

    color: white;
`
const VideoImg = styled.img`
    height: calc(100% - 10px);
    margin: 5px;

    border-radius: 5px;

`
const SongInfoWrapper = styled.div`
    margin-right:auto;
    display: flex;
    flex-direction: row;
    
    justify-content: center;
    align-items: center;
    width: 250px;
    height: 100%;

    background-color: none;
` 
export function SongInfo (props) {
    
    return(
        <SongInfoWrapper>
            <VideoImg 
                src={props.imgUrl}
                alt="" 
            />
            <SongTitle>
                {props.songTitle}
            </SongTitle>

        </SongInfoWrapper>
    )
}