import React, { useState, useEffect } from 'react';
import { getBreathingState } from '../utils/dass21';

const TOTAL_SECONDS = 120; // 2 minutes

export const BreathingCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= TOTAL_SECONDS) {
          setIsRunning(false);
          return TOTAL_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const remaining = Math.max(0, TOTAL_SECONDS - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const breath = getBreathingState(elapsed);
  const isCompleted = elapsed >= TOTAL_SECONDS;

  const handleToggleStart = () => {
    if (isCompleted) {
      setElapsed(0);
      setIsRunning(true);
    } else {
      setIsRunning(prev => !prev);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
  };

  return (
    <div id="breathing-tool" className="card" style={{ marginBottom: 22 }}>
      <div className="top">
        <h3>Jeda Tenang: Napas 4-6 &amp; Dzikir</h3>
        <span style={{ fontSize: '0.84rem', color: 'var(--mut)' }}>2 menit</span>
      </div>
      <p style={{ marginTop: 6 }}>
        Saat hati terasa penuh atau dada terasa sesak, mari ambil jeda sejenak. Tarik napas 4 hitungan, lalu hembuskan perlahan 6 hitungan sambil mengingat Allah.
      </p>

      {!isOpen ? (
        <div className="acts" style={{ marginTop: 12 }}>
          <button
            type="button"
            id="open-breathing"
            className="btn ghost"
            onClick={() => {
              setIsOpen(true);
              setIsRunning(true);
            }}
          >
            Mulai jeda napas (2 menit)
          </button>
        </div>
      ) : (
        <div className="breath-box">
          <div className="breath-visual">
            <div
              className={`breath-circle ${
                isRunning ? `is-${breath.phase}` : ''
              }`}
            >
              <span className="breath-count">
                {isCompleted
                  ? '✓'
                  : isRunning
                  ? `${breath.countInPhase}/${breath.phaseDuration}`
                  : '4–6'}
              </span>
            </div>
          </div>

          <div className="breath-info">
            <p className="breath-phase">
              {isCompleted
                ? 'Alhamdulillah, sesi 2 menit selesai. Semoga hatimu terasa lebih lapang.'
                : isRunning
                ? breath.phaseLabel
                : 'Tekan lanjutkan saat kamu siap bernapas perlahan.'}
            </p>
            <p className="breath-dhikr">{breath.dhikrText}</p>
            <small className="breath-meaning">“{breath.dhikrMeaning}”</small>
            <div className="breath-timer">Sisa waktu: {formattedTime}</div>
          </div>

          <div className="acts" style={{ justifyContent: 'center', marginTop: 12 }}>
            <button
              type="button"
              id="toggle-breathing"
              className="btn"
              onClick={handleToggleStart}
            >
              {isCompleted ? 'Ulangi 2 menit' : isRunning ? 'Jeda sejenak' : 'Lanjutkan'}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={handleReset}
            >
              Atur ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
