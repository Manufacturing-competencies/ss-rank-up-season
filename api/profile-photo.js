/* ==========================================================
   PROFILE PHOTO UPLOAD
========================================================== */

export const config = {

  api: {

    bodyParser: {

      sizeLimit:
        '3mb'

    }

  }

};


export default async function handler(
  req,
  res
) {

  if (
    req.method !== 'POST'
  ) {

    return res.status(405).json({

      success:
        false,

      message:
        'Method not allowed.'

    });

  }


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


    if (
      !url ||
      !key
    ) {

      return res.status(500).json({
        success: false
      });

    }


    const token =
      String(
        req.body?.session || ''
      ).trim();


    const imageData =
      String(
        req.body?.imageData || ''
      )
        .replace(
          /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
          ''
        )
        .trim();


    if (
      !token ||
      !imageData
    ) {

      return res.status(400).json({

        success:
          false,

        message:
          'Foto belum tersedia.'

      });

    }


    if (
      imageData.length >
      2500000
    ) {

      return res.status(413).json({

        success:
          false,

        message:
          'Ukuran foto terlalu besar.'

      });

    }


    const session =
      await getSession(
        url,
        key,
        token
      );


    if (
      !session
    ) {

      return res.status(401).json({

        success:
          false,

        message:
          'Session berakhir.'

      });

    }


    const email =
      String(
        session.email || ''
      )
        .trim()
        .toLowerCase();


    const name =
      String(
        session.user_name || ''
      ).trim();


    const fileName =

      email
        .replace(
          /[^a-z0-9._-]/g,
          '_'
        ) +

      '.jpg';


    const buffer =
      Buffer.from(
        imageData,
        'base64'
      );


    if (
      buffer.length >
      2000000
    ) {

      return res.status(413).json({

        success:
          false,

        message:
          'Foto maksimal sekitar 2 MB setelah kompresi.'

      });

    }


    /* ======================================================
       STORAGE UPLOAD
    ====================================================== */

    const storageResponse =
      await fetch(

        url +
        '/storage/v1/object/profile-images/' +
        encodeURIComponent(
          fileName
        ),

        {

          method:
            'POST',

          headers: {

            apikey:
              key,

            Authorization:
              'Bearer ' +
              key,

            'Content-Type':
              'image/jpeg',

            'x-upsert':
              'true'

          },

          body:
            buffer

        }

      );


    if (
      !storageResponse.ok
    ) {

      throw new Error(
        await storageResponse.text()
      );

    }


    const photoUrl =

      url +

      '/storage/v1/object/public/profile-images/' +

      encodeURIComponent(
        fileName
      );


    /* ======================================================
       CHECK APP USER
    ====================================================== */

    const checkParams =
      new URLSearchParams();


    checkParams.set(
      'select',
      'email'
    );


    checkParams.set(
      'email',
      'eq.' + email
    );


    checkParams.set(
      'limit',
      '1'
    );


    const checkResponse =
      await fetch(

        url +
        '/rest/v1/app_users?' +
        checkParams.toString(),

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


    const existing =
      checkResponse.ok

        ? await checkResponse.json()

        : [];


    /* ======================================================
       UPDATE / INSERT USER
    ====================================================== */

    if (
      existing.length
    ) {

      const patchParams =
        new URLSearchParams();


      patchParams.set(
        'email',
        'eq.' + email
      );


      const patch =
        await fetch(

          url +
          '/rest/v1/app_users?' +
          patchParams.toString(),

          {

            method:
              'PATCH',

            headers: {

              apikey:
                key,

              Authorization:
                'Bearer ' +
                key,

              'Content-Type':
                'application/json',

              Prefer:
                'return=minimal'

            },

            body:
              JSON.stringify({

                photo_url:
                  photoUrl,

                updated_at:
                  new Date()
                    .toISOString()

              })

          }

        );


      if (
        !patch.ok
      ) {

        throw new Error(
          await patch.text()
        );

      }

    }

    else {

      const insert =
        await fetch(

          url +
          '/rest/v1/app_users',

          {

            method:
              'POST',

            headers: {

              apikey:
                key,

              Authorization:
                'Bearer ' +
                key,

              'Content-Type':
                'application/json',

              Prefer:
                'return=minimal'

            },

            body:
              JSON.stringify({

                name,

                email,

                role:

                  session.role ||
                  'User',

                photo_url:
                  photoUrl,

                updated_at:
                  new Date()
                    .toISOString()

              })

          }

        );


      if (
        !insert.ok
      ) {

        throw new Error(
          await insert.text()
        );

      }

    }


    return res.status(200).json({

      success:
        true,

      photo_url:
        photoUrl

    });


  }

  catch(error) {

    console.error(
      'PROFILE PHOTO ERROR:',
      error
    );


    return res.status(500).json({

      success:
        false,

      message:
        'Upload foto gagal.'

    });

  }

}


async function getSession(
  url,
  key,
  token
) {

  const params =
    new URLSearchParams();


  params.set(
    'select',
    'email,user_name,role,expires_at'
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

    return null;

  }


  const rows =
    await response.json();


  const session =
    rows[0];


  if (
    !session
  ) {

    return null;

  }


  if (
    session.expires_at &&
    new Date(
      session.expires_at
    ).getTime() <
    Date.now()
  ) {

    return null;

  }


  return session;

}
