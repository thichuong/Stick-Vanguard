import { ElementDefinition } from './types.js';

export const WATER_ELEMENT: ElementDefinition = {
  element: 'WATER',
  name: 'Water',
  nameVi: 'Nước (Thủy)',
  color: '#3b82f6',
  icon: '💧',
  badge: 'Ẩm Ướt Trì Hoãn • Dẫn Truyền Ma Pháp',
  nature: 'Áp lực nước dập tắt ngọn lửa, làm ẩm ướt mục tiêu để làm bệ phóng kích hoạt các phản ứng Sét, Băng và Mộc.',
  statusEffectType: 'WET',
  effectName: 'Ẩm Ướt & Trì Hoãn (Wet)',
  effectDescription: 'Làm ướt mục tiêu trong 4s (tăng mạnh sát thương Sét x1.75, Băng x1.5, Cỏ x1.6) và giảm 20% tốc độ di chuyển.',
  statusEffectName: 'Ẩm Ướt & Trì Hoãn (Wet)',
  statusEffectDesc: 'Làm chậm 20% trong 2.5s và bao phủ lớp nước trong 4.0s (tăng sát thương Sét x1.75, Băng x1.5, Cỏ x1.6).',
  combatHighlights: [
    'Bao phủ lớp nước trong 4.0 giây giúp khuếch đại sát thương Sét (+75%), Băng (+50%), Cỏ (+60%).',
    'Kèm hiệu ứng làm chậm tốc độ di chuyển 20% trong 2.5s.',
    'Là chất dẫn truyền cốt lõi của đội hình đóng băng và sốc điện diện rộng.'
  ],
  combatStats: {
    statusDuration: 4.0,
    slowDuration: 2.5,
    slowRatio: 0.2
  },
  buildingEffects: {
    barracks: 'Đòn đánh phủ ướt kẻ địch, mở đường cho Tháp Sét hoặc Tháp Băng phía sau xả sát thương combo.',
    archer: 'Bắn tỉa phủ Ẩm Ướt liên tục lên quái đầu đàn với tầm bắn cực xa.',
    mage: 'Sóng triều ma thuật quét qua hàng ngũ địch, làm ướt hàng loạt mục tiêu cùng lúc.',
    artillery: 'Thủy lôi đại bác dội nước áp lực lớn phủ ướt toàn bộ bán kính nổ 75px.'
  },
  offensiveMatchups: [
    { element: 'FIRE', mult: 2.0, note: 'Khắc chế hủy diệt quái Lửa và dung nham.' },
    { element: 'EARTH', mult: 1.5, note: 'Làm xói mòn và nhão bùn đất đá.' },
    { element: 'STEEL', mult: 1.3, note: 'Nước làm rỉ sét kim loại gây tổn hại kết cấu giáp.' },
    { element: 'WATER', mult: 0.3, note: 'Thủy quái miễn nhiễm đòn đánh cùng hệ.' },
    { element: 'LIGHTNING', mult: 0.5, note: 'Sét đánh ngược dòng làm hao hụt áp lực nước.' },
    { element: 'GRASS', mult: 0.5, note: 'Cỏ cây hút cạn dòng nước.' },
    { element: 'DRAGON', mult: 0.5, note: 'Long tộc bơi lội và lướt qua dòng nước dễ dàng.' }
  ],
  defensiveNotes: {
    LIGHTNING: 'Dẫn điện cực mạnh, nhận x2.0 sát thương từ Lôi điện.',
    GRASS: 'Cây cỏ cắm rễ hút cạn sinh lực, nhận x1.8 sát thương.',
    ICE: 'Dễ bị đóng băng hóa đá, nhận x1.3 sát thương.'
  },
  sampleMonsters: ['Thủy Xà Sông Sâu', 'Tiên Cá Gọi Bão', 'Lươn Điện Thủy Tộc']
};

