/* ==========================================================
   REWARD EXPORT
========================================================== */

export default async function handler(
  req,
  res
) {

  try {

    const supabaseUrl =
      String(
        process.env.SUPABASE_URL || ''
      )
        .trim()
        .replace(
          /\/+$/,
          ''
        );


    const serviceKey =
      String(
        process.env.SUPABASE_SERVICE_KEY || ''
      ).trim();


    if (
      !supabaseUrl ||
      !serviceKey
    ) {

      return res.status(500).json({
        success: false
      });

    }


    const sessionToken =
      String(
        req.query.session || ''
      ).trim();


    if (
      !await validSession(
        supabaseUrl,
        serviceKey,
        sessionToken
      )
    ) {

      return res.status(401).json({
        success: false,
        message: 'Login required.'
      });

    }


    const params =
      new URLSearchParams();


    params.set(
      'select',
      [
        'employee_name',
        'nip',
        'department',
        'category',
        'description',
        'participant_type',
        'source_row'
      ].join(',')
    );


    params.set(
      'order',
      'source_row.asc'
    );


    const response =
      await fetch(

        supabaseUrl +
        '/rest/v1/season_rewards?' +
        params.toString(),

        {

          headers: {

            apikey:
              serviceKey,

            Authorization:
              'Bearer ' +
              serviceKey

          },

          cache:
            'no-store'

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


    const csvRows =
      [[

        'NAMA',

        'NIP',

        'DEPT',

        'KATEGORI',

        'DESKRIPSI',

        'PESERTA'

      ]];


    rows.forEach(
      row => {

        csvRows.push([

          row.employee_name || '',

          row.nip || '',

          row.department || '',

          row.category || '',

          row.description || '',

          row.participant_type || ''

        ]);

      }
    );


    const csv =
      csvRows
        .map(
          row =>
            row
              .map(
                csvEscape
              )
              .join(',')
        )
        .join('\n');


    const date =
      new Date()
        .toISOString()
        .slice(
          0,
          10
        );


    res.setHeader(
      'Content-Type',
      'text/csv; charset=utf-8'
    );


    res.setHeader(
      'Content-Disposition',
      `attachment; filename="SS_Rank_Up_Reward_${date}.csv"`
    );


    return res
      .status(200)
      .send(
        '\uFEFF' +
        csv
      );


  }

  catch(error) {

    console.error(
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        'Export Reward gagal.'

    });

  }

}


async function validSession(
  url,
  key,
  token
) {

  if (
    !token
  ) {

    return false;

  }


  const params =
    new URLSearchParams();


  params.set(
    'select',
    'expires_at'
  );


  params.set(
    'token',
    'eq.' + token
  );


  params.set(
    'limit',
    '1'
  );


  const response =
    await fetch(

      url +
      '/rest/v1/login_sessions?' +
      params.toString(),

      {

        headers: {

          apikey:
            key,

          Authorization:
            'Bearer ' +
            key

        }

      }

    );


  if (
    !response.ok
  ) {

    return false;

  }


  const rows =
    await response.json();


  if (
    !rows[0]
  ) {

    return false;

  }


  return (
    !rows[0].expires_at ||
    new Date(
      rows[0].expires_at
    ).getTime() >
    Date.now()
  );

}


function csvEscape(
  value
) {

  return (
    '"' +
    String(
      value ?? ''
    )
      .replace(
        /"/g,
        '""'
      ) +
    '"'
  );

}
