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
        message:
          'Session token tidak tersedia.'
      });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({
        success: false,
        message:
          'Server configuration belum lengkap.'
      });
    }

    const response =
      await fetch(
        `${supabaseUrl}/rest/v1/login_sessions?token=eq.${encodeURIComponent(token)}`,
        {
          method: 'DELETE',

          headers: {
            apikey: serviceKey,
            Authorization:
              `Bearer ${serviceKey}`,
            'Content-Type':
              'application/json'
          }
        }
      );

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message:
          'Gagal menghapus session.'
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Logout berhasil.'
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Terjadi kesalahan saat logout.'
    });

  }

}
