import { ElementType, MagicalElementType, StatusEffectType } from '../types/elements.types.js';

export const SELECTABLE_ELEMENTS: MagicalElementType[] = [
  'FIRE',
  'WATER',
  'EARTH',
  'WIND',
  'LIGHTNING',
  'ICE',
  'LIGHT',
  'DARK',
  'GRASS',
  'POISON',
  'STEEL',
  'GHOST',
  'DRAGON',
  'FAIRY'
];

export const ELEMENT_IMBUE_COST = 40;
export const MAGE_SECOND_ELEMENT_COST = 50;
export const HYBRID_ELEMENT_DMG_RATIO = 0.45; // 45% bonus elemental dmg
export const MAGE_SECONDARY_DMG_RATIO = 1.0;  // 100% secondary elemental dmg

export const ELEMENT_NAMES: Record<ElementType, string> = {
  PHYSICAL: 'Vật Lý',
  FIRE: 'Lửa (Hỏa)',
  WATER: 'Nước (Thủy)',
  EARTH: 'Đất (Thổ)',
  WIND: 'Gió (Phong)',
  LIGHTNING: 'Sét (Lôi)',
  ICE: 'Băng (Hàn)',
  LIGHT: 'Ánh Sáng (Quang)',
  DARK: 'Hắc Ám (Ám)',
  GRASS: 'Cỏ (Mộc)',
  POISON: 'Độc (Độc Tố)',
  STEEL: 'Thép (Kim)',
  GHOST: 'Ma (U Hồn)',
  DRAGON: 'Rồng (Long)',
  FAIRY: 'Tiên (Tiên Linh)'
};

export const ELEMENT_EFFECT_DESCRIPTIONS: Record<MagicalElementType, { effectName: string; description: string }> = {
  FIRE: {
    effectName: 'Thiêu Đốt (Burn)',
    description: 'Đốt cháy mục tiêu, gây sát thương Lửa liên tục mỗi 0.5s trong 3s (bỏ qua giáp).'
  },
  WATER: {
    effectName: 'Ẩm Ướt & Trì Hoãn (Wet)',
    description: 'Làm ướt mục tiêu trong 4s (tăng mạnh sát thương Sét x1.75, Băng x1.5, Cỏ x1.6) và giảm 20% tốc độ di chuyển.'
  },
  EARTH: {
    effectName: 'Địa Chấn & Làm Chậm (Slow)',
    description: 'Tạo chấn động làm chậm 35% tốc độ di chuyển trong 2.5s và tăng 35% sát thương lên quái Đi bộ.'
  },
  WIND: {
    effectName: 'Cuồng Phong & Đẩy Lùi (Knockback)',
    description: 'Gây thêm x1.5 sát thương lên quái Bay và đẩy lùi quái vật về sau trên lộ trình (15px bộ / 25px bay).'
  },
  LIGHTNING: {
    effectName: 'Tê Liệt & Giật Lan (Shock)',
    description: 'Gây choáng ngắn 0.35s và phóng tia điện giật lan sang 1 kẻ địch kế bên (35% DMG).'
  },
  ICE: {
    effectName: 'Hàn Băng & Đóng Băng (Freeze)',
    description: 'Làm chậm 45% tốc độ trong 3s và có 25% tỉ lệ đóng băng bất động trong 1.2s.'
  },
  LIGHT: {
    effectName: 'Thánh Quang & Hồi Phục (Holy)',
    description: 'Khắc chế x2.0 sát thương hệ Tối và Ma; đòn đánh của Lính tự hồi 5 HP cho bản thân.'
  },
  DARK: {
    effectName: 'Nguyền Rủa Suy Yếu (Curse)',
    description: 'Khắc dấu ấn Nguyền Rủa 3.5s khiến quái nhận thêm +35% sát thương từ mọi nguồn.'
  },
  GRASS: {
    effectName: 'Trói Buộc & Hút Sinh Lực (Root)',
    description: 'Dây leo làm chậm 30% trong 3.0s, có 30% tỉ lệ trói chân bất động 1.0s và hút nhựa sống tự hồi 3 HP cho Lính.'
  },
  POISON: {
    effectName: 'Kịch Độc Ăn Mòn (Poison)',
    description: 'Đầu độc mục tiêu trong 4.0s (DoT cộng dồn tối đa 3 tầng) và làm giảm 20% tốc độ đánh của kẻ địch.'
  },
  STEEL: {
    effectName: 'Phá Giáp & Trọng Kích (Sunder)',
    description: 'Nghiền nát lớp giáp hộ thân trong 4.0s: Khiến quái nhận thêm +30% sát thương từ mọi nguồn và vô hiệu hóa kháng vật lý.'
  },
  GHOST: {
    effectName: 'Ám Hồn & Trảm Sát (Soul Drain)',
    description: 'Đòn đánh tâm linh xuyên kháng gây thêm sát thương chuẩn dựa theo % Máu Đã Mất của quái và làm quái hoảng sợ giật lùi nhẹ.'
  },
  DRAGON: {
    effectName: 'Long Uy Áp Chế (Dragon Awe)',
    description: 'Tỏa ra uy áp của loài rồng trong 3.5s: Giảm 25% sát thương đòn đánh của quái và gây thêm +35% sát thương lên Boss và quái Tinh Anh.'
  },
  FAIRY: {
    effectName: 'Mê Hoặc Tinh Linh (Charm)',
    description: 'Bụi tiên mê hoặc trong 3.0s: Giảm 35% tốc độ di chuyển, 30% tốc độ đánh và khiến mục tiêu nhận thêm +25% sát thương phép.'
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
  DARK: '#8b5cf6',     // Void Purple
  GRASS: '#22c55e',    // Leaf Green
  POISON: '#a3e635',   // Toxic Lime
  STEEL: '#94a3b8',    // Slate Steel
  GHOST: '#c084fc',    // Ethereal Lavender
  DRAGON: '#f97316',   // Dragon Orange Flame
  FAIRY: '#f472b6'     // Mystic Pink
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
  DARK: '🔮',
  GRASS: '🌿',
  POISON: '☠️',
  STEEL: '⚙️',
  GHOST: '👻',
  DRAGON: '🐉',
  FAIRY: '🧚'
};

/**
 * Base element matchup multipliers:
 * attackerElement -> targetPrimaryElement -> multiplier
 */
export const ELEMENTAL_MATCHUPS: Partial<Record<ElementType, Partial<Record<ElementType, number>>>> = {
  FIRE: {
    ICE: 1.75,
    GRASS: 2.0,
    STEEL: 1.75,
    WIND: 1.3,
    FIRE: 0.3,
    WATER: 0.5,
    DRAGON: 0.5
  },
  WATER: {
    FIRE: 2.0,
    EARTH: 1.5,
    STEEL: 1.3,
    WATER: 0.3,
    LIGHTNING: 0.5,
    GRASS: 0.5,
    DRAGON: 0.5
  },
  EARTH: {
    LIGHTNING: 1.5,
    FIRE: 1.5,
    POISON: 1.5,
    STEEL: 1.75,
    WIND: 1.25,
    EARTH: 0.5,
    GRASS: 0.5
  },
  WIND: {
    EARTH: 1.5,
    GRASS: 1.5,
    PHYSICAL: 1.2,
    STEEL: 0.5,
    ICE: 0.5
  },
  LIGHTNING: {
    WATER: 2.0,
    WIND: 1.5,
    STEEL: 1.3,
    EARTH: 0.3,
    LIGHTNING: 0.3,
    GRASS: 0.5,
    DRAGON: 0.5
  },
  ICE: {
    GRASS: 1.8,
    DRAGON: 2.0,
    WIND: 1.5,
    WATER: 1.3,
    FIRE: 0.5,
    STEEL: 0.5,
    ICE: 0.2
  },
  LIGHT: {
    DARK: 2.0,
    GHOST: 1.8,
    LIGHT: 0.3,
    STEEL: 0.5
  },
  DARK: {
    LIGHT: 1.8,
    GHOST: 1.8,
    DARK: 0.3,
    FAIRY: 0.5
  },
  GRASS: {
    WATER: 1.8,
    EARTH: 1.75,
    FIRE: 0.4,
    POISON: 0.4,
    STEEL: 0.4,
    DRAGON: 0.5,
    GRASS: 0.3
  },
  POISON: {
    GRASS: 2.0,
    FAIRY: 1.8,
    POISON: 0.3,
    EARTH: 0.5,
    STEEL: 0.2,
    GHOST: 0.5
  },
  STEEL: {
    FAIRY: 2.0,
    ICE: 1.8,
    EARTH: 1.2,
    FIRE: 0.5,
    STEEL: 0.3,
    WATER: 0.6
  },
  GHOST: {
    GHOST: 1.8,
    DARK: 1.4,
    PHYSICAL: 0.2,
    POISON: 0.5
  },
  DRAGON: {
    DRAGON: 1.8,
    FIRE: 1.2,
    WATER: 1.2,
    GRASS: 1.2,
    LIGHTNING: 1.2,
    STEEL: 0.5,
    FAIRY: 0.3,
    ICE: 0.5
  },
  FAIRY: {
    DRAGON: 2.0,
    DARK: 1.75,
    POISON: 0.4,
    STEEL: 0.4,
    FIRE: 0.5
  },
  PHYSICAL: {
    EARTH: 0.7,
    STEEL: 0.5,
    GHOST: 0.2
  }
};

export interface ElementalReaction {
  id: string;
  name: string;
  requiredStatus: StatusEffectType;
  triggerElement: ElementType;
  damageMultiplier: number;
  bonusEffect?: string;
  label: string; // e.g. "💥 BÙNG CHÁY!"
  description: string;
}

export const ELEMENTAL_REACTIONS: ElementalReaction[] = [
  {
    id: 'COMBUSTION',
    name: 'Bùng Cháy Nổ Độc',
    requiredStatus: 'POISON',
    triggerElement: 'FIRE',
    damageMultiplier: 1.7,
    label: '💥 BÙNG CHÁY!',
    description: 'Lửa gặp Kịch Độc phát nổ bốc cháy dữ dội, tăng thêm +70% sát thương bộc phát và khuếch đại DoT!'
  },
  {
    id: 'BURNING_VINES',
    name: 'Thiêu Rụi Dây Leo',
    requiredStatus: 'ROOT',
    triggerElement: 'FIRE',
    damageMultiplier: 1.65,
    label: '🔥 RỰC LỬA!',
    description: 'Ngọn lửa bén vào dây leo trói buộc, gây sát thương bộc phát +65% và duy trì lửa cháy!'
  },
  {
    id: 'ELECTRO_CHARGED',
    name: 'Sốc Điện Cao Thế',
    requiredStatus: 'WET',
    triggerElement: 'LIGHTNING',
    damageMultiplier: 1.75,
    label: '⚡ SỐC ĐIỆN!',
    description: 'Trạng thái Ẩm Ướt dẫn dòng điện cực mạnh, tăng +75% sát thương và tăng thời gian choáng.'
  },
  {
    id: 'PERMAFROST',
    name: 'Đóng Băng Vĩnh Cửu',
    requiredStatus: 'WET',
    triggerElement: 'ICE',
    damageMultiplier: 1.5,
    label: '❄️ ĐÓNG BĂNG!',
    description: 'Màn nước biến thành khối băng buốt giá, tăng +50% sát thương và chắc chắn Đóng Băng 1.2s.'
  },
  {
    id: 'OVERGROWTH',
    name: 'Sinh Trưởng Mộc Tinh',
    requiredStatus: 'WET',
    triggerElement: 'GRASS',
    damageMultiplier: 1.6,
    label: '🌿 SINH TRƯỞNG!',
    description: 'Nước tưới mát hạt giống mộc tinh, kích hoạt dây leo trói chân kéo dài và tăng +60% sát thương.'
  },
  {
    id: 'SHATTER',
    name: 'Phá Băng Trọng Kích',
    requiredStatus: 'FREEZE',
    triggerElement: 'STEEL',
    damageMultiplier: 1.85,
    label: '🔨 PHÁ BĂNG!',
    description: 'Vũ khí Thép đập vỡ vụn khối băng phong tỏa, gây bạo kích +85% sát thương phá hủy!'
  },
  {
    id: 'SHATTER_EARTH',
    name: 'Địa Chấn Phá Băng',
    requiredStatus: 'FREEZE',
    triggerElement: 'EARTH',
    damageMultiplier: 1.75,
    label: '🪨 PHÁ BĂNG!',
    description: 'Chấn động mặt đất làm nứt toác khối băng, gây bạo kích +75% sát thương!'
  },
  {
    id: 'CORROSION',
    name: 'Ăn Mòn Cực Độc',
    requiredStatus: 'SUNDER',
    triggerElement: 'POISON',
    damageMultiplier: 1.6,
    label: '🧪 ĂN MÒN!',
    description: 'Độc tố ngấm sâu vào vết nứt giáp thép, gây thêm +60% sát thương ăn mòn và rút máu gấp đôi.'
  },
  {
    id: 'SPIRIT_PURIFY',
    name: 'Linh Hồn Thanh Tẩy',
    requiredStatus: 'CHARM',
    triggerElement: 'LIGHT',
    damageMultiplier: 1.7,
    label: '✨ TỊNH HÓA!',
    description: 'Thánh quang rọi chiếu mục tiêu đang bị mê hoặc, thanh tẩy tà khí và bộc phát +70% sát thương.'
  },
  {
    id: 'DRAGON_OVERLOAD',
    name: 'Long Lôi Bạo Kích',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'LIGHTNING',
    damageMultiplier: 1.75,
    label: '🐉 LONG LÔI!',
    description: 'Tia sét hòa quyện cùng uy áp loài rồng, giáng đòn sấm sét bạo kích +75% sát thương lên Boss/quái!'
  },
  {
    id: 'SWIRL',
    name: 'Cuồng Phong Khuếch Tán',
    requiredStatus: 'BURN',
    triggerElement: 'WIND',
    damageMultiplier: 1.45,
    label: '🌪️ KHUẾCH TÁN!',
    description: 'Gió lốc thổi bùng ngọn lửa lan tỏa, tăng thêm +45% sát thương và thổi bạt quái về sau.'
  }
];

export interface ElementCodexData {
  element: ElementType;
  nameVi: string;
  badge: string;
  nature: string;
  statusEffectName: string;
  statusEffectDesc: string;
  buildingEffects: {
    barracks: string;
    archer: string;
    mage: string;
    artillery: string;
  };
  combos: Array<{ partner: ElementType; reaction: string; desc: string }>;
  strongAgainst: Array<{ element: ElementType; mult: number; note: string }>;
  weakAgainstAttack: Array<{ element: ElementType; mult: number; note: string }>;
  weakAgainstDefense: Array<{ element: ElementType; mult: number; note: string }>;
  sampleMonsters: string[];
}

export const ELEMENT_CODEX_DETAILS: Record<ElementType, ElementCodexData> = {
  PHYSICAL: {
    element: 'PHYSICAL',
    nameVi: 'Vật Lý',
    badge: 'Cơ Bản • Vũ Khí Thép & Đá',
    nature: 'Sát thương cơ bản từ kiếm khiên, cung tên và đạn pháo nổ thô sơ. Vững chắc, ổn định, không tốn mana nhưng chịu giảm trừ trước giáp dày hoặc thể vô hình.',
    statusEffectName: 'Không (Sát thương Thuần Túy)',
    statusEffectDesc: 'Gây sát thương trực tiếp lên lượng máu mục tiêu, chịu ảnh hưởng bởi chỉ số Giáp (Armor) của quái vật.',
    buildingEffects: {
      barracks: 'Chiến binh chém kiếm 1v1 hoặc xạ thủ bắn tên lao tầm xa gây 100% sát thương cơ bản.',
      archer: 'Bắn tên vật lý tốc độ cao liên tục vào mục tiêu gần nhất hoặc đi đầu.',
      mage: 'Phù Thủy chuyển hóa thành ma thuật, không gây sát thương thuần vật lý.',
      artillery: 'Ném đạn pháo cối phát nổ diện rộng gây 100% sát thương nổ vật lý chạm đất.'
    },
    combos: [
      { partner: 'STEEL', reaction: 'Cường Hóa Thiết Giáp', desc: 'Kết hợp cùng Phá Giáp tăng thêm +30% sát thương vật lý.' },
      { partner: 'ICE', reaction: 'Phá Băng', desc: 'Đánh vào mục tiêu Đóng Băng gây thêm sát thương đập vỡ khối băng.' }
    ],
    strongAgainst: [
      { element: 'PHYSICAL', mult: 1.0, note: 'Gây đủ 100% sát thương lên đa phần quái vật thông thường.' }
    ],
    weakAgainstAttack: [
      { element: 'EARTH', mult: 0.7, note: 'Khổng Lồ Đất có giáp đá giảm sát thương vật lý.' },
      { element: 'STEEL', mult: 0.5, note: 'Quái Thiết Giáp sở hữu giáp thép dày cản phá đòn chém.' },
      { element: 'GHOST', mult: 0.2, note: 'Hồn ma dạng khí thể, miễn nhiễm gần như hoàn toàn sát thương vật lý.' }
    ],
    weakAgainstDefense: [
      { element: 'WIND', mult: 1.2, note: 'Gió lốc xé rách đội hình vật lý thô sơ.' }
    ],
    sampleMonsters: ['Que Chạy Nhanh', 'Que Kiếm Sĩ']
  },
  FIRE: {
    element: 'FIRE',
    nameVi: 'Lửa (Hỏa)',
    badge: 'Thiêu Đốt DoT • Bùng Nổ Nham Thạch',
    nature: 'Nhiệt năng cuồng nộ thiêu rụi mục tiêu theo thời gian, có thể kích nổ cực mạnh khi gặp Độc tố và Cỏ cây.',
    statusEffectName: 'Thiêu Đốt (Burn)',
    statusEffectDesc: 'Đốt cháy mục tiêu trong 3.0s, mỗi 0.5s rút máu 20% sát thương gốc (tổng 6 nhịp = 120% DMG, bỏ qua giáp).',
    buildingEffects: {
      barracks: 'Lưỡi kiếm và mũi tên rực lửa liên tục duy trì trạng thái bốc cháy lên quái bị chặn.',
      archer: 'Mưa tên lửa duy trì thiêu đốt 100% thời gian, bào mòn cực nhanh quái trâu máu.',
      mage: 'Quả cầu lửa nổ lan diện rộng kèm thiêu đốt toàn bộ đàn quái xung quanh.',
      artillery: 'Biển lửa Napalm diện rộng bao phủ mặt đất, nung chín đàn quái đông đúc.'
    },
    combos: [
      { partner: 'POISON', reaction: '💥 BÙNG CHÁY!', desc: 'Kích nổ độc tố gây thêm +70% sát thương bộc phát và thiêu đốt dữ dội.' },
      { partner: 'GRASS', reaction: '🔥 RỰC LỬA!', desc: 'Bén vào dây leo trói chân, gây thêm +65% sát thương tức thì.' },
      { partner: 'WIND', reaction: '🌪️ KHUẾCH TÁN!', desc: 'Gió lốc thổi bùng ngọn lửa lan xa, tăng +45% sát thương.' }
    ],
    strongAgainst: [
      { element: 'GRASS', mult: 2.0, note: 'Thiêu rụi hoàn toàn quái Mộc tinh và thảo mộc.' },
      { element: 'ICE', mult: 1.75, note: 'Hơi nóng làm tan chảy khối băng của Khổng Lồ Băng.' },
      { element: 'STEEL', mult: 1.75, note: 'Nhiệt lượng nung chảy giáp thép của quân đoàn cơ giới.' },
      { element: 'WIND', mult: 1.3, note: 'Ngọn lửa lan theo chiều gió gây sát thương tăng cường.' }
    ],
    weakAgainstAttack: [
      { element: 'FIRE', mult: 0.3, note: 'Quái hệ Lửa miễn nhiễm hoặc hấp thu nhiệt lượng.' },
      { element: 'WATER', mult: 0.5, note: 'Nước dập tắt hoàn toàn ngọn lửa.' },
      { element: 'DRAGON', mult: 0.5, note: 'Vảy rồng kháng nhiệt cao cản phá lửa.' }
    ],
    weakAgainstDefense: [
      { element: 'WATER', mult: 2.0, note: 'Sợ nhất Thủy lôi và sóng nước dội vào.' },
      { element: 'EARTH', mult: 1.5, note: 'Đất đá dập tắt nguồn lửa.' }
    ],
    sampleMonsters: ['Tiểu Quỷ Hỏa Diệm', 'Khối Dung Nham Phân Tách']
  },
  WATER: {
    element: 'WATER',
    nameVi: 'Nước (Thủy)',
    badge: 'Ẩm Ướt Trì Hoãn • Dẫn Truyền Ma Pháp',
    nature: 'Áp lực nước dập tắt ngọn lửa, làm ẩm ướt mục tiêu để làm bệ phóng kích hoạt các phản ứng Sét, Băng và Mộc.',
    statusEffectName: 'Ẩm Ướt & Trì Hoãn (Wet)',
    statusEffectDesc: 'Làm chậm 20% trong 2.5s và bao phủ lớp nước trong 4.0s (tăng sát thương Sét x1.75, Băng x1.5, Cỏ x1.6).',
    buildingEffects: {
      barracks: 'Đòn đánh phủ ướt kẻ địch, mở đường cho Tháp Sét hoặc Tháp Băng phía sau xả sát thương combo.',
      archer: 'Bắn tỉa phủ Ẩm Ướt liên tục lên quái đầu đàn với tầm bắn cực xa.',
      mage: 'Sóng triều ma thuật quét qua hàng ngũ địch, làm ướt hàng loạt mục tiêu cùng lúc.',
      artillery: 'Thủy lôi đại bác dội nước áp lực lớn phủ ướt toàn bộ bán kính nổ 75px.'
    },
    combos: [
      { partner: 'LIGHTNING', reaction: '⚡ SỐC ĐIỆN!', desc: 'Nước dẫn truyền dòng điện tăng +75% sát thương và kéo dài tê liệt.' },
      { partner: 'ICE', reaction: '❄️ ĐÓNG BĂNG!', desc: 'Hàn khí đóng băng lớp nước trên người quái, chắc chắn bất động 1.2s.' },
      { partner: 'GRASS', reaction: '🌿 SINH TRƯỞNG!', desc: 'Tưới nước nuôi mầm mộc tinh trói chân kéo dài và tăng +60% sát thương.' }
    ],
    strongAgainst: [
      { element: 'FIRE', mult: 2.0, note: 'Khắc chế hủy diệt quái Lửa và dung nham.' },
      { element: 'EARTH', mult: 1.5, note: 'Làm xói mòn và nhão bùn đất đá.' },
      { element: 'STEEL', mult: 1.3, note: 'Nước làm rỉ sét kim loại gây tổn hại kết cấu giáp.' }
    ],
    weakAgainstAttack: [
      { element: 'WATER', mult: 0.3, note: 'Thủy quái miễn nhiễm đòn đánh cùng hệ.' },
      { element: 'LIGHTNING', mult: 0.5, note: 'Sét đánh ngược dòng làm hao hụt áp lực nước.' },
      { element: 'GRASS', mult: 0.5, note: 'Cỏ cây hút cạn dòng nước.' },
      { element: 'DRAGON', mult: 0.5, note: 'Long tộc bơi lội và lướt qua dòng nước dễ dàng.' }
    ],
    weakAgainstDefense: [
      { element: 'LIGHTNING', mult: 2.0, note: 'Sợ nhất các đòn phóng điện giật lan.' },
      { element: 'GRASS', mult: 1.8, note: 'Cây cỏ cắm rễ hút cạn sinh lực.' },
      { element: 'ICE', mult: 1.3, note: 'Dễ bị đóng băng hóa đá.' }
    ],
    sampleMonsters: ['Thủy Xà Sông Sâu', 'Tiên Cá Gọi Bão', 'Lươn Điện Thủy Tộc']
  },
  EARTH: {
    element: 'EARTH',
    nameVi: 'Đất (Thổ)',
    badge: 'Địa Chấn Nặng Nề • Khắc Tinh Quái Bộ',
    nature: 'Trọng lượng ngàn cân làm nứt nẻ địa tầng, chuyên trị quái đi bộ và nghiền nát kim loại, sét điện.',
    statusEffectName: 'Địa Chấn & Làm Chậm (Slow)',
    statusEffectDesc: 'Làm chậm 35% tốc độ trong 2.5s; gây thêm +20% sát thương trực tiếp lên quái Đi Bộ (WALK).',
    buildingEffects: {
      barracks: 'Chiến binh dộng đất tạo chấn động giữ chân và kìm chặt quái vật trên lộ trình.',
      archer: 'Bắn tên đá đè nặng bước tiến quái vật, giảm 35% tốc độ chạy.',
      mage: 'Quả cầu thạch nham chôn vùi đàn quái, bỏ qua phòng thủ.',
      artillery: 'Đại địa chấn Cataclysm nổ lan cực mạnh, quét sạch quái bộ binh.'
    },
    combos: [
      { partner: 'ICE', reaction: '🪨 PHÁ BĂNG!', desc: 'Khối đá giáng xuống mục tiêu đang Đóng Băng gây bạo kích +75% sát thương.' },
      { partner: 'POISON', reaction: '🧪 CHÔN VÙI!', desc: 'Chôn vùi quái vật nhiễm độc xuống đất sâu, kéo dài thời gian suy yếu.' }
    ],
    strongAgainst: [
      { element: 'LIGHTNING', mult: 1.5, note: 'Đất tiếp đất hấp thu và triệt tiêu tia điện.' },
      { element: 'FIRE', mult: 1.5, note: 'Cát đất dập tắt ngọn lửa rừng rực.' },
      { element: 'POISON', mult: 1.5, note: 'Đất hấp thu độc tố làm trung hòa nọc độc.' },
      { element: 'STEEL', mult: 1.75, note: 'Khối lượng thạch nham nghiền nát giáp sắt.' },
      { element: 'WIND', mult: 1.25, note: 'Đá tảng vững chãi trước cuồng phong.' }
    ],
    weakAgainstAttack: [
      { element: 'EARTH', mult: 0.5, note: 'Quái Đất có lớp da đá kháng chấn động.' },
      { element: 'GRASS', mult: 0.5, note: 'Rễ cây đâm xuyên qua tầng đất làm suy giảm sát thương.' }
    ],
    weakAgainstDefense: [
      { element: 'GRASS', mult: 1.75, note: 'Mộc khắc Thổ, rễ cây hút dinh dưỡng đất.' },
      { element: 'WATER', mult: 1.5, note: 'Dòng nước làm xói mòn sạt lở.' }
    ],
    sampleMonsters: ['Khổng Lồ Thạch Nham', 'Khối Dung Nham']
  },
  WIND: {
    element: 'WIND',
    nameVi: 'Gió (Phong)',
    badge: 'Xuyên Không Gian • Khắc Tinh Quái Bay',
    nature: 'Lưỡi dao gió xé toạc không gian, đẩy lùi mục tiêu và gây sát thương vượt trội lên toàn bộ sinh vật bay lượn.',
    statusEffectName: 'Cuồng Phong Đẩy Lùi (Knockback)',
    statusEffectDesc: 'Đẩy lùi quái ngược lộ trình tiến công (15px bộ / 25px bay); tăng +50% sát thương lên quái Bay (FLY).',
    buildingEffects: {
      barracks: 'Lính chém kiếm đẩy lùi quái bộ; nếu chuyển sang Lính Bắn Tên sẽ bắn rụng quái bay và đẩy lùi 25px.',
      archer: 'Tháp cung gió liên thanh đẩy lùi quái bay liên tục, không cho tiếp cận căn cứ.',
      mage: 'Lốc xoáy ma thuật cuốn bay cả đàn quái vật ngược lại điểm xuất phát.',
      artillery: 'Sóng xung kích cuồng phong nổ hất tung toàn bộ quái vật trong bán kính nổ.'
    },
    combos: [
      { partner: 'FIRE', reaction: '🌪️ KHUẾCH TÁN!', desc: 'Khuếch tán ngọn lửa thiêu đốt thành bão lửa +45% sát thương.' },
      { partner: 'POISON', reaction: '🌪️ BÃO ĐỘC!', desc: 'Gió cuốn làn mây độc phát tán rộng hơn, tăng thời gian trúng độc.' }
    ],
    strongAgainst: [
      { element: 'EARTH', mult: 1.5, note: 'Bão cát mài mòn và nâng bổng đất đá.' },
      { element: 'GRASS', mult: 1.5, note: 'Lốc xoáy bẻ gãy cành cây và cuốn phăng lá rụng.' },
      { element: 'PHYSICAL', mult: 1.2, note: 'Luồng gió làm lệch hướng các đòn tấn công thô sơ.' }
    ],
    weakAgainstAttack: [
      { element: 'STEEL', mult: 0.5, note: 'Giáp thép quá nặng không bị gió lay chuyển.' },
      { element: 'ICE', mult: 0.5, note: 'Băng giá làm lạnh đông cứng luồng không khí.' }
    ],
    weakAgainstDefense: [
      { element: 'LIGHTNING', mult: 1.5, note: 'Bão gió kích hoạt sấm sét đánh trúng.' },
      { element: 'ICE', mult: 1.5, note: 'Hàn băng đóng băng luồng khí.' },
      { element: 'FIRE', mult: 1.3, note: 'Gió bị lửa nuốt chửng dưỡng khí.' }
    ],
    sampleMonsters: ['Que Dơi Phong Thần', 'Mảnh Băng Tinh']
  },
  LIGHTNING: {
    element: 'LIGHTNING',
    nameVi: 'Sét (Lôi)',
    badge: 'Tốc Độ Ánh Sáng • Sốc Điện & Giật Lan',
    nature: 'Nguồn năng lượng chớp giật tốc độ cao, ngắt nhịp tung đòn của quái bằng choáng và nảy tia điện diệt bầy đàn.',
    statusEffectName: 'Tê Liệt & Giật Lan (Shock)',
    statusEffectDesc: 'Gây choáng 0.35s ngắt đòn quái và phóng tia sét nảy sang kẻ địch kế bên gây 35% sát thương.',
    buildingEffects: {
      barracks: 'Mỗi cú chém hoặc mũi tên làm tê liệt quái vật và giật tia sét sang mục tiêu bên cạnh.',
      archer: 'Bắn tỉa lôi điện liên hoàn, dọn dẹp bầy quái nhỏ siêu tốc.',
      mage: 'Phóng tia chớp chuỗi (Chain Lightning) nảy qua 4-5 mục tiêu liên tiếp.',
      artillery: 'Pháo EMP từ trường phát nổ làm choáng hàng loạt quái vật cùng lúc.'
    },
    combos: [
      { partner: 'WATER', reaction: '⚡ SỐC ĐIỆN!', desc: 'Ẩm Ướt dẫn sét gây +75% sát thương và tăng thời gian choáng tê liệt.' },
      { partner: 'DRAGON', reaction: '🐉 LONG LÔI!', desc: 'Hòa quyện Long Uy gây sấm sét bạo kích +75% sát thương.' }
    ],
    strongAgainst: [
      { element: 'WATER', mult: 2.0, note: 'Khắc chế tuyệt đối thủy quái bơi sông và sinh vật nước.' },
      { element: 'WIND', mult: 1.5, note: 'Đánh trúng các sinh vật bay lượn trên bầu trời.' },
      { element: 'STEEL', mult: 1.3, note: 'Dẫn điện xuyên qua bộ giáp kim loại nung nóng kẻ địch.' }
    ],
    weakAgainstAttack: [
      { element: 'EARTH', mult: 0.3, note: 'Quái Đất tiếp đất hoàn toàn triệt tiêu dòng điện.' },
      { element: 'LIGHTNING', mult: 0.3, note: 'Quái Lôi hấp thụ dòng điện.' },
      { element: 'GRASS', mult: 0.5, note: 'Gỗ khô cách điện làm suy yếu tia sét.' },
      { element: 'DRAGON', mult: 0.5, note: 'Vảy rồng cổ đại cách điện kiên cố.' }
    ],
    weakAgainstDefense: [
      { element: 'EARTH', mult: 1.5, note: 'Đất đá chặn đứng và tiêu biến nguồn năng lượng sét.' }
    ],
    sampleMonsters: ['Lươn Điện Thủy Tộc', 'Tiên Cá Gọi Bão']
  },
  ICE: {
    element: 'ICE',
    nameVi: 'Băng (Hàn)',
    badge: 'Khống Chế Tuyệt Đối • Đóng Băng Vĩnh Cửu',
    nature: 'Độ không tuyệt đối làm chậm sâu bước tiến quân địch và phong ấn quái vật đứng bất động trong băng giá.',
    statusEffectName: 'Hàn Băng & Đóng Băng (Freeze)',
    statusEffectDesc: 'Làm chậm 45% trong 3.0s và có 25% tỉ lệ đóng băng hoàn toàn trong 1.2s (quái đứng yên, không đánh trả).',
    buildingEffects: {
      barracks: 'Lính chốt chặn đóng băng quái vật ngay trước mặt, không cho quái vật cơ hội tấn công.',
      archer: 'Bắn tỉa khóa chân vĩnh cửu, làm chậm 45% liên tục không cho quái chạy thoát.',
      mage: 'Bão tuyết diện rộng làm tê cóng và đóng băng nhiều quái vật cùng lúc.',
      artillery: 'Pháo băng Blizzard nổ lan làm chậm cả đoàn quân trong bán kính lớn.'
    },
    combos: [
      { partner: 'STEEL', reaction: '🔨 PHÁ BĂNG!', desc: 'Đòn đánh Thép đập vỡ vụn khối băng gây bạo kích +85% sát thương.' },
      { partner: 'EARTH', reaction: '🪨 PHÁ BĂNG!', desc: 'Chấn động đất đá đập tan khối băng gây bạo kích +75% sát thương.' },
      { partner: 'WATER', reaction: '❄️ ĐÓNG BĂNG!', desc: 'Nước gặp băng lập tức hóa cứng, chắc chắn 100% đóng băng 1.2s.' }
    ],
    strongAgainst: [
      { element: 'DRAGON', mult: 2.0, note: 'Hàn băng là khắc tinh số 1 của loài rồng máu nóng.' },
      { element: 'GRASS', mult: 1.8, note: 'Sương giá làm khô héo hoa màu thảo mộc.' },
      { element: 'WIND', mult: 1.5, note: 'Đóng băng các luồng cuồng phong.' },
      { element: 'WATER', mult: 1.3, note: 'Đóng băng mặt nước sông hồ.' }
    ],
    weakAgainstAttack: [
      { element: 'FIRE', mult: 0.5, note: 'Nhiệt lửa làm tan chảy đạn băng.' },
      { element: 'STEEL', mult: 0.5, note: 'Giáp thép cứng cáp làm vỡ vụn mảnh băng.' },
      { element: 'ICE', mult: 0.2, note: 'Sinh vật băng tuyết miễn nhiễm hàn khí.' }
    ],
    weakAgainstDefense: [
      { element: 'FIRE', mult: 1.75, note: 'Sợ nhất các đòn thiêu đốt hỏa diệm.' },
      { element: 'STEEL', mult: 1.8, note: 'Vũ khí kim loại đập vỡ cấu trúc tinh thể băng.' }
    ],
    sampleMonsters: ['Khổng Lồ Băng Nham', 'Mảnh Băng Tinh']
  },
  LIGHT: {
    element: 'LIGHT',
    nameVi: 'Ánh Sáng (Quang)',
    badge: 'Thần Thánh • Hồi Máu & Thanh Tẩy',
    nature: 'Hào quang rực rỡ bảo hộ sinh mạng đồng minh, hồi phục vết thương và thanh tẩy bóng tối ma quỷ.',
    statusEffectName: 'Thánh Quang Hồi Máu (Holy)',
    statusEffectDesc: 'Đòn đánh của Lính tự hồi +5 HP; gây x2.0 sát thương và thiêu đốt thánh quang 2.5s lên quái Tối & Ma.',
    buildingEffects: {
      barracks: 'Mỗi đòn chém hoặc mũi tên tự động hồi +5 HP cho Lính, biến lính thành pháo đài bất tử.',
      archer: 'Bắn tỉa thanh tẩy quái Hắc Ám từ khoảng cách an toàn.',
      mage: 'Chiếu rọi cột sáng thánh quang thiêu rụi đội hình quỷ dữ.',
      artillery: 'Nổ chùm ánh sáng thanh tẩy diện rộng, xua tan bóng đêm u ám.'
    },
    combos: [
      { partner: 'DARK', reaction: '✨ LƯỠNG CỰC QUANG ÁM', desc: 'Xuyên thủng mọi loại khiên kháng ma pháp của Boss.' },
      { partner: 'FAIRY', reaction: '✨ TỊNH HÓA!', desc: 'Thanh tẩy quái vật bị mê hoặc gây thêm +70% sát thương bộc phát.' }
    ],
    strongAgainst: [
      { element: 'DARK', mult: 2.0, note: 'Ánh sáng xua tan bóng tối và ma vương.' },
      { element: 'GHOST', mult: 1.8, note: 'Thánh quang thanh tẩy vong linh u hồn.' }
    ],
    weakAgainstAttack: [
      { element: 'LIGHT', mult: 0.3, note: 'Sinh vật ánh sáng hấp thụ quang năng.' },
      { element: 'STEEL', mult: 0.5, note: 'Mặt gương thép phản chiếu tia sáng.' }
    ],
    weakAgainstDefense: [
      { element: 'DARK', mult: 1.8, note: 'Bóng tối ăn mòn quang năng.' }
    ],
    sampleMonsters: ['Chiến Binh Ánh Sáng', 'Thánh Kỵ Sĩ']
  },
  DARK: {
    element: 'DARK',
    nameVi: 'Hắc Ám (Ám)',
    badge: 'Ăn Mòn Tâm Linh • Khuếch Đại Toàn Diện',
    nature: 'Năng lượng hư vô bóng tối gặm nhấm phòng ngự, khắc dấu ấn nguyền rủa khiến kẻ địch chịu thêm sát thương từ mọi nguồn.',
    statusEffectName: 'Nguyền Rủa Suy Yếu (Curse)',
    statusEffectDesc: 'Khắc dấu ấn Nguyền Rủa 3.5s khiến quái nhận thêm +35% sát thương từ MỌI NGUỒN (Tháp, Lính, Bẫy).',
    buildingEffects: {
      barracks: 'Chiến binh nguyền rủa quái vật bị chặn, hỗ trợ toàn bộ tháp khác dồn sát thương kết liễu.',
      archer: 'Bắn tỉa điểm huyệt nguyền rủa quái đầu đàn từ xa.',
      mage: 'Cầu ma thuật hắc ám bùng nổ bỏ qua 100% giáp vật lý.',
      artillery: 'Vụ nổ bóng tối nguyền rủa toàn bộ quân địch trong bán kính nổ.'
    },
    combos: [
      { partner: 'FIRE', reaction: '🔥 HỎA NGỤC HẮC ÁM', desc: 'Nguyền rủa khuếch đại sát thương DoT của Lửa thiêu đốt dữ dội.' },
      { partner: 'LIGHT', reaction: '✨ LƯỠNG CỰC QUANG ÁM', desc: 'Va chạm quang ám hủy diệt khiên bảo vệ.' }
    ],
    strongAgainst: [
      { element: 'LIGHT', mult: 1.8, note: 'Bóng tối nuốt chửng ánh sáng.' },
      { element: 'GHOST', mult: 1.8, note: 'Hắc ám áp chế linh hồn phiêu bạt.' }
    ],
    weakAgainstAttack: [
      { element: 'DARK', mult: 0.3, note: 'Quái vật hắc ám miễn nhiễm bóng tối.' },
      { element: 'FAIRY', mult: 0.5, note: 'Phép thuật tiên linh thuần khiết xua đuổi bóng tối.' }
    ],
    weakAgainstDefense: [
      { element: 'LIGHT', mult: 2.0, note: 'Sợ nhất thánh quang rọi chiếu thanh tẩy.' },
      { element: 'FAIRY', mult: 1.75, note: 'Bụi tiên thanh lọc năng lượng hắc ám.' }
    ],
    sampleMonsters: ['Hồn Ma Hư Vô', 'Pháp Sư Chiêu Hồn', 'Đại Hắc Long Ma Vương']
  },
  GRASS: {
    element: 'GRASS',
    nameVi: 'Cỏ (Mộc)',
    badge: 'Dây Leo Trói Chân • Hút Nhựa Sống',
    nature: 'Sức sống mãnh liệt của thiên nhiên cây cỏ, triệu hồi rễ cây trói chặt bước chân kẻ địch và hút sinh lực tiếp tế đồng minh.',
    statusEffectName: 'Trói Buộc & Hút Nhựa Sống (Root)',
    statusEffectDesc: 'Làm chậm 30% trong 3.0s, có 30% tỉ lệ trói chân bất động 1.0s và hút nhựa sống tự hồi +3 HP cho Lính.',
    buildingEffects: {
      barracks: 'Dây leo gai góc mọc lên dưới chân quái, vừa trói chân vừa hút máu hồi phục cho 3 chiến binh.',
      archer: 'Mũi tên mộc tinh cắm rễ làm chậm và trói chặt quái chạy nhanh trên đường.',
      mage: 'Gai nhọn thiên nhiên đâm xuyên qua đội hình địch, trói chân hàng loạt quái vật.',
      artillery: 'Đại bác nụ hoa phát nổ rải gai và dây leo bao phủ toàn bộ vùng nổ.'
    },
    combos: [
      { partner: 'FIRE', reaction: '🔥 RỰC LỬA!', desc: 'Lửa bén vào dây leo trói chân, gây bạo kích +65% sát thương thiêu đốt.' },
      { partner: 'WATER', reaction: '🌿 SINH TRƯỞNG!', desc: 'Nước nuôi dưỡng mộc tinh tăng +60% sát thương và tăng thời gian trói chân.' }
    ],
    strongAgainst: [
      { element: 'WATER', mult: 1.8, note: 'Cây cối cắm rễ hút cạn nguồn nước của thủy quái.' },
      { element: 'EARTH', mult: 1.75, note: 'Mộc khắc Thổ, rễ cây đâm nứt toác đá tảng.' }
    ],
    weakAgainstAttack: [
      { element: 'FIRE', mult: 0.4, note: 'Lửa thiêu đốt cành cây thành tro bụi.' },
      { element: 'POISON', mult: 0.4, note: 'Chất độc làm khô héo thảm thực vật.' },
      { element: 'STEEL', mult: 0.4, note: 'Rìu thép chặt đứt cành cây dễ dàng.' },
      { element: 'DRAGON', mult: 0.5, note: 'Hơi thở rồng nghiền nát cây cối.' },
      { element: 'GRASS', mult: 0.3, note: 'Cùng hệ cây cỏ đề kháng cao.' }
    ],
    weakAgainstDefense: [
      { element: 'FIRE', mult: 2.0, note: 'Sợ nhất các đòn tấn công thiêu đốt.' },
      { element: 'POISON', mult: 2.0, note: 'Thuốc độc làm thối rữa tế bào thực vật.' },
      { element: 'ICE', mult: 1.8, note: 'Băng tuyết làm đông cứng héo rũ cây cối.' }
    ],
    sampleMonsters: ['Mộc Tinh Chiến Binh', 'Rùa Rêu Suối Nguồn']
  },
  POISON: {
    element: 'POISON',
    nameVi: 'Độc (Độc Tố)',
    badge: 'Kịch Độc Cộng Dồn • Suy Yếu Đòn Đánh',
    nature: 'Nọc độc ăn mòn thể xác và tinh thần, gây sát thương DoT cộng dồn liên tục và làm chậm nhịp tung đòn của kẻ địch.',
    statusEffectName: 'Kịch Độc Ăn Mòn (Poison)',
    statusEffectDesc: 'Đầu độc mục tiêu trong 4.0s (DoT cộng dồn tối đa 3 tầng) và làm giảm 20% tốc độ đánh của kẻ địch.',
    buildingEffects: {
      barracks: 'Lưỡi kiếm tẩm nọc độc làm suy yếu sức mạnh của quái, giảm sát thương quái đánh vào lính.',
      archer: 'Bắn liên hoàn tích lũy 3 tầng kịch độc nhanh chóng lên mục tiêu đơn lẻ.',
      mage: 'Mây độc bốc lên ngột ngạt làm nhiễm độc toàn bộ khu vực đi qua.',
      artillery: 'Bom độc vỡ nát giải phóng chất độc ăn mòn diện rộng.'
    },
    combos: [
      { partner: 'FIRE', reaction: '💥 BÙNG CHÁY!', desc: 'Khí độc gặp lửa phát nổ kinh hoàng +70% sát thương bộc phát.' },
      { partner: 'STEEL', reaction: '🧪 ĂN MÒN!', desc: 'Độc tố ngấm vào kim loại phá giáp sâu và tăng DoT gấp đôi.' }
    ],
    strongAgainst: [
      { element: 'GRASS', mult: 2.0, note: 'Chất độc hủy diệt hệ thực vật và mộc tinh.' },
      { element: 'FAIRY', mult: 1.8, note: 'Độc tố làm ô uế và tiêu diệt tinh linh thuần khiết.' }
    ],
    weakAgainstAttack: [
      { element: 'POISON', mult: 0.3, note: 'Quái hệ Độc miễn nhiễm nọc độc.' },
      { element: 'EARTH', mult: 0.5, note: 'Đất đá trơ lì trước chất độc lỏng.' },
      { element: 'STEEL', mult: 0.2, note: 'Kim loại nhân tạo hoàn toàn kháng sinh học độc tố.' },
      { element: 'GHOST', mult: 0.5, note: 'Hồn ma không có thể xác để bị trúng độc.' }
    ],
    weakAgainstDefense: [
      { element: 'EARTH', mult: 1.5, note: 'Đất cát chôn vùi làm trung hòa chất độc.' }
    ],
    sampleMonsters: ['Nhện Độc Đầm Lầy', 'Dơi Huyết Độc', 'Thủy Quái Kịch Độc']
  },
  STEEL: {
    element: 'STEEL',
    nameVi: 'Thép (Kim)',
    badge: 'Trọng Thiết Phá Giáp • Nghiền Nát Phòng Thủ',
    nature: 'Kim loại tôi luyện cứng cáp và nặng nề, nghiền nát lớp phòng ngự hộ thân và bẻ gãy băng tuyết, tiên tộc.',
    statusEffectName: 'Phá Giáp & Trọng Kích (Sunder)',
    statusEffectDesc: 'Nghiền nát giáp trong 4.0s: Quái nhận thêm +30% sát thương từ mọi nguồn và mất kháng vật lý.',
    buildingEffects: {
      barracks: 'Chiến binh vung đại đao phá vỡ giáp quái, tạo cơ hội cho đồng minh dứt điểm nhanh.',
      archer: 'Bắn tên xuyên giáp phá hủy lớp vỏ cứng của quái thiết giáp.',
      mage: 'Bắn ra những lưỡi dao ma pháp kim loại chém rách mọi lớp khiên.',
      artillery: 'Đạn pháo thép nguyên khối dập nát đội hình quái vật nặng ký.'
    },
    combos: [
      { partner: 'ICE', reaction: '🔨 PHÁ BĂNG!', desc: 'Vũ khí thép đập vỡ khối băng gây bạo kích +85% sát thương.' },
      { partner: 'POISON', reaction: '🧪 ĂN MÒN!', desc: 'Vết thương hở trên kim loại tạo điều kiện cho độc tố ăn mòn sâu.' }
    ],
    strongAgainst: [
      { element: 'FAIRY', mult: 2.0, note: 'Sắt thép nguội lạnh là khắc tinh số 1 của loài tiên linh.' },
      { element: 'ICE', mult: 1.8, note: 'Búa thép đập vỡ vụn băng tuyết.' },
      { element: 'EARTH', mult: 1.2, note: 'Mũi khoan thép đục thủng đá tảng.' }
    ],
    weakAgainstAttack: [
      { element: 'FIRE', mult: 0.5, note: 'Lửa nung chảy vũ khí kim loại.' },
      { element: 'STEEL', mult: 0.3, note: 'Thép đánh thép bị dội đòn.' },
      { element: 'WATER', mult: 0.6, note: 'Dòng nước làm giảm động năng của thép.' }
    ],
    weakAgainstDefense: [
      { element: 'FIRE', mult: 1.75, note: 'Sợ nhất hỏa diệm nung chảy áo giáp.' },
      { element: 'EARTH', mult: 1.75, note: 'Khối thạch nham ngàn cân đè bẹp kim loại.' },
      { element: 'LIGHTNING', mult: 1.3, note: 'Dẫn điện truyền thẳng vào người.' }
    ],
    sampleMonsters: ['Chiến Binh Thiết Giáp', 'Khổng Lồ Thép']
  },
  GHOST: {
    element: 'GHOST',
    nameVi: 'Ma (U Hồn)',
    badge: 'Xuyên Thấu Vật Lý • Trảm Sát Theo % Máu',
    nature: 'Linh hồn hư ảo phiêu bạt xuyên qua chướng ngại vật lý, tấn công trực diện vào linh hồn và kết liễu kẻ địch suy yếu.',
    statusEffectName: 'Ám Hồn & Trảm Sát (Soul Drain)',
    statusEffectDesc: 'Đòn đánh xuyên kháng gây thêm sát thương chuẩn dựa theo % Máu Đã Mất của quái và làm quái hoảng sợ giật lùi.',
    buildingEffects: {
      barracks: 'Lưỡi kiếm ma thuật chém trực tiếp vào linh hồn, quái càng mất nhiều máu chém càng đau.',
      archer: 'Mũi tên u hồn xuyên thấu qua lớp giáp dày, gieo rắc nỗi sợ hãi.',
      mage: 'Cột khói linh hồn nuốt chửng sinh mệnh của bầy quái vật.',
      artillery: 'Đại bác ma ám phát nổ sóng âm linh hồn làm hoảng loạn cả khu vực.'
    },
    combos: [
      { partner: 'LIGHT', reaction: '✨ TỊNH HÓA!', desc: 'Thánh quang rọi chiếu u hồn giải phóng năng lượng bộc phát.' },
      { partner: 'DARK', reaction: '🔮 LINH HỒN HẮC ÁM', desc: 'Hắc ám cộng hưởng u hồn tăng mạnh sát thương trảm sát.' }
    ],
    strongAgainst: [
      { element: 'GHOST', mult: 1.8, note: 'U hồn tương khắc nuốt chửng linh hồn lẫn nhau.' },
      { element: 'DARK', mult: 1.4, note: 'Vong linh quấy rối nguồn năng lượng bóng tối.' }
    ],
    weakAgainstAttack: [
      { element: 'PHYSICAL', mult: 0.2, note: 'Khó gây sát thương thuần lên các cấu trúc vật chất cứng.' },
      { element: 'POISON', mult: 0.5, note: 'Chất độc vô hiệu trước linh hồn vô thực.' }
    ],
    weakAgainstDefense: [
      { element: 'LIGHT', mult: 1.8, note: 'Sợ nhất ánh sáng thần thánh thanh tẩy.' },
      { element: 'DARK', mult: 1.8, note: 'Bị ma vương hắc ám áp chế linh hồn.' }
    ],
    sampleMonsters: ['U Hồn Tử Thần', 'Oán Hồn Không Trung', 'Hồn Ma Hư Vô']
  },
  DRAGON: {
    element: 'DRAGON',
    nameVi: 'Rồng (Long)',
    badge: 'Long Uy Bá Đạo • Diệt Trùm & Tinh Anh',
    nature: 'Uy lực của loài sinh vật đứng đầu chuỗi thức ăn, áp chế toàn bộ kẻ địch, giảm sát thương của quái và bạo kích lên Boss.',
    statusEffectName: 'Long Uy Áp Chế (Dragon Awe)',
    statusEffectDesc: 'Áp chế trong 3.5s: Giảm 25% sát thương của quái và gây thêm +35% sát thương lên Boss và quái Tinh Anh.',
    buildingEffects: {
      barracks: 'Hào quang rồng bảo hộ chiến binh, giảm 25% đòn đánh của quái và dập tan Boss mặt đất.',
      archer: 'Bắn ra những mũi tên hình đầu rồng gầm thét, xé toạc các sinh vật khổng lồ.',
      mage: 'Triệu hồi hơi thở của rồng (Dragon Breath) quét sạch kẻ địch trong tầm mắt.',
      artillery: 'Long hỏa đại pháo nổ long trời lở đất, làm run sợ muôn loài.'
    },
    combos: [
      { partner: 'LIGHTNING', reaction: '🐉 LONG LÔI!', desc: 'Sét hòa quyện Long Uy gây bạo kích lôi điện +75% sát thương.' },
      { partner: 'FIRE', reaction: '🔥 HƠI THỞ RỒNG', desc: 'Lửa rồng thiêu rụi đội hình quái vật không thể dập tắt.' }
    ],
    strongAgainst: [
      { element: 'DRAGON', mult: 1.8, note: 'Long tộc tương tàn, uy lực đè bẹp lẫn nhau.' },
      { element: 'FIRE', mult: 1.2, note: 'Áp chế các loài quái lửa thông thường.' },
      { element: 'WATER', mult: 1.2, note: 'Chế ngự loài thủy quái dưới nước.' },
      { element: 'GRASS', mult: 1.2, note: 'Nghiền nát thảm thực vật cây cối.' },
      { element: 'LIGHTNING', mult: 1.2, note: 'Vượt qua sấm sét thiên nhiên.' }
    ],
    weakAgainstAttack: [
      { element: 'STEEL', mult: 0.5, note: 'Vũ khí diệt rồng bằng thép nguội cản phá vuốt rồng.' },
      { element: 'FAIRY', mult: 0.3, note: 'Phép thuật tiên linh hoàn toàn miễn nhiễm uy áp loài rồng.' },
      { element: 'ICE', mult: 0.5, note: 'Băng giá buốt lạnh làm đóng băng hơi thở rồng.' }
    ],
    weakAgainstDefense: [
      { element: 'FAIRY', mult: 2.0, note: 'Sợ nhất phép thuật cổ xưa của Tiên tộc.' },
      { element: 'ICE', mult: 2.0, note: 'Máu nóng của rồng cực kỳ sợ hàn băng đóng băng cơ thể.' },
      { element: 'DRAGON', mult: 1.8, note: 'Bị sát thương từ loài rồng khác khắc chế.' }
    ],
    sampleMonsters: ['Long Nhân Chiến Sĩ', 'Phi Long Xung Kích', 'Giao Long Sông Sâu', 'Đại Hắc Long Ma Vương']
  },
  FAIRY: {
    element: 'FAIRY',
    nameVi: 'Tiên (Tiên Linh)',
    badge: 'Bụi Tiên Mê Hoặc • Khắc Tinh Loài Rồng',
    nature: 'Phép thuật cổ tích huyền ảo của các tinh linh, làm mê hoặc kẻ địch, làm chậm tốc độ và khắc chế tuyệt đối loài Rồng và Hắc Ám.',
    statusEffectName: 'Mê Hoặc Tinh Linh (Charm)',
    statusEffectDesc: 'Bụi tiên mê hoặc 3.0s: Giảm 35% tốc độ chạy, 30% tốc độ đánh và tăng +25% sát thương phép nhận vào.',
    buildingEffects: {
      barracks: 'Bụi tiên bảo hộ lính, khiến quái mê muội vung đòn chậm chạp và nhận thêm sát thương.',
      archer: 'Mũi tên sao băng lấp lánh làm mê hoặc quái vật từ xa, vô hiệu hóa đà tiến công.',
      mage: 'Khúc hát tinh linh mê hoặc cả bầy quái, mở đường cho ma pháp kết liễu.',
      artillery: 'Pháo hoa tiên tinh nổ bùng phát bụi tiên rực rỡ khắp chiến trường.'
    },
    combos: [
      { partner: 'LIGHT', reaction: '✨ TỊNH HÓA!', desc: 'Ánh sáng và tiên thuật hòa quyện giải trừ bóng tối +70% sát thương.' },
      { partner: 'GHOST', reaction: '🔮 HUYỀN ẢO', desc: 'Ma mị kết hợp tiên thuật tạo ảo giác bẫy quái vật.' }
    ],
    strongAgainst: [
      { element: 'DRAGON', mult: 2.0, note: 'Khắc tinh tuyệt đối hủy diệt uy lực của loài rồng.' },
      { element: 'DARK', mult: 1.75, note: 'Ánh sáng diệu kỳ của tiên linh xua tan tà ác hắc ám.' }
    ],
    weakAgainstAttack: [
      { element: 'POISON', mult: 0.4, note: 'Khí độc làm hoen ố đôi cánh tiên linh.' },
      { element: 'STEEL', mult: 0.4, note: 'Sắt thép nguội phá vỡ kết cấu phép màu tiên giới.' },
      { element: 'FIRE', mult: 0.5, note: 'Lửa nóng thiêu đốt lớp bụi tiên mong manh.' }
    ],
    weakAgainstDefense: [
      { element: 'STEEL', mult: 2.0, note: 'Sợ nhất vũ khí đao kiếm bằng sắt thép nguội.' },
      { element: 'POISON', mult: 1.8, note: 'Nọc độc hủy hoại sinh mệnh tiên linh.' }
    ],
    sampleMonsters: ['Tiên Linh Hoa Gió', 'Tuyết Yêu Tinh Linh']
  }
};


