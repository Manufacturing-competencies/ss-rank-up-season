/* ==========================================================
   SS RANK UP SEASON
   LEADERBOARD API — FINAL
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

    /* ======================================================
       ENVIRONMENT
    ====================================================== */

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
            'Supabase environment belum tersedia.'

        });

    }


    /* ======================================================
       PARAMETER
    ====================================================== */

    const requestedPage =
      Math.max(
        1,
        parseInt(
          req.query.page || '1',
          10
        ) || 1
      );


    const limit =
      Math.min(
        100,
        Math.max(
          1,
          parseInt(
            req.query.limit || '50',
            10
          ) || 50
        )
      );


    const search =
      cleanSearch(
        req.query.search || ''
      );


    const playerName =
      cleanSearch(
        req.query.player || ''
      );


    /* ======================================================
       FETCH ALL PROGRESS
    ====================================================== */

    let allRows =
      await fetchAllProgress(
        supabaseUrl,
        serviceKey
      );


    /* ======================================================
       NORMALIZE
    ====================================================== */

    allRows =
      allRows

        .map(
          normalizeRow
        )

        .filter(
          row =>
            row.employee_name
        );


    /* ======================================================
       GLOBAL SORT

       POINT APPROVED DESC
       NAMA ASC
    ====================================================== */

    allRows.sort(
      leaderboardSort
    );


    /* ======================================================
       GLOBAL POSITION

       Posisi dihitung sebelum search.
    ====================================================== */

    allRows =
      allRows.map(
        function(row, index) {

          return {

            ...row,

            position:
              index + 1

          };

        }
      );


    /* ======================================================
       TOP 10 GLOBAL
    ====================================================== */

    const top10 =
      allRows.slice(
        0,
        10
      );


    /* ======================================================
       CURRENT PLAYER
    ====================================================== */

    let player =
      null;


    if (
      playerName
    ) {

      const target =
        playerName
          .toUpperCase();


      player =
        allRows.find(
          row =>
            String(
              row.employee_name || ''
            )
              .trim()
              .toUpperCase() ===
            target
        ) || null;

    }


    /* ======================================================
       SUMMARY
    ====================================================== */

    const maxScorePlayers =
      allRows.filter(
        row =>
          row.game_score >=
          MAX_SCORE
      ).length;


    const totalScore =
      allRows.reduce(
        function(total, row) {

          return (
            total +
            row.game_score
          );

        },
        0
      );


    /* ======================================================
       SEARCH FULL TABLE
    ====================================================== */

    let filteredRows =
      allRows;


    if (
      search
    ) {

      const keyword =
        search
          .toUpperCase();


      filteredRows =
        allRows.filter(
          function(row) {

            const text = [

              row.employee_name,

              row.department,

              row.superior_name,

              row.work_location

            ]
              .join(' ')
              .toUpperCase();


            return text.includes(
              keyword
            );

          }
        );

    }


    /* ======================================================
       PAGINATION
    ====================================================== */

    const total =
      filteredRows.length;


    const totalPages =
      total > 0

        ? Math.ceil(
            total / limit
          )

        : 1;


    const page =
      Math.min(
        requestedPage,
        totalPages
      );


    const from =
      (
        page - 1
      ) *
      limit;


    const to =
      from +
      limit;


    const data =
      filteredRows.slice(
        from,
        to
      );


    /* ======================================================
       RESPONSE
    ====================================================== */

    return res
      .status(200)
      .json({

        success:
          true,

        config: {

          maxScore:
            MAX_SCORE,

          pointPerSs:
            POINT_PER_SS,

          maxSs:
            MAX_SCORE /
            POINT_PER_SS

        },

        summary: {

          totalPlayers:
            allRows.length,

          maxScorePlayers:
            maxScorePlayers,

          totalScore:
            totalScore

        },

        player:
          player,

        top10:
          top10,

        data:
          data,

        pagination: {

          page:
            page,

          limit:
            limit,

          total:
            total,

          totalPages:
            totalPages,

          from:
            total > 0
              ? from + 1
              : 0,

          to:
            total > 0
              ? Math.min(
                  to,
                  total
                )
              : 0

        }

      });


  }

  catch(error) {

    console.error(
      'LEADERBOARD API ERROR:',
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          'Leaderboard gagal dimuat.'

      });

  }

}


/* ==========================================================
   FETCH ALL
========================================================== */

async function fetchAllProgress(
  supabaseUrl,
  serviceKey
) {

  const rows =
    [];


  const batchSize =
    1000;


  let from =
    0;


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
        'season_status',
        'rank',
        'source_row'
      ].join(',')
    );


    params.set(
      'order',
      'source_row.asc'
    );


    const response =
      await fetch(

        supabaseUrl +

        '/rest/v1/season_user_progress?' +

        params.toString(),

        {

          method:
            'GET',

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


    const text =
      await response.text();


    if (
      !response.ok
    ) {

      throw new Error(
        text ||
        'Supabase leaderboard error.'
      );

    }


    let batch =
      [];


    try {

      batch =
        text
          ? JSON.parse(
              text
            )
          : [];

    }

    catch {

      batch =
        [];

    }


    if (
      !Array.isArray(
        batch
      )
    ) {

      break;

    }


    rows.push(
      ...batch
    );


    if (
      batch.length <
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

  const rawPoint =
    numberValue(
      row.point_approved
    );


  const gameScore =
    Math.min(
      MAX_SCORE,
      Math.max(
        0,
        rawPoint
      )
    );


  const approvedSs =
    Math.min(
      6,
      Math.floor(
        gameScore /
        POINT_PER_SS
      )
    );


  const progress =
    Math.min(
      100,
      Math.max(
        0,
        (
          gameScore /
          MAX_SCORE
        ) *
        100
      )
    );


  return {

    employee_name:
      String(
        row.employee_name || ''
      ).trim(),

    department:
      String(
        row.department || ''
      ).trim(),

    superior_name:
      String(
        row.superior_name || ''
      ).trim(),

    work_location:
      String(
        row.work_location || ''
      ).trim(),

    raw_point_approved:
      rawPoint,

    game_score:
      gameScore,

    approved_ss:
      approvedSs,

    progress:
      Math.round(
        progress
      ),

    remaining:
      Math.max(
        0,
        MAX_SCORE -
        gameScore
      ),

    maxed:
      gameScore >=
      MAX_SCORE,

    season_status:
      String(
        row.season_status || ''
      )
        .trim()
        .toUpperCase(),

    rank:
      String(
        row.rank ||
        'WARRIOR'
      )
        .trim()
        .toUpperCase()

  };

}


/* ==========================================================
   SORT
========================================================== */

function leaderboardSort(
  a,
  b
) {

  const pointDiff =
    numberValue(
      b.game_score
    ) -
    numberValue(
      a.game_score
    );


  if (
    pointDiff !== 0
  ) {

    return pointDiff;

  }


  return String(
    a.employee_name || ''
  )
    .localeCompare(

      String(
        b.employee_name || ''
      ),

      'id',

      {
        sensitivity:
          'base'
      }

    );

}


/* ==========================================================
   NUMBER
========================================================== */

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


/* ==========================================================
   SEARCH CLEANER
========================================================== */

function cleanSearch(
  value
) {

  return String(
    value || ''
  )
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
