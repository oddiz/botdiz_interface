import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { IoMusicalNotes } from 'react-icons/io5';
import loadingGif from './Pulse-1s-200px.svg';

const Backdrop = styled.div`
    position: fixed;
    height: 100vh;
    width: 100vw;

    top: 0;
    left: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    filter: blur(0px);
`;

const SearchBarWrapper = styled.div<{ loaded: boolean }>`
    display: flex;
    flex-direction: row;

    align-items: center;

    height: 80px;
    width: 60%;

    border-radius: 15px;
    background-color: #202225;

    border: solid 1px #3fa2b3;

    opacity: 0;

    transition: ease-in 0.2s all;
`;
const SearchIcon = styled(IoMusicalNotes)`
    box-sizing: border-box;

    height: 100%;
    width: 71px;

    color: #818897;
    border-right: solid 1px #3fa2b3;

    padding: 0 15px;
`;
const LoadingGif = styled.img`
    box-sizing: border-box;

    height: 100%;
    width: 73.76px;
    border-right: solid 1px #3fa2b3;
    padding: 10px 0px;
`;
const SearchInput = styled.input`
    box-sizing: border-box;
    height: 100%;
    width: 100%;

    font-size: 24px;

    background: transparent;
    border: none;
    outline: none;

    color: white;
    font-family: 'Fira Code';

    padding-left: 15px;

    caret-color: #818897;

    &::placeholder {
        color: #818897;
    }
`;

class Modal extends React.Component<any, any> {
    el: HTMLDivElement;
    modalRoot: HTMLElement | null;

    constructor(props: PropsWithChildren<{}>) {
        super(props);
        this.modalRoot = document.getElementById('modal') as HTMLElement;
        this.el = document.createElement('div');
    }

    componentDidMount() {
        this.modalRoot?.appendChild(this.el);
    }
    componentWillUnmount() {
        this.modalRoot?.removeChild(this.el);
    }
    render() {
        return ReactDOM.createPortal(this.props.children, this.el);
    }
}

interface AddSongProps {
    backdropClicked: (event: React.MouseEvent<HTMLDivElement>) => Promise<void>;
    searchBoxKeyboardHandler: (
        event: React.KeyboardEvent<HTMLDivElement>,
    ) => Promise<void>;
}
const AddSong = (props: AddSongProps) => {
    const [processing, setProcessing] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const searchInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        searchInput?.current?.focus();
        document
            .getElementById('music_search_wrapper')
            ?.classList.add('visible');

        setLoaded(true);
    }, []);

    const keypressHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            setProcessing(true);
        }
    };

    return (
        <Modal>
            <Backdrop
                id="search_backdrop"
                onKeyUp={keypressHandler}
                onKeyDown={props.searchBoxKeyboardHandler}
                onClick={props.backdropClicked}
            >
                <SearchBarWrapper loaded={loaded} id="music_search_wrapper">
                    {processing ? (
                        <LoadingGif src={loadingGif} />
                    ) : (
                        <SearchIcon />
                    )}
                    <SearchInput
                        id="music_search_input"
                        type="text"
                        placeholder="URL or song name..."
                        ref={searchInput}
                    />
                </SearchBarWrapper>
            </Backdrop>
        </Modal>
    );
};

export default AddSong;
