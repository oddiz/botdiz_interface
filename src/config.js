let config
if (process.env.NODE_ENV === "development") {
    config = {
        botdiz_server: "http://localhost:8080",
        botdiz_websocket_server: "ws://localhost:8080"
    }
} else {
    config = {
    
        botdiz_server: "https://api.kaansarkaya.com:8080",
        botdiz_websocket_server: "wss://api.kaansarkaya.com:8080"
    }
}
export default config