import { desc, sql, eq } from 'drizzle-orm';
import { Chip } from '@/components/ui/primitives';
import { RoleControl } from '@/components/admin/RoleControl';
import { getDb, schema } from '@/server/db';

export const metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

export default async function AdminUsers() {
  const db = await getDb();
  const users = await db.select({
    id: schema.users.id, email: schema.users.email, status: schema.users.status, createdAt: schema.users.createdAt,
    displayName: schema.profiles.displayName, ageBand: schema.profiles.ageBand, country: schema.profiles.country
  }).from(schema.users).innerJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .orderBy(desc(schema.users.createdAt)).limit(200);

  const roles = await db.select().from(schema.userRoles);
  const byUser = new Map<string, string[]>();
  for (const r of roles) { const a = byUser.get(r.userId) ?? []; a.push(r.role); byUser.set(r.userId, a); }

  return (
    <div className="stack gap-4">
      <header>
        <h1 className="h2">Users</h1>
        <p className="muted" style={{ fontSize: '.86rem', marginTop: '.25rem' }}>
          Newest first. Role changes are written to the audit log.
        </p>
      </header>
      <div className="table-wrap">
        <table className="data">
          <caption className="sr-only">Registered users</caption>
          <thead><tr><th scope="col">Email</th><th scope="col">Name</th><th scope="col">Stage</th><th scope="col">Status</th><th scope="col">Roles</th><th scope="col">Joined</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 560 }}>{u.email}</td>
                <td className="muted">{u.displayName}</td>
                <td className="faint">{u.ageBand.replace(/_/g, ' ')}</td>
                <td><Chip tone={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status}</Chip></td>
                <td><RoleControl userId={u.id} roles={byUser.get(u.id) ?? []} /></td>
                <td className="tnum faint">{new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="faint" style={{ fontSize: '.76rem' }}>Showing the 200 most recent accounts.</p>
    </div>
  );
}
