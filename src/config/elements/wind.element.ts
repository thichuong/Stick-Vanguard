import { ElementDefinition } from './types.js';

export const WIND_ELEMENT: ElementDefinition = {
  element: 'WIND',
  name: 'Wind',
  nameVi: 'Gió (Phong)',
  color: '#10b981',
  icon: '🌪️',
  badge: 'Xuyên Không Gian • Cuồng Phong Đẩy Lùi',
  nature: 'Lưỡi dao gió xé toạc không gian, có tỉ lệ đẩy lùi mục tiêu về sau trên lộ trình, đặc biệt khắc chế quái bay với tỉ lệ đẩy lùi vượt trội.',
  statusEffectType: 'KNOCKBACK',
  effectName: 'Cuồng Phong & Đẩy Lùi (Knockback)',
  effectDescription: 'Có tỉ lệ đẩy lùi quái vật về sau trên lộ trình (25% quái bộ 12px / 55% quái bay 20px).',
  statusEffectName: 'Cuồng Phong Đẩy Lùi (Knockback)',
  statusEffectDesc: 'Có tỉ lệ đẩy lùi quái ngược lộ trình tiến công (25% tỉ lệ đẩy lùi 12px với quái bộ / 55% tỉ lệ đẩy lùi 20px với quái bay).',
  combatHighlights: [
    'Khống chế không trung: Tỉ lệ đẩy lùi quái Bay (FLY) lên tới 55% với cự ly 20px.',
    'Cơ chế Đẩy Lùi: 25% tỉ lệ đẩy lùi quái bộ 12px trên lộ trình.',
    'Khuếch tán và thổi bùng các hiệu ứng như Thiêu Đốt và Độc Tố.'
  ],
  combatStats: {
    vsFlyMultiplier: 1.0, // Đã bỏ bonus sát thương lên quái bay
    knockbackChanceGround: 0.25,
    knockbackChanceFly: 0.55,
    knockbackDistanceGround: 12,
    knockbackDistanceFly: 20
  },
  buildingEffects: {
    barracks: 'Lính chém kiếm hoặc bắn tên có tỉ lệ đẩy lùi quái vật, quái bay bị đẩy lùi dễ dàng hơn.',
    archer: 'Tháp cung gió liên thanh đẩy lùi quái bay liên tục, không cho tiếp cận căn cứ.',
    mage: 'Lốc xoáy ma thuật cuốn bay quái vật ngược lại điểm xuất phát.',
    artillery: 'Sóng xung kích cuồng phong nổ hất tung quái vật trong bán kính nổ.'
  },
  offensiveMatchups: [
    { element: 'EARTH', mult: 1.5, note: 'Bão cát mài mòn và nâng bổng đất đá.' },
    { element: 'GRASS', mult: 1.5, note: 'Lốc xoáy bẻ gãy cành cây và cuốn phăng lá rụng.' },
    { element: 'PHYSICAL', mult: 1.2, note: 'Luồng gió làm lệch hướng các đòn tấn công thô sơ.' },
    { element: 'WIND', mult: 0.3, note: 'Sinh vật cuồng phong hòa mình vào luồng gió, giảm 70% sát thương.' },
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

