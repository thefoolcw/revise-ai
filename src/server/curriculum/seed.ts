import { getDb, schema } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Curriculum registry seed (§04, §05, §54).
 *
 * PROVENANCE DISCIPLINE:
 *  - Board and qualification NAMES are factual, public information.
 *  - Topic trees below are marked `ILLUSTRATIVE` because they have NOT been
 *    verified against a specific, dated specification. They exist so the app is
 *    usable, and the UI says so. An admin promotes them to VERIFIED_OFFICIAL by
 *    attaching a real specification record with a source URL and version.
 *  - No specification CODE is invented anywhere in this file.
 */

export const EXAM_BOARDS = [
  { id: 'aqa', name: 'AQA', shortName: 'AQA', country: 'GB', url: 'https://www.aqa.org.uk' },
  { id: 'edexcel', name: 'Pearson Edexcel', shortName: 'Edexcel', country: 'GB', url: 'https://qualifications.pearson.com' },
  { id: 'ocr', name: 'OCR', shortName: 'OCR', country: 'GB', url: 'https://www.ocr.org.uk' },
  { id: 'wjec', name: 'WJEC', shortName: 'WJEC', country: 'GB', url: 'https://www.wjec.co.uk' },
  { id: 'eduqas', name: 'Eduqas', shortName: 'Eduqas', country: 'GB', url: 'https://www.eduqas.co.uk' },
  { id: 'ccea', name: 'CCEA', shortName: 'CCEA', country: 'GB', url: 'https://www.ccea.org.uk' },
  { id: 'sqa', name: 'SQA', shortName: 'SQA', country: 'GB', url: 'https://www.sqa.org.uk' },
  { id: 'cambridge', name: 'Cambridge International', shortName: 'Cambridge', country: 'INT', url: 'https://www.cambridgeinternational.org' },
  { id: 'ib', name: 'International Baccalaureate', shortName: 'IB', country: 'INT', url: 'https://www.ibo.org' },
  { id: 'custom-school', name: 'School or custom syllabus', shortName: 'Custom', country: 'OTHER', url: null },
  { id: 'independent', name: 'Independent learner', shortName: 'Independent', country: 'OTHER', url: null }
] as const;

const UK_GCSE = ['aqa', 'edexcel', 'ocr', 'wjec', 'eduqas', 'ccea'];

export const QUALIFICATIONS = [
  { id: 'eyfs', name: 'Early Years Foundation Stage', level: 'EARLY_YEARS', ageBand: 'EARLY_YEARS', country: 'GB', boards: ['custom-school', 'independent'], orderIndex: 0 },
  { id: 'ks1', name: 'Key Stage 1 (Years 1–2)', level: 'PRIMARY', ageBand: 'PRIMARY', country: 'GB', boards: ['custom-school', 'independent'], orderIndex: 1 },
  { id: 'ks2', name: 'Key Stage 2 (Years 3–6)', level: 'PRIMARY', ageBand: 'PRIMARY', country: 'GB', boards: ['custom-school', 'independent'], orderIndex: 2 },
  { id: 'sats-7plus', name: '7+ / 11+ entrance preparation', level: 'PRIMARY', ageBand: 'PRIMARY', country: 'GB', boards: ['custom-school', 'independent'], orderIndex: 3 },
  { id: 'ks3', name: 'Key Stage 3 (Years 7–9)', level: 'SECONDARY', ageBand: 'SECONDARY', country: 'GB', boards: ['custom-school', 'independent'], orderIndex: 4 },
  { id: 'gcse', name: 'GCSE', level: 'SECONDARY', ageBand: 'SECONDARY', country: 'GB', boards: UK_GCSE, orderIndex: 5 },
  { id: 'igcse', name: 'International GCSE', level: 'SECONDARY', ageBand: 'SECONDARY', country: 'INT', boards: ['cambridge', 'edexcel'], orderIndex: 6 },
  { id: 'national5', name: 'National 5 (Scotland)', level: 'SECONDARY', ageBand: 'SECONDARY', country: 'GB', boards: ['sqa'], orderIndex: 7 },
  { id: 'higher', name: 'Higher (Scotland)', level: 'POST_16', ageBand: 'POST_16', country: 'GB', boards: ['sqa'], orderIndex: 8 },
  { id: 'as', name: 'AS Level', level: 'POST_16', ageBand: 'POST_16', country: 'GB', boards: ['aqa', 'edexcel', 'ocr', 'wjec', 'eduqas', 'ccea'], orderIndex: 9 },
  { id: 'alevel', name: 'A Level', level: 'POST_16', ageBand: 'POST_16', country: 'GB', boards: ['aqa', 'edexcel', 'ocr', 'wjec', 'eduqas', 'ccea'], orderIndex: 10 },
  { id: 'tlevel', name: 'T Level', level: 'POST_16', ageBand: 'POST_16', country: 'GB', boards: ['custom-school'], orderIndex: 11 },
  { id: 'btec', name: 'BTEC / vocational', level: 'POST_16', ageBand: 'POST_16', country: 'GB', boards: ['edexcel', 'wjec', 'custom-school'], orderIndex: 12 },
  { id: 'cambridge-o', name: 'Cambridge O Level', level: 'SECONDARY', ageBand: 'SECONDARY', country: 'INT', boards: ['cambridge'], orderIndex: 13 },
  { id: 'cambridge-as-a', name: 'Cambridge International AS & A Level', level: 'POST_16', ageBand: 'POST_16', country: 'INT', boards: ['cambridge'], orderIndex: 14 },
  { id: 'ib-dp', name: 'IB Diploma Programme', level: 'POST_16', ageBand: 'POST_16', country: 'INT', boards: ['ib'], orderIndex: 15 },
  { id: 'university', name: 'University module', level: 'UNIVERSITY', ageBand: 'UNIVERSITY', country: 'OTHER', boards: ['independent', 'custom-school'], orderIndex: 16 },
  { id: 'adult', name: 'Adult / professional learning', level: 'ADULT_LEARNER', ageBand: 'ADULT_LEARNER', country: 'OTHER', boards: ['independent'], orderIndex: 17 }
] as const;

const ALL_LEVELS = ['EARLY_YEARS', 'PRIMARY', 'SECONDARY', 'POST_16', 'UNIVERSITY', 'ADULT_LEARNER'];
const SCHOOL = ['PRIMARY', 'SECONDARY'];
const SECONDARY_UP = ['SECONDARY', 'POST_16', 'UNIVERSITY', 'ADULT_LEARNER'];
const POST16_UP = ['POST_16', 'UNIVERSITY', 'ADULT_LEARNER'];
const UNI_UP = ['UNIVERSITY', 'ADULT_LEARNER'];

export const SUBJECTS: { id: string; name: string; category: string; levels: string[]; skills: string[]; aliases?: string[] }[] = [
  // Early Years
  { id: 'ey-comm', name: 'Communication and Language', category: 'Early Years', levels: ['EARLY_YEARS'], skills: ['listening', 'speaking', 'vocabulary'] },
  { id: 'ey-pse', name: 'Personal, Social and Emotional Development', category: 'Early Years', levels: ['EARLY_YEARS'], skills: ['self-regulation', 'relationships'] },
  { id: 'ey-phys', name: 'Physical Development', category: 'Early Years', levels: ['EARLY_YEARS'], skills: ['gross motor', 'fine motor'] },
  { id: 'ey-literacy', name: 'Literacy Foundations', category: 'Early Years', levels: ['EARLY_YEARS'], skills: ['phonics', 'comprehension'], aliases: ['phonics'] },
  { id: 'ey-maths', name: 'Mathematics Foundations', category: 'Early Years', levels: ['EARLY_YEARS'], skills: ['counting', 'number sense', 'shape'] },
  { id: 'ey-world', name: 'Understanding the World', category: 'Early Years', levels: ['EARLY_YEARS'], skills: ['observation', 'curiosity'] },
  { id: 'ey-arts', name: 'Expressive Arts and Design', category: 'Early Years', levels: ['EARLY_YEARS'], skills: ['creativity', 'making'] },

  // Primary / Secondary core
  { id: 'english-lang', name: 'English Language', category: 'Languages', levels: [...SCHOOL, ...POST16_UP], skills: ['comprehension', 'analysis', 'writing'], aliases: ['english', 'eng lang'] },
  { id: 'english-lit', name: 'English Literature', category: 'Languages', levels: [...SCHOOL, ...POST16_UP], skills: ['textual analysis', 'context', 'essay'], aliases: ['eng lit', 'literature'] },
  { id: 'maths', name: 'Mathematics', category: 'Mathematics', levels: [...ALL_LEVELS], skills: ['arithmetic', 'algebra', 'geometry', 'statistics', 'proof'], aliases: ['math', 'maths', 'mathematics'] },
  { id: 'further-maths', name: 'Further Mathematics', category: 'Mathematics', levels: ['POST_16', 'UNIVERSITY'], skills: ['complex numbers', 'matrices', 'proof'], aliases: ['fm', 'further math'] },
  { id: 'science-combined', name: 'Combined Science', category: 'Sciences', levels: SCHOOL, skills: ['experimental method', 'data interpretation'], aliases: ['triple science', 'combined science'] },
  { id: 'biology', name: 'Biology', category: 'Sciences', levels: [...SCHOOL, ...POST16_UP], skills: ['processes', 'diagrams', 'experimental method'], aliases: ['bio'] },
  { id: 'chemistry', name: 'Chemistry', category: 'Sciences', levels: [...SCHOOL, ...POST16_UP], skills: ['equation balancing', 'molar calculations', 'units'], aliases: ['chem'] },
  { id: 'physics', name: 'Physics', category: 'Sciences', levels: [...SCHOOL, ...POST16_UP], skills: ['derivations', 'units', 'significant figures'], aliases: ['phys'] },
  { id: 'computer-science', name: 'Computer Science', category: 'Computing and Technology', levels: [...SCHOOL, ...POST16_UP], skills: ['algorithms', 'data structures', 'networking', 'databases'], aliases: ['comp sci', 'cs', 'computing'] },
  { id: 'geography', name: 'Geography', category: 'Humanities', levels: [...SCHOOL, ...POST16_UP], skills: ['case studies', 'data interpretation', 'evaluation'], aliases: ['geo'] },
  { id: 'history', name: 'History', category: 'Humanities', levels: [...SCHOOL, ...POST16_UP], skills: ['source analysis', 'cause and consequence', 'interpretations'], aliases: ['hist'] },
  { id: 'religious-studies', name: 'Religious Studies', category: 'Humanities', levels: [...SCHOOL, ...POST16_UP], skills: ['argument construction', 'evaluation'], aliases: ['rs', 're'] },
  { id: 'business', name: 'Business', category: 'Business and Economics', levels: [...SCHOOL, ...POST16_UP], skills: ['application', 'evaluation'], aliases: ['business studies'] },
  { id: 'economics', name: 'Economics', category: 'Business and Economics', levels: ['POST_16', 'UNIVERSITY', 'ADULT_LEARNER'], skills: ['diagrams', 'evaluation', 'data response'], aliases: ['econ'] },
  { id: 'psychology', name: 'Psychology', category: 'Social Sciences', levels: [...SCHOOL, ...POST16_UP], skills: ['studies', 'evaluation', 'research methods'], aliases: ['psych'] },
  { id: 'sociology', name: 'Sociology', category: 'Social Sciences', levels: [...SCHOOL, ...POST16_UP], skills: ['theories', 'evaluation'], aliases: ['soc'] },
  { id: 'politics', name: 'Politics', category: 'Social Sciences', levels: ['POST_16', 'UNIVERSITY'], skills: ['argument', 'evaluation'], aliases: ['government and politics'] },
  { id: 'philosophy', name: 'Philosophy', category: 'Humanities', levels: ['POST_16', 'UNIVERSITY'], skills: ['argument construction', 'evaluation'] },
  { id: 'french', name: 'French', category: 'Languages', levels: [...SCHOOL, ...POST16_UP], skills: ['listening', 'reading', 'writing', 'speaking'] },
  { id: 'spanish', name: 'Spanish', category: 'Languages', levels: [...SCHOOL, ...POST16_UP], skills: ['listening', 'reading', 'writing', 'speaking'] },
  { id: 'german', name: 'German', category: 'Languages', levels: [...SCHOOL, ...POST16_UP], skills: ['listening', 'reading', 'writing', 'speaking'] },
  { id: 'latin', name: 'Latin', category: 'Languages', levels: [...SCHOOL, ...POST16_UP], skills: ['translation', 'literature'] },
  { id: 'classical-civilisation', name: 'Classical Civilisation', category: 'Humanities', levels: [...SCHOOL, ...POST16_UP], skills: ['source analysis', 'essay'] },
  { id: 'art', name: 'Art and Design', category: 'Creative Arts', levels: [...SCHOOL, ...POST16_UP], skills: ['portfolio', 'annotation'] },
  { id: 'design-tech', name: 'Design and Technology', category: 'Engineering', levels: [...SCHOOL, ...POST16_UP], skills: ['design process', 'manufacture'] },
  { id: 'music', name: 'Music', category: 'Creative Arts', levels: [...SCHOOL, ...POST16_UP], skills: ['analysis', 'composition', 'performance'] },
  { id: 'drama', name: 'Drama', category: 'Creative Arts', levels: [...SCHOOL, ...POST16_UP], skills: ['devising', 'analysis'] },
  { id: 'media', name: 'Media Studies', category: 'Creative Arts', levels: [...SCHOOL, ...POST16_UP], skills: ['textual analysis', 'theory'] },
  { id: 'pe', name: 'Physical Education', category: 'Vocational', levels: [...SCHOOL, ...POST16_UP], skills: ['anatomy', 'training principles'] },
  { id: 'food-nutrition', name: 'Food Preparation and Nutrition', category: 'Vocational', levels: SCHOOL, skills: ['method', 'nutrition'] },
  { id: 'travel-tourism', name: 'Travel and Tourism', category: 'Vocational', levels: [...SCHOOL, ...POST16_UP], skills: ['application'] },
  { id: 'health-social-care', name: 'Health and Social Care', category: 'Health and Life Sciences', levels: [...SCHOOL, ...POST16_UP], skills: ['application', 'values of care'] },
  { id: 'engineering', name: 'Engineering', category: 'Engineering', levels: ['POST_16', 'UNIVERSITY'], skills: ['mechanics', 'materials'] },
  { id: 'pshe', name: 'PSHE and Citizenship', category: 'Study Skills', levels: SCHOOL, skills: ['decision making'] },
  { id: 'study-skills', name: 'Study Skills and Revision Technique', category: 'Study Skills', levels: ALL_LEVELS, skills: ['retrieval practice', 'spacing', 'planning'] },

  // University
  { id: 'uni-essay', name: 'Academic Writing and Essay Planning', category: 'University/Professional', levels: UNI_UP, skills: ['thesis', 'structure', 'citation'], aliases: ['essay writing', 'academic writing'] },
  { id: 'uni-coding', name: 'Programming and Software Engineering', category: 'University/Professional', levels: UNI_UP, skills: ['python', 'javascript', 'java', 'c++', 'sql'], aliases: ['coding', 'programming'] },
  { id: 'uni-stats', name: 'Statistics and Data Analysis', category: 'University/Professional', levels: UNI_UP, skills: ['inference', 'regression', 'hypothesis testing'], aliases: ['statistics'] },
  { id: 'uni-research', name: 'Research Methods and Critical Reading', category: 'University/Professional', levels: UNI_UP, skills: ['literature review', 'methodology critique'] },
  { id: 'uni-dissertation', name: 'Dissertation and Project Work', category: 'University/Professional', levels: UNI_UP, skills: ['planning', 'structuring'] }
];

/**
 * Illustrative topic trees. Explicitly NOT verified against a dated
 * specification — provenance is `ILLUSTRATIVE` and the UI says so.
 */
export const ILLUSTRATIVE_TOPICS: { subjectId: string; title: string; children?: string[] }[] = [
  { subjectId: 'maths', title: 'Number', children: ['Fractions, decimals and percentages', 'Indices and standard form', 'Bounds and estimation', 'Ratio and proportion'] },
  { subjectId: 'maths', title: 'Algebra', children: ['Expanding and factorising', 'Solving equations and inequalities', 'Simultaneous equations', 'Quadratics', 'Sequences', 'Algebraic fractions', 'Functions and graphs'] },
  { subjectId: 'maths', title: 'Ratio, Proportion and Rates of Change', children: ['Direct and inverse proportion', 'Compound measures', 'Rates of change'] },
  { subjectId: 'maths', title: 'Geometry and Measures', children: ['Angles and polygons', 'Circle theorems', 'Pythagoras and trigonometry', 'Vectors', 'Transformations', 'Constructions', 'Surface area and volume'] },
  { subjectId: 'maths', title: 'Probability', children: ['Venn diagrams', 'Tree diagrams', 'Conditional probability'] },
  { subjectId: 'maths', title: 'Statistics', children: ['Averages and range', 'Cumulative frequency and box plots', 'Scatter graphs and correlation', 'Sampling'] },

  { subjectId: 'biology', title: 'Cell Biology', children: ['Cell structure', 'Transport in cells', 'Cell division'] },
  { subjectId: 'biology', title: 'Organisation', children: ['Digestive system', 'Heart and blood', 'Plant tissues', 'Enzymes'] },
  { subjectId: 'biology', title: 'Infection and Response', children: ['Pathogens', 'Immunity', 'Antibiotics'] },
  { subjectId: 'biology', title: 'Bioenergetics', children: ['Photosynthesis', 'Respiration'] },
  { subjectId: 'biology', title: 'Homeostasis and Response', children: ['Nervous system', 'Hormones', 'Kidneys'] },
  { subjectId: 'biology', title: 'Inheritance, Variation and Evolution', children: ['DNA and genes', 'Inheritance', 'Evolution', 'Classification'] },
  { subjectId: 'biology', title: 'Ecology', children: ['Communities', 'Ecosystems', 'Biodiversity'] },

  { subjectId: 'chemistry', title: 'Atomic Structure and the Periodic Table', children: ['Atoms and isotopes', 'Electronic structure', 'Trends'] },
  { subjectId: 'chemistry', title: 'Bonding, Structure and Properties', children: ['Ionic bonding', 'Covalent bonding', 'Metallic bonding'] },
  { subjectId: 'chemistry', title: 'Quantitative Chemistry', children: ['Moles', 'Concentration', 'Yield and atom economy'] },
  { subjectId: 'chemistry', title: 'Chemical Changes', children: ['Reactivity series', 'Acids and bases', 'Electrolysis'] },
  { subjectId: 'chemistry', title: 'Energy Changes and Rates', children: ['Exothermic and endothermic', 'Rate of reaction', 'Reversible reactions'] },
  { subjectId: 'chemistry', title: 'Organic Chemistry', children: ['Alkanes and alkenes', 'Alcohols and acids', 'Polymers'] },

  { subjectId: 'physics', title: 'Energy', children: ['Energy stores and transfers', 'Efficiency', 'Power'] },
  { subjectId: 'physics', title: 'Electricity', children: ['Current and charge', 'Series and parallel circuits', 'Mains electricity'] },
  { subjectId: 'physics', title: 'Particle Model of Matter', children: ['Density', 'States of matter', 'Specific heat capacity'] },
  { subjectId: 'physics', title: 'Forces', children: ['Speed and acceleration', 'Newton\'s laws', 'Momentum', 'Moments'] },
  { subjectId: 'physics', title: 'Waves', children: ['Wave properties', 'Sound', 'Electromagnetic spectrum', 'Lenses'] },
  { subjectId: 'physics', title: 'Magnetism and Electromagnetism', children: ['Magnetic fields', 'Motor effect', 'Transformers'] },
  { subjectId: 'physics', title: 'Atomic Structure', children: ['Radioactivity', 'Half-life', 'Nuclear equations'] },

  { subjectId: 'computer-science', title: 'Algorithms', children: ['Searching', 'Sorting', 'Complexity'] },
  { subjectId: 'computer-science', title: 'Programming Techniques', children: ['Variables and types', 'Selection and iteration', 'Subroutines', 'Arrays and files'] },
  { subjectId: 'computer-science', title: 'Data Representation', children: ['Binary', 'Images and sound', 'Compression'] },
  { subjectId: 'computer-science', title: 'Computer Systems', children: ['CPU and von Neumann', 'Memory and storage', 'Networks', 'Cyber security'] },
  { subjectId: 'computer-science', title: 'Databases and SQL', children: ['Relational design', 'Normalisation', 'SQL queries'] },
  { subjectId: 'computer-science', title: 'Boolean Logic', children: ['Logic gates', 'Truth tables', 'Simplification'] },

  { subjectId: 'english-lang', title: 'Reading', children: ['Retrieval and inference', 'Language analysis', 'Structure analysis', 'Comparison', 'Evaluation'] },
  { subjectId: 'english-lang', title: 'Writing', children: ['Descriptive writing', 'Narrative writing', 'Argument and persuasion', 'SPaG'] },

  { subjectId: 'english-lit', title: 'Shakespeare', children: ['Context', 'Character', 'Themes', 'Quotation'] },
  { subjectId: 'english-lit', title: '19th Century Novel', children: ['Plot', 'Character', 'Themes'] },
  { subjectId: 'english-lit', title: 'Modern Texts and Poetry', children: ['Anthology comparison', 'Unseen poetry'] },

  { subjectId: 'history', title: 'Historical Skills', children: ['Source utility and reliability', 'Interpretations', 'Causation', 'Significance', 'Change and continuity'] },

  { subjectId: 'geography', title: 'Physical Geography', children: ['Tectonics', 'Weather and climate', 'Ecosystems', 'Rivers', 'Coasts'] },
  { subjectId: 'geography', title: 'Human Geography', children: ['Urban issues', 'Development', 'Resource management'] },
  { subjectId: 'geography', title: 'Geographical Skills', children: ['Map skills', 'Data and graphs', 'Fieldwork'] },

  { subjectId: 'ey-literacy', title: 'Phonics', children: ['Letter sounds', 'Blending', 'Tricky words'] },
  { subjectId: 'ey-maths', title: 'Early Number', children: ['Counting to 10', 'Comparing amounts', 'Simple addition'] }
];

export const FEATURE_FLAGS = [
  { key: 'vision_solver', enabled: true, description: 'Solve questions from uploaded images' },
  { key: 'pdf_qa', enabled: true, description: 'Ask questions about uploaded documents' },
  { key: 'advanced_marking', enabled: true, description: 'Mark-scheme aligned essay feedback' },
  { key: 'exam_mode', enabled: true, description: 'Timed exam simulation' },
  { key: 'premium_redemption_v2', enabled: true, description: 'Atomic key redemption pipeline' },
  { key: 'new_tutor_ui', enabled: true, description: 'Streaming tutor workspace' }
] as const;

export async function seedCurriculum(): Promise<{ boards: number; quals: number; subjects: number; topics: number; aliases: number; flags: number }> {
  const db = await getDb();

  for (const b of EXAM_BOARDS) {
    await db.insert(schema.examBoards).values({ ...b }).onConflictDoUpdate({ target: schema.examBoards.id, set: { name: b.name, shortName: b.shortName, url: b.url, updatedAt: new Date() } });
  }
  for (const q of QUALIFICATIONS) {
    await db.insert(schema.qualifications).values({ ...q, boards: [...q.boards] })
      .onConflictDoUpdate({ target: schema.qualifications.id, set: { name: q.name, level: q.level, ageBand: q.ageBand, boards: [...q.boards], orderIndex: q.orderIndex, updatedAt: new Date() } });
  }

  let aliasCount = 0;
  for (const s of SUBJECTS) {
    const { aliases, ...rest } = s;
    await db.insert(schema.subjects).values({ ...rest }).onConflictDoUpdate({ target: schema.subjects.id, set: { name: s.name, category: s.category, levels: s.levels, skills: s.skills, updatedAt: new Date() } });
    const names = [s.name.toLowerCase(), ...(aliases ?? [])];
    for (const a of names) {
      await db.insert(schema.subjectAliases).values({ alias: a, subjectId: s.id }).onConflictDoNothing();
      aliasCount++;
    }
  }

  let topicCount = 0;
  for (const group of ILLUSTRATIVE_TOPICS) {
    const parentSlug = `ill-${group.subjectId}-${slugify(group.title)}`;
    await db.insert(schema.topics).values({
      id: crypto.randomUUID(), slug: parentSlug, subjectId: group.subjectId,
      title: group.title, orderIndex: topicCount, provenance: 'ILLUSTRATIVE', status: 'PUBLISHED'
    }).onConflictDoUpdate({ target: schema.topics.slug, set: { title: group.title, subjectId: group.subjectId } });
    topicCount++;
    const parent = await db.select({ id: schema.topics.id }).from(schema.topics).where(sql`${schema.topics.slug} = ${parentSlug}`).limit(1);
    const parentId = parent[0]?.id ?? null;
    for (const child of group.children ?? []) {
      const childSlug = `ill-${group.subjectId}-${slugify(group.title)}-${slugify(child)}`;
      await db.insert(schema.topics).values({
        id: crypto.randomUUID(), slug: childSlug, parentId, subjectId: group.subjectId,
        title: child, orderIndex: topicCount, provenance: 'ILLUSTRATIVE', status: 'PUBLISHED'
      }).onConflictDoUpdate({ target: schema.topics.slug, set: { title: child, parentId } });
      topicCount++;
    }
  }

  for (const f of FEATURE_FLAGS) {
    await db.insert(schema.featureFlags).values({ ...f }).onConflictDoNothing();
  }

  return { boards: EXAM_BOARDS.length, quals: QUALIFICATIONS.length, subjects: SUBJECTS.length, topics: topicCount, aliases: aliasCount, flags: FEATURE_FLAGS.length };
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}
