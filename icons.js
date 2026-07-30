// ============================================================
// CUSTOM ICON SET — hand-drawn SVG line icons (no emoji)
// Consistent 24×24 viewBox, stroke=currentColor, soft accent fills.
// Use: svgIcon('wheel') -> '<svg ...>'  or  svgIcon('wheel','my-class')
// Color via CSS: .more-ic { color: #c084fc; }  (accent uses currentColor too)
// ============================================================

const ICON_PATHS = {
    // ---- Rewards ----
    wheel: `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>
        <path d="M12 3.5V12M12 12 19 8.5M12 12 19 15.5M12 12 5 15.5M12 12 5 8.5M12 12V20.5"/>
        <path d="M12 1.6 13.3 4 10.7 4Z" fill="currentColor" stroke="none"/>`,
    crate: `<path d="M3.5 8 12 4l8.5 4-8.5 4Z" fill="currentColor" fill-opacity="0.18"/>
        <path d="M3.5 8 12 4l8.5 4-8.5 4Z"/><path d="M3.5 8v8l8.5 4V12"/><path d="M20.5 8v8l-8.5 4"/>
        <path d="M12 4v8" stroke-opacity="0.5"/>`,
    challenges: `<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 9l2 2 3.5-3.5" stroke-linecap="round"/>
        <path d="M8 15h8" stroke-opacity="0.6"/>`,
    pass: `<circle cx="12" cy="9" r="4.5"/><path d="M9.5 12.8 8 21l4-2.4 4 2.4-1.5-8.2"/>
        <path d="M12 6.6 12.9 8.4 14.8 8.7 13.4 10 13.7 11.9 12 11 10.3 11.9 10.6 10 9.2 8.7 11.1 8.4Z" fill="currentColor" stroke="none"/>`,
    gem: `<path d="M5 9 8 4.5h8L19 9l-7 11Z" fill="currentColor" fill-opacity="0.16"/>
        <path d="M5 9 8 4.5h8L19 9l-7 11Z"/><path d="M5 9h14M9 9 12 20M15 9 12 20M8 4.5 9 9M16 4.5 15 9"/>`,

    // ---- Economy ----
    cart: `<circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none"/>
        <path d="M3 4h2l2.2 11.2a1.4 1.4 0 0 0 1.4 1.1h8.2a1.4 1.4 0 0 0 1.4-1.1L21 7.5H6.2"/>`,
    boat: `<path d="M4 16h16l-2 4H6Z" fill="currentColor" fill-opacity="0.18"/><path d="M4 16h16l-2 4H6Z"/>
        <path d="M12 3v13"/><path d="M12 4c4 1.5 6 4.5 6 8H12Z" fill="currentColor" fill-opacity="0.18"/><path d="M12 4c4 1.5 6 4.5 6 8H12Z"/>`,
    scale: `<path d="M12 4v15M7 19h10M12 5 5 8m7-3 7 3"/><path d="M5 8 2.7 13h4.6Z" fill="currentColor" fill-opacity="0.16"/>
        <path d="M19 8 16.7 13h4.6Z" fill="currentColor" fill-opacity="0.16"/><path d="M5 8 2.7 13h4.6Z"/><path d="M19 8 16.7 13h4.6Z"/>`,
    bank: `<path d="M3.5 9 12 4l8.5 5Z" fill="currentColor" fill-opacity="0.16"/><path d="M3.5 9 12 4l8.5 5"/>
        <path d="M5 9v8M9 9v8M15 9v8M19 9v8"/><path d="M3 20h18M3.2 17h17.6"/>`,
    bolt: `<path d="M13 2 5 13h6l-1 9 8-12h-6Z" fill="currentColor" fill-opacity="0.18"/><path d="M13 2 5 13h6l-1 9 8-12h-6Z"/>`,
    flask: `<path d="M9.5 3v6L5 17.5A2 2 0 0 0 6.8 20.5h10.4A2 2 0 0 0 19 17.5L14.5 9V3"/>
        <path d="M8 3h8"/><path d="M7 14.5h10" stroke-opacity="0.5"/>
        <path d="M6.4 17.2 9.5 11h5l3.1 6.2A1.4 1.4 0 0 1 16.4 19.4H7.6A1.4 1.4 0 0 1 6.4 17.2Z" fill="currentColor" fill-opacity="0.16" stroke="none"/>`,

    // ---- Progression ----
    tree: `<path d="M12 21v-6"/><path d="M12 15a5 5 0 1 0-4-8 4 4 0 0 0-3 6.5A4 4 0 0 0 8 18h8a3.5 3.5 0 0 0 1-6.8" fill="currentColor" fill-opacity="0.14"/>
        <path d="M12 15a5 5 0 1 0-4-8 4 4 0 0 0-3 6.5A4 4 0 0 0 8 18h8a3.5 3.5 0 0 0 .6-6.95"/>`,
    map: `<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" fill="currentColor" fill-opacity="0.12"/>
        <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"/><path d="M9 4v14M15 6v14"/>`,
    flower: `<circle cx="12" cy="8" r="2.4"/><path d="M12 8c0-2.6 1.4-4 3-4M12 8c0-2.6-1.4-4-3-4M12 8c2 0 3.4 1 4 2.4M12 8c-2 0-3.4 1-4 2.4" fill="currentColor" fill-opacity="0.14"/>
        <path d="M12 10.4V21M9.5 16c-1.6-.4-3-1.6-3.4-3.4M14.5 16c1.6-.4 3-1.6 3.4-3.4"/>`,
    book: `<path d="M12 6C10 4.5 7 4 4.5 4.5v13C7 17 10 17.4 12 19c2-1.6 5-2 7.5-1.5v-13C17 4 14 4.5 12 6Z" fill="currentColor" fill-opacity="0.12"/>
        <path d="M12 6C10 4.5 7 4 4.5 4.5v13C7 17 10 17.4 12 19c2-1.6 5-2 7.5-1.5v-13C17 4 14 4.5 12 6Z"/><path d="M12 6v13"/>`,
    profile: `<circle cx="12" cy="8" r="3.6"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" fill="currentColor" fill-opacity="0.12"/>
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>`,

    // ---- Combat & social ----
    dragon: `<path d="M4 14c0-4 3-7 7-7 1.5 0 2.5.4 3.5 1L18 5l-.5 4 3 1.5-3 1 .5 4-4-2c-1 .6-2 1-3.5 1-4 0-7-3-7-7Z" fill="currentColor" fill-opacity="0.14"/>
        <path d="M4 14c0-4 3-7 7-7 1.5 0 2.5.4 3.5 1L18 5l-.5 4 3 1.5-3 1 .5 4-4-2c-1 .6-2 1-3.5 1-4 0-7-3-7-7Z"/>
        <circle cx="8.5" cy="12.5" r="1" fill="currentColor" stroke="none"/><path d="M11 18l-1 3M14 17.5l1 3"/>`,
    swords: `<path d="M5 4 13 12M3.5 5.5 5 4 6.5 5.5 14.5 13.5"/><path d="M19 4 11 12M20.5 5.5 19 4 17.5 5.5 9.5 13.5"/>
        <path d="M6 16l3 3M18 16l-3 3M4.5 17.5 6.5 19.5M19.5 17.5 17.5 19.5"/>`,
    trophy: `<path d="M7 4h10v4a5 5 0 0 1-10 0Z" fill="currentColor" fill-opacity="0.16"/><path d="M7 4h10v4a5 5 0 0 1-10 0Z"/>
        <path d="M7 5H4v1.5A3.5 3.5 0 0 0 7 10M17 5h3v1.5A3.5 3.5 0 0 1 17 10"/><path d="M12 13v3M9 20h6M10 20l.6-4M14 20l-.6-4"/>`,
    friends: `<circle cx="8.5" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/>
        <path d="M3.5 19a5 5 0 0 1 10 0M14 19a4 4 0 0 1 6.5-3.1" fill="currentColor" fill-opacity="0.1"/>
        <path d="M3.5 19a5 5 0 0 1 10 0M14.5 16.2A4 4 0 0 1 20.5 19"/>`,

    // ---- System ----
    gear: `<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/>`,
    sliders: `<path d="M5 5v6M5 15v4M12 5v2M12 11v8M19 5v8M19 17v2"/><circle cx="5" cy="13" r="2"/><circle cx="12" cy="9" r="2"/><circle cx="19" cy="15" r="2"/>`,

    // ---- Section headers ----
    gift: `<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18v3H3Z" fill="currentColor" fill-opacity="0.16"/><path d="M3 9h18v3H3Z"/>
        <path d="M12 9v11"/><path d="M12 9C12 6 10 4 8 5s.5 4 4 4c3.5 0 4.5-3 3-4s-3 1-3 4Z"/>`,
    coins: `<ellipse cx="9" cy="7" rx="5.5" ry="2.5"/><path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7"/>
        <ellipse cx="15" cy="14" rx="5.5" ry="2.5" fill="currentColor" fill-opacity="0.14"/><ellipse cx="15" cy="14" rx="5.5" ry="2.5"/>
        <path d="M9.5 14v3c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-3"/>`,
    chart: `<path d="M3.5 20h17"/><path d="M5 16l4-5 3.5 3 5.5-7" stroke-linecap="round"/><path d="M19 5h-3M19 5v3"/>`,
    shield: `<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z" fill="currentColor" fill-opacity="0.12"/>
        <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/><path d="M9.5 12l1.8 1.8 3.5-3.8" stroke-linecap="round"/>`,

    // ---- Resources / chrome ----
    coin: `<circle cx="12" cy="12" r="8" fill="currentColor" fill-opacity="0.14"/><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><path d="M12 9v6M10.5 10.5h3M10.5 13.5h3" stroke-opacity="0.7"/>`,
    plus: `<path d="M12 5v14M5 12h14" stroke-linecap="round"/>`,

    // ---- Nav bar ----
    home: `<path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" fill="currentColor" fill-opacity="0.12"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>`,
    hammer: `<path d="M14 6l4 4-2 2-4-4Z" fill="currentColor" fill-opacity="0.16"/><path d="M14 6l4 4-2 2-4-4Z"/><path d="M12.5 7.5 6 14l-2 2 2 2 2-2 6.5-6.5"/><path d="M15 4.5 19.5 9"/>`,
    crown: `<path d="M4 8l3 7h10l3-7-4.5 3.2L12 5 8.5 11.2Z" fill="currentColor" fill-opacity="0.16"/><path d="M4 8l3 7h10l3-7-4.5 3.2L12 5 8.5 11.2Z"/><path d="M6.5 18h11"/>`,
    research: `<circle cx="10.5" cy="10.5" r="5.5"/><path d="M14.5 14.5 20 20" stroke-linecap="round"/><path d="M8.5 10.5h4M10.5 8.5v4" stroke-opacity="0.7"/>`,
    dagger: `<path d="M12 3l2 9-2 2-2-2Z" fill="currentColor" fill-opacity="0.18"/><path d="M12 3l2 9-2 2-2-2Z"/><path d="M12 14v4M9 17h6"/><path d="M12 18l-1.5 3h3Z" fill="currentColor" stroke="none"/>`,
    globe: `<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" stroke-opacity="0.8"/>`,
    scroll: `<path d="M6 4h11a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H8v9a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="currentColor" fill-opacity="0.1"/>
        <path d="M7 4h10a2 2 0 0 1 2 2 2 2 0 0 1-2 2H9"/><path d="M5 6v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2"/><path d="M9 11h7M9 14h7" stroke-opacity="0.6"/>`,
    cloud: `<path d="M7 18a4 4 0 0 1-.6-7.95 5 5 0 0 1 9.66-1.2A3.5 3.5 0 0 1 17 18Z" fill="currentColor" fill-opacity="0.14"/>
        <path d="M7 18a4 4 0 0 1-.6-7.95 5 5 0 0 1 9.66-1.2A3.5 3.5 0 0 1 17 18Z"/><path d="M9 14.5l1.8 1.8 3.2-3.3" stroke-linecap="round" stroke-opacity="0.85"/>`,

    // ---- inline label icons (replacing emoji in titles/labels/buttons) ----
    lock: `<rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" fill-opacity="0.14"/><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>`,
    star: `<path d="M12 3.5l2.6 5.3 5.9.86-4.25 4.14 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.66l5.9-.86Z" fill="currentColor" fill-opacity="0.85"/>`,
    starOutline: `<path d="M12 3.5l2.6 5.3 5.9.86-4.25 4.14 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.66l5.9-.86Z" fill="none"/>`,
    check: `<path d="M5 12.5l4.2 4.2L19 7" stroke-linecap="round" stroke-width="2.2"/>`,
    medal: `<circle cx="12" cy="14" r="5.5" fill="currentColor" fill-opacity="0.16"/><circle cx="12" cy="14" r="5.5"/><path d="M9 9 6.5 3.5M15 9l2.5-5.5M10.5 3h3"/><path d="M12 11.6l.8 1.7 1.8.27-1.3 1.25.3 1.78L12 15.75l-1.6.85.3-1.78-1.3-1.25 1.8-.27Z" fill="currentColor" stroke="none"/>`,
    skull: `<path d="M5 11a7 7 0 0 1 14 0c0 2.2-1 3.6-2 4.4V18a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 18v-2.6C6 14.6 5 13.2 5 11Z" fill="currentColor" fill-opacity="0.14"/>
        <path d="M5 11a7 7 0 0 1 14 0c0 2.2-1 3.6-2 4.4V18a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 18v-2.6C6 14.6 5 13.2 5 11Z"/><circle cx="9.3" cy="11" r="1.5" fill="currentColor" stroke="none"/><circle cx="14.7" cy="11" r="1.5" fill="currentColor" stroke="none"/><path d="M11 19v-2M13 19v-2"/>`,
    castle: `<path d="M4 20V9l2 1V7l2 1V6l2 1.4L12 5l2 3.4L16 7v2l2-1v2l2-1v11Z" fill="currentColor" fill-opacity="0.14"/>
        <path d="M4 20V9l2 1V7l2 1V6l2 1.4L12 5l2 3.4L16 7v2l2-1v2l2-1v11Z"/><path d="M10 20v-4h4v4"/>`,
    fire: `<path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c1 1 2 2.5 2 4a4 4 0 0 1-8 0c0-3 3-4 4-8 0 1.5 1 2 2 3" fill="currentColor" fill-opacity="0.16"/>
        <path d="M13 3c.5 3-3 4-3 7.5a2 2 0 0 0 3.8.9c1 .8 1.7 2 1.7 3.4a4.5 4.5 0 0 1-9 0c0-3.4 3.2-4.7 4-9 .4 1.4 1.3 2 2.5 2.2"/>`,
    wheat: `<path d="M12 21V8"/><path d="M12 8c0-2 1.5-3.5 3.5-3.5C15.5 6.5 14 8 12 8Zm0 0c0-2-1.5-3.5-3.5-3.5C8.5 6.5 10 8 12 8Z" fill="currentColor" fill-opacity="0.18"/>
        <path d="M12 11c0-1.6 1.3-3 3-3 0 1.7-1.3 3-3 3Zm0 0c0-1.6-1.3-3-3-3 0 1.7 1.3 3 3 3Zm0 4c0-1.6 1.3-3 3-3 0 1.7-1.3 3-3 3Zm0 0c0-1.6-1.3-3-3-3 0 1.7 1.3 3 3 3Z"/>`,
    pickaxe: `<path d="M3 21 13 11"/><path d="M5 8c4-3 9-3 13 1-3-1-5-1-7 1-2 2-2 4-1 7-4-4-4-9-1-13" fill="currentColor" fill-opacity="0.14"/>
        <path d="M5 8c4-3 9-3 13 1M5 8c-1 4 0 8 3 11M5 8c4-2 8-1 11 2"/>`,
    flag: `<path d="M6 21V4"/><path d="M6 5h11l-2.2 3.5L17 12H6Z" fill="currentColor" fill-opacity="0.18"/><path d="M6 5h11l-2.2 3.5L17 12H6Z"/>`,
    music: `<path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" fill="currentColor" fill-opacity="0.18"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5" fill="currentColor" fill-opacity="0.18"/><circle cx="16.5" cy="16" r="2.5"/>`,
    sound: `<path d="M4 9v6h3l5 4V5L7 9Z" fill="currentColor" fill-opacity="0.18"/><path d="M4 9v6h3l5 4V5L7 9Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10" stroke-linecap="round"/>`,
    help: `<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.6-2 2-2 3.2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>`,
    rage: `<path d="M13 2 5 13h6l-1 9 8-12h-6Z" fill="currentColor" fill-opacity="0.2"/><path d="M13 2 5 13h6l-1 9 8-12h-6Z"/>`,
    heal: `<path d="M12 20s-7-4.3-7-9.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.8C19 15.7 12 20 12 20Z" fill="currentColor" fill-opacity="0.16"/>
        <path d="M12 20s-7-4.3-7-9.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.8C19 15.7 12 20 12 20Z"/><path d="M12 10v5M9.5 12.5h5" stroke-linecap="round"/>`,
    download: `<path d="M12 3v11M8 10.5l4 4 4-4" stroke-linecap="round"/><path d="M5 20h14"/>`,
    upload: `<path d="M12 15V4M8 7.5l4-4 4 4" stroke-linecap="round"/><path d="M5 20h14"/>`,
    trash: `<path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" /><path d="M10 11v5M14 11v5" stroke-opacity="0.7"/>`,
    spin: `<path d="M20 12a8 8 0 1 1-2.3-5.6" stroke-linecap="round"/><path d="M17 3v4h-4" stroke-linecap="round"/>`,
    handshake: `<path d="M12 7 9 4.5 3.5 9l3 3 2-2 3.5 3.5L14 16l1.5 1.5a1.4 1.4 0 0 0 2-2L20.5 12 15 6l-3 1Z" fill="currentColor" fill-opacity="0.12"/>
        <path d="M3.5 9 9 4.5 12 7M20.5 12 15 6l-3 1-2.5 2.2a1.3 1.3 0 0 0 1.8 1.9L12 11l4 4M6.5 12l2.5 2.5M9 14.5 11 16.5M11.5 17l1.5 1.5"/>`,
    leaf: `<path d="M5 19C4 12 9 5 19 5c0 10-7 15-14 14Z" fill="currentColor" fill-opacity="0.16"/><path d="M5 19C4 12 9 5 19 5c0 10-7 15-14 14ZM7 17 17 7" /><path d="M7 17 17 7"/>`,
    close: `<path d="M6 6l12 12M18 6 6 18" stroke-linecap="round" stroke-width="2"/>`,
    warn: `<path d="M12 3 22 20H2Z" fill="currentColor" fill-opacity="0.16"/><path d="M12 3 22 20H2Z"/><path d="M12 9v5" stroke-linecap="round" stroke-width="2"/><circle cx="12" cy="17.3" r="1.1" fill="currentColor" stroke="none"/>`,
    prev: `<path d="M17 5 8 12l9 7zM7 5v14" stroke-linejoin="round" fill="currentColor" fill-opacity="0.5"/>`,
    next: `<path d="M7 5l9 7-9 7zM17 5v14" stroke-linejoin="round" fill="currentColor" fill-opacity="0.5"/>`,
    // bold signpost-style arrow, points DOWN by default (rotated per direction)
    tutArrow: `<path d="M12 22 3 11h5.2V3h7.6v8H21z" fill="currentColor" stroke="#7a5410" stroke-width="0.8" stroke-linejoin="round"/>`
};

// Hydrate any element with data-ic="name" (and clear stray emoji text nodes).
function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-ic]').forEach(el => {
        const name = el.getAttribute('data-ic');
        const svg = svgIcon(name);
        if (svg) el.innerHTML = svg;
    });
}
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => hydrateIcons());
    else hydrateIcons();
}

function svgIcon(name, cls) {
    const p = ICON_PATHS[name];
    if (!p) return '';
    return `<svg class="vw-ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}
