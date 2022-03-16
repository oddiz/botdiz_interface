import { atom } from "recoil";
import { InterfaceGuildObject } from "./Dashboard";

export const activeGuildState= atom<InterfaceGuildObject | null>({
    key: "activeGuildState",
    default: null
})