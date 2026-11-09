import React, { useEffect, useRef, useState } from 'react';
import {
  Dass21Evaluation,
  HistoryRecord,
  compareHistoryRecords
} from '../utils/dass21';
import {
  generateResultCardDataUrl,
  triggerImageDownload
} from '../utils/exportResultCard';
import { BreathingCard } from './BreathingCard';

interface ResultSectionProps {
  evaluation: Dass21Evaluation;
  history: HistoryRecord[];
  isSavedToHistory: boolean;
  onSaveHistory: () => void;
  onClearHistory: () => void;
  checkedDays: boolean[];
  onToggleDay: (dayIndex: number) => void;
  onResetDays: () => void;
  onRestart: () => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  evaluation,
  history,
  isSavedToHistory,
  onSaveHistory,
  onClearHistory,
  checkedDays,
  onToggleDay,
  onResetDays,
  onRestart
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [confirmClear, setConfirmClear] = useState(false);

  // Social media card preview & download state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [hideNumbers, setHideNumbers] = useState(false);
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!previewOpen) return;
    let active = true;
    setIsGeneratingCard(true);
    generateResultCardDataUrl(evaluation, { hideExactNumbers: hideNumbers }).then(
      url => {
        if (active) {
          setCardDataUrl(url);
          setIsGeneratingCard(false);
        }
      }
    );
    return () => {
      active = false;
    };
  }, [previewOpen, hideNumbers, evaluation]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(evaluation.clipboardText);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
    setTimeout(() => {
      setCopyStatus('idle');
    }, 1800);
  };

  const handleOpenCardPreview = async () => {
    setPreviewOpen(true);
    if (!cardDataUrl) {
      setIsGeneratingCard(true);
      const url = await generateResultCardDataUrl(evaluation, {
        hideExactNumbers: hideNumbers
      });
      setCardDataUrl(url);
      setIsGeneratingCard(false);
    }
  };

  const handleTriggerDownload = () => {
    if (!cardDataUrl) return;
    const filename = hideNumbers
      ? 'potret-hati-healyou-sosmed.png'
      : 'potret-hati-dass21-healyou.png';
    triggerImageDownload(cardDataUrl, filename);
    setDownloadDone(true);
    setTimeout(() => setDownloadDone(false), 2200);
  };

  const { overallSummaryParts: sum } = evaluation;
  const completedCount = checkedDays.filter(Boolean).length;

  const previousRecord =
    isSavedToHistory && history.length >= 2
      ? history[1]
      : !isSavedToHistory && history.length >= 1
      ? history[0]
      : null;

  const currentTempRecord: HistoryRecord = {
    id: 'current',
    dateIso: '',
    dateLabel: 'Hari ini',
    scores: {
      d: evaluation.subscales.d.score,
      a: evaluation.subscales.a.score,
      s: evaluation.subscales.s.score
    },
    levels: {
      d: evaluation.subscales.d.level,
      a: evaluation.subscales.a.level,
      s: evaluation.subscales.s.level
    },
    levelNames: {
      d: evaluation.subscales.d.levelName,
      a: evaluation.subscales.a.levelName,
      s: evaluation.subscales.s.levelName
    }
  };

  const delta = previousRecord
    ? compareHistoryRecords(currentTempRecord, previousRecord)
    : null;

  const formatDelta = (val: number) => {
    if (val < 0) return `turun ${Math.abs(val)} poin (lebih ringan)`;
    if (val > 0) return `naik ${val} poin`;
    return 'tetap sama';
  };

  return (
    <section id="result">
      <h2 ref={headingRef} tabIndex={-1}>
        Potret Kondisi Hatimu Minggu Ini
      </h2>
      <p className="lead" style={{ marginBottom: 0 }}>
        Ini hanyalah potret dari apa yang kamu lalui seminggu terakhir, bukan label permanen atas dirimu. Tingkat di bawah ini menggambarkan besarnya beban yang sedang kamu rasakan, bukan seberapa lemah dirimu.
      </p>

      <div id="sum" className="note">
        <b>Gambaran umum</b>
        <br />
        {!sum.hasSymptoms ? (
          'Alhamdulillah, ketiga aspek berada dalam rentang yang tenang dan terjaga. Teruskan kebiasaan baik yang membuat hati dan tubuhmu nyaman, dan kembali ke sini kapan pun kamu ingin memeriksa kabar hatimu.'
        ) : (
          <>
            Saat ini, bagian yang paling membutuhkan perhatian dan kasih sayangmu adalah{' '}
            <b>{sum.highAspectNames.join(', ')}</b> (tingkat {sum.maxLevelName}).{' '}
            {sum.anxietyAndStressHigh &&
              'Kecemasan dan stres yang terasa bersamaan sering menjadi tanda bahwa tubuh dan pikiranmu sudah terlalu lama bertahan dalam mode siaga, sehingga waktu istirahat pun terasa belum cukup memulihkan. '}
            {sum.depressionWithTension &&
              'Suasana hati yang sedang turun disertai rasa tegang memang bisa saling menguras energi: rasa lelah membuatmu berat melangkah, dan saat belum mampu bergerak, rasa lelah itu terasa makin panjang. '}
            {sum.quietDepressionOnly &&
              'Dari luar mungkin terlihat tenang karena tidak banyak ketegangan fisik, namun di dalam, energi dan semangatmu sedang terkuras. Karena hal ini sering tidak disadari orang sekitar, berbagi cerita secara jujur pada orang yang kamu percaya sangatlah berarti. '}
            Tidak perlu mengubah semuanya sekaligus—mulailah dari satu langkah kecil yang paling ringan untukmu hari ini.
          </>
        )}
      </div>

      <div id="cards">
        {evaluation.orderedSubscales.map(sub => {
          const isPrimaryFocus = sub.key === evaluation.focusKey && sub.level > 0;
          return (
            <article
              key={sub.key}
              className="card"
              style={{ '--lc': `var(--l${sub.level})` } as React.CSSProperties}
            >
              <div className="top">
                <h3>{sub.name}</h3>
                <span className="lv">{sub.levelName}</span>
              </div>
              <div className="sc">
                <b>{sub.score}</b>
                <span>dari 42 (skor DASS-21)</span>
              </div>
              <div className="trk" aria-hidden="true">
                <div
                  className="fill"
                  style={{ width: `${(sub.score / 42) * 100}%` }}
                />
                {sub.thresholds.map(t => (
                  <span
                    key={t}
                    style={{ left: `${(t / 42) * 100}%` }}
                    title={`Batas skor ${t}`}
                  />
                ))}
              </div>
              <div className="trk-legend" aria-hidden="true">
                <span>Normal</span>
                <span>Ringan</span>
                <span>Sedang</span>
                <span>Berat</span>
                <span>Sangat berat</span>
              </div>
              <p>{sub.shortText}</p>
              <details open={isPrimaryFocus}>
                <summary>
                  {isPrimaryFocus
                    ? 'Lihat penjelasan & langkah pemulihan'
                    : `Lihat penjelasan ${sub.name.toLowerCase()}`}
                </summary>
                <p>{sub.meaning}</p>
                <p>{sub.longText}</p>
                {sub.level > 0 && (
                  <>
                    <h4>Pola yang sedang kamu rasakan</h4>
                    {sub.clusters.map(cl => (
                      <div key={cl.index} className="cl">
                        <span>{cl.name}</span>
                        <i>
                          <b style={{ width: `${cl.percentage}%` }} />
                        </i>
                      </div>
                    ))}
                    <p>
                      {sub.isBalancedClusters ? (
                        'Kedua kelompok hal di atas terasa hampir sama kuatnya minggu ini.'
                      ) : (
                        <>
                          Bebanmu saat ini paling terasa pada{' '}
                          <b>{sub.dominantCluster.name.toLowerCase()}</b>.
                        </>
                      )}
                    </p>
                  </>
                )}
                {sub.topSymptoms.length > 0 && (
                  <>
                    <h4>Hal yang paling sering kamu rasakan</h4>
                    <ul>
                      {sub.topSymptoms.map((sym, idx) => (
                        <li key={idx}>
                          {sym.text} ({sym.answerLabel})
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <h4>
                  {sub.level > 0
                    ? 'Langkah kecil untuk pulih pelan-pelan'
                    : 'Menjaga hati tetap tenang'}
                </h4>
                {sub.level > 0 ? (
                  <ul>
                    {[...sub.recoveryTips, sub.spiritualTip].map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Pertahankan waktu istirahat yang cukup, gerak tubuh yang ringan, dan ruang hangat untuk berbagi cerita dengan orang terdekat.
                  </p>
                )}
              </details>
            </article>
          );
        })}
      </div>

      <BreathingCard />

      {evaluation.sevenDayPlan ? (
        <div id="plan" className="card">
          <div className="top">
            <h3>
              Rencana 7 Hari: Merawat {evaluation.sevenDayPlan.focusName}
            </h3>
            <span className="plan-progress">
              {completedCount}/7 langkah
            </span>
          </div>
          <p style={{ marginTop: 6 }}>
            Satu langkah kecil per hari. Kamu bisa mencentang langkah yang sudah dicoba. Tidak apa-apa jika terlewat satu hari—lanjutkan saja dengan lembut keesokan harinya.
            {evaluation.sevenDayPlan.hasSevereWarning
              ? ' Rencana ini adalah teman perjalanan harianmu, bukan pengganti pendampingan profesional.'
              : ''}
          </p>
          <p className="reminder-box">
            <b>Pengingat hati:</b> <i>“{evaluation.sevenDayPlan.reminder}”</i>
          </p>
          <div className="checklist" role="group" aria-label="Daftar langkah 7 hari">
            {evaluation.sevenDayPlan.days.map((day, idx) => {
              const isChecked = Boolean(checkedDays[idx]);
              return (
                <label
                  key={idx}
                  className={`check-item ${isChecked ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleDay(idx)}
                  />
                  <span className="check-box" aria-hidden="true">
                    {isChecked ? '✓' : idx + 1}
                  </span>
                  <span className="check-text">
                    <b>Hari ke-{idx + 1}:</b> {day}
                  </span>
                </label>
              );
            })}
          </div>
          {completedCount > 0 && (
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                className="link-btn"
                onClick={onResetDays}
              >
                Atur ulang centang 7 hari
              </button>
            </div>
          )}
        </div>
      ) : (
        <div id="plan-normal" className="card" style={{ marginBottom: 22 }}>
          <h3>Menjaga Hati Tetap Tenang &amp; Bersyukur</h3>
          <p style={{ marginTop: 6 }}>
            Alhamdulillah, kondisi suasana hati, kecemasan, dan stresmu minggu ini berada dalam rentang yang tenang. Beberapa kebiasaan kecil untuk menjaga ketenangan ini:
          </p>
          <p className="reminder-box">
            <b>Pengingat hati:</b>{' '}
            <i>
              “Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu.” (QS. Ibrahim: 7)
            </i>
          </p>
          <ul style={{ marginTop: 8 }}>
            <li>Pertahankan jam tidur yang teratur dan jeda istirahat dari layar gawai.</li>
            <li>Awali dan tutup hari dengan dzikir ringan serta mencatat tiga hal kecil yang kamu syukuri.</li>
            <li>Tetap jaga silaturahmi dan ruang bercerita yang hangat bersama keluarga atau sahabat.</li>
          </ul>
        </div>
      )}

      <div id="history-card" className="card" style={{ marginBottom: 22 }}>
        <div className="top">
          <h3>Catatan Perjalanan di Perangkatmu</h3>
          {history.length > 0 && (
            !confirmClear ? (
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
            )
          )}
        </div>
        <p style={{ marginTop: 6, marginBottom: 12 }}>
          Simpan potret hari ini di perangkatmu (tidak dikirim ke server mana pun) agar kamu bisa melihat perkembanganmu saat mengecek ulang 2–4 minggu lagi.
        </p>

        {delta && previousRecord && (
          <div className="delta-note">
            <b>Perbandingan dengan catatan {previousRecord.dateLabel}:</b>
            <br />
            Depresi {formatDelta(delta.d)} · Kecemasan {formatDelta(delta.a)} · Stres {formatDelta(delta.s)}.
          </div>
        )}

        <div className="acts" style={{ marginTop: 10 }}>
          <button
            type="button"
            id="save-history"
            className="btn ghost"
            disabled={isSavedToHistory}
            onClick={onSaveHistory}
          >
            {isSavedToHistory
              ? '✓ Tersimpan di perangkat ini'
              : 'Simpan ke riwayat perangkat'}
          </button>
        </div>

        {history.length > 0 && (
          <div className="history-list" style={{ marginTop: 14 }}>
            {history.slice(0, 5).map(rec => (
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
        )}
      </div>

      {evaluation.showCareBanner && (
        <div id="care">
          <b>Terima kasih sudah bertahan sejauh ini—kamu tidak harus menghadapi semuanya sendirian.</b>
          <p style={{ margin: '6px 0 0' }}>
            Berbagilah dengan seseorang yang membuatmu merasa aman, dan pertimbangkan untuk menemui psikolog atau psikiater. Jika beban terasa begitu menyesakkan hingga muncul pikiran untuk menyerah atau menyakiti diri sendiri, tolong izinkan orang lain menemanimu saat ini. Kamu bisa menghubungi layanan konseling gratis Kemenkes di{' '}
            <a href="tel:119">
              <b>119 ekstensi 8</b>
            </a>{' '}
            atau melalui{' '}
            <a
              href="https://healing119.id"
              target="_blank"
              rel="noopener noreferrer"
            >
              healing119.id
            </a>
            . Jika kondisi terasa darurat, segera datangi IGD atau fasilitas kesehatan terdekat.
          </p>
        </div>
      )}

      <p className="note" style={{ marginTop: 0 }}>
        <b>Kapan perlu berbincang dengan profesional?</b> Pertimbangkan menemui psikolog atau psikiater jika rasa lelah batin ini bertahan lebih dari dua minggu, mulai mengganggu keseharian atau hubunganmu, atau terasa makin berat. Hasil ini adalah gambaran awal untuk membantumu mengenali diri, bukan diagnosis medis. Merasa sedih, lelah, atau cemas sama sekali bukan tanda imanmu lemah—para nabi pun pernah merasakan duka yang mendalam. Mencari bantuan profesional adalah bagian dari ikhtiar yang mulia; Rasulullah ﷺ menganjurkan umatnya untuk berobat dan merawat diri.
      </p>

      <div id="community-card" className="card community-box" style={{ marginTop: 22 }}>
        <div className="community-header">
          <img
            src="/assets/aistudio/Heal_You_20260804_222305_0000_3fc12f96.png"
            alt="Logo Heal You"
            className="community-logo"
          />
          <div>
            <h3>Bertumbuh &amp; Pulih Bersama Heal You</h3>
            <p>Muslimah Healing Journey Community</p>
          </div>
        </div>
        <p style={{ marginTop: 10, marginBottom: 14 }}>
          Perjalanan pulih terasa lebih hangat saat dijalani bersama. Temukan pengingat harian, edukasi kesehatan mental Muslimah, dan ruang bertumbuh yang menenangkan di Instagram kami.
        </p>
        <a
          id="instagram-cta"
          href="https://www.instagram.com/healyou.official/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn instagram-btn"
        >
          Kunjungi @healyou.official di Instagram
        </a>
      </div>

      <div className="acts" style={{ marginTop: 22 }}>
        <button
          className="btn"
          id="download-card"
          type="button"
          onClick={handleOpenCardPreview}
        >
          Simpan / Bagikan Gambar Hasil
        </button>
        <button className="btn ghost" id="copy" type="button" onClick={handleCopy}>
          {copyStatus === 'copied'
            ? 'Tersalin'
            : copyStatus === 'error'
            ? 'Tidak bisa menyalin'
            : 'Salin teks hasil'}
        </button>
        <button className="btn ghost" id="again" type="button" onClick={onRestart}>
          Ulangi dari awal
        </button>
      </div>

      {previewOpen && (
        <div
          id="image-preview-modal"
          className="preview-card card"
          style={{ marginTop: 20 }}
          role="region"
          aria-label="Pratinjau Kartu Hasil untuk Sosial Media"
        >
          <div className="top">
            <h3>Kartu Hasil Siap Bagikan</h3>
            <button
              type="button"
              className="link-btn"
              onClick={() => setPreviewOpen(false)}
            >
              Tutup pratinjau
            </button>
          </div>
          <p style={{ marginTop: 4, marginBottom: 10 }}>
            Kamu bisa mengunduh kartu ini untuk arsip pribadi atau dibagikan ke Story/sosial media.
          </p>

          <label className="privacy-toggle">
            <input
              type="checkbox"
              id="toggle-hide-numbers"
              checked={hideNumbers}
              onChange={e => setHideNumbers(e.target.checked)}
            />
            <span>
              Sembunyikan angka skor (hanya tampilkan tingkat &amp; pengingat hati untuk privasi sosmed)
            </span>
          </label>

          <div className="preview-img-wrap">
            {isGeneratingCard || !cardDataUrl ? (
              <p style={{ padding: '32px 0', textAlign: 'center' }}>
                Menyiapkan kartu gambar...
              </p>
            ) : (
              <img
                src={cardDataUrl}
                alt="Pratinjau Kartu Potret Kondisi Hatimu Heal You"
                className="preview-img"
              />
            )}
          </div>

          <div className="acts" style={{ marginTop: 14 }}>
            <button
              type="button"
              id="trigger-download"
              className="btn"
              disabled={!cardDataUrl || isGeneratingCard}
              onClick={handleTriggerDownload}
            >
              {downloadDone ? '✓ Gambar berhasil diunduh' : 'Unduh Gambar (PNG)'}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setPreviewOpen(false)}
            >
              Selesai
            </button>
          </div>
          <p style={{ fontSize: '0.82rem', marginTop: 10 }}>
            Tip untuk pengguna Instagram: jika membuka dari bio Instagram, kamu juga bisa <b>tekan lama pada gambar di atas</b> lalu pilih <b>Simpan Gambar</b>.
          </p>
        </div>
      )}
    </section>
  );
};
