export default async function handler(req, res) {

  /* =====================================================
     METHOD
  ===================================================== */

  if (req.method !== 'GET') {

    return res
      .status(405)
      .json({
        success: false,
        message: 'Method not allowed'
      });

  }


  /* =====================================================
     ENV
  ===================================================== */

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
        success: false,
        message: 'Supabase environment belum lengkap.'
      });

  }


  /* =====================================================
     SESSION TOKEN
  ===================================================== */

  const token =
    String(
      req.query.session || ''
    ).trim();


  if (!token) {

    return res
      .status(401)
      .json({
        success: false,
        message: 'Session required.'
      });

  }


  /* =====================================================
     SUPABASE HELPER
  ===================================================== */

  async function sb(
    path,
    options = {}
  ) {

    const response =
      await fetch(
        SUPABASE_URL + path,
        {
          ...options,

          headers: {

            apikey:
              SERVICE_KEY,

            Authorization:
              `Bearer ${SERVICE_KEY}`,

            'Content-Type':
              'application/json',

            ...(options.headers || {})

          }

        }
      );


    const text =
      await response.text();


    let body = null;


    try {

      body =
        text
          ? JSON.parse(text)
          : null;

    } catch {

      body = text;

    }


    if (!response.ok) {

      throw new Error(
        typeof body === 'string'
          ? body
          : JSON.stringify(body)
      );

    }


    return body;

  }


  try {

    /* =====================================================
       1. VALIDATE SESSION
    ===================================================== */

    const sessions =
      await sb(

        '/rest/v1/login_sessions' +

        '?token=eq.' +
        encodeURIComponent(token) +

        '&select=*' +

        '&limit=1'

      );


    if (
      !Array.isArray(sessions) ||
      sessions.length === 0
    ) {

      return res
        .status(401)
        .json({
          success: false,
          message: 'Session tidak ditemukan.'
        });

    }


    const session =
      sessions[0];


    /* =====================================================
       CHECK EXPIRED
    ===================================================== */

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
          success: false,
          message: 'Session expired.'
        });

    }


    const email =
      String(
        session.email || ''
      )
        .trim()
        .toLowerCase();


    if (!email) {

      return res
        .status(401)
        .json({
          success: false,
          message: 'Email session tidak ditemukan.'
        });

    }


    /* =====================================================
       2. USER
    ===================================================== */

    const users =
      await sb(

        '/rest/v1/app_users' +

        '?email=eq.' +
        encodeURIComponent(email) +

        '&select=*' +

        '&limit=1'

      );


    if (
      !Array.isArray(users) ||
      users.length === 0
    ) {

      return res
        .status(404)
        .json({
          success: false,
          message: 'User tidak ditemukan.'
        });

    }


    const user =
      users[0];


    /* =====================================================
       3. SEASON
    ===================================================== */

    const seasons =
      await sb(

        '/rest/v1/seasons' +

        '?season_code=eq.SS-RANK-UP-2026' +

        '&select=*' +

        '&limit=1'

      );


    const season =
      Array.isArray(seasons) &&
      seasons.length
        ? seasons[0]
        : null;


    const seasonId =
      season
        ? season.id
        : null;


    /* =====================================================
       4. USER POINTS
    ===================================================== */

    let totalPoints = 0;


    try {

      const pointRows =
        await sb(

          '/rest/v1/v_user_points' +

          '?employee_email=eq.' +
          encodeURIComponent(email) +

          '&select=*' +

          '&limit=1'

        );


      if (
        Array.isArray(pointRows) &&
        pointRows.length
      ) {

        totalPoints =
          Number(
            pointRows[0].total_points ||
            pointRows[0].points ||
            0
          );

      }

    } catch (error) {

      console.error(
        'USER POINT ERROR:',
        error.message
      );

    }


    /* =====================================================
       5. USER RANK
    ===================================================== */

    let currentRank =
      'WARRIOR';

    let rankLevel =
      1;

    let rankMin =
      0;

    let rankMax =
      299;


    try {

      const rankRows =
        await sb(

          '/rest/v1/v_user_rank' +

          '?employee_email=eq.' +
          encodeURIComponent(email) +

          '&select=*' +

          '&limit=1'

        );


      if (
        Array.isArray(rankRows) &&
        rankRows.length
      ) {

        const r =
          rankRows[0];


        currentRank =
          r.rank_name ||
          r.rank ||
          r.current_rank ||
          'WARRIOR';


        rankLevel =
          Number(
            r.rank_level ||
            r.level ||
            1
          );


        rankMin =
          Number(
            r.min_points ||
            r.min_point ||
            0
          );


        rankMax =
          Number(
            r.max_points ||
            r.max_point ||
            299
          );

      }

    } catch (error) {

      console.error(
        'USER RANK ERROR:',
        error.message
      );

    }


    /* =====================================================
       6. LEADERBOARD
    ===================================================== */

    let leaderboard =
      [];


    let leaderboardPosition =
      null;


    try {

      leaderboard =
        await sb(

          '/rest/v1/v_leaderboard' +

          '?select=*' +

          '&order=total_points.desc' +

          '&limit=10'

        );


      if (
        !Array.isArray(
          leaderboard
        )
      ) {

        leaderboard = [];

      }


      /* =================================================
         POSITION USER

         Ambil leaderboard full
         untuk mencari posisi user.
      ================================================= */

      const fullLeaderboard =
        await sb(

          '/rest/v1/v_leaderboard' +

          '?select=*' +

          '&order=total_points.desc'

        );


      if (
        Array.isArray(
          fullLeaderboard
        )
      ) {

        const index =
          fullLeaderboard.findIndex(

            item =>

              String(
                item.employee_email ||
                item.email ||
                ''
              )
                .trim()
                .toLowerCase() ===
              email

          );


        if (
          index !== -1
        ) {

          leaderboardPosition =
            index + 1;

        }

      }

    } catch (error) {

      console.error(
        'LEADERBOARD ERROR:',
        error.message
      );

    }


    /* =====================================================
       7. SS SUBMISSIONS USER
    ===================================================== */

    let submissions =
      [];


    try {

      let endpoint =

        '/rest/v1/ss_submissions' +

        '?employee_email=eq.' +
        encodeURIComponent(email);


      if (seasonId) {

        endpoint +=

          '&season_id=eq.' +
          encodeURIComponent(
            seasonId
          );

      }


      endpoint +=

        '&select=' +

        [
          'id',
          'ss_number',
          'employee_name',
          'title',
          'before_condition',
          'idea',
          'benefit',
          'status_superior',
          'implementation_status',
          'final_status',
          'submitted_at',
          'updated_at'
        ].join(',') +

        '&order=submitted_at.desc';


      submissions =
        await sb(
          endpoint
        );


      if (
        !Array.isArray(
          submissions
        )
      ) {

        submissions = [];

      }

    } catch (error) {

      console.error(
        'SUBMISSION ERROR:',
        error.message
      );

    }


    /* =====================================================
       8. SS STATISTICS
    ===================================================== */

    const totalSS =
      submissions.length;


    const completedSS =
      submissions.filter(

        item => {

          const status =
            String(
              item.final_status || ''
            )
              .trim()
              .toUpperCase();


          return (

            status === 'COMPLETED' ||

            status ===
              'IMPLEMENTATION_APPROVED'

          );

        }

      );


    /*
       TARGET PROGRAM
       3 MONTHS = 3 IMPROVEMENTS
    */

    const completed =
      Math.min(
        completedSS.length,
        3
      );


    const target =
      3;


    /* =====================================================
       9. MATCH JOURNEY
    ===================================================== */

    const journey = [

      {
        match: 1,
        name: 'MATCH 1',
        status:
          completed >= 1
            ? 'COMPLETED'
            : 'ACTIVE'
      },

      {
        match: 2,
        name: 'MATCH 2',
        status:
          completed >= 2
            ? 'COMPLETED'
            :
            completed === 1
              ? 'ACTIVE'
              : 'LOCKED'
      },

      {
        match: 3,
        name: 'MATCH 3',
        status:
          completed >= 3
            ? 'COMPLETED'
            :
            completed === 2
              ? 'ACTIVE'
              : 'LOCKED'
      }

    ];


    /* =====================================================
       10. RECENT SS
    ===================================================== */

    const recentSS =
      submissions
        .slice(
          0,
          5
        )
        .map(

          item => ({

            id:
              item.id,

            ssNumber:
              item.ss_number,

            title:
              item.title ||
              'Untitled Improvement',

            statusSuperior:
              item.status_superior,

            implementationStatus:
              item.implementation_status,

            finalStatus:
              item.final_status,

            submittedAt:
              item.submitted_at,

            updatedAt:
              item.updated_at

          })

        );


    /* =====================================================
       11. ANNOUNCEMENTS
    ===================================================== */

    let announcements =
      [];


    try {

      announcements =
        await sb(

          '/rest/v1/announcements' +

          '?select=*' +

          '&order=created_at.desc' +

          '&limit=5'

        );


      if (
        !Array.isArray(
          announcements
        )
      ) {

        announcements = [];

      }

    } catch (error) {

      console.error(
        'ANNOUNCEMENT ERROR:',
        error.message
      );

    }


    /* =====================================================
       12. RANK PROGRESS
    ===================================================== */

    let rankProgress =
      0;


    if (
      rankMax > rankMin
    ) {

      rankProgress =

        (
          (
            totalPoints -
            rankMin
          )
          /
          (
            rankMax -
            rankMin
          )
        )
        *
        100;

    }


    rankProgress =
      Math.max(
        0,
        Math.min(
          100,
          rankProgress
        )
      );


    /* =====================================================
       RESPONSE
    ===================================================== */

    return res
      .status(200)
      .json({

        success: true,


        user: {

          id:
            user.id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          area:
            user.area || null,

          department:
            user.department || null,

          plant:
            user.plant || null,

          superiorEmail:
            user.superior_email || null

        },


        season: {

          id:
            season
              ? season.id
              : null,

          code:
            season
              ? season.season_code
              : 'SS-RANK-UP-2026',

          name:
            season
              ? season.season_name
              : 'SS Rank Up Season 2026',

          tagline:
            season
              ? season.tagline
              : '3 Months • 3 Matches • 3 Improvements'

        },


        stats: {

          totalPoints:
            totalPoints,

          currentRank:
            currentRank,

          rankLevel:
            rankLevel,

          rankMin:
            rankMin,

          rankMax:
            rankMax,

          rankProgress:
            Math.round(
              rankProgress
            ),

          leaderboardPosition:
            leaderboardPosition,

          totalSS:
            totalSS,

          completed:
            completed,

          target:
            target

        },


        journey:
          journey,


        submissions:
          recentSS,


        leaderboard:
          leaderboard,


        announcements:
          announcements

      });


  } catch (error) {

    console.error(
      'DASHBOARD API ERROR:',
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        message:
          'Gagal mengambil data dashboard.',

        error:
          error.message

      });

  }

}
