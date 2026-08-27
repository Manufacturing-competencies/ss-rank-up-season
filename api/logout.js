export default async function handler(req, res) {

  if (
    req.method !== 'POST'
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
      req.body?.session || ''
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
      .status(200)
      .json({
        success:true
      });

  }


  try {

    await fetch(

      SUPABASE_URL +

      '/rest/v1/login_sessions' +

      '?token=eq.' +

      encodeURIComponent(
        token
      ),

      {

        method:'DELETE',

        headers:{

          apikey:
            SERVICE_KEY,

          Authorization:
            `Bearer ${SERVICE_KEY}`

        }

      }

    );


    return res
      .status(200)
      .json({

        success:true

      });


  } catch (error) {

    console.error(
      error
    );


    return res
      .status(200)
      .json({

        success:true

      });

  }

}
