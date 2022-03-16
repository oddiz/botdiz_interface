import { atom } from "recoil";
import { TextChannel } from "./TextChannelsBar";


export const activeTextChannelState = atom<TextChannel | null>({
    key: "activeTextChannel",
    default: null
})

export const guildTextChannelsState = atom<TextChannel[]>({
    key: "guildTextChannels",
    default: []
})

export const ChatPageErrorMessageState = atom<string | null>({
    key: "ChatPageErrorMessage",
    default: ""
})
