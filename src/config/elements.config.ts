import { ElementType, MagicalElementType } from '../types/elements.types.js';

export const SELECTABLE_ELEMENTS: MagicalElementType[] = [
  'FIRE',
  'WATER',
  'EARTH',
  'WIND',
  'LIGHTNING',
  'ICE',
  'LIGHT',
  'DARK'
];

export const ELEMENT_IMBUE_COST = 40;
export const MAGE_SECOND_ELEMENT_COST = 50;
export const HYBRID_ELEMENT_DMG_RATIO = 0.45; // 45% bonus elemental dmg
export const MAGE_SECONDARY_DMG_RATIO = 1.0;  // 100% secondary elemental dmg (damage gốc giảm ngang damage nguyên tố)

export const ELEMENT_NAMES: Record<ElementType, string> = {
  PHYSICAL: 'Vật Lý',
  FIRE: 'Lửa (Hỏa)',
  WATER: 'Nước (Thủy)',
  EARTH: 'Đất (Thổ)',
  WIND: 'Gió (Phong)',
  LIGHTNING: 'Sét (Lôi)',
  ICE: 'Băng (Hàn)',
  LIGHT: 'Ánh Sáng (Quang)',
  DARK: 'Hắc Ám (Ám)'
};

export const ELEMENT_EFFECT_DESCRIPTIONS: Record<MagicalElementType, { effectName: string; description: string }> = {
  FIRE: {
    effectName: 'Thiêu Đốt (Burn)',
    description: 'Đốt cháy mục tiêu, gây sát thương Lửa liên tục mỗi 0.5s trong 3s.'
  },
  WATER: {
    effectName: 'Ẩm Ướt & Trì Hoãn (Wet)',
    description: 'Làm ướt mục tiêu trong 4s (tăng mạnh sát thương Sét x1.75, Băng x1.5) và giảm 20% tốc độ di chuyển.'
  },
  EARTH: {
    effectName: 'Địa Chấn & Làm Chậm (Slow)',
    description: 'Tạo chấn động làm chậm 35% tốc độ di chuyển trong 2.5s và tăng 35% sát thương lên quái Đi bộ.'
  },
  WIND: {
    effectName: 'Cuồng Phong & Đẩy Lùi (Knockback)',
    description: 'Gây thêm x1.5 sát thương lên quái Bay và đẩy lùi nhẹ quái vật về sau trên lộ trình.'
  },
  LIGHTNING: {
    effectName: 'Tê Liệt & Giật Lan (Shock)',
    description: 'Gây choáng ngắn 0.4s và phóng tia điện giật lan sang 1 kẻ địch kế bên (35% DMG).'
  },
  ICE: {
    effectName: 'Hàn Băng & Đóng Băng (Freeze)',
    description: 'Làm chậm 45% tốc độ trong 3s và có 20% tỉ lệ đóng băng bất động trong 1.2s.'
  },
  LIGHT: {
    effectName: 'Thánh Quang & Hồi Phục (Holy)',
    description: 'Khắc chế x2 sát thương hệ Tối; đòn đánh của Lính tự hồi 5 HP cho bản thân.'
  },
  DARK: {
    effectName: 'Nguyền Rủa Suy Yếu (Curse)',
    description: 'Khắc dấu ấn Nguyền Rủa 3.5s khiến quái nhận thêm +35% sát thương từ mọi nguồn.'
  }
};

export const ELEMENT_COLORS: Record<ElementType, string> = {
  PHYSICAL: '#e2e8f0', // Silver / White
  FIRE: '#ef4444',     // Crimson Red
  WATER: '#3b82f6',    // Ocean Blue
  EARTH: '#d97706',    // Amber / Earth Brown
  WIND: '#10b981',     // Emerald Green
  LIGHTNING: '#f59e0b',// Bright Electric Yellow
  ICE: '#06b6d4',      // Cyan Frost
  LIGHT: '#fef08a',    // Radiant Golden Light
  DARK: '#8b5cf6'      // Void Purple
};

export const ELEMENT_ICONS: Record<ElementType, string> = {
  PHYSICAL: '⚔️',
  FIRE: '🔥',
  WATER: '💧',
  EARTH: '🪨',
  WIND: '🌪️',
  LIGHTNING: '⚡',
  ICE: '❄️',
  LIGHT: '✨',
  DARK: '🔮'
};

/**
 * Base element matchup multipliers:
 * attackerElement -> targetPrimaryElement -> multiplier
 */
export const ELEMENTAL_MATCHUPS: Partial<Record<ElementType, Partial<Record<ElementType, number>>>> = {
  FIRE: {
    ICE: 1.75,
    WIND: 1.3,
    FIRE: 0.3,
    WATER: 0.5
  },
  WATER: {
    FIRE: 2.0,
    EARTH: 1.5,
    WATER: 0.3,
    LIGHTNING: 0.5
  },
  EARTH: {
    LIGHTNING: 1.5,
    WIND: 1.25,
    EARTH: 0.5
  },
  WIND: {
    EARTH: 1.5,
    PHYSICAL: 1.2
  },
  LIGHTNING: {
    WATER: 2.0,
    WIND: 1.5,
    EARTH: 0.3,
    LIGHTNING: 0.3
  },
  ICE: {
    WATER: 1.5,
    FIRE: 0.5,
    ICE: 0.2
  },
  LIGHT: {
    DARK: 2.0,
    LIGHT: 0.3
  },
  DARK: {
    LIGHT: 1.8,
    DARK: 0.3
  },
  PHYSICAL: {
    EARTH: 0.7
  }
};

