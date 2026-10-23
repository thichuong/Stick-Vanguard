import { ElementDefinition } from './types.js';

export const GRASS_ELEMENT: ElementDefinition = {
  element: 'GRASS',
  name: 'Grass',
  nameVi: 'Cỏ (Mộc)',
  color: '#22c55e',
  icon: '🌿',
  badge: 'Dây Leo Trói Chân • Hút Nhựa Sống',
  nature: 'Sức sống mãnh liệt của thiên nhiên cây cỏ, triệu hồi rễ cây trói chặt bước chân kẻ địch và hút sinh lực tiếp tế đồng minh.',
  statusEffectType: 'ROOT',
  effectName: 'Trói Buộc & Hút Sinh Lực (Root)',
  effectDescription: 'Dây leo làm chậm 30% trong 3.0s, có 30% tỉ lệ trói chân bất động 1.0s và hút nhựa sống tự hồi 3 HP cho Lính.',
  statusEffectName: 'Trói Buộc & Hút Nhựa Sống (Root)',
  statusEffectDesc: 'Làm chậm 30% trong 3.0s, có 30% tỉ lệ trói chân bất động 1.0s và hút nhựa sống tự hồi +3 HP cho Lính.',
  combatHighlights: [
    'Khống chế dây leo: Làm chậm 30% trong 3.0s, có 30% xác suất trói chân bất động 1.0s.',
    'Hút nhựa sống: Đòn đánh của Lính tự động hồi +3 HP cho bản thân.',
    'Khắc tinh tuyệt hảo của Thủy quái (1.8x) và Khổng Lồ Đất (1.75x).'
  ],
  combatStats: {
    slowDuration: 3.0,
    slowRatio: 0.3,
    procChance: 0.3,
    procDuration: 1.0,
    soldierHealOnHit: 3
  },
  buildingEffects: {
    barracks: 'Dây leo gai góc mọc lên dưới chân quái, vừa trói chân vừa hút máu hồi phục cho 3 chiến binh.',
    archer: 'Mũi tên mộc tinh cắm rễ làm chậm và trói chặt quái chạy nhanh trên đường.',
    mage: 'Gai nhọn thiên nhiên đâm xuyên qua đội hình địch, trói chân hàng loạt quái vật.',
    artillery: 'Đại bác nụ hoa phát nổ rải gai và dây leo bao phủ toàn bộ vùng nổ.'
  },
  offensiveMatchups: [
    { element: 'WATER', mult: 1.8, note: 'Cây cối cắm rễ hút cạn nguồn nước của thủy quái.' },
    { element: 'EARTH', mult: 1.75, note: 'Mộc khắc Thổ, rễ cây đâm nứt toác đá tảng.' },
    { element: 'FIRE', mult: 0.4, note: 'Lửa thiêu đốt cành cây thành tro bụi.' },
    { element: 'POISON', mult: 0.4, note: 'Chất độc làm khô héo thảm thực vật.' },
    { element: 'STEEL', mult: 0.4, note: 'Rìu thép chặt đứt cành cây dễ dàng.' },
    { element: 'DRAGON', mult: 0.5, note: 'Hơi thở rồng nghiền nát cây cối.' },
    { element: 'GRASS', mult: 0.3, note: 'Cùng hệ cây cỏ đề kháng cao.' }
  ],
  defensiveNotes: {
    FIRE: 'Sợ nhất các đòn tấn công thiêu đốt, nhận x2.0 sát thương.',
    POISON: 'Thuốc độc làm thối rữa tế bào thực vật, nhận x2.0 sát thương.',
    ICE: 'Băng tuyết làm đông cứng héo rũ cây cối, nhận x1.8 sát thương.'
  },
  sampleMonsters: ['Mộc Tinh Chiến Binh', 'Rùa Rêu Suối Nguồn']
};

