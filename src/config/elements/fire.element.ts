import { ElementDefinition } from './types.js';
import { FIRE_SVG } from './icons/index.js';

export const FIRE_ELEMENT: ElementDefinition = {
  element: 'FIRE',
  name: 'Fire',
  nameVi: 'Lửa (Hỏa)',
  color: '#ef4444',
  icon: FIRE_SVG,
  iconSvg: FIRE_SVG,
  iconPath: 'src/config/elements/icons/fire.svg',
  badge: 'Thiêu Đốt DoT • Bùng Nổ Nham Thạch',
  nature: 'Nhiệt năng cuồng nộ thiêu rụi mục tiêu theo thời gian, có thể kích nổ cực mạnh khi gặp Độc tố và Cỏ cây.',
  statusEffectType: 'BURN',
  effectName: 'Thiêu Đốt (Burn)',
  effectDescription: 'Đốt cháy mục tiêu, gây sát thương Lửa liên tục mỗi 0.5s trong 3s (bỏ qua giáp).',
  statusEffectName: 'Thiêu Đốt (Burn)',
  statusEffectDesc: 'Đốt cháy mục tiêu trong 3.0s, mỗi 0.5s rút máu 20% sát thương gốc (tổng 6 nhịp = 120% DMG, bỏ qua giáp).',
  combatHighlights: [
    'DoT thiêu đốt duy trì 3.0 giây, gây sát thương mỗi 0.5s (tổng cộng 6 lần).',
    'Sát thương thiêu đốt bỏ qua hoàn toàn chỉ số Giáp của quái vật.',
    'Kích nổ cực mạnh khi gặp trạng thái Độc (Bùng Cháy +70%) hoặc Dây Leo (Rực Lửa +65%).'
  ],
  combatStats: {
    statusDuration: 3.0,
    dotTickInterval: 0.5,
    dotDamageRatio: 0.2,
    dotMinDamage: 5
  },
  buildingEffects: {
    barracks: 'Lưỡi kiếm và mũi tên rực lửa liên tục duy trì trạng thái bốc cháy lên quái bị chặn.',
    archer: 'Mưa tên lửa duy trì thiêu đốt 100% thời gian, bào mòn cực nhanh quái trâu máu.',
    mage: 'Quả cầu lửa nổ lan diện rộng kèm thiêu đốt toàn bộ đàn quái xung quanh.',
    artillery: 'Biển lửa Napalm diện rộng bao phủ mặt đất, nung chín đàn quái đông đúc.'
  },
  offensiveMatchups: [
    { element: 'GRASS', mult: 2.0, note: 'Khắc chế tuyệt đối: Thiêu rụi hoàn toàn quái Mộc tinh và thảo mộc thành tro bụi.' },
    { element: 'ICE', mult: 1.75, note: 'Hơi nóng làm tan chảy khối băng của Khổng Lồ Băng.' },
    { element: 'STEEL', mult: 1.75, note: 'Nhiệt lượng cao nung chảy giáp thép của quân đoàn cơ giới.' },
    { element: 'WIND', mult: 1.3, note: 'Ngọn lửa lan theo chiều gió gây sát thương tăng cường.' },
    { element: 'FIRE', mult: 0.3, note: 'Quái hệ Lửa hấp thụ nhiệt năng, giảm 70% sát thương.' },
    { element: 'WATER', mult: 0.5, note: 'Dòng nước dập tắt ngọn lửa nhanh chóng.' },
    { element: 'DRAGON', mult: 0.5, note: 'Vảy rồng cổ đại kháng nhiệt cao cản phá lửa.' }
  ],
  defensiveNotes: {
    WATER: 'Sợ nhất Thủy lôi và sóng nước dội vào, nhận x2.0 sát thương.',
    EARTH: 'Cát đất dập tắt nguồn oxy nuôi lửa, nhận x1.5 sát thương.'
  },
  sampleMonsters: ['Tiểu Quỷ Hỏa Diệm', 'Khối Dung Nham Phân Tách']
};

