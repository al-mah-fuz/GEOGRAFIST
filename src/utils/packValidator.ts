import { CategoryId, Difficulty, Question, QuestionCategory, QuestionPackManifest, QuestionPackRecord } from '../types';

export interface RowValidationError {
  rowIndex: number;
  questionId?: string;
  field: string;
  message: string;
}

export interface PackValidationReport {
  isManifestValid: boolean;
  manifestMeta?: {
    formatVersion: string;
    packId: string;
    packTitle: string;
    description: string;
    author: string;
    license: string;
    createdAt: string;
  };
  totalCount: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  validQuestions: Question[];
  invalidRows: {
    rowIndex: number;
    recordId?: string;
    questionText?: string;
    errors: string[];
  }[];
  categoryBreakdown: Partial<Record<CategoryId, number>>;
  difficultyBreakdown: Partial<Record<Difficulty, number>>;
}

const VALID_CATEGORIES: QuestionCategory[] = ['flags', 'capitals', 'history', 'current_affairs', 'explorer'];
const VALID_DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];

/**
 * Validates a QuestionPack JSON string against the strict versioned schema.
 * Provides row-level error reporting, duplicate detection, and sanitization.
 */
export function validateQuestionPackJson(
  rawJson: string,
  existingBank: Question[] = []
): PackValidationReport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch (e) {
    return {
      isManifestValid: false,
      totalCount: 0,
      validCount: 0,
      invalidCount: 1,
      duplicateCount: 0,
      validQuestions: [],
      invalidRows: [
        {
          rowIndex: 0,
          errors: ['SyntaxError: Malformed JSON string could not be parsed.'],
        },
      ],
      categoryBreakdown: {},
      difficultyBreakdown: {},
    };
  }

  let records: unknown[] = [];
  let manifestMeta: PackValidationReport['manifestMeta'];

  if (Array.isArray(parsed)) {
    records = parsed;
    manifestMeta = {
      formatVersion: '1.0',
      packId: `pack_${Date.now()}`,
      packTitle: 'Imported Question Pack',
      description: 'Imported question list without envelope manifest',
      author: 'Local User',
      license: 'Curated Dataset',
      createdAt: new Date().toISOString(),
    };
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.records)) {
      records = obj.records;
      manifestMeta = {
        formatVersion: String(obj.formatVersion || '1.0'),
        packId: String(obj.packId || `pack_${Date.now()}`),
        packTitle: String(obj.packTitle || 'Imported Question Pack'),
        description: String(obj.description || 'Imported verified question pack'),
        author: String(obj.author || 'Contributor'),
        license: String(obj.license || 'Public Factual Data'),
        createdAt: String(obj.createdAt || new Date().toISOString()),
      };
    } else {
      return {
        isManifestValid: false,
        totalCount: 0,
        validCount: 0,
        invalidCount: 1,
        duplicateCount: 0,
        validQuestions: [],
        invalidRows: [
          {
            rowIndex: 0,
            errors: ['Invalid Pack: JSON must be an array of question records or contain a "records" array.'],
          },
        ],
        categoryBreakdown: {},
        difficultyBreakdown: {},
      };
    }
  } else {
    return {
      isManifestValid: false,
      totalCount: 0,
      validCount: 0,
      invalidCount: 1,
      duplicateCount: 0,
      validQuestions: [],
      invalidRows: [
        {
          rowIndex: 0,
          errors: ['Root JSON structure must be an object or array.'],
        },
      ],
      categoryBreakdown: {},
      difficultyBreakdown: {},
    };
  }

  const existingIds = new Set(existingBank.map(q => q.id.toLowerCase()));
  const seenInPack = new Set<string>();

  const validQuestions: Question[] = [];
  const invalidRows: PackValidationReport['invalidRows'] = [];
  const categoryBreakdown: Partial<Record<CategoryId, number>> = {};
  const difficultyBreakdown: Partial<Record<Difficulty, number>> = {};
  let duplicateCount = 0;

  records.forEach((rawItem, idx) => {
    const rowNum = idx + 1;
    const errors: string[] = [];

    if (!rawItem || typeof rawItem !== 'object') {
      invalidRows.push({
        rowIndex: rowNum,
        errors: [`Row ${rowNum}: Item is not a valid JSON object.`],
      });
      return;
    }

    const item = rawItem as Record<string, unknown>;

    // 1. ID Validation
    const id = typeof item.id === 'string' ? item.id.trim() : '';
    if (!id) {
      errors.push(`Row ${rowNum}: Missing required unique "id".`);
    } else {
      const lowerId = id.toLowerCase();
      if (seenInPack.has(lowerId)) {
        errors.push(`Row ${rowNum}: Duplicate question ID "${id}" detected within this pack.`);
        duplicateCount++;
      } else {
        seenInPack.add(lowerId);
      }

      if (existingIds.has(lowerId)) {
        errors.push(`Row ${rowNum}: Question ID "${id}" already exists in the production question bank.`);
        duplicateCount++;
      }
    }

    // 2. Category Validation
    const rawCat = typeof item.category === 'string' ? item.category.trim().toLowerCase() : '';
    const cat = VALID_CATEGORIES.includes(rawCat as QuestionCategory) ? (rawCat as QuestionCategory) : null;
    if (!cat) {
      errors.push(`Row ${rowNum}: Invalid category "${item.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}.`);
    }

    // 3. Topic Validation
    const topic = typeof item.topic === 'string' ? item.topic.trim() : '';
    if (!topic) {
      errors.push(`Row ${rowNum}: Missing required "topic" label.`);
    }

    // 4. Difficulty Validation
    const diff = typeof item.difficulty === 'string' ? (item.difficulty.trim().toLowerCase() as Difficulty) : null;
    if (!diff || !VALID_DIFFICULTIES.includes(diff)) {
      errors.push(`Row ${rowNum}: Invalid difficulty "${item.difficulty}". Must be one of: ${VALID_DIFFICULTIES.join(', ')}.`);
    }

    // 5. Question Text Validation
    const questionText = typeof item.question === 'string' ? item.question.trim() : '';
    if (!questionText || questionText.length < 10) {
      errors.push(`Row ${rowNum}: Question text must be at least 10 characters long.`);
    }

    // 6. Options Extraction & Validation
    const rawOptions = item.options;
    let optionTexts: string[] = [];

    if (Array.isArray(rawOptions)) {
      optionTexts = rawOptions.map(opt => {
        if (typeof opt === 'string') return opt.trim();
        if (opt && typeof opt === 'object' && typeof (opt as { text?: unknown }).text === 'string') {
          return (opt as { text: string }).text.trim();
        }
        return '';
      });
    }

    if (optionTexts.length !== 4) {
      errors.push(`Row ${rowNum}: Exactly 4 answer options required (found ${optionTexts.length}).`);
    } else if (optionTexts.some(o => !o)) {
      errors.push(`Row ${rowNum}: All 4 answer options must be non-empty.`);
    } else {
      // Check for duplicate options
      const uniqueOptions = new Set(optionTexts.map(o => o.toLowerCase()));
      if (uniqueOptions.size !== 4) {
        errors.push(`Row ${rowNum}: Duplicate answer options detected inside choices.`);
      }
    }

    // 7. Correct Answer Validation
    const correctAnswer = typeof item.correctAnswer === 'string' ? item.correctAnswer.trim() : '';
    let resolvedCorrectAnswer = correctAnswer;

    // Check if correctOptionId was provided
    if (!resolvedCorrectAnswer && typeof item.correctOptionId === 'string' && Array.isArray(rawOptions)) {
      const matchOpt = rawOptions.find(o => o && typeof o === 'object' && (o as { id?: string }).id === item.correctOptionId);
      if (matchOpt && typeof (matchOpt as { text?: string }).text === 'string') {
        resolvedCorrectAnswer = (matchOpt as { text: string }).text.trim();
      }
    }

    if (!resolvedCorrectAnswer) {
      errors.push(`Row ${rowNum}: Missing "correctAnswer" reference.`);
    } else if (optionTexts.length === 4 && !optionTexts.includes(resolvedCorrectAnswer)) {
      errors.push(`Row ${rowNum}: Correct answer "${resolvedCorrectAnswer}" does not match any of the 4 answer choices.`);
    }

    // 8. Explanation Validation
    const explanation = typeof item.explanation === 'string' ? item.explanation.trim() : '';
    if (!explanation || explanation.length < 10) {
      errors.push(`Row ${rowNum}: Educational explanation must be at least 10 characters.`);
    }

    // 9. Source Title Validation
    const sourceTitle =
      typeof item.sourceTitle === 'string'
        ? item.sourceTitle.trim()
        : typeof item.source === 'string'
        ? item.source.trim()
        : '';
    if (!sourceTitle) {
      errors.push(`Row ${rowNum}: Missing verified source title/citation.`);
    }

    // 10. Verified Date Validation (YYYY-MM)
    const verifiedDate = typeof item.verifiedDate === 'string' ? item.verifiedDate.trim() : '';
    if (!verifiedDate || !/^\d{4}-\d{2}$/.test(verifiedDate)) {
      errors.push(`Row ${rowNum}: Verified date must follow the format YYYY-MM (e.g. "2024-06").`);
    }

    if (errors.length > 0) {
      invalidRows.push({
        rowIndex: rowNum,
        recordId: id || undefined,
        questionText: questionText ? questionText.slice(0, 70) + '...' : undefined,
        errors,
      });
    } else if (cat && diff) {
      // Valid record!
      const validQ: Question = {
        id,
        category: cat,
        topic,
        difficulty: diff,
        question: questionText,
        options: optionTexts as [string, string, string, string],
        correctAnswer: resolvedCorrectAnswer,
        explanation,
        source: sourceTitle,
        verifiedDate,
        language: typeof item.language === 'string' ? item.language.trim() : 'en',
        sourceUrl: typeof item.sourceUrl === 'string' ? item.sourceUrl.trim() : undefined,
        isTimeSensitive: typeof item.isTimeSensitive === 'boolean' ? item.isTimeSensitive : cat === 'current_affairs',
        eventDate: typeof item.eventDate === 'string' ? item.eventDate.trim() : undefined,
        tags: Array.isArray(item.tags) ? item.tags.filter(t => typeof t === 'string') : undefined,
        sourceFactId: typeof item.sourceFactId === 'string' ? item.sourceFactId.trim() : undefined,
        templateId: typeof item.templateId === 'string' ? item.templateId.trim() : undefined,
        media: item.media && typeof item.media === 'object' ? (item.media as Question['media']) : undefined,
      };

      validQuestions.push(validQ);
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      difficultyBreakdown[diff] = (difficultyBreakdown[diff] || 0) + 1;
    }
  });

  return {
    isManifestValid: true,
    manifestMeta,
    totalCount: records.length,
    validCount: validQuestions.length,
    invalidCount: invalidRows.length,
    duplicateCount,
    validQuestions,
    invalidRows,
    categoryBreakdown,
    difficultyBreakdown,
  };
}

/**
 * Creates an exportable JSON pack string from an array of Question objects
 */
export function exportQuestionsToPackJson(
  questions: Question[],
  meta: Partial<QuestionPackManifest> = {}
): string {
  const manifest: QuestionPackManifest = {
    formatVersion: '1.0',
    packId: meta.packId || `geografist_export_${Date.now()}`,
    packTitle: meta.packTitle || 'GEOGRAFIST Verified Question Pack',
    description: meta.description || 'Exported verified world-knowledge question dataset',
    author: meta.author || 'GEOGRAFIST Contributor',
    license: meta.license || 'Curated Dataset / Primary Attribution Preserved',
    createdAt: new Date().toISOString(),
    records: questions.map(q => ({
      id: q.id,
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      language: q.language || 'en',
      question: q.question,
      options: q.options.map((optText, idx) => ({
        id: `opt_${idx + 1}`,
        text: optText,
      })),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      sourceTitle: q.source,
      sourceUrl: q.sourceUrl,
      verifiedDate: q.verifiedDate,
      isTimeSensitive: q.isTimeSensitive,
      eventDate: q.eventDate,
      tags: q.tags,
      media: q.media,
      sourceFactId: q.sourceFactId,
      templateId: q.templateId,
    })),
  };

  return JSON.stringify(manifest, null, 2);
}

/**
 * Built-in bundled sample packs for instant testing & evaluation
 */
export const SAMPLE_EXPANSION_PACK_AFRICA = JSON.stringify(
  {
    formatVersion: '1.0',
    packId: 'pack_exp_africa_history_01',
    packTitle: 'African Kingdoms & Civilization Landmarks Pack',
    description: '10 verified questions on African civilizations, trade networks, and historical milestones.',
    author: 'UNESCO & African Historical Society Curations',
    license: 'Public Educational Attribution',
    createdAt: '2024-06-01T00:00:00.000Z',
    records: [
      {
        id: 'EXP-AFR-001',
        category: 'history',
        topic: 'West African Civilizations',
        difficulty: 'intermediate',
        language: 'en',
        question: 'Which prominent empire along the Niger River was famous for its earthen mosques in Djenné and the scholarly Sankore Madrasah in Timbuktu?',
        options: [
          { id: 'opt_1', text: 'Songhai Empire' },
          { id: 'opt_2', text: 'Mali Empire' },
          { id: 'opt_3', text: 'Kingdom of Benin' },
          { id: 'opt_4', text: 'Oyo Empire' },
        ],
        correctAnswer: 'Mali Empire',
        explanation: 'The Mali Empire flourished between the 13th and 16th centuries, renowned for its centers of scholarship and Islamic learning under Sundiata Keita and Mansa Musa.',
        sourceTitle: 'UNESCO World Heritage List (#119) / Timbuktu Manuscripts Project',
        sourceUrl: 'https://whc.unesco.org/en/list/119/',
        verifiedDate: '2024-06',
        tags: ['africa', 'mali', 'timbuktu', 'scholarship'],
      },
      {
        id: 'EXP-AFR-002',
        category: 'explorer',
        topic: 'African Hydrography',
        difficulty: 'advanced',
        language: 'en',
        question: 'Which river in southern Africa empties into the Indian Ocean via Mozambique and forms the spectacular Victoria Falls along the Zambia-Zimbabwe border?',
        options: [
          { id: 'opt_1', text: 'Zambezi River' },
          { id: 'opt_2', text: 'Limpopo River' },
          { id: 'opt_3', text: 'Congo River' },
          { id: 'opt_4', text: 'Orange River' },
        ],
        correctAnswer: 'Zambezi River',
        explanation: 'The Zambezi is the fourth-longest river in Africa, stretching 2,574 km and supporting the Kariba and Cahora Bassa hydroelectric dams.',
        sourceTitle: 'Zambezi River Authority (ZRA) Official Hydrographic Records',
        sourceUrl: 'https://www.zambezira.org/',
        verifiedDate: '2024-05',
        tags: ['africa', 'rivers', 'zambezi', 'waterfalls'],
      },
      {
        id: 'EXP-AFR-003',
        category: 'capitals',
        topic: 'African Capitals',
        difficulty: 'intermediate',
        language: 'en',
        question: 'What is the capital city of Senegal, situated on the Cap-Vert peninsula as the westernmost city of the African mainland?',
        options: [
          { id: 'opt_1', text: 'Dakar' },
          { id: 'opt_2', text: 'Banjul' },
          { id: 'opt_3', text: 'Conakry' },
          { id: 'opt_4', text: 'Bissau' },
        ],
        correctAnswer: 'Dakar',
        explanation: 'Dakar is the economic and political capital of Senegal, founded on the Cap-Vert peninsula jutting into the Atlantic Ocean.',
        sourceTitle: 'National Statistics and Demography Agency of Senegal',
        sourceUrl: 'https://www.ansd.sn/',
        verifiedDate: '2024-04',
        tags: ['capitals', 'senegal', 'dakar'],
      },
      {
        id: 'EXP-AFR-004',
        category: 'history',
        topic: 'Ancient Nubia',
        difficulty: 'expert',
        language: 'en',
        question: 'In ancient Meroë (modern Sudan), royal tombs were characterized by over two hundred distinctive steep-angled pyramids constructed for rulers of which kingdom?',
        options: [
          { id: 'opt_1', text: 'Kingdom of Kush' },
          { id: 'opt_2', text: 'Kingdom of Aksum' },
          { id: 'opt_3', text: 'Nok Civilization' },
          { id: 'opt_4', text: 'Carthaginian Empire' },
        ],
        correctAnswer: 'Kingdom of Kush',
        explanation: 'The Kingdom of Kush had its capital at Meroë from around 300 BCE to 350 CE, featuring steep-sided sandstone pyramids and rich ironworking traditions.',
        sourceTitle: 'Sudan National Museum / UNESCO Archaeological Sites of Meroe',
        sourceUrl: 'https://whc.unesco.org/en/list/1336/',
        verifiedDate: '2024-06',
        tags: ['africa', 'sudan', 'pyramids', 'kush'],
      },
      {
        id: 'EXP-AFR-005',
        category: 'flags',
        topic: 'African Vexillology',
        difficulty: 'beginner',
        language: 'en',
        question: 'Which African nation’s flag features two horizontal bands of light blue separated by a white-bordered horizontal black stripe?',
        options: [
          { id: 'opt_1', text: 'Botswana' },
          { id: 'opt_2', text: 'Somalia' },
          { id: 'opt_3', text: 'Djibouti' },
          { id: 'opt_4', text: 'Lesotho' },
        ],
        correctAnswer: 'Botswana',
        explanation: 'Adopted in September 1966, Botswana’s flag features light blue symbolizing rain (pula) and water, with black and white symbolizing racial harmony.',
        sourceTitle: 'National Symbols of Botswana Act',
        sourceUrl: 'https://www.gov.bw/',
        verifiedDate: '2024-03',
        tags: ['flags', 'botswana', 'vexillology'],
      },
    ],
  },
  null,
  2
);
