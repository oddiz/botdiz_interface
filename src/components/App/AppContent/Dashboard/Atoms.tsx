import { atom } from "recoil";
import { InterfaceGuildObject } from "./Dashboard";

export const activeGuildState= atom<InterfaceGuildObject | null>({
    key: "activeGuildState",
    default: null
})

export const allGuildsState = atom<InterfaceGuildObject[]>({
    key: "dashboardGuildsState",
    default: []
})