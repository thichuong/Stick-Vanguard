import { ElementDefinition } from './types.js';

export const PHYSICAL_ELEMENT: ElementDefinition = {
  element: 'PHYSICAL',
  name: 'Physical',
  nameVi: 'Vật Lý',
  color: '#e2e8f0',
  icon: '⚔️',
  badge: 'Cơ Bản • Vũ Khí Thép & Đá',
  nature: 'Sát thương cơ bản từ kiếm khiên, cung tên và đạn pháo cối thô sơ. Vững chắc, ổn định, không tốn mana nhưng chịu giảm trừ trước giáp dày hoặc thể vô hình.',
  effectName: 'Không (Sát thương Thuần Túy)',
  effectDescription: 'Gây sát thương trực tiếp lên lượng máu mục tiêu, chịu ảnh hưởng bởi chỉ số Giáp (Armor) của quái vật.',
  statusEffectName: 'Không (Sát thương Thuần Túy)',
  statusEffectDesc: 'Đòn đánh vật lý tiêu chuẩn, không gắn hiệu ứng DoT hay khống chế nhưng được tăng cường khi kết hợp với bùa chú nguyên tố.',
  combatHighlights: [
    'Sát thương nền tảng của Trại Dân Quân, Tháp Cung Thủ và Pháo Cối.',
    'Chịu giảm trừ trực tiếp bởi chỉ số Giáp (% Armor) của quái vật.',
    'Bị giảm sát thương nghiêm trọng trước quái Đất (0.7x), Thép (0.5x) và gần như vô hiệu trước U Hồn (0.2x).'
  ],
  combatStats: {},
  buildingEffects: {
    barracks: 'Chiến binh chém kiếm 1v1 hoặc xạ thủ bắn tên lao tầm xa gây 100% sát thương cơ bản.',
    archer: 'Bắn tên vật lý tốc độ cao liên tục vào mục tiêu gần nhất hoặc đi đầu.',
    mage: 'Phù Thủy chuyển hóa thành ma thuật, không gây sát thương thuần vật lý.',
    artillery: 'Ném đạn pháo cối phát nổ diện rộng gây 100% sát thương nổ vật lý chạm đất.'
  },
  offensiveMatchups: [
    { element: 'EARTH', mult: 0.7, note: 'Khổng Lồ Đất có lớp da đá dày cản phá đòn đánh thông thường.' },
    { element: 'STEEL', mult: 0.5, note: 'Quân đoàn thiết giáp sở hữu giáp thép nặng giảm 50% sát thương chém đâm.' },
    { element: 'GHOST', mult: 0.2, note: 'Hồn ma dạng khí thể phi vật chất, giảm 80% sát thương đòn đánh thô sơ.' }
  ],
  defensiveNotes: {
    WIND: 'Gió lốc xé rách đội hình phòng thủ vật chất thô sơ.',
    PHYSICAL: 'Nhận 100% sát thương từ các đòn vật lý thông thường.'
  },
  sampleMonsters: ['Người Que Chạy Nhanh', 'Người Que Kiếm Sĩ']
};

