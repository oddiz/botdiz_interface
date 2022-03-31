import React, { useRef, useState } from 'react';
import { config } from 'config';
import './Login.css';
import '@dracula/dracula-ui/styles/dracula-ui.css';
import { Card, Text, Box, Input, Button, Heading } from '@dracula/dracula-ui';
import ReCAPTCHA from 'react-google-recaptcha';
import LoadingIcon from './loading.svg';
import DiscordIcon from './dclogo.svg';
import styled from 'styled-components';

type ICredentials = {
    username: string;
    password: string;
    reCaptchaToken: string;
};

export const DISCORD_LOGIN_URL =
    process.env.NODE_ENV === 'development'
        ? 'https://discord.com/api/oauth2/authorize?client_id=857957046297034802&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fdiscordlogin&response_type=code&scope=identify%20email%20guilds'
        : 'https://discord.com/api/oauth2/authorize?client_id=851497395190890518&redirect_uri=https%3A%2F%2Fbotdiz.kaansarkaya.com%2Fdiscordlogin&response_type=code&scope=identify%20email%20guilds';

async function loginUser(credentials: ICredentials) {
    return fetch(config.botdiz_server + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    })
        .then((reply) => reply.json())
        .catch((err) => err);
}
const LoadingIconWrapper = styled.img`
    height: 100%;
`;
const LoginWithDiscord = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    height: 40px;
    width: 308px;

    margin-top: 0.3em;
    margin-left: 3px;

    border-radius: 0.5em;
    background: #5865f2;

    font-weight: 700;
    color: white;

    cursor: pointer;

    &:hover {
        background: #7983f5;
    }
`;
const LoginWithDiscordIcon = styled.img`
    height: 70%;
    margin-right: 0.8em;
`;
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const reCaptchaRef = useRef<ReCAPTCHA>(null);
    const adminLogin =
        new URLSearchParams(window.location.search).get('admin') !== null;
    const reCaptchaKey = process.env.REACT_APP_RECAPTCHA_SITEKEY;

    if (!reCaptchaKey) {
        console.error('No reCaptcha Key found in server.');

        return (
            <div className="login_wrapper">
                Error with reCaptcha token. Please try again.
            </div>
        );
    }
    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
        event,
    ) => {
        event.preventDefault();
        if (loading) {
            console.log('Already trying to log in');
        }

        setLoading(true);
        setLoginError(null);

        const reCaptchaToken = await reCaptchaRef.current?.executeAsync();

        if (!reCaptchaToken) {
            console.log('No reCaptcha token');
            setLoading(false);

            return (
                <div className="login_wrapper">
                    Error with reCaptcha token. Please try again.
                </div>
            );
        }

        const credentials: ICredentials = {
            username: username,
            password: password,
            reCaptchaToken: reCaptchaToken,
        };

        if (!(credentials.username && credentials.password)) {
            setLoginError('Cannot leave username or password empty');
        }
        const response = await loginUser(credentials);
        console.log(response);
        if (response.result === 'OK') {
            console.log('Login successful');
            window.location.reload();
        } else {
            setLoading(false);
            setLoginError(response.message);
        }
    };

    const handleDiscordLogin = async () => {
        window.open(
            DISCORD_LOGIN_URL,
            'Login with Discord',
            'width=600,height=1000',
        );
    };

    return (
        <div className="login_wrapper">
            {loginError && (
                <Card variant="subtle" color="pink" p="md" mt="md">
                    <Text color="pink">{loginError}</Text>
                </Card>
            )}
            <Box
                color="purpleCyan"
                rounded="lg"
                as="div"
                height="auto"
                width="sm"
                m="md"
                borderColor="pink"
                style={{
                    padding: '3px',
                }}
            >
                <Box
                    style={{ backgroundColor: '#1d1e26' }}
                    className="drac-black-secondary"
                    p="md"
                    rounded="lg"
                    as="div"
                    height="full"
                    width="auto"
                >
                    <Heading
                        m="xxs"
                        style={{
                            marginBottom: '1.2em',
                            textAlign: 'center',
                        }}
                    >
                        Welcome to Botdiz Interface
                    </Heading>
                    {adminLogin && (
                        <form
                            onSubmit={handleSubmit}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <Input
                                color="purple"
                                variant="normal"
                                borderSize="md"
                                placeholder="Username"
                                m="xxs"
                                style={{ marginLeft: 0 }}
                                onChange={(input) => {
                                    setUsername(input.target.value);
                                }}
                            />
                            <Input
                                borderSize="md"
                                color="purple"
                                variant="normal"
                                placeholder="Password"
                                style={{ marginLeft: 0 }}
                                m="xxs"
                                onChange={(input) => {
                                    setPassword(input.target.value);
                                }}
                                type="password"
                            />
                            <Button
                                type="submit"
                                color="animated"
                                mt="md"
                                style={{
                                    marginLeft: 0,
                                    width: '308px',
                                    alignSelf: 'center',
                                }}
                                onClick={() => {}}
                            >
                                {loading ? (
                                    <LoadingIconWrapper
                                        src={LoadingIcon}
                                        alt="loading_icon"
                                    />
                                ) : (
                                    'Login'
                                )}
                            </Button>
                        </form>
                    )}
                    <LoginWithDiscord onClick={handleDiscordLogin}>
                        <LoginWithDiscordIcon src={DiscordIcon} />
                        Login With Discord
                    </LoginWithDiscord>
                </Box>
            </Box>
            <ReCAPTCHA
                style={{ display: 'inline-block' }}
                theme="dark"
                size="invisible"
                ref={reCaptchaRef}
                sitekey={reCaptchaKey}
            />
        </div>
    );
};

export default Login;
