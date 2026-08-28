/* ==========================================================
   SS RANK UP SEASON
   PROFILE API
========================================================== */

const MAX_GAME_SCORE =
  240;


export default async function handler(
  req,
  res
) {

  try {

    const url =
      String(
        process.env.SUPABASE_URL || ''
      )
        .trim()
        .replace(
          /\/+$/,
          ''
        );


    const key =
      String(
        process.env.SUPABASE_SERVICE_KEY || ''
      ).trim();


    const token =
      String(
        req.query.session || ''
      ).trim();


    if (
      !url ||
      !key
    ) {

      return res.status(500).json({
        success: false
      });

    }


    const session =
      await getSession(
        url,
        key,
        token
      );


    if (
      !session
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          'Login required.'

      });

    }


    const name =
      String(
        session.user_name || ''
      ).trim();


    const email =
      String(
        session.email || ''
      ).trim();


    const appUser =
      await getSingle(

        url,

        key,

        'app_users',

        'name,email,role,photo_url',

        'email',

        email

      );


    const progress =
      await getSingle(

        url,

        key,

        'season_user_progress',

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
        ].join(','),

        'employee_name',

        name,

        true

      );


    const rewards =
      await getMany(

        url,

        key,

        'season_rewards',

        [
          'category',
          'description',
          'participant_type'
        ].join(','),

        'employee_name',

        name,

        true

      );


    const allPlayers =
      await getAllProgress(
        url,
        key
      );


    allPlayers.sort(
      function(a, b) {

        const scoreA =
          Math.min(
            MAX_GAME_SCORE,
            Number(
              a.point_approved || 0
            )
          );


        const scoreB =
          Math.min(
            MAX_GAME_SCORE,
            Number(
              b.point_approved || 0
            )
          );


        if (
          scoreB !==
          scoreA
        ) {

          return (
            scoreB -
            scoreA
          );

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
    );


    const playerIndex =
      allPlayers.findIndex(
        row =>
          String(
            row.employee_name || ''
          )
            .trim()
            .toUpperCase() ===
          name.toUpperCase()
      );


    const gameScore =
      Math.min(
        MAX_GAME_SCORE,
        Number(
          progress?.point_approved || 0
        )
      );


    return res.status(200).json({

      success:
        true,

      profile: {

        name:

          appUser?.name ||
          name,

        email,

        role:

          appUser?.role ||
          session.role ||
          'USER',

        photo_url:

          appUser?.photo_url ||
          '',

        department:

          progress?.department ||
          '',

        superior:

          progress?.superior_name ||
          '',

        location:

          progress?.work_location ||
          ''

      },

      progress:
        progress || {},

      game: {

        position:

          playerIndex >= 0

            ? playerIndex + 1

            : null,

        score:
          gameScore,

        maxScore:
          MAX_GAME_SCORE,

        approvedSs:
          Math.min(
            6,
            Math.floor(
              gameScore / 40
            )
          ),

        remaining:

          Math.max(
            0,
            MAX_GAME_SCORE -
            gameScore
          )

      },

      rewards

    });


  }

  catch(error) {

    console.error(
      'PROFILE API ERROR:',
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        'Profile gagal dimuat.'

    });

  }

}


/* ==========================================================
   SESSION
========================================================== */

async function getSession(
  url,
  key,
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
    'email,user_name,role,expires_at'
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

      url +
      '/rest/v1/login_sessions?' +
      params.toString(),

      {
        headers:
          headers(key),

        cache:
          'no-store'
      }

    );


  if (
    !response.ok
  ) {

    return null;

  }


  const rows =
    await response.json();


  const session =
    rows[0];


  if (
    !session
  ) {

    return null;

  }


  if (
    session.expires_at &&
    new Date(
      session.expires_at
    ).getTime() <
    Date.now()
  ) {

    return null;

  }


  return session;

}


/* ==========================================================
   SINGLE
========================================================== */

async function getSingle(
  url,
  key,
  table,
  select,
  column,
  value,
  caseInsensitive = false
) {

  if (
    !value
  ) {

    return null;

  }


  const params =
    new URLSearchParams();


  params.set(
    'select',
    select
  );


  params.set(

    column,

    (
      caseInsensitive
        ? 'ilike.'
        : 'eq.'
    ) +

    value

  );


  params.set(
    'limit',
    '1'
  );


  const response =
    await fetch(

      url +
      '/rest/v1/' +
      table +
      '?' +
      params.toString(),

      {

        headers:
          headers(key),

        cache:
          'no-store'

      }

    );


  if (
    !response.ok
  ) {

    return null;

  }


  const rows =
    await response.json();


  return rows[0] || null;

}


/* ==========================================================
   MANY
========================================================== */

async function getMany(
  url,
  key,
  table,
  select,
  column,
  value,
  caseInsensitive = false
) {

  const params =
    new URLSearchParams();


  params.set(
    'select',
    select
  );


  params.set(

    column,

    (
      caseInsensitive
        ? 'ilike.'
        : 'eq.'
    ) +

    value

  );


  const response =
    await fetch(

      url +
      '/rest/v1/' +
      table +
      '?' +
      params.toString(),

      {
        headers:
          headers(key),

        cache:
          'no-store'
      }

    );


  if (
    !response.ok
  ) {

    return [];

  }


  return await response.json();

}


/* ==========================================================
   ALL LEADERBOARD
========================================================== */

async function getAllProgress(
  url,
  key
) {

  const rows =
    [];


  let from =
    0;


  const size =
    1000;


  while (
    true
  ) {

    const response =
      await fetch(

        url +
        '/rest/v1/season_user_progress' +
        '?select=employee_name,point_approved',

        {

          headers: {

            ...headers(key),

            Range:
              `${from}-${from + size - 1}`

          },

          cache:
            'no-store'

        }

      );


    if (
      !response.ok
    ) {

      break;

    }


    const batch =
      await response.json();


    rows.push(
      ...batch
    );


    if (
      batch.length <
      size
    ) {

      break;

    }


    from +=
      size;

  }


  return rows;

}


function headers(
  key
) {

  return {

    apikey:
      key,

    Authorization:
      'Bearer ' +
      key,

    Accept:
      'application/json'

  };

}
