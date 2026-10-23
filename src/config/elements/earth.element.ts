import { ElementDefinition } from './types.js';

export const EARTH_ELEMENT: ElementDefinition = {
  element: 'EARTH',
  name: 'Earth',
  nameVi: 'Đất (Thổ)',
  color: '#d97706',
  icon: '🪨',
  badge: 'Địa Chấn Nặng Nề • Khắc Tinh Quái Bộ',
  nature: 'Trọng lượng ngàn cân làm nứt nẻ địa tầng, chuyên trị quái đi bộ và nghiền nát kim loại, sét điện.',
  statusEffectType: 'SLOW',
  effectName: 'Địa Chấn & Làm Chậm (Slow)',
  effectDescription: 'Tạo chấn động làm chậm 35% tốc độ di chuyển trong 2.5s và tăng 35% sát thương lên quái Đi bộ.',
  statusEffectName: 'Địa Chấn & Làm Chậm (Slow)',
  statusEffectDesc: 'Làm chậm 35% tốc độ trong 2.5s; gây thêm +20% sát thương trực tiếp lên quái Đi Bộ (WALK).',
  combatHighlights: [
    'Giảm 35% tốc độ di chuyển của kẻ địch trong 2.5 giây.',
    'Nội tại Địa Chấn: Tự động gây thêm +20% sát thương lên quái vật Đi Bộ (WALK).',
    'Khắc tinh cứng của quái hệ Sét, Lửa, Độc và Thiết Giáp.'
  ],
  combatStats: {
    vsWalkMultiplier: 1.2,
    slowDuration: 2.5,
    slowRatio: 0.35
  },
  buildingEffects: {
    barracks: 'Chiến binh dộng đất tạo chấn động giữ chân và kìm chặt quái vật trên lộ trình.',
    archer: 'Bắn tên đá đè nặng bước tiến quái vật, giảm 35% tốc độ chạy.',
    mage: 'Quả cầu thạch nham chôn vùi đàn quái, bỏ qua phòng thủ.',
    artillery: 'Đại địa chấn Cataclysm nổ lan cực mạnh, quét sạch quái bộ binh.'
  },
  offensiveMatchups: [
    { element: 'LIGHTNING', mult: 1.5, note: 'Đất tiếp đất hấp thu và triệt tiêu tia điện.' },
    { element: 'FIRE', mult: 1.5, note: 'Cát đất dập tắt ngọn lửa rừng rực.' },
    { element: 'POISON', mult: 1.5, note: 'Đất hấp thu độc tố làm trung hòa nọc độc.' },
    { element: 'STEEL', mult: 1.75, note: 'Khối lượng thạch nham nghiền nát giáp sắt.' },
    { element: 'WIND', mult: 1.25, note: 'Đá tảng vững chãi trước cuồng phong.' },
    { element: 'EARTH', mult: 0.3, note: 'Quái Đất hấp thu chấn động cùng hệ, giảm 70% sát thương.' },
    { element: 'GRASS', mult: 0.5, note: 'Rễ cây đâm xuyên qua tầng đất làm suy giảm sát thương.' }
  ],
  defensiveNotes: {
    GRASS: 'Mộc khắc Thổ, rễ cây hút dinh dưỡng đất, nhận x1.75 sát thương.',
    WATER: 'Dòng nước làm xói mòn sạt lở, nhận x1.5 sát thương.'
  },
  sampleMonsters: ['Khổng Lồ Thạch Nham', 'Khối Dung Nham']
};

