import { RiDeleteBin5Fill } from 'react-icons/ri'
import { IoPlaySkipForward } from 'react-icons/io5'
import styled from 'styled-components'
import Scrollbars from 'react-custom-scrollbars'

const QueueWrapper = styled.div`

    padding-top: 0px;
    padding-left: 30px;
    padding-right: 30px;
    flex-grow:1;
    flex-shrink: 1;
    color: white;
   
    overflow-y: scroll;

    min-width: 300px;
    
    -ms-overflow-style: none;
    scrollbar-width: none;

    & h4 {
        color: #b3b3b3;
    }

    &::-webkit-scrollbar {
        display:none
    }
`

export function Queue(props) {


    return (
        <Scrollbars
            autoHide
            autoHideTimeout={1500}
            autoHideDuration={200}
        >
            <QueueWrapper>
                <h2>Queue</h2>
                <h4>Current Song</h4>
                {props.currentSong.title && <CurrentSong currentSong={props.currentSong} />}
                <h4>Next Up</h4>
                <NextUp 
                    queueDeleteClicked={props.queueDeleteClicked} 
                    queue={props.queue} 
                    queueSkipClicked={props.queueSkipClicked}    
                />
            </QueueWrapper>
        </Scrollbars>
    )
}

const SongWrapper = styled.div`
    margin: 5px 0;
    display: flex;
    flex-direction: row;

    align-items: center;
`
const StyledThumbnail = styled.img`
    height: 40px;
    min-width: 72px;
    border-radius: 10px;
    margin-right: 20px;
    
`
const SongTitle = styled.div`
    font-size: 14px;
    margin-left:10px;
    width:400px;
    flex-grow: 1;
`
const ListIndex = styled.span`
    flex-shrink: 0;
    margin-right: 25px;
    width:24px;
    font-size: 22px;
`
function CurrentSong (props) {

    return (
        <SongWrapper>
            <ListIndex>1</ListIndex>
            <StyledThumbnail src={props.currentSong.videoThumbnailUrl} alt=""></StyledThumbnail>
            <SongTitle>
                {props.currentSong.title}
            </SongTitle>
        </SongWrapper>
    )
}

const NextUpWrapper = styled.div`
    display: flex;
    flex-direction: column;
`
const DeleteIcon = styled(RiDeleteBin5Fill)`
    margin: 0 5px;
    font-size: 18px;
    flex-shrink: 0;
    color: #b3b3b3;
    cursor:pointer;

    &:hover{
        color: white;
    }
`
const SkipIcon = styled(IoPlaySkipForward)`
    font-size: 18px;
    flex-shrink: 0;
    color: #b3b3b3;
    cursor:pointer;

    &:hover{
        color: white;
    }
`
function NextUp(props) {

    const queue = props.queue
    
    
    const queueSongs = queue.map((song, index) => {
        const thumbnailUrl = `https://img.youtube.com/vi/${song.videoId}/0.jpg`
        return (
            <SongWrapper key={index}>
                <ListIndex>{index+2}</ListIndex>
                {song.videoId && <StyledThumbnail src={thumbnailUrl} alt="" />}
                <SongTitle>{song.videoTitle}</SongTitle>
                <DeleteIcon onClick={props.queueDeleteClicked} />
                <SkipIcon onClick={props.queueSkipClicked} />
            </SongWrapper>
        )
    })

    return(
        <NextUpWrapper>
            {queueSongs}
        </NextUpWrapper>
    )
}