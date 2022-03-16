import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./AppContent/Dashboard/Dashboard";
import MyGuilds from "./AppContent/MyGuilds/MyGuilds";
import Settings from "./AppContent/Settings/SettingsPage";
import Navbar from "./Navbar/Navbar";
import Login from "../Login/Login";
import { config } from "../../config";
import styled from "styled-components";
import NotFoundPage from "../../404";
import BotdizStats from "./AppContent/BotdizStats/BotdizStats";
import { ToastContainer } from "react-toastify";
import { useRecoilState } from "recoil";
import { accountData, connectionState } from "./Atoms";
export interface ValidateUserData {
    username: string;
    avatarURL: string;
    is_admin: boolean;
    user_id?: string;
}

type ValidateResponse = {
    isValidated: true;
    accountInfo: ValidateUserData;
    token: string;
} | {
    isValidated: false;
}

const AppWrapper = styled.div`
	width: 100%;
	height: 100vh;

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

let retryCounter = 0;

const App = () => {

    const [sessionValidated, setSessionValidated] = useState<boolean | null>(null);
    const [connection, setConnection] = useRecoilState(connectionState);
    const [, setAccountInfo] = useRecoilState(accountData);
    const [alreadyConnected, setAlreadyConnected] = useState(false);
    const [token, setToken] = useState<string | null>(null);
	
    
    const setupWebsocket = () => {
        try {
            setAlreadyConnected(false)
            if (connection && connection.websocket?.readyState === WebSocket.OPEN) {
                connection.websocket.close();

                return;
            }
            console.log("Closed existing websocket");
        } catch (error) {
            //silently fail
        }
        if (connection.websocket?.readyState === WebSocket.CONNECTING) {
            //already trying to connect
            return;
        }
        const ws = new WebSocket(config.botdiz_websocket_server);

        ws.onopen = () => {
            retryCounter = 0;
            console.log("Connected to websocket");
            setConnection(
                { 
                    websocket: ws,
                    token: token 
                }
            );

            ws.onmessage = (message) => {
                let parsedMessage;
                try {
                    parsedMessage = JSON.parse(message.data);
                } catch (error) {
                    console.log("error while trying to parse ws message on App.js");
                }

                if (parsedMessage.status === "error" && parsedMessage.message === "already connected") {
                    setAlreadyConnected(true);
                }
            };
        };

        ws.onclose = async (data) => {
            console.log("Socket is closed.");

            //check for validation
            //if not validated reload the window so login page shows

            const response = await validateSession();

            if (!response.isValidated) {
                window.location.reload();
            }
            setConnection({ websocket: ws, token: token });
            if (retryCounter < 5) {
                await setupWebsocket();
                retryCounter ++;
            } else {
                console.log("Tried to reconnect 5 times but failed. Reconnect manually.");
                return;
            }
        };
    }

    const validateSession = async () => {
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
    }
    
    useEffect(() => {
        async function run() {
            if (sessionValidated === null) {
                //haven't tried to validate session yet

                await validateSession();
            } else if(sessionValidated === false) {
                //session is not validated
                console.log("session is not validated")
                return
            } else {
                setupWebsocket();
            }
			//    .catch(err => console.log(err, "Error while trying to get token."))

		}
		run();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection, sessionValidated, token])

	//const [token, setToken] = useState();
    if (!sessionValidated) {
        return <Login />;
    }

    if (!(connection.websocket?.readyState === WebSocket.OPEN)) {
        return <div></div>;
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
        <BrowserRouter>
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
            
            <AppWrapper id="app_wrapper" key={Math.floor(Math.random() * 10000)}>
                <Navbar
                    key={connection.websocket?.readyState + "_navbar"}
                    setupWebsocket={setupWebsocket}
                />

                <AppContentWrapper id="app_content_wrapper">
                    <Routes>
                    <Route path="/app/dashboard" element={<Dashboard />} />

                    <Route path="/app/myguilds" element={<MyGuilds />} />
                    <Route path="/app/settings" element={<Settings />} />
                    <Route path="/app/stats" element={<BotdizStats />} />
                    <Route path="/app" element={<Navigate replace to="/app/dashboard" />} />
                        
                    <Route element={<Navigate replace to="/404" />} />
        
                       
                    </Routes>
                </AppContentWrapper>
            </AppWrapper>
        </BrowserRouter>
    );
}

export default App