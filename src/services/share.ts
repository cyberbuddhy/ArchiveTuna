import { Playlist, Track } from "../types";
export function encodeTracks(tracks: Track[]): string {
  const slim = tracks.map((t) => [t.title, t.artist, t.streamUrl, t.albumId, t.duration]);
  return btoa(unescape(encodeURIComponent(JSON.stringify(slim)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeTracks(s: string): Track[] {
  try {
    const b = s.replace(/-/g, "+").replace(/_/g, "/");
    const arr = JSON.parse(decodeURIComponent(escape(atob(b)))) as any[];
    return arr.map((a, i) => ({ id: `shared_${i}_${a[2]?.slice(-12)}`, title: a[0], artist: a[1], album: a[3] || "Shared", albumId: a[3] || "shared", trackNumber: i + 1, duration: a[4] || 0, streamUrl: a[2], format: "MP3" }));
  } catch { return []; }
}
export function mixtapeUrl(pl: Playlist): string {
  return `${location.origin}${location.pathname}#mix=${encodeTracks(pl.tracks)}`;
}
export function readSharedMix(): Track[] | null {
  const m = location.hash.match(/mix=([A-Za-z0-9\-_]+)/);
  return m ? decodeTracks(m[1]) : null;
}
