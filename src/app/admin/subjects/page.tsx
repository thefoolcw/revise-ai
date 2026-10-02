import { Chip } from '@/components/ui/primitives';
import { getDb, schema } from '@/server/db';

export const metadata = { title: 'Subjects' };
export const dynamic = 'force-dynamic';

export default async function AdminSubjects() {
  const db = await getDb();
  const [subjects, topics, aliases] = await Promise.all([
    db.select().from(schema.subjects),
    db.select({ id: schema.topics.id, subjectId: schema.topics.subjectId, provenance: schema.topics.provenance }).from(schema.topics),
    db.select({ alias: schema.subjectAliases.alias, subjectId: schema.subjectAliases.subjectId }).from(schema.subjectAliases)
  ]);

  const topicCount = new Map<string, { total: number; illustrative: number }>();
  for (const t of topics) {
    const k = t.subjectId ?? '';
    const cur = topicCount.get(k) ?? { total: 0, illustrative: 0 };
    cur.total++;
    if (t.provenance === 'ILLUSTRATIVE') cur.illustrative++;
    topicCount.set(k, cur);
  }
  const aliasCount = new Map<string, number>();
  for (const a of aliases) aliasCount.set(a.subjectId, (aliasCount.get(a.subjectId) ?? 0) + 1);

  const byCategory = new Map<string, typeof subjects>();
  for (const s of subjects) { const arr = byCategory.get(s.category) ?? []; arr.push(s); byCategory.set(s.category, arr); }

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Subjects</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          {subjects.length} subjects, {topics.length} topic entries, {aliases.length} search aliases. Aliases
          power fuzzy lookup (&ldquo;edexel&rdquo; → Edexcel) without ever changing a selected qualification.
        </p>
      </header>

      {[...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([cat, list]) => (
        <div key={cat} className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.8rem', color: 'var(--accent)' }}>{cat}</h2>
          <div className="table-wrap"><table className="data">
            <caption className="sr-only">{`Subjects in ${cat}`}</caption>
            <thead><tr><th scope="col">Subject</th><th scope="col">Topics</th><th scope="col">Illustrative</th><th scope="col">Aliases</th></tr></thead>
            <tbody>
              {list.map((s) => {
                const t = topicCount.get(s.id) ?? { total: 0, illustrative: 0 };
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 560 }}>{s.name}</td>
                    <td className="tnum">{t.total}</td>
                    <td>{t.illustrative > 0 ? <Chip tone="warn">{t.illustrative}</Chip> : <span className="faint">0</span>}</td>
                    <td className="tnum faint">{aliasCount.get(s.id) ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      ))}
    </div>
  );
}
