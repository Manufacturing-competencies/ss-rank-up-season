/* ==========================================================
   PLAYER PHOTO MAP
========================================================== */

export default async function handler(
  req,
  res
) {

  try {

    const url =
      String(
        process.env.SUPABASE_URL || ''
      )
        .trim()
        .replace(
          /\/+$/,
          ''
        );


    const key =
      String(
        process.env.SUPABASE_SERVICE_KEY || ''
      ).trim();


    const token =
      String(
        req.query.session || ''
      ).trim();


    if (
      !url ||
      !key
    ) {

      return res.status(500).json({
        success: false
      });

    }


    if (
      !await validSession(
        url,
        key,
        token
      )
    ) {

      return res.status(401).json({
        success: false
      });

    }


    const params =
      new URLSearchParams();


    params.set(
      'select',
      'name,photo_url'
    );


    params.set(
      'photo_url',
      'not.is.null'
    );


    const response =
      await fetch(

        url +
        '/rest/v1/app_users?' +
        params.toString(),

        {

          headers: {

            apikey:
              key,

            Authorization:
              'Bearer ' +
              key

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


    const photos =
      {};


    rows.forEach(
      row => {

        const name =
          String(
            row.name || ''
          )
            .trim()
            .toUpperCase();


        if (
          name &&
          row.photo_url
        ) {

          photos[name] =
            row.photo_url;

        }

      }
    );


    return res.status(200).json({

      success:
        true,

      photos

    });


  }

  catch(error) {

    console.error(
      'PLAYER PHOTO ERROR:',
      error
    );


    return res.status(500).json({
      success: false
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
