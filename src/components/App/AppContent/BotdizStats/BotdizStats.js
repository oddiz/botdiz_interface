import config from 'config';
import React from 'react'
import styled from 'styled-components';

const BotdizStatsWrapper = styled.div`
    max-width: 800px;
    min-width: 500px;


    margin-top:30px;
    padding: 10px;

    display: flex;
    flex-direction: column;
    
    background: #474B53;
    border-radius: 20px;
    color: white;
`;
const Stat = styled.div`
    display: flex;
    flex-direction: row;
    align-items: baseline;
`;
const StatTitle = styled.div`

    font-size: 18px;
    font-weight: 600;
    margin-right:10px;
`;
;
const StatValue = styled.div`

    font-size: 18px;
    font-weight: 500;
`;
export default class BotdizStats extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            totalGuilds: 0,
            totalPlaying: 0
        }
    }
    
    componentDidMount() {
        this.getBotdizStats()
    }

    getBotdizStats = async () => {

        try {
            
            const statsReply = await fetch(config.botdiz_server + "/botdizstats", {
                method: "GET",
                credentials: "include"
            })
            .then(reply => reply.json())
            .catch(err => {console.log("Error while trying to fetch botdiz stats"); return})

            console.log(statsReply)

            this.setState({
                totalGuilds: statsReply.result.total_guilds,
                totalPlaying: statsReply.result.total_playing
            })
        } catch (error) {
            
        }
    }
    render() {

        return (
            <BotdizStatsWrapper>
                <h2>Botdiz Stats</h2>

                <Stat>
                    <StatTitle>
                        Total Guilds:
                    </StatTitle>
                    <StatValue>
                        {this.state.totalGuilds}
                    </StatValue>
                </Stat>
                <Stat>
                    <StatTitle>
                        Total Playing:
                    </StatTitle>
                    <StatValue>
                        {this.state.totalPlaying}
                    </StatValue>
                </Stat>
            </BotdizStatsWrapper>
        )
    }
}