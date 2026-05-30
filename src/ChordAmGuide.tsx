import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, RotateCcw, Music, CheckCircle, X } from 'lucide-react';

import { ChevronRight, ChevronLeft, RotateCcw, Music, CheckCircle } from 'lucide-react';

type AppStep = 'intro' | 'left-hand' | 'right-hand' | 'check';

const CHORD_POSITIONS = [
  { string: 6, fret: -1, finger: null },
  { string: 5, fret: 0,  finger: null },
  { string: 4, fret: 2,  finger: 2 },
  { string: 3, fret: 2,  finger: 3 },
  { string: 2, fret: 1,  finger: 1 },
  { string: 1, fret: 0,  finger: null },
];

const STRING_ORDER = [6, 5, 4, 3, 2, 1];
const STRING_NOTES = ['E2', 'A2', 'E3', 'A3', 'C4', 'E4'];

interface LessonStep {
  id: number;
  title: string;
  instruction: string;
  detail: string;
  finger: number | null;
  highlightString: number;
}

const LEFT_HAND_STEPS: LessonStep[] = [
  { id: 1, title: 'Ngón 2 — Dây 4, Phím 2', instruction: 'Đặt ngón trỏ (ngón 2) lên dây 4', detail: 'Bấm sát phía sau phím 2. Đầu ngón tay vuông góc với dây, không chạm vào dây bên cạnh.', finger: 2, highlightString: 4 },
  { id: 2, title: 'Ngón 3 — Dây 3, Phím 2', instruction: 'Đặt ngón giữa (ngón 3) lên dây 3', detail: 'Bấm cạnh ngón 2. Hai ngón song song nhau ở cùng phím 2. Kiểm tra ngón 2 vẫn bấm chắc.', finger: 3, highlightString: 3 },
  { id: 3, title: 'Ngón 1 — Dây 2, Phím 1', instruction: 'Đặt ngón út (ngón 1) lên dây 2', detail: 'Bấm ở phím 1, gần nut đàn. Đây là ngón khó nhất — bấm thật gần cạnh phím để tiếng kêu rõ.', finger: 1, highlightString: 2 },
  { id: 4, title: 'Dây 5 — Để buông', instruction: 'Dây 5 (A2) để buông, không bấm', detail: 'Dây 5 không cần bấm ngón nào. Tay trái không được chạm vào dây này.', finger: null, highlightString: 5 },
  { id: 5, title: 'Dây 1 — Để buông', instruction: 'Dây 1 (E4) để buông, không bấm', detail: 'Dây 1 cũng để buông. Kiểm tra ngón 1 không vô tình chạm vào dây 1.', finger: null, highlightString: 1 },
  { id: 6, title: 'Dây 6 — Không gảy', instruction: 'Dây 6 (E2) không được gảy', detail: 'Khi gảy, bỏ qua dây 6. Hợp âm Am chỉ gảy từ dây 5 đến dây 1.', finger: null, highlightString: 6 },
];

// ─── Chord Diagram ───────────────────────────────────────
function ChordDiagram({ highlightString }: { highlightString: number }) {
  const numFrets = 3;
  const colSpacing = 40;
  const rowSpacing = 40;
  const topPad = 48;
  const leftPad = 24;
  const rightPad = 26;
  const bottomPad = 32;
  const dotR = 14;

  const gridW = (STRING_ORDER.length - 1) * colSpacing;
  const gridH = numFrets * rowSpacing;
  const svgW = leftPad + gridW + rightPad;
  const svgH = topPad + gridH + bottomPad;

  const sx = (strNum: number) => leftPad + STRING_ORDER.indexOf(strNum) * colSpacing;
  const fy = (fret: number) => topPad + (fret - 0.5) * rowSpacing;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="select-none w-auto h-full">
      <rect x={leftPad} y={topPad - 5} width={gridW} height={6} rx={2} fill="#d1d5db" />

      {Array.from({ length: numFrets + 1 }).map((_, i) => (
        <line key={i} x1={leftPad} y1={topPad + i * rowSpacing} x2={leftPad + gridW} y2={topPad + i * rowSpacing}
          stroke="#374151" strokeWidth={1.5} />
      ))}

      {STRING_ORDER.map(strNum => {
        const hi = strNum === highlightString;
        return (
          <line key={strNum}
            x1={sx(strNum)} y1={topPad} x2={sx(strNum)} y2={topPad + gridH}
            stroke={hi ? '#f59e0b' : '#4b5563'}
            strokeWidth={hi ? 3 : 2}
            style={{ transition: 'stroke 0.4s' }}
          />
        );
      })}

      {[1, 2, 3].map(f => (
        <text key={f} x={leftPad + gridW + 16} y={topPad + (f - 0.5) * rowSpacing + 5}
          textAnchor="middle" fontSize={11} fill="#6b7280">{f}</text>
      ))}

      {STRING_ORDER.map((strNum, i) => {
        const hi = strNum === highlightString;
        return (
          <text key={strNum} x={sx(strNum)} y={topPad + gridH + 22}
            textAnchor="middle" fontSize={11} fontWeight={hi ? 'bold' : 'normal'}
            fill={hi ? '#f59e0b' : '#6b7280'}
            style={{ transition: 'fill 0.4s' }}
          >{STRING_NOTES[i]}</text>
        );
      })}

      {CHORD_POSITIONS.filter(p => p.fret <= 0).map(pos => {
        const hi = pos.string === highlightString;
        const cx = sx(pos.string);
        const cy = topPad - 22;
        return pos.fret === 0 ? (
          <circle key={pos.string} cx={cx} cy={cy} r={9}
            fill="none" stroke={hi ? '#f59e0b' : '#9ca3af'} strokeWidth={hi ? 2.5 : 2}
            style={{ transition: 'stroke 0.4s' }} />
        ) : (
          <g key={pos.string}>
            <line x1={cx - 6} y1={cy - 6} x2={cx + 6} y2={cy + 6}
              stroke={hi ? '#f59e0b' : '#ef4444'} strokeWidth={2} style={{ transition: 'stroke 0.4s' }} />
            <line x1={cx + 6} y1={cy - 6} x2={cx - 6} y2={cy + 6}
              stroke={hi ? '#f59e0b' : '#ef4444'} strokeWidth={2} style={{ transition: 'stroke 0.4s' }} />
          </g>
        );
      })}

      {CHORD_POSITIONS.filter(p => p.fret > 0 && p.finger !== null).map(pos => {
        const hi = pos.string === highlightString;
        const cx = sx(pos.string);
        const cy = fy(pos.fret);
        return (
          <g key={pos.string} style={{ transition: 'all 0.4s' }}>
            <circle cx={cx} cy={cy} r={dotR}
              fill={hi ? '#f59e0b' : '#e5e7eb'}
              style={{ filter: hi ? 'drop-shadow(0 0 8px rgba(245,158,11,0.8))' : 'none', transition: 'fill 0.4s, filter 0.4s' }}
            />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight="bold"
              fill={hi ? '#1c1917' : '#111827'}>{pos.finger}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Hand Illustration (left) ────────────────────────────
function HandIllustration({ activeFinger }: { activeFinger: number | null }) {
  const STROKE = '#94a3b8';
  const STROKE_DIM = '#475569';
  const FILL = '#0f172a';
  const ACTIVE_GLOW = 'rgba(245,158,11,0.35)';

  const fingerPaths: { id: number; label: string; path: string; tipX: number; tipY: number }[] = [
    { id: 1, label: '1', path: 'M 58 156 C 57 148, 54 135, 52 122 C 50 110, 49 95, 52 82 C 54 74, 59 70, 65 70 C 71 70, 76 74, 78 82 C 81 95, 79 110, 77 122 C 75 135, 73 148, 73 156 Z', tipX: 65, tipY: 64 },
    { id: 2, label: '2', path: 'M 79 153 C 78 142, 76 125, 75 108 C 74 92, 73 72, 76 58 C 78 48, 84 44, 91 44 C 98 44, 104 48, 106 58 C 109 72, 107 92, 106 108 C 105 125, 103 142, 102 153 Z', tipX: 91, tipY: 38 },
    { id: 3, label: '3', path: 'M 106 153 C 105 142, 104 125, 104 110 C 104 94, 104 75, 107 62 C 109 53, 114 49, 120 49 C 126 49, 131 53, 133 62 C 136 75, 135 94, 134 110 C 133 125, 132 142, 131 153 Z', tipX: 120, tipY: 43 },
    { id: 4, label: '4', path: 'M 133 156 C 133 148, 133 135, 134 122 C 135 110, 136 95, 139 84 C 141 77, 145 74, 150 74 C 155 74, 159 77, 161 84 C 164 95, 163 110, 162 122 C 161 135, 160 148, 159 156 Z', tipX: 150, tipY: 68 },
  ];

  const thumbPath = 'M 52 162 C 44 158, 34 150, 26 140 C 20 132, 16 122, 18 115 C 20 108, 28 105, 36 108 C 44 111, 50 120, 54 130 C 58 140, 58 150, 56 158 Z';
  const palmPath = 'M 48 155 C 42 160, 39 170, 41 182 C 43 194, 52 203, 68 206 C 90 210, 134 210, 155 206 C 168 203, 175 194, 177 182 C 179 170, 175 160, 170 155 Z';
  const wristPath = 'M 62 206 C 65 215, 67 224, 69 233 C 71 241, 76 247, 86 249 C 96 251, 128 251, 138 249 C 148 247, 152 241, 154 233 C 156 224, 157 215, 160 206';

  return (
    <svg viewBox="5 30 185 225" className="select-none w-full h-full">
      <defs>
        <filter id="glow-left">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="amber-grad-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      <path d={wristPath} fill="none" stroke={STROKE_DIM} strokeWidth={1.2} strokeLinecap="round" />
      <path d={palmPath} fill={FILL} stroke={STROKE_DIM} strokeWidth={1.4} />
      <path d={thumbPath} fill={FILL} stroke={STROKE_DIM} strokeWidth={1.4} strokeLinejoin="round" />

      {fingerPaths.map(f => {
        const active = activeFinger === f.id;
        return (
          <g key={f.id} style={{ transition: 'opacity 0.4s' }}>
            {active && (
              <path d={f.path} fill={ACTIVE_GLOW} stroke="none" filter="url(#glow-left)"
                className="animate-pulse" />
            )}
            <path
              d={f.path}
              fill={active ? 'url(#amber-grad-left)' : FILL}
              stroke={active ? '#f59e0b' : STROKE}
              strokeWidth={active ? 1.8 : 1.3}
              strokeLinejoin="round"
              style={{ transition: 'fill 0.4s, stroke 0.4s' }}
            />
            <text
              x={f.tipX} y={f.tipY - 8}
              textAnchor="middle" fontSize={13}
              fontWeight={active ? '700' : '500'}
              fontFamily="'Georgia', serif"
              fill={active ? '#fbbf24' : '#64748b'}
              style={{ transition: 'fill 0.4s' }}
            >{f.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Intro Screen ────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-gray-950 px-5 sm:px-6 pb-[calc(1rem+var(--safe-bottom))]">
      <div className="max-w-sm sm:max-w-md w-full text-center">
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/10 border border-amber-500/30 mb-5 sm:mb-6">
            <Music className="w-7 h-7 sm:w-9 sm:h-9 text-amber-400" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight">Học hợp âm Am</h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">Bài học cho người mới bắt đầu</p>
        </div>

        <div className="bg-gray-900/80 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-left">
          <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 font-medium">Bạn sẽ học:</p>
          <div className="space-y-2.5 sm:space-y-3">
            {[
              { num: 1, label: 'Đặt tay trái đúng vị trí' },
              { num: 2, label: 'Rải tay phải đúng thứ tự' },
              { num: 3, label: 'Kiểm tra bằng microphone' },
            ].map(item => (
              <div key={item.num} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-bold flex items-center justify-center">
                  {item.num}
                </span>
                <span className="text-gray-300 text-xs sm:text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full py-3.5 sm:py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-base sm:text-lg rounded-xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2"
        >
          Bắt đầu học
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Left Hand Screen ────────────────────────────────────
function LeftHandScreen({ onDone }: { onDone: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = LEFT_HAND_STEPS[currentStep];
  const isLast = currentStep === LEFT_HAND_STEPS.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-950 px-4 sm:px-6 pt-3 sm:pt-8 pb-[calc(0.75rem+var(--safe-bottom))] sm:pb-8 overflow-hidden">
      <div className="w-full max-w-lg sm:max-w-2xl mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 mb-2 sm:mb-6">
          <div className="flex items-center justify-between sm:justify-center sm:flex-col sm:gap-0 mb-2 sm:mb-4">
            <div className="flex items-center gap-2 sm:flex-col sm:gap-0 sm:text-center">
              <span className="text-[11px] sm:text-xs text-amber-400 font-semibold uppercase tracking-widest">Bước 1</span>
              <h2 className="text-[15px] sm:text-2xl font-bold text-white">Hợp âm Am</h2>
            </div>
            <span className="text-[11px] text-gray-500 sm:hidden">{currentStep + 1}/{LEFT_HAND_STEPS.length}</span>
          </div>
          <div className="flex gap-1 sm:gap-1.5">
            {LEFT_HAND_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`flex-1 h-[3px] sm:h-1.5 rounded-full transition-all duration-300 ${
                  i < currentStep ? 'bg-amber-500' :
                  i === currentStep ? 'bg-amber-400' :
                  'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Primary: Chord Diagram */}
        <div className="flex-1 min-h-0 bg-gray-900/50 border border-gray-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-6 flex items-center justify-center mb-2 sm:mb-5">
          <ChordDiagram highlightString={step.highlightString} />
        </div>

        {/* Secondary: Hand + Instruction side by side */}
        <div className="flex-shrink-0 flex gap-2 sm:gap-4 mb-3 sm:mb-5">
          {/* Hand — compact reference */}
          <div className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 bg-gray-900/40 border border-gray-800/60 rounded-lg sm:rounded-xl flex items-center justify-center p-1">
            <HandIllustration activeFinger={step.finger} />
          </div>

          {/* Instruction */}
          <div className="flex-1 min-w-0 bg-gray-900/60 border border-amber-500/15 sm:border-amber-500/25 rounded-lg sm:rounded-xl px-3 py-2 sm:p-4">
            <p className="text-amber-300 font-semibold text-[12px] sm:text-sm leading-snug">{step.title}</p>
            <p className="text-gray-200 text-[11px] sm:text-sm mt-0.5 leading-snug">{step.instruction}</p>
            <p className="text-gray-500 text-[11px] sm:text-xs leading-snug mt-1 line-clamp-2 sm:line-clamp-none">{step.detail}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-shrink-0 flex gap-2 sm:gap-3">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg sm:rounded-xl transition-colors disabled:opacity-30 text-xs sm:text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Trước
          </button>
          <div className="flex-1" />
          {isLast ? (
            <button
              onClick={onDone}
              className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg sm:rounded-xl transition-all duration-200 active:scale-[0.97] text-xs sm:text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Hoàn tất
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(s => Math.min(LEFT_HAND_STEPS.length - 1, s + 1))}
              className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg sm:rounded-xl transition-all duration-200 active:scale-[0.97] text-xs sm:text-sm"
            >
              Tiếp theo
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Right Hand Illustration ─────────────────────────────
const STRING_FINGER: Record<number, string> = { 0: 'p', 1: 'p', 2: 'i', 3: 'm', 4: 'a' };

function RightHandIllustration({ activeStringIdx }: { activeStringIdx: number }) {
  const STROKE = '#94a3b8';
  const STROKE_DIM = '#475569';
  const FILL = '#0f172a';
  const ACTIVE_GLOW = 'rgba(245,158,11,0.35)';

  const activeFinger = activeStringIdx >= 0 ? STRING_FINGER[activeStringIdx] : null;
  const thumbActive = activeFinger === 'p';
  const thumbPulseKey = thumbActive ? activeStringIdx : -1;

  const fingerPaths: { id: string; label: string; path: string; labelX: number; labelY: number }[] = [
    { id: 'pinky', label: '', path: 'M 24 155 C 22 147, 19 137, 17 128 C 15 119, 15 108, 18 99 C 20 93, 24 90, 29 90 C 34 90, 38 93, 40 99 C 42 108, 41 119, 40 128 C 39 137, 38 147, 38 155 Z', labelX: 0, labelY: 0 },
    { id: 'a', label: 'a', path: 'M 42 152 C 40 141, 36 126, 34 113 C 32 100, 30 84, 34 72 C 36 65, 41 61, 47 60 C 53 59, 59 63, 61 72 C 64 84, 63 100, 62 113 C 61 126, 59 141, 58 152 Z', labelX: 46, labelY: 52 },
    { id: 'm', label: 'm', path: 'M 62 150 C 60 137, 56 118, 54 102 C 52 86, 51 68, 55 54 C 58 45, 64 41, 71 41 C 78 41, 84 45, 87 54 C 91 68, 89 86, 87 102 C 85 118, 84 137, 83 150 Z', labelX: 70, labelY: 33 },
    { id: 'i', label: 'i', path: 'M 87 150 C 86 138, 84 120, 83 106 C 82 92, 82 74, 86 62 C 89 54, 95 50, 102 50 C 109 50, 115 54, 118 62 C 122 74, 120 92, 118 106 C 116 120, 115 138, 114 150 Z', labelX: 100, labelY: 42 },
  ];

  const thumbPath = 'M 130 158 C 136 152, 145 144, 154 138 C 162 132, 170 128, 177 127 C 184 126, 189 129, 190 135 C 191 141, 188 148, 182 153 C 175 158, 166 162, 157 165 C 148 168, 140 169, 134 166 Z';
  const thumbLabelX = 182, thumbLabelY = 120;
  const palmPath = 'M 22 155 C 18 161, 16 171, 18 183 C 20 195, 28 203, 44 207 C 68 212, 118 212, 140 207 C 152 203, 158 195, 160 183 C 162 171, 158 161, 154 155 Z';
  const wristPath = 'M 40 207 C 44 216, 46 225, 48 234 C 50 242, 54 248, 64 250 C 74 252, 112 252, 122 250 C 132 248, 136 242, 138 234 C 140 225, 141 216, 144 207';

  return (
    <div className="flex flex-col items-center h-full w-full justify-end">
      <svg viewBox="0 30 210 210" className="select-none w-auto h-full max-w-[240px] sm:max-w-[280px]">
        <defs>
          <filter id="glow-right">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="amber-grad-right" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        <path d={wristPath} fill="none" stroke={STROKE_DIM} strokeWidth={1.2} strokeLinecap="round" />
        <path d={palmPath} fill={FILL} stroke={STROKE_DIM} strokeWidth={1.4} />

        <g key={`thumb-pulse-${thumbPulseKey}`}>
          {thumbActive && (
            <path d={thumbPath} fill={ACTIVE_GLOW} stroke="none" filter="url(#glow-right)"
              style={{ animation: 'thumb-glow 0.7s ease-out' }} />
          )}
          <path
            d={thumbPath}
            fill={thumbActive ? 'url(#amber-grad-right)' : FILL}
            stroke={thumbActive ? '#f59e0b' : STROKE}
            strokeWidth={thumbActive ? 2 : 1.3}
            strokeLinejoin="round"
            style={{
              transition: 'stroke 0.15s ease-out, stroke-width 0.15s ease-out',
              transformOrigin: '160px 148px',
              transform: thumbActive ? 'scale(1.08)' : 'scale(1)',
              animation: thumbActive ? 'thumb-pulse 0.6s ease-in-out' : 'none',
            }}
          />
          <text
            x={thumbLabelX} y={thumbLabelY}
            textAnchor="middle" fontSize={14}
            fontWeight={thumbActive ? '700' : '600'}
            fontStyle="italic"
            fontFamily="'Georgia', 'Times New Roman', serif"
            fill={thumbActive ? '#fbbf24' : '#94a3b8'}
            style={{ transition: 'fill 0.15s ease-out', animation: thumbActive ? 'thumb-pulse 0.6s ease-in-out' : 'none', transformOrigin: `${thumbLabelX}px ${thumbLabelY}px` }}
          >p</text>
        </g>

        {fingerPaths.map(f => {
          const active = f.id !== 'pinky' && activeFinger === f.id;
          return (
            <g key={f.id}>
              {active && (
                <path d={f.path} fill={ACTIVE_GLOW} stroke="none" filter="url(#glow-right)"
                  className="animate-pulse" />
              )}
              <path
                d={f.path}
                fill={active ? 'url(#amber-grad-right)' : FILL}
                stroke={active ? '#f59e0b' : STROKE}
                strokeWidth={active ? 1.8 : 1.3}
                strokeLinejoin="round"
                style={{ transition: 'fill 0.4s, stroke 0.4s' }}
              />
              {f.label && (
                <text
                  x={f.labelX} y={f.labelY}
                  textAnchor="middle" fontSize={14}
                  fontWeight={active ? '700' : '600'}
                  fontStyle="italic"
                  fontFamily="'Georgia', 'Times New Roman', serif"
                  fill={active ? '#fbbf24' : '#94a3b8'}
                  style={{ transition: 'fill 0.4s' }}
                >{f.label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Right Hand Screen ───────────────────────────────────
const RIGHT_HAND_STRINGS = [5, 4, 3, 2, 1];

function useAudioContext() {
  const ctxRef = useRef<AudioContext | null>(null);
  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }, []);
  return getCtx;
}

function playTing(getCtx: () => AudioContext, stringIndex: number) {
  try {
    const ctx = getCtx();
    const baseFreqs = [110, 164.81, 220, 261.63, 329.63];
    const freq = baseFreqs[stringIndex] || 300;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
  } catch (_) {}
}

function RightHandScreen({ onDone }: { onDone: () => void }) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const getCtx = useAudioContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSequence = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCompleted(false);
    setActiveIdx(0);
    playTing(getCtx, 0);
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx++;
      if (idx >= RIGHT_HAND_STRINGS.length) {
        clearInterval(intervalRef.current!);
        setCompleted(true);
        setActiveIdx(-1);
        return;
      }
      setActiveIdx(idx);
      playTing(getCtx, idx);
    }, 1100);
  }, [getCtx]);

  useEffect(() => {
    startSequence();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startSequence]);

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-950 px-4 sm:px-6 pt-3 sm:pt-10 pb-[calc(0.75rem+var(--safe-bottom))] sm:pb-10 overflow-hidden">
      <div className="max-w-md w-full mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 mb-2 sm:mb-4">
          <div className="flex items-center justify-between sm:justify-center sm:flex-col sm:gap-0">
            <div className="flex items-center gap-2 sm:flex-col sm:gap-0 sm:text-center">
              <span className="text-[11px] sm:text-xs text-amber-400 font-semibold uppercase tracking-widest">Bước 2</span>
              <h2 className="text-[15px] sm:text-2xl font-bold text-white">Rải tay phải</h2>
            </div>
            <span className="text-amber-400/80 font-semibold text-[11px] sm:text-sm sm:mt-1">5 → 4 → 3 → 2 → 1</span>
          </div>
          <p className="text-gray-400 text-[11px] sm:text-xs mt-1 sm:mt-2 sm:text-center leading-snug">
            Giữ nguyên thế tay trái hợp âm Am, dùng tay phải rải từng dây
          </p>
        </div>

        {/* Unified interaction zone — hand + strings visually connected */}
        <div className="flex-1 min-h-0 bg-gray-900/40 border border-gray-800/60 rounded-xl sm:rounded-2xl flex flex-col overflow-hidden mb-3 sm:mb-5 relative">
          {/* Hand — 40%, flush bottom to touch strings */}
          <div className="flex-[4] min-h-0 flex items-end justify-center px-3 -mb-2">
            <RightHandIllustration activeStringIdx={activeIdx} />
          </div>

          {/* Connecting visual — subtle gradient bridge */}
          <div className="h-3 w-full bg-gradient-to-b from-transparent to-amber-500/[0.04]" />

          {/* Strings — 60%, strings grow downward from hand */}
          <div className="flex-[6] min-h-0 flex flex-col justify-start pt-0 px-4 sm:px-6 pb-3">
            <div className="flex items-start justify-center gap-3 sm:gap-5">
              {/* Dây 6 — muted */}
              <div className="flex flex-col items-center gap-1.5 opacity-25">
                <div className="rounded-full string-line" style={{ width: 3, background: '#4b5563' }} />
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs bg-gray-800/80 text-gray-500 relative">
                  6
                  <span className="absolute -top-0.5 -right-0.5 text-red-500 font-bold text-[8px]">x</span>
                </div>
              </div>

              {RIGHT_HAND_STRINGS.map((str, idx) => {
                const isActive = activeIdx === idx;
                const isDone = completed || (activeIdx > idx && activeIdx !== -1);
                const isThumb = idx <= 1;
                const isNextThumb = idx === 1 && activeIdx === 0;
                return (
                  <div key={str} className="flex flex-col items-center gap-1.5 relative">
                    {isActive && (
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-400/50 animate-ping pointer-events-none" style={{ animationDuration: '0.7s' }} />
                    )}
                    <div
                      className="rounded-full string-line"
                      style={{
                        width: isActive ? 7 : 4,
                        background: isActive
                          ? 'linear-gradient(to bottom, #fbbf24, #d97706)'
                          : isNextThumb ? 'linear-gradient(to bottom, rgba(251,191,36,0.3), rgba(217,119,6,0.15))'
                          : isDone ? '#4b5563' : '#6b7280',
                        boxShadow: isActive
                          ? '0 0 16px 5px rgba(245,158,11,0.6), 0 0 4px 1px rgba(245,158,11,0.9)'
                          : isNextThumb ? '0 0 8px 2px rgba(245,158,11,0.2)' : 'none',
                        transition: 'all 0.25s ease-out',
                      }}
                    />
                    <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-[11px] sm:text-sm transition-all duration-300 ${
                      isActive ? 'bg-amber-500 text-gray-950 scale-125 shadow-lg shadow-amber-500/50'
                      : isNextThumb ? 'bg-amber-500/20 text-amber-300/70 border border-amber-500/30'
                      : isDone ? 'bg-gray-700/80 text-gray-400'
                      : 'bg-gray-800/80 text-gray-400'
                    }`}>{str}</div>
                    <span className={`text-[11px] sm:text-xs font-semibold italic transition-colors duration-300 ${
                      isActive ? 'text-amber-400' : isNextThumb ? 'text-amber-400/50' : 'text-gray-600'
                    }`} style={{ fontFamily: "'Georgia', serif" }}>
                      {isThumb ? 'p' : idx === 2 ? 'i' : idx === 3 ? 'm' : 'a'}
                    </span>
                  </div>
                );
              })}
            </div>

            {completed && (
              <div className="mt-3 flex justify-center">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Action buttons — compact bottom */}
        <div className="flex-shrink-0 flex gap-2 sm:gap-3">
          <button
            onClick={startSequence}
            className="flex-1 py-2.5 sm:py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Rải lại
          </button>

          {completed && (
            <button
              onClick={onDone}
              className="flex-[2] py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg sm:rounded-xl transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Tiếp tục
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Check Screen ────────────────────────────────────────
function CheckScreen() {
  return (
    <div className="flex flex-col h-[100dvh] bg-gray-950 px-4 sm:px-6 pt-3 sm:pt-10 pb-[calc(0.5rem+var(--safe-bottom))] sm:pb-10 overflow-hidden">
      <div className="max-w-2xl w-full mx-auto flex flex-col h-full">
        <div className="flex-shrink-0 mb-3 sm:mb-6 text-center">
          <span className="text-[11px] sm:text-xs text-amber-400 font-semibold uppercase tracking-widest">Bước 3</span>
          <h2 className="text-[15px] sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">Kiểm tra âm thanh</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Gảy hợp âm Am và để micro xác nhận</p>
        </div>
        <div className="flex-1 min-h-0 bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl overflow-hidden">
          <iframe
            src="https://am-chord-sound-valid-gosc.bolt.host"
            title="Am Chord Sound Check"
            className="w-full h-full border-0"
            allow="microphone"
          />
        </div>
      </div>
    </div>
  );
}


// ─── ChordAmGuide — embeddable in chords app ─────────────
interface ChordAmGuideProps {
  onClose: () => void;
}

export default function ChordAmGuide({ onClose }: ChordAmGuideProps) {
  const [step, setStep] = useState<AppStep>('intro');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#040c16' }}>
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 1001,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 18,
        }}
      >
        ×
      </button>

      {step === 'intro'      && <IntroScreen onStart={() => setStep('left-hand')} />}
      {step === 'left-hand'  && <LeftHandScreen onDone={() => setStep('right-hand')} />}
      {step === 'right-hand' && <RightHandScreen onDone={() => setStep('check')} />}
      {step === 'check'      && <CheckScreen />}
    </div>
  );
}
