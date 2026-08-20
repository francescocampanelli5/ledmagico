/* ============ Icone prodotto disegnate a mano (line-art + glow) ============ */
let iconUid = 0;
function iconShell(key, inner) {
  iconUid += 1;
  const g = `g-${key}-${iconUid}`;
  const f = `f-${key}-${iconUid}`;
  return `
  <svg viewBox="0 0 200 200" class="icon-${key}" style="--icon-c1:#ffe3a3;--icon-c2:#f4c064;">
    <defs>
      <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--icon-c1)"/>
        <stop offset="100%" stop-color="var(--icon-c2)"/>
      </linearGradient>
      <filter id="${f}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g fill="none" stroke="url(#${g})" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#${f})">
      ${inner}
    </g>
  </svg>`;
}

export const ICONS = {
  eiffel: () => iconShell('eiffel', `
    <path d="M100 16 L80 178 M100 16 L120 178"/>
    <path d="M72 178 L128 178"/>
    <path d="M78 136 L122 136"/>
    <path d="M82 178 L100 136 L118 178"/>
    <path d="M86 98 L114 98"/>
    <path d="M90 60 L110 60"/>
    <path d="M82 178 L100 60 L118 178"/>
    <path d="M94 34 L106 34"/>
    <circle cx="100" cy="16" r="3" fill="var(--icon-c1)" stroke="none"/>
    <circle cx="86" cy="98" r="2.2" fill="var(--icon-c1)" stroke="none"/>
    <circle cx="114" cy="98" r="2.2" fill="var(--icon-c1)" stroke="none"/>
    <circle cx="78" cy="136" r="2.2" fill="var(--icon-c1)" stroke="none"/>
    <circle cx="122" cy="136" r="2.2" fill="var(--icon-c1)" stroke="none"/>
  `),
  skyline: () => iconShell('skyline', `
    <rect x="18" y="112" width="24" height="66"/>
    <rect x="48" y="70" width="28" height="108"/>
    <rect x="82" y="128" width="20" height="50"/>
    <rect x="108" y="48" width="24" height="130"/>
    <rect x="138" y="92" width="22" height="86"/>
    <path d="M120 48 L120 26"/>
    <circle cx="120" cy="22" r="3" fill="var(--icon-c1)" stroke="none"/>
    <path d="M55 88 L69 88 M55 104 L69 104 M115 66 L125 66 M115 86 L125 86 M115 106 L125 106"/>
  `),
  barca: () => iconShell('barca', `
    <path d="M38 148 Q100 172 162 148 L146 166 Q100 180 54 166 Z"/>
    <path d="M100 148 L100 26"/>
    <path d="M103 32 L100 130 L152 122 Z"/>
    <path d="M97 55 L97 128 L52 118 Z"/>
    <path d="M100 26 L114 22 L100 34 Z" fill="var(--icon-c1)" stroke="none"/>
    <path d="M20 168 q15 -9 30 0 q15 9 30 0 q15 -9 30 0 q15 9 30 0 q15 -9 30 0" stroke-width="2"/>
  `),
  pirata: () => iconShell('pirata', `
    <path d="M28 148 L172 148 L154 176 L46 176 Z"/>
    <path d="M70 148 L70 26"/>
    <path d="M130 148 L130 34"/>
    <path d="M53 44 L87 44 L82 100 L58 100 Z"/>
    <path d="M113 52 L147 52 L142 100 L118 100 Z"/>
    <path d="M130 26 L156 34 L130 42 Z"/>
    <path d="M120 32 L142 32 M131 22 L131 42" stroke-width="2.2"/>
    <path d="M30 148 Q100 160 170 148" stroke-width="2"/>
  `),
  castello: () => iconShell('castello', `
    <path d="M40 178 L40 108 L54 108 L54 92 L68 92 L68 108 L88 108 L88 74 L112 74 L112 108 L132 108 L132 92 L146 92 L146 108 L160 108 L160 178 Z"/>
    <path d="M100 74 L100 40 M92 46 L108 46"/>
    <path d="M92 46 L100 30 L108 46 Z" fill="var(--icon-c1)" stroke="none"/>
    <path d="M61 92 L61 78 M54 82 L68 82"/>
    <path d="M139 92 L139 78 M132 82 L146 82"/>
    <rect x="93" y="140" width="14" height="38" rx="2"/>
    <path d="M60 130 L64 130 M136 130 L140 130 M60 150 L64 150 M136 150 L140 150"/>
  `),
  presepe: () => iconShell('presepe', `
    <path d="M30 108 L100 58 L170 108"/>
    <path d="M42 116 L42 176 M158 116 L158 176"/>
    <path d="M42 176 L158 176"/>
    <path d="M70 176 L70 128 L100 112 L130 128 L130 176"/>
    <path d="M100 40 L104 50 L115 50 L106 57 L109 68 L100 61 L91 68 L94 57 L85 50 L96 50 Z" fill="var(--icon-c1)" stroke="none" stroke-width="1"/>
    <circle cx="100" cy="150" r="14" fill="var(--icon-c1)" opacity="0.35" stroke="none"/>
  `),
  faro: () => iconShell('faro', `
    <path d="M86 178 L94 56 L106 56 L114 178 Z"/>
    <path d="M89 150 L111 150 M91 122 L109 122 M93 94 L107 94"/>
    <rect x="88" y="40" width="24" height="16"/>
    <path d="M88 40 L100 20 L112 40 Z"/>
    <path d="M86 46 L26 24 M114 46 L174 24" stroke-width="2" stroke-dasharray="2 6"/>
    <path d="M50 178 Q100 190 150 178" stroke-width="2"/>
    <circle cx="100" cy="14" r="2.4" fill="var(--icon-c1)" stroke="none"/>
  `),
  mongolfiera: () => iconShell('mongolfiera', `
    <path d="M100 18 C58 18 42 70 53 112 C64 144 136 144 147 112 C158 70 142 18 100 18 Z"/>
    <path d="M100 18 C88 50 88 100 100 140 M100 18 C112 50 112 100 100 140 M62 55 C80 75 120 75 138 55"/>
    <path d="M78 144 L86 160 L114 160 L122 144" />
    <rect x="84" y="160" width="32" height="20" rx="3"/>
    <circle cx="100" cy="70" r="2.4" fill="var(--icon-c1)" stroke="none"/>
  `),
};

export const ICON_KEYS = Object.keys(ICONS);

export function renderProductMedia(product) {
  if (product.image) {
    return `<img src="${product.image}" alt="${product.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
  }
  const icon = ICONS[product.iconKey] || ICONS.eiffel;
  return icon();
}

export const CATEGORY_LABEL = { monumenti: 'Monumenti', barche: 'Barche & Mare', presepi: 'Presepi', fantasia: 'Fantasia' };
export const COLOR_LABEL = { warm: 'Bianco caldo', blue: 'Blu notte', rgb: 'RGB multicolore' };
export const COLOR_VARS = { warm: ['#ffe3a3', '#f4c064'], blue: ['#cfe0ff', '#6f8cff'], rgb: ['#ffb4e6', '#7fd8ff'] };
