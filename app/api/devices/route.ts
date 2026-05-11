import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ALLOWED_TYPES = new Set([
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
]);
const ALLOWED_CONDITIONS = new Set(['Excellent', 'Good', 'Fair', 'Poor', 'Broken']);
const ALLOWED_LOCATIONS = new Set(['Home office', 'V.Two office', 'Other']);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const email = session.user.email;
  const name = session.user.name || email;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const devices = Array.isArray(body?.devices) ? body.devices : null;
  if (!devices || devices.length === 0) {
    return NextResponse.json({ error: 'No devices submitted' }, { status: 400 });
  }
  if (devices.length > 50) {
    return NextResponse.json({ error: 'Too many devices in one submit (max 50)' }, { status: 400 });
  }

  const rows = [];
  for (let i = 0; i < devices.length; i++) {
    const d = devices[i];
    const deviceType = String(d?.deviceType || '').trim();
    const makeModel = String(d?.makeModel || '').trim();
    const condition = String(d?.condition || '').trim();
    const location = String(d?.location || '').trim();

    if (!makeModel) {
      return NextResponse.json(
        { error: `Device #${i + 1}: makeModel required` },
        { status: 400 },
      );
    }
    if (!ALLOWED_TYPES.has(deviceType)) {
      return NextResponse.json(
        { error: `Device #${i + 1}: invalid deviceType` },
        { status: 400 },
      );
    }
    if (!ALLOWED_CONDITIONS.has(condition)) {
      return NextResponse.json(
        { error: `Device #${i + 1}: invalid condition` },
        { status: 400 },
      );
    }
    if (!ALLOWED_LOCATIONS.has(location)) {
      return NextResponse.json(
        { error: `Device #${i + 1}: invalid location` },
        { status: 400 },
      );
    }

    rows.push({
      submitterName: name,
      submitterEmail: email,
      deviceType,
      makeModel,
      serialNumber: trimOrNull(d?.serialNumber),
      purchaseDate: trimOrNull(d?.purchaseDate),
      condition,
      location,
      locationDetail: trimOrNull(d?.locationDetail),
      notes: trimOrNull(d?.notes),
    });
  }

  const result = await prisma.device.createMany({ data: rows });
  return NextResponse.json({ ok: true, count: result.count });
}

function trimOrNull(v: any): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length === 0 ? null : s;
}
