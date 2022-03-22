import { atom } from 'recoil';
import { BotdizGuild } from './MyGuilds';

export const discordGuildsState = atom({
    key: 'discordGuildsState',
    default: [] as BotdizGuild[],
});
