/* ==========================================================
   SS RANK UP SEASON
   PROFILE API — STABLE FINAL
========================================================== */


/* ==========================================================
   CONFIG
========================================================== */

const MAX_GAME_SCORE = 240;


/* ==========================================================
   HANDLER
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
      ).trim();


    const sessionToken =
      String(
        req.query?.session || ''
      ).trim();


    /* ======================================================
       ENV CHECK
    ====================================================== */

    if (
      !supabaseUrl ||
      !serviceKey
    ) {

      return res
        .status(500)
        .json({

          success: false,

          message:
            'Supabase environment belum tersedia.'

        });

    }


    /* ======================================================
       SESSION
    ====================================================== */

    const session =
      await getSession(

        supabaseUrl,

        serviceKey,

        sessionToken

      );


    if (
      !session
    ) {

      return res
        .status(401)
        .json({

          success: false,

          message:
            'Login required.'

        });

    }


    const employeeName =
      cleanText(
        session.user_name
      );


    const email =
      cleanText(
        session.email
      );


    const role =
      cleanText(
        session.role
      ) || 'USER';


    if (
      !employeeName
    ) {

      return res
        .status(404)
        .json({

          success: false,

          message:
            'Nama user tidak ditemukan pada session.'

        });

    }


    /* ======================================================
       PROGRESS USER
    ====================================================== */

    const progress =
      await getUserProgress(

        supabaseUrl,

        serviceKey,

        employeeName

      );


    /* ======================================================
       PROFILE PHOTO
    ====================================================== */

    const appUser =
      await getAppUser(

        supabaseUrl,

        serviceKey,

        email,

        employeeName

      );


    /* ======================================================
       REWARD USER
    ====================================================== */

    const rewards =
      await getUserRewards(

        supabaseUrl,

        serviceKey,

        employeeName

      );


    /* ======================================================
       LEADERBOARD POSITION
    ====================================================== */

    const players =
      await getLeaderboardPlayers(

        supabaseUrl,

        serviceKey

      );


    const leaderboard =
      buildLeaderboard(
        players
      );


    const playerPosition =
      leaderboard.findIndex(

        row =>

          cleanText(
            row.employee_name
          )
            .toUpperCase() ===
          employeeName.toUpperCase()

      );


    /* ======================================================
       GAME SCORE
    ====================================================== */

    const rawPointApproved =
      safeNumber(
        progress?.point_approved
      );


    const gameScore =
      Math.min(

        MAX_GAME_SCORE,

        Math.max(
          0,
          rawPointApproved
        )

      );


    const approvedSs =
      Math.min(

        6,

        Math.floor(
          gameScore / 40
        )

      );


    const remaining =
      Math.max(

        0,

        MAX_GAME_SCORE -
        gameScore

      );


    /* ======================================================
       RESPONSE
    ====================================================== */

    return res
      .status(200)
      .json({

        success: true,


        profile: {

          name:
            employeeName,

          email,

          role,

          photo_url:
            cleanText(
              appUser?.photo_url
            ),

          department:
            cleanText(
              progress?.department
            ),

          superior:
            cleanText(
              progress?.superior_name
            ),

          location:
            cleanText(
              progress?.work_location
            )

        },


        progress:
          progress || {},


        game: {

          position:

            playerPosition >= 0

              ? playerPosition + 1

              : null,

          score:
            gameScore,

          maxScore:
            MAX_GAME_SCORE,

          approvedSs,

          remaining,

          progress:

            Math.round(

              (
                gameScore /
                MAX_GAME_SCORE
              ) *
              100

            )

        },


        rewards:
          rewards || []

      });

  }

  catch(error) {

    console.error(
      'PROFILE API ERROR:',
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        message:
          'Profile gagal dimuat.',

        error:

          process.env.NODE_ENV ===
          'development'

            ? String(
                error?.message ||
                error
              )

            : undefined

      });

  }

}


/* ==========================================================
   SESSION
========================================================== */

async function getSession(
  supabaseUrl,
  serviceKey,
  token
) {

  if (
    !token
  ) {

    return null;

  }


  const params =
    new URLSearchParams();


  params.set(
    'select',
    [
      'token',
      'email',
      'user_name',
      'role',
      'expires_at'
    ].join(',')
  );


  params.set(
    'token',
    'eq.' + token
  );


  params.set(
    'limit',
    '1'
  );


  const response =
    await fetch(

      supabaseUrl +
      '/rest/v1/login_sessions?' +
      params.toString(),

      {

        method:
          'GET',

        headers:
          supabaseHeaders(
            serviceKey
          ),

        cache:
          'no-store'

      }

    );


  if (
    !response.ok
  ) {

    console.error(

      'SESSION QUERY ERROR:',

      response.status,

      await response.text()

    );


    return null;

  }


  const rows =
    await response.json();


  const session =
    Array.isArray(rows)
      ? rows[0]
      : null;


  if (
    !session
  ) {

    return null;

  }


  if (
    session.expires_at
  ) {

    const expiry =
      new Date(
        session.expires_at
      )
        .getTime();


    if (
      Number.isFinite(expiry) &&
      expiry <
      Date.now()
    ) {

      return null;

    }

  }


  return session;

}


/* ==========================================================
   USER PROGRESS
========================================================== */

async function getUserProgress(
  supabaseUrl,
  serviceKey,
  employeeName
) {

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

      'rank'

    ].join(',')
  );


  params.set(
    'employee_name',
    'ilike.' +
    employeeName
  );


  params.set(
    'limit',
    '1'
  );


  const response =
    await fetch(

      supabaseUrl +
      '/rest/v1/season_user_progress?' +
      params.toString(),

      {

        headers:
          supabaseHeaders(
            serviceKey
          ),

        cache:
          'no-store'

      }

    );


  if (
    !response.ok
  ) {

    console.error(

      'PROGRESS QUERY ERROR:',

      response.status,

      await response.text()

    );


    return null;

  }


  const rows =
    await response.json();


  return Array.isArray(rows)
    ? rows[0] || null
    : null;

}


/* ==========================================================
   APP USER / PHOTO
========================================================== */

async function getAppUser(
  supabaseUrl,
  serviceKey,
  email,
  employeeName
) {

  /*
    Kita hanya butuh photo_url.

    Pertama coba menggunakan email.
    Kalau email kosong / tidak ditemukan,
    baru fallback nama.
  */


  if (
    email
  ) {

    const byEmail =
      await queryAppUser(

        supabaseUrl,

        serviceKey,

        'email',

        'eq.' + email

      );


    if (
      byEmail
    ) {

      return byEmail;

    }

  }


  if (
    employeeName
  ) {

    const byName =
      await queryAppUser(

        supabaseUrl,

        serviceKey,

        'name',

        'ilike.' +
        employeeName

      );


    if (
      byName
    ) {

      return byName;

    }

  }


  return null;

}


/* ==========================================================
   QUERY APP USER
========================================================== */

async function queryAppUser(
  supabaseUrl,
  serviceKey,
  column,
  filter
) {

  const params =
    new URLSearchParams();


  params.set(
    'select',
    'photo_url'
  );


  params.set(
    column,
    filter
  );


  params.set(
    'limit',
    '1'
  );


  const response =
    await fetch(

      supabaseUrl +
      '/rest/v1/app_users?' +
      params.toString(),

      {

        headers:
          supabaseHeaders(
            serviceKey
          ),

        cache:
          'no-store'

      }

    );


  if (
    !response.ok
  ) {

    /*
      Photo tidak boleh membuat
      seluruh Profile gagal.
    */

    console.warn(

      'APP USER QUERY WARNING:',

      response.status

    );


    return null;

  }


  const rows =
    await response.json();


  return Array.isArray(rows)
    ? rows[0] || null
    : null;

}


/* ==========================================================
   USER REWARDS
========================================================== */

async function getUserRewards(
  supabaseUrl,
  serviceKey,
  employeeName
) {

  const params =
    new URLSearchParams();


  params.set(
    'select',
    [
      'category',
      'description',
      'participant_type'
    ].join(',')
  );


  params.set(
    'employee_name',
    'ilike.' +
    employeeName
  );


  params.set(
    'order',
    'source_row.asc'
  );


  const response =
    await fetch(

      supabaseUrl +
      '/rest/v1/season_rewards?' +
      params.toString(),

      {

        headers:
          supabaseHeaders(
            serviceKey
          ),

        cache:
          'no-store'

      }

    );


  if (
    !response.ok
  ) {

    /*
      Reward belum dibuat / belum sync
      tidak membuat Profile gagal.
    */

    console.warn(

      'REWARD QUERY WARNING:',

      response.status

    );


    return [];

  }


  const rows =
    await response.json();


  return Array.isArray(rows)
    ? rows
    : [];

}


/* ==========================================================
   LEADERBOARD DATA
========================================================== */

async function getLeaderboardPlayers(
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
      'employee_name,point_approved'
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

            ...supabaseHeaders(
              serviceKey
            ),

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

      console.error(

        'LEADERBOARD PROFILE ERROR:',

        response.status,

        await response.text()

      );


      break;

    }


    const batch =
      await response.json();


    if (
      !Array.isArray(batch)
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
   LEADERBOARD SORT
========================================================== */

function buildLeaderboard(
  rows
) {

  return [
    ...rows
  ]
    .map(
      function(row) {

        const raw =
          safeNumber(
            row.point_approved
          );


        return {

          ...row,

          game_score:

            Math.min(

              MAX_GAME_SCORE,

              Math.max(
                0,
                raw
              )

            )

        };

      }
    )
    .sort(
      function(a, b) {

        if (
          b.game_score !==
          a.game_score
        ) {

          return (
            b.game_score -
            a.game_score
          );

        }


        return cleanText(
          a.employee_name
        )
          .localeCompare(

            cleanText(
              b.employee_name
            ),

            'id',

            {
              sensitivity:
                'base'
            }

          );

      }
    );

}


/* ==========================================================
   SUPABASE HEADERS
========================================================== */

function supabaseHeaders(
  serviceKey
) {

  return {

    apikey:
      serviceKey,

    Authorization:
      'Bearer ' +
      serviceKey,

    Accept:
      'application/json',

    'Content-Type':
      'application/json'

  };

}


/* ==========================================================
   CLEAN TEXT
========================================================== */

function cleanText(
  value
) {

  return String(
    value ?? ''
  )
    .trim()
    .replace(
      /\s+/g,
      ' '
    );

}


/* ==========================================================
   SAFE NUMBER
========================================================== */

function safeNumber(
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
