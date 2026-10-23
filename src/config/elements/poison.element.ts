import { ElementDefinition } from './types.js';

export const POISON_ELEMENT: ElementDefinition = {
  element: 'POISON',
  name: 'Poison',
  nameVi: 'Độc (Độc Tố)',
  color: '#a3e635',
  icon: '☠️',
  badge: 'Kịch Độc Cộng Dồn • Suy Yếu Đòn Đánh',
  nature: 'Nọc độc ăn mòn thể xác và tinh thần, gây sát thương DoT cộng dồn liên tục và làm chậm nhịp tung đòn của kẻ địch.',
  statusEffectType: 'POISON',
  effectName: 'Kịch Độc Ăn Mòn (Poison)',
  effectDescription: 'Đầu độc mục tiêu trong 4.0s (DoT cộng dồn tối đa 3 tầng) và làm giảm 20% tốc độ đánh của kẻ địch.',
  statusEffectName: 'Kịch Độc Ăn Mòn (Poison)',
  statusEffectDesc: 'Đầu độc mục tiêu trong 4.0s (DoT cộng dồn tối đa 3 tầng) và làm giảm 20% tốc độ đánh của kẻ địch.',
  combatHighlights: [
    'Kịch độc cộng dồn tối đa 3 tầng trong 4.0 giây.',
    'Rút máu DoT liên tục mỗi 0.5s theo số tầng độc tích lũy.',
    'Làm giảm 20% tốc độ đánh của kẻ địch, bảo vệ lính đỡ đòn.',
    'Khắc tinh của hệ Cỏ (2.0x) và Tiên Tộc (1.8x).'
  ],
  buildingEffects: {
    barracks: 'Lưỡi kiếm tẩm nọc độc làm suy yếu sức mạnh của quái, giảm sát thương quái đánh vào lính.',
    archer: 'Bắn liên hoàn tích lũy 3 tầng kịch độc nhanh chóng lên mục tiêu đơn lẻ.',
    mage: 'Mây độc bốc lên ngột ngạt làm nhiễm độc toàn bộ khu vực đi qua.',
    artillery: 'Bom độc vỡ nát giải phóng chất độc ăn mòn diện rộng.'
  },
  offensiveMatchups: [
    { element: 'GRASS', mult: 2.0, note: 'Chất độc hủy diệt hệ thực vật và mộc tinh.' },
    { element: 'FAIRY', mult: 1.8, note: 'Độc tố làm ô uế và tiêu diệt tinh linh thuần khiết.' },
    { element: 'POISON', mult: 0.3, note: 'Quái hệ Độc miễn nhiễm nọc độc.' },
    { element: 'EARTH', mult: 0.5, note: 'Đất đá trơ lì trước chất độc lỏng.' },
    { element: 'STEEL', mult: 0.2, note: 'Kim loại nhân tạo hoàn toàn kháng độc tố sinh học.' },
    { element: 'GHOST', mult: 0.5, note: 'Hồn ma không có thể xác để bị trúng độc.' }
  ],
  defensiveNotes: {
    EARTH: 'Đất cát chôn vùi làm trung hòa chất độc, nhận x1.5 sát thương.'
  },
  sampleMonsters: ['Nhện Độc Đầm Lầy', 'Dơi Huyết Độc', 'Thủy Quái Kịch Độc']
};

