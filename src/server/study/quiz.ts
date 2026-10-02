/**
 * Structured-output validation for generated quizzes (§58).
 * Rejects malformed questions BEFORE they reach a learner, rather than
 * silently rendering nonsense.
 */
export type QuizType = 'SINGLE' | 'MULTI' | 'TRUE_FALSE' | 'SHORT' | 'NUMERIC';
export type GeneratedQuestion = {
  type: QuizType; prompt: string;
  options?: { id: string; label: string }[];
  answer: unknown; explanation?: string; difficulty?: string;
};

export type ValidationResult =
  | { ok: true; question: GeneratedQuestion }
  | { ok: false; reason: string };

export function validateQuestion(q: unknown): ValidationResult {
  if (!q || typeof q !== 'object') return { ok: false, reason: 'not an object' };
  const c = q as Record<string, unknown>;

  const type = String(c.type ?? '').toUpperCase() as QuizType;
  if (!['SINGLE', 'MULTI', 'TRUE_FALSE', 'SHORT', 'NUMERIC'].includes(type)) return { ok: false, reason: 'unknown question type' };

  const prompt = typeof c.prompt === 'string' ? c.prompt.trim() : '';
  if (prompt.length < 8) return { ok: false, reason: 'prompt too short' };

  const explanation = typeof c.explanation === 'string' ? c.explanation.trim() : '';
  if (explanation.length < 5) return { ok: false, reason: 'answer has no explanation' };

  if (type === 'SINGLE' || type === 'MULTI') {
    const raw = Array.isArray(c.options) ? c.options : [];
    const options = raw.filter((o): o is { id: string; label: string } =>
      !!o && typeof o === 'object' && typeof (o as any).label === 'string' && (o as any).label.trim().length > 0);
    if (options.length < 2) return { ok: false, reason: 'needs at least two options' };

    const labels = options.map((o) => o.label.trim().toLowerCase());
    if (new Set(labels).size !== labels.length) return { ok: false, reason: 'duplicate options' };
    const ids = options.map((o) => String(o.id ?? o.label));
    if (new Set(ids).size !== ids.length) return { ok: false, reason: 'duplicate option ids' };

    if (type === 'SINGLE') {
      const ans = String(c.answer ?? '');
      if (!ids.includes(ans)) return { ok: false, reason: 'correct option does not exist' };
    } else {
      const ans = Array.isArray(c.answer) ? c.answer.map(String) : [];
      if (ans.length < 1) return { ok: false, reason: 'multi-select needs an answer' };
      if (!ans.every((a) => ids.includes(a))) return { ok: false, reason: 'answer references a missing option' };
      if (ans.length === options.length) return { ok: false, reason: 'option leakage: every option is correct' };
    }
    return { ok: true, question: { type, prompt, options: options.map((o, i) => ({ id: String(o.id ?? `opt_${i}`), label: o.label.trim() })), answer: c.answer, explanation, difficulty: normDiff(c.difficulty) } };
  }

  if (type === 'TRUE_FALSE') {
    const ans = c.answer;
    if (typeof ans !== 'boolean') return { ok: false, reason: 'true/false needs a boolean answer' };
    return { ok: true, question: { type, prompt, options: [{ id: 'true', label: 'True' }, { id: 'false', label: 'False' }], answer: ans, explanation, difficulty: normDiff(c.difficulty) } };
  }

  if (type === 'NUMERIC') {
    const ans = Number(c.answer);
    if (!Number.isFinite(ans)) return { ok: false, reason: 'numeric answer is not a number' };
    return { ok: true, question: { type, prompt, options: [], answer: ans, explanation, difficulty: normDiff(c.difficulty) } };
  }

  // SHORT
  const ans = c.answer;
  const accepted = Array.isArray(ans) ? ans.map((x) => String(x).trim().toLowerCase()).filter(Boolean)
    : typeof ans === 'string' && ans.trim() ? [ans.trim().toLowerCase()] : [];
  if (accepted.length === 0) return { ok: false, reason: 'short answer needs an accepted answer' };
  return { ok: true, question: { type, prompt, options: [], answer: accepted, explanation, difficulty: normDiff(c.difficulty) } };
}

export function gradeQuestion(q: GeneratedQuestion, given: unknown): boolean {
  switch (q.type) {
    case 'SINGLE': return String(given) === String(q.answer);
    case 'MULTI': {
      const a = new Set(Array.isArray(q.answer) ? q.answer.map(String) : []);
      const g = new Set(Array.isArray(given) ? given.map(String) : []);
      return a.size === g.size && [...a].every((x) => g.has(x));
    }
    case 'TRUE_FALSE': return String(given).toLowerCase() === String(q.answer).toLowerCase();
    case 'NUMERIC': {
      const g = Number(given);
      if (!Number.isFinite(g)) return false;
      const a = Number(q.answer);
      return Math.abs(g - a) <= Math.max(1e-6, Math.abs(a) * 1e-6);
    }
    case 'SHORT': {
      const norm = String(given ?? '').trim().toLowerCase().replace(/[.!?,]/g, '');
      const accepted = Array.isArray(q.answer) ? q.answer.map(String) : [String(q.answer)];
      return accepted.some((a) => a === norm);
    }
    default: return false;
  }
}

/** Drops malformed entries and de-duplicates by prompt. */
export function sanitiseQuiz(raw: unknown[], max = 20): { questions: GeneratedQuestion[]; rejected: number } {
  const seen = new Set<string>();
  const questions: GeneratedQuestion[] = [];
  let rejected = 0;
  for (const item of raw) {
    if (questions.length >= max) break;
    const v = validateQuestion(item);
    if (!v.ok) { rejected++; continue; }
    const key = v.question.prompt.toLowerCase().slice(0, 120);
    if (seen.has(key)) { rejected++; continue; }
    seen.add(key);
    questions.push(v.question);
  }
  return { questions, rejected };
}

function normDiff(d: unknown): string {
  const s = String(d ?? 'MEDIUM').toUpperCase();
  return ['EASY', 'MEDIUM', 'HARD'].includes(s) ? s : 'MEDIUM';
}
