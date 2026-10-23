import { ElementDefinition } from './types.js';

export const STEEL_ELEMENT: ElementDefinition = {
  element: 'STEEL',
  name: 'Steel',
  nameVi: 'Thép (Kim)',
  color: '#94a3b8',
  icon: '⚙️',
  badge: 'Trọng Thiết Phá Giáp • Nghiền Nát Phòng Thủ',
  nature: 'Kim loại tôi luyện cứng cáp và nặng nề, nghiền nát lớp phòng ngự hộ thân và bẻ gãy băng tuyết, tiên tộc.',
  statusEffectType: 'SUNDER',
  effectName: 'Phá Giáp & Trọng Kích (Sunder)',
  effectDescription: 'Nghiền nát lớp giáp hộ thân trong 4.0s: Khiến quái nhận thêm +30% sát thương từ mọi nguồn và vô hiệu hóa kháng vật lý.',
  statusEffectName: 'Phá Giáp & Trọng Kích (Sunder)',
  statusEffectDesc: 'Nghiền nát giáp trong 4.0s: Quái nhận thêm +30% sát thương từ mọi nguồn và mất kháng vật lý.',
  combatHighlights: [
    'Trạng thái Phá Giáp (Sunder) 4.0s: Quái nhận thêm +30% sát thương từ mọi nguồn.',
    'Vô hiệu hóa chỉ số kháng vật lý của quái vật bọc thép.',
    'Khắc tinh số 1 của Tiên Linh (2.0x) và Băng Tuyết (1.8x).'
  ],
  combatStats: {
    statusDuration: 4.0,
    statusValue: 0.3,
    damageAmp: 0.3,
    bypassPhysicalResist: true
  },
  buildingEffects: {
    barracks: 'Chiến binh vung đại đao phá vỡ giáp quái, tạo cơ hội cho đồng minh dứt điểm nhanh.',
    archer: 'Bắn tên xuyên giáp phá hủy lớp vỏ cứng của quái thiết giáp.',
    mage: 'Bắn ra những lưỡi dao ma pháp kim loại chém rách mọi lớp khiên.',
    artillery: 'Đạn pháo thép nguyên khối dập nát đội hình quái vật nặng ký.'
  },
  offensiveMatchups: [
    { element: 'FAIRY', mult: 2.0, note: 'Sắt thép nguội lạnh là khắc tinh số 1 của loài tiên linh.' },
    { element: 'ICE', mult: 1.8, note: 'Búa thép đập vỡ vụn tinh thể băng tuyết.' },
    { element: 'EARTH', mult: 1.2, note: 'Mũi khoan thép đục thủng đá tảng.' },
    { element: 'FIRE', mult: 0.5, note: 'Lửa nung chảy vũ khí kim loại.' },
    { element: 'STEEL', mult: 0.3, note: 'Thép đánh thép bị dội đòn.' },
    { element: 'WATER', mult: 0.6, note: 'Dòng nước làm giảm động năng của thép.' }
  ],
  defensiveNotes: {
    FIRE: 'Sợ nhất hỏa diệm nung chảy áo giáp, nhận x1.75 sát thương.',
    EARTH: 'Khối thạch nham ngàn cân đè bẹp kim loại, nhận x1.75 sát thương.',
    LIGHTNING: 'Dẫn điện truyền thẳng vào người bọc thép, nhận x1.3 sát thương.'
  },
  sampleMonsters: ['Chiến Binh Thiết Giáp', 'Khổng Lồ Thép']
};

