export interface BotdizConfig {
    botdiz_server: string;
    botdiz_websocket_server: string;
    botdiz_interface: string;
    botdiz_discordId: string;
}

export let config: BotdizConfig;

if (process.env.NODE_ENV === "development") {
    config = {
        botdiz_server: "http://localhost:8080",
        botdiz_websocket_server: "ws://localhost:8080",
        botdiz_interface: "http://localhost:3000",
        botdiz_discordId: "857957046297034802"
    }

} else {
    config = {
    
        botdiz_server: "https://api.kaansarkaya.com:8080",
        botdiz_websocket_server: "wss://api.kaansarkaya.com:8080",
        botdiz_interface: "https://botdiz.kaansarkaya.com",
        botdiz_discordId: "851497395190890518"
    }
}