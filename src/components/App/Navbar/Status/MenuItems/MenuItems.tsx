import React from 'react'
import { Link } from 'react-router-dom'

import styled from 'styled-components';

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
        background-color: #50556C;
    }

`;
export default class MenuItems extends React.Component {
    constructor(props) {
        super(props)

        this.menuItems=[
            {
                title: "Settings",
                link: "/app/settings"
            }
        ]
    }


    render() {
        const renderMenuItems = this.menuItems.map((item, index) => {
            return(
                <MenuItem key={index}
                    to={item.link}
                    onClick={this.props.menuItemClicked}
                >
                    {item.title}
                </MenuItem>
            )
        })
        return(
            <MenuItemsWrapper>
                {renderMenuItems}
            </MenuItemsWrapper>
        )
    }
};

