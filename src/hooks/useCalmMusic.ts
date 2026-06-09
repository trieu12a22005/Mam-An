import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { fetchCalmMusicTracks, CalmMusicTrack } from '../api/calmMusicApi';
import { backgroundMusicControl } from '../utils/backgroundMusicControl';

export interface UseCalmMusicReturn {
  tracks: CalmMusicTrack[];
  selectedTrack: CalmMusicTrack | null;
  volume: number;
  isPlaying: boolean;
  isLoadingTracks: boolean;
  selectTrack: (track: CalmMusicTrack | null) => void;
  togglePlayPause: () => void;
  stopAndClear: () => void;
  changeVolume: (v: number) => void;
}

export function useCalmMusic(): UseCalmMusicReturn {
  const [tracks, setTracks] = useState<CalmMusicTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<CalmMusicTrack | null>(null);
  const [volume, setVolumeState] = useState(0.7);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const selectedRef = useRef<CalmMusicTrack | null>(null);
  const isPlayingCalmMusic = useRef(false);

  // Load tracks
  useEffect(() => {
    setIsLoadingTracks(true);
    fetchCalmMusicTracks()
      .then(setTracks)
      .catch(console.error)
      .finally(() => setIsLoadingTracks(false));
  }, []);

  // Khi track thay đổi → load + phát, kiểm soát nhạc nền
  useEffect(() => {
    selectedRef.current = selectedTrack;

    if (!selectedTrack) {
      // Không còn calm music → khôi phục nhạc nền
      try { player.pause(); } catch {}
      if (isPlayingCalmMusic.current) {
        isPlayingCalmMusic.current = false;
        backgroundMusicControl.resume();
      }
      return;
    }

    // Có track → pause nhạc nền, phát calm music
    if (!isPlayingCalmMusic.current) {
      isPlayingCalmMusic.current = true;
      backgroundMusicControl.pause();
    }

    // Dùng đúng tham số playsInSilentMode (không phải playsInSilentModeIOS)
    setAudioModeAsync({ playsInSilentMode: true, staysActiveInBackground: false })
      .catch(() => {});

    const load = async () => {
      try {
        player.replace({ uri: selectedTrack.publicUrl });
        // Chờ source load (tương tự _layout.tsx pattern)
        await new Promise(res => setTimeout(res, 250));
        // Race condition guard
        if (selectedRef.current?.id !== selectedTrack.id) return;
        player.loop = true;
        player.volume = volume;
        player.play();
      } catch (err) {
        console.warn('[useCalmMusic] error:', err);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrack]);

  // Cleanup: khôi phục nhạc nền khi unmount
  useEffect(() => {
    return () => {
      if (isPlayingCalmMusic.current) {
        isPlayingCalmMusic.current = false;
        try { player.pause(); } catch {}
        backgroundMusicControl.resume();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTrack = useCallback((track: CalmMusicTrack | null) => {
    setSelectedTrack(track);
  }, []);

  const togglePlayPause = useCallback(() => {
    try {
      if (status?.playing) { player.pause(); }
      else { player.play(); }
    } catch {}
  }, [status, player]);

  const stopAndClear = useCallback(() => {
    try { player.pause(); } catch {}
    setSelectedTrack(null);
    if (isPlayingCalmMusic.current) {
      isPlayingCalmMusic.current = false;
      backgroundMusicControl.resume();
    }
  }, [player]);

  const changeVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    try { player.volume = clamped; } catch {}
  }, [player]);

  return {
    tracks,
    selectedTrack,
    volume,
    isPlaying: status?.playing ?? false,
    isLoadingTracks,
    selectTrack,
    togglePlayPause,
    stopAndClear,
    changeVolume,
  };
}
