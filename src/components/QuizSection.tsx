import React, { useEffect, useRef } from 'react';
import { QUESTIONS, OPTIONS } from '../utils/dass21';

interface QuizSectionProps {
  currentIndex: number;
  answers: (number | undefined)[];
  isLocked: boolean;
  onSelectOption: (value: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  currentIndex,
  answers,
  isLocked,
  onSelectOption,
  onBack,
  onNext
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const currentQuestion = QUESTIONS[currentIndex];
  const currentAnswer = answers[currentIndex];

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isLocked) return;
      if (/^[0-3]$/.test(e.key)) {
        onSelectOption(Number(e.key));
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onBack();
      } else if (e.key === 'ArrowRight' && currentAnswer !== undefined) {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentAnswer, isLocked, onSelectOption, onBack, onNext]);

  return (
    <section id="quiz">
      <div className="meta">
        <span>
          Pernyataan <b id="n">{currentIndex + 1}</b> dari {QUESTIONS.length}
        </span>
        <span>Tarik napas pelan, jawab senyamanmu</span>
      </div>
      <div id="bar" aria-hidden="true">
        {QUESTIONS.map((_, idx) => (
          <i
            key={idx}
            className={
              idx < currentIndex ? 'on' : idx === currentIndex ? 'cur' : ''
            }
          />
        ))}
      </div>
      <p className="ask">
        Dalam seminggu terakhir, seberapa sering hal ini kamu rasakan?
      </p>
      <h2 id="q" ref={headingRef} tabIndex={-1} aria-live="polite">
        {currentQuestion.text}
      </h2>
      <div id="opts">
        {OPTIONS.map(opt => {
          const isSelected = currentAnswer === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectOption(opt.value)}
            >
              <span className="dot">{opt.value}</span>
              <span>
                <b>{opt.label}</b>
                <small>{opt.description}</small>
              </span>
            </button>
          );
        })}
      </div>
      <div className="acts">
        <button
          className="btn ghost"
          id="back"
          type="button"
          disabled={currentIndex === 0}
          onClick={onBack}
        >
          Sebelumnya
        </button>
        {currentAnswer !== undefined && (
          <button
            className="btn ghost"
            id="next"
            type="button"
            onClick={onNext}
          >
            Selanjutnya
          </button>
        )}
      </div>
      <p className="hint">
        Tip: tekan angka 0 sampai 3 untuk memilih jawaban, atau panah kiri/kanan untuk berpindah.
      </p>
    </section>
  );
};
