import { ElementalReaction } from './types.js';

export const ELEMENTAL_REACTIONS: ElementalReaction[] = [
  // ==========================================
  // 1. PHẢN ỨNG TỰ NHIÊN CỔ ĐIỂN (NATURAL)
  // ==========================================
  {
    id: 'COMBUSTION',
    name: 'Bùng Cháy Nổ Độc',
    category: 'NATURAL',
    requiredStatus: 'POISON',
    triggerElement: 'FIRE',
    damageMultiplier: 1.7,
    label: '💥 BÙNG CHÁY!',
    description: 'Lửa gặp Kịch Độc phát nổ bốc cháy dữ dội, tăng thêm +70% sát thương bộc phát và khuếch đại DoT!'
  },
  {
    id: 'BURNING_VINES',
    name: 'Thiêu Rụi Dây Leo',
    category: 'NATURAL',
    requiredStatus: 'ROOT',
    triggerElement: 'FIRE',
    damageMultiplier: 1.65,
    label: '🔥 RỰC LỬA!',
    description: 'Ngọn lửa bén vào dây leo trói buộc, gây sát thương bộc phát +65% và duy trì ngọn lửa bùng cháy!'
  },
  {
    id: 'ELECTRO_CHARGED',
    name: 'Sốc Điện Cao Thế',
    category: 'NATURAL',
    requiredStatus: 'WET',
    triggerElement: 'LIGHTNING',
    damageMultiplier: 1.75,
    label: '⚡ SỐC ĐIỆN!',
    description: 'Trạng thái Ẩm Ướt dẫn dòng điện cực mạnh, tăng +75% sát thương và kéo dài thời gian làm choáng.'
  },
  {
    id: 'PERMAFROST',
    name: 'Đóng Băng Vĩnh Cửu',
    category: 'NATURAL',
    requiredStatus: 'WET',
    triggerElement: 'ICE',
    damageMultiplier: 1.5,
    label: '❄️ ĐÓNG BĂNG!',
    description: 'Màn nước biến thành khối băng buốt giá, tăng +50% sát thương và chắc chắn Đóng Băng bất động 0.8s.'
  },
  {
    id: 'OVERGROWTH',
    name: 'Sinh Trưởng Mộc Tinh',
    category: 'NATURAL',
    requiredStatus: 'WET',
    triggerElement: 'GRASS',
    damageMultiplier: 1.6,
    label: '🌿 SINH TRƯỞNG!',
    description: 'Nước tưới mát hạt giống mộc tinh, kích hoạt dây leo trói chân kéo dài và tăng +60% sát thương.'
  },
  {
    id: 'SHATTER',
    name: 'Phá Băng Trọng Kích',
    category: 'NATURAL',
    requiredStatus: 'FREEZE',
    triggerElement: 'STEEL',
    damageMultiplier: 1.85,
    label: '🔨 PHÁ BĂNG!',
    description: 'Vũ khí Thép đập vỡ vụn khối băng phong tỏa, gây bạo kích +85% sát thương phá hủy kết cấu!'
  },
  {
    id: 'SHATTER_EARTH',
    name: 'Địa Chấn Phá Băng',
    category: 'NATURAL',
    requiredStatus: 'FREEZE',
    triggerElement: 'EARTH',
    damageMultiplier: 1.75,
    label: '🪨 PHÁ BĂNG!',
    description: 'Chấn động mặt đất làm nứt toác khối băng, gây bạo kích +75% sát thương địa chấn!'
  },
  {
    id: 'CORROSION',
    name: 'Ăn Mòn Cực Độc',
    category: 'NATURAL',
    requiredStatus: 'SUNDER',
    triggerElement: 'POISON',
    damageMultiplier: 1.6,
    label: '🧪 ĂN MÒN!',
    description: 'Độc tố ngấm sâu vào vết nứt giáp thép, gây thêm +60% sát thương ăn mòn và rút máu gấp đôi.'
  },
  {
    id: 'SWIRL',
    name: 'Cuồng Phong Khuếch Tán',
    category: 'NATURAL',
    requiredStatus: 'BURN',
    triggerElement: 'WIND',
    damageMultiplier: 1.45,
    label: '🌪️ KHUẾCH TÁN!',
    description: 'Gió lốc thổi bùng ngọn lửa lan tỏa, tăng thêm +45% sát thương và thổi bạt quái về sau.'
  },
  {
    id: 'DUAL_POLARITY',
    name: 'Lưỡng Cực Quang Ám',
    category: 'NATURAL',
    requiredStatus: 'CURSE',
    triggerElement: 'LIGHT',
    damageMultiplier: 1.65,
    label: '✨ LƯỠNG CỰC QUANG ÁM!',
    description: 'Sự va chạm dữ dội giữa Ánh Sáng và Bóng Tối, giải phóng xung kích ma pháp xuyên thủng khiên kháng phép.'
  },

  // ==============================================================
  // 2. RỒNG: LONG UY KHUẾCH ĐẠI (TĂNG UY LỰC CÁC NGUYÊN TỐ KHÁC)
  // ==============================================================
  {
    id: 'DRAGON_OVERLOAD',
    name: 'Long Lôi Bạo Kích',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'LIGHTNING',
    damageMultiplier: 1.75,
    label: '🐉 LONG LÔI!',
    description: 'Tia sét hòa quyện cùng uy áp loài rồng, giáng đòn sấm sét bạo kích +75% sát thương lôi phạt!'
  },
  {
    id: 'DRAGON_FLAME',
    name: 'Hỏa Long Hủy Diệt',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'FIRE',
    damageMultiplier: 1.7,
    label: '🐉 HỎA LONG!',
    description: 'Long uy châm ngòi ngọn lửa long tộc dữ dội, thiêu rụi mục tiêu với +70% sát thương bộc phát!'
  },
  {
    id: 'DRAGON_DELUGE',
    name: 'Thủy Long Triều Tấn',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'WATER',
    damageMultiplier: 1.65,
    label: '🐉 THỦY LONG!',
    description: 'Long uy khuấy đảo cuồng triều ngập lụt, tăng thêm +65% sát thương đè bẹp bước tiến quân thù.'
  },
  {
    id: 'DRAGON_GLACIER',
    name: 'Hàn Long Tuyệt Đỉnh',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'ICE',
    damageMultiplier: 1.7,
    label: '🐉 HÀN LONG!',
    description: 'Khí tức buốt lạnh của loài rồng phủ băng giá ngàn năm, tăng +70% sát thương băng giá.'
  },
  {
    id: 'DRAGON_TEMPEST',
    name: 'Phong Long Cuồng Vũ',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'WIND',
    damageMultiplier: 1.6,
    label: '🐉 PHONG LONG!',
    description: 'Long uy triệu hoán bão tố cuồng phong xé toạc không gian, tăng +60% sát thương và thổi bạt quái.'
  },
  {
    id: 'DRAGON_QUAKE',
    name: 'Địa Long Chấn Động',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'EARTH',
    damageMultiplier: 1.65,
    label: '🐉 ĐỊA LONG!',
    description: 'Long uy giáng đòn dậm đất rung chuyển cả bản đồ, gây chấn động nứt vỡ mặt đất +65% sát thương.'
  },
  {
    id: 'DRAGON_NATURE',
    name: 'Mộc Long Phồn Sinh',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'GRASS',
    damageMultiplier: 1.6,
    label: '🐉 MỘC LONG!',
    description: 'Long uy thức tỉnh cây cổ thụ cổ đại, quất roi gai góc vào kẻ địch với +60% sát thương.'
  },
  {
    id: 'DRAGON_VENOM',
    name: 'Độc Long Thực Cốt',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'POISON',
    damageMultiplier: 1.6,
    label: '🐉 ĐỘC LONG!',
    description: 'Nọc độc loài rồng ăn mòn tủy xương mục tiêu, tăng thêm +60% sát thương và gia tốc DoT.'
  },
  {
    id: 'DRAGON_IRON',
    name: 'Thiết Long Trọng Kích',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'STEEL',
    damageMultiplier: 1.65,
    label: '🐉 THIẾT LONG!',
    description: 'Vảy rồng kim loại tôi luyện nghiền nát giáp trụ kẻ thù, tăng thêm +65% sát thương phá hủy.'
  },
  {
    id: 'DRAGON_HOLY',
    name: 'Thánh Long Quang Minh',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'LIGHT',
    damageMultiplier: 1.7,
    label: '🐉 THÁNH LONG!',
    description: 'Long uy rực sáng ánh quang thánh thiện, thiêu rụi tà ma với +70% sát thương thanh tẩy.'
  },
  {
    id: 'DRAGON_GHOST',
    name: 'U Long Đoạt Hồn',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'GHOST',
    damageMultiplier: 1.65,
    label: '🐉 U LONG!',
    description: 'Tiếng gầm linh hồn rồng cổ đại cắn nuốt sinh mệnh kẻ địch, tăng +65% sát thương trảm sát.'
  },
  {
    id: 'DRAGON_VOID',
    name: 'Hắc Long Diệt Thế',
    category: 'DRAGON_BOOST',
    requiredStatus: 'DRAGON_AWE',
    triggerElement: 'DARK',
    damageMultiplier: 1.7,
    label: '🐉 HẮC LONG!',
    description: 'Long uy hòa quyện vực sâu bóng tối hủy diệt mọi sự sống, tăng bạo kích +70% sát thương.'
  },

  // ==============================================================
  // 3. TIÊN: TIÊN LINH TĂNG PHÚC (MỌI NGUYÊN TỐ TRỪ HẮC, MA, ĐỘC, VẬT LÝ)
  // ==============================================================
  {
    id: 'SPIRIT_PURIFY',
    name: 'Linh Hồn Thanh Tẩy',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'LIGHT',
    damageMultiplier: 1.7,
    label: '✨ TỊNH HÓA!',
    description: 'Thánh quang rọi chiếu mục tiêu bị mê hoặc, thanh tẩy tà khí và bộc phát +70% sát thương.'
  },
  {
    id: 'FAIRY_FIRE',
    name: 'Tiên Hỏa Chúc Phúc',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'FIRE',
    damageMultiplier: 1.6,
    label: '🧚 TIÊN HỎA!',
    description: 'Bụi tiên tăng phúc ngọn lửa bùng cháy dữ dội trên người mục tiêu mê hoặc, tăng +60% sát thương.'
  },
  {
    id: 'FAIRY_WATER',
    name: 'Tiên Thủy Thanh Khiết',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'WATER',
    damageMultiplier: 1.55,
    label: '🧚 TIÊN THỦY!',
    description: 'Dòng nước tinh linh rửa trôi phòng ngự, tăng thêm +55% sát thương ma pháp thủy tộc.'
  },
  {
    id: 'FAIRY_ICE',
    name: 'Tiên Băng Tinh Khiết',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'ICE',
    damageMultiplier: 1.6,
    label: '🧚 TIÊN BĂNG!',
    description: 'Bụi tuyết tiên giới phong tỏa mục tiêu bị mê hoặc, tăng +60% sát thương hàn băng.'
  },
  {
    id: 'FAIRY_LIGHTNING',
    name: 'Tiên Lôi Thiên Phạt',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'LIGHTNING',
    damageMultiplier: 1.6,
    label: '🧚 TIÊN LÔI!',
    description: 'Tia sét tiên giới giáng xuống mục tiêu đang say đắm, gây sốc điện bạo kích +60% sát thương.'
  },
  {
    id: 'FAIRY_WIND',
    name: 'Tiên Phong Linh Động',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'WIND',
    damageMultiplier: 1.55,
    label: '🧚 TIÊN PHONG!',
    description: 'Gió lốc tiên giới cuốn phăng kẻ địch đang mất cảnh giác, tăng thêm +55% sát thương.'
  },
  {
    id: 'FAIRY_EARTH',
    name: 'Tiên Thổ Hộ Vệ',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'EARTH',
    damageMultiplier: 1.55,
    label: '🧚 TIÊN THỔ!',
    description: 'Thạch nham tiên tộc đè nén kẻ địch mê muội, bộc phát +55% sát thương địa chấn.'
  },
  {
    id: 'FAIRY_GRASS',
    name: 'Tiên Mộc Phồn Vinh',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'GRASS',
    damageMultiplier: 1.6,
    label: '🧚 TIÊN MỘC!',
    description: 'Rừng cây tiên giới đâm chồi trói buộc kẻ địch, tăng +60% sát thương và kéo dài cầm chân.'
  },
  {
    id: 'FAIRY_STEEL',
    name: 'Tiên Kim Tinh Luyện',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'STEEL',
    damageMultiplier: 1.55,
    label: '🧚 TIÊN KIM!',
    description: 'Vũ khí kim loại được bọc bụi tiên chém xuyên qua phòng ngự, tăng +55% sát thương.'
  },
  {
    id: 'FAIRY_DRAGON',
    name: 'Tiên Long Cộng Hưởng',
    category: 'FAIRY_BLESS',
    requiredStatus: 'CHARM',
    triggerElement: 'DRAGON',
    damageMultiplier: 1.65,
    label: '🧚 TIÊN LONG!',
    description: 'Tiên thuật áp chế và cộng hưởng cùng uy lực long tộc, tăng bạo kích +65% sát thương.'
  },

  // ==============================================================
  // 4. HẮC ÁM: ÁM + MA & ÁM + CÁC HỆ KHÁC (TRỪ TIÊN, QUANG)
  // ==============================================================
  {
    id: 'ABYSSAL_SOUL',
    name: 'Minh Giới Ám Hồn',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'GHOST',
    damageMultiplier: 1.85,
    label: '🔮 MINH GIỚI ÁM HỒN!',
    description: 'Ám + Ma: Hắc Ám hòa quyện cùng U Hồn xuyên thấu thể xác, gây bạo kích +85% sát thương và tăng mạnh hiệu lực trảm sát theo % máu đã mất!'
  },
  {
    id: 'ABYSSAL_FIRE',
    name: 'Hỏa Ngục Hắc Ám',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'FIRE',
    damageMultiplier: 1.65,
    label: '🔥 HỎA NGỤC ÁM!',
    description: 'Ngọn lửa bị tha hóa bởi bóng tối, thiêu đốt kẻ địch với +65% sát thương ăn mòn linh hồn.'
  },
  {
    id: 'ABYSSAL_WATER',
    name: 'Hắc Thủy Vực Sâu',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'WATER',
    damageMultiplier: 1.55,
    label: '🌊 HẮC THỦY!',
    description: 'Dòng nước đen ngòm từ vực thẳm bóp nghẹt mục tiêu bị nguyền rủa, tăng +55% sát thương.'
  },
  {
    id: 'ABYSSAL_ICE',
    name: 'Hắc Băng Vĩnh Hằng',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'ICE',
    damageMultiplier: 1.6,
    label: '❄️ HẮC BĂNG!',
    description: 'Băng giá bóng đêm đông cứng sinh khí mục tiêu đang chịu nguyền rủa, tăng +60% sát thương.'
  },
  {
    id: 'ABYSSAL_LIGHTNING',
    name: 'Hắc Lôi Hủy Diệt',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'LIGHTNING',
    damageMultiplier: 1.65,
    label: '⚡ HẮC LÔI!',
    description: 'Tia sét tà ác phát nổ giật lan trong bóng tối, tăng thêm +65% sát thương hủy diệt.'
  },
  {
    id: 'ABYSSAL_WIND',
    name: 'Hắc Phong Tử Khí',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'WIND',
    damageMultiplier: 1.55,
    label: '🌪️ HẮC PHONG!',
    description: 'Làn gió tử khí mang lời nguyền gặm nhấm mục tiêu, tăng +55% sát thương và đẩy lùi.'
  },
  {
    id: 'ABYSSAL_EARTH',
    name: 'Hắc Thổ Vực Thẳm',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'EARTH',
    damageMultiplier: 1.6,
    label: '🪨 HẮC THỔ!',
    description: 'Địa chấn tăm tối chôn vùi kẻ địch đang suy yếu, tăng bộc phát +60% sát thương.'
  },
  {
    id: 'ABYSSAL_GRASS',
    name: 'Hắc Mộc Ký Sinh',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'GRASS',
    damageMultiplier: 1.55,
    label: '🌿 HẮC MỘC!',
    description: 'Dây leo hắc ám quấn chặt hút cạn sinh lực kẻ thù bị nguyền rủa, tăng +55% sát thương.'
  },
  {
    id: 'ABYSSAL_POISON',
    name: 'Hắc Độc Suy Vong',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'POISON',
    damageMultiplier: 1.7,
    label: '☠️ HẮC ĐỘC!',
    description: 'Chất độc bóng đêm ăn mòn cùng dấu ấn nguyền rủa, tăng bạo kích +70% sát thương DoT.'
  },
  {
    id: 'ABYSSAL_STEEL',
    name: 'Hắc Kim Phá Hủy',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'STEEL',
    damageMultiplier: 1.6,
    label: '⚙️ HẮC KIM!',
    description: 'Lưỡi kiếm hắc ám chém rách nát lớp phòng ngự của kẻ địch nguyền rủa, tăng +60% sát thương.'
  },
  {
    id: 'ABYSSAL_DRAGON',
    name: 'Hắc Long Ma Vương',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'DRAGON',
    damageMultiplier: 1.75,
    label: '🐉 HẮC LONG!',
    description: 'Long uy kết hợp ma thuật nguyền rủa bùng nổ sức mạnh ma vương, tăng +75% sát thương.'
  },
  {
    id: 'ABYSSAL_STRIKE',
    name: 'Ám Kích Trọng Chém',
    category: 'DARK_SYNERGY',
    requiredStatus: 'CURSE',
    triggerElement: 'PHYSICAL',
    damageMultiplier: 1.45,
    label: '⚔️ ÁM KÍCH!',
    description: 'Nhát chém vật lý bổ thẳng vào điểm yếu nguyền rủa, tăng +45% sát thương trực tiếp.'
  }
];

