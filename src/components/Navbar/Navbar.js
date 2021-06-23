import React from "react";
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import './Navbar.css'

function NavbarSelectedIndicator(props) {

    return (
        <div className= {props.className} />
    )
}
function NavbarItem (props) {

    return (
        <div className={`${props.active === props.value ? "active" : ""}`} >
            {props.value}
        </div>
    )
}

export default class Navbar extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            active: "Dashboard"
        }
        this.menuItems = [
            {
                value: "Dashboard",
                link: "/dashboard"
            },
            {
                value: "Stats",
                link: "/stats"
            }
        ]

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(event) {
        console.log(event.target)
        
        this.setState({active: event.target.innerHTML})
    }
    
    render() {
        const navbarItems = this.menuItems.map(item => (
            <Link className={`navbar_item ${this.state.active === item.value ? "active" : ""}`} key={item.value} to={item.link} onClick= {(event) => this.handleClick(event)}>
                {item.value}
            </Link>
        ))

        return (
            <div className="navbar_wrapper">
                <div className="navbar_items">
                        {navbarItems}
                </div>
                <NavbarSelectedIndicator className={"navbar_indicator " + this.state.active}/>    

            </div>

        )

    }
}
