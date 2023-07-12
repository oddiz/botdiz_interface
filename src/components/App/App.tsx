import React, { useCallback, useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./AppContent/Dashboard/Dashboard";
import MyGuilds from "./AppContent/MyGuilds/MyGuilds";
import Settings from "./AppContent/Settings/SettingsPage";
import Navbar from "./Navbar/Navbar";
import Login from "../Login/Login";
import { config } from "../../config";
import styled from "styled-components";
import BotdizStats from "./AppContent/BotdizStats/BotdizStats";
import { toast, ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";
import { accountData, connectionState } from "./Atoms";
import { Skeleton } from "@mui/material";
import { ValidateResponse } from "botdiz-types/server_src/routes/validate/types";

export const StyledSkeleton = styled(Skeleton)`
    &&:after {
        background: linear-gradient(90deg, transparent, rgba(119, 118, 118, 0.14), transparent);
    }
`;

let retryCounter = 0;

const AppWrapper = styled.div`
    width: 100%;
    height: 100vh;

    min-width: 850px;
    display: flex;
    flex-direction: column;
    background-color: #36393f;
`;
const AppContentWrapper = styled.div`
    flex-grow: 1;
    flex-shrink: 1;
    min-height: 250px;

    overflow-y: visible;
    overflow-x: hidden;

    display: flex;
    flex-direction: row;
    justify-content: center;
`;
const WebsocketError = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    color: #fff;
    font-size: 1.5rem;
    font-weight: bold;
`;
const App = () => {
    const [sessionValidated, setSessionValidated] = useState<boolean | null>(null);
    const [connection, setConnection] = useRecoilState(connectionState);
    const [, setAccountInfo] = useRecoilState(accountData);
    const [alreadyConnected, setAlreadyConnected] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    let [websocketErrored, setWebsocketErrored] = useState(false);

    const setupWebsocket = () => {
        const processOnMessage = (message: MessageEvent) => {
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message.data);
            } catch (error) {
                console.log("error while trying to parse ws message on App.js");
            }

            if (parsedMessage.status === "error" && parsedMessage.message === "already connected") {
                setAlreadyConnected(true);
            }

            if (parsedMessage.status === "rate_limited") {
                toast.error("Please slow down", { autoClose: 1000 });
                console.log("Rate limited");
            }
        };
        try {
            if (websocketErrored) return;
            setAlreadyConnected(false);
            if (connection && connection.websocket?.readyState === WebSocket.OPEN) {
                console.log("Websocket already exists");
                return;
            }
        } catch (error) {
            //silently fail
        }
        if (connection.websocket?.readyState === WebSocket.CONNECTING) {
            //already trying to connect
            return;
        }
        const ws = new WebSocket(config.botdiz_websocket_server);
        ws.onerror = (error) => {
            console.log("ws error", error);
            //websocket error occured so no automatic retries
            setWebsocketErrored(true);
            return;
        };
        ws.onopen = () => {
            retryCounter = 0;
            console.log("Connected to websocket", ws);
            setConnection({
                websocket: ws,
                token: token,
            });

            ws.addEventListener("message", processOnMessage);
        };

        ws.onclose = async (data) => {
            console.log("Socket is closed.");
            ws.removeEventListener("message", processOnMessage);
            //check for validation
            //if not validated reload the window so login page shows

            const response = await validateSession();

            if (!response.isValidated) {
                window.location.reload();
            }
            setConnection({ websocket: ws, token: token });
            if (retryCounter < 5) {
                await setupWebsocket();
                retryCounter++;
            } else {
                console.log("Tried to reconnect 5 times but failed. Reconnect manually.");
                return;
            }
        };
    };

    const validateSession = useCallback(async () => {
        if (sessionValidated) return { isValidated: true };
        console.log("validating session", sessionValidated);
        const response = await fetch(config.botdiz_server + "/validate", {
            method: "GET",
            credentials: "include",
        }).then((data) => data);

        const responseBody: ValidateResponse = await response.json();

        if (responseBody.isValidated) {
            setToken(responseBody.token);
            setSessionValidated(true);
            setAccountInfo(responseBody.accountInfo);
        } else {
            setSessionValidated(false);
        }

        return responseBody;
    }, [sessionValidated, setAccountInfo]);

    useEffect(() => {
        async function run() {
            if (sessionValidated === null) {
                //haven't tried to validate session yet

                await validateSession();
            } else if (sessionValidated === false) {
                //session is not validated
                console.log("session is not validated");
                return;
            } else if (sessionValidated) {
                console.log("Setting up websocket.");
                setupWebsocket();
                return;
            }
            //    .catch(err => console.log(err, "Error while trying to get token."))
        }
        run();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionValidated]);

    useEffect(() => {
        const handleWindowMessage = (message: MessageEvent<any>) => {
            try {
                if (!message.data) return;

                if (message.data.event === "discord_login" && message.data.result === "success") {
                    //force session validation
                    validateSession();
                }
            } catch (error) {}
        };

        window.addEventListener("message", handleWindowMessage);

        return () => {
            window.removeEventListener("message", handleWindowMessage);
        };
    }, [validateSession]);

    //const [token, setToken] = useState();
    if (!sessionValidated) {
        return <Login />;
    }

    if (alreadyConnected) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        width: "80%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "center",
                        paddingTop: "50px",
                    }}
                >
                    <span style={{ fontSize: "64px", marginBottom: "20px" }}>⛔</span>
                    <span style={{ fontSize: "36px", color: "var(--red)" }}>
                        You are already connected to Dashboard on another window or tab!
                    </span>
                </div>
            </div>
        );
    }

    return (
        <AppWrapper
            id="app_wrapper"
            key={Math.floor(Math.random() * 10000)}
        >
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <Navbar setupWebsocket={setupWebsocket} />
            <AppContentWrapper id="app_content_wrapper">
                {connection?.websocket?.readyState === WebSocket.CLOSED ? (
                    <WebsocketError>Websocket not connected!</WebsocketError>
                ) : (
                    <Routes>
                        <Route
                            path="dashboard"
                            element={<Dashboard />}
                        />
                        <Route
                            path="myguilds"
                            element={<MyGuilds />}
                        />
                        <Route
                            path="settings/*"
                            element={<Settings />}
                        />
                        <Route
                            path="stats"
                            element={<BotdizStats />}
                        />
                        <Route
                            path="*"
                            element={
                                <Navigate
                                    replace
                                    to="dashboard"
                                />
                            }
                        />

                        <Route
                            element={
                                <Navigate
                                    replace
                                    to="/404"
                                />
                            }
                        />
                    </Routes>
                )}
            </AppContentWrapper>
        </AppWrapper>
    );
};

export default App;
