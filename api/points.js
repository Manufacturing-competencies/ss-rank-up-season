/* ==========================================================
   SS RANK UP SEASON
   POINT API + POINT EXPORT — FINAL MERGED
========================================================== */

export default async function handler(req, res) {

  try {

    /* ======================================================
       METHOD
    ====================================================== */

    if (req.method !== 'GET') {

      res.setHeader('Allow', ['GET']);

      return res.status(405).json({
        success: false,
        message: 'Method tidak diizinkan.'
      });

    }


    /* ======================================================
       ENVIRONMENT
    ====================================================== */

    const supabaseUrl =
      String(process.env.SUPABASE_URL || '')
        .trim()
        .replace(/\/+$/, '');


    const serviceKey =
      String(process.env.SUPABASE_SERVICE_KEY || '')
        .trim();


    if (!supabaseUrl || !serviceKey) {

      return res.status(500).json({
        success: false,
        message: 'Supabase environment belum tersedia.'
      });

    }


    /* ======================================================
       MODE

       /api/points
       /api/points?mode=export
    ====================================================== */

    const mode =
      String(req.query.mode || '')
        .trim()
        .toLowerCase();


    /* ======================================================
       SEARCH
    ====================================================== */

    const search =
      cleanSearchValue(
        req.query.search || ''
      );


    /* ======================================================
       GET ALL DATA
    ====================================================== */

    let rows =
      await fetchAllProgress(
        supabaseUrl,
        serviceKey
      );


    /* ======================================================
       NORMALIZE
    ====================================================== */

    rows =
      rows.map(normalizeRow);


    /* ======================================================
       SEARCH
    ====================================================== */

    if (search) {

      const keyword =
        search.toUpperCase();


      rows =
        rows.filter(row => {

          const text = [
            row.employee_name,
            row.department,
            row.superior_name,
            row.work_location,
            row.status,
            row.rank
          ]
            .join(' ')
            .toUpperCase();


          return text.includes(keyword);

        });

    }


    /* ======================================================
       FINAL SORT

       1 WINNER
       2 LOSE
       3 SS DONE DESC
       4 POINT APPROVED DESC
       5 POINT DESC
       6 NAMA ASC
    ====================================================== */

    rows.sort((a, b) => {

      const statusDiff =
        statusPriority(a.status) -
        statusPriority(b.status);


      if (statusDiff !== 0) {
        return statusDiff;
      }


      const ssDoneDiff =
        numberValue(b.ss_done) -
        numberValue(a.ss_done);


      if (ssDoneDiff !== 0) {
        return ssDoneDiff;
      }


      const approvedDiff =
        numberValue(b.point_approved) -
        numberValue(a.point_approved);


      if (approvedDiff !== 0) {
        return approvedDiff;
      }


      const pointDiff =
        numberValue(b.point) -
        numberValue(a.point);


      if (pointDiff !== 0) {
        return pointDiff;
      }


      return String(a.employee_name || '')
        .localeCompare(
          String(b.employee_name || ''),
          'id',
          {
            sensitivity: 'base'
          }
        );

    });


    /* ======================================================
       GLOBAL POSITION
    ====================================================== */

    rows =
      rows.map((row, index) => ({
        ...row,
        position: index + 1
      }));


    /* ======================================================
       EXPORT CSV
    ====================================================== */

    if (mode === 'export') {

      return sendPointCsv(
        res,
        rows
      );

    }


    /* ======================================================
       PAGINATION
    ====================================================== */

    const requestedPage =
      Math.max(
        1,
        parseInt(req.query.page || '1', 10) || 1
      );


    const limit =
      Math.min(
        100,
        Math.max(
          1,
          parseInt(req.query.limit || '50', 10) || 50
        )
      );


    /* ======================================================
       PODIUM

       TOP 3 hanya WINNER
    ====================================================== */

    const podium =
      rows
        .filter(
          row => row.status === 'WINNER'
        )
        .slice(0, 3);


    /* ======================================================
       COUNTER
    ====================================================== */

    const totalWinner =
      rows.filter(
        row => row.status === 'WINNER'
      ).length;


    const totalLose =
      rows.filter(
        row => row.status === 'LOSE'
      ).length;


    /* ======================================================
       PAGINATION
    ====================================================== */

    const total =
      rows.length;


    const totalPages =
      total > 0
        ? Math.ceil(total / limit)
        : 1;


    const page =
      Math.min(
        requestedPage,
        totalPages
      );


    const from =
      (page - 1) * limit;


    const to =
      from + limit;


    const data =
      rows.slice(
        from,
        to
      );


    /* ======================================================
       RESPONSE
    ====================================================== */

    res.setHeader(
      'Cache-Control',
      'no-store'
    );


    return res.status(200).json({

      success: true,

      podium,

      summary: {
        total,
        winner: totalWinner,
        lose: totalLose
      },

      data,

      pagination: {

        page,

        limit,

        total,

        totalPages,

        from:
          total > 0
            ? from + 1
            : 0,

        to:
          total > 0
            ? Math.min(to, total)
            : 0

      }

    });


  }

  catch(error) {

    console.error(
      'POINT API ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Point leaderboard gagal dimuat.'

    });

  }

}


/* ==========================================================
   EXPORT CSV
========================================================== */

function sendPointCsv(
  res,
  rows
) {

  const csv = [];


  csv.push([

    'NO',
    'NAMA',
    'DEPARTEMEN',
    'SUPERIOR',
    'LOKASI KERJA',
    'SS DONE',
    'POINT',
    'POINT APPROVED',
    'SS SUBMIT',
    'BULAN 1',
    'BULAN 1 VALUE',
    'BULAN 2',
    'BULAN 2 VALUE',
    'BULAN 3',
    'BULAN 3 VALUE',
    'STATUS',
    'SUM',
    'RANK'

  ]);


  rows.forEach(
    (row, index) => {

      csv.push([

        index + 1,

        row.employee_name,

        row.department,

        row.superior_name,

        row.work_location,

        row.ss_done,

        row.point,

        row.point_approved,

        row.ss_submit,

        row.month_1_name,

        row.month_1_value,

        row.month_2_name,

        row.month_2_value,

        row.month_3_name,

        row.month_3_value,

        row.status,

        row.sum,

        row.rank

      ]);

    }
  );


  const content =
    csv
      .map(
        row =>
          row
            .map(csvEscape)
            .join(',')
      )
      .join('\n');


  const date =
    new Date()
      .toISOString()
      .slice(0, 10);


  res.setHeader(
    'Content-Type',
    'text/csv; charset=utf-8'
  );


  res.setHeader(
    'Content-Disposition',
    `attachment; filename="SS_Rank_Up_Point_${date}.csv"`
  );


  res.setHeader(
    'Cache-Control',
    'no-store'
  );


  return res
    .status(200)
    .send(
      '\uFEFF' +
      content
    );

}


/* ==========================================================
   FETCH ALL SUPABASE ROWS
========================================================== */

async function fetchAllProgress(
  supabaseUrl,
  serviceKey
) {

  const allRows = [];

  const batchSize =
    1000;


  let from =
    0;


  while (true) {

    const to =
      from +
      batchSize -
      1;


    const params =
      new URLSearchParams();


    params.set(
      'select',
      [
        'employee_name',
        'department',
        'superior_name',
        'work_location',
        'ss_done',
        'point',
        'point_approved',
        'ss_submit',
        'month_1_name',
        'month_1_value',
        'month_2_name',
        'month_2_value',
        'month_3_name',
        'month_3_value',
        'season_status',
        'total_approved',
        'rank',
        'source_row',
        'updated_at'
      ].join(',')
    );


    params.set(
      'order',
      'source_row.asc'
    );


    const url =
      supabaseUrl +
      '/rest/v1/season_user_progress?' +
      params.toString();


    const response =
      await fetch(
        url,
        {
          method: 'GET',

          headers: {

            apikey:
              serviceKey,

            Authorization:
              'Bearer ' + serviceKey,

            Range:
              `${from}-${to}`

          },

          cache:
            'no-store'
        }
      );


    const text =
      await response.text();


    if (!response.ok) {

      throw new Error(
        text ||
        'Supabase progress error.'
      );

    }


    const batch =
      text
        ? JSON.parse(text)
        : [];


    if (!Array.isArray(batch)) {
      break;
    }


    allRows.push(...batch);


    if (batch.length < batchSize) {
      break;
    }


    from +=
      batchSize;

  }


  return allRows;

}


/* ==========================================================
   NORMALIZE ROW
========================================================== */

function normalizeRow(row) {

  const rawStatus =
    String(
      row.season_status || ''
    )
      .trim()
      .toUpperCase();


  let status =
    rawStatus;


  if (
    rawStatus === 'FAILED' ||
    rawStatus === 'LOSER' ||
    rawStatus === 'LOSE'
  ) {

    status =
      'LOSE';

  }


  if (
    rawStatus === 'WINNER'
  ) {

    status =
      'WINNER';

  }


  return {

    employee_name:
      row.employee_name || '',

    department:
      row.department || '',

    superior_name:
      row.superior_name || '',

    work_location:
      row.work_location || '',

    ss_done:
      numberValue(row.ss_done),

    point:
      numberValue(row.point),

    point_approved:
      numberValue(row.point_approved),

    ss_submit:
      numberValue(row.ss_submit),

    month_1_name:
      row.month_1_name || '',

    month_1_value:
      numberValue(row.month_1_value),

    month_2_name:
      row.month_2_name || '',

    month_2_value:
      numberValue(row.month_2_value),

    month_3_name:
      row.month_3_name || '',

    month_3_value:
      numberValue(row.month_3_value),

    status,

    sum:
      numberValue(
        row.total_approved
      ),

    rank:
      row.rank || 'WARRIOR',

    source_row:
      numberValue(
        row.source_row
      )

  };

}


/* ==========================================================
   STATUS PRIORITY
========================================================== */

function statusPriority(status) {

  const value =
    String(status || '')
      .trim()
      .toUpperCase();


  if (value === 'WINNER') {
    return 0;
  }


  if (
    value === 'LOSE' ||
    value === 'LOSER' ||
    value === 'FAILED'
  ) {

    return 1;

  }


  return 2;

}


/* ==========================================================
   NUMBER
========================================================== */

function numberValue(value) {

  const number =
    Number(value);


  return Number.isFinite(number)
    ? number
    : 0;

}


/* ==========================================================
   SEARCH CLEANER
========================================================== */

function cleanSearchValue(value) {

  return String(value || '')
    .trim()
    .replace(
      /[%*(),]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    );

}


/* ==========================================================
   CSV ESCAPE
========================================================== */

function csvEscape(value) {

  return (
    '"' +
    String(value ?? '')
      .replace(
        /"/g,
        '""'
      ) +
    '"'
  );

}
