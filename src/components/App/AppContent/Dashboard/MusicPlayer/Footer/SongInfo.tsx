import { useRecoilState, useRecoilValue } from 'recoil'
import styled from 'styled-components'
import { playerInfoState } from '../Atoms'

const SongTitle = styled.div`
    font-size: 12px;
    font-weight: 600;

    word-break: keep-all;
    text-align: center;
    margin-left:5px;

    color: white;
`
const VideoImg = styled.img`
    height: calc(140% - 10px);
    margin: 5px;

    border-radius: 5px;
    position: relative;
    bottom: -12px;
`
const SongInfoWrapper = styled.div`
    margin-right:auto;
    display: flex;
    flex-direction: row;
    
    align-items: center;
    width: 250px;
    height: 100%;

    background-color: none;
` 
export function SongInfo () {
    const playerInfo = useRecoilValue(playerInfoState)
    const imgUrl = playerInfo.videoThumbnailUrl
    const songTitle = playerInfo.currentTitle
    return(
        <SongInfoWrapper>
            <VideoImg 
                src={imgUrl}
                alt={songTitle + " thumbnail"} 
            />
            <SongTitle>
                {songTitle}
            </SongTitle>

        </SongInfoWrapper>
    )
}