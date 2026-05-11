import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminTable from './AdminTable';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect('/login');

  if (!isAdmin(session.user.email)) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="h1">403 — Not authorized</h1>
          <p className="muted">
            You're signed in as {session.user.email}, but this page is restricted to
            administrators.
          </p>
          <p style={{ marginTop: 14 }}>
            <a href="/">← Back to the form</a>
          </p>
        </div>
      </div>
    );
  }

  const devices = await prisma.device.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const types = Array.from(new Set(devices.map((d) => d.deviceType))).sort();
  const submitters = new Set(devices.map((d) => d.submitterEmail)).size;

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="h1">Admin — All Submissions</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            {devices.length} device{devices.length === 1 ? '' : 's'} from {submitters} submitter
            {submitters === 1 ? '' : 's'}
          </p>
        </div>
        <a href="/" className="btn btn-secondary">
          ← Back
        </a>
      </div>

      <AdminTable devices={serialize(devices)} types={types} />
    </div>
  );
}

function serialize(devices: any[]) {
  return devices.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
}
