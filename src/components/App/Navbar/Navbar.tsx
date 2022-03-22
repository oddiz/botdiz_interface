import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import './Navbar.css';
import { ReactComponent as Logo } from './botdiz.svg';
import Status from './Status/Status';
import { useRecoilState } from 'recoil';
import { activePageState } from '../Atoms';

//STATUS SECTION

//NAVBAR ITEMS SECTION
function getTextWidth(text: string, font: string) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) return 0;

    context.font = font || getComputedStyle(document.body).font;

    return context.measureText(text).width || 0;
}

function calculateIndicator(props: {
    activeIndex: number | null;
    activeName: string | null;
    menuItems: { value: string; link: string }[];
}) {
    //console.log(props)
    const font = '20px Whitney Semibold Regular';
    const activeName = props.activeName;
    const activeIndex = props.activeIndex || 0;
    const menuItems = props.menuItems;

    if (!menuItems || !activeName || activeIndex === null) return;

    const itemMargin = 20;

    let totalWidth = 0;
    let totalDistanceFromLeft = 20;

    for (let i = 0; i < menuItems.length; i++) {
        const textWidth = getTextWidth(menuItems[i].value, font);
        const itemWidth = itemMargin + textWidth + itemMargin;
        if (i < activeIndex) {
            totalDistanceFromLeft += itemWidth;
        }
        totalWidth += itemWidth;
    }

    //console.log("Total distance from left :", totalDistanceFromLeft)

    const activeWidth = getTextWidth(activeName, font);

    //console.log("Active width: ",activeWidth)

    return {
        left: totalDistanceFromLeft + activeWidth / 2,
        width: activeWidth,
        totalWidth: totalWidth,
    };
}

const NavbarSelectedIndicator = styled.div.attrs(calculateIndicator)`
    height: 5px;
    width: ${(props) => props.totalWidth}px;
    background: linear-gradient(
        90deg,
        rgba(120, 107, 201, 1) 0%,
        rgba(106, 192, 188, 1) 12%,
        rgba(255, 247, 132, 1) 24%,
        rgba(255, 138, 186, 1) 36%,
        rgba(120, 107, 201, 1) 48%,
        rgba(106, 192, 188, 1) 60%,
        rgba(255, 247, 132, 1) 72%,
        rgba(255, 138, 186, 1) 84%,
        rgba(120, 107, 201, 1) 100%
    );

    clip-path: ellipse(
        ${(props) => props.width / 2}px 4px at ${(props) => props.left}px 0px
    );

    transition: cubic-bezier(0.47, 0.17, 0.23, 1.33) all 0.4s, linear width 0.1s;

    &.hide {
        width: 0;
    }
`;
const NavLink = styled(Link)`
    display: inline-block;
    margin: 0 20px;

    font-size: 20px;
    font-family: 'Whitney Semibold Regular', 'Helvetica Neue', 'Helvetica',
        'Arial', sans-serif;

    user-select: none;
    transition: linear all 0.2s;

    &.active {
        color: white;
    }
`;
const StyledLogo = styled(Logo)`
    height: 20px;
    width: auto;
    margin-left: 5px;
    padding: 4px 8px;
`;

export interface MenuItemType {
    value: string;
    link: string;
}
const Navbar = (props: { setupWebsocket: () => void }) => {
    const menuItems = useRef<MenuItemType[]>([
        {
            value: 'Dashboard',
            link: '/app/dashboard',
        },
        {
            value: 'My Guilds',
            link: '/app/myguilds',
        },
        {
            value: 'Botdiz Stats',
            link: '/app/stats',
        },
    ]);

    let initialLocation = window.location.pathname;

    if (initialLocation === '/app') {
        initialLocation = '/app/dashboard';
    }

    const [activePage, setActivePageState] = useRecoilState(activePageState);

    useEffect(() => {
        let initialIndex = null,
            initialMenuItem = null;
        for (const [index, menuItem] of menuItems.current.entries()) {
            if (menuItem.link === initialLocation) {
                initialIndex = index;
                initialMenuItem = menuItem;
            }
        }

        setActivePageState({
            index: initialIndex,
            name: initialMenuItem?.value || null,
        });
    }, [initialLocation, setActivePageState]);

    const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
        const clickedElement = event.target as HTMLElement;
        if (!clickedElement || !clickedElement.parentElement) return;
        const activeIndex = [...clickedElement.parentElement.children].indexOf(
            clickedElement,
        );

        setActivePageState({
            index: activeIndex,
            name: clickedElement.innerHTML,
        });
    };

    const navbarItems = menuItems.current.map((item, index) => (
        <NavLink
            className={`${activePage.index === index ? 'active' : ''}`}
            key={item.value + Math.floor(Math.random() * 1000)}
            to={item.link}
            onClick={(event) => handleClick(event)}
            draggable={false}
        >
            {item.value}
        </NavLink>
    ));

    return (
        <div className="navbar_wrapper">
            <StyledLogo />
            <div className="navbar_items_wrapper">
                <div className="navbar_items" draggable={false}>
                    {navbarItems}
                </div>
                <NavbarSelectedIndicator
                    className={
                        typeof activePage.index === 'number' ? '' : 'hide'
                    }
                    activeIndex={activePage.index}
                    activeName={activePage.name}
                    menuItems={menuItems.current}
                />
            </div>
            <Status setupWebsocket={props.setupWebsocket} />
        </div>
    );
};

export default Navbar;
