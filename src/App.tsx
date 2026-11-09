/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { IntroSection } from './components/IntroSection';
import { QuizSection } from './components/QuizSection';
import { ResultSection } from './components/ResultSection';
import { Footer } from './components/Footer';
import {
  QUESTIONS,
  SubscaleKey,
  evaluateDass21,
  createHistoryRecord,
  HistoryRecord
} from './utils/dass21';

type ViewState = 'intro' | 'quiz' | 'result';

const HISTORY_STORAGE_KEY = 'healyou_dass21_history_v1';
const PLAN_CHECKS_BY_KEY_STORAGE = 'healyou_dass21_plan_checks_by_focus_v1';
const SESSION_DRAFT_KEY = 'healyou_dass21_session_draft_v1';
const LAST_ANSWERS_STORAGE_KEY = 'healyou_dass21_last_answers_v1';

type PlanChecksMap = Record<SubscaleKey, boolean[]>;

function getDefaultPlanChecksMap(): PlanChecksMap {
  return {
    d: new Array(7).fill(false),
    a: new Array(7).fill(false),
    s: new Array(7).fill(false)
  };
}

export default function App() {
  const [view, setView] = useState<ViewState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'quiz';
      }
      try {
        const draftRaw = window.sessionStorage.getItem(SESSION_DRAFT_KEY);
        if (draftRaw) {
          const draft = JSON.parse(draftRaw);
          if (draft.view === 'quiz' || draft.view === 'result') {
            return draft.view;
          }
        }
      } catch {
        // ignore
      }
    }
    return 'intro';
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const draftRaw = window.sessionStorage.getItem(SESSION_DRAFT_KEY);
        if (draftRaw) {
          const draft = JSON.parse(draftRaw);
          if (typeof draft.currentIndex === 'number') {
            return Math.min(Math.max(0, draft.currentIndex), QUESTIONS.length - 1);
          }
        }
      } catch {
        // ignore
      }
    }
    return 0;
  });

  const [answers, setAnswers] = useState<(number | undefined)[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const draftRaw = window.sessionStorage.getItem(SESSION_DRAFT_KEY);
        if (draftRaw) {
          const draft = JSON.parse(draftRaw);
          if (Array.isArray(draft.answers)) {
            return draft.answers;
          }
        }
      } catch {
        // ignore
      }
    }
    return [];
  });

  const [lastCompletedAnswers, setLastCompletedAnswers] = useState<number[] | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(LAST_ANSWERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === QUESTIONS.length) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSavedToHistory, setIsSavedToHistory] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [planChecksByFocus, setPlanChecksByFocus] = useState<PlanChecksMap>(() => {
    if (typeof window === 'undefined') return getDefaultPlanChecksMap();
    try {
      const raw = window.localStorage.getItem(PLAN_CHECKS_BY_KEY_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...getDefaultPlanChecksMap(), ...parsed };
        }
      }
    } catch {
      // ignore
    }
    return getDefaultPlanChecksMap();
  });

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  }, [isDark]);

  // Save session draft so accidental page reload doesn't lose progress
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        SESSION_DRAFT_KEY,
        JSON.stringify({ view, currentIndex, answers })
      );
    } catch {
      // ignore
    }
  }, [view, currentIndex, answers]);

  const handleToggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const handleStart = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setIsLocked(false);
    setIsSavedToHistory(false);
    setView('quiz');
  }, []);

  const handleResumeQuiz = useCallback(() => {
    setIsLocked(false);
    setView('quiz');
  }, []);

  const handleOpenLastResult = useCallback(() => {
    const sourceAnswers =
      lastCompletedAnswers ||
      history.find(h => Array.isArray(h.answers) && h.answers.length === QUESTIONS.length)
        ?.answers;
    if (sourceAnswers) {
      setAnswers(sourceAnswers);
      setIsSavedToHistory(true);
      setView('result');
    }
  }, [lastCompletedAnswers, history]);

  const finishQuizWithAnswers = useCallback((finalAnswers: (number | undefined)[]) => {
    const clean = QUESTIONS.map((_, idx) => finalAnswers[idx] ?? 0);
    setLastCompletedAnswers(clean);
    try {
      window.localStorage.setItem(LAST_ANSWERS_STORAGE_KEY, JSON.stringify(clean));
    } catch {
      // ignore
    }
    setView('result');
  }, []);

  const handleSelectOption = useCallback(
    (value: number) => {
      if (isLocked) return;
      const nextAnswers = [...answers];
      nextAnswers[currentIndex] = value;
      setAnswers(nextAnswers);
      setIsLocked(true);

      const reduceMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setTimeout(() => {
        setIsLocked(false);
        if (currentIndex < QUESTIONS.length - 1) {
          setCurrentIndex(idx => idx + 1);
        } else {
          finishQuizWithAnswers(nextAnswers);
        }
      }, reduceMotion ? 0 : 340);
    },
    [answers, currentIndex, isLocked, finishQuizWithAnswers]
  );

  const handleBack = useCallback(() => {
    if (currentIndex > 0 && !isLocked) {
      setCurrentIndex(idx => idx - 1);
    }
  }, [currentIndex, isLocked]);

  const handleNext = useCallback(() => {
    if (answers[currentIndex] !== undefined && !isLocked) {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex(idx => idx + 1);
      } else {
        finishQuizWithAnswers(answers);
      }
    }
  }, [answers, currentIndex, isLocked, finishQuizWithAnswers]);

  const evaluation = useMemo(() => {
    const numericAnswers = QUESTIONS.map((_, idx) => answers[idx] ?? 0);
    return evaluateDass21(numericAnswers);
  }, [answers]);

  const activeFocusKey = evaluation.focusKey;
  const checkedDays = planChecksByFocus[activeFocusKey] || new Array(7).fill(false);

  const handleSaveHistory = useCallback(() => {
    if (isSavedToHistory) return;
    const numericAnswers = QUESTIONS.map((_, idx) => answers[idx] ?? 0);
    const record = createHistoryRecord(evaluation, new Date(), numericAnswers);
    setHistory(prev => {
      const updated = [record, ...prev].slice(0, 12);
      try {
        window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
    setIsSavedToHistory(true);
  }, [answers, evaluation, isSavedToHistory]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    setIsSavedToHistory(false);
    setLastCompletedAnswers(null);
    try {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
      window.localStorage.removeItem(LAST_ANSWERS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const handleToggleDay = useCallback(
    (dayIndex: number) => {
      setPlanChecksByFocus(prev => {
        const currentList = prev[activeFocusKey] || new Array(7).fill(false);
        const nextList = [...currentList];
        nextList[dayIndex] = !nextList[dayIndex];
        const updated = { ...prev, [activeFocusKey]: nextList };
        try {
          window.localStorage.setItem(
            PLAN_CHECKS_BY_KEY_STORAGE,
            JSON.stringify(updated)
          );
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [activeFocusKey]
  );

  const handleResetDays = useCallback(() => {
    setPlanChecksByFocus(prev => {
      const updated = { ...prev, [activeFocusKey]: new Array(7).fill(false) };
      try {
        window.localStorage.setItem(
          PLAN_CHECKS_BY_KEY_STORAGE,
          JSON.stringify(updated)
        );
      } catch {
        // ignore
      }
      return updated;
    });
  }, [activeFocusKey]);

  const answeredCount = answers.filter(a => a !== undefined).length;
  const hasInProgressQuiz = answeredCount > 0 && answeredCount < QUESTIONS.length;
  const hasLastResult =
    Boolean(lastCompletedAnswers) ||
    history.some(h => Array.isArray(h.answers) && h.answers.length === QUESTIONS.length);

  return (
    <>
      <main>
        <Header isDark={isDark} onToggleTheme={handleToggleTheme} />
        {view === 'intro' && (
          <IntroSection
            onStart={handleStart}
            hasInProgressQuiz={hasInProgressQuiz}
            inProgressCount={answeredCount}
            onResumeQuiz={handleResumeQuiz}
            hasLastResult={hasLastResult}
            onOpenLastResult={handleOpenLastResult}
            history={history}
            onClearHistory={handleClearHistory}
          />
        )}
        {view === 'quiz' && (
          <QuizSection
            currentIndex={currentIndex}
            answers={answers}
            isLocked={isLocked}
            onSelectOption={handleSelectOption}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}
        {view === 'result' && (
          <ResultSection
            evaluation={evaluation}
            history={history}
            isSavedToHistory={isSavedToHistory}
            onSaveHistory={handleSaveHistory}
            onClearHistory={handleClearHistory}
            checkedDays={checkedDays}
            onToggleDay={handleToggleDay}
            onResetDays={handleResetDays}
            onRestart={handleStart}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
