import React from 'react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme }) => {
  return (
    <header className="brand">
      <img
        src="/assets/aistudio/Heal_You_20260804_222305_0000_3fc12f96.png"
        alt="Logo Heal You"
        className="brand-logo"
      />
      <span>
        <span className="wm">Heal You</span>
        <small>Muslimah Healing Journey Community</small>
      </span>
      <button
        id="theme"
        type="button"
        aria-label="Ganti tema warna"
        onClick={onToggleTheme}
      >
        {isDark ? 'Mode terang' : 'Mode gelap'}
      </button>
    </header>
  );
};
