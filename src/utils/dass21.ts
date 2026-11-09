export type SubscaleKey = 'd' | 'a' | 's';

export interface QuestionItem {
  text: string;
  subscale: SubscaleKey;
}

export interface OptionItem {
  value: number;
  label: string;
  description: string;
}

export interface SubscaleMeta {
  name: string;
  thresholds: [number, number, number, number];
}

export interface ClusterScore {
  index: number;
  name: string;
  mean: number;
  percentage: number;
}

export interface TopSymptom {
  text: string;
  answerValue: number;
  answerLabel: string;
}

export interface SubscaleResult {
  key: SubscaleKey;
  name: string;
  rawScore: number;
  score: number;
  level: number;
  levelName: string;
  shortText: string;
  longText: string;
  meaning: string;
  thresholds: [number, number, number, number];
  clusters: ClusterScore[];
  dominantCluster: ClusterScore;
  isBalancedClusters: boolean;
  topSymptoms: TopSymptom[];
  recoveryTips: string[];
  spiritualTip: string;
}

export interface SevenDayPlan {
  focusKey: SubscaleKey;
  focusName: string;
  hasSevereWarning: boolean;
  reminder: string;
  days: string[];
}

export interface Dass21Evaluation {
  subscales: Record<SubscaleKey, SubscaleResult>;
  orderedSubscales: SubscaleResult[];
  maxLevel: number;
  focusKey: SubscaleKey;
  sevenDayPlan: SevenDayPlan | null;
  showCareBanner: boolean;
  overallSummaryParts: {
    hasSymptoms: boolean;
    highAspectNames: string[];
    maxLevelName: string;
    anxietyAndStressHigh: boolean;
    depressionWithTension: boolean;
    quietDepressionOnly: boolean;
  };
  clipboardText: string;
}

export interface HistoryRecord {
  id: string;
  dateIso: string;
  dateLabel: string;
  scores: Record<SubscaleKey, number>;
  levels: Record<SubscaleKey, number>;
  levelNames: Record<SubscaleKey, string>;
  answers?: number[];
}

export interface HistoryDelta {
  d: number;
  a: number;
  s: number;
}

export interface BreathingState {
  phase: 'inhale' | 'exhale';
  phaseLabel: string;
  countInPhase: number;
  phaseDuration: number;
  phaseProgress: number;
  dhikrText: string;
  dhikrMeaning: string;
}

export const DHIKR_LIST = [
  {
    arabic: "سُبْحَانَ اللَّهِ",
    latin: "Subhanallah",
    meaning: "Maha Suci Allah"
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ",
    latin: "Alhamdulillah",
    meaning: "Segala puji bagi Allah"
  },
  {
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    latin: "Astaghfirullah",
    meaning: "Aku memohon ampun kepada Allah"
  },
  {
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    latin: "Laa hawla wa laa quwwata illa billah",
    meaning: "Tiada daya dan kekuatan kecuali dengan pertolongan Allah"
  }
] as const;

export const QUESTIONS: QuestionItem[] = [
  { text: "Saya merasa sulit untuk menenangkan diri", subscale: "s" },
  { text: "Saya merasa mulut saya kering", subscale: "a" },
  { text: "Saya sama sekali tidak dapat merasakan perasaan positif", subscale: "d" },
  { text: "Saya mengalami kesulitan bernapas (misalnya napas cepat atau terengah-engah tanpa aktivitas fisik)", subscale: "a" },
  { text: "Saya merasa sulit untuk memulai melakukan sesuatu", subscale: "d" },
  { text: "Saya cenderung bereaksi berlebihan terhadap suatu situasi", subscale: "s" },
  { text: "Saya merasa gemetar (misalnya pada tangan)", subscale: "a" },
  { text: "Saya merasa banyak menghabiskan energi karena cemas", subscale: "s" },
  { text: "Saya khawatir akan situasi di mana saya bisa panik dan mempermalukan diri sendiri", subscale: "a" },
  { text: "Saya merasa tidak ada hal yang dapat diharapkan di masa depan", subscale: "d" },
  { text: "Saya merasa diri saya mudah gelisah", subscale: "s" },
  { text: "Saya merasa sulit untuk bersantai", subscale: "s" },
  { text: "Saya merasa sedih dan tertekan", subscale: "d" },
  { text: "Saya tidak sabar terhadap hal apa pun yang menghalangi saya menyelesaikan apa yang sedang saya kerjakan", subscale: "s" },
  { text: "Saya merasa hampir panik", subscale: "a" },
  { text: "Saya tidak dapat merasa antusias terhadap hal apa pun", subscale: "d" },
  { text: "Saya merasa tidak berharga sebagai seorang manusia", subscale: "d" },
  { text: "Saya merasa diri saya agak mudah tersinggung", subscale: "s" },
  { text: "Saya menyadari detak jantung saya meski tidak sedang beraktivitas fisik (misalnya jantung berdebar atau terlewat satu denyut)", subscale: "a" },
  { text: "Saya merasa takut tanpa alasan yang jelas", subscale: "a" },
  { text: "Saya merasa hidup tidak berarti", subscale: "d" }
];

export const OPTIONS: OptionItem[] = [
  { value: 0, label: "Tidak pernah", description: "Tidak sesuai dengan yang saya rasakan" },
  { value: 1, label: "Kadang-kadang", description: "Sesekali terasa dalam seminggu terakhir" },
  { value: 2, label: "Sering", description: "Cukup sering terasa dalam seminggu terakhir" },
  { value: 3, label: "Sangat sering", description: "Hampir setiap saat saya rasakan" }
];

export const SUBSCALES: Record<SubscaleKey, SubscaleMeta> = {
  d: { name: "Depresi", thresholds: [10, 14, 21, 28] },
  a: { name: "Kecemasan", thresholds: [8, 10, 15, 20] },
  s: { name: "Stres", thresholds: [15, 19, 26, 34] }
};

export const LEVEL_NAMES = ["Normal", "Ringan", "Sedang", "Berat", "Sangat berat"] as const;

export const SHORT_INTERPRETATIONS = [
  "Berada dalam rentang yang tenang dan terjaga.",
  "Mulai ada sinyal lelah yang ringan. Yuk, beri jeda dan perhatikan pola tidur serta asupanmu.",
  "Beban mulai terasa cukup nyata. Berbagi cerita dengan orang tepercaya atau konselor akan sangat melegakan.",
  "Beban yang kamu rasakan minggu ini cukup besar. Berbincang dengan psikolog atau psikiater sangat disarankan agar kamu terbantu.",
  "Hatimu dan tubuhmu sedang memikul beban yang sangat melelahkan. Sangat disarankan segera mencari pendampingan profesional."
] as const;

export const LONG_INTERPRETATIONS = [
  "Perasaan yang kamu alami berada dalam rentang wajar sehari-hari. Tetap jaga pola istirahat dan ruang tenangmu, ya.",
  "Ada sedikit beban yang mulai terasa, namun biasanya masih bisa terurai dengan istirahat yang cukup. Ini pengingat lembut untuk memperhatikan tidur, makan, dan jeda harian sebelum lelahnya menumpuk.",
  "Apa yang kamu rasakan sudah cukup menguras energi dan mungkin mulai memengaruhi keseharianmu. Kamu tidak perlu memendamnya sendiri—bercerita pada orang yang membuatmu aman atau mencoba sesi konseling akan sangat membantu.",
  "Beban ini terasa kuat dan kemungkinan membuat aktivitas harianmu terasa berat. Mencari bantuan psikolog atau psikiater adalah wujud kasih sayang pada dirimu sendiri, jadi tidak perlu menunggu sampai kamu benar-benar kehabisan tenaga.",
  "Saat ini kamu sedang melewati fase yang sangat menguras energi. Ingatlah bahwa ini bukan tanda kamu lemah, melainkan sinyal bahwa kamu berhak mendapatkan dukungan dan ruang aman dari tenaga kesehatan jiwa sesegera mungkin."
] as const;

export const SUBSCALE_MEANINGS: Record<SubscaleKey, string> = {
  d: "Aspek ini menggambarkan suasana hati yang sedang meredup, berkurangnya semangat atau minat, serta perasaan lelah dalam memandang masa depan.",
  a: "Aspek ini menggambarkan respons tubuh yang sedang tegang (seperti jantung berdebar, gemetar, atau napas terasa pendek) serta rasa khawatir yang muncul tiba-tiba.",
  s: "Aspek ini menggambarkan ketegangan yang berlangsung lama: sulit merasa rileks, mudah lelah secara emosi, gelisah, dan merasa harus terus siaga."
};

export const PLAN_STEPS: Record<SubscaleKey, [string, string, string]> = {
  d: [
    "Mulai dari satu hal yang sangat ringan: mandi air hangat, menghirup udara pagi 10 menit, atau menyapa satu orang terdekat.",
    "Lakukan satu aktivitas kecil yang dulu kamu sukai selama beberapa menit saja. Sering kali rasa nyaman baru muncul setelah kita mulai bergerak pelan.",
    "Sebelum tidur, tuliskan tiga hal kecil yang patut disyukuri hari ini—sesederhana bisa makan hangat atau beristirahat."
  ],
  a: [
    "Latih napas 4-6: tarik napas pelan 4 hitungan, hembuskan 6 hitungan, ulangi selama 2 menit saat tubuh mulai terasa tegang.",
    "Kurangi minuman berkafein dan usahakan tidur lebih awal, karena tubuh yang kurang istirahat membuat debar dan rasa cemas lebih mudah muncul.",
    "Saat pikiran mulai melayang jauh karena khawatir, sebutkan 5 benda di sekitarmu untuk membantu pikiran kembali tenang di saat ini."
  ],
  s: [
    "Beri batas yang lembut antara waktu beraktivitas dan waktu istirahat; ambil jeda 5 menit setiap 60–90 menit untuk meregangkan bahu.",
    "Tuangkan semua hal yang memenuhi kepalamu ke atas kertas, lalu pilih satu hal paling ringan saja untuk diselesaikan hari ini.",
    "Lakukan gerak ringan seperti berjalan santai 15–20 menit untuk membantu tubuh melepaskan ketegangan yang menumpuk."
  ]
};

export const CLUSTERS: Record<SubscaleKey, [ [string, number[]], [string, number[]] ]> = {
  d: [
    ["Semangat dan dorongan", [2, 4, 15]],
    ["Suasana hati, harapan, dan harga diri", [9, 12, 16, 20]]
  ],
  a: [
    ["Reaksi tubuh", [1, 3, 6, 18]],
    ["Rasa takut dan panik", [8, 14, 19]]
  ],
  s: [
    ["Sulit rileks dan gelisah", [0, 7, 10, 11]],
    ["Mudah tersulut", [5, 13, 17]]
  ]
};

export const CLUSTER_TIPS: Record<SubscaleKey, [string[], string[]]> = {
  d: [
    [
      "Pilih satu kegiatan kecil dan lakukan selama 5 menit saja—jika setelah itu ingin beristirahat lagi, tidak apa-apa.",
      "Apresiasi dirimu setiap kali berhasil menyelesaikan langkah kecil, sekecil apa pun itu."
    ],
    [
      "Bayangkan seorang sahabat dekat sedang merasakan apa yang kamu alami, lalu sampaikan kalimat penghiburan yang hangat itu untuk dirimu sendiri.",
      "Perasaan bahwa dirimu 'tidak berharga' muncul karena hatimu sedang kelelahan, bukan karena itu fakta. Berbagilah dengan orang yang aman agar beban ini tidak kamu pikul sendiri."
    ]
  ],
  a: [
    [
      "Jika debar jantung, gemetar, atau napas pendek sering terasa, tidak ada salahnya memeriksakan diri ke dokter agar hati lebih tenang.",
      "Cukupi kebutuhan air putih, kurangi kafein, dan beri waktu tidur yang cukup agar tubuh tidak mudah terpicu rasa berdebar."
    ],
    [
      "Kenali kekhawatiranmu dengan lembut, lalu tanyakan pada diri sendiri: seberapa besar kemungkinan hal itu benar-benar terjadi, dan langkah kecil apa yang bisa kulakukan?",
      "Jangan memaksakan diri sekaligus. Saat hatimu sudah lebih tenang, dekati hal yang membuatmu khawatir sedikit demi sedikit, mulai dari langkah yang paling terasa aman."
    ]
  ],
  s: [
    [
      "Coba relaksasi bahu dan otot: tarik napas sambil mengencangkan otot bahu selama 5 detik, lalu hembuskan sambil melepaskannya perlahan.",
      "Matikan notifikasi atau layar gawai satu jam sebelum tidur agar pikiranmu punya waktu untuk turun dari mode siaga."
    ],
    [
      "Saat situasi mulai memancing emosi, beri jeda 10 detik sambil menarik napas panjang sebelum merespons.",
      "Periksa kebutuhan dasar tubuhmu—sering kali kita lebih mudah lelah emosi saat lapar, kurang tidur, atau terlalu terburu-buru."
    ]
  ]
};

export const SPIRITUAL_TIPS: Record<SubscaleKey, [string, string]> = {
  d: [
    "Temani harimu dengan satu amalan ringan yang menenangkan, misalnya dua rakaat shalat dhuha atau membaca beberapa ayat Al-Qur’an. Amalan kecil yang lembut jauh lebih menenteramkan daripada target besar yang memberatkan.",
    "Ingatlah bahwa dirimu begitu berharga di sisi Allah. Tumpahkan seluruh isi hatimu dalam doa dan sujud, tanpa perlu menyembunyikan rasa sedih atau menghakimi dirimu sendiri."
  ],
  a: [
    "Perlambat tarikan napas sambil melafalkan dzikir pelan seperti tasbih atau istighfar. Kamu juga bisa mengamalkan doa memohon ketenangan: Allahumma inni a’udzu bika minal hammi wal hazan.",
    "Berdzikir pelan sembari mengatur napas membantu hatimu kembali merasa dekat dengan penjagaan Allah, sambil tetap berikhtiar selangkah demi selangkah."
  ],
  s: [
    "Jadikan waktu wudhu dan shalat sebagai jeda untuk membasuh lelah, atau duduklah tenang sejenak selepas shalat. Biarkan waktu ibadah menjadi tempat tubuh dan pikiranmu beristirahat.",
    "Saat hati terasa sesak atau kesal, ucapkan ta’awudz, duduklah jika sedang berdiri, dan beri ruang hening sejenak sebagaimana tuntunan lembut Rasulullah ﷺ."
  ]
};

export const QURAN_REMINDERS: Record<SubscaleKey, string> = {
  d: "Maka sesungguhnya bersama kesulitan ada kemudahan. (QS. Al-Insyirah: 5–6)",
  a: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram. (QS. Ar-Ra’d: 28)",
  s: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya. (QS. Al-Baqarah: 286)"
};

export function getSeverityLevel(score: number, thresholds: [number, number, number, number]): number {
  return thresholds.filter(x => score >= x).length;
}

export function getClusterScores(answers: number[], key: SubscaleKey): ClusterScore[] {
  return CLUSTERS[key].map((c, idx) => {
    const mean = c[1].reduce((sum, qIdx) => sum + (answers[qIdx] ?? 0), 0) / c[1].length;
    return {
      index: idx,
      name: c[0],
      mean,
      percentage: (mean / 3) * 100
    };
  });
}

export function getDominantCluster(answers: number[], key: SubscaleKey): ClusterScore {
  const clusters = getClusterScores(answers, key);
  return clusters[1].mean > clusters[0].mean ? clusters[1] : clusters[0];
}

export function getSpiritualTip(answers: number[], key: SubscaleKey): string {
  const dom = getDominantCluster(answers, key);
  return SPIRITUAL_TIPS[key][dom.index];
}

export function getRecoveryTips(answers: number[], key: SubscaleKey): string[] {
  const clusters = getClusterScores(answers, key);
  const dom = getDominantCluster(answers, key);
  const other = clusters[1 - dom.index];
  const tips = CLUSTER_TIPS[key][dom.index].slice();
  if (other.mean >= 1.5) {
    tips.push(CLUSTER_TIPS[key][other.index][0]);
  }
  return tips;
}

export function getTopSymptoms(answers: number[], key: SubscaleKey): TopSymptom[] {
  return QUESTIONS.map((q, idx) => ({
    text: q.text,
    answerValue: answers[idx] ?? 0,
    subscale: q.subscale
  }))
    .filter(item => item.subscale === key && item.answerValue >= 2)
    .sort((a, b) => b.answerValue - a.answerValue)
    .slice(0, 3)
    .map(item => ({
      text: item.text,
      answerValue: item.answerValue,
      answerLabel: OPTIONS[item.answerValue].label.toLowerCase()
    }));
}

export function evaluateDass21(answers: number[]): Dass21Evaluation {
  const rawScores: Record<SubscaleKey, number> = { d: 0, a: 0, s: 0 };
  QUESTIONS.forEach((q, idx) => {
    rawScores[q.subscale] += answers[idx] ?? 0;
  });

  const keys: SubscaleKey[] = ['d', 'a', 's'];
  const subscales = {} as Record<SubscaleKey, SubscaleResult>;
  let maxLevel = 0;
  const lines = ["Hasil DASS-21 saya:"];

  keys.forEach(k => {
    const score = rawScores[k] * 2;
    const thresholds = SUBSCALES[k].thresholds;
    const level = getSeverityLevel(score, thresholds);
    maxLevel = Math.max(maxLevel, level);

    const clusters = getClusterScores(answers, k);
    const dominantCluster = getDominantCluster(answers, k);
    const isBalancedClusters = Math.abs(clusters[0].mean - clusters[1].mean) < 0.5;
    const topSymptoms = getTopSymptoms(answers, k);
    const recoveryTips = getRecoveryTips(answers, k);
    const spiritualTip = getSpiritualTip(answers, k);

    lines.push(`${SUBSCALES[k].name}: ${score} (${LEVEL_NAMES[level]})`);

    subscales[k] = {
      key: k,
      name: SUBSCALES[k].name,
      rawScore: rawScores[k],
      score,
      level,
      levelName: LEVEL_NAMES[level],
      shortText: SHORT_INTERPRETATIONS[level],
      longText: LONG_INTERPRETATIONS[level],
      meaning: SUBSCALE_MEANINGS[k],
      thresholds,
      clusters,
      dominantCluster,
      isBalancedClusters,
      topSymptoms,
      recoveryTips,
      spiritualTip
    };
  });

  const focusKey = [...keys].sort(
    (x, y) => subscales[y].level - subscales[x].level || rawScores[y] - rawScores[x]
  )[0];

  const hasSevereWarning = keys.some(k => subscales[k].level >= 3);

  const sevenDayPlan: SevenDayPlan | null = maxLevel > 0
    ? {
        focusKey,
        focusName: SUBSCALES[focusKey].name.toLowerCase(),
        hasSevereWarning,
        reminder: QURAN_REMINDERS[focusKey],
        days: [
          "Kenali kabar hatimu (skala 1 sampai 10) di pagi dan malam hari, serta perhatikan jam istirahatmu.",
          PLAN_STEPS[focusKey][0],
          PLAN_STEPS[focusKey][1],
          getSpiritualTip(answers, focusKey),
          PLAN_STEPS[focusKey][2],
          "Sapa satu orang yang membuatmu merasa aman dan ceritakan sedikit apa yang kamu rasakan, lalu tutup hari dengan doa dan syukur.",
          "Lihat kembali perjalanan kecilmu minggu ini: langkah mana yang paling menenangkan? Teruskan pelan-pelan, dan cek kembali kondisi hatimu 2–4 minggu ke depan."
        ]
      }
    : null;

  const showCareBanner = (answers[20] ?? 0) >= 1 || maxLevel >= 3;

  const highAspectNames = keys
    .filter(k => subscales[k].level === maxLevel)
    .map(k => SUBSCALES[k].name.toLowerCase());

  return {
    subscales,
    orderedSubscales: [subscales.d, subscales.a, subscales.s],
    maxLevel,
    focusKey,
    sevenDayPlan,
    showCareBanner,
    overallSummaryParts: {
      hasSymptoms: maxLevel > 0,
      highAspectNames,
      maxLevelName: LEVEL_NAMES[maxLevel].toLowerCase(),
      anxietyAndStressHigh: subscales.a.level >= 2 && subscales.s.level >= 2,
      depressionWithTension: subscales.d.level >= 2 && (subscales.a.level >= 2 || subscales.s.level >= 2),
      quietDepressionOnly: subscales.d.level >= 2 && subscales.a.level < 2 && subscales.s.level < 2
    },
    clipboardText: lines.join("\n")
  };
}

export function createHistoryRecord(
  evaluation: Dass21Evaluation,
  now: Date = new Date(),
  answers?: number[]
): HistoryRecord {
  const dateLabel = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  return {
    id: `${now.getTime()}`,
    dateIso: now.toISOString(),
    dateLabel,
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
    },
    answers
  };
}

export function compareHistoryRecords(
  current: HistoryRecord,
  previous: HistoryRecord
): HistoryDelta {
  return {
    d: current.scores.d - previous.scores.d,
    a: current.scores.a - previous.scores.a,
    s: current.scores.s - previous.scores.s
  };
}

export function getBreathingState(elapsedSeconds: number): BreathingState {
  const cycleIndex = Math.floor(elapsedSeconds / 10);
  const secInCycle = elapsedSeconds % 10;
  const dhikr = DHIKR_LIST[cycleIndex % DHIKR_LIST.length];

  if (secInCycle < 4) {
    return {
      phase: 'inhale',
      phaseLabel: 'Tarik napas perlahan...',
      countInPhase: secInCycle + 1,
      phaseDuration: 4,
      phaseProgress: (secInCycle + 1) / 4,
      dhikrText: `${dhikr.arabic} — ${dhikr.latin}`,
      dhikrMeaning: dhikr.meaning
    };
  } else {
    const exhaleSec = secInCycle - 4;
    return {
      phase: 'exhale',
      phaseLabel: 'Hembuskan perlahan sambil berdzikir...',
      countInPhase: exhaleSec + 1,
      phaseDuration: 6,
      phaseProgress: (exhaleSec + 1) / 6,
      dhikrText: `${dhikr.arabic} — ${dhikr.latin}`,
      dhikrMeaning: dhikr.meaning
    };
  }
}
