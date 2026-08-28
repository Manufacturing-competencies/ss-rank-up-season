/* ==========================================================
   SS RANK UP SEASON
   LEADERBOARD EXPORT CSV
========================================================== */

const MAX_SCORE =
  240;

const POINT_PER_SS =
  40;


export default async function handler(
  req,
  res
) {

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


    if (
      !supabaseUrl ||
      !serviceKey
    ) {

      return res
        .status(500)
        .json({

          success:
            false,

          message:
            'Environment belum tersedia.'

        });

    }


    const search =
      String(
        req.query.search || ''
      )
        .trim()
        .toUpperCase();


    let rows =
      await fetchAll(
        supabaseUrl,
        serviceKey
      );


    rows =
      rows

        .map(
          normalizeRow
        )

        .filter(
          row =>
            row.employee_name
        );


    rows.sort(
      leaderboardSort
    );


    rows =
      rows.map(
        function(row, index) {

          return {

            ...row,

            position:
              index + 1

          };

        }
      );


    if (
      search
    ) {

      rows =
        rows.filter(
          function(row) {

            return [

              row.employee_name,

              row.department,

              row.superior_name,

              row.work_location

            ]
              .join(' ')
              .toUpperCase()
              .includes(
                search
              );

          }
        );

    }


    const csv =
      [];


    csv.push([

      'POSISI',

      'NAMA',

      'DEPARTEMEN',

      'SUPERIOR',

      'LOKASI KERJA',

      'POINT APPROVED',

      'GAME SCORE',

      'SS APPROVED',

      'MAX SCORE',

      'PROGRESS',

      'SISA POINT'

    ]);


    rows.forEach(
      function(row) {

        csv.push([

          row.position,

          row.employee_name,

          row.department,

          row.superior_name,

          row.work_location,

          row.raw_point_approved,

          row.game_score,

          row.approved_ss,

          MAX_SCORE,

          row.progress +
          '%',

          row.remaining

        ]);

      }
    );


    const content =
      csv

        .map(
          row =>
            row
              .map(
                csvEscape
              )
              .join(',')
        )

        .join('\n');


    const date =
      new Date()
        .toISOString()
        .slice(
          0,
          10
        );


    res.setHeader(
      'Content-Type',
      'text/csv; charset=utf-8'
    );


    res.setHeader(
      'Content-Disposition',
      `attachment; filename="SS_Rank_Up_Leaderboard_${date}.csv"`
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
      'LEADERBOARD EXPORT ERROR:',
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          'Export leaderboard gagal.'

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

  const rows =
    [];


  let from =
    0;


  const batchSize =
    1000;


  while (
    true
  ) {

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
        'point_approved',
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


    if (
      !response.ok
    ) {

      throw new Error(
        await response.text()
      );

    }


    const data =
      await response.json();


    rows.push(
      ...data
    );


    if (
      data.length <
      batchSize
    ) {

      break;

    }


    from +=
      batchSize;

  }


  return rows;

}


/* ==========================================================
   NORMALIZE
========================================================== */

function normalizeRow(
  row
) {

  const raw =
    numberValue(
      row.point_approved
    );


  const score =
    Math.min(
      MAX_SCORE,
      Math.max(
        0,
        raw
      )
    );


  return {

    employee_name:
      row.employee_name || '',

    department:
      row.department || '',

    superior_name:
      row.superior_name || '',

    work_location:
      row.work_location || '',

    raw_point_approved:
      raw,

    game_score:
      score,

    approved_ss:
      Math.min(
        6,
        Math.floor(
          score /
          POINT_PER_SS
        )
      ),

    progress:
      Math.round(
        (
          score /
          MAX_SCORE
        ) *
        100
      ),

    remaining:
      Math.max(
        0,
        MAX_SCORE -
        score
      )

  };

}


function leaderboardSort(
  a,
  b
) {

  if (
    b.game_score !==
    a.game_score
  ) {

    return (
      b.game_score -
      a.game_score
    );

  }


  return String(
    a.employee_name
  )
    .localeCompare(
      String(
        b.employee_name
      ),
      'id',
      {
        sensitivity:
          'base'
      }
    );

}


function numberValue(
  value
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? number
    : 0;

}


function csvEscape(
  value
) {

  return (
    '"' +

    String(
      value ?? ''
    )
      .replace(
        /"/g,
        '""'
      ) +

    '"'
  );

}
