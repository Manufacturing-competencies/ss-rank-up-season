export default async function handler(req, res) {

  if (req.method !== 'POST') {

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  }


  try {

    const token =
      String(
        req.body?.token || ''
      ).trim();


    if (!token) {

      return res.status(400).json({
        success: false,
        message: 'Token tidak tersedia.'
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

      return res.status(500).json({
        success: false,
        message: 'Server belum dikonfigurasi.'
      });

    }


    const response =
      await fetch(

        `${supabaseUrl}/rest/v1/login_sessions` +
        `?token=eq.${encodeURIComponent(token)}`,

        {

          method: 'DELETE',

          headers: {
            apikey: serviceKey,
            Authorization:
              `Bearer ${serviceKey}`
          }

        }

      );


    if (!response.ok) {

      return res.status(500).json({
        success: false,
        message: 'Logout gagal.'
      });

    }


    return res.status(200).json({
      success: true
    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });

  }

}
