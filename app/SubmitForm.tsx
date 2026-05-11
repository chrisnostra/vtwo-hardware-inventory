'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DEVICE_TYPES = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Phone',
  'Tablet',
  'Headset/Audio',
  'Keyboard',
  'Mouse',
  'Dock/Hub',
  'Other',
];

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Broken'];
const LOCATIONS = ['Home office', 'V.Two office', 'Other'];

type DeviceDraft = {
  deviceType: string;
  makeModel: string;
  serialNumber: string;
  purchaseDate: string;
  condition: string;
  location: string;
  locationDetail: string;
  notes: string;
};

function emptyDevice(): DeviceDraft {
  return {
    deviceType: 'Laptop',
    makeModel: '',
    serialNumber: '',
    purchaseDate: '',
    condition: 'Good',
    location: 'Home office',
    locationDetail: '',
    notes: '',
  };
}

export default function SubmitForm({
  existingCount,
  submitter,
}: {
  existingCount: number;
  submitter: { name: string; email: string };
}) {
  const router = useRouter();
  const [devices, setDevices] = useState<DeviceDraft[]>([emptyDevice()]);
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function update(i: number, patch: Partial<DeviceDraft>) {
    setDevices((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  function addDevice() {
    setDevices((prev) => [...prev, emptyDevice()]);
  }

  function removeDevice(i: number) {
    setDevices((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFlash(null);

    // Validate: makeModel required
    for (let i = 0; i < devices.length; i++) {
      if (!devices[i].makeModel.trim()) {
        setFlash({ type: 'error', msg: `Device #${i + 1}: Make & Model is required.` });
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devices }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Submit failed (${res.status})`);
      }
      const body = await res.json();
      setFlash({ type: 'success', msg: `Saved ${body.count} device${body.count === 1 ? '' : 's'}. Thanks!` });
      setDevices([emptyDevice()]);
      router.refresh();
    } catch (err: any) {
      setFlash({ type: 'error', msg: err.message || 'Submit failed.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="h2" style={{ marginTop: 8 }}>
        {existingCount > 0 ? 'Add more devices' : 'Add your devices'}
      </h2>

      {flash && (
        <div className={`flash flash-${flash.type}`}>{flash.msg}</div>
      )}

      {devices.map((d, i) => (
        <div key={i} className="card">
          <div className="device-card-header">
            <strong>Device #{i + 1}</strong>
            {devices.length > 1 && (
              <button
                type="button"
                onClick={() => removeDevice(i)}
                className="btn btn-danger-ghost"
              >
                Remove
              </button>
            )}
          </div>

          <div className="row">
            <div>
              <label>Device type</label>
              <select
                value={d.deviceType}
                onChange={(e) => update(i, { deviceType: e.target.value })}
              >
                {DEVICE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Make & model *</label>
              <input
                type="text"
                required
                placeholder="e.g. MacBook Pro 16-inch M3 Max"
                value={d.makeModel}
                onChange={(e) => update(i, { makeModel: e.target.value })}
              />
            </div>

            <div>
              <label>Serial number</label>
              <input
                type="text"
                placeholder="optional"
                value={d.serialNumber}
                onChange={(e) => update(i, { serialNumber: e.target.value })}
              />
            </div>

            <div>
              <label>Approx purchase date / year</label>
              <input
                type="text"
                placeholder="e.g. 2023 or Mar 2024"
                value={d.purchaseDate}
                onChange={(e) => update(i, { purchaseDate: e.target.value })}
              />
            </div>

            <div>
              <label>Condition</label>
              <select
                value={d.condition}
                onChange={(e) => update(i, { condition: e.target.value })}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Current location</label>
              <select
                value={d.location}
                onChange={(e) => update(i, { location: e.target.value })}
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {d.location === 'Other' && (
              <div className="row-full">
                <label>Location details</label>
                <input
                  type="text"
                  placeholder="Where is it?"
                  value={d.locationDetail}
                  onChange={(e) => update(i, { locationDetail: e.target.value })}
                />
              </div>
            )}

            <div className="row-full">
              <label>Notes</label>
              <textarea
                placeholder="Anything else worth knowing (accessories, issues, etc.)"
                value={d.notes}
                onChange={(e) => update(i, { notes: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="btn-bar">
        <button type="button" onClick={addDevice} className="btn btn-secondary">
          + Add another device
        </button>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? 'Submitting…' : `Submit ${devices.length} device${devices.length === 1 ? '' : 's'}`}
        </button>
      </div>

      <p className="muted" style={{ marginTop: 16, fontSize: '0.78rem' }}>
        Submitting as {submitter.name} ({submitter.email})
      </p>
    </form>
  );
}
