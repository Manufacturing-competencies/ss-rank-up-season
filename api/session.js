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


  const token =
    String(
      req.query.session || ''
    )
      .trim();


  if (
    !SUPABASE_URL ||
    !SERVICE_KEY
  ) {

    return res
      .status(500)
      .json({

        success:false,

        message:
          'Database configuration missing.'

      });

  }


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
      `Bearer ${SERVICE_KEY}`

  };


  try {

    const response =
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
      !response.ok
    ) {

      throw new Error(
        await response.text()
      );

    }


    const rows =
      await response.json();


    if (
      !rows.length
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
      rows[0];


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


    return res
      .status(200)
      .json({

        success:true,

        session:{

          email:
            session.email,

          name:
            session.user_name,

          role:
            session.role,

          expiresAt:
            session.expires_at

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
          'Failed to validate session.'

      });

  }

}
