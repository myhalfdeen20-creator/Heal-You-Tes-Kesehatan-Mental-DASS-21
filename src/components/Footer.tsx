import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer>
      Heal You:{' '}
      <a
        href="https://www.instagram.com/healyou.official/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'inherit', fontWeight: 600 }}
      >
        @healyou.official
      </a>
      . Instrumen DASS-21 disusun oleh Lovibond &amp; Lovibond (1995). Seluruh jawaban diproses secara pribadi di perangkatmu.
    </footer>
  );
};
