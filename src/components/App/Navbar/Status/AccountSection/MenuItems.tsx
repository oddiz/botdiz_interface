import { activePageState } from 'components/App/Atoms';
import React from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import styled from 'styled-components';
import { MenuItemType } from '../../Navbar';
import { accountSectionVisible } from './AccountSection';

const MenuItemsWrapper = styled.div`
    display: flex;
    flex-direction: column;

    color: white;
`;
const MenuItem = styled(Link)`
    display: flex;
    flex-direction: row;
    align-items: center;

    flex: 0 0;
    padding: 8px 0 10px 16px;

    &:hover {
        background-color: #50556c;
    }
`;
const MenuItems = () => {
    const menuItems: MenuItemType[] = [
        {
            value: 'Settings',
            link: '/app/settings',
        },
    ];

    const [, setActivePage] = useRecoilState(activePageState);
    const [, setMenuVisible] = useRecoilState(accountSectionVisible);
    const clearActivePage = () => {
        setActivePage({
            index: null,
            name: null,
        });
        setMenuVisible(false);
    };

    const renderMenuItems = menuItems.map((item, index) => {
        return (
            <MenuItem key={index} to={item.link} onClick={clearActivePage}>
                {item.value}
            </MenuItem>
        );
    });
    return <MenuItemsWrapper>{renderMenuItems}</MenuItemsWrapper>;
};

export default MenuItems;
