import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Box, Button } from '@dracula/dracula-ui';
import { config } from '../../../../../config';
import MenuItems from './MenuItems';
import { useRecoilState, useRecoilValue } from 'recoil';
import { accountData, connectionState } from 'components/App/Atoms';
import { accountSectionVisible } from './AccountSection';

function listenForOutsideClicks(
    listening: boolean,
    setListening: React.Dispatch<React.SetStateAction<boolean>>,
    menuRef: React.MutableRefObject<HTMLDivElement>,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
    return () => {
        if (listening) return;
        if (!menuRef.current) return;
        setListening(true);
        [`click`, `touchstart`].forEach((type) => {
            document.addEventListener(`click`, (evt) => {
                const evtTarget = evt.target as HTMLElement;
                if (menuRef.current.contains(evtTarget)) return;
                setIsOpen(false);
            });
        });
    };
}

const AccountMenuWrapper = styled.div<{isVisible: boolean}>`
    display: ${(props) => (props.isVisible ? 'inline' : 'none')};
    position: absolute;
    right: 5px;
    top: 55px;

    z-index: 99999;
`;
const Username = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    color: white;
    width: 100%;

    padding: 4px 0 5px 16px;

    box-sizing: border-box;
    margin-bottom: auto;
    font-size: 16px;
    font-weight: 600;

    border-bottom: solid 1px #4c5167;
`;
const BoxContent = styled.div`
    display: flex;
    flex-direction: column;
`;
const LogoutButton = styled.div`
    display: inline;

    width: 100%;
    //padding: 3px 3px;
    box-sizing: border-box;
    margin-top: auto;
`;
const AccountMenu = () => {
    const AccountRef = useRef(null as unknown as HTMLDivElement);
    const { token } = useRecoilValue(connectionState);
    const { username } = useRecoilValue(accountData);
    const [listening, setListening] = useState(false);
    const [menuVisible, setMenuVisible] = useRecoilState(accountSectionVisible);

    //https://github.com/Pomax/react-onclickoutside


    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(
        listenForOutsideClicks(
            listening,
            setListening,
            AccountRef,
            setMenuVisible
        )
    );

    const handleLogout = async () => {
        console.log('logoutclicked');
        console.log(token);

        fetch(config.botdiz_server + '/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }).then((data) => {
            console.log(data);
            window.location.reload();
        });
    };

    return (
        <AccountMenuWrapper isVisible={menuVisible} ref={AccountRef}>
            <Box
                color="blackSecondary"
                rounded="lg"
                borderColor="green"
                style={{ width: '180px', border: 'solid 1px #4C5167' }}
            >
                <BoxContent>
                    <Username>{username}</Username>

                    <MenuItems />

                    <LogoutButton onClick={handleLogout}>
                        <Button
                            color="red"
                            style={{
                                width: '100%',
                                borderTopLeftRadius: '0px',
                                borderTopRightRadius: '0px',
                            }}
                        >
                            Logout
                        </Button>
                    </LogoutButton>
                </BoxContent>
            </Box>
        </AccountMenuWrapper>
    );
};

export default AccountMenu;
