const MAX_SCORE = 240;
const POINT_PER_SS = 40;

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ success: false, message: 'Method tidak diizinkan.' });
    }

    const supabaseUrl = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const serviceKey = String(process.env.SUPABASE_SERVICE_KEY || '').trim();
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ success: false, message: 'Supabase environment belum tersedia.' });
    }

    const mode = String(req.query.mode || '').trim().toLowerCase();
    const search = cleanSearch(req.query.search || '');
    const playerName = cleanSearch(req.query.player || '');

    let allRows = await fetchAllProgress(supabaseUrl, serviceKey);
    allRows = allRows.map(normalizeRow).filter(row => row.employee_name);
    allRows.sort(leaderboardSort);
    allRows = allRows.map((row, index) => ({ ...row, position: index + 1 }));

    let filteredRows = allRows;
    if (search) {
      const keyword = search.toUpperCase();
      filteredRows = allRows.filter(row =>
        [row.employee_name, row.department, row.superior_name, row.work_location]
          .join(' ').toUpperCase().includes(keyword)
      );
    }

    if (mode === 'export') return sendLeaderboardCsv(res, filteredRows);

    const requestedPage = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10) || 50));
    const top10 = allRows.slice(0, 10);

    let player = null;
    if (playerName) {
      const target = playerName.toUpperCase();
      player = allRows.find(row => String(row.employee_name || '').trim().toUpperCase() === target) || null;
    }

    const maxScorePlayers = allRows.filter(row => row.game_score >= MAX_SCORE).length;
    const totalScore = allRows.reduce((total, row) => total + row.game_score, 0);
    const total = filteredRows.length;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
    const page = Math.min(requestedPage, totalPages);
    const from = (page - 1) * limit;
    const to = from + limit;

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      success: true,
      config: { maxScore: MAX_SCORE, pointPerSs: POINT_PER_SS, maxSs: MAX_SCORE / POINT_PER_SS },
      summary: { totalPlayers: allRows.length, maxScorePlayers, totalScore },
      player,
      top10,
      data: filteredRows.slice(from, to),
      pagination: {
        page, limit, total, totalPages,
        from: total > 0 ? from + 1 : 0,
        to: total > 0 ? Math.min(to, total) : 0
      }
    });
  } catch (error) {
    console.error('LEADERBOARD API ERROR:', error);
    return res.status(500).json({ success: false, message: 'Leaderboard gagal dimuat.' });
  }
}

async function fetchAllProgress(supabaseUrl, serviceKey) {
  const rows = [];
  const batchSize = 1000;
  let from = 0;
  while (true) {
    const to = from + batchSize - 1;
    const params = new URLSearchParams();
    params.set('select', ['employee_name','department','superior_name','work_location','point_approved','season_status','rank','source_row'].join(','));
    params.set('order', 'source_row.asc');
    const response = await fetch(supabaseUrl + '/rest/v1/season_user_progress?' + params.toString(), {
      method: 'GET',
      headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, Range: `${from}-${to}` },
      cache: 'no-store'
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || 'Supabase leaderboard error.');
    const batch = text ? JSON.parse(text) : [];
    if (!Array.isArray(batch)) break;
    rows.push(...batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }
  return rows;
}

function normalizeRow(row) {
  const rawPoint = numberValue(row.point_approved);
  const gameScore = Math.min(MAX_SCORE, Math.max(0, rawPoint));
  const approvedSs = Math.min(6, Math.floor(gameScore / POINT_PER_SS));
  const progress = Math.min(100, Math.max(0, (gameScore / MAX_SCORE) * 100));
  return {
    employee_name: String(row.employee_name || '').trim(),
    department: String(row.department || '').trim(),
    superior_name: String(row.superior_name || '').trim(),
    work_location: String(row.work_location || '').trim(),
    raw_point_approved: rawPoint,
    game_score: gameScore,
    approved_ss: approvedSs,
    progress: Math.round(progress),
    remaining: Math.max(0, MAX_SCORE - gameScore),
    maxed: gameScore >= MAX_SCORE,
    season_status: String(row.season_status || '').trim().toUpperCase(),
    rank: String(row.rank || 'WARRIOR').trim().toUpperCase()
  };
}

function leaderboardSort(a, b) {
  const pointDiff = numberValue(b.game_score) - numberValue(a.game_score);
  if (pointDiff !== 0) return pointDiff;
  return String(a.employee_name || '').localeCompare(String(b.employee_name || ''), 'id', { sensitivity: 'base' });
}

function sendLeaderboardCsv(res, rows) {
  const csv = [['POSISI','NAMA','DEPARTEMEN','SUPERIOR','LOKASI KERJA','POINT APPROVED','GAME SCORE','SS APPROVED','MAX SCORE','PROGRESS','SISA POINT']];
  rows.forEach(row => csv.push([row.position,row.employee_name,row.department,row.superior_name,row.work_location,row.raw_point_approved,row.game_score,row.approved_ss,MAX_SCORE,row.progress + '%',row.remaining]));
  const content = csv.map(row => row.map(csvEscape).join(',')).join('\n');
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="SS_Rank_Up_Leaderboard_${date}.csv"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send('\uFEFF' + content);
}

function numberValue(value) { const number = Number(value); return Number.isFinite(number) ? number : 0; }
function cleanSearch(value) { return String(value || '').trim().replace(/[%*(),]/g, '').replace(/\s+/g, ' '); }
function csvEscape(value) { return '"' + String(value ?? '').replace(/"/g, '""') + '"'; }
