import { atom } from 'recoil';
import { ValidateUserData } from './App';

export interface ConnectionState {
    token: string | null;
    websocket: WebSocket | null;
}
export const connectionState = atom({
    key: 'connectionState',
    default: {
        token: null,
        websocket: null,
    } as ConnectionState,
});

export const accountData = atom({
    key: 'accountData',
    default: {
        username: '',
        avatarURL: '',
        is_admin: false,
        user_id: '',
    } as ValidateUserData,
});

interface ActivePageData {
    index: number | null;
    name: string | null;
}
export const activePageState = atom({
    key: 'activePageState',
    default: {
        index: null,
        name: null,
    } as ActivePageData,
});
