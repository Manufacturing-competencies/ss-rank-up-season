/* ==========================================================
   SS RANK UP SEASON
   FINAL DASHBOARD API
========================================================== */


export default async function handler(
  req,
  res
) {

  /*
   Jangan cache dashboard user.
  */

  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate'
  );


  const SUPABASE_URL =
    process.env.SUPABASE_URL;


  const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_KEY;


  const LOGIN_URL =
    process.env.APPS_SCRIPT_LOGIN_URL ||
    '';


  /*
   GET only.
  */

  if (
    req.method !== 'GET'
  ) {

    return res
      .status(405)
      .json({

        success:
          false,

        message:
          'Method not allowed.',

        loginUrl:
          LOGIN_URL

      });

  }


  /*
   Environment.
  */

  if (
    !SUPABASE_URL ||
    !SERVICE_KEY
  ) {

    return res
      .status(500)
      .json({

        success:
          false,

        message:
          'Supabase environment variables belum lengkap.',

        loginUrl:
          LOGIN_URL

      });

  }


  const token =
    String(
      req.query.session ||
      ''
    ).trim();


  /*
   Tidak ada session.
  */

  if (!token) {

    return res
      .status(401)
      .json({

        success:
          false,

        message:
          'Login required.',

        loginUrl:
          LOGIN_URL

      });

  }


  const headers = {

    apikey:
      SERVICE_KEY,

    Authorization:
      `Bearer ${SERVICE_KEY}`,

    'Content-Type':
      'application/json'

  };


  try {


    /* ======================================================
       1. VALIDATE SESSION
    ====================================================== */

    const sessionUrl =

      `${SUPABASE_URL}` +

      `/rest/v1/login_sessions` +

      `?token=eq.${encodeURIComponent(token)}` +

      `&select=email,user_name,role,expires_at` +

      `&limit=1`;


    const sessionResponse =
      await fetch(
        sessionUrl,
        {
          headers,
          cache:
            'no-store'
        }
      );


    if (
      !sessionResponse.ok
    ) {

      throw new Error(
        await sessionResponse.text()
      );

    }


    const sessions =
      await sessionResponse.json();


    if (
      !Array.isArray(
        sessions
      ) ||
      sessions.length === 0
    ) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            'Session tidak ditemukan.',

          loginUrl:
            LOGIN_URL

        });

    }


    const session =
      sessions[0];


    /*
     Expired.
    */

    if (
      session.expires_at &&
      new Date(
        session.expires_at
      ).getTime() <
      Date.now()
    ) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            'Session expired.',

          loginUrl:
            LOGIN_URL

        });

    }


    const sessionEmail =
      String(
        session.email ||
        ''
      )
        .trim()
        .toLowerCase();


    /* ======================================================
       2. GET APP USER
    ====================================================== */

    const userUrl =

      `${SUPABASE_URL}` +

      `/rest/v1/app_users` +

      `?email=eq.${encodeURIComponent(sessionEmail)}` +

      `&select=id,name,email,role` +

      `&limit=1`;


    const userResponse =
      await fetch(
        userUrl,
        {
          headers,
          cache:
            'no-store'
        }
      );


    if (
      !userResponse.ok
    ) {

      throw new Error(
        await userResponse.text()
      );

    }


    const users =
      await userResponse.json();


    const user =
      Array.isArray(users) &&
      users.length

        ? users[0]

        : {

            id:
              null,

            name:
              session.user_name,

            email:
              sessionEmail,

            role:
              session.role ||
              'User'

          };


    const employeeName =
      String(
        user.name ||
        session.user_name ||
        ''
      ).trim();


    /* ======================================================
       3. ACTIVE SEASON
    ====================================================== */

    const seasonUrl =

      `${SUPABASE_URL}` +

      `/rest/v1/seasons` +

      `?season_code=eq.SS-RANK-UP-2026` +

      `&select=id,season_code,season_name,tagline,is_active` +

      `&limit=1`;


    const seasonResponse =
      await fetch(
        seasonUrl,
        {
          headers,
          cache:
            'no-store'
        }
      );


    if (
      !seasonResponse.ok
    ) {

      throw new Error(
        await seasonResponse.text()
      );

    }


    const seasons =
      await seasonResponse.json();


    if (
      !Array.isArray(seasons) ||
      seasons.length === 0
    ) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            'Season tidak ditemukan.',

          loginUrl:
            LOGIN_URL

        });

    }


    const season =
      seasons[0];


    /* ======================================================
       4. GET USER PROGRESS
    ====================================================== */

    const progressUrl =

      `${SUPABASE_URL}` +

      `/rest/v1/season_user_progress` +

      `?season_id=eq.${season.id}` +

      `&employee_name=eq.${encodeURIComponent(employeeName)}` +

      `&select=*` +

      `&limit=1`;


    const progressResponse =
      await fetch(
        progressUrl,
        {
          headers,
          cache:
            'no-store'
        }
      );


    if (
      !progressResponse.ok
    ) {

      throw new Error(
        await progressResponse.text()
      );

    }


    const progressRows =
      await progressResponse.json();


    /*
     User belum ada di AKUMULASI.
    */

    if (
      !Array.isArray(progressRows) ||
      progressRows.length === 0
    ) {

      return res
        .status(200)
        .json({

          success:
            true,

          loginUrl:
            LOGIN_URL,


          user: {

            id:
              user.id ||
              null,

            name:
              employeeName,

            email:
              user.email ||
              sessionEmail,

            role:
              user.role ||
              session.role ||
              'User'

          },


          season: {

            id:
              season.id,

            code:
              season.season_code,

            name:
              season.season_name,

            tagline:
              season.tagline,

            active:
              season.is_active

          },


          progress: {

            department:
              '',

            superior:
              '',

            location:
              '',

            ssDone:
              0,

            point:
              0,

            pointApproved:
              0,

            ssSubmit:
              0,

            totalApproved:
              0,

            rank:
              'WARRIOR',

            status:
              'FAILED',

            months:
              [],

            missedMonths:
              []

          }

        });

    }


    const progress =
      progressRows[0];


    /* ======================================================
       5. MONTH DATA
    ====================================================== */

    const months = [

      {

        name:
          progress.month_1_name ||
          '',

        value:
          Number(
            progress.month_1_value ||
            0
          )

      },

      {

        name:
          progress.month_2_name ||
          '',

        value:
          Number(
            progress.month_2_value ||
            0
          )

      },

      {

        name:
          progress.month_3_name ||
          '',

        value:
          Number(
            progress.month_3_value ||
            0
          )

      }

    ];


    /*
     Month belum achieve.
    */

    const missedMonthList =
      months

        .filter(
          function(month) {

            return (
              month.name &&
              month.value < 1
            );

          }
        )

        .map(
          function(month) {

            return month.name;

          }
        );


    /*
     Recalculate status untuk safety.
    */

    const winner =
      months.length === 3 &&
      months.every(
        function(month) {

          return (
            month.value >= 1
          );

        }
      );


    const seasonStatus =
      winner
        ? 'WINNER'
        : 'FAILED';


    /*
     Rank berdasarkan total Approved Implementasi.
    */

    const totalApproved =
      Number(
        progress.total_approved ||
        0
      );


    const rank =
      calculateRank(
        totalApproved
      );


    /* ======================================================
       6. FINAL RESPONSE
    ====================================================== */

    return res
      .status(200)
      .json({

        success:
          true,

        loginUrl:
          LOGIN_URL,


        user: {

          id:
            user.id ||
            null,

          name:
            employeeName,

          email:
            user.email ||
            sessionEmail,

          role:
            user.role ||
            session.role ||
            'User'

        },


        season: {

          id:
            season.id,

          code:
            season.season_code,

          name:
            season.season_name,

          tagline:
            season.tagline,

          active:
            season.is_active

        },


        progress: {

          department:
            progress.department ||
            '',

          superior:
            progress.superior_name ||
            '',

          location:
            progress.work_location ||
            '',


          ssDone:
            Number(
              progress.ss_done ||
              0
            ),


          point:
            Number(
              progress.point ||
              0
            ),


          pointApproved:
            Number(
              progress.point_approved ||
              0
            ),


          ssSubmit:
            Number(
              progress.ss_submit ||
              0
            ),


          totalApproved:
            totalApproved,


          rank:
            rank,


          status:
            seasonStatus,


          months:
            months,


          missedMonths:
            missedMonthList

        }

      });


  }

  catch (error) {

    console.error(
      'DASHBOARD ERROR:',
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          'Gagal mengambil data dashboard.',

        loginUrl:
          LOGIN_URL

      });

  }

}


/* ==========================================================
   RANK RULE
========================================================== */

function calculateRank(
  total
) {

  const value =
    Number(
      total ||
      0
    );


  if (
    value <= 0
  ) {

    return 'WARRIOR';

  }


  if (
    value === 1
  ) {

    return 'ELITE';

  }


  if (
    value === 2
  ) {

    return 'EPIC';

  }


  if (
    value === 3
  ) {

    return 'LEGEND';

  }


  if (
    value >= 4 &&
    value <= 6
  ) {

    return 'MYTHIC';

  }


  if (
    value >= 7 &&
    value <= 9
  ) {

    return 'MYTHIC HONOR';

  }


  return 'MYTHIC GLORY';

}
