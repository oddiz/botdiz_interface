import React, { useCallback, useState } from 'react'
import styled from 'styled-components';
import { Link, Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router'
import './SettingsContent.css'
import AddUser from './AddUser/AddUser'
import Profile from './Profile/Profile'
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { accountData, connectionState } from 'components/App/Atoms';

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

type NavItem = {
    title: string;
    url: string;
    component: any;
    requireAdmin?: boolean;
}
const SettingsContent = () => {
    const location = useLocation();
    const initialLocation = location.pathname.split("/")[3]
    const { token } = useRecoilValue(connectionState)
    const accountInfo = useRecoilValue(accountData);
    const [activeSetting, setActiveSetting] = useState<NavItem | null>(null)

    const navItems: NavItem[] = [
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

    useEffect(() => {
        
        
        const initialItem = findSelectedOption(initialLocation)

        setActiveSetting(initialItem)
      
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    


    const findSelectedOption = useCallback((itemNameorUrl: string) => {

        

        //find clicked item
        let clickedItem;
        for(const item of navItems) {
            if(item.title === itemNameorUrl ||item.url === itemNameorUrl) {
                clickedItem = item
            }
        }

        return clickedItem || null
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const navItemClicked: React.MouseEventHandler<HTMLDivElement>= (event) => {
        const selectedItem = findSelectedOption(event.currentTarget.innerText)

        setActiveSetting(selectedItem)
    }

    const renderNavItems = navItems.map((item,index) => {
        if(item.requireAdmin && !accountInfo.is_admin) {
            return null
        }
        return(
            <Link className="settings_nav_link" key={index} to={"/app/settings/" + item.url}>
                <SettingsNavItem key={index} onClick={navItemClicked}>
                    {item.title}
                </SettingsNavItem>
            </Link>
        )
    })

    const renderRoutes = navItems.map((item,index) => {
        if(item.requireAdmin && !accountInfo.is_admin) {
            return null
        }
        return(
            <Route path={"/app/settings/"+item.url} key={index}>
                {activeSetting && <OptionTitle>
                    {activeSetting.title}
                </OptionTitle>}
                {React.createElement(item.component, {token: token}, null)}
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
                
                <Routes>
                    {renderRoutes}
                </Routes>
            </SettingsOptions>
        </SettingsContentWrapper>
    )
}
export default SettingsContent