import { Dass21Evaluation, QURAN_REMINDERS } from './dass21';

export interface CardExportOptions {
  hideExactNumbers?: boolean;
}

function getWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = getWrappedLines(ctx, text, maxWidth);
  let curY = y;
  for (const line of lines) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateResultCardDataUrl(
  evaluation: Dass21Evaluation,
  options: CardExportOptions = {}
): Promise<string | null> {
  try {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready;
    }

    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1660;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Soft Aurora Pastel Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#fdf4fa');
    bgGrad.addColorStop(0.45, '#f2ebfb');
    bgGrad.addColorStop(1, '#e7f0fd');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative soft radial blooms
    const bloomTopLeft = ctx.createRadialGradient(140, 140, 10, 140, 140, 480);
    bloomTopLeft.addColorStop(0, 'rgba(246, 188, 220, 0.55)');
    bloomTopLeft.addColorStop(1, 'rgba(246, 188, 220, 0)');
    ctx.fillStyle = bloomTopLeft;
    ctx.fillRect(0, 0, width, height);

    const bloomBottomRight = ctx.createRadialGradient(
      width - 120,
      height - 160,
      20,
      width - 120,
      height - 160,
      520
    );
    bloomBottomRight.addColorStop(0, 'rgba(185, 165, 245, 0.45)');
    bloomBottomRight.addColorStop(1, 'rgba(185, 165, 245, 0)');
    ctx.fillStyle = bloomBottomRight;
    ctx.fillRect(0, 0, width, height);

    // 2. Main Outer Card Container
    const cardX = 56;
    const cardY = 56;
    const cardW = width - 112;
    const cardH = height - 112;

    ctx.save();
    ctx.shadowColor = 'rgba(122, 95, 196, 0.14)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 44);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.restore();

    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 44);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#e8ddf4';
    ctx.stroke();

    // Inner content horizontal margins
    const innerX = 108;
    const innerRight = width - 108;
    const innerW = innerRight - innerX;

    // 3. Header: Logo + Brand + Date Pill
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    await new Promise<void>(resolve => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => resolve();
      logoImg.src = '/assets/aistudio/Heal_You_20260804_222305_0000_3fc12f96.png';
    });

    if (logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.drawImage(logoImg, innerX, 104, 88, 88);
    }

    ctx.fillStyle = '#7a5fc4';
    ctx.font = '56px "Pinyon Script", Georgia, serif';
    ctx.fillText('Heal You', innerX + 108, 152);

    ctx.fillStyle = '#665f84';
    ctx.font = '500 21px system-ui, -apple-system, sans-serif';
    ctx.fillText('Muslimah Healing Journey Community', innerX + 108, 184);

    // Date pill on top right
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    const dateTextW = ctx.measureText(dateStr).width;
    const datePillW = dateTextW + 36;
    drawRoundedRect(ctx, innerRight - datePillW, 122, datePillW, 44, 22);
    ctx.fillStyle = '#f3ecfc';
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#665f84';
    ctx.fillText(dateStr, innerRight - datePillW / 2, 151);
    ctx.textAlign = 'left';

    // Hairline divider below header
    ctx.beginPath();
    ctx.moveTo(innerX, 218);
    ctx.lineTo(innerRight, 218);
    ctx.strokeStyle = '#efe6fa';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Main Title & Subtitle
    ctx.fillStyle = '#2e2745';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('Potret Kondisi Hatimu Minggu Ini', innerX, 274);

    ctx.fillStyle = '#665f84';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    drawWrappedText(
      ctx,
      'Refleksi skrining DASS-21 • Gambaran perasaan sementara, bukan label permanen.',
      innerX,
      310,
      innerW,
      28
    );

    // 5. Three Subscale Cards
    const levelColors = ['#2f8a72', '#b08826', '#c87438', '#c45b6c', '#8f4674'];
    const levelBgColors = ['#e8f6f2', '#fbf4e1', '#fceddf', '#fae8ec', '#f5e8f2'];

    let curY = 344;

    evaluation.orderedSubscales.forEach(sub => {
      const boxH = 248;
      drawRoundedRect(ctx, innerX, curY, innerW, boxH, 28);
      ctx.fillStyle = '#fcf9fe';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ece2f8';
      ctx.stroke();

      const padX = innerX + 32;
      const padRight = innerRight - 32;
      const contentW = padRight - padX;

      // Aspect Title
      ctx.fillStyle = '#2e2745';
      ctx.font = 'bold 29px system-ui, -apple-system, sans-serif';
      ctx.fillText(sub.name, padX, curY + 48);

      // Dominant symptom cluster tag next to or below title
      const clusterInfo =
        sub.level > 0
          ? sub.isBalancedClusters
            ? 'Pola: Gejala fisik & suasana hati seimbang'
            : `Pola utama: ${sub.dominantCluster.name}`
          : 'Pola: Kondisi tenang & stabil';
      ctx.fillStyle = '#7a5fc4';
      ctx.font = '500 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(clusterInfo, padX, curY + 80);

      // Level Badge + Optional Score on the Right
      const col = levelColors[sub.level] || '#7a5fc4';
      const badgeBg = levelBgColors[sub.level] || '#f1eafc';
      const badgeLabel = options.hideExactNumbers
        ? sub.levelName
        : `${sub.levelName} • ${sub.score}/42`;

      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      const badgeW = ctx.measureText(badgeLabel).width + 36;
      drawRoundedRect(ctx, padRight - badgeW, curY + 24, badgeW, 42, 21);
      ctx.fillStyle = badgeBg;
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = col;
      ctx.fillText(badgeLabel, padRight - badgeW / 2, curY + 52);
      ctx.textAlign = 'left';

      // Progress Track with Threshold Ticks
      const trackY = curY + 104;
      const trackH = 16;
      drawRoundedRect(ctx, padX, trackY, contentW, trackH, 8);
      ctx.fillStyle = '#e8ddf4';
      ctx.fill();

      const fillRatio = Math.max(0.03, Math.min(1, sub.score / 42));
      if (sub.score > 0) {
        drawRoundedRect(ctx, padX, trackY, contentW * fillRatio, trackH, 8);
        ctx.fillStyle = col;
        ctx.fill();
      }

      // White threshold ticks on bar
      sub.thresholds.forEach(t => {
        const tickX = padX + (t / 42) * contentW;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(tickX - 1.5, trackY - 2, 3, trackH + 4);
      });

      // Scale Legend under bar
      const scaleLabels = ['Normal', 'Ringan', 'Sedang', 'Berat', 'Sangat berat'];
      ctx.font = '17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#867ea3';
      scaleLabels.forEach((lbl, idx) => {
        if (idx === 0) {
          ctx.textAlign = 'left';
          ctx.fillText(lbl, padX, trackY + 36);
        } else if (idx === scaleLabels.length - 1) {
          ctx.textAlign = 'right';
          ctx.fillText(lbl, padRight, trackY + 36);
        } else {
          ctx.textAlign = 'center';
          const pos = padX + (idx / (scaleLabels.length - 1)) * contentW;
          ctx.fillText(lbl, pos, trackY + 36);
        }
      });
      ctx.textAlign = 'left';

      // Wrapped short interpretation (guaranteed never to overflow!)
      ctx.fillStyle = '#4a4366';
      ctx.font = '21px system-ui, -apple-system, sans-serif';
      drawWrappedText(ctx, sub.shortText, padX, trackY + 74, contentW, 29);

      curY += boxH + 22;
    });

    // 6. Langkah Kecil Pemulihan (Self-Care Box)
    const focusSub = evaluation.subscales[evaluation.focusKey];
    const stepBoxH = 178;
    drawRoundedRect(ctx, innerX, curY, innerW, stepBoxH, 28);
    ctx.fillStyle = '#fdf6fb';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f1d8e8';
    ctx.stroke();

    ctx.fillStyle = '#d64f86';
    ctx.font = 'bold 23px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      evaluation.maxLevel > 0
        ? `Langkah Kecil Merawat ${focusSub.name} Minggu Ini`
        : 'Langkah Kecil Menjaga Ketenangan Hati',
      innerX + 32,
      curY + 42
    );

    const tipToDisplay =
      evaluation.maxLevel > 0
        ? focusSub.recoveryTips[0]
        : 'Pertahankan tidur yang cukup, gerak tubuh ringan, serta luangkan waktu tenang untuk berdzikir dan berbagi cerita dengan orang terdekat.';

    ctx.fillStyle = '#2e2745';
    ctx.font = '21px system-ui, -apple-system, sans-serif';
    drawWrappedText(
      ctx,
      `• ${tipToDisplay}`,
      innerX + 32,
      curY + 80,
      innerW - 64,
      30
    );

    curY += stepBoxH + 22;

    // 7. Pengingat Hati (Quranic Verse Card)
    const reminderBoxH = 148;
    drawRoundedRect(ctx, innerX, curY, innerW, reminderBoxH, 28);
    const remGrad = ctx.createLinearGradient(innerX, curY, innerRight, curY + reminderBoxH);
    remGrad.addColorStop(0, '#f3ecfc');
    remGrad.addColorStop(1, '#fbe9f2');
    ctx.fillStyle = remGrad;
    ctx.fill();

    ctx.fillStyle = '#7a5fc4';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('Pengingat Hati', innerX + 32, curY + 42);

    ctx.fillStyle = '#2e2745';
    ctx.font = 'italic 25px Georgia, serif';
    const reminderText = `“${QURAN_REMINDERS[evaluation.focusKey]}”`;
    drawWrappedText(ctx, reminderText, innerX + 32, curY + 82, innerW - 64, 34);

    // 8. Footer Callout
    ctx.textAlign = 'center';
    ctx.fillStyle = '#7a5fc4';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      'Instagram @healyou.official  •  Muslimah Healing Journey Community',
      width / 2,
      height - 106
    );

    ctx.fillStyle = '#665f84';
    ctx.font = '20px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      'Kenali apa yang kamu rasakan, lalu pulihkan pelan-pelan.',
      width / 2,
      height - 76
    );
    ctx.textAlign = 'left';

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

export function triggerImageDownload(
  dataUrl: string,
  filename = 'potret-hati-dass21-healyou.png'
) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
