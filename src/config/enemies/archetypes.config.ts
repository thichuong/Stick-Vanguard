import { ARCHETYPE_SVG_ICONS } from '../ui/icons/index.js';

export type EnemyVisualArchetype =
  | 'HUMANOID'
  | 'DRAGON'
  | 'SERPENT'
  | 'AVIAN_BAT'
  | 'ARACHNID'
  | 'TURTLE_BEAST'
  | 'SLIME_CRYSTAL'
  | 'COLOSSUS'
  | 'WRAITH_REAPER'
  | 'SIREN';

export interface ArchetypeInfo {
  archetype: EnemyVisualArchetype;
  name: string;
  icon: string;
  description: string;
}

/**
 * Deterministically identify visual archetype based on enemy type ID and characteristics
 */
export function getArchetype(enemy: { typeId?: string; type?: string }): EnemyVisualArchetype {
  const id = enemy.typeId || enemy.type || '';

  // 1. Dragon species
  if (
    id === 'DARK_DRAGON_BOSS' ||
    id === 'WYVERN_RAIDER' ||
    id === 'DRAKE_WARRIOR' ||
    id === 'RIVER_DRAKE'
  ) {
    return 'DRAGON';
  }

  // 2. Serpents & Eels & Hydra
  if (
    id === 'AQUA_SERPENT' ||
    id === 'SPARK_EEL' ||
    id === 'VOID_HYDRA_BOSS'
  ) {
    return 'SERPENT';
  }

  // 3. Avians, Bats & Fairies & Angels
  if (
    id === 'WINGED_GARGOYLE' ||
    id === 'TOXIC_BAT' ||
    id === 'FAIRY_SPRITE' ||
    id === 'SERAPH_VALKYRIE' ||
    id === 'EMP_DRONE' ||
    id === 'ARCHANGEL_MONARCH_BOSS' ||
    id === 'CELESTIAL_FAIRY'
  ) {
    return 'AVIAN_BAT';
  }

  // 4. Arachnids (Spiders)
  if (id === 'VENOM_ARACHNID') {
    return 'ARACHNID';
  }

  // 5. Turtles & Water Behemoths & Crabs
  if (id === 'MOSS_TURTLE' || id === 'PLAGUE_LEVIATHAN' || id === 'ABYSSAL_CRAB') {
    return 'TURTLE_BEAST';
  }

  // 6. Slimes, Blobs & Ice Shards
  if (
    id === 'MAGMA_SLIME' ||
    id === 'EMBER_BLOB' ||
    id === 'ICE_SHARDLING'
  ) {
    return 'SLIME_CRYSTAL';
  }

  // 7. Colossus & Golems & Boss Titans
  if (
    id === 'ROCK_GOLEM' ||
    id === 'FROST_CRYSTAL_GOLEM' ||
    id === 'IRON_COLOSSUS' ||
    id === 'CHRONO_DESTROYER_BOSS' ||
    id === 'ANCIENT_TREANT_BOSS' ||
    id === 'IRON_OVERLORD_BOSS' ||
    id === 'INFERNO_MONARCH_BOSS' ||
    id === 'GLACIAL_TITAN_BOSS'
  ) {
    return 'COLOSSUS';
  }

  // 8. Wraiths & Reapers & Degrader & Soul Emperor
  if (
    id === 'SHADOW_WRAITH' ||
    id === 'PHANTOM_REAPER' ||
    id === 'SPECTRAL_BANSHEE' ||
    id === 'HEX_DEGRADER' ||
    id === 'SOUL_EMPEROR_BOSS'
  ) {
    return 'WRAITH_REAPER';
  }

  // 9. Siren (Mermaid) & Priestess & Tempest Leviathan
  if (
    id === 'STORM_CALLER_SIREN' ||
    id === 'TIDAL_PRIESTESS' ||
    id === 'TEMPEST_LEVIATHAN_BOSS'
  ) {
    return 'SIREN';
  }

  // 10. Default humanoid / warriors
  return 'HUMANOID';
}

/**
 * Get metadata and display label for an enemy archetype
 */
export function getArchetypeInfo(enemy: { typeId?: string; type?: string }): ArchetypeInfo {
  const archetype = getArchetype(enemy);
  switch (archetype) {
    case 'DRAGON':
      return {
        archetype,
        name: 'Tộc Rồng',
        icon: ARCHETYPE_SVG_ICONS.DRAGON,
        description: 'Sừng cong, mõm nhọn, đuôi dài có mũi giáo và cánh xương vỗ rộng.'
      };
    case 'SERPENT':
      return {
        archetype,
        name: 'Tộc Mãng Xà & Thủy Xà',
        icon: ARCHETYPE_SVG_ICONS.SERPENT,
        description: 'Thân nhiều đốt uốn lượn hình sóng, đầu bẹt lưỡi chẻ đôi (Trùm Hư Không có 3 đầu).'
      };
    case 'AVIAN_BAT':
      return {
        archetype,
        name: 'Tộc Quái Bay & Tiên Linh',
        icon: ARCHETYPE_SVG_ICONS.AVIAN_BAT,
        description: 'Cánh dơi nhiều khớp gập mở hoặc 4 cánh bướm trong suốt lấp lánh.'
      };
    case 'ARACHNID':
      return {
        archetype,
        name: 'Tộc Nhện Độc',
        icon: ARCHETYPE_SVG_ICONS.ARACHNID,
        description: 'Bụng độc tròn, 4 mắt đỏ, kìm nanh chồm tới và 8 chân que gập góc bò so le.'
      };
    case 'TURTLE_BEAST':
      return {
        archetype,
        name: 'Tộc Rùa & Thủy Quái Giáp',
        icon: ARCHETYPE_SVG_ICONS.TURTLE_BEAST,
        description: 'Mai rêu lục giác, đầu thụt thò và 4 chân chèo bơi nước nhịp nhàng.'
      };
    case 'SLIME_CRYSTAL':
      return {
        archetype,
        name: 'Tộc Dung Nham & Băng Tinh',
        icon: ARCHETYPE_SVG_ICONS.SLIME_CRYSTAL,
        description: 'Khối giọt đàn hồi squash & stretch hoặc tinh thể băng xoay đa diện.'
      };
    case 'COLOSSUS':
      return {
        archetype,
        name: 'Tộc Khổng Lồ Golem',
        icon: ARCHETYPE_SVG_ICONS.COLOSSUS,
        description: 'Thân hình thang hộ pháp, vai bọc giáp gai/đinh tán và vung nắm đấm búa tạ.'
      };
    case 'WRAITH_REAPER':
      return {
        archetype,
        name: 'Tộc Hồn Ma & Tử Thần',
        icon: ARCHETYPE_SVG_ICONS.WRAITH_REAPER,
        description: 'Tà áo choàng bay lượn lơ lửng, vung Lưỡi Hái Tử Thần chém quét.'
      };
    case 'SIREN':
      return {
        archetype,
        name: 'Tộc Tiên Cá Gọi Bão',
        icon: ARCHETYPE_SVG_ICONS.SIREN,
        description: 'Vương miện san hô, đuôi cá quạt sóng, quyền trượng đinh ba sét.'
      };
    case 'HUMANOID':
    default:
      return {
        archetype: 'HUMANOID',
        name: 'Tộc Người Que Chiến Binh',
        icon: ARCHETYPE_SVG_ICONS.HUMANOID,
        description: 'Bộ khung người que trang bị vũ khí riêng (gươm, đinh ba, trượng đầu lâu, băng trán).'
      };
  }
}

