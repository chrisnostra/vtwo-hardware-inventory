import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SubmitForm from './SubmitForm';
import SignOutButton from './SignOutButton';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  const email = session.user.email;
  const name = session.user.name ?? email;

  const myDevices = await prisma.device.findMany({
    where: { submitterEmail: email },
    orderBy: { createdAt: 'desc' },
  });

  const admin = isAdmin(email);

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="h1">V.Two Hardware Inventory</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            Signed in as <strong>{name}</strong> · {email}
            {admin && <span className="pill" style={{ marginLeft: 10 }}>admin</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {admin && (
            <a href="/admin" className="btn btn-secondary">
              Admin
            </a>
          )}
          <SignOutButton />
        </div>
      </div>

      <p className="muted" style={{ marginBottom: 24, maxWidth: 700 }}>
        Please list every piece of V.Two-owned hardware you currently have. This
        includes laptops, monitors, phones, headsets, keyboards, mice, docks, etc.
        You can come back later and add more.
      </p>

      {myDevices.length > 0 && (
        <div className="card">
          <h2 className="h2">Your submitted devices ({myDevices.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Make & Model</th>
                <th>Serial</th>
                <th>Condition</th>
                <th>Location</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {myDevices.map((d) => (
                <tr key={d.id}>
                  <td>{d.deviceType}</td>
                  <td>{d.makeModel}</td>
                  <td>{d.serialNumber || <span className="muted">—</span>}</td>
                  <td>{d.condition}</td>
                  <td>
                    {d.location}
                    {d.locationDetail ? ` (${d.locationDetail})` : ''}
                  </td>
                  <td className="muted">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SubmitForm
        existingCount={myDevices.length}
        submitter={{ name, email }}
      />
    </div>
  );
}
