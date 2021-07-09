import React from 'react'
import styled from 'styled-components';
import { Link, Switch, Route } from 'react-router-dom'

import AddUser from './AddUser/AddUser'
import Profile from './Profile/Profile'

const SettingsOptions = styled.div`
    flex-grow: 1;

    display: flex;
    flex-direction: column;
    padding: 0 3em;
    
`;
const SettingsNavWrapper = styled.div`
    flex-shrink: 0;

    
    width: 230px;
    
`;
const SettingsNav = styled.div`
    display: flex;
    flex-direction: column;
    
    width: 100%;
    border: solid 1px #6F7582; 
    border-radius: 5px;
`;
const SettingsContentWrapper = styled.div`
    display: flex;
    flex-direction: row;
    
    flex-grow: 1;
    
    color: white;
`;
const SettingsNavItem = styled.div`
    box-sizing: border-box;
    width: 100%;
    border-bottom: solid 1px #6F7582;

    
    padding: 10px 0;
    padding-left: 20px;
    
    &:hover{
        background: #51555E;
        cursor: pointer;
    }

    &.nav_title {
        font-weight: 600;
    border-bottom: solid 2px #6F7582;

    }
    &.nav_title:hover {
        background: initial;
        cursor: default;
    }
    &:last-child {
        border:none;
    }
`;
const OptionTitle = styled.div`
    font-size: 1.5em;

    font-weight: 500;
    padding-bottom: 25px;

    &::after {
        display:block;
        content: "";
        width: 100%;
        height: 2px;

        margin-top: 10px;
        background-color: #4B4F57;
        border-radius: 5px;
    }
`;
export default class SettingsContent extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            activeSetting: null
        }
        this.token = props.token
        this.accountInfo = props.accountInfo
        this.initialLocation = props.location.pathname.split("/")[3]

        this.navItems = [
            {
                title: "Profile",
                url: "profile",
                component: Profile
            },
            {
                title: "Add User",
                url: "adduser",
                component: AddUser,
                requireAdmin: true
            }
        ]
    }

    componentDidMount() {
        const initialItem = this.findSelectedOption(this.initialLocation)
        console.log(initialItem)
        this.setState({activeSetting: initialItem})
        
    }


    findSelectedOption = (itemNameorUrl) => {
        //find clicked item
        let clickedItem;
        for(const item of this.navItems) {
            if(item.title === itemNameorUrl ||item.url === itemNameorUrl) {
                clickedItem = item
            }
        }

        return clickedItem
    }

    navItemClicked = (event) => {
        console.log(event.currentTarget.innerText)
        const selectedItem = this.findSelectedOption(event.currentTarget.innerText)
        this.setState({activeSetting: selectedItem})
    }
    render() {

        const renderNavItems = this.navItems.map((item,index) => {
            if(item.requireAdmin && !this.accountInfo.is_admin) {
                return null
            }
            return(
                <Link key={index} to={"/app/settings/" + item.url}>
                    <SettingsNavItem onClick={this.navItemClicked}>
                        {item.title}
                    </SettingsNavItem>
                </Link>
            )
        })

        const renderRoutes = this.navItems.map((item,index) => {
            if(item.requireAdmin && !this.accountInfo.is_admin) {
                return null
            }
            return(
                <Route exact path={"/app/settings/"+item.url} key={index}>
                    {this.state.activeSetting && <OptionTitle>
                        {this.state.activeSetting.title}
                    </OptionTitle>}
                    {React.createElement(item.component, {token: this.token}, null)}
                </Route>
            )
        })

        return(
            <SettingsContentWrapper id="settings_content_wrapper">
                <SettingsNavWrapper>
                    <SettingsNav>

                        <SettingsNavItem className="nav_title">
                            Account Settings
                        </SettingsNavItem>
                        {renderNavItems}
                    
                    </SettingsNav>
                </SettingsNavWrapper>
                <SettingsOptions>
                    
                    <Switch>
                        {renderRoutes}
                    </Switch>
                </SettingsOptions>
            </SettingsContentWrapper>
        )
    }
}