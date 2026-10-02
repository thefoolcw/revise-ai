/**
 * Deterministic arithmetic/units layer (§96). The language model explains;
 * this module computes. Keeps the app from relying on LLM arithmetic.
 */

export type ArithResult = { value: number; expression: string };

const TOKEN_RE = /\s*(?:([0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?)|([+\-*/^()]))\s*/y;

/**
 * Shunting-yard evaluator for +, -, *, /, ^ and parentheses. Throws on malformed input
 * rather than guessing. Deliberately small: this is a calculator, not a CAS.
 */
export function evaluate(expression: string): number {
  const out: number[] = [];
  const ops: string[] = [];
  const prec: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
  const rightAssoc = new Set(['^']);
  let i = 0; let expectOperand = true;

  while (i < expression.length) {
    TOKEN_RE.lastIndex = i;
    const m = TOKEN_RE.exec(expression);
    if (!m) throw new Error(`Cannot parse "${expression}" at position ${i}`);
    i = TOKEN_RE.lastIndex;
    const num = m[1]; const op = m[2];

    if (num !== undefined) {
      let v = Number(num);
      if (expectOperand === false) throw new Error('Two values in a row.');
      // Unary minus
      if (ops[ops.length - 1] === 'u-') { v = -v; ops.pop(); }
      out.push(v);
      expectOperand = false;
      continue;
    }
    if (op === undefined) throw new Error(`Cannot parse \"${expression}\" at position ${i}`);
    if (op === '(') { ops.push('('); expectOperand = true; continue; }
    if (op === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') apply(out, ops.pop()!);
      if (!ops.length) throw new Error('Unmatched closing parenthesis.');
      ops.pop();
      expectOperand = false;
      continue;
    }
    // operator
    if (expectOperand) {
      if (op === '-') { ops.push('u-'); continue; }
      if (op === '+') { continue; }
      throw new Error(`Unexpected operator "${op}".`);
    }
    while (ops.length) {
      const top = ops[ops.length - 1]!;
      if (top === '(' || top === 'u-') break;
      if (prec[top]! > prec[op]! || (prec[top]! === prec[op]! && !rightAssoc.has(op))) apply(out, ops.pop()!);
      else break;
    }
    ops.push(op);
    expectOperand = true;
  }
  while (ops.length) {
    const o = ops.pop()!;
    if (o === '(' || o === 'u-') throw new Error('Unbalanced expression.');
    apply(out, o);
  }
  if (out.length !== 1) throw new Error('Malformed expression.');
  const v = out[0]!;
  if (!Number.isFinite(v)) throw new Error('Result is not a finite number.');
  return v;
}

function apply(out: number[], op: string) {
  const b = out.pop(); const a = out.pop();
  if (a === undefined || b === undefined) throw new Error('Malformed expression.');
  switch (op) {
    case '+': out.push(a + b); break;
    case '-': out.push(a - b); break;
    case '*': out.push(a * b); break;
    case '/': if (b === 0) throw new Error('Division by zero.'); out.push(a / b); break;
    case '^': out.push(Math.pow(a, b)); break;
    default: throw new Error(`Unknown operator ${op}`);
  }
}

/** Significant-figure rounding used for science answers. */
export function toSigFigs(value: number, sigFigs: number): number {
  if (!Number.isFinite(value) || value === 0) return 0;
  if (sigFigs < 1) throw new Error('sigFigs must be >= 1');
  const d = Math.ceil(Math.log10(Math.abs(value)));
  const power = sigFigs - d;
  const mag = Math.pow(10, power);
  return Math.round(value * mag) / mag;
}

const UNITS: Record<string, { base: string; factor: number }> = {
  mm: { base: 'm', factor: 1e-3 }, cm: { base: 'm', factor: 1e-2 }, m: { base: 'm', factor: 1 },
  km: { base: 'm', factor: 1e3 }, in: { base: 'm', factor: 0.0254 }, ft: { base: 'm', factor: 0.3048 },
  ml: { base: 'l', factor: 1e-3 }, l: { base: 'l', factor: 1 },
  mg: { base: 'g', factor: 1e-3 }, g: { base: 'g', factor: 1 }, kg: { base: 'g', factor: 1e3 },
  s: { base: 's', factor: 1 }, min: { base: 's', factor: 60 }, h: { base: 's', factor: 3600 },
  j: { base: 'j', factor: 1 }, kj: { base: 'j', factor: 1e3 },
  w: { base: 'w', factor: 1 }, kw: { base: 'w', factor: 1e3 }
};

export type Conversion = { ok: true; value: number; from: string; to: string } | { ok: false; reason: string };

/** Unit conversion with an explicit incompatibility error (no silent coercion). */
export function convert(value: number, from: string, to: string): Conversion {
  const f = UNITS[from.toLowerCase()]; const t = UNITS[to.toLowerCase()];
  if (!f) return { ok: false, reason: `Unknown unit "${from}".` };
  if (!t) return { ok: false, reason: `Unknown unit "${to}".` };
  if (f.base !== t.base) return { ok: false, reason: `"${from}" and "${to}" measure different quantities.` };
  return { ok: true, value: (value * f.factor) / t.factor, from, to };
}

/**
 * Chemistry: checks whether an equation is balanced. Form is
 * { left: [['H',2],['O',1]], right: [...] } per species, with coefficients.
 */
export function balanceCheck(
  left: { coefficient: number; atoms: Record<string, number> }[],
  right: { coefficient: number; atoms: Record<string, number> }[]
): { balanced: boolean; detail: Record<string, { left: number; right: number }> } {
  const detail: Record<string, { left: number; right: number }> = {};
  const tally = (side: typeof left) => {
    const t: Record<string, number> = {};
    for (const s of side) for (const [el, n] of Object.entries(s.atoms)) t[el] = (t[el] ?? 0) + n * s.coefficient;
    return t;
  };
  const L = tally(left); const R = tally(right);
  for (const el of new Set([...Object.keys(L), ...Object.keys(R)])) {
    detail[el] = { left: L[el] ?? 0, right: R[el] ?? 0 };
  }
  return { balanced: Object.values(detail).every((d) => d.left === d.right), detail };
}

/** Extracts the first plausible arithmetic expression from a question stem. */
export function extractExpression(text: string): string | null {
  const m = text.match(/(-?\d+(?:\.\d+)?\s*[+\-*/^]\s*(?:\d+(?:\.\d+)?\s*[+\-*/^]\s*)*\d+(?:\.\d+)?)/);
  const hit = m?.[1];
  return hit ? hit.replace(/\s+/g, '') : null;
}
