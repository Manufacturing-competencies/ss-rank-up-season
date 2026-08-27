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

      return res.status(400).json({
        success: false,
        message: 'Session token tidak tersedia.'
      });

    }


    const {
      supabaseUrl,
      serviceKey
    } = getConfig();


    const sessionResponse =
      await supabaseFetch(
        `${supabaseUrl}/rest/v1/login_sessions` +
        `?token=eq.${encodeURIComponent(token)}` +
        `&select=*`,
        serviceKey
      );


    if (!sessionResponse.ok) {

      return res.status(500).json({
        success: false,
        message: 'Gagal membaca session.'
      });

    }


    const sessions =
      await sessionResponse.json();


    if (
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


    const expiresAt =
      new Date(
        session.expires_at
      );


    if (
      Number.isNaN(
        expiresAt.getTime()
      ) ||
      expiresAt <= new Date()
    ) {

      return res.status(401).json({
        success: false,
        message: 'Session sudah berakhir.'
      });

    }


    const userResponse =
      await supabaseFetch(

        `${supabaseUrl}/rest/v1/app_users` +
        `?email=eq.${encodeURIComponent(session.email)}` +
        `&select=*`,

        serviceKey

      );


    if (!userResponse.ok) {

      return res.status(500).json({
        success: false,
        message: 'Gagal membaca data user.'
      });

    }


    const users =
      await userResponse.json();


    if (
      !Array.isArray(users) ||
      users.length === 0
    ) {

      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });

    }


    const user =
      users[0];


    if (
      user.is_active === false
    ) {

      return res.status(403).json({
        success: false,
        message: 'Akun tidak aktif.'
      });

    }


    await fetch(

      `${supabaseUrl}/rest/v1/login_sessions` +
      `?id=eq.${session.id}`,

      {

        method: 'PATCH',

        headers: {
          apikey: serviceKey,
          Authorization:
            `Bearer ${serviceKey}`,
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          used: true,
          last_accessed_at:
            new Date().toISOString()
        })

      }

    );


    return res.status(200).json({

      success: true,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nik: user.nik,
        role: user.role || 'User',
        area: user.area,
        department: user.department,
        plant: user.plant,
        superior_email:
          user.superior_email
      },

      session: {
        token: session.token,
        expires_at:
          session.expires_at
      }

    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Internal server error.'
    });

  }

}


function getConfig() {

  const supabaseUrl =
    process.env.SUPABASE_URL;

  const serviceKey =
    process.env.SUPABASE_SERVICE_KEY;


  if (
    !supabaseUrl ||
    !serviceKey
  ) {

    throw new Error(
      'Supabase environment variables belum tersedia.'
    );

  }


  return {
    supabaseUrl,
    serviceKey
  };

}


function supabaseFetch(
  url,
  serviceKey
) {

  return fetch(

    url,

    {

      headers: {
        apikey: serviceKey,
        Authorization:
          `Bearer ${serviceKey}`,
        'Content-Type':
          'application/json'
      }

    }

  );

}
