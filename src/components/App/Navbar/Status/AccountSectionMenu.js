import React from 'react'
import styled from 'styled-components'
import onClickOutside from 'react-onclickoutside'
import { Box, Button } from '@dracula/dracula-ui'
import config from '../../../../config'
import MenuItems from './MenuItems/MenuItems'
const AccountMenuWrapper = styled.div`
    display: ${props => props.visible? "inline":"none"};
    position: absolute;
    right:5px;
    top:55px;

    z-index:99999;

`
const Username = styled.div`
    display:flex;
    flex-direction: row;
    align-items: center;
    color: white;
    width: 100%;
    
    box-sizing: border-box;
    margin-bottom: auto;
    padding: 5px 5px;
    font-size: 16px;
    
    border-bottom: solid 1px #4C5167;
`
const UsernameTitle = styled.span`
    font-size: 12px;
    color: white;
    margin-right: 5px;
`
const BoxContent = styled.div`
    display: flex;
    flex-direction: column;

`
const LogoutButton = styled.div`
    display:inline;

    width: 100%;
    //padding: 3px 3px;
    box-sizing: border-box;
    margin-top:auto;
`
class AccountMenu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: props.isVisible
        }
        
        this.token = props.token
        this.username = props.accountInfo.username
        this.handleOutsideClick = props.outsideClickFunc

        this.AccountRef= React.createRef()
    }
    
    //https://github.com/Pomax/react-onclickoutside
    handleClickOutside = event => {
        
        this.handleOutsideClick(event)
    }
    setClickOutsideRef = () => {
   
        return this.AccountRef.current
    }


    handleLogout = async event => {
        console.log("logoutclicked")
        console.log(this.token)

        fetch(config.botdiz_server + '/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(data => {
            console.log(data)
            window.location.reload()
        })
    }
    render() {

        return(
            <AccountMenuWrapper key={this.state.visible} visible={this.state.visible} ref={this.AccountRef}>
                <Box
                    color="blackSecondary"
                    rounded="lg"
                    borderColor="green"
                    style={{width: "180px", border:"solid 1px #4C5167"}}
                >
                    <BoxContent>
                        <Username>
                            <UsernameTitle>
                                Logged in as:
                            </UsernameTitle>
                            {this.username}
                        </Username>

                        <MenuItems menuItemClicked={this.props.menuItemClicked} />

                        <LogoutButton onClick={this.handleLogout}>
                            <Button 
                                color="red"
                                style={{width: "100%", borderTopLeftRadius: "0px", borderTopRightRadius: "0px"}}
                            >
                                Logout
                            </Button>
                        </LogoutButton>
                    </BoxContent>
                </Box>

            </AccountMenuWrapper>
        )
    }
}



export default onClickOutside(AccountMenu)