import { ElementDefinition } from './types.js';
import { FAIRY_SVG } from './icons/index.js';

export const FAIRY_ELEMENT: ElementDefinition = {
  element: 'FAIRY',
  name: 'Fairy',
  nameVi: 'Tiên (Tiên Linh)',
  color: '#f472b6',
  icon: FAIRY_SVG,
  iconSvg: FAIRY_SVG,
  iconPath: 'src/config/elements/icons/fairy.svg',
  badge: 'Bụi Tiên Mê Hoặc • Khắc Tinh Loài Rồng',
  nature: 'Phép thuật cổ tích huyền ảo của các tinh linh, làm mê hoặc kẻ địch, tăng phúc mọi chiêu thức nguyên tố (trừ Hắc, Ma, Độc, Vật Lý) và khắc chế tuyệt đối loài Rồng.',
  statusEffectType: 'CHARM',
  effectName: 'Mê Hoặc Tinh Linh (Charm)',
  effectDescription: 'Bụi tiên mê hoặc trong 3.0s: Giảm 35% tốc độ di chuyển, 30% tốc độ đánh và khiến mục tiêu nhận thêm +25% sát thương phép.',
  statusEffectName: 'Mê Hoặc Tinh Linh (Charm)',
  statusEffectDesc: 'Bụi tiên mê hoặc 3.0s: Giảm 35% tốc độ chạy, 30% tốc độ đánh và tăng phúc mọi chiêu thức nguyên tố (trừ Hắc, Ma, Độc, Vật Lý).',
  combatHighlights: [
    'Khống chế đa diện: Giảm 35% tốc độ di chuyển và giảm 30% tốc độ đánh trong 3.0s.',
    'Tiên Linh Tăng Phúc: Tăng uy lực mọi chiêu thức nguyên tố (Lửa, Nước, Sét, Băng, Đất, Gió, Quang, Cỏ, Thép, Rồng), ngoại trừ Hắc, Ma, Độc, Vật Lý.',
    'Khắc tinh tuyệt đối số 1 của loài Rồng (2.0x) và Hắc Ám (1.75x).'
  ],
  combatStats: {
    statusDuration: 3.0,
    slowRatio: 0.35,
    attackSpeedReduction: 0.3,
    damageAmp: 0.25
  },
  buildingEffects: {
    barracks: 'Bụi tiên bảo hộ lính, khiến quái mê muội vung đòn chậm chạp và nhận thêm sát thương.',
    archer: 'Mũi tên sao băng lấp lánh làm mê hoặc quái vật từ xa, vô hiệu hóa đà tiến công.',
    mage: 'Khúc hát tinh linh mê hoặc cả bầy quái, mở đường cho ma pháp kết liễu.',
    artillery: 'Pháo hoa tiên tinh nổ bùng phát bụi tiên rực rỡ khắp chiến trường.'
  },
  offensiveMatchups: [
    { element: 'DRAGON', mult: 2.0, note: 'Khắc tinh tuyệt đối: Hủy diệt uy lực của loài rồng.' },
    { element: 'DARK', mult: 1.75, note: 'Ánh sáng diệu kỳ của tiên linh xua tan tà ác hắc ám.' },
    { element: 'FAIRY', mult: 0.3, note: 'Tinh linh cùng hệ kháng phép thuật tiên giới, giảm 70% sát thương.' },
    { element: 'POISON', mult: 0.4, note: 'Khí độc làm hoen ố đôi cánh tiên linh.' },
    { element: 'STEEL', mult: 0.4, note: 'Sắt thép nguội phá vỡ kết cấu phép màu tiên giới.' },
    { element: 'FIRE', mult: 0.5, note: 'Lửa nóng thiêu đốt lớp bụi tiên mong manh.' }
  ],
  defensiveNotes: {
    STEEL: 'Sợ nhất vũ khí đao kiếm bằng sắt thép nguội, nhận x2.0 sát thương.',
    POISON: 'Nọc độc hủy hoại sinh mệnh tiên linh, nhận x1.8 sát thương.'
  },
  sampleMonsters: ['Tiên Linh Hoa Gió', 'Tuyết Yêu Tinh Linh']
};

