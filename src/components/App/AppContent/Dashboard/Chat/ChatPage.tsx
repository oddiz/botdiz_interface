import styled from 'styled-components';
import ChatContent from './ChatRoomContent';
import { useRecoilValue } from 'recoil';
import { ChatPageErrorMessageState } from './Atoms';
import ChannelsBar from './TextChannelsBar';

const ChatWrapper = styled.div`
    flex-grow: 1;

    display: flex;
    flex-direction: row;

    width: 100%;
    height: 100%;
`;

const ChatPage = () => {
    const errorMessage = useRecoilValue(ChatPageErrorMessageState);

    if (errorMessage) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    fontSize: '36px',
                    color: 'red',
                    width: '100%',
                }}
            >
                {errorMessage}
            </div>
        );
    }

    return (
        <ChatWrapper>
            <ChannelsBar />
            <ChatContent />
        </ChatWrapper>
    );
};

export default ChatPage;
