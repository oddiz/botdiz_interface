import { accountData } from 'components/App/Atoms';
import React from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { activeGuildState } from './Atoms';

const GuildOptionsWrapper = styled.div`
    height: var(--guild-options-height);
    flex-grow: 0;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;

    align-items: center;

    background-color: #202225;
`;

const MenuItem = styled.span`
    flex-shrink: 0;
    font-family: inherit;
    font-weight: 700;
    font-size: 16px;
    color: white;
    padding: 0px 30px;
    margin-right: 5px;
    background-color: #36393f;
    border-radius: 5px;

    transition: linear all 0.1s;
    cursor: pointer;

    &:hover {
        background-color: #8d91963f;
    }
`;

export default function GuildOptions(props: {
    onClickFunc: React.MouseEventHandler<HTMLSpanElement>;
}) {
    const guild = useRecoilValue(activeGuildState);
    const account = useRecoilValue(accountData);
    const isAdmin = account.is_admin;
    const menuItems = [];

    if (!guild) {
        console.log('No guild selected');
        return <></>;
    }

    if (guild.owner || guild.administrator || guild.dj_access || isAdmin) {
        menuItems.push('Music Player');
    }
    if (guild.owner || guild.administrator || isAdmin) {
        menuItems.push('Chat');
    }

    const menuItemsRender = menuItems.map((menuItem, index) => (
        <MenuItem key={index} onClick={props.onClickFunc}>
            {menuItem}
        </MenuItem>
    ));

    return <GuildOptionsWrapper>{menuItemsRender}</GuildOptionsWrapper>;
}
