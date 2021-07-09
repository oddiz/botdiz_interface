import React from 'react'
import styled from 'styled-components';
import SettingsContent from './SettingsContent/SettingsContent'

const SettingsPageWrapper = styled.div`
    height: 100%;
    width: 100%;

    display:block;
`;
const SettingsPageContent = styled.div`
box-sizing: border-box;
    display:flex;
    flex-direction: column;
    height: 100%;
    max-width: 1000px;
    
    margin-left: auto;
    margin-right: auto;

    padding-top: 50px;

`
const AccountInfoHeader = styled.div`
    display: flex;
    flex-direction: row;
    
    margin: 20px 0;

    
`;
const ProfilePic = styled.img`
    width: 60px;
    height: 60px;

    border-radius:999px;

    border:solid 2px #6e7581; 
`
const UserName = styled.span`
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 24px;

    margin-left: 20px;
    margin-bottom: 8px;
    color: white;
`;

export default class SettingsPage extends React.Component {
    constructor(props) {
        super(props)

        this.state = {

        }

        this.accountInfo = props.accountInfo;
        this.token = props.token;
    }

    render() {
        return (
            <SettingsPageWrapper id="settings_page_wrapper">
                <SettingsPageContent id="settings_page_content">
                    
                    <AccountInfoHeader>
                        <ProfilePic src={this.accountInfo.avatarURL} alt="Profile Pic" />
                        <UserName>
                            {this.accountInfo.username}
                        </UserName>
                    </AccountInfoHeader>

                    <SettingsContent 
                        token={this.token}
                        accountInfo={this.accountInfo}
                        location={this.props.location}
                    />

                    
                </SettingsPageContent>
            </SettingsPageWrapper>
        )
    }
}