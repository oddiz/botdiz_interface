import { atom } from 'recoil';
import { DbSpotifyData } from '../../Dashboard';

export const spotifyPlaylistsState = atom({
    key: 'spotifyPlaylistsState',
    default: null as DbSpotifyData['playlists'] | null,
});
