import { formatStreamTime } from 'components/helpers';
import { GuildMember, User } from 'discord.js';
import { atom, selector } from 'recoil';
import { Track } from 'shoukaku';

export interface BotdizTrack {
    info: {
        artist: string;
        trackName: string;
        title: string;
    };
    isSpotify: boolean;
    recommendedSong?: boolean;
}
export interface BotdizShoukakuTrack extends Track {
    recommendedSong?: boolean;
    thumbnail?: string;
}
interface SkipData {
    skipAmount: number;
    currentSong: BotdizShoukakuTrack | null;
    invokedUser: GuildMember;
}
interface SkipVoteUserData {
    voiceChannelMembers: User[];
    votedUsers: string[];
}
export interface SkipVoteData {
    voteActive: boolean;
    userData: SkipVoteUserData | null;
    skipData: SkipData | null;
}
export type AudioPlayerStatus = 'PLAYING' | 'PAUSED' | 'STOPPED' | 'SKIPPING';
export type QueueTrack = BotdizTrack | BotdizShoukakuTrack;

export interface IPlayerInfo {
    currentTitle: string;
    streamTime: number;
    videoLength: number;
    audioPlayerStatus: AudioPlayerStatus;
    videoThumbnailUrl: string;
    skipVoteData: SkipVoteData;
}

export const streamTimeState = atom({
    key: 'streamTimeState',
    default: 0,
});

export const skipVoteDataState = atom({
    key: 'skipVoteState',
    default: {
        voteActive: false,
        userData: null,
        skipData: null,
    } as SkipVoteData,
});
export const audioPlayerStatusState = atom({
    key: 'audioPlayerStatusState',
    default: 'STOPPED' as AudioPlayerStatus,
});

export const currentSongState = atom({
    key: 'audioPlayerCurrentSongState',
    default: null as BotdizShoukakuTrack | null,
});

export const formattedStreamTimeState = selector({
    key: 'formattedStreamTimeState',
    get: ({ get }) => {
        const currentSong = get(currentSongState);
        const videoLength = currentSong?.info.length || 0;
        const streamTime = get(streamTimeState) || 0;
        const streamTimeFormatted = formatStreamTime(streamTime, videoLength);

        return streamTimeFormatted;
    },
});

export const audioPlayerQueueState = atom({
    key: 'audioPlayerQueueState',
    default: {
        queue: [] as QueueTrack[],
        guildId: '0',
    },
});
export const inVoiceChannelState = atom({
    key: 'inVoiceChannelState',
    default: false,
});

export const controlsDisabledState = atom({
    key: 'controlsDisabledState',
    default: false,
});
