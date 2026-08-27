export default async function handler(req, res) {

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {

    const token = String(
      req.query.session || ''
    ).trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Session token tidak tersedia.'
      });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration belum lengkap.'
      });
    }

    const sessionUrl =
      `${supabaseUrl}/rest/v1/login_sessions` +
      `?token=eq.${encodeURIComponent(token)}` +
      `&select=id,token,email,user_name,role,expires_at,used,last_accessed_at`;

    const response =
      await fetch(sessionUrl, {
        method: 'GET',

        headers: {
          apikey: serviceKey,
          Authorization:
            `Bearer ${serviceKey}`,
          'Content-Type':
            'application/json'
        }
      });

    const sessions =
      await response.json();

    if (
      !response.ok ||
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
      new Date(session.expires_at);

    const now =
      new Date();

    if (expiresAt <= now) {
      return res.status(401).json({
        success: false,
        message: 'Session sudah expired.'
      });
    }

    const userUrl =
      `${supabaseUrl}/rest/v1/app_users` +
      `?email=eq.${encodeURIComponent(session.email)}` +
      `&select=id,name,email,nik,role,area,department,plant,superior_email,is_active`;

    const userResponse =
      await fetch(userUrl, {
        method: 'GET',

        headers: {
          apikey: serviceKey,
          Authorization:
            `Bearer ${serviceKey}`,
          'Content-Type':
            'application/json'
        }
      });

    const users =
      await userResponse.json();

    if (
      !userResponse.ok ||
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

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'User sudah tidak aktif.'
      });
    }

    await fetch(
      `${supabaseUrl}/rest/v1/login_sessions?id=eq.${session.id}`,
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
        role: user.role,
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
        'Terjadi kesalahan saat validasi session.'
    });

  }

}
