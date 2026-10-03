import assert from 'node:assert/strict';
import { curriculumLessons, curriculumCoverage } from '../src/server/curriculum/catalogue';
import { ALL_YEAR_GROUPS, getYearMeta } from '../src/server/curriculum/types';
import { SUBJECTS } from '../src/server/curriculum/seed';

const ids = new Set<string>();
const teaching = new Set<string>();
const registered = new Set(SUBJECTS.map(s => s.id));
for (const year of ALL_YEAR_GROUPS) for (const subject of year.subjectIds) assert(registered.has(subject), `Unregistered subject: ${year.id}/${subject}`);
for (const lesson of curriculumLessons) {
  assert(!ids.has(lesson.id), `Duplicate lesson id: ${lesson.id}`); ids.add(lesson.id);
  const year = getYearMeta(lesson.year)!;
  assert(year && year.stageId === lesson.educationStage, `Invalid stage/year: ${lesson.id}`);
  assert(year.subjectIds.includes(lesson.subject), `Invalid subject: ${lesson.id}`);
  assert(lesson.content.length && lesson.content.every(s => s.body.trim().length >= 100), `Insufficient teaching: ${lesson.id}`);
  const text = lesson.content.map(s => s.body).join('\n');
  assert(!teaching.has(text), `Repeated teaching: ${lesson.id}`); teaching.add(text);
  assert(lesson.examples.some(e => e.steps.length >= 3 && e.finalAnswer), `Missing worked steps: ${lesson.id}`);
  assert(lesson.learningObjectives.length && lesson.memoryTips.length && lesson.commonMistakes.length && lesson.quickRecall.length && lesson.recap.length, `Missing teaching fields: ${lesson.id}`);
  assert(lesson.practiceQuestions.length && lesson.practiceQuestions.every(q => lesson.answers.some(a => a.questionId === q.id && a.answer)), `Missing linked answers: ${lesson.id}`);
  assert(!/coming soon|placeholder/i.test(JSON.stringify(lesson)), `Placeholder: ${lesson.id}`);
}
const coverage = curriculumCoverage();
const rows = ALL_YEAR_GROUPS.map(year => {
  const subjects = coverage[year.id] ?? {};
  const complete = year.subjectIds.filter(subject => {
    const topics = subjects[subject] ?? {};
    return Object.keys(topics).length >= 2 && Object.entries(topics).every(([title, count]) => {
      const lessons = curriculumLessons.filter(l => l.year === year.id && l.subject === subject && l.topicTitle === title);
      return count >= 2 && lessons.some(l => l.isPremium) && lessons.some(l => !l.isPremium);
    });
  });
  return { year: year.id, coveredSubjects: `${complete.length}/${year.subjectIds.length}`,
    lessons: curriculumLessons.filter(l => l.year === year.id).length,
    covered: complete.length === year.subjectIds.length };
});
console.table(rows);
console.log(`${curriculumLessons.length} distinct authored lessons validated. Coverage is structural, not a certification of complete syllabus coverage or expert review.`);
const missing = rows.filter(r => !r.covered).map(r => r.year);
if (missing.length) {
  console.log(`REMAINING: ${missing.join(', ')}`);
  if (process.argv.includes('--require-all')) process.exitCode = 1;
}
