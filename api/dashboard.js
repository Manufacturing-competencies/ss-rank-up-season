export default async function handler(req, res) {

  if (req.method !== 'GET') {

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  }


  try {

    const token =
      String(
        req.query.session || ''
      ).trim();


    if (!token) {

      return res.status(401).json({
        success: false,
        message: 'Unauthorized.'
      });

    }


    const supabaseUrl =
      process.env.SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_KEY;


    if (
      !supabaseUrl ||
      !serviceKey
    ) {

      throw new Error(
        'Supabase configuration unavailable.'
      );

    }


    const headers = {

      apikey:
        serviceKey,

      Authorization:
        `Bearer ${serviceKey}`,

      'Content-Type':
        'application/json'

    };


    /*
    ==========================================
    SESSION
    ==========================================
    */

    const sessionRes =
      await fetch(

        `${supabaseUrl}/rest/v1/login_sessions` +
        `?token=eq.${encodeURIComponent(token)}` +
        `&select=*`,

        { headers }

      );


    const sessions =
      await sessionRes.json();


    if (
      !sessionRes.ok ||
      !Array.isArray(sessions) ||
      sessions.length === 0
    ) {

      return res.status(401).json({
        success: false,
        message: 'Session tidak valid.'
      });

    }


    const session =
      sessions[0];


    if (
      new Date(session.expires_at)
      <=
      new Date()
    ) {

      return res.status(401).json({
        success: false,
        message: 'Session expired.'
      });

    }


    const email =
      session.email;


    /*
    ==========================================
    ACTIVE SEASON
    ==========================================
    */

    const seasonRes =
      await fetch(

        `${supabaseUrl}/rest/v1/seasons` +
        `?status=eq.ACTIVE` +
        `&is_active=eq.true` +
        `&select=*` +
        `&order=id.desc` +
        `&limit=1`,

        { headers }

      );


    const seasons =
      await seasonRes.json();


    const season =
      Array.isArray(seasons) &&
      seasons.length > 0

        ? seasons[0]

        : null;


    /*
    ==========================================
    POINT
    ==========================================
    */

    let totalPoints = 0;
    let rank = null;
    let leaderboardPosition = null;
    let leaderboard = [];
    let submissions = [];
    let announcements = [];


    if (season) {

      const pointsRes =
        await fetch(

          `${supabaseUrl}/rest/v1/v_user_points` +
          `?employee_email=eq.${encodeURIComponent(email)}` +
          `&season_id=eq.${season.id}` +
          `&select=*`,

          { headers }

        );


      if (pointsRes.ok) {

        const points =
          await pointsRes.json();

        if (
          Array.isArray(points) &&
          points.length
        ) {

          totalPoints =
            Number(
              points[0].total_points || 0
            );

        }

      }


      /*
      ==========================================
      RANK
      ==========================================
      */

      const rankRes =
        await fetch(

          `${supabaseUrl}/rest/v1/v_user_rank` +
          `?employee_email=eq.${encodeURIComponent(email)}` +
          `&season_id=eq.${season.id}` +
          `&select=*`,

          { headers }

        );


      if (rankRes.ok) {

        const ranks =
          await rankRes.json();

        if (
          Array.isArray(ranks) &&
          ranks.length
        ) {

          rank =
            ranks[0];

        }

      }


      /*
      ==========================================
      LEADERBOARD
      ==========================================
      */

      const leaderboardRes =
        await fetch(

          `${supabaseUrl}/rest/v1/v_leaderboard` +
          `?season_id=eq.${season.id}` +
          `&select=*` +
          `&order=leaderboard_position.asc` +
          `&limit=10`,

          { headers }

        );


      if (leaderboardRes.ok) {

        leaderboard =
          await leaderboardRes.json();

      }


      const myLeaderboardRes =
        await fetch(

          `${supabaseUrl}/rest/v1/v_leaderboard` +
          `?employee_email=eq.${encodeURIComponent(email)}` +
          `&season_id=eq.${season.id}` +
          `&select=*`,

          { headers }

        );


      if (myLeaderboardRes.ok) {

        const myLeaderboard =
          await myLeaderboardRes.json();

        if (
          Array.isArray(myLeaderboard) &&
          myLeaderboard.length
        ) {

          leaderboardPosition =
            Number(
              myLeaderboard[0]
                .leaderboard_position
            );

        }

      }


      /*
      ==========================================
      SS
      ==========================================
      */

      const ssRes =
        await fetch(

          `${supabaseUrl}/rest/v1/ss_submissions` +
          `?employee_email=eq.${encodeURIComponent(email)}` +
          `&season_id=eq.${season.id}` +
          `&select=*` +
          `&order=created_at.desc`,

          { headers }

        );


      if (ssRes.ok) {

        submissions =
          await ssRes.json();

      }


      /*
      ==========================================
      ANNOUNCEMENTS
      ==========================================
      */

      const announcementRes =
        await fetch(

          `${supabaseUrl}/rest/v1/announcements` +
          `?season_id=eq.${season.id}` +
          `&is_active=eq.true` +
          `&select=*` +
          `&order=created_at.desc` +
          `&limit=5`,

          { headers }

        );


      if (
        announcementRes.ok
      ) {

        announcements =
          await announcementRes.json();

      }

    }


    /*
    ==========================================
    COMPLETED IMPROVEMENT
    ==========================================
    */

    const completedStatuses =
      new Set([

        'APPROVED IMPLEMENTATION',

        'IMPLEMENTATION APPROVED',

        'IMPLEMENTATION_APPROVED',

        'APPROVED_IMPLEMENTATION',

        'DONE'

      ]);


    const completed =
      submissions.filter(

        item => {

          const status =
            String(
              item.final_status || ''
            )
              .trim()
              .toUpperCase();


          return completedStatuses.has(
            status
          );

        }

      ).length;


    /*
    ==========================================
    RETURN
    ==========================================
    */

    return res.status(200).json({

      success: true,

      season,

      stats: {

        totalPoints,

        currentRank:
          rank?.rank_name ||
          'WARRIOR',

        rankLevel:
          rank?.rank_level || 1,

        rankMin:
          Number(
            rank?.min_point || 0
          ),

        rankMax:
          rank?.max_point === null ||
          rank?.max_point === undefined

            ? null

            : Number(
                rank.max_point
              ),

        leaderboardPosition,

        completed,

        target:
          Number(
            season?.target_improvement ||
            3
          ),

        totalSS:
          submissions.length

      },

      submissions,

      leaderboard,

      announcements

    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Gagal memuat dashboard.'
    });

  }

}
