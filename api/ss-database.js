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
    const requestedPage = Math.max(1, parseInt(req.query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10) || 50));
    const search = String(req.query.search || '').trim();

    const params = new URLSearchParams();
    params.set('select', ['id','row_no','ss_id','status_admin','status_superior','status_implementasi','employee_name','department','ss_type','superior_name','created_time','work_location','month_no','validation_month','implementation_date','qualification','point','point_approval','source_row','synced_at'].join(','));

    if (search) {
      const clean = cleanSearchValue(search);
      if (/^\d+$/.test(clean)) params.set('ss_id', 'eq.' + clean);
      else params.set('employee_name', 'ilike.*' + clean + '*');
    }

    params.set('order', 'source_row.asc');
    const response = await fetch(supabaseUrl + '/rest/v1/ss_rank_up_database?' + params.toString(), {
      method: 'GET',
      headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey },
      cache: 'no-store'
    });

    const text = await response.text();
    if (!response.ok) {
      console.error('SUPABASE DATABASE ERROR:', response.status, text);
      return res.status(500).json({ success: false, message: 'Database gagal dimuat.' });
    }

    let allRows = [];
    try { allRows = text ? JSON.parse(text) : []; } catch { allRows = []; }
    if (!Array.isArray(allRows)) allRows = [];

    allRows.sort((a, b) => {
      const ap = getQualificationPriority(a.qualification);
      const bp = getQualificationPriority(b.qualification);
      if (ap !== bp) return ap - bp;
      return Number(a.source_row || 0) - Number(b.source_row || 0);
    });

    if (mode === 'export') return sendDatabaseCsv(res, allRows, search);

    const total = allRows.length;
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
    const page = Math.min(requestedPage, totalPages);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = allRows.slice(startIndex, endIndex);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page, limit, total, totalPages,
        from: total > 0 ? startIndex + 1 : 0,
        to: total > 0 ? Math.min(endIndex, total) : 0
      }
    });
  } catch (error) {
    console.error('SS DATABASE API ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

function sendDatabaseCsv(res, rows, search) {
  const csvRows = [['NO','SS ID','Status Admin','Status Superior','Status Implementasi','Nama','Departemen','Jenis SS','Superior','Create Time','Lokasi Kerja','Month','Validasi','Tanggal Implementasi','Kualifikasi','Point','Point Approval']];
  rows.forEach(row => csvRows.push([
    row.row_no ?? '', row.ss_id ?? '', row.status_admin ?? '', row.status_superior ?? '', row.status_implementasi ?? '', row.employee_name ?? '', row.department ?? '', row.ss_type ?? '', row.superior_name ?? '', formatDateTimeForExport(row.created_time), row.work_location ?? '', row.month_no ?? '', row.validation_month ?? '', formatDateForExport(row.implementation_date), row.qualification ?? '', row.point ?? 0, row.point_approval ?? 0
  ]));
  const csv = csvRows.map(row => row.map(csvEscape).join(',')).join('\n');
  const date = new Date().toISOString().slice(0, 10);
  const fileName = search ? `SS_Rank_Up_Season_${safeFileName(search)}_${date}.csv` : `SS_Rank_Up_Season_All_${date}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send('\uFEFF' + csv);
}

function getQualificationPriority(value) {
  const status = String(value || '').trim().toUpperCase();
  if (status === 'DONE') return 0;
  if (status === 'QUALIFIED') return 1;
  if (status === 'NOT QUALIFIED') return 2;
  if (status === '') return 4;
  return 3;
}
function cleanSearchValue(value) { return String(value || '').trim().replace(/[%*(),]/g, '').replace(/\s+/g, ' '); }
function csvEscape(value) { return '"' + String(value ?? '').replace(/"/g, '""') + '"'; }
function safeFileName(value) { return String(value || '').trim().replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 50); }
function formatDateForExport(value) {
  if (!value) return '';
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
}
function formatDateTimeForExport(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  try {
    return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date);
  } catch { return String(value); }
}
