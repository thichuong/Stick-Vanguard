import { ElementDefinition } from './types.js';
import { ICE_SVG } from './icons/index.js';

export const ICE_ELEMENT: ElementDefinition = {
  element: 'ICE',
  name: 'Ice',
  nameVi: 'Băng (Hàn)',
  color: '#06b6d4',
  icon: ICE_SVG,
  iconSvg: ICE_SVG,
  iconPath: 'src/config/elements/icons/ice.svg',
  badge: 'Khống Chế Tuyệt Đối • Đóng Băng Vĩnh Cửu',
  nature: 'Độ không tuyệt đối làm chậm sâu bước tiến quân địch và phong ấn quái vật đứng bất động trong băng giá.',
  statusEffectType: 'FREEZE',
  effectName: 'Hàn Băng & Đóng Băng (Freeze)',
  effectDescription: 'Làm chậm 45% tốc độ trong 3s và có 25% tỉ lệ đóng băng bất động trong 0.6s.',
  statusEffectName: 'Hàn Băng & Đóng Băng (Freeze)',
  statusEffectDesc: 'Làm chậm 45% trong 3.0s và có 25% tỉ lệ đóng băng hoàn toàn trong 0.6s (quái đứng yên, không đánh trả).',
  combatHighlights: [
    'Khống chế mạnh: Làm chậm 45% tốc độ di chuyển trong 3.0 giây.',
    'Phong ấn băng giá: 25% tỉ lệ đóng băng bất động 0.6s (quái đứng yên, không thể tung đòn).',
    'Khắc tinh số 1 của loài Rồng (2.0x) và Mộc tinh (1.8x).'
  ],
  combatStats: {
    slowDuration: 3.0,
    slowRatio: 0.45,
    procChance: 0.25,
    procDuration: 0.6
  },
  buildingEffects: {
    barracks: 'Lính chốt chặn đóng băng quái vật ngay trước mặt, không cho quái vật cơ hội tấn công.',
    archer: 'Bắn tỉa khóa chân vĩnh cửu, làm chậm 45% liên tục không cho quái chạy thoát.',
    mage: 'Bão tuyết diện rộng làm tê cóng và đóng băng nhiều quái vật cùng lúc.',
    artillery: 'Pháo băng Blizzard nổ lan làm chậm cả đoàn quân trong bán kính lớn.'
  },
  offensiveMatchups: [
    { element: 'DRAGON', mult: 2.0, note: 'Hàn băng là khắc tinh số 1 của loài rồng máu nóng.' },
    { element: 'GRASS', mult: 1.8, note: 'Sương giá làm khô héo hoa màu thảo mộc.' },
    { element: 'WIND', mult: 1.5, note: 'Đóng băng các luồng cuồng phong.' },
    { element: 'WATER', mult: 1.3, note: 'Đóng băng mặt nước sông hồ.' },
    { element: 'FIRE', mult: 0.5, note: 'Nhiệt lửa làm tan chảy đạn băng.' },
    { element: 'STEEL', mult: 0.5, note: 'Giáp thép cứng cáp làm vỡ vụn mảnh băng.' },
    { element: 'ICE', mult: 0.2, note: 'Sinh vật băng tuyết miễn nhiễm hàn khí.' }
  ],
  defensiveNotes: {
    FIRE: 'Sợ nhất các đòn thiêu đốt hỏa diệm, nhận x1.75 sát thương.',
    STEEL: 'Vũ khí kim loại nặng đập vỡ vụn cấu trúc tinh thể băng, nhận x1.8 sát thương.'
  },
  sampleMonsters: ['Khổng Lồ Băng Nham', 'Mảnh Băng Tinh']
};

