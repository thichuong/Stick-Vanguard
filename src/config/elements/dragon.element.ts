import { ElementDefinition } from './types.js';
import { DRAGON_SVG } from './icons/index.js';

export const DRAGON_ELEMENT: ElementDefinition = {
  element: 'DRAGON',
  name: 'Dragon',
  nameVi: 'Rồng (Long)',
  color: '#f97316',
  icon: DRAGON_SVG,
  iconSvg: DRAGON_SVG,
  iconPath: 'src/config/elements/icons/dragon.svg',
  badge: 'Long Uy Bá Đạo • Diệt Trùm & Tinh Anh',
  nature: 'Uy lực của loài sinh vật đứng đầu chuỗi thức ăn, áp chế toàn bộ kẻ địch, giảm sát thương của quái, bạo kích lên Boss và tăng uy lực cho các nguyên tố khác.',
  statusEffectType: 'DRAGON_AWE',
  effectName: 'Long Uy Áp Chế (Dragon Awe)',
  effectDescription: 'Tỏa ra uy áp của loài rồng trong 3.5s: Giảm 25% sát thương đòn đánh của quái và gây thêm +35% sát thương lên Boss và quái Tinh Anh.',
  statusEffectName: 'Long Uy Áp Chế (Dragon Awe)',
  statusEffectDesc: 'Áp chế trong 3.5s: Giảm 25% sát thương của quái, gây thêm +35% sát thương lên Boss và quái Tinh Anh, đồng thời tăng uy lực cho các nguyên tố khác phối hợp.',
  combatHighlights: [
    'Giảm 25% sát thương đòn đánh của quái vật trong 3.5 giây.',
    'Sát Thủ Diệt Boss: Gây thêm +35% sát thương lên quái Boss và Tinh Anh (ELITE).',
    'Long Uy Khuếch Đại: Giúp tăng uy lực cho mọi nguyên tố khác khi phối hợp (Long Hỏa, Long Thủy, Long Lôi, Hàn Long, Phong Long, Địa Long, Thiết Long...).'
  ],
  combatStats: {
    statusDuration: 3.5,
    statusValue: 0.25,
    enemyDamageReduction: 0.25,
    damageAmp: 0.25,
    vsBossEliteMultiplier: 1.35
  },
  buildingEffects: {
    barracks: 'Hào quang rồng bảo hộ chiến binh, giảm 25% đòn đánh của quái và dập tan Boss mặt đất.',
    archer: 'Bắn ra những mũi tên hình đầu rồng gầm thét, xé toạc các sinh vật khổng lồ.',
    mage: 'Triệu hồi hơi thở của rồng (Dragon Breath) quét sạch kẻ địch trong tầm mắt.',
    artillery: 'Long hỏa đại pháo nổ long trời lở đất, làm run sợ muôn loài.'
  },
  offensiveMatchups: [
    { element: 'DRAGON', mult: 1.8, note: 'Long tộc tương tàn, uy lực đè bẹp lẫn nhau.' },
    { element: 'FIRE', mult: 1.2, note: 'Áp chế các loài quái lửa thông thường.' },
    { element: 'WATER', mult: 1.2, note: 'Chế ngự loài thủy quái dưới nước.' },
    { element: 'GRASS', mult: 1.2, note: 'Nghiền nát thảm thực vật cây cối.' },
    { element: 'LIGHTNING', mult: 1.2, note: 'Vượt qua sấm sét thiên nhiên.' },
    { element: 'STEEL', mult: 0.5, note: 'Vũ khí diệt rồng bằng thép nguội cản phá vuốt rồng.' },
    { element: 'FAIRY', mult: 0.3, note: 'Phép thuật tiên linh hoàn toàn miễn nhiễm uy áp loài rồng.' },
    { element: 'ICE', mult: 0.5, note: 'Băng giá buốt lạnh làm đóng băng hơi thở rồng.' }
  ],
  defensiveNotes: {
    FAIRY: 'Sợ nhất phép thuật cổ xưa của Tiên tộc, nhận x2.0 sát thương.',
    ICE: 'Máu nóng của rồng cực kỳ sợ hàn băng đóng băng cơ thể, nhận x2.0 sát thương.',
    DRAGON: 'Bị sát thương từ loài rồng khác khắc chế, nhận x1.8 sát thương.'
  },
  sampleMonsters: ['Long Nhân Chiến Sĩ', 'Phi Long Xung Kích', 'Giao Long Sông Sâu', 'Đại Hắc Long Ma Vương']
};

