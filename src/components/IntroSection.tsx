import React, { useEffect, useRef, useState } from 'react';
import { HistoryRecord } from '../utils/dass21';
import { BreathingCard } from './BreathingCard';

interface IntroSectionProps {
  onStart: () => void;
  hasInProgressQuiz: boolean;
  inProgressCount: number;
  onResumeQuiz: () => void;
  hasLastResult: boolean;
  onOpenLastResult: () => void;
  history: HistoryRecord[];
  onClearHistory: () => void;
}

export const IntroSection: React.FC<IntroSectionProps> = ({
  onStart,
  hasInProgressQuiz,
  inProgressCount,
  onResumeQuiz,
  hasLastResult,
  onOpenLastResult,
  history,
  onClearHistory
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, []);

  return (
    <section id="intro">
      <h1 ref={headingRef} tabIndex={-1}>
        Tes Kesehatan Mental DASS-21
      </h1>
      <p className="lead">
        Kenali apa yang sedang kamu rasakan, lalu pulihkan pelan-pelan. Lewat 21 pernyataan singkat ini, kamu bisa melihat gambaran suasana hati, kecemasan, dan ketegangan yang kamu alami akhir-akhir ini.
      </p>
      <ul className="facts">
        <li>
          <b>Singkat &amp; tenang (3–5 menit)</b>
          <span>Satu pernyataan per layar, cukup pilih yang paling mendekati perasaanmu.</span>
        </li>
        <li>
          <b>Tetap aman di perangkatmu</b>
          <span>Jawabanmu bersifat pribadi, tidak dikirim atau disimpan ke server mana pun.</span>
        </li>
        <li>
          <b>Sesuai yang kamu rasakan seminggu terakhir</b>
          <span>Tidak ada jawaban benar atau salah. Jujurlah pada dirimu sendiri tanpa perlu menghakimi.</span>
        </li>
      </ul>

      <div className="acts">
        <button className="btn" id="start" type="button" onClick={onStart}>
          Mulai mengenali diri
        </button>
        {hasInProgressQuiz && (
          <button
            className="btn ghost"
            id="resume-quiz"
            type="button"
            onClick={onResumeQuiz}
          >
            Lanjutkan pengisian ({inProgressCount}/21)
          </button>
        )}
        {hasLastResult && (
          <button
            className="btn ghost"
            id="open-last-result"
            type="button"
            onClick={onOpenLastResult}
          >
            Lihat hasil &amp; rencana 7 hari terakhir
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div className="card" style={{ marginTop: 22 }}>
          <div className="top">
            <h3>Catatan Perjalanan Hatimu</h3>
            {!confirmClear ? (
              <button
                type="button"
                className="link-btn"
                onClick={() => setConfirmClear(true)}
              >
                Hapus riwayat
              </button>
            ) : (
              <span className="confirm-inline">
                Yakin hapus?{' '}
                <button
                  type="button"
                  className="link-btn danger"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                >
                  Ya, hapus
                </button>{' '}
                ·{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setConfirmClear(false)}
                >
                  Batal
                </button>
              </span>
            )}
          </div>
          <p style={{ marginTop: 4, marginBottom: 10 }}>
            Tersimpan khusus di perangkat ini agar kamu bisa melihat perkembanganmu dari waktu ke waktu.
          </p>
          <div className="history-list">
            {history.slice(0, 3).map(rec => (
              <div key={rec.id} className="history-item">
                <span className="history-date">{rec.dateLabel}</span>
                <span className="history-scores">
                  Depresi: <b>{rec.scores.d}</b> ({rec.levelNames.d}) · Kecemasan:{' '}
                  <b>{rec.scores.a}</b> ({rec.levelNames.a}) · Stres:{' '}
                  <b>{rec.scores.s}</b> ({rec.levelNames.s})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <BreathingCard />
      </div>

      <p className="note">
        <b>Catatan hangat:</b> Skrining ini membantu kamu mengenali sinyal dari hati dan tubuhmu sebagai langkah awal, bukan diagnosis medis. Jika beban terasa mengganggu keseharianmu, berbincang dengan psikolog atau psikiater adalah langkah ikhtiar yang sangat baik.
      </p>
    </section>
  );
};
