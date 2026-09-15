export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, message: 'Method tidak diizinkan.' });
    }

    const config = getConfig();
    if (!config) return res.status(500).json({ success: false, message: 'Supabase environment belum tersedia.' });

    const sessionToken = String(req.query.session || '').trim();
    const session = await validateSession(config, sessionToken);
    if (!session) return res.status(401).json({ success: false, message: 'Login required.' });

    const mode = cleanText(req.query.mode || '').toLowerCase();
    const search = cleanText(req.query.search || '');
    const participant = cleanText(req.query.participant || '');

    let rows = await fetchAll(config, 'season_rewards', ['id','employee_name','nip','department','category','description','participant_type','source_row','synced_at']);
    rows.sort((a, b) => Number(a.source_row || 0) - Number(b.source_row || 0));

    if (search) {
      const keyword = search.toUpperCase();
      rows = rows.filter(row => [row.employee_name,row.department,row.category,row.description,row.participant_type].join(' ').toUpperCase().includes(keyword));
    }

    if (participant && participant.toUpperCase() !== 'ALL') {
      const type = participant.toUpperCase();
      rows = rows.filter(row => String(row.participant_type || '').trim().toUpperCase() === type);
    }

    if (mode === 'export') return sendRewardCsv(res, rows);

    const categories = [...new Set(rows.map(row => String(row.category || '').trim()).filter(Boolean))];
    const participantTypes = [...new Set(rows.map(row => String(row.participant_type || '').trim()).filter(Boolean))];
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ success: true, data: rows, summary: { winners: rows.length, categories: categories.length }, categories, participantTypes });
  } catch (error) {
    console.error('REWARD API ERROR:', error);
    return res.status(500).json({ success: false, message: 'Reward gagal dimuat.' });
  }
}

function getConfig() {
  const supabaseUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const serviceKey = String(process.env.SUPABASE_SERVICE_KEY || '').trim();
  return (!supabaseUrl || !serviceKey) ? null : { supabaseUrl, serviceKey };
}

async function validateSession(config, token) {
  if (!token) return null;
  const params = new URLSearchParams();
  params.set('select', 'token,email,user_name,role,expires_at');
  params.set('token', 'eq.' + token);
  params.set('limit', '1');
  const response = await fetch(config.supabaseUrl + '/rest/v1/login_sessions?' + params.toString(), { headers: authHeaders(config), cache: 'no-store' });
  if (!response.ok) return null;
  const rows = await response.json();
  const session = Array.isArray(rows) ? rows[0] : null;
  if (!session) return null;
  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) return null;
  return session;
}

async function fetchAll(config, table, columns) {
  const allRows = [];
  const batchSize = 1000;
  let from = 0;
  while (true) {
    const to = from + batchSize - 1;
    const params = new URLSearchParams();
    params.set('select', columns.join(','));
    const response = await fetch(config.supabaseUrl + '/rest/v1/' + table + '?' + params.toString(), {
      headers: { ...authHeaders(config), Range: `${from}-${to}` }, cache: 'no-store'
    });
    if (!response.ok) throw new Error(await response.text());
    const batch = await response.json();
    if (!Array.isArray(batch)) break;
    allRows.push(...batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }
  return allRows;
}

function sendRewardCsv(res, rows) {
  const csvRows = [['NAMA','NIP','DEPT','KATEGORI','DESKRIPSI','PESERTA']];
  rows.forEach(row => csvRows.push([row.employee_name || '',row.nip || '',row.department || '',row.category || '',row.description || '',row.participant_type || '']));
  const csv = csvRows.map(row => row.map(csvEscape).join(',')).join('\n');
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="SS_Rank_Up_Reward_${date}.csv"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send('\uFEFF' + csv);
}

function authHeaders(config) { return { apikey: config.serviceKey, Authorization: 'Bearer ' + config.serviceKey, Accept: 'application/json' }; }
function cleanText(value) { return String(value || '').trim().replace(/\s+/g, ' '); }
function csvEscape(value) { return '"' + String(value ?? '').replace(/"/g, '""') + '"'; }
