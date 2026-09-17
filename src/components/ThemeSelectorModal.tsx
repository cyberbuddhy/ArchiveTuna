import React from "react";
import { X, Check, Palette, Sparkles } from "lucide-react";
import { THEMES, ThemeDefinition } from "../services/themes";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const activeTheme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

  return (
    <div
      id="theme-selector-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        id="theme-selector-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 flex items-center gap-2">
                <span>Color Palettes & Themes</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {THEMES.length} Themes
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Choose the aesthetic atmosphere for your audio archive journey
              </p>
            </div>
          </div>

          <button
            id="close-theme-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Theme Highlight Banner */}
        <div className="px-5 py-3.5 bg-stone-950/40 border-b border-stone-850 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-stone-300">
              Current Palette: <strong className="text-amber-400 font-semibold">{activeTheme.name}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-stone-400">Swatch:</span>
            <div className="flex items-center -space-x-1 p-1 bg-stone-900 rounded-lg border border-stone-800">
              <span
                className="w-4.5 h-4.5 rounded-full border border-black/30 shadow-sm"
                style={{ backgroundColor: activeTheme.bg }}
                title={`Background: ${activeTheme.bg}`}
              />
              <span
                className="w-4.5 h-4.5 rounded-full border border-black/30 shadow-sm"
                style={{ backgroundColor: activeTheme.accent }}
                title={`Primary Accent: ${activeTheme.accent}`}
              />
              <span
                className="w-4.5 h-4.5 rounded-full border border-black/30 shadow-sm"
                style={{ backgroundColor: activeTheme.secondary }}
                title={`Secondary Accent: ${activeTheme.secondary}`}
              />
              <span
                className="w-4.5 h-4.5 rounded-full border border-black/30 shadow-sm"
                style={{ backgroundColor: activeTheme.text }}
                title={`Text: ${activeTheme.text}`}
              />
            </div>
          </div>
        </div>

        {/* Palettes List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 divide-y divide-stone-850/60">
          {THEMES.map((theme) => {
            const isSelected = theme.id === activeThemeId;
            return (
              <div
                key={theme.id}
                id={`theme-card-${theme.id}`}
                onClick={() => onSelectTheme(theme.id)}
                className={`pt-2.5 first:pt-0 group cursor-pointer transition-all duration-150`}
              >
                <div
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/30"
                      : "bg-stone-950/50 border-stone-800/80 hover:bg-stone-850/60 hover:border-stone-700"
                  }`}
                >
                  {/* Left: Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                        {theme.name}
                      </h3>
                      {theme.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            theme.id === "matte-lavender"
                              ? "bg-purple-950/70 text-purple-200 border border-purple-500/30"
                              : "bg-stone-800 text-stone-300 border border-stone-700"
                          }`}
                        >
                          {theme.badge}
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-stone-950">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                      {theme.subtitle}
                    </p>
                  </div>

                  {/* Right: Color Swatches & Select Button */}
                  <div className="flex items-center space-x-3 shrink-0">
                    {/* Swatch Pill Bar */}
                    <div className="flex items-center p-1.5 rounded-xl bg-stone-900 border border-stone-800/90 space-x-1.5 shadow-inner">
                      <div className="flex flex-col items-center">
                        <span
                          className="w-6 h-6 rounded-lg border border-black/40 shadow-sm"
                          style={{ backgroundColor: theme.bg }}
                          title={`Background: ${theme.bg}`}
                        />
                        <span className="text-[9px] text-stone-400 font-mono mt-0.5">Bg</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span
                          className="w-6 h-6 rounded-lg border border-black/40 shadow-sm"
                          style={{ backgroundColor: theme.accent }}
                          title={`Accent: ${theme.accent}`}
                        />
                        <span className="text-[9px] text-stone-400 font-mono mt-0.5">Accent</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span
                          className="w-6 h-6 rounded-lg border border-black/40 shadow-sm"
                          style={{ backgroundColor: theme.secondary }}
                          title={`Secondary: ${theme.secondary}`}
                        />
                        <span className="text-[9px] text-stone-400 font-mono mt-0.5">Sec</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span
                          className="w-6 h-6 rounded-lg border border-black/40 shadow-sm"
                          style={{ backgroundColor: theme.text }}
                          title={`Text: ${theme.text}`}
                        />
                        <span className="text-[9px] text-stone-400 font-mono mt-0.5">Text</span>
                      </div>
                    </div>

                    {/* Checkmark or Select Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTheme(theme.id);
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? "bg-amber-500 text-stone-950 font-bold shadow-md"
                          : "bg-stone-800 text-stone-400 group-hover:bg-amber-500/20 group-hover:text-amber-300"
                      }`}
                      title={isSelected ? "Currently Active" : "Apply Palette"}
                    >
                      {isSelected ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Check className="w-4 h-4 opacity-30 group-hover:opacity-100" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <span>Palette preference is automatically saved locally.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
