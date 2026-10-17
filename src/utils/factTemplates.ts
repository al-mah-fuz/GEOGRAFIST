import { CountryFact, CurrentAffairsFact, ExplorerFact, HistoryFact, Question } from '../types';
import { VERIFIED_COUNTRY_FACTS } from '../data/facts/countryFacts';
import { VERIFIED_EXPLORER_FACTS } from '../data/facts/explorerFacts';
import { VERIFIED_HISTORY_FACTS } from '../data/facts/historyFacts';
import { VERIFIED_CURRENT_AFFAIRS_FACTS } from '../data/facts/currentAffairsFacts';
import { createMulberry32, hashString, shuffleArray } from './shuffle';

export interface TemplateGenerationReport {
  sourceFactsCount: number;
  generatedVariantsCount: number;
  rejectedCount: number;
  rejectionReasons: string[];
  variants: Question[];
}

const ALL_CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'] as const;

/**
 * Deterministically derives 4 unique choices for a target fact using seeded PRNG
 */
export function pickDeterministicDistractors<T>(
  targetValue: T,
  candidates: T[],
  seedInt: number,
  requiredCount: number = 3
): T[] | null {
  // Remove any candidate identical to target or duplicate
  const uniquePool = Array.from(new Set(candidates.filter(c => c !== targetValue && String(c).trim() !== '')));
  if (uniquePool.length < requiredCount) {
    return null; // Insufficient distinct distractors
  }

  // Shuffle deterministically based on seed
  const prng = createMulberry32(seedInt);
  const shuffled = shuffleArray([...uniquePool], prng);
  return shuffled.slice(0, requiredCount);
}

/**
 * Derives verified question variants from structured country, explorer, history, and current affairs facts.
 * Every variant has a stable ID, references its sourceFactId, and guarantees
 * 4 unique options with exactly one correct answer.
 */
export function generateQuestionVariantsFromFacts(
  facts: CountryFact[] = VERIFIED_COUNTRY_FACTS,
  explorerFacts: ExplorerFact[] = VERIFIED_EXPLORER_FACTS,
  historyFacts: HistoryFact[] = VERIFIED_HISTORY_FACTS,
  currentAffairsFacts: CurrentAffairsFact[] = VERIFIED_CURRENT_AFFAIRS_FACTS
): TemplateGenerationReport {
  const variants: Question[] = [];
  const rejectionReasons: string[] = [];
  let rejectedCount = 0;

  // Group country facts by continent for realistic regional distractors
  const factsByContinent: Record<string, CountryFact[]> = {};
  for (const f of facts) {
    if (!factsByContinent[f.continent]) {
      factsByContinent[f.continent] = [];
    }
    factsByContinent[f.continent].push(f);
  }

  // 1. COUNTRY FACTS TEMPLATES
  for (const fact of facts) {
    const seedBase = hashString(`FACT_${fact.factId}`);

    // --- TEMPLATE 1: Country -> Capital ---
    {
      const variantId = `VAR-CAP-${fact.iso2}`;
      const continentPool = (factsByContinent[fact.continent] || [])
        .map(f => f.capital)
        .filter(c => c !== fact.capital);
      const globalPool = facts.map(f => f.capital).filter(c => c !== fact.capital);

      const candidateDistractors = continentPool.length >= 3 ? continentPool : globalPool;
      const distractors = pickDeterministicDistractors(fact.capital, candidateDistractors, seedBase + 101, 3);

      if (!distractors || distractors.length !== 3) {
        rejectedCount++;
        rejectionReasons.push(`Fact ${fact.factId}: Insufficient distractors for Country->Capital`);
      } else {
        const options: [string, string, string, string] = [
          fact.capital,
          distractors[0],
          distractors[1],
          distractors[2],
        ];

        variants.push({
          id: variantId,
          category: 'capitals',
          topic: `${fact.continent} Capitals`,
          difficulty: ['US', 'GB', 'FR', 'DE', 'JP', 'IT', 'EG', 'BR', 'CA', 'AU', 'IN', 'CN', 'ES', 'MX'].includes(fact.iso2)
            ? 'beginner'
            : ['DZ', 'GH', 'KR', 'GR', 'AR', 'SE', 'NO', 'TH', 'PL', 'KE', 'NG', 'ZA'].includes(fact.iso2)
            ? 'intermediate'
            : ['BT', 'BI', 'CV', 'KM', 'ER', 'SZ', 'KI', 'NR', 'PW', 'ST', 'TV', 'VU'].includes(fact.iso2)
            ? 'expert'
            : 'advanced',
          question: `What is the official capital city of ${fact.countryName}?`,
          options,
          correctAnswer: fact.capital,
          explanation: `${fact.capital} serves as the official capital and seat of government of ${fact.countryName} in ${fact.continent}.`,
          source: fact.verifiedSource,
          verifiedDate: fact.verifiedDate,
          sourceFactId: fact.factId,
          templateId: 'tpl_country_to_capital',
          media: {
            type: 'landmark',
            countryCode: fact.iso2,
            flagEmoji: fact.flagEmoji,
            label: fact.countryName,
          },
        });
      }
    }

    // --- TEMPLATE 2: Capital -> Country (Reverse) ---
    {
      const variantId = `VAR-REV-${fact.iso2}`;
      const continentPool = (factsByContinent[fact.continent] || [])
        .map(f => f.countryName)
        .filter(c => c !== fact.countryName);
      const globalPool = facts.map(f => f.countryName).filter(c => c !== fact.countryName);

      const candidateDistractors = continentPool.length >= 3 ? continentPool : globalPool;
      const distractors = pickDeterministicDistractors(fact.countryName, candidateDistractors, seedBase + 202, 3);

      if (!distractors || distractors.length !== 3) {
        rejectedCount++;
        rejectionReasons.push(`Fact ${fact.factId}: Insufficient distractors for Capital->Country`);
      } else {
        const options: [string, string, string, string] = [
          fact.countryName,
          distractors[0],
          distractors[1],
          distractors[2],
        ];

        variants.push({
          id: variantId,
          category: 'capitals',
          topic: 'World Capitals',
          difficulty: ['US', 'GB', 'FR', 'DE', 'JP', 'IT', 'EG', 'BR', 'CA', 'AU', 'IN', 'CN'].includes(fact.iso2)
            ? 'beginner'
            : ['BT', 'BI', 'CV', 'KM', 'ER', 'SZ', 'KI', 'NR', 'PW', 'ST', 'TV', 'VU', 'MH', 'FM'].includes(fact.iso2)
            ? 'expert'
            : 'intermediate',
          question: `${fact.capital} is the national capital of which sovereign state?`,
          options,
          correctAnswer: fact.countryName,
          explanation: `${fact.capital} is the political capital of ${fact.countryName}, located in ${fact.continent}.`,
          source: fact.verifiedSource,
          verifiedDate: fact.verifiedDate,
          sourceFactId: fact.factId,
          templateId: 'tpl_capital_to_country',
          media: {
            type: 'landmark',
            countryCode: fact.iso2,
            flagEmoji: fact.flagEmoji,
          },
        });
      }
    }

    // --- TEMPLATE 3: Country -> Continent ---
    {
      const variantId = `VAR-CNT-${fact.iso2}`;
      const otherContinents = ALL_CONTINENTS.filter(c => c !== fact.continent);
      const distractors = pickDeterministicDistractors(fact.continent, [...otherContinents], seedBase + 303, 3);

      if (!distractors || distractors.length !== 3) {
        rejectedCount++;
        rejectionReasons.push(`Fact ${fact.factId}: Insufficient distractors for Country->Continent`);
      } else {
        const options: [string, string, string, string] = [
          fact.continent,
          distractors[0],
          distractors[1],
          distractors[2],
        ];

        variants.push({
          id: variantId,
          category: 'explorer',
          topic: 'Continents & Hemispheres',
          difficulty: ['US', 'CA', 'BR', 'FR', 'DE', 'AU', 'EG', 'CN', 'JP', 'IN'].includes(fact.iso2)
            ? 'beginner'
            : ['SR', 'GY', 'BT', 'DJ', 'VU', 'TV', 'KM'].includes(fact.iso2)
            ? 'advanced'
            : 'intermediate',
          question: `On which continent is the nation of ${fact.countryName} located?`,
          options,
          correctAnswer: fact.continent,
          explanation: `${fact.countryName} (capital: ${fact.capital}) is geographically situated on the continent of ${fact.continent}.`,
          source: fact.verifiedSource,
          verifiedDate: fact.verifiedDate,
          sourceFactId: fact.factId,
          templateId: 'tpl_country_to_continent',
        });
      }
    }

    // --- TEMPLATE 4: Country -> Flag Description ---
    {
      const variantId = `VAR-FLG-${fact.iso2}`;
      const globalPool = facts.map(f => f.countryName).filter(c => c !== fact.countryName);
      const distractors = pickDeterministicDistractors(fact.countryName, globalPool, seedBase + 404, 3);

      if (!distractors || distractors.length !== 3) {
        rejectedCount++;
        rejectionReasons.push(`Fact ${fact.factId}: Insufficient distractors for Country->Flag`);
      } else {
        const options: [string, string, string, string] = [
          fact.countryName,
          distractors[0],
          distractors[1],
          distractors[2],
        ];

        variants.push({
          id: variantId,
          category: 'flags',
          topic: `${fact.continent} Vexillology`,
          difficulty: ['JP', 'BR', 'CA', 'CH', 'GR', 'ZA', 'US', 'GB', 'FR', 'DE'].includes(fact.iso2)
            ? 'beginner'
            : ['DZ', 'GH', 'KR', 'AR', 'SE', 'MX', 'EG', 'KE', 'NG', 'TR', 'IN'].includes(fact.iso2)
            ? 'intermediate'
            : ['BT', 'SZ', 'KI', 'NR', 'PW', 'VU', 'TV', 'KM', 'ST'].includes(fact.iso2)
            ? 'expert'
            : 'advanced',
          question: `Which country’s national flag is officially described as: ${fact.flagDescription}?`,
          options,
          correctAnswer: fact.countryName,
          explanation: `The national flag of ${fact.countryName} features ${fact.flagDescription}.`,
          source: fact.verifiedSource,
          verifiedDate: fact.verifiedDate,
          sourceFactId: fact.factId,
          templateId: 'tpl_country_to_flag',
          media: {
            type: 'flag',
            countryCode: fact.iso2,
            flagEmoji: fact.flagEmoji,
          },
        });
      }
    }

    // --- TEMPLATE 5: Currency -> Country (Disambiguated for single-nation currencies) ---
    {
      const variantId = `VAR-CUR-${fact.iso2}`;
      const countriesWithSameCurrency = facts
        .filter(f => f.currencyName.toLowerCase() === fact.currencyName.toLowerCase())
        .map(f => f.countryName);

      const nonSharingPool = facts
        .filter(f => f.currencyName.toLowerCase() !== fact.currencyName.toLowerCase())
        .map(f => f.countryName);

      if (nonSharingPool.length >= 3 && countriesWithSameCurrency.length === 1) {
        const distractors = pickDeterministicDistractors(fact.countryName, nonSharingPool, seedBase + 505, 3);

        if (distractors && distractors.length === 3) {
          const options: [string, string, string, string] = [
            fact.countryName,
            distractors[0],
            distractors[1],
            distractors[2],
          ];

          variants.push({
            id: variantId,
            category: 'history',
            topic: 'Currencies & Global Commerce',
            difficulty: ['JP', 'GB', 'US', 'CH', 'IN'].includes(fact.iso2) ? 'intermediate' : 'advanced',
            question: `Which sovereign nation issues and uses the ${fact.currencyName} as its official currency?`,
            options,
            correctAnswer: fact.countryName,
            explanation: `The official legal tender of ${fact.countryName} is the ${fact.currencyName}.`,
            source: fact.verifiedSource,
            verifiedDate: fact.verifiedDate,
            sourceFactId: fact.factId,
            templateId: 'tpl_currency_to_country',
          });
        }
      }
    }
  }

  // 2. EXPLORER FACTS TEMPLATES
  for (const exp of explorerFacts) {
    const seedBase = hashString(`EXP_${exp.factId}`);

    // --- TEMPLATE 6: Feature -> Location ---
    {
      const variantId = `VAR-EXP-LOC-${exp.factId}`;
      const otherLocations = explorerFacts
        .map(f => f.location)
        .filter(loc => loc !== exp.location);
      const distractors = pickDeterministicDistractors(exp.location, otherLocations, seedBase + 606, 3);

      if (distractors && distractors.length === 3) {
        variants.push({
          id: variantId,
          category: 'explorer',
          topic: `${exp.type.charAt(0).toUpperCase() + exp.type.slice(1)} Geography`,
          difficulty: ['Mount Everest', 'Sahara Desert', 'Amazon River', 'Pacific Ocean', 'Grand Canyon'].includes(exp.name)
            ? 'beginner'
            : ['K2', 'Mount Kilimanjaro', 'Danube River', 'Strait of Gibraltar', 'Lake Baikal'].includes(exp.name)
            ? 'intermediate'
            : 'advanced',
          question: `In which country or geographic region is ${exp.name} located?`,
          options: [exp.location, distractors[0], distractors[1], distractors[2]],
          correctAnswer: exp.location,
          explanation: `${exp.name} is located in ${exp.location}. ${exp.superlativeOrFeature}`,
          source: exp.verifiedSource,
          verifiedDate: exp.verifiedDate,
          sourceFactId: exp.factId,
          templateId: 'tpl_explorer_feature_location',
        });
      }
    }

    // --- TEMPLATE 7: Superlative -> Target Landmark ---
    {
      const variantId = `VAR-EXP-SUP-${exp.factId}`;
      const sameType = explorerFacts
        .filter(f => f.type === exp.type)
        .map(f => f.name)
        .filter(name => name !== exp.name);
      const allNames = explorerFacts.map(f => f.name).filter(name => name !== exp.name);

      const candidateDistractors = sameType.length >= 3 ? sameType : allNames;
      const distractors = pickDeterministicDistractors(exp.name, candidateDistractors, seedBase + 707, 3);

      if (distractors && distractors.length === 3) {
        variants.push({
          id: variantId,
          category: 'explorer',
          topic: 'World Physical Wonders',
          difficulty: ['Mount Everest', 'Nile River', 'Amazon River', 'Sahara Desert', 'Mariana Trench'].includes(exp.name)
            ? 'beginner'
            : 'intermediate',
          question: `Which geographic feature is characterized as: "${exp.superlativeOrFeature}"?`,
          options: [exp.name, distractors[0], distractors[1], distractors[2]],
          correctAnswer: exp.name,
          explanation: `${exp.name} (${exp.location}) is recognized worldwide: ${exp.superlativeOrFeature}`,
          source: exp.verifiedSource,
          verifiedDate: exp.verifiedDate,
          sourceFactId: exp.factId,
          templateId: 'tpl_explorer_superlative_name',
        });
      }
    }
  }

  // 3. HISTORY FACTS TEMPLATES
  for (const hst of historyFacts) {
    const seedBase = hashString(`HST_${hst.factId}`);

    // --- TEMPLATE 8: Event/Kingdom -> Key Milestone ---
    {
      const variantId = `VAR-HST-EVT-${hst.factId}`;
      const otherTitles = historyFacts
        .map(f => f.title)
        .filter(title => title !== hst.title);
      const distractors = pickDeterministicDistractors(hst.title, otherTitles, seedBase + 808, 3);

      if (distractors && distractors.length === 3) {
        variants.push({
          id: variantId,
          category: 'history',
          topic: `${hst.region} History (${hst.era})`,
          difficulty: ['Athenian Democracy', 'Pax Romana', 'Magna Carta', 'Fall of the Berlin Wall'].includes(hst.title)
            ? 'beginner'
            : ['Mali Empire', 'Songhai Empire', 'Kingdom of Kush', 'Treaty of Tordesillas', 'Haitian Revolution'].includes(hst.title)
            ? 'intermediate'
            : 'advanced',
          question: `Which historical kingdom, empire, or milestone is associated with the following fact: "${hst.primaryKeyFact}"?`,
          options: [hst.title, distractors[0], distractors[1], distractors[2]],
          correctAnswer: hst.title,
          explanation: `${hst.title} (${hst.timePeriod}, ${hst.region}): ${hst.coreDescription} ${hst.primaryKeyFact}`,
          source: hst.verifiedSource,
          verifiedDate: hst.verifiedDate,
          sourceFactId: hst.factId,
          templateId: 'tpl_history_event_title',
        });
      }
    }
  }

  // 4. CURRENT AFFAIRS FACTS TEMPLATES
  for (const cur of currentAffairsFacts) {
    const seedBase = hashString(`CUR_${cur.factId}`);

    // --- TEMPLATE 9: Organization / Milestone Fact ---
    {
      const variantId = `VAR-CUR-ORG-${cur.factId}`;
      const otherOrgs = currentAffairsFacts
        .map(f => f.organizationOrEvent)
        .filter(org => org !== cur.organizationOrEvent);
      const distractors = pickDeterministicDistractors(cur.organizationOrEvent, otherOrgs, seedBase + 909, 3);

      if (distractors && distractors.length === 3) {
        variants.push({
          id: variantId,
          category: 'current_affairs',
          topic: cur.topic,
          difficulty: ['United Nations (UN)', 'Paris 2024 Olympic Summer Games', '2026 FIFA World Cup'].includes(cur.organizationOrEvent)
            ? 'beginner'
            : 'intermediate',
          question: `Regarding ${cur.topic} (${cur.eventDate}): "${cur.stableFactSummary}" — which entity or event is this?`,
          options: [cur.organizationOrEvent, distractors[0], distractors[1], distractors[2]],
          correctAnswer: cur.organizationOrEvent,
          explanation: `${cur.stableFactSummary} Source: ${cur.verifiedSource}.`,
          source: cur.verifiedSource,
          verifiedDate: cur.verifiedDate,
          sourceFactId: cur.factId,
          templateId: 'tpl_current_affairs_fact',
        });
      }
    }
  }

  const totalInputFacts = facts.length + explorerFacts.length + historyFacts.length + currentAffairsFacts.length;

  return {
    sourceFactsCount: totalInputFacts,
    generatedVariantsCount: variants.length,
    rejectedCount,
    rejectionReasons,
    variants,
  };
}
