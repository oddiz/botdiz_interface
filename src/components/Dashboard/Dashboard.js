import React from 'react';

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: []
            
        }
        console.log(this.props)
        //sthis.websocketMessageHandler = this.websocketMessageHandler.bind(this)
    }
/*
    componentDidMount(){
        this.websocketMessageHandler()
    }

    websocketMessageHandler() {
        const { websocket } = this.props 

        websocket.onmessage = (event) => {
            this.setState({ text: event?.data})
        }
    }
*/
    render() {
        return (
            <div>
                <h2>Dashboard</h2>
                <p>{this.props.wsMessage?.data || " "}</p>
            </div>
            
        )
    }
}