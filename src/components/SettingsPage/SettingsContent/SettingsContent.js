import React from 'react'
import styled from 'styled-components';
import { Link, Switch, Route } from 'react-router-dom'

import AddUser from './AddUser/AddUser'

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
export default class SettingsContent extends React.Component {
    constructor(props) {
        super(props)
        this.state={

        }
        this.token = props.token
        this.accountInfo = props.accountInfo
    }


    render() {
        return(
            <SettingsContentWrapper>
                <SettingsNavWrapper>
                    <SettingsNav>

                        <SettingsNavItem className="nav_title">
                            Account Settings
                        </SettingsNavItem>
                        <SettingsNavItem>
                            Profile
                        </SettingsNavItem>
                        {this.accountInfo.is_admin && <Link to="/app/settings/adduser">
                            <SettingsNavItem to="/app/settings/adduser">
                                Add User
                            </SettingsNavItem>
                        </Link>}
                    
                    </SettingsNav>
                </SettingsNavWrapper>
                <SettingsOptions>
                        <Switch>
                            <Route exact path="/app/settings/adduser">
                                <AddUser token={this.token} />
                            </Route>
                        </Switch>
                </SettingsOptions>
            </SettingsContentWrapper>
        )
    }
}