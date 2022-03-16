import {config} from 'config';
import React, { useEffect, useState } from 'react'
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
    border-radius: 5px;
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
const BotdizStats = () => {
    
    const [totalGuilds, setTotalGuilds] = useState(0);
    const [totalPlaying, setTotalPlaying] = useState(0);


    useEffect(() => {

        const getBotdizStats = async () => {

            try {
                
                const statsReply = await fetch(config.botdiz_server + "/botdizstats", {
                    method: "GET",
                    credentials: "include"
                })
                .then(reply => reply.json())
    
                setTotalGuilds(statsReply.result.total_guilds)
                setTotalPlaying(statsReply.result.total_playing)
            } catch (error) {
                console.log("Error while trying to fetch botdiz stats");
            }
        }

        getBotdizStats()

    }, [])
    
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
                        {totalGuilds}
                    </StatValue>
                </Stat>
                <Stat
                    color={"purple-cyan"}
                >
                    <StatTitle>
                        Total Playing:
                    </StatTitle>
                    <StatValue>
                        {totalPlaying}
                    </StatValue>
                </Stat>

            </StatsWrapper>
        </BotdizStatsWrapper>
    )
}

export default BotdizStats