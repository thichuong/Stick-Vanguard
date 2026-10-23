import { ElementDefinition } from './types.js';

export const WIND_ELEMENT: ElementDefinition = {
  element: 'WIND',
  name: 'Wind',
  nameVi: 'Gió (Phong)',
  color: '#10b981',
  icon: '🌪️',
  badge: 'Xuyên Không Gian • Khắc Tinh Quái Bay',
  nature: 'Lưỡi dao gió xé toạc không gian, đẩy lùi mục tiêu và gây sát thương vượt trội lên toàn bộ sinh vật bay lượn.',
  statusEffectType: 'KNOCKBACK',
  effectName: 'Cuồng Phong & Đẩy Lùi (Knockback)',
  effectDescription: 'Gây thêm x1.5 sát thương lên quái Bay và đẩy lùi quái vật về sau trên lộ trình (15px bộ / 25px bay).',
  statusEffectName: 'Cuồng Phong Đẩy Lùi (Knockback)',
  statusEffectDesc: 'Đẩy lùi quái ngược lộ trình tiến công (15px bộ / 25px bay); tăng +50% sát thương lên quái Bay (FLY).',
  combatHighlights: [
    'Khắc tinh số 1 của quái Bay: Tăng vĩnh viễn +50% sát thương lên quái vật hệ Bay (FLY).',
    'Cơ chế Đẩy Lùi: Đẩy quái bộ lùi lại 15px, quái bay lùi lại 25px trên lộ trình.',
    'Khuếch tán và thổi bùng các hiệu ứng như Thiêu Đốt và Độc Tố.'
  ],
  buildingEffects: {
    barracks: 'Lính chém kiếm đẩy lùi quái bộ; nếu chuyển sang Lính Bắn Tên sẽ bắn rụng quái bay và đẩy lùi 25px.',
    archer: 'Tháp cung gió liên thanh đẩy lùi quái bay liên tục, không cho tiếp cận căn cứ.',
    mage: 'Lốc xoáy ma thuật cuốn bay cả đàn quái vật ngược lại điểm xuất phát.',
    artillery: 'Sóng xung kích cuồng phong nổ hất tung toàn bộ quái vật trong bán kính nổ.'
  },
  offensiveMatchups: [
    { element: 'EARTH', mult: 1.5, note: 'Bão cát mài mòn và nâng bổng đất đá.' },
    { element: 'GRASS', mult: 1.5, note: 'Lốc xoáy bẻ gãy cành cây và cuốn phăng lá rụng.' },
    { element: 'PHYSICAL', mult: 1.2, note: 'Luồng gió làm lệch hướng các đòn tấn công thô sơ.' },
    { element: 'STEEL', mult: 0.5, note: 'Giáp thép quá nặng không bị gió lay chuyển.' },
    { element: 'ICE', mult: 0.5, note: 'Băng giá làm lạnh đông cứng luồng không khí.' }
  ],
  defensiveNotes: {
    LIGHTNING: 'Bão gió kích hoạt sấm sét đánh trúng, nhận x1.5 sát thương.',
    ICE: 'Hàn băng đóng băng luồng khí, nhận x1.5 sát thương.',
    FIRE: 'Gió bị lửa nuốt chửng dưỡng khí, nhận x1.3 sát thương.'
  },
  sampleMonsters: ['Người Que Dơi Phong Thần', 'Mảnh Băng Tinh']
};

