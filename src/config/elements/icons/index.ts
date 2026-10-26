import { ElementType, StatusEffectType } from '../../../types/elements.types.js';

export const PHYSICAL_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="PHYSICAL"><defs><linearGradient id="physGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient><linearGradient id="physGold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#facc15"/><stop offset="100%" stop-color="#ca8a04"/></linearGradient></defs><path d="M12 2L4 5v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V5l-8-3z" fill="#1e293b" stroke="#475569" stroke-width="1.2"/><path d="M12 3.5L5.5 6v5c0 4.5 2.8 8.8 6.5 10 3.7-1.2 6.5-5.5 6.5-10V6L12 3.5z" fill="#0f172a" opacity="0.8"/><path d="M6.5 5.5l12 12-1.4 1.4-12-12z" fill="url(#physGrad)"/><path d="M18.5 17.5l2 2-1 1-2-2z" fill="url(#physGold)"/><path d="M16 19l3-3" stroke="url(#physGold)" stroke-width="1.5" stroke-linecap="round"/><path d="M17.5 5.5l-12 12 1.4 1.4 12-12z" fill="url(#physGrad)"/><path d="M5.5 17.5l-2 2 1 1 2-2z" fill="url(#physGold)"/><path d="M8 19l-3-3" stroke="url(#physGold)" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="11.5" r="2.2" fill="url(#physGold)" stroke="#ffffff" stroke-width="0.8"/></svg>`;

export const FIRE_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="FIRE"><defs><linearGradient id="fireOuter" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#b91c1c"/><stop offset="60%" stop-color="#ef4444"/><stop offset="100%" stop-color="#f97316"/></linearGradient><linearGradient id="fireCore" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#f97316"/><stop offset="60%" stop-color="#eab308"/><stop offset="100%" stop-color="#fef08a"/></linearGradient></defs><path d="M12 2c0 3.2-2.5 4.5-2.5 7.5 0 1.2.5 2.2 1.3 3-1.8-.4-3.8-2.2-3.8-4.5C5 10.5 4 13 4 15.5 4 19.6 7.6 23 12 23s8-3.4 8-7.5c0-4.5-3.5-7.8-5-10.5-.3 1.8-1.5 3-3 3 .2-2 .8-4.2-2-6z" fill="url(#fireOuter)"/><path d="M12 10c0 1.8-1.2 2.6-1.2 4.2 0 .8.4 1.4 1 1.8-.9-.2-2-1.1-2-2.3C9 14.5 8 16 8 17.5 8 19.8 10 21.5 12 21.5s4-1.7 4-4c0-2.5-1.8-4.3-2.6-5.8-.2 1-.8 1.6-1.4 1.6.2-1.2.4-2.2-1-3.3z" fill="url(#fireCore)"/><circle cx="16.5" cy="5.5" r="0.8" fill="#fef08a"/><circle cx="7.5" cy="7" r="0.6" fill="#fef08a"/></svg>`;

export const WATER_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="WATER"><defs><linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#60a5fa"/><stop offset="50%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient><linearGradient id="waterHighlight" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/><stop offset="100%" stop-color="#93c5fd" stop-opacity="0.1"/></linearGradient></defs><path d="M12 2.5C12 2.5 5 11 5 16a7 7 0 0 0 14 0c0-5-7-13.5-7-13.5z" fill="url(#waterGrad)"/><path d="M6.2 16.5c1.8-1.5 4-2.2 6-1.5 2.2.8 4.2.2 5.5-1-.5 4-3.5 7-7.7 7-1.5 0-2.8-.4-3.8-1.2v-3.3z" fill="#1e40af" opacity="0.6"/><path d="M12 5.5c-1 2.2-4.5 7.8-4.5 10.5 0 1 .3 2 .8 2.8-.5-.8-.8-1.8-.8-2.8 0-2.5 3.5-7.8 4.5-10.5z" fill="url(#waterHighlight)"/><circle cx="9.5" cy="9.5" r="1.2" fill="#ffffff" opacity="0.7"/></svg>`;

export const EARTH_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="EARTH"><defs><linearGradient id="earthTop" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient><linearGradient id="earthBottom" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#78350f"/></linearGradient></defs><polygon points="12,2 20.5,9 18,20 6,20 3.5,9" fill="url(#earthBottom)" stroke="#f59e0b" stroke-width="0.8"/><polygon points="12,2 20.5,9 12,12 3.5,9" fill="url(#earthTop)"/><polygon points="12,12 18,20 6,20" fill="#92400e" opacity="0.9"/><polyline points="12,2 12,12 14,20" fill="none" stroke="#fef3c7" stroke-width="1.2" stroke-linejoin="round"/><polyline points="3.5,9 12,12 20.5,9" fill="none" stroke="#fef3c7" stroke-width="1.2" stroke-linejoin="round"/><polyline points="6,20 12,12" fill="none" stroke="#d97706" stroke-width="1"/><polygon points="2,17 4,15 3.5,19" fill="#d97706"/><polygon points="22,16 20,14.5 21,18.5" fill="#f59e0b"/></svg>`;

export const WIND_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="WIND"><defs><linearGradient id="windGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a7f3d0"/><stop offset="50%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient><linearGradient id="windGrad2" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#6ee7b7"/></linearGradient></defs><path d="M3 7.5C3 5 5.5 3 9 3c4.5 0 8 3 8 7 0 2-1 3.5-3 4-1.5.3-2.5-.5-2.5-1.5 0-1.2 1-2 2-2 1.5 0 2-.8 2-1.5 0-2-2.5-4-5.5-4-2.5 0-4.5 1.5-4.5 3 0 1.2.8 2 2 2h1.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5H8C5 12 3 10 3 7.5z" fill="url(#windGrad1)"/><path d="M2 13.5c0-1.2 1-2 2.2-2H13c2.5 0 4.5 1.5 4.5 3.5 0 1.8-1.5 3-3.5 3-1.5 0-2.5-.8-2.5-1.8 0-1 .8-1.7 1.8-1.7.8 0 1.5-.5 1.5-1s-.7-1-1.5-1H5.5c-1.5 0-2.5.8-2.5 1.8 0 .8.7 1.2 1.5 1.2h2c.8 0 1.5.7 1.5 1.5S7.3 19 6.5 19H5c-2 0-3-1.5-3-3.5z" fill="url(#windGrad2)" opacity="0.95"/><path d="M6 19.5c0-.8.7-1.5 1.5-1.5H16c2 0 3.5 1 3.5 2s-1.5 2-3.5 2H8.5c-1.5 0-2.5-.7-2.5-1.5z" fill="url(#windGrad1)" opacity="0.8"/></svg>`;

export const LIGHTNING_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="LIGHTNING"><defs><linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="25%" stop-color="#fef08a"/><stop offset="70%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><polygon points="13.5,1.5 4,13 11,13 8.5,22.5 20,10 13,10" fill="url(#boltGrad)"/><polygon points="13,3 5.5,12 11,12 9,19.5 17.5,10.5 12.5,10.5" fill="#ffffff" opacity="0.85"/><path d="M18.5 4.5l2 2-1.5 1.5" fill="none" stroke="#fef08a" stroke-width="1.2" stroke-linecap="round"/><path d="M3.5 8l2 1.5-1.5 2" fill="none" stroke="#fef08a" stroke-width="1.2" stroke-linecap="round"/></svg>`;

export const ICE_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="ICE"><defs><linearGradient id="iceGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#67e8f9"/><stop offset="100%" stop-color="#0891b2"/></linearGradient></defs><g stroke="url(#iceGrad)" stroke-width="1.8" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="3.3" y1="7" x2="20.7" y2="17"/><line x1="3.3" y1="17" x2="20.7" y2="7"/></g><g stroke="#ffffff" stroke-width="1.3" stroke-linecap="round"><path d="M9.5 4.5l2.5 2 2.5-2" fill="none"/><path d="M9.5 19.5l2.5-2 2.5 2" fill="none"/><path d="M4.5 10l3 0 1.5-2.5" fill="none"/><path d="M19.5 14l-3 0-1.5 2.5" fill="none"/><path d="M4.5 14l3 0 1.5 2.5" fill="none"/><path d="M19.5 10l-3 0-1.5-2.5" fill="none"/></g><polygon points="12,8.5 15,12 12,15.5 9,12" fill="#e0f2fe" stroke="#0284c7" stroke-width="0.8"/><circle cx="12" cy="12" r="1.2" fill="#ffffff"/></svg>`;

export const GRASS_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="GRASS"><defs><linearGradient id="grassGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#15803d"/><stop offset="50%" stop-color="#22c55e"/><stop offset="100%" stop-color="#86efac"/></linearGradient><linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ade80"/><stop offset="100%" stop-color="#16a34a"/></linearGradient></defs><path d="M12 2C7 5 4 10 4 15.5 4 19 6.5 22 10.5 22c5 0 9.5-4 9.5-12 0-3-2-6-8-8z" fill="url(#grassGrad)"/><path d="M11 11c-3.5 0-6.5 2.5-6.5 5.5 0 2.5 1.8 4.5 4.5 4.5 4 0 7-3.5 7-8 0-1-.3-1.6-.7-2z" fill="url(#leafGrad)" opacity="0.85"/><path d="M6 21c3-4 6-8 9-14" fill="none" stroke="#dcfce7" stroke-width="1.3" stroke-linecap="round"/><path d="M10 14c2.5-1 4.5-1.5 6-1" fill="none" stroke="#dcfce7" stroke-width="1" stroke-linecap="round"/><path d="M8 17.5c2-.5 3.5-.8 5-.5" fill="none" stroke="#dcfce7" stroke-width="1" stroke-linecap="round"/><circle cx="14" cy="7" r="1" fill="#ffffff"/></svg>`;

export const POISON_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="POISON"><defs><linearGradient id="poisonGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#d9f99d"/><stop offset="50%" stop-color="#a3e635"/><stop offset="100%" stop-color="#4d7c0f"/></linearGradient></defs><path d="M10 2h4v2.5l2 3v1.5c0 0 4 3 4 8 0 4-3.5 6-8 6s-8-2-8-6c0-5 4-8 4-8V7.5l2-3V2z" fill="#1e293b" stroke="#65a30d" stroke-width="1.2"/><path d="M5 15c0 3.5 3 5 7 5s7-1.5 7-5c0-3-2.5-5.5-3.5-6.5-2 1-4 .5-6 1.5-1.2-.6-3 2-4.5 5z" fill="url(#poisonGrad)"/><ellipse cx="12" cy="14" rx="4.5" ry="3.8" fill="#1e293b"/><circle cx="10.2" cy="13.2" r="1.1" fill="url(#poisonGrad)"/><circle cx="13.8" cy="13.2" r="1.1" fill="url(#poisonGrad)"/><path d="M12 14.8l-.6 1.2h1.2z" fill="#a3e635"/><path d="M10.5 17.2h3" stroke="#a3e635" stroke-width="0.8" stroke-linecap="round"/><circle cx="15.5" cy="10" r="0.9" fill="#facc15"/></svg>`;

export const STEEL_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="STEEL"><defs><linearGradient id="steelMetallic" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f1f5f9"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient><linearGradient id="cogCenter" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#64748b"/></linearGradient></defs><path d="M12 4.2l1.2-2.2h1.6l.8 2.4 2.2.8 2.2-1.2 1.2 1.2-1.2 2.2.8 2.2 2.4.8v1.6l-2.4.8-.8 2.2 1.2 2.2-1.2 1.2-2.2-1.2-2.2.8-.8 2.4h-1.6l-.8-2.4-2.2-.8-2.2 1.2-1.2-1.2 1.2-2.2-.8-2.2-2.4-.8v-1.6l2.4-.8.8-2.2-1.2-2.2 1.2-1.2 2.2 1.2 2.2-.8L10.8 2h1.6z" fill="url(#steelMetallic)" stroke="#1e293b" stroke-width="0.8"/><circle cx="12" cy="12" r="5" fill="url(#cogCenter)" stroke="#cbd5e1" stroke-width="1.2"/><polygon points="12,8.5 13.2,10.8 15.5,12 13.2,13.2 12,15.5 10.8,13.2 8.5,12 10.8,10.8" fill="#f8fafc"/></svg>`;

export const LIGHT_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="LIGHT"><defs><linearGradient id="holyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#fef08a"/><stop offset="80%" stop-color="#facc15"/><stop offset="100%" stop-color="#eab308"/></linearGradient></defs><polygon points="12,1 14,8.5 21.5,12 14,15.5 12,23 10,15.5 2.5,12 10,8.5" fill="url(#holyGrad)" stroke="#fef08a" stroke-width="0.8"/><polygon points="12,5.5 14.5,9.5 18.5,12 14.5,14.5 12,18.5 9.5,14.5 5.5,12 9.5,9.5" fill="#fef9c3" opacity="0.9"/><circle cx="12" cy="12" r="3" fill="#ffffff"/><circle cx="12" cy="12" r="1.5" fill="#facc15"/><circle cx="5" cy="5" r="0.9" fill="#ffffff"/><circle cx="19" cy="5" r="0.9" fill="#ffffff"/><circle cx="5" cy="19" r="0.9" fill="#ffffff"/><circle cx="19" cy="19" r="0.9" fill="#ffffff"/></svg>`;

export const DARK_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="DARK"><defs><linearGradient id="darkAura" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c084fc"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#3b0764"/></linearGradient><radialGradient id="voidCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#0f172a"/><stop offset="80%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#581c87"/></radialGradient></defs><circle cx="12" cy="12" r="9.5" fill="none" stroke="url(#darkAura)" stroke-width="1.8" stroke-dasharray="8 3"/><path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5c0-.6-.06-1.2-.18-1.8A7.8 7.8 0 1 1 10.2 2.68c.6-.12 1.2-.18 1.8-.18z" fill="url(#darkAura)"/><ellipse cx="12" cy="12" rx="4.5" ry="3.5" fill="url(#voidCore)" stroke="#c084fc" stroke-width="0.8"/><polygon points="12,9.2 13.2,12 12,14.8 10.8,12" fill="#e879f9"/></svg>`;

export const GHOST_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="GHOST"><defs><linearGradient id="ghostGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#f5d0fe"/><stop offset="40%" stop-color="#c084fc"/><stop offset="100%" stop-color="#7e22ce"/></linearGradient></defs><path d="M12 2C7.5 2 4 5.5 4 10.5c0 3.5 1.5 6.5 2.5 9.5.4 1.2 1.8 1.5 2.5.5.8-1.2 1.8-1.5 2.8-.2.7.9 2.3.9 3 0 1-1.3 2-1 2.8.2.7 1 2.1.7 2.5-.5 1-3 2.5-6 2.5-9.5C20 5.5 16.5 2 12 2z" fill="url(#ghostGrad)" opacity="0.9"/><ellipse cx="9" cy="9.5" rx="1.5" ry="2.2" fill="#1e1b4b"/><circle cx="9.4" cy="9" r="0.6" fill="#fdf4ff"/><ellipse cx="15" cy="9.5" rx="1.5" ry="2.2" fill="#1e1b4b"/><circle cx="15.4" cy="9" r="0.6" fill="#fdf4ff"/><ellipse cx="12" cy="14" rx="1.2" ry="1.8" fill="#1e1b4b"/><circle cx="2" cy="6" r="1" fill="#c084fc" opacity="0.7"/><circle cx="21" cy="8" r="0.8" fill="#e879f9" opacity="0.7"/></svg>`;

export const DRAGON_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="DRAGON"><defs><linearGradient id="dragonHorn" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a" /><stop offset="30%" stop-color="#fb923c" /><stop offset="70%" stop-color="#ea580c" /><stop offset="100%" stop-color="#7c2d12" /></linearGradient><linearGradient id="dragonScale" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fed7aa" /><stop offset="25%" stop-color="#fb923c" /><stop offset="65%" stop-color="#ea580c" /><stop offset="100%" stop-color="#9a3412" /></linearGradient><linearGradient id="dragonEye" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff" /><stop offset="45%" stop-color="#fde047" /><stop offset="100%" stop-color="#f59e0b" /></linearGradient><radialGradient id="dragonMouthFire" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef08a" /><stop offset="60%" stop-color="#f97316" /><stop offset="100%" stop-color="#991b1b" /></radialGradient></defs><path d="M9 6.2 C6.8 3.5 3.8 1.5 1 0.8 C1.8 3.5 4.5 6 7.5 7.5 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.5" stroke-linejoin="round" /><path d="M1 0.8 C3 2.5 5.8 4.8 7.8 6.2" fill="none" stroke="#fef08a" stroke-width="0.6" stroke-linecap="round" /><polygon points="4.2,2.6 1.8,3 3.2,4.5" fill="#fef08a" stroke="#451a03" stroke-width="0.3" /><polygon points="6.8,4.5 4.8,5.4 6,6.4" fill="#fef08a" stroke="#451a03" stroke-width="0.3" /><path d="M15 6.2 C17.2 3.5 20.2 1.5 23 0.8 C22.2 3.5 19.5 6 16.5 7.5 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.5" stroke-linejoin="round" /><path d="M23 0.8 C21 2.5 18.2 4.8 16.2 6.2" fill="none" stroke="#fef08a" stroke-width="0.6" stroke-linecap="round" /><polygon points="19.8,2.6 22.2,3 20.8,4.5" fill="#fef08a" stroke="#451a03" stroke-width="0.3" /><polygon points="17.2,4.5 19.2,5.4 18,6.4" fill="#fef08a" stroke="#451a03" stroke-width="0.3" /><path d="M7 7.5 C4.5 6.2 2.5 5 0.8 4.2 C1.8 6.8 4 8.5 6.2 9.2 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.4" stroke-linejoin="round" /><path d="M17 7.5 C19.5 6.2 21.5 5 23.2 4.2 C22.2 6.8 20 8.5 17.8 9.2 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.4" stroke-linejoin="round" /><path d="M6 9.8 C3.8 9.2 2 8.8 0.5 8 C1.2 10.2 3.2 11.5 5.5 11.8 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.4" stroke-linejoin="round" /><path d="M18 9.8 C20.2 9.2 22 8.8 23.5 8 C22.8 10.2 20.8 11.5 18.5 11.8 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.4" stroke-linejoin="round" /><path d="M6 12.5 C3.8 13.2 2 13.8 0.8 14.8 C2.5 15.5 4.8 15 6.5 14 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.4" stroke-linejoin="round" /><path d="M18 12.5 C20.2 13.2 22 13.8 23.2 14.8 C21.5 15.5 19.2 15 17.5 14 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.4" stroke-linejoin="round" /><path d="M6.8 15 C4.5 15.8 2.8 16.8 1.8 17.8 C3.5 18.2 5.5 17.5 7 16.2 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.4" stroke-linejoin="round" /><path d="M17.2 15 C19.5 15.8 21.2 16.8 22.2 17.8 C20.5 18.2 18.5 17.5 17 16.2 Z" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.4" stroke-linejoin="round" /><polygon points="12,0.5 13.8,4.5 12,5.5 10.2,4.5" fill="url(#dragonHorn)" stroke="#451a03" stroke-width="0.4" /><line x1="12" y1="0.5" x2="12" y2="5.5" stroke="#fef08a" stroke-width="0.6" /><polygon points="9.5,2 10.8,4.8 8.5,4.8" fill="#f97316" stroke="#451a03" stroke-width="0.3" /><polygon points="14.5,2 13.2,4.8 15.5,4.8" fill="#ea580c" stroke="#451a03" stroke-width="0.3" /><polygon points="12,5.2 7,7.2 6,10.5 7.5,13.5 12,14.5 16.5,13.5 18,10.5 17,7.2" fill="url(#dragonScale)" stroke="#451a03" stroke-width="0.6" stroke-linejoin="round" /><polygon points="12,5.5 9,7.5 12,9.2 15,7.5" fill="#fed7aa" stroke="#c2410c" stroke-width="0.3" /><polygon points="12,5.5 15,7.5 17,7.2 18,10.5 16.5,13.5 12,14.5 12,9.2" fill="#9a3412" opacity="0.5" /><polygon points="8,10.8 12,9.8 16,10.8 16.8,15.2 15.5,16.8 8.5,16.8 7.2,15.2" fill="#ea580c" stroke="#7c2d12" stroke-width="0.5" stroke-linejoin="round" /><polygon points="8,10.8 12,9.8 12,16.8 8.5,16.8" fill="#fb923c" /><line x1="12" y1="9.8" x2="12" y2="16.8" stroke="#fef08a" stroke-width="0.8" stroke-linecap="round" /><ellipse cx="9.5" cy="15.5" rx="0.8" ry="0.5" fill="#1a0500" /><ellipse cx="14.5" cy="15.5" rx="0.8" ry="0.5" fill="#1a0500" /><polygon points="7.5,16.5 16.5,16.5 15,19.2 12,20.8 9,19.2" fill="#1a0500" stroke="#2a0800" stroke-width="0.5" /><ellipse cx="12" cy="18" rx="2.5" ry="1" fill="url(#dragonMouthFire)" /><polygon points="7.8,16.2 8.6,19.8 9.6,16.4" fill="#ffffff" stroke="#2a0800" stroke-width="0.3" /><polygon points="16.2,16.2 15.4,19.8 14.4,16.4" fill="#ffffff" stroke="#2a0800" stroke-width="0.3" /><polygon points="11,16.5 11.5,17.8 12,16.5" fill="#fef08a" /><polygon points="12,16.5 12.5,17.8 13,16.5" fill="#fef08a" /><polygon points="12,8.8 6.5,9.5 7.8,10.8 12,10 16.2,10.8 17.5,9.5" fill="#2a0800" /><polygon points="7,9.6 11.2,10.2 10.2,11.8 6.5,11.2" fill="#1a0500" /><polygon points="17,9.6 12.8,10.2 13.8,11.8 17.5,11.2" fill="#1a0500" /><polygon points="7.5,9.9 10.8,10.4 8.2,11.4" fill="url(#dragonEye)" /><polygon points="16.5,9.9 13.2,10.4 15.8,11.4" fill="url(#dragonEye)" /><line x1="8.8" y1="9.9" x2="8.8" y2="11.4" stroke="#1a0500" stroke-width="0.6" /><line x1="15.2" y1="9.9" x2="15.2" y2="11.4" stroke="#1a0500" stroke-width="0.6" /><polygon points="8.5,19 12,21 15.5,19 14,22.2 10,22.2" fill="#7c2d12" stroke="#2a0800" stroke-width="0.5" /><polygon points="9.5,20.5 10,19 10.5,20.5" fill="#ffffff" /><polygon points="14.5,20.5 14,19 13.5,20.5" fill="#ffffff" /><polygon points="12,23.8 10.6,21.5 13.4,21.5" fill="url(#dragonHorn)" stroke="#2a0800" stroke-width="0.4" /><line x1="12" y1="21.5" x2="12" y2="23.8" stroke="#fef08a" stroke-width="0.6" /><polygon points="8.8,22 10.2,20.8 8.5,20.8" fill="url(#dragonHorn)" stroke="#2a0800" stroke-width="0.3" /><polygon points="15.2,22 13.8,20.8 15.5,20.8" fill="url(#dragonHorn)" stroke="#2a0800" stroke-width="0.3" /></svg>`;

export const FAIRY_SVG = `<svg class="elem-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" aria-label="FAIRY"><defs><linearGradient id="fairyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fdf2f8"/><stop offset="40%" stop-color="#f472b6"/><stop offset="100%" stop-color="#db2777"/></linearGradient></defs><path d="M11 11C8.5 4 4 3 3 5c-1.5 3 2 8 8 6z" fill="url(#fairyGrad)" opacity="0.9" stroke="#fbcfe8" stroke-width="0.6"/><path d="M13 11c2.5-7 7-8 8-6 1.5 3-2 8-8 6z" fill="url(#fairyGrad)" opacity="0.9" stroke="#fbcfe8" stroke-width="0.6"/><path d="M11 13C8 17 5 19 4 17.5c-1.2-1.8 1.5-4.5 7-4.5z" fill="url(#fairyGrad)" opacity="0.75"/><path d="M13 13c3 4 6 6 7 4.5 1.2-1.8-1.5-4.5-7-4.5z" fill="url(#fairyGrad)" opacity="0.75"/><line x1="12" y1="4" x2="12" y2="20" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="7" r="2.2" fill="#ffffff"/><polygon points="12,1.5 13,3.5 15,4.5 13,5.5 12,7.5 11,5.5 9,4.5 11,3.5" fill="#fef08a"/><circle cx="6" cy="8" r="0.8" fill="#fdf2f8"/><circle cx="18" cy="8" r="0.8" fill="#fdf2f8"/><circle cx="12" cy="21.5" r="0.7" fill="#f472b6"/></svg>`;

export const ELEMENT_SVG_MARKUP: Record<ElementType, string> = {
  PHYSICAL: PHYSICAL_SVG,
  FIRE: FIRE_SVG,
  WATER: WATER_SVG,
  EARTH: EARTH_SVG,
  WIND: WIND_SVG,
  LIGHTNING: LIGHTNING_SVG,
  ICE: ICE_SVG,
  GRASS: GRASS_SVG,
  POISON: POISON_SVG,
  STEEL: STEEL_SVG,
  LIGHT: LIGHT_SVG,
  DARK: DARK_SVG,
  GHOST: GHOST_SVG,
  DRAGON: DRAGON_SVG,
  FAIRY: FAIRY_SVG
};

export const STATUS_EFFECT_TO_ELEMENT: Record<StatusEffectType, ElementType> = {
  BURN: 'FIRE',
  WET: 'WATER',
  SLOW: 'EARTH',
  KNOCKBACK: 'WIND',
  SHOCK: 'LIGHTNING',
  FREEZE: 'ICE',
  ROOT: 'GRASS',
  POISON: 'POISON',
  SUNDER: 'STEEL',
  SOUL_DRAIN: 'GHOST',
  DRAGON_AWE: 'DRAGON',
  CHARM: 'FAIRY',
  CURSE: 'DARK'
};

/**
 * Returns data:image/svg+xml;utf8 URI string for HTML <img> or Canvas Image loading.
 */
export function getElementSvgDataUri(elem: ElementType): string {
  const svg = ELEMENT_SVG_MARKUP[elem] || PHYSICAL_SVG;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// In-memory HTMLImageElement cache for instantaneous Canvas 2D drawing
const canvasImageCache: Partial<Record<ElementType, HTMLImageElement>> = {};

if (typeof Image !== 'undefined') {
  for (const [elem, svg] of Object.entries(ELEMENT_SVG_MARKUP)) {
    try {
      const img = new Image();
      img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      canvasImageCache[elem as ElementType] = img;
    } catch {
      // Ignored in non-browser environments
    }
  }
}

/**
 * Draws crisp element SVG onto Canvas 2D context at (x, y) with specified width & height.
 * Fallbacks cleanly to stylish high-contrast circular crest if image not ready yet or in headless tests.
 */
export function drawElementSvgOnCanvas(
  ctx: CanvasRenderingContext2D,
  elem: ElementType,
  x: number,
  y: number,
  size: number = 14
): void {
  const img = canvasImageCache[elem];
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, size, size);
    return;
  }

  // Fallback vector glyph on canvas if image is still loading or running headless
  const colorMap: Record<ElementType, string> = {
    PHYSICAL: '#e2e8f0',
    FIRE: '#ef4444',
    WATER: '#3b82f6',
    EARTH: '#d97706',
    WIND: '#10b981',
    LIGHTNING: '#f59e0b',
    ICE: '#06b6d4',
    GRASS: '#22c55e',
    POISON: '#a3e635',
    STEEL: '#94a3b8',
    LIGHT: '#fef08a',
    DARK: '#8b5cf6',
    GHOST: '#c084fc',
    DRAGON: '#f97316',
    FAIRY: '#f472b6'
  };

  const bg = colorMap[elem] || '#94a3b8';
  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

