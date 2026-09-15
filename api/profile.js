const MAX_GAME_SCORE = 240;

export const config = {
  api: { bodyParser: { sizeLimit: '3mb' } }
};

export default async function handler(req, res) {
  try {
    const supabaseUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const serviceKey = String(process.env.SUPABASE_SERVICE_KEY || '').trim();
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ success: false, message: 'Supabase environment belum tersedia.' });
    }

    const mode = String(req.query?.mode || '').trim().toLowerCase();

    if (req.method === 'POST' && mode === 'photo') {
      return uploadProfilePhoto(req, res, supabaseUrl, serviceKey);
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }

    const token = String(req.query?.session || '').trim();
    const session = await getSession(supabaseUrl, serviceKey, token);
    if (!session) return res.status(401).json({ success: false, message: 'Login required.' });

    if (mode === 'players') return getPlayerPhotos(res, supabaseUrl, serviceKey);
    return getProfile(res, supabaseUrl, serviceKey, session);
  } catch (error) {
    console.error('PROFILE API ERROR:', error);
    return res.status(500).json({ success: false, message: 'Profile gagal dimuat.' });
  }
}

async function getProfile(res, supabaseUrl, serviceKey, session) {
  const employeeName = cleanText(session.user_name);
  const email = cleanText(session.email);
  const role = cleanText(session.role) || 'USER';
  if (!employeeName) return res.status(404).json({ success: false, message: 'Nama user tidak ditemukan pada session.' });

  const progress = await getUserProgress(supabaseUrl, serviceKey, employeeName);
  const appUser = await getAppUser(supabaseUrl, serviceKey, email, employeeName);
  const rewards = await getUserRewards(supabaseUrl, serviceKey, employeeName);
  const players = await getLeaderboardPlayers(supabaseUrl, serviceKey);
  const leaderboard = buildLeaderboard(players);
  const playerPosition = leaderboard.findIndex(row => cleanText(row.employee_name).toUpperCase() === employeeName.toUpperCase());

  const rawPointApproved = safeNumber(progress?.point_approved);
  const gameScore = Math.min(MAX_GAME_SCORE, Math.max(0, rawPointApproved));
  const approvedSs = Math.min(6, Math.floor(gameScore / 40));
  const remaining = Math.max(0, MAX_GAME_SCORE - gameScore);

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    success: true,
    profile: {
      name: employeeName,
      email,
      role,
      photo_url: cleanText(appUser?.photo_url),
      department: cleanText(progress?.department),
      superior: cleanText(progress?.superior_name),
      location: cleanText(progress?.work_location)
    },
    progress: progress || {},
    game: {
      position: playerPosition >= 0 ? playerPosition + 1 : null,
      score: gameScore,
      maxScore: MAX_GAME_SCORE,
      approvedSs,
      remaining,
      progress: Math.round((gameScore / MAX_GAME_SCORE) * 100)
    },
    rewards: rewards || []
  });
}

async function getPlayerPhotos(res, supabaseUrl, serviceKey) {
  const params = new URLSearchParams();
  params.set('select', 'name,photo_url');
  params.set('photo_url', 'not.is.null');
  const response = await fetch(supabaseUrl + '/rest/v1/app_users?' + params.toString(), { headers: supabaseHeaders(serviceKey), cache: 'no-store' });
  if (!response.ok) throw new Error(await response.text());
  const rows = await response.json();
  const photos = {};
  if (Array.isArray(rows)) {
    rows.forEach(row => {
      const name = cleanText(row.name).toUpperCase();
      if (name && row.photo_url) photos[name] = row.photo_url;
    });
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ success: true, photos });
}

async function uploadProfilePhoto(req, res, supabaseUrl, serviceKey) {
  const token = String(req.body?.session || '').trim();
  const imageData = String(req.body?.imageData || '').replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim();
  if (!token || !imageData) return res.status(400).json({ success: false, message: 'Foto belum tersedia.' });
  if (imageData.length > 2500000) return res.status(413).json({ success: false, message: 'Ukuran foto terlalu besar.' });

  const session = await getSession(supabaseUrl, serviceKey, token);
  if (!session) return res.status(401).json({ success: false, message: 'Session berakhir.' });

  const email = String(session.email || '').trim().toLowerCase();
  const name = String(session.user_name || '').trim();
  if (!email) return res.status(400).json({ success: false, message: 'Email session tidak tersedia.' });

  const fileName = email.replace(/[^a-z0-9._-]/g, '_') + '.jpg';
  const buffer = Buffer.from(imageData, 'base64');
  if (buffer.length > 2000000) return res.status(413).json({ success: false, message: 'Foto maksimal sekitar 2 MB setelah kompresi.' });

  const storageResponse = await fetch(supabaseUrl + '/storage/v1/object/profile-images/' + encodeURIComponent(fileName), {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: buffer
  });
  if (!storageResponse.ok) throw new Error(await storageResponse.text());

  const photoUrl = supabaseUrl + '/storage/v1/object/public/profile-images/' + encodeURIComponent(fileName);
  const existing = await getAppUser(supabaseUrl, serviceKey, email, name);

  if (existing) {
    const params = new URLSearchParams();
    params.set('email', 'eq.' + email);
    const patch = await fetch(supabaseUrl + '/rest/v1/app_users?' + params.toString(), {
      method: 'PATCH',
      headers: { ...supabaseHeaders(serviceKey), Prefer: 'return=minimal' },
      body: JSON.stringify({ photo_url: photoUrl, updated_at: new Date().toISOString() })
    });
    if (!patch.ok) throw new Error(await patch.text());
  } else {
    const insert = await fetch(supabaseUrl + '/rest/v1/app_users', {
      method: 'POST',
      headers: { ...supabaseHeaders(serviceKey), Prefer: 'return=minimal' },
      body: JSON.stringify({ name, email, role: session.role || 'User', photo_url: photoUrl, updated_at: new Date().toISOString() })
    });
    if (!insert.ok) throw new Error(await insert.text());
  }

  return res.status(200).json({ success: true, photo_url: photoUrl });
}

async function getSession(supabaseUrl, serviceKey, token) {
  if (!token) return null;
  const params = new URLSearchParams();
  params.set('select', 'token,email,user_name,role,expires_at');
  params.set('token', 'eq.' + token);
  params.set('limit', '1');
  const response = await fetch(supabaseUrl + '/rest/v1/login_sessions?' + params.toString(), { headers: supabaseHeaders(serviceKey), cache: 'no-store' });
  if (!response.ok) return null;
  const rows = await response.json();
  const session = Array.isArray(rows) ? rows[0] : null;
  if (!session) return null;
  if (session.expires_at) {
    const expiry = new Date(session.expires_at).getTime();
    if (Number.isFinite(expiry) && expiry < Date.now()) return null;
  }
  return session;
}

async function getUserProgress(supabaseUrl, serviceKey, employeeName) {
  const params = new URLSearchParams();
  params.set('select', ['employee_name','department','superior_name','work_location','ss_done','point','point_approved','ss_submit','month_1_name','month_1_value','month_2_name','month_2_value','month_3_name','month_3_value','season_status','total_approved','rank'].join(','));
  params.set('employee_name', 'ilike.' + employeeName);
  params.set('limit', '1');
  const response = await fetch(supabaseUrl + '/rest/v1/season_user_progress?' + params.toString(), { headers: supabaseHeaders(serviceKey), cache: 'no-store' });
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function getAppUser(supabaseUrl, serviceKey, email, employeeName) {
  if (email) {
    const byEmail = await queryAppUser(supabaseUrl, serviceKey, 'email', 'eq.' + email);
    if (byEmail) return byEmail;
  }
  if (employeeName) {
    const byName = await queryAppUser(supabaseUrl, serviceKey, 'name', 'ilike.' + employeeName);
    if (byName) return byName;
  }
  return null;
}

async function queryAppUser(supabaseUrl, serviceKey, column, filter) {
  const params = new URLSearchParams();
  params.set('select', 'email,name,photo_url');
  params.set(column, filter);
  params.set('limit', '1');
  const response = await fetch(supabaseUrl + '/rest/v1/app_users?' + params.toString(), { headers: supabaseHeaders(serviceKey), cache: 'no-store' });
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function getUserRewards(supabaseUrl, serviceKey, employeeName) {
  const params = new URLSearchParams();
  params.set('select', 'category,description,participant_type');
  params.set('employee_name', 'ilike.' + employeeName);
  params.set('order', 'source_row.asc');
  const response = await fetch(supabaseUrl + '/rest/v1/season_rewards?' + params.toString(), { headers: supabaseHeaders(serviceKey), cache: 'no-store' });
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

async function getLeaderboardPlayers(supabaseUrl, serviceKey) {
  const rows = [];
  const batchSize = 1000;
  let from = 0;
  while (true) {
    const to = from + batchSize - 1;
    const params = new URLSearchParams();
    params.set('select', 'employee_name,point_approved');
    const response = await fetch(supabaseUrl + '/rest/v1/season_user_progress?' + params.toString(), {
      method: 'GET', headers: { ...supabaseHeaders(serviceKey), Range: `${from}-${to}` }, cache: 'no-store'
    });
    if (!response.ok) break;
    const batch = await response.json();
    if (!Array.isArray(batch)) break;
    rows.push(...batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }
  return rows;
}

function buildLeaderboard(rows) {
  return [...rows].map(row => ({ ...row, game_score: Math.min(MAX_GAME_SCORE, Math.max(0, safeNumber(row.point_approved))) }))
    .sort((a, b) => b.game_score !== a.game_score ? b.game_score - a.game_score : cleanText(a.employee_name).localeCompare(cleanText(b.employee_name), 'id', { sensitivity: 'base' }));
}

function supabaseHeaders(serviceKey) {
  return { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, Accept: 'application/json', 'Content-Type': 'application/json' };
}
function cleanText(value) { return String(value ?? '').trim().replace(/\s+/g, ' '); }
function safeNumber(value) { const number = Number(value); return Number.isFinite(number) ? number : 0; }
