import { Box, Button, Heading, Text } from '@dracula/dracula-ui';
import { useState } from 'react';
import { IoRefresh } from 'react-icons/io5';
import styled from 'styled-components';

const NoGuildsWrapper = styled.div`
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;
const ButtonsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;
function NoGuilds() {
    const [buttonClicked, setButtonClicked] = useState(false);

    const addGuildButtonHandler = () => {
        let inviteLink;
        if (process.env.NODE_ENV === 'development') {
            inviteLink =
                'https://discord.com/oauth2/authorize?client_id=857957046297034802&scope=bot+applications.commands&permissions=2184309832';
        } else {
            inviteLink =
                'https://discord.com/oauth2/authorize?client_id=851497395190890518&scope=bot+applications.commands&permissions=2184309832';
        }
        window.open(inviteLink, '_blank');
        setButtonClicked(true);
    };
    const refreshClicked = () => {
        window.location.reload();
    };

    return (
        <NoGuildsWrapper>
            <Box
                width="xl"
                rounded="lg"
                p="md"
                style={{
                    border: 'solid 4px #606570',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontWeight: '600',
                }}
            >
                <Heading
                    m="lg"
                    size="2xl"
                    color="red"
                    style={{
                        textAlign: 'center',
                        marginBottom: '10px',
                    }}
                >
                    No Guilds Found
                </Heading>
                <Text as="p">
                    Start by clicking{' '}
                    <span
                        style={{
                            fontSize: '24px',
                            fontFamily: 'Whitney Semibold Regular',
                            color: '#8d9196',
                        }}
                    >
                        My Guilds
                    </span>{' '}
                    to see the guilds you can add Botdiz to.
                </Text>

                <Text mt="lg" mb="sm" as="p" align="center">
                    Or click the button below!
                </Text>
                <ButtonsWrapper>
                    <Button
                        size="lg"
                        color="animated"
                        onClick={addGuildButtonHandler}
                        style={{
                            background:
                                'linear-gradient(130deg, rgba(102,204,153,1) 0%, rgba(149,208,159,1) 33%, rgba(255,248,167,1) 66%, rgba(255,198,147,1) 100%)',
                        }}
                    >
                        <span style={{ fontWeight: 600 }}>
                            Add Botdiz To Your Guild
                        </span>
                    </Button>
                    {buttonClicked && (
                        <Button
                            color="green"
                            onClick={refreshClicked}
                            ml="xs"
                            style={{
                                height: '48px',
                                width: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px',
                            }}
                        >
                            <IoRefresh
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    stroke: 'black',
                                    strokeWidth: '10',
                                }}
                            />
                        </Button>
                    )}
                </ButtonsWrapper>
            </Box>
        </NoGuildsWrapper>
    );
}

export default NoGuilds;
