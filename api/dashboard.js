export default async function handler(req, res) {

  if (
    req.method !== 'GET'
  ) {

    return res
      .status(405)
      .json({

        success:false,

        message:
          'Method not allowed.'

      });

  }


  const SUPABASE_URL =
    process.env.SUPABASE_URL;


  const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_KEY;


  if (
    !SUPABASE_URL ||
    !SERVICE_KEY
  ) {

    return res
      .status(500)
      .json({

        success:false,

        message:
          'Supabase configuration missing.'

      });

  }


  const token =
    String(
      req.query.session || ''
    )
      .trim();


  if (!token) {

    return res
      .status(401)
      .json({

        success:false,

        message:
          'Session required.'

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


    /* ======================================
       SESSION
    ====================================== */

    const sessionResponse =
      await fetch(

        SUPABASE_URL +

        '/rest/v1/login_sessions' +

        '?token=eq.' +

        encodeURIComponent(
          token
        ) +

        '&select=email,user_name,role,expires_at' +

        '&limit=1',

        {
          headers
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
      !sessions.length
    ) {

      return res
        .status(401)
        .json({

          success:false,

          message:
            'Session tidak ditemukan.'

        });

    }


    const session =
      sessions[0];


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

          success:false,

          message:
            'Session expired.'

        });

    }


    /* ======================================
       APP USER
    ====================================== */

    const userResponse =
      await fetch(

        SUPABASE_URL +

        '/rest/v1/app_users' +

        '?email=eq.' +

        encodeURIComponent(
          session.email
        ) +

        '&select=id,name,email,role' +

        '&limit=1',

        {
          headers
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
      users.length
        ? users[0]
        : {

            id:null,

            name:
              session.user_name,

            email:
              session.email,

            role:
              session.role

          };


    const employeeName =
      String(
        user.name ||
        session.user_name ||
        ''
      )
        .trim();


    /* ======================================
       ACTIVE SEASON
    ====================================== */

    const seasonResponse =
      await fetch(

        SUPABASE_URL +

        '/rest/v1/seasons' +

        '?season_code=eq.SS-RANK-UP-2026' +

        '&select=id,season_code,season_name,tagline,is_active' +

        '&limit=1',

        {
          headers
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
      !seasons.length
    ) {

      return res
        .status(404)
        .json({

          success:false,

          message:
            'Season tidak ditemukan.'

        });

    }


    const season =
      seasons[0];


    /* ======================================
       USER PROGRESS

       Karena AKUMULASI saat ini belum punya
       email, lookup menggunakan NAMA.

       Nanti kalau struktur berubah,
       bagian ini yang kita upgrade.
    ====================================== */

    const progressResponse =
      await fetch(

        SUPABASE_URL +

        '/rest/v1/season_user_progress' +

        '?season_id=eq.' +

        encodeURIComponent(
          season.id
        ) +

        '&employee_name=eq.' +

        encodeURIComponent(
          employeeName
        ) +

        '&select=*' +

        '&limit=1',

        {
          headers
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


    let progress =
      null;


    if (
      Array.isArray(
        progressRows
      ) &&
      progressRows.length
    ) {

      progress =
        progressRows[0];

    }


    /* ======================================
       DEFAULT JIKA BELUM ADA DI AKUMULASI
    ====================================== */

    if (!progress) {

      return res
        .status(200)
        .json({

          success:true,

          user:{

            id:
              user.id || null,

            name:
              employeeName,

            email:
              user.email ||
              session.email,

            role:
              user.role ||
              session.role ||
              'User'

          },

          season:{

            id:
              season.id,

            code:
              season.season_code,

            name:
              season.season_name,

            tagline:
              season.tagline,

            active:
              season.is_active,

            rank:
              'WARRIOR',

            totalApproved:
              0,

            status:
              '',

            missedMonths:
              [],

            months:
              []

          }

        });

    }


    /* ======================================
       MONTH DATA
    ====================================== */

    const months = [

      {
        name:
          progress.month_1_name,

        value:
          Number(
            progress.month_1_value ||
            0
          )
      },

      {
        name:
          progress.month_2_name,

        value:
          Number(
            progress.month_2_value ||
            0
          )
      },

      {
        name:
          progress.month_3_name,

        value:
          Number(
            progress.month_3_value ||
            0
          )
      }

    ];


    const missedMonths =
      months
        .filter(
          function(month) {

            return (
              Number(
                month.value ||
                0
              ) < 1
            );

          }
        )
        .map(
          function(month) {

            return month.name;

          }
        )
        .filter(Boolean);


    /* ======================================
       RESPONSE
    ====================================== */

    return res
      .status(200)
      .json({

        success:true,

        user:{

          id:
            user.id || null,

          name:
            employeeName,

          email:
            user.email ||
            session.email,

          role:
            user.role ||
            session.role ||
            'User'

        },


        season:{

          id:
            season.id,

          code:
            season.season_code,

          name:
            season.season_name,

          tagline:
            season.tagline,

          active:
            season.is_active,

          rank:
            progress.rank ||
            'WARRIOR',

          totalApproved:
            Number(
              progress.total_approved ||
              0
            ),

          status:
            progress.season_status ||
            '',

          missedMonths:
            missedMonths,

          months:
            months,

          superior:
            progress.superior_name ||
            '',

          department:
            progress.department ||
            '',

          location:
            progress.work_location ||
            '',

          ssDone:
            Number(
              progress.ss_done ||
              0
            ),

          ssSubmit:
            Number(
              progress.ss_submit ||
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
            )

        }

      });


  } catch (error) {

    console.error(
      error
    );


    return res
      .status(500)
      .json({

        success:false,

        message:
          'Gagal mengambil data dashboard.'

      });

  }

}
