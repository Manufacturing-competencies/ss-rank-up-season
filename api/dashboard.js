/* ==========================================================
   SS RANK UP SEASON
   API/DASHBOARD.JS — FINAL

   FLOW:
   session token
   ↓
   login_sessions
   ↓
   app_users
   ↓
   seasons
   ↓
   season_user_progress
   ↓
   frontend dashboard
========================================================== */

export default async function handler(req, res) {

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


    const loginUrl =

      process.env.LOGIN_URL ||

      process.env.APPS_SCRIPT_URL ||

      process.env.GAS_LOGIN_URL ||

      '';


    const seasonCode =

      process.env.SEASON_CODE ||

      'SS-RANK-UP-2026';


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
            'Supabase environment belum tersedia.',

          loginUrl:
            loginUrl

        });

    }


    /* ======================================================
       SESSION TOKEN
    ====================================================== */

    const sessionToken =
      String(
        req.query.session || ''
      )
        .trim();


    /*
      Dipanggil tanpa session:
      frontend hanya ingin tahu URL login.
    */

    if (!sessionToken) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            'Login required.',

          loginUrl:
            loginUrl

        });

    }


    /* ======================================================
       HEADERS
    ====================================================== */

    const headers = {

      apikey:
        serviceKey,

      Authorization:
        'Bearer ' +
        serviceKey,

      'Content-Type':
        'application/json',

      Accept:
        'application/json'

    };


    /* ======================================================
       1. READ LOGIN SESSION
    ====================================================== */

    const sessionParams =
      new URLSearchParams();


    sessionParams.set(
      'token',
      'eq.' + sessionToken
    );


    sessionParams.set(
      'select',
      [
        'token',
        'email',
        'user_name',
        'role',
        'expires_at',
        'used',
        'last_accessed_at'
      ].join(',')
    );


    sessionParams.set(
      'limit',
      '1'
    );


    const sessionResponse =
      await fetch(

        supabaseUrl +

        '/rest/v1/login_sessions?' +

        sessionParams.toString(),

        {

          method:
            'GET',

          headers,

          cache:
            'no-store'

        }

      );


    const sessionText =
      await sessionResponse.text();


    if (!sessionResponse.ok) {

      console.error(
        'SESSION QUERY ERROR:',
        sessionText
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            'Session gagal dibaca.',

          loginUrl:
            loginUrl

        });

    }


    let sessionRows = [];


    try {

      sessionRows =
        sessionText

          ? JSON.parse(
              sessionText
            )

          : [];

    }

    catch {

      sessionRows = [];

    }


    if (!sessionRows.length) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            'Session tidak ditemukan.',

          loginUrl:
            loginUrl

        });

    }


    const session =
      sessionRows[0];


    /* ======================================================
       CHECK SESSION EXPIRED
    ====================================================== */

    if (session.expires_at) {

      const expiresAt =
        new Date(
          session.expires_at
        );


      if (
        !Number.isNaN(
          expiresAt.getTime()
        ) &&
        expiresAt.getTime() <
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
              loginUrl

          });

      }

    }


    /* ======================================================
       BASIC USER FROM SESSION

       PENTING:
       Apps Script menyimpan:
       user_name
       email
       role
    ====================================================== */

    let user = {

      name:
        session.user_name || '',

      user_name:
        session.user_name || '',

      email:
        session.email || '',

      role:
        session.role || 'User',

      department:
        '',

      location:
        ''

    };


    /* ======================================================
       2. APP USERS

       Dipakai sebagai fallback nama / role.
    ====================================================== */

    if (session.email) {

      try {

        const userParams =
          new URLSearchParams();


        userParams.set(
          'email',
          'eq.' + session.email
        );


        userParams.set(
          'select',
          '*'
        );


        userParams.set(
          'limit',
          '1'
        );


        const userResponse =
          await fetch(

            supabaseUrl +

            '/rest/v1/app_users?' +

            userParams.toString(),

            {

              method:
                'GET',

              headers,

              cache:
                'no-store'

            }

          );


        if (userResponse.ok) {

          const userRows =
            await userResponse.json();


          if (
            Array.isArray(userRows) &&
            userRows.length
          ) {

            const dbUser =
              userRows[0];


            user = {

              ...dbUser,

              name:

                dbUser.name ||

                dbUser.user_name ||

                session.user_name ||

                '',


              user_name:

                dbUser.user_name ||

                dbUser.name ||

                session.user_name ||

                '',


              email:

                dbUser.email ||

                session.email ||

                '',


              role:

                dbUser.role ||

                session.role ||

                'User',


              department:

                dbUser.department ||

                dbUser.departemen ||

                '',


              location:

                dbUser.location ||

                dbUser.work_location ||

                ''

            };

          }

        }

      }

      catch(error) {

        console.error(
          'APP USER ERROR:',
          error
        );

      }

    }


    /* ======================================================
       NAME FINAL

       Harusnya di sini:
       DENI SAPUTRA
    ====================================================== */

    const employeeName =
      String(

        user.name ||

        user.user_name ||

        session.user_name ||

        ''

      )
        .trim();


    if (!employeeName) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            'Nama user pada session tidak ditemukan.',

          loginUrl:
            loginUrl

        });

    }


    /*
      Paksa field name tersedia untuk app.js.
    */

    user.name =
      employeeName;

    user.user_name =
      employeeName;


    /* ======================================================
       3. ACTIVE SEASON
    ====================================================== */

    let season =
      null;


    try {

      const seasonParams =
        new URLSearchParams();


      seasonParams.set(
        'season_code',
        'eq.' + seasonCode
      );


      seasonParams.set(
        'select',
        '*'
      );


      seasonParams.set(
        'limit',
        '1'
      );


      const seasonResponse =
        await fetch(

          supabaseUrl +

          '/rest/v1/seasons?' +

          seasonParams.toString(),

          {

            method:
              'GET',

            headers,

            cache:
              'no-store'

          }

        );


      if (seasonResponse.ok) {

        const seasonRows =
          await seasonResponse.json();


        if (
          Array.isArray(
            seasonRows
          ) &&
          seasonRows.length
        ) {

          season =
            seasonRows[0];

        }

      }

    }

    catch(error) {

      console.error(
        'SEASON ERROR:',
        error
      );

    }


    /* ======================================================
       4. USER PROGRESS
    ====================================================== */

    let progressRow =
      null;


    try {

      const progressParams =
        new URLSearchParams();


      /*
        Nama case-insensitive.
      */

      progressParams.set(

        'employee_name',

        'ilike.' +
        employeeName

      );


      if (
        season &&
        season.id !== undefined &&
        season.id !== null
      ) {

        progressParams.set(

          'season_id',

          'eq.' +
          season.id

        );

      }


      progressParams.set(
        'select',
        '*'
      );


      progressParams.set(
        'limit',
        '1'
      );


      const progressResponse =
        await fetch(

          supabaseUrl +

          '/rest/v1/season_user_progress?' +

          progressParams.toString(),

          {

            method:
              'GET',

            headers,

            cache:
              'no-store'

          }

        );


      const progressText =
        await progressResponse.text();


      if (progressResponse.ok) {

        try {

          const rows =
            progressText

              ? JSON.parse(
                  progressText
                )

              : [];


          if (
            Array.isArray(rows) &&
            rows.length
          ) {

            progressRow =
              rows[0];

          }

        }

        catch(error) {

          console.error(
            'PROGRESS PARSE ERROR:',
            error
          );

        }

      }

      else {

        console.error(
          'PROGRESS QUERY ERROR:',
          progressText
        );

      }

    }

    catch(error) {

      console.error(
        'PROGRESS ERROR:',
        error
      );

    }


    /* ======================================================
       5. NORMALIZE PROGRESS
    ====================================================== */

    const progress =
      normalizeProgress(
        progressRow,
        employeeName,
        user
      );


    /*
      Department & location bisa berasal dari progress.
    */

    if (
      !user.department &&
      progress.department
    ) {

      user.department =
        progress.department;

    }


    if (
      !user.location &&
      progress.location
    ) {

      user.location =
        progress.location;

    }


    /* ======================================================
       6. TOUCH SESSION

       Tidak wajib untuk login.
       Hanya update last_accessed_at.
    ====================================================== */

    try {

      const touchParams =
        new URLSearchParams();


      touchParams.set(
        'token',
        'eq.' + sessionToken
      );


      await fetch(

        supabaseUrl +

        '/rest/v1/login_sessions?' +

        touchParams.toString(),

        {

          method:
            'PATCH',

          headers: {

            ...headers,

            Prefer:
              'return=minimal'

          },

          body:
            JSON.stringify({

              last_accessed_at:
                new Date()
                  .toISOString()

            })

        }

      );

    }

    catch(error) {

      /*
        Tidak menggagalkan dashboard.
      */

      console.error(
        'SESSION TOUCH ERROR:',
        error
      );

    }


    /* ======================================================
       FINAL RESPONSE
    ====================================================== */

    return res
      .status(200)
      .json({

        success:
          true,


        user: {

          name:
            employeeName,

          user_name:
            employeeName,

          email:
            user.email || '',

          role:
            user.role || 'User',

          department:
            user.department ||
            progress.department ||
            '',

          location:
            user.location ||
            progress.location ||
            ''

        },


        session: {

          user_name:
            employeeName,

          email:
            session.email || '',

          role:
            session.role || 'User',

          expires_at:
            session.expires_at || null

        },


        season: {

          id:
            season
              ? season.id
              : null,

          code:

            season &&
            (
              season.season_code ||
              season.code
            )

              ? (
                  season.season_code ||
                  season.code
                )

              : seasonCode,

          active:

            season &&
            typeof season.is_active ===
            'boolean'

              ? season.is_active

              : true

        },


        progress:
          progress,


        loginUrl:
          loginUrl

      });


  }

  catch(error) {

    console.error(
      'DASHBOARD API ERROR:',
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          'Internal dashboard error.',

        loginUrl:

          process.env.LOGIN_URL ||

          process.env.APPS_SCRIPT_URL ||

          process.env.GAS_LOGIN_URL ||

          ''

      });

  }

}


/* ==========================================================
   NORMALIZE PROGRESS
========================================================== */

function normalizeProgress(
  row,
  employeeName,
  user
) {

  const data =
    row || {};


  const month1Name =
    data.month_1_name || '';

  const month2Name =
    data.month_2_name || '';

  const month3Name =
    data.month_3_name || '';


  const month1Value =
    Number(
      data.month_1_value || 0
    );

  const month2Value =
    Number(
      data.month_2_value || 0
    );

  const month3Value =
    Number(
      data.month_3_value || 0
    );


  const totalApproved =
    Number(

      data.total_approved !==
      undefined

        ? data.total_approved

        : (
            month1Value +
            month2Value +
            month3Value
          )

    ) || 0;


  const missedMonths = [];


  if (
    month1Name &&
    month1Value < 1
  ) {

    missedMonths.push(
      month1Name
    );

  }


  if (
    month2Name &&
    month2Value < 1
  ) {

    missedMonths.push(
      month2Name
    );

  }


  if (
    month3Name &&
    month3Value < 1
  ) {

    missedMonths.push(
      month3Name
    );

  }


  const status =
    String(

      data.season_status ||

      data.status ||

      (
        month1Value >= 1 &&
        month2Value >= 1 &&
        month3Value >= 1

          ? 'WINNER'

          : 'FAILED'
      )

    )
      .trim()
      .toUpperCase();


  const rank =
    String(

      data.rank ||

      calculateRank(
        totalApproved
      )

    )
      .trim()
      .toUpperCase();


  return {

    /* USER */

    employee_name:

      data.employee_name ||

      employeeName,


    department:

      data.department ||

      user.department ||

      '',


    location:

      data.work_location ||

      data.location ||

      user.location ||

      '',


    work_location:

      data.work_location ||

      data.location ||

      user.location ||

      '',


    superior:

      data.superior_name ||

      data.superior ||

      '',


    superior_name:

      data.superior_name ||

      data.superior ||

      '',


    /* POINT */

    ssDone:

      Number(
        data.ss_done || 0
      ),


    ss_done:

      Number(
        data.ss_done || 0
      ),


    point:

      Number(
        data.point || 0
      ),


    pointApproved:

      Number(
        data.point_approved || 0
      ),


    point_approved:

      Number(
        data.point_approved || 0
      ),


    ssSubmit:

      Number(
        data.ss_submit || 0
      ),


    ss_submit:

      Number(
        data.ss_submit || 0
      ),


    /* MONTHS */

    month_1_name:
      month1Name,

    month_1_value:
      month1Value,

    month_2_name:
      month2Name,

    month_2_value:
      month2Value,

    month_3_name:
      month3Name,

    month_3_value:
      month3Value,


    /* FINAL */

    totalApproved:
      totalApproved,

    total_approved:
      totalApproved,

    status:
      status,

    season_status:
      status,

    rank:
      rank,

    missedMonths:
      missedMonths,

    missed_months:
      missedMonths

  };

}


/* ==========================================================
   RANK
========================================================== */

function calculateRank(total) {

  const value =
    Number(total || 0);


  if (value >= 10) {

    return 'MYTHIC GLORY';

  }


  if (value >= 7) {

    return 'MYTHIC HONOR';

  }


  if (value >= 4) {

    return 'MYTHIC';

  }


  if (value === 3) {

    return 'LEGEND';

  }


  if (value === 2) {

    return 'EPIC';

  }


  if (value === 1) {

    return 'ELITE';

  }


  return 'WARRIOR';

}
