import { formatStreamTime } from "components/helpers";
import { GuildMember, User } from "discord.js";
import { atom, selector } from "recoil";
import { ShoukakuTrack } from 'shoukaku'

export interface BotdizTrack {
    info: {
        artist: string;
        trackName: string;
        title: string;
        
    };
    isSpotify: boolean;
    recommendedSong?: boolean;
}
export interface BotdizShoukakuTrack extends ShoukakuTrack {
    recommendedSong?: boolean;
    thumbnail?: string;
}
interface SkipData {
    skipAmount: number;
    currentSong: BotdizShoukakuTrack | null;
    invokedUser: GuildMember;
}
interface SkipVoteUserData{
    voiceChannelMembers: User[];
    votedUsers: string[];
}
export interface SkipVoteData {
    voteActive: boolean;
    userData: SkipVoteUserData | null;
    skipData: SkipData | null;
}

export type QueueTrack = BotdizTrack | BotdizShoukakuTrack;

export interface IPlayerInfo {
    
    currentTitle: string,
    streamTime: number,
    videoLength: number,
    audioPlayerStatus: AudioPlayerStatus,
    videoThumbnailUrl: string,
    skipVoteData: SkipVoteData
}

type AudioPlayerStatus = "PLAYING" | "PAUSED" | "STOPPED" | "SKIPPING"

export const playerInfoState = atom({
    key: "playerInfoState",
    default: {
        currentTitle: "",
        streamTime: 0,
        videoLength: 0,
        audioPlayerStatus: "STOPPED" as AudioPlayerStatus,
        videoThumbnailUrl: "",
        skipVoteData: {
            voteActive: false,
            userData: null,
            skipData: null
        }
    } as IPlayerInfo,
})
export const audioPlayerStatusState = selector({
    key: "audioPlayerStatusState",
    get: ({ get }) => get(playerInfoState).audioPlayerStatus,

})
interface ICurrentSong {
    title: string,
    videoThumbnailUrl: string,
    videoLength: number,
}
export const audioPlayerCurrentSongState = selector<ICurrentSong>({
    key: "audioPlayerCurrentSongState",
    get: ({ get }) => {
        const audioPlayer = get(playerInfoState)

        return {
            title: audioPlayer.currentTitle,
            videoThumbnailUrl: audioPlayer.videoThumbnailUrl,
            videoLength: audioPlayer.videoLength,
        }
    }
})
export const skipVoteDataState = selector({
    key: "skipVoteData",
    get: ({ get }) => get(playerInfoState).skipVoteData,
})
export const formattedStreamTimeState = selector({
    key: "formattedStreamTimeState",
    get: ({ get }) => {
        const playerInfo = get(playerInfoState)
        const streamTimeFormatted = formatStreamTime(playerInfo)

        return streamTimeFormatted
    }
})


export const audioPlayerQueueState = atom({
    key: "audioPlayerQueueState",
    default:{ 
        queue: [] as QueueTrack[],
        guildId: "0"
    },
})
export const inVoiceChannelState = atom({
    key: "inVoiceChannelState",
    default: false,
})

export const controlsDisabledState = atom({
    key: "controlsDisabledState",
    default: false,
})
