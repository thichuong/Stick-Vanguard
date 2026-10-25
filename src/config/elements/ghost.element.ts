import { ElementDefinition } from './types.js';
import { GHOST_SVG } from './icons/index.js';

export const GHOST_ELEMENT: ElementDefinition = {
  element: 'GHOST',
  name: 'Ghost',
  nameVi: 'Ma (U Hồn)',
  color: '#c084fc',
  icon: GHOST_SVG,
  iconSvg: GHOST_SVG,
  iconPath: 'src/config/elements/icons/ghost.svg',
  badge: 'Xuyên Thấu Vật Lý • Trảm Sát Theo % Máu',
  nature: 'Linh hồn hư ảo phiêu bạt xuyên qua chướng ngại vật lý, tấn công trực diện vào linh hồn và kết liễu kẻ địch suy yếu.',
  statusEffectType: 'SOUL_DRAIN',
  effectName: 'Ám Hồn & Trảm Sát (Soul Drain)',
  effectDescription: 'Đòn đánh tâm linh xuyên kháng gây thêm sát thương chuẩn dựa theo % Máu Đã Mất của quái và làm quái hoảng sợ giật lùi nhẹ.',
  statusEffectName: 'Ám Hồn & Trảm Sát (Soul Drain)',
  statusEffectDesc: 'Đòn đánh xuyên kháng gây thêm sát thương chuẩn dựa theo % Máu Đã Mất của quái và làm quái hoảng sợ giật lùi.',
  combatHighlights: [
    'Trảm Sát theo % Máu Đã Mất: Kẻ địch càng ít máu, sát thương nhận vào càng tăng vọt (lên tới +40%).',
    'Hoảng sợ giật lùi: Đẩy lùi kẻ địch ngược lại 10px trên lộ trình.',
    'Phối hợp cực mạnh với Hắc Ám (Ám + Ma) tạo phản ứng Minh Giới Ám Hồn hủy diệt.'
  ],
  combatStats: {
    statusDuration: 3.0,
    statusValue: 0.2,
    missingHpDamageRatio: 0.4,
    knockbackChanceGround: 1.0,
    knockbackDistanceGround: 10
  },
  buildingEffects: {
    barracks: 'Lưỡi kiếm ma thuật chém trực tiếp vào linh hồn, quái càng mất nhiều máu chém càng đau.',
    archer: 'Mũi tên u hồn xuyên thấu qua lớp giáp dày, gieo rắc nỗi sợ hãi.',
    mage: 'Cột khói linh hồn nuốt chửng sinh mệnh của bầy quái vật.',
    artillery: 'Đại bác ma ám phát nổ sóng âm linh hồn làm hoảng loạn cả khu vực.'
  },
  offensiveMatchups: [
    { element: 'GHOST', mult: 1.8, note: 'U hồn tương khắc nuốt chửng linh hồn lẫn nhau.' },
    { element: 'DARK', mult: 1.4, note: 'Vong linh quấy rối nguồn năng lượng bóng tối.' },
    { element: 'PHYSICAL', mult: 0.2, note: 'Khó gây sát thương thuần lên các cấu trúc vật chất cứng.' },
    { element: 'POISON', mult: 0.5, note: 'Chất độc vô hiệu trước linh hồn vô thực.' }
  ],
  defensiveNotes: {
    LIGHT: 'Sợ nhất ánh sáng thần thánh thanh tẩy, nhận x1.8 sát thương.',
    DARK: 'Bị ma vương hắc ám áp chế linh hồn, nhận x1.8 sát thương.'
  },
  sampleMonsters: ['U Hồn Tử Thần', 'Oán Hồn Không Trung', 'Hồn Ma Hư Vô']
};

