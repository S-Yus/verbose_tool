interface RobotProps {
  talking: boolean
}

export default function Robot({ talking }: RobotProps) {
  return (
    <svg width="160" height="210" viewBox="0 0 160 210" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="headGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* アンテナ */}
      <line x1="80" y1="8" x2="80" y2="28" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
      <circle
        cx="80" cy="6" r="6"
        fill={talking ? "#00d4ff" : "#60a5fa"}
        filter={talking ? "url(#glow)" : undefined}
        style={{ transition: "fill 0.3s" }}
      />

      {/* 頭 */}
      <rect x="28" y="28" width="104" height="82" rx="18" fill="url(#headGrad)" />

      {/* 耳 */}
      <rect x="14" y="48" width="14" height="24" rx="5" fill="#2563eb" />
      <rect x="132" y="48" width="14" height="24" rx="5" fill="#2563eb" />

      {/* 目の背景 */}
      <circle cx="55" cy="62" r="14" fill="#1e3a8a" />
      <circle cx="105" cy="62" r="14" fill="#1e3a8a" />

      {/* 目の光 */}
      <circle
        cx="55" cy="62" r="8"
        fill={talking ? "#00d4ff" : "#93c5fd"}
        filter={talking ? "url(#glow)" : undefined}
        className={talking ? "robot-eye" : ""}
      />
      <circle
        cx="105" cy="62" r="8"
        fill={talking ? "#00d4ff" : "#93c5fd"}
        filter={talking ? "url(#glow)" : undefined}
        className={talking ? "robot-eye" : ""}
      />
      {/* 目の反射 */}
      <circle cx="58" cy="58" r="2.5" fill="white" opacity="0.6" />
      <circle cx="108" cy="58" r="2.5" fill="white" opacity="0.6" />

      {/* 口 */}
      {talking ? (
        <ellipse cx="80" cy="94" rx="16" ry="8" fill="#1e3a8a" className="robot-mouth" />
      ) : (
        <rect x="64" y="90" width="32" height="6" rx="3" fill="#1e3a8a" />
      )}

      {/* 胴体 */}
      <rect x="18" y="118" width="124" height="76" rx="14" fill="url(#bodyGrad)" />

      {/* 胴体パネル */}
      <rect x="32" y="132" width="36" height="22" rx="7" fill="#1e3a8a" opacity="0.5" />
      <rect x="92" y="132" width="36" height="22" rx="7" fill="#1e3a8a" opacity="0.5" />
      <circle
        cx="80" cy="168" r="10"
        fill={talking ? "#00d4ff" : "#60a5fa"}
        filter={talking ? "url(#glow)" : undefined}
        style={{ transition: "fill 0.3s" }}
      />
    </svg>
  )
}
