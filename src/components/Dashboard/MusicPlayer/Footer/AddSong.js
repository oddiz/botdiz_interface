import React from 'react'
import ReactDOM from 'react-dom';
import styled from 'styled-components'
import { IoMusicalNotes } from 'react-icons/io5'
import loadingGif from './Pulse-1s-200px.svg'

const Backdrop = styled.div`
    position: fixed;
    height: 100vh;
    width: 100vw;

    top: 0; 
    left: 0;

    display:flex;
    justify-content: center;
    align-items: center;
    filter: blur(0px);
`

const SearchBarWrapper = styled.div`
    display: flex;
    flex-direction: row;
    
    align-items: center;
    
    height: 80px;
    width: 60%;

    border-radius: 15px;
    background-color: #202225;

    border: solid 1px #3FA2B3;

    opacity:0;

    transition: ease-in 0.2s all;
`
const SearchIcon = styled(IoMusicalNotes)`
    box-sizing: border-box;

    height: 100%;
    width:71px;
    
    color: #818897;
    border-right: solid 1px #3FA2B3;

    padding: 0 15px;

`
const LoadingGif = styled.img`
    box-sizing: border-box;

    height: 100%;
    width: 73.76px;
    border-right: solid 1px #3FA2B3;
    padding: 10px 0px;
`
const SearchInput = styled.input`
    box-sizing: border-box;
    height: 100%;
    width: 100%;

    font-size: 24px;

    background: transparent;
    border: none;
    outline:none;

    color: white;
    font-family: "Fira Code";

    padding-left: 15px;

    caret-color: #818897;
    
    &::placeholder {
        color: #818897;
    }
    
`
const modalRoot = document.getElementById('modal')

class Modal extends React.Component {
    constructor(props) {
        super(props)
        this.el = document.createElement('div')
    }

    componentDidMount() {
        modalRoot.appendChild(this.el);
    }
    componentWillUnmount(){
        modalRoot.removeChild(this.el);
    }
    render() {
        return ReactDOM.createPortal(
            this.props.children,
            this.el
        )
    }
}

export default class AddSong extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            processing: false,
            loaded: false
        }

        this.searchInput = React.createRef();
    }

    componentDidMount() {
        this.searchInput.current.focus()
        document.getElementById("music_search_wrapper").classList.add("visible")
        this.setState({loaded: true})
    }

    componentWillUnmount(){
        

    }


    keypressHandler = (event) => {
        if (event.key === "Enter") {
            this.setState({processing: true})
        }
    }
    render() {
        
        return(
            <Modal>
                <Backdrop id="search_backdrop" onKeyUp={this.keypressHandler} onKeyDown={this.props.searchBoxKeyboardHandler} onClick={this.props.backdropClicked}>
                    <SearchBarWrapper loaded={this.state.loaded} id="music_search_wrapper">
                        {this.state.processing? <LoadingGif src={loadingGif}/> : <SearchIcon />}
                        <SearchInput id="music_search_input" type="text" placeholder="URL or song name..." ref={this.searchInput}/>
                    </SearchBarWrapper>

                </Backdrop>
            </Modal>
        )
    }
}