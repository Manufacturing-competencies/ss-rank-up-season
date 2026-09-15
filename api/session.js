export default async function handler(req, res) {
  const supabaseUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const serviceKey = String(process.env.SUPABASE_SERVICE_KEY || '').trim();
  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ success: false, message: 'Database configuration missing.' });
  }

  if (req.method === 'GET') return validateSession(req, res, supabaseUrl, serviceKey);
  if (req.method === 'DELETE') return logoutSession(req, res, supabaseUrl, serviceKey);

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}

async function validateSession(req, res, supabaseUrl, serviceKey) {
  const token = String(req.query.session || '').trim();
  if (!token) return res.status(401).json({ success: false, message: 'Session required.' });

  const params = new URLSearchParams();
  params.set('select', 'email,user_name,role,expires_at');
  params.set('token', 'eq.' + token);
  params.set('limit', '1');

  const response = await fetch(supabaseUrl + '/rest/v1/login_sessions?' + params.toString(), {
    headers: authHeaders(serviceKey), cache: 'no-store'
  });
  if (!response.ok) {
    console.error('SESSION VALIDATE ERROR:', await response.text());
    return res.status(500).json({ success: false, message: 'Failed to validate session.' });
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || !rows.length) return res.status(401).json({ success: false, message: 'Session tidak ditemukan.' });
  const session = rows[0];
  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
    return res.status(401).json({ success: false, message: 'Session expired.' });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    success: true,
    session: { email: session.email, name: session.user_name, role: session.role, expiresAt: session.expires_at }
  });
}

async function logoutSession(req, res, supabaseUrl, serviceKey) {
  const token = String(req.body?.session || req.query?.session || '').trim();
  if (!token) return res.status(200).json({ success: true });

  const params = new URLSearchParams();
  params.set('token', 'eq.' + token);
  const response = await fetch(supabaseUrl + '/rest/v1/login_sessions?' + params.toString(), {
    method: 'DELETE',
    headers: { ...authHeaders(serviceKey), Prefer: 'return=minimal' }
  });
  if (!response.ok) console.error('LOGOUT DELETE ERROR:', await response.text());
  return res.status(200).json({ success: true });
}

function authHeaders(serviceKey) {
  return { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, Accept: 'application/json', 'Content-Type': 'application/json' };
}
