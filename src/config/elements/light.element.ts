import { ElementDefinition } from './types.js';
import { LIGHT_SVG } from './icons/index.js';

export const LIGHT_ELEMENT: ElementDefinition = {
  element: 'LIGHT',
  name: 'Light',
  nameVi: 'Ánh Sáng (Quang)',
  color: '#fef08a',
  icon: LIGHT_SVG,
  iconSvg: LIGHT_SVG,
  iconPath: 'src/config/elements/icons/light.svg',
  badge: 'Thần Thánh • Hồi Máu & Thanh Tẩy',
  nature: 'Hào quang rực rỡ bảo hộ sinh mạng đồng minh, hồi phục vết thương và thanh tẩy bóng tối ma quỷ.',
  effectName: 'Thánh Quang & Hồi Phục (Holy)',
  effectDescription: 'Khắc chế x2.0 sát thương hệ Tối và Ma; đòn đánh của Lính tự hồi 5 HP cho bản thân.',
  statusEffectName: 'Thánh Quang Hồi Máu (Holy)',
  statusEffectDesc: 'Đòn đánh của Lính tự hồi +5 HP; gây x2.0 sát thương và thiêu đốt thánh quang 2.5s lên quái Tối & Ma.',
  combatHighlights: [
    'Hồi phục sinh mệnh: Mỗi đòn đánh của Lính tự động hồi +5 HP cho bản thân.',
    'Thanh tẩy bóng tối: Gây x2.0 sát thương và áp dụng thiêu đốt thánh quang 2.5s lên quái hệ Tối và Ma.',
    'Là khắc tinh tối thượng của quân đoàn Hư Vô, Chiêu Hồn Sư và Tử Thần.'
  ],
  combatStats: {
    soldierHealOnHit: 5,
    statusDuration: 2.5,
    dotTickInterval: 0.5,
    dotDamageRatio: 0.25,
    dotMinDamage: 6
  },
  buildingEffects: {
    barracks: 'Mỗi đòn chém hoặc mũi tên tự động hồi +5 HP cho Lính, biến lính thành pháo đài bất tử.',
    archer: 'Bắn tỉa thanh tẩy quái Hắc Ám từ khoảng cách an toàn.',
    mage: 'Chiếu rọi cột sáng thánh quang thiêu rụi đội hình quỷ dữ.',
    artillery: 'Nổ chùm ánh sáng thanh tẩy diện rộng, xua tan bóng đêm u ám.'
  },
  offensiveMatchups: [
    { element: 'DARK', mult: 2.0, note: 'Ánh sáng thanh tẩy xua tan bóng tối và ma vương.' },
    { element: 'GHOST', mult: 1.8, note: 'Thánh quang thanh tẩy vong linh u hồn.' },
    { element: 'LIGHT', mult: 0.3, note: 'Sinh vật ánh sáng hấp thụ quang năng.' },
    { element: 'STEEL', mult: 0.5, note: 'Mặt gương thép phản chiếu tia sáng.' }
  ],
  defensiveNotes: {
    DARK: 'Bóng tối ăn mòn quang năng, nhận x1.8 sát thương.'
  },
  sampleMonsters: ['Chiến Binh Ánh Sáng', 'Thánh Kỵ Sĩ']
};

