/** Lightweight shared subject metadata. Deliberately contains no lesson bodies.
 * Published availability is computed from the database, never asserted here.
 * Adding metadata must not bypass the required year/subject coverage check.
 */
export type SubjectDefinition = {
  id: string;
  name: string;
  category: string;
  levels: string[];
  skills: string[];
  aliases?: string[];
  description?: string;
  jurisdiction?: string;
};

const ALL_LEVELS = ['EARLY_YEARS', 'PRIMARY', 'SECONDARY', 'POST_16', 'UNIVERSITY', 'ADULT_LEARNER'];
const SCHOOL = ['PRIMARY', 'SECONDARY'];
const SECONDARY_UP = ['SECONDARY', 'POST_16', 'UNIVERSITY', 'ADULT_LEARNER'];
const POST16_UP = ['POST_16', 'UNIVERSITY', 'ADULT_LEARNER'];
const UNI_UP = ['UNIVERSITY', 'ADULT_LEARNER'];

export const SUBJECTS: SubjectDefinition[] = [
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
  { id: 'further-maths', name: 'Further Mathematics', description: 'Complex numbers, matrix transformations, proof, polynomial structure and higher-dimensional mathematical reasoning.', category: 'Mathematics', levels: ['POST_16', 'UNIVERSITY'], skills: ['complex numbers', 'matrices', 'proof'], aliases: ['fm', 'further math'] },
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
  { id: 'law', name: 'Law', description: 'Legal institutions, precedent, statutory interpretation and reasoned application to disputes. Educational study, not legal advice.', jurisdiction: 'England and Wales', category: 'Law and Legal Studies', levels: ['UNIVERSITY'], skills: ['precedent', 'statutory interpretation', 'legal research', 'problem questions', 'advocacy'], aliases: ['legal studies', 'llb', 'jurisprudence'] },
  { id: 'uni-essay', name: 'Academic Writing and Essay Planning', category: 'University/Professional', levels: UNI_UP, skills: ['thesis', 'structure', 'citation'], aliases: ['essay writing', 'academic writing'] },
  { id: 'uni-coding', name: 'Programming and Software Engineering', category: 'University/Professional', levels: UNI_UP, skills: ['python', 'javascript', 'java', 'c++', 'sql'], aliases: ['coding', 'programming'] },
  { id: 'uni-stats', name: 'Statistics and Data Analysis', category: 'University/Professional', levels: UNI_UP, skills: ['inference', 'regression', 'hypothesis testing'], aliases: ['statistics'] },
  { id: 'uni-research', name: 'Research Methods and Critical Reading', category: 'University/Professional', levels: UNI_UP, skills: ['literature review', 'methodology critique'] },
  { id: 'uni-dissertation', name: 'Dissertation and Project Work', category: 'University/Professional', levels: UNI_UP, skills: ['planning', 'structuring'] }
];

