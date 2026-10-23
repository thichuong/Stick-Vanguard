import { ElementDefinition } from './types.js';

export const DARK_ELEMENT: ElementDefinition = {
  element: 'DARK',
  name: 'Dark',
  nameVi: 'Hắc Ám (Ám)',
  color: '#8b5cf6',
  icon: '🔮',
  badge: 'Ăn Mòn Tâm Linh • Khuếch Đại Toàn Diện',
  nature: 'Năng lượng hư vô bóng tối gặm nhấm phòng ngự, khắc dấu ấn nguyền rủa khiến kẻ địch chịu thêm sát thương từ mọi nguồn.',
  statusEffectType: 'CURSE',
  effectName: 'Nguyền Rủa Suy Yếu (Curse)',
  effectDescription: 'Khắc dấu ấn Nguyền Rủa 3.5s khiến quái nhận thêm +35% sát thương từ mọi nguồn.',
  statusEffectName: 'Nguyền Rủa Suy Yếu (Curse)',
  statusEffectDesc: 'Khắc dấu ấn Nguyền Rủa 3.5s khiến quái nhận thêm +35% sát thương từ MỌI NGUỒN (Tháp, Lính, Bẫy).',
  combatHighlights: [
    'Dấu ấn Nguyền Rủa (Curse) 3.5s: Quái nhận thêm +35% sát thương từ mọi nguồn tấn công.',
    'Phối hợp Ám + Ma: Bùng nổ sát thương Minh Giới Ám Hồn, cường hóa trảm sát cực mạnh.',
    'Phối hợp Ám + Các nguyên tố khác (trừ Tiên, Quang): Tạo hiệu ứng Hắc Ám Thôn Phệ tăng sát thương và ăn mòn.'
  ],
  combatStats: {
    statusDuration: 3.5,
    statusValue: 0.35,
    damageAmp: 0.35
  },
  buildingEffects: {
    barracks: 'Chiến binh nguyền rủa quái vật bị chặn, hỗ trợ toàn bộ tháp khác dồn sát thương kết liễu.',
    archer: 'Bắn tỉa điểm huyệt nguyền rủa quái đầu đàn từ xa.',
    mage: 'Cầu ma thuật hắc ám bùng nổ bỏ qua 100% giáp vật lý.',
    artillery: 'Vụ nổ bóng tối nguyền rủa toàn bộ quân địch trong bán kính nổ.'
  },
  offensiveMatchups: [
    { element: 'LIGHT', mult: 1.8, note: 'Bóng tối nuốt chửng ánh sáng và tha hóa quang năng.' },
    { element: 'GHOST', mult: 1.8, note: 'Hắc ám áp chế linh hồn phiêu bạt.' },
    { element: 'DARK', mult: 0.3, note: 'Quái vật hắc ám miễn nhiễm bóng tối.' },
    { element: 'FAIRY', mult: 0.5, note: 'Phép thuật tiên linh thuần khiết xua đuổi bóng tối.' }
  ],
  defensiveNotes: {
    LIGHT: 'Sợ nhất thánh quang rọi chiếu thanh tẩy, nhận x2.0 sát thương.',
    FAIRY: 'Bụi tiên thanh lọc năng lượng hắc ám, nhận x1.75 sát thương.'
  },
  sampleMonsters: ['Hồn Ma Hư Vô', 'Pháp Sư Chiêu Hồn', 'Đại Hắc Long Ma Vương']
};

