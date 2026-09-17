import React, { useEffect, useRef } from "react";
import { audioEngine } from "../services/audioEngine";
const BARS = 40;
// Music energy lives in the low bins; the top ~45% is near-silence, so cut it
// instead of drawing a flat dotted tail.
const USE_RATIO = 0.55;
export const Waveform: React.FC<{ playing: boolean }> = ({ playing }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0; const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const a = audioEngine.getAnalyser();
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "rgba(245,158,11,0.85)";
      if (!a || !playing) {
        ctx.fillRect(0, cv.height / 2 - 1, cv.width, 2);
        return;
      }
      const d = new Uint8Array(a.frequencyBinCount);
      a.getByteFrequencyData(d);
      const use = Math.max(8, Math.floor(d.length * USE_RATIO));
      const w = cv.width / BARS;
      for (let i = 0; i < BARS; i++) {
        const s = Math.floor((i / BARS) * use);
        const e = Math.max(s + 1, Math.floor(((i + 1) / BARS) * use));
        let sum = 0;
        for (let k = s; k < e && k < d.length; k++) sum += d[k];
        const v = sum / ((e - s) * 255);
        const h = Math.max(3, v * cv.height);
        ctx.fillRect(i * w + 1, (cv.height - h) / 2, w - 2, h);
      }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  return <canvas ref={ref} width={220} height={36} className="rounded-md bg-stone-900/60 border border-stone-800" />;
};
