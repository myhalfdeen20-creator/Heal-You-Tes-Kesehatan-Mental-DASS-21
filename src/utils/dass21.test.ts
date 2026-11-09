import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTIONS,
  SUBSCALES,
  getSeverityLevel,
  evaluateDass21,
  getClusterScores,
  getDominantCluster,
  createHistoryRecord,
  compareHistoryRecords,
  getBreathingState
} from './dass21';

test('DASS-21 has 21 items with 7 items per subscale (d, a, s)', () => {
  assert.equal(QUESTIONS.length, 21);
  assert.equal(QUESTIONS.filter(q => q.subscale === 'd').length, 7);
  assert.equal(QUESTIONS.filter(q => q.subscale === 'a').length, 7);
  assert.equal(QUESTIONS.filter(q => q.subscale === 's').length, 7);
});

test('all-zero answers produce Normal level (0) and no 7-day plan or care banner', () => {
  const answers = new Array(21).fill(0);
  const result = evaluateDass21(answers);

  assert.equal(result.subscales.d.score, 0);
  assert.equal(result.subscales.a.score, 0);
  assert.equal(result.subscales.s.score, 0);
  assert.equal(result.maxLevel, 0);
  assert.equal(result.sevenDayPlan, null);
  assert.equal(result.showCareBanner, false);
  assert.equal(
    result.clipboardText,
    'Hasil DASS-21 saya:\nDepresi: 0 (Normal)\nKecemasan: 0 (Normal)\nStres: 0 (Normal)'
  );
});

test('severity thresholds match DASS-21 standard cutoffs after multiplying by 2', () => {
  // Depression thresholds: [10, 14, 21, 28]
  assert.equal(getSeverityLevel(8, SUBSCALES.d.thresholds), 0); // Normal
  assert.equal(getSeverityLevel(10, SUBSCALES.d.thresholds), 1); // Ringan
  assert.equal(getSeverityLevel(14, SUBSCALES.d.thresholds), 2); // Sedang
  assert.equal(getSeverityLevel(21, SUBSCALES.d.thresholds), 3); // Berat
  assert.equal(getSeverityLevel(28, SUBSCALES.d.thresholds), 4); // Sangat berat

  // Anxiety thresholds: [8, 10, 15, 20]
  assert.equal(getSeverityLevel(6, SUBSCALES.a.thresholds), 0);
  assert.equal(getSeverityLevel(8, SUBSCALES.a.thresholds), 1);
  assert.equal(getSeverityLevel(10, SUBSCALES.a.thresholds), 2);
  assert.equal(getSeverityLevel(15, SUBSCALES.a.thresholds), 3);
  assert.equal(getSeverityLevel(20, SUBSCALES.a.thresholds), 4);

  // Stress thresholds: [15, 19, 26, 34]
  assert.equal(getSeverityLevel(14, SUBSCALES.s.thresholds), 0);
  assert.equal(getSeverityLevel(15, SUBSCALES.s.thresholds), 1);
  assert.equal(getSeverityLevel(19, SUBSCALES.s.thresholds), 2);
  assert.equal(getSeverityLevel(26, SUBSCALES.s.thresholds), 3);
  assert.equal(getSeverityLevel(34, SUBSCALES.s.thresholds), 4);
});

test('care banner triggers when Q21 (index 20) >= 1 even if overall levels are mild', () => {
  const answers = new Array(21).fill(0);
  answers[20] = 1; // "Saya merasa hidup tidak berarti" = Kadang-kadang
  const result = evaluateDass21(answers);
  assert.equal(result.showCareBanner, true);
});

test('cluster scores and 7-day plan select highest subscale properly', () => {
  const answers = new Array(21).fill(0);
  // Make anxiety items high: indices [1, 3, 6, 8, 14, 18, 19]
  [1, 3, 6, 18].forEach(idx => {
    answers[idx] = 3; // Reaksi tubuh cluster = 3.0 mean
  });
  const clusters = getClusterScores(answers, 'a');
  assert.equal(clusters[0].mean, 3);
  assert.equal(clusters[1].mean, 0);

  const dom = getDominantCluster(answers, 'a');
  assert.equal(dom.index, 0);
  assert.equal(dom.name, 'Reaksi tubuh');

  const result = evaluateDass21(answers);
  assert.equal(result.subscales.a.score, 24); // 12 * 2 = 24 -> Sangat berat (level 4)
  assert.equal(result.focusKey, 'a');
  assert.ok(result.sevenDayPlan);
  assert.equal(result.sevenDayPlan?.focusName, 'kecemasan');
  assert.equal(result.sevenDayPlan?.days.length, 7);
  assert.equal(result.showCareBanner, true);
});

test('history comparison and 4-6 breathing state calculate accurately', () => {
  const prevEval = evaluateDass21(new Array(21).fill(2));
  const currEval = evaluateDass21(new Array(21).fill(1));

  const prevRecord = createHistoryRecord(prevEval, new Date('2026-10-01T10:00:00Z'));
  const currRecord = createHistoryRecord(currEval, new Date('2026-11-01T10:00:00Z'));

  const delta = compareHistoryRecords(currRecord, prevRecord);
  assert.equal(delta.d, -14); // 14 - 28 = -14
  assert.equal(delta.a, -14);
  assert.equal(delta.s, -14);

  const inhaleStart = getBreathingState(0);
  assert.equal(inhaleStart.phase, 'inhale');
  assert.equal(inhaleStart.countInPhase, 1);

  const exhaleStart = getBreathingState(4);
  assert.equal(exhaleStart.phase, 'exhale');
  assert.equal(exhaleStart.countInPhase, 1);
});
