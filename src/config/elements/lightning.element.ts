import { ElementDefinition } from './types.js';

export const LIGHTNING_ELEMENT: ElementDefinition = {
  element: 'LIGHTNING',
  name: 'Lightning',
  nameVi: 'Sét (Lôi)',
  color: '#f59e0b',
  icon: '⚡',
  badge: 'Tốc Độ Ánh Sáng • Sốc Điện & Giật Lan',
  nature: 'Nguồn năng lượng chớp giật tốc độ cao, ngắt nhịp tung đòn của quái bằng choáng và nảy tia điện diệt bầy đàn.',
  statusEffectType: 'SHOCK',
  effectName: 'Tê Liệt & Giật Lan (Shock)',
  effectDescription: 'Gây choáng ngắn 0.35s và phóng tia điện giật lan sang 1 kẻ địch kế bên (35% DMG).',
  statusEffectName: 'Tê Liệt & Giật Lan (Shock)',
  statusEffectDesc: 'Gây choáng 0.35s ngắt đòn quái và phóng tia sét nảy sang kẻ địch kế bên gây 35% sát thương.',
  combatHighlights: [
    'Ngắt chiêu và khống chế: Gây choáng 0.35s, ngắt đòn đánh của kẻ địch.',
    'Sát thương giật lan: Phóng tia sét nảy sang kẻ địch lân cận với 35% sát thương gốc.',
    'Khắc tinh tuyệt đối của Thủy quái (2.0x) và dẫn điện qua Giáp Thép (1.3x).'
  ],
  combatStats: {
    statusDuration: 0.35,
    statusValue: 0.35,
    chainDamageRatio: 0.35,
    chainRange: 110
  },
  buildingEffects: {
    barracks: 'Mỗi cú chém hoặc mũi tên làm tê liệt quái vật và giật tia sét sang mục tiêu bên cạnh.',
    archer: 'Bắn tỉa lôi điện liên hoàn, dọn dẹp bầy quái nhỏ siêu tốc.',
    mage: 'Phóng tia chớp chuỗi (Chain Lightning) nảy qua 4-5 mục tiêu liên tiếp.',
    artillery: 'Pháo EMP từ trường phát nổ làm choáng hàng loạt quái vật cùng lúc.'
  },
  offensiveMatchups: [
    { element: 'WATER', mult: 2.0, note: 'Khắc chế tuyệt đối thủy quái bơi sông và sinh vật nước.' },
    { element: 'WIND', mult: 1.5, note: 'Đánh trúng các sinh vật bay lượn trên bầu trời.' },
    { element: 'STEEL', mult: 1.3, note: 'Dẫn điện xuyên qua bộ giáp kim loại nung nóng kẻ địch.' },
    { element: 'EARTH', mult: 0.3, note: 'Quái Đất tiếp đất hoàn toàn triệt tiêu dòng điện.' },
    { element: 'LIGHTNING', mult: 0.3, note: 'Quái Lôi hấp thụ dòng điện.' },
    { element: 'GRASS', mult: 0.5, note: 'Gỗ khô cách điện làm suy yếu tia sét.' },
    { element: 'DRAGON', mult: 0.5, note: 'Vảy rồng cổ đại cách điện kiên cố.' }
  ],
  defensiveNotes: {
    EARTH: 'Đất đá triệt tiêu và tiêu biến nguồn năng lượng sét, nhận x1.5 sát thương.'
  },
  sampleMonsters: ['Lươn Điện Thủy Tộc', 'Tiên Cá Gọi Bão']
};

