'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Row = {
  id: string;
  submitterName: string;
  submitterEmail: string;
  deviceType: string;
  makeModel: string;
  serialNumber: string | null;
  purchaseDate: string | null;
  condition: string;
  location: string;
  locationDetail: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminTable({
  devices,
  types,
}: {
  devices: Row[];
  types: string[];
}) {
  const [filter, setFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this device record? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Delete failed: ${body.error ?? res.statusText}`);
        return;
      }
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      if (filter && d.deviceType !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        const blob = [
          d.submitterName,
          d.submitterEmail,
          d.makeModel,
          d.serialNumber,
          d.notes,
          d.location,
          d.locationDetail,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!blob.includes(s)) return false;
      }
      return true;
    });
  }, [devices, filter, search]);

  function downloadCsv() {
    const headers = [
      'Submitter Name',
      'Submitter Email',
      'Device Type',
      'Make & Model',
      'Serial Number',
      'Purchase Date',
      'Condition',
      'Location',
      'Location Detail',
      'Notes',
      'Submitted At',
    ];
    const rows = filtered.map((d) => [
      d.submitterName,
      d.submitterEmail,
      d.deviceType,
      d.makeModel,
      d.serialNumber || '',
      d.purchaseDate || '',
      d.condition,
      d.location,
      d.locationDetail || '',
      d.notes || '',
      d.createdAt,
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? '');
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          })
          .join(','),
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `vtwo-hardware-inventory-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="toolbar">
        <input
          type="text"
          placeholder="Search submitter, model, serial…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="">All device types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <span className="muted">
          {filtered.length} of {devices.length}
        </span>
        <button onClick={downloadCsv} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
          Download CSV
        </button>
      </div>

      <div className="card" style={{ padding: 12, overflowX: 'auto' }}>
        {filtered.length === 0 ? (
          <p className="muted" style={{ padding: 14 }}>
            No matching devices.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Submitter</th>
                <th>Type</th>
                <th>Make & Model</th>
                <th>Serial</th>
                <th>Purchased</th>
                <th>Condition</th>
                <th>Location</th>
                <th>Notes</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div>{d.submitterName}</div>
                    <div className="muted" style={{ fontSize: '0.75rem' }}>
                      {d.submitterEmail}
                    </div>
                  </td>
                  <td>{d.deviceType}</td>
                  <td>{d.makeModel}</td>
                  <td>{d.serialNumber || <span className="muted">—</span>}</td>
                  <td>{d.purchaseDate || <span className="muted">—</span>}</td>
                  <td>{d.condition}</td>
                  <td>
                    {d.location}
                    {d.locationDetail ? (
                      <div className="muted" style={{ fontSize: '0.75rem' }}>
                        {d.locationDetail}
                      </div>
                    ) : null}
                  </td>
                  <td style={{ maxWidth: 240, whiteSpace: 'pre-wrap' }}>
                    {d.notes || <span className="muted">—</span>}
                  </td>
                  <td className="muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-danger-ghost"
                      onClick={() => handleDelete(d.id)}
                      disabled={deleting === d.id}
                    >
                      {deleting === d.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
