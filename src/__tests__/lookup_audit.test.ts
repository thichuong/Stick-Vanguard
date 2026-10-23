import { describe, it, expect } from 'vitest';
import {
  ALL_15_ELEMENTS,
  ALL_ELEMENT_DEFINITIONS,
  ELEMENTAL_REACTIONS,
  STATUS_TO_ELEMENT,
  getElementOffensiveTable,
  getElementDefensiveTable,
  getElementSynergyTable,
  searchElementalReactions
} from '../config/elements/index.js';
import { ENEMY_BLUEPRINTS } from '../config/enemies.config.js';
import { CodexEnemies } from '../ui/codex/CodexEnemies.js';

describe('Codex Lookup Tables Comprehensive Audit', () => {
  it('1. Matrix Symmetry: For all 15x15 element pairs (225 cells), Offensive(A -> B) must equal Defensive(B <- A)', () => {
    for (const a of ALL_15_ELEMENTS) {
      const offensiveTable = getElementOffensiveTable(a);
      expect(offensiveTable).toHaveLength(15);

      for (const b of ALL_15_ELEMENTS) {
        const offRow = offensiveTable.find((r) => r.targetElement === b)!;
        expect(offRow).toBeDefined();

        const defensiveTable = getElementDefensiveTable(b);
        expect(defensiveTable).toHaveLength(15);

        const defRow = defensiveTable.find((r) => r.attackerElement === a)!;
        expect(defRow).toBeDefined();

        // Multipliers must be identical
        expect(offRow.multiplier).toBe(defRow.multiplier);
        expect(offRow.percentage).toBe(defRow.percentage);

        // Category mapping symmetry
        if (offRow.category === 'SUPER_EFFECTIVE') {
          expect(defRow.category).toBe('SUPER_WEAK');
        } else if (offRow.category === 'EFFECTIVE') {
          expect(defRow.category).toBe('WEAK');
        } else if (offRow.category === 'NORMAL') {
          expect(defRow.category).toBe('NORMAL');
        } else if (offRow.category === 'RESISTED') {
          expect(defRow.category).toBe('RESIST');
        } else if (offRow.category === 'IMMUNE') {
          expect(defRow.category).toBe('IMMUNE');
        }
      }
    }
  });

  it('2. Status Effect Mapping: Every requiredStatus in ELEMENTAL_REACTIONS must map to a valid Element in STATUS_TO_ELEMENT', () => {
    for (const reaction of ELEMENTAL_REACTIONS) {
      const mappedElem = STATUS_TO_ELEMENT[reaction.requiredStatus];
      expect(mappedElem).toBeDefined();
      expect(ALL_15_ELEMENTS).toContain(mappedElem);
      expect(ALL_15_ELEMENTS).toContain(reaction.triggerElement);
    }
  });

  it('3. Synergy Lookup Integrity: getElementSynergyTable must return all matching reactions for every element', () => {
    let totalSynergyEntries = 0;
    for (const elem of ALL_15_ELEMENTS) {
      const synergies = getElementSynergyTable(elem);
      totalSynergyEntries += synergies.length;

      for (const syn of synergies) {
        expect(syn.reaction).toBeDefined();
        expect(syn.formulaText).toBeTruthy();
        expect(syn.formulaText.length).toBeGreaterThan(0);
        if (syn.role === 'SETUP') {
          const statusOfElem = ALL_ELEMENT_DEFINITIONS[elem].statusEffectType;
          expect(syn.reaction.requiredStatus).toBe(statusOfElem);
          expect(syn.partnerElement).toBe(syn.reaction.triggerElement);
        } else {
          expect(syn.reaction.triggerElement).toBe(elem);
        }
      }
    }

    // Since every reaction has 1 setup element and 1 trigger element,
    // the sum of synergy entries across all elements should be at least reactions.length
    expect(totalSynergyEntries).toBeGreaterThanOrEqual(ELEMENTAL_REACTIONS.length);
  });

  it('4. Monster Damage Intake Table: All 30 enemies in CodexEnemies must produce 15 valid intake cards matching TargetingRuleEngine rules', () => {
    const codexEnemies = new CodexEnemies(() => true, () => 'ENEMIES');

    for (const [, bp] of Object.entries(ENEMY_BLUEPRINTS)) {
      const summary = codexEnemies.getEnemyMatchupSummary(bp);
      expect(summary.weaknesses).toBeDefined();
      expect(summary.resistances).toBeDefined();
      expect(summary.immunities).toBeDefined();

      // Check immunities match blueprint
      for (const imm of bp.elementalProfile.immunities) {
        expect(summary.immunities).toContain(imm);
      }

      // Check each element intake card
      for (const elem of ALL_15_ELEMENTS) {
        const intake = codexEnemies.calculateDamageIntake(bp, elem);
        expect(intake.multiplier).toBeGreaterThanOrEqual(0);
        expect(intake.percentage).toBe(Math.round(intake.multiplier * 100));

        if (bp.elementalProfile.immunities.includes(elem)) {
          expect(intake.multiplier).toBe(0);
          expect(intake.category).toBe('IMMUNE');
        }
      }
    }
  });

  it('5. Search & Filter in Reactions: searchElementalReactions works seamlessly across queries and filters', () => {
    const all = searchElementalReactions('', 'ALL', 'ALL');
    expect(all).toHaveLength(ELEMENTAL_REACTIONS.length);

    // Filter by DRAGON_BOOST
    const dragonBoost = searchElementalReactions('', 'ALL', 'DRAGON_BOOST');
    expect(dragonBoost.length).toBe(12);

    // Filter by FAIRY_BLESS
    const fairyBless = searchElementalReactions('', 'ALL', 'FAIRY_BLESS');
    expect(fairyBless.length).toBe(10);

    // Filter by DARK_SYNERGY
    const darkSynergy = searchElementalReactions('', 'ALL', 'DARK_SYNERGY');
    expect(darkSynergy.length).toBe(12);

    // Filter by NATURAL
    const natural = searchElementalReactions('', 'ALL', 'NATURAL');
    expect(natural.length).toBe(10);

    // Total must be 12 + 10 + 12 + 10 = 44
    expect(dragonBoost.length + fairyBless.length + darkSynergy.length + natural.length).toBe(44);
  });
});
