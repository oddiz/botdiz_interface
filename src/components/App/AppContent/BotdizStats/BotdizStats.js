import config from 'config';
import React from 'react'
import styled from 'styled-components';

const BotdizStatsWrapper = styled.div`
    height: 400px;

    margin-top:30px;
    padding-left: 20px;

    display: flex;
    flex-direction: column;
    
    color: var(--black);
`;
const Stat = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    margin: 20px;
    height: 110px;
    width: 130px;

    padding: 10px;

    background: var(--${props => props.color});
    border-radius: 15px;
`;
const StatTitle = styled.div`

    font-size: 18px;
    font-weight: 600;
`;
;
const StatValue = styled.div`

    font-size: 64px;
    font-weight: 500;
`;
const StatsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    
    width: 100%;
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
                <StatsWrapper>
                    <Stat
                        color="pink-purple"
                    >
                        <StatTitle>
                            Total Guilds:
                        </StatTitle>
                        <StatValue>
                            {this.state.totalGuilds}
                        </StatValue>
                    </Stat>
                    <Stat
                        color={"purple-cyan"}
                    >
                        <StatTitle>
                            Total Playing:
                        </StatTitle>
                        <StatValue>
                            {this.state.totalPlaying}
                        </StatValue>
                    </Stat>

                </StatsWrapper>
            </BotdizStatsWrapper>
        )
    }
}