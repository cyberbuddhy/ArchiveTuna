import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Track, Album } from "../types";
import { recordListen } from "../services/storage";
import { getStoredPlayerSettings, savePlayerSettings, PlayerSettings } from "../services/playerSettings";
import { audioEngine } from "../services/audioEngine";
import { offlineCache } from "../services/offlineCache";
import { readSharedMix } from "../services/share";

export type RepeatMode = "off" | "all" | "one";

interface PlayerContextType {
  currentTrack: Track | null;
  currentAlbum: Album | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  queueIndex: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  playbackRate: number;
  isCurrentTrackOffline: boolean;
  isOfflineDownloading: boolean;
  offlineVersion: number;
  togglePinCurrentTrack: () => Promise<void>;
  playTrack: (track: Track, album?: Album, newQueue?: Track[]) => void;
  playAlbum: (album: Album, startIndex?: number) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skipSeconds: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  playRandomTracks: (tracks: Track[], albumLookup?: (track: Track) => Album | undefined) => void;
  cycleRepeatMode: () => void;
  setPlaybackRate: (rate: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: Track) => void;
  appendToQueue: (tracks: Track[]) => void;
  getAudioElement: () => HTMLAudioElement | null;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const initialSettings = getStoredPlayerSettings();
  const [playbackRate, setPlaybackRateState] = useState<number>(initialSettings.defaultPlaybackRate || 1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedRef = useRef<boolean>(false);
  const prefetchedRef = useRef<string | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);

  // Offline caching status
  const [isCurrentTrackOffline, setIsCurrentTrackOffline] = useState<boolean>(false);
  const [isOfflineDownloading, setIsOfflineDownloading] = useState<boolean>(false);
  const [offlineVersion, setOfflineVersion] = useState<number>(0);

  // Subscribe to offline cache changes
  useEffect(() => {
    const unsub = offlineCache.subscribe(() => {
      setOfflineVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!currentTrack) {
      setIsCurrentTrackOffline(false);
      setIsOfflineDownloading(false);
      return;
    }
    const cached = offlineCache.isTrackCachedSync(currentTrack.id);
    setIsCurrentTrackOffline(cached);
    setIsOfflineDownloading(offlineCache.isTrackDownloading(currentTrack.id));
  }, [currentTrack, offlineVersion]);

  const togglePinCurrentTrack = async () => {
    if (!currentTrack) return;
    if (isCurrentTrackOffline) {
      await offlineCache.removeCachedTrack(currentTrack.id);
    } else {
      await offlineCache.cacheTrack(currentTrack, currentAlbum || undefined);
    }
  };

  // Sleep Timer interval monitor
  useEffect(() => {
    const sleepInterval = setInterval(() => {
      const currentSettings = getStoredPlayerSettings();
      if (currentSettings.sleepTimerEndTime && Date.now() >= currentSettings.sleepTimerEndTime) {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        savePlayerSettings({ sleepTimerMinutes: 0, sleepTimerEndTime: null });
      }
    }, 1000);

    const handleSettingsChanged = (e: any) => {
      const updated = e.detail;
      if (updated) {
        if (updated.defaultPlaybackRate !== undefined) {
          setPlaybackRateState(updated.defaultPlaybackRate);
          if (audioRef.current) {
            audioRef.current.playbackRate = updated.defaultPlaybackRate;
          }
        }
        audioEngine.updateSettings(updated);
      }
    };

    window.addEventListener("archive_settings_changed", handleSettingsChanged);

    return () => {
      clearInterval(sleepInterval);
      window.removeEventListener("archive_settings_changed", handleSettingsChanged);
    };
  }, []);

  // Mutable refs so event listeners attached once on mount always see latest state
  const stateRef = useRef({
    currentTrack,
    currentAlbum,
    queue,
    queueIndex,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    playbackRate,
    isPlaying,
    currentTime,
    duration,
  });

  useEffect(() => {
    stateRef.current = {
      currentTrack,
      currentAlbum,
      queue,
      queueIndex,
      volume,
      isMuted,
      isShuffle,
      repeatMode,
      playbackRate,
      isPlaying,
      currentTime,
      duration,
    };
  }, [
    currentTrack,
    currentAlbum,
    queue,
    queueIndex,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    playbackRate,
    isPlaying,
    currentTime,
    duration,
  ]);

  // Stable nextTrack handler for auto-advance
  const handleAutoAdvance = () => {
    const { queue: q, queueIndex: qIdx, repeatMode: rep, isShuffle: shuf } = stateRef.current;

    // Check if sleep timer was set to End of Current Track (-1)
    const currentSettings = getStoredPlayerSettings();
    if (currentSettings.sleepTimerMinutes === -1) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setCurrentTime(0);
      savePlayerSettings({ sleepTimerMinutes: 0, sleepTimerEndTime: null });
      return;
    }

    // Repeat one single track
    if (rep === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    if (q.length === 0) return;

    // Shuffle mode
    if (shuf && q.length > 1) {
      let nextIdx = Math.floor(Math.random() * q.length);
      if (nextIdx === qIdx) {
        nextIdx = (nextIdx + 1) % q.length;
      }
      setQueueIndex(nextIdx);
      loadAndPlay(q[nextIdx]);
      return;
    }

    // Standard sequential
    if (qIdx < q.length - 1) {
      const nextIdx = qIdx + 1;
      setQueueIndex(nextIdx);
      loadAndPlay(q[nextIdx]);
    } else if (rep === "all") {
      // Loop back to start
      setQueueIndex(0);
      loadAndPlay(q[0]);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    let lastTimeUpdate = 0;
    const handleTimeUpdate = () => {
      const now = performance.now();
      // Throttle time updates to 250ms (4x/sec) to keep UI ultra responsive without flooding React scheduler
      if (now - lastTimeUpdate >= 250) {
        lastTimeUpdate = now;
        setCurrentTime(audio.currentTime);
        if (!isNaN(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        }
      }
      // Record to history once listened for at least 6 seconds
      const { currentTrack: track, currentAlbum: album } = stateRef.current;
      if (audio.currentTime > 6 && !recordedRef.current && track) {
        recordListen(track, album || undefined);
        recordedRef.current = true;
      }
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => handleAutoAdvance();

    const handleError = () => {
      const { currentTrack: track } = stateRef.current;
      setIsLoading(false);
      // Attempt proxy fallback once if direct stream failed and not already proxying
      if (track?.streamUrl && audio.src && !audio.src.includes("/api/audio-proxy")) {
        const proxyUrl = `/api/audio-proxy?url=${encodeURIComponent(track.streamUrl)}`;
        audio.src = proxyUrl;
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const loadAndPlay = async (track: Track, album?: Album) => {
    if (!track) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Revoke previous blob URL if any to prevent memory leak
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }

    recordedRef.current = false;
    prefetchedRef.current = null;
    setCurrentTrack(track);
    if (album) setCurrentAlbum(album);
    setCurrentTime(0);
    setDuration(track.duration || 0);
    setIsLoading(true);

    if (!track.streamUrl) {
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    // Check if this track is cached offline in IndexedDB
    let playbackSrc = track.streamUrl;
    try {
      const cachedBlobUrl = await offlineCache.getCachedTrackBlobUrl(track.id);
      if (cachedBlobUrl) {
        playbackSrc = cachedBlobUrl;
        currentBlobUrlRef.current = cachedBlobUrl;
      }
    } catch (cacheErr) {
      console.warn("Offline cache check failed, using streamUrl:", cacheErr);
    }

    try {
      audio.src = playbackSrc;
      const targetVol = isMuted ? 0 : volume;
      audio.volume = targetVol;
      audio.playbackRate = playbackRate;

      // Initialize audio DSP engine (warmth, gain normalization, crossfade)
      audioEngine.init(audio);
      audioEngine.resume();
      const currentSettings = getStoredPlayerSettings();
      audioEngine.updateSettings(currentSettings);

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          audio.volume = targetVol;
        })
        .catch((err) => {
          // If aborted by a new play request, ignore
          if (err.name === "AbortError") return;

          // Try proxy fallback only if online stream failed
          if (!playbackSrc.startsWith("blob:") && track.streamUrl && !track.streamUrl.includes("/api/audio-proxy")) {
            audio.src = `/api/audio-proxy?url=${encodeURIComponent(track.streamUrl)}`;
            audio.playbackRate = playbackRate;
            audio.volume = targetVol;
            audio
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
                audio.volume = targetVol;
              })
              .catch(() => {
                setIsLoading(false);
                setIsPlaying(false);
              });
          } else {
            setIsLoading(false);
            setIsPlaying(false);
          }
        });
    } catch (err) {
      console.warn("Audio playback init error:", err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const playTrack = (track: Track, album?: Album, newQueue?: Track[]) => {
    if (!track) return;
    if (newQueue && newQueue.length > 0) {
      const validQueue = newQueue.filter(Boolean);
      setQueue(validQueue);
      const idx = validQueue.findIndex((t) => t && t.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else if (queue.length === 0) {
      setQueue([track]);
      setQueueIndex(0);
    }
    loadAndPlay(track, album);
  };

  const playAlbum = (album: Album, startIndex: number = 0) => {
    if (!album || !album.tracks || album.tracks.length === 0) return;
    const validTracks = album.tracks.filter(Boolean);
    if (validTracks.length === 0) return;
    setQueue(validTracks);
    const validIndex = Math.min(Math.max(0, startIndex), validTracks.length - 1);
    setQueueIndex(validIndex);
    loadAndPlay(validTracks[validIndex], album);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Resume play failed:", err));
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const skipSeconds = (sec: number) => {
    if (!audioRef.current) return;
    const maxDur = duration > 0 ? duration : 3600;
    const newTime = Math.max(0, Math.min(maxDur, currentTime + sec));
    seek(newTime);
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    audioRef.current.volume = newMute ? 0 : volume;
  };

  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const playRandomTracks = (tracks: Track[], albumLookup?: (track: Track) => Album | undefined) => {
    if (!tracks || tracks.length === 0) return;
    const shuffled = [...tracks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setIsShuffle(true);
    setQueue(shuffled);
    setQueueIndex(0);
    const firstTrack = shuffled[0];
    const album = albumLookup ? albumLookup(firstTrack) : undefined;
    loadAndPlay(firstTrack, album);
  };

  const cycleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const nextTrack = () => {
    const { queue: q, queueIndex: qIdx, isShuffle: shuf, repeatMode: rep, isPlaying: playing } = stateRef.current;
    if (q.length === 0) return;

    const executeNext = () => {
      if (shuf && q.length > 1) {
        let nextIdx = Math.floor(Math.random() * q.length);
        if (nextIdx === qIdx) nextIdx = (nextIdx + 1) % q.length;
        setQueueIndex(nextIdx);
        loadAndPlay(q[nextIdx]);
        return;
      }

      if (qIdx < q.length - 1) {
        const nextIdx = qIdx + 1;
        setQueueIndex(nextIdx);
        loadAndPlay(q[nextIdx]);
      } else if (rep === "all") {
        setQueueIndex(0);
        loadAndPlay(q[0]);
      }
    };

    const currentSettings = getStoredPlayerSettings();
    if (currentSettings.crossfadeSeconds > 0 && playing && audioRef.current) {
      audioEngine.fadeOut(audioRef.current, Math.min(currentSettings.crossfadeSeconds, 1.2), executeNext);
    } else {
      executeNext();
    }
  };

  const prevTrack = () => {
    if (currentTime > 3) {
      seek(0);
    } else if (queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      const executePrev = () => {
        setQueueIndex(prevIdx);
        loadAndPlay(queue[prevIdx]);
      };
      const currentSettings = getStoredPlayerSettings();
      if (currentSettings.crossfadeSeconds > 0 && isPlaying && audioRef.current) {
        audioEngine.fadeOut(audioRef.current, Math.min(currentSettings.crossfadeSeconds, 1.2), executePrev);
      } else {
        executePrev();
      }
    } else {
      seek(0);
    }
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const appendToQueue = (tracks: Track[]) => {
    const clean = (tracks || []).filter(Boolean);
    if (!clean.length) return;
    setQueue((prev) => {
      const ids = new Set(prev.map((t) => t?.id));
      return [...prev, ...clean.filter((t) => !ids.has(t.id))];
    });
  };

  const getAudioElement = () => audioRef.current;

  // Prefetch next track at 80% / 15s remaining for zero-gap
  useEffect(() => {
    if (!currentTrack || !duration) return;
    const remain = duration - currentTime;
    const next = queue[queueIndex + 1];
    if (!next || prefetchedRef.current === next.id) return;
    if (remain < 15 || currentTime / duration > 0.8) {
      prefetchedRef.current = next.id;
      try { fetch(next.streamUrl, { mode: "no-cors" }).catch(() => {}); } catch { /* noop */ }
    }
  }, [currentTime, duration, queue, queueIndex, currentTrack]);

  const removeFromQueue = (index: number) => {
    setQueue((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (index === queueIndex && updated.length > 0) {
        const nextIdx = Math.min(index, updated.length - 1);
        setQueueIndex(nextIdx);
        loadAndPlay(updated[nextIdx]);
      } else if (index < queueIndex) {
        setQueueIndex((curr) => curr - 1);
      }
      return updated;
    });
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
  };

  // Shared mixtape deep-link (#mix=...) -> queue instantly, zero auth
  useEffect(() => {
    try {
      const shared = readSharedMix();
      if (shared && shared.length) {
        setQueue(shared);
        setQueueIndex(0);
        loadAndPlay(shared[0]);
        history.replaceState(null, "", location.pathname + location.search);
      }
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MediaSession API integration (fully guarded for iframes and varied browsers)
  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        "mediaSession" in navigator &&
        navigator.mediaSession &&
        currentTrack
      ) {
        if (typeof (window as any).MediaMetadata !== "undefined") {
          try {
            navigator.mediaSession.metadata = new (window as any).MediaMetadata({
              title: currentTrack.title || "Archive Recording",
              artist: currentTrack.artist || currentAlbum?.artist || "Unknown Artist",
              album: currentTrack.album || currentAlbum?.title || "Archive.org Audio",
              artwork: currentAlbum?.coverUrl
                ? [{ src: currentAlbum.coverUrl, sizes: "512x512", type: "image/jpeg" }]
                : [],
            });
          } catch (_) {
            // Some browser iframes prohibit MediaMetadata instantiation
          }
        }

        const actionList: Array<[MediaSessionAction, () => void]> = [
          ["play", () => { audioRef.current?.play().catch(() => {}); setIsPlaying(true); }],
          ["pause", () => { audioRef.current?.pause(); setIsPlaying(false); }],
          ["previoustrack", () => prevTrack()],
          ["nexttrack", () => nextTrack()],
          ["seekbackward", () => skipSeconds(-10)],
          ["seekforward", () => skipSeconds(10)],
        ];

        for (const [action, handler] of actionList) {
          try {
            navigator.mediaSession.setActionHandler(action, handler);
          } catch (_) {}
        }

        try {
          navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (details.seekTime !== undefined) seek(details.seekTime);
          });
        } catch (_) {}
      }
    } catch (err) {
      console.warn("MediaSession initialization bypassed:", err);
    }
  }, [currentTrack, currentAlbum]);

  // Global player keyboard shortcuts (Space/K: play/pause, J: prev, L: next, Left/Right: seek, Up/Down: volume, M: mute, S: shuffle, R: repeat)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space" || e.code === "KeyK") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyJ") {
        e.preventDefault();
        prevTrack();
      } else if (e.code === "KeyL") {
        e.preventDefault();
        nextTrack();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        skipSeconds(e.shiftKey ? -15 : -5);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        skipSeconds(e.shiftKey ? 15 : 5);
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setVolume(Math.min(1, volume + 0.05));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setVolume(Math.max(0, volume - 0.05));
      } else if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      } else if (e.code === "KeyS") {
        e.preventDefault();
        toggleShuffle();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        cycleRepeatMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentTime, isMuted, volume, queue, queueIndex, isShuffle, repeatMode]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentAlbum,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        queueIndex,
        isShuffle,
        repeatMode,
        playbackRate,
        isCurrentTrackOffline,
        isOfflineDownloading,
        offlineVersion,
        togglePinCurrentTrack,
        playTrack,
        playAlbum,
        togglePlay,
        seek,
        skipSeconds,
        setVolume,
        toggleMute,
        toggleShuffle,
        playRandomTracks,
        cycleRepeatMode,
        setPlaybackRate,
        nextTrack,
        prevTrack,
        addToQueue,
        appendToQueue,
        getAudioElement,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};
