/* ==========================================================
   SS RANK UP SEASON
   POINT EXPORT CSV — FINAL
========================================================== */

export default async function handler(req, res) {

  try {

    const supabaseUrl =
      String(
        process.env.SUPABASE_URL || ''
      )
        .trim()
        .replace(/\/+$/, '');


    const serviceKey =
      String(
        process.env.SUPABASE_SERVICE_KEY || ''
      )
        .trim();


    if (!supabaseUrl || !serviceKey) {

      return res.status(500).json({
        success: false,
        message: 'Environment belum tersedia.'
      });

    }


    const search =
      String(req.query.search || '')
        .trim()
        .toUpperCase();


    let rows =
      await fetchAll(
        supabaseUrl,
        serviceKey
      );


    rows =
      rows.map(normalizeRow);


    if (search) {

      rows =
        rows.filter(row => {

          return [
            row.employee_name,
            row.department,
            row.superior_name,
            row.work_location,
            row.status,
            row.rank
          ]
            .join(' ')
            .toUpperCase()
            .includes(search);

        });

    }


    rows.sort((a, b) => {

      const statusDiff =
        statusPriority(a.status) -
        statusPriority(b.status);


      if (statusDiff !== 0) {
        return statusDiff;
      }


      if (b.ss_done !== a.ss_done) {
        return b.ss_done - a.ss_done;
      }


      if (
        b.point_approved !==
        a.point_approved
      ) {

        return (
          b.point_approved -
          a.point_approved
        );

      }


      if (b.point !== a.point) {

        return (
          b.point -
          a.point
        );

      }


      return String(a.employee_name)
        .localeCompare(
          String(b.employee_name),
          'id',
          {
            sensitivity: 'base'
          }
        );

    });


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

  catch(error) {

    console.error(
      'POINT EXPORT ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Export Point gagal.'

    });

  }

}


/* ==========================================================
   FETCH ALL
========================================================== */

async function fetchAll(
  supabaseUrl,
  serviceKey
) {

  let allRows = [];

  let from = 0;

  const batchSize =
    1000;


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
        'source_row'
      ].join(',')
    );


    const response =
      await fetch(

        supabaseUrl +
        '/rest/v1/season_user_progress?' +
        params.toString(),

        {

          headers: {

            apikey:
              serviceKey,

            Authorization:
              'Bearer ' +
              serviceKey,

            Range:
              `${from}-${to}`

          },

          cache:
            'no-store'

        }

      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );

    }


    const data =
      await response.json();


    allRows.push(...data);


    if (
      data.length <
      batchSize
    ) {

      break;

    }


    from +=
      batchSize;

  }


  return allRows;

}


function normalizeRow(row) {

  let status =
    String(
      row.season_status || ''
    )
      .trim()
      .toUpperCase();


  if (
    status === 'FAILED' ||
    status === 'LOSER'
  ) {

    status =
      'LOSE';

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
      row.rank || 'WARRIOR'

  };

}


function statusPriority(value) {

  const status =
    String(value || '')
      .toUpperCase();


  if (status === 'WINNER') {
    return 0;
  }


  if (
    status === 'LOSE' ||
    status === 'FAILED' ||
    status === 'LOSER'
  ) {

    return 1;

  }


  return 2;

}


function numberValue(value) {

  const number =
    Number(value);


  return Number.isFinite(number)
    ? number
    : 0;

}


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
