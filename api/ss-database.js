/* ==========================================================
   SS RANK UP SEASON
   API: /api/ss-database

   FEATURES
   - pagination
   - search nama / SS ID
   - filter
   - ringan untuk dataset besar
========================================================== */

export default async function handler(
  req,
  res
) {

  try {

    const supabaseUrl =
      process.env.SUPABASE_URL;


    const serviceKey =
      process.env.SUPABASE_SERVICE_KEY;


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
            'Supabase environment belum tersedia.'

        });

    }


    /* ======================================================
       QUERY PARAMS
    ====================================================== */

    const {

      page = '1',

      limit = '50',

      search = '',

      department = '',

      superior = '',

      location = '',

      type = '',

      month = '',

      superiorStatus = '',

      implementationStatus = '',

      qualification = ''

    } = req.query;


    const currentPage =
      Math.max(
        1,
        parseInt(
          page,
          10
        ) || 1
      );


    /*
      Maximum 100 agar tidak berat.
    */

    const pageSize =
      Math.min(

        100,

        Math.max(
          1,
          parseInt(
            limit,
            10
          ) || 50
        )

      );


    const from =
      (
        currentPage - 1
      ) *
      pageSize;


    const to =
      from +
      pageSize -
      1;


    /* ======================================================
       BUILD SUPABASE URL
    ====================================================== */

    const params =
      new URLSearchParams();


    params.set(
      'select',
      [
        'id',
        'row_no',
        'ss_id',
        'status_admin',
        'status_superior',
        'status_implementasi',
        'employee_name',
        'department',
        'ss_type',
        'superior_name',
        'created_time',
        'work_location',
        'month_no',
        'validation_month',
        'implementation_date',
        'qualification',
        'point',
        'point_approval',
        'source_row',
        'synced_at'
      ].join(',')
    );


    /*
      Sort terbaru dulu.
    */

    params.set(
      'order',
      'created_time.desc.nullslast'
    );


    /* ======================================================
       SEARCH
       Nama atau SS ID
    ====================================================== */

    const cleanSearch =
      String(
        search || ''
      )
        .trim();


    if (
      cleanSearch
    ) {

      /*
        ilike = case insensitive.

        Search satu box bisa:
        DENI
        Deni
        deni
        156678
      */

      params.set(

        'or',

        [
          'employee_name.ilike.*' +
          escapeFilterValue(
            cleanSearch
          ) +
          '*',

          'ss_id.ilike.*' +
          escapeFilterValue(
            cleanSearch
          ) +
          '*'
        ].join(',')

      );

    }


    /* ======================================================
       FILTERS
    ====================================================== */

    addExactFilter(
      params,
      'department',
      department
    );


    addExactFilter(
      params,
      'superior_name',
      superior
    );


    addExactFilter(
      params,
      'work_location',
      location
    );


    addExactFilter(
      params,
      'ss_type',
      type
    );


    addExactFilter(
      params,
      'status_superior',
      superiorStatus
    );


    addExactFilter(
      params,
      'status_implementasi',
      implementationStatus
    );


    addExactFilter(
      params,
      'qualification',
      qualification
    );


    if (
      String(
        month || ''
      ).trim()
    ) {

      params.set(
        'month_no',
        'eq.' +
        encodeURIComponent(
          String(month)
        )
      );

    }


    /* ======================================================
       FETCH
    ====================================================== */

    const url =

      supabaseUrl.replace(
        /\/+$/,
        ''
      ) +

      '/rest/v1/ss_rank_up_database?' +

      params.toString();


    const response =
      await fetch(

        url,

        {

          method:
            'GET',

          headers: {

            apikey:
              serviceKey,

            Authorization:
              'Bearer ' +
              serviceKey,

            Prefer:
              'count=exact',

            Range:
              from +
              '-' +
              to

          },

          cache:
            'no-store'

        }

      );


    const text =
      await response.text();


    if (
      !response.ok
    ) {

      console.error(
        'SUPABASE DATABASE ERROR',
        response.status,
        text
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            'Gagal mengambil database.'

        });

    }


    const data =
      text
        ? JSON.parse(
            text
          )
        : [];


    /* ======================================================
       TOTAL COUNT
    ====================================================== */

    const contentRange =
      response.headers.get(
        'content-range'
      );


    let total =
      0;


    if (
      contentRange &&
      contentRange.includes('/')
    ) {

      const parts =
        contentRange.split('/');


      const totalText =
        parts[
          parts.length - 1
        ];


      total =
        totalText === '*'

          ? 0

          : Number(
              totalText
            ) || 0;

    }


    const totalPages =
      total

        ? Math.ceil(
            total /
            pageSize
          )

        : 0;


    return res
      .status(200)
      .json({

        success:
          true,

        data:
          data,

        pagination: {

          page:
            currentPage,

          limit:
            pageSize,

          total:
            total,

          totalPages:
            totalPages,

          from:
            total
              ? from + 1
              : 0,

          to:
            total
              ? Math.min(
                  to + 1,
                  total
                )
              : 0

        }

      });


  }

  catch(error) {

    console.error(
      'SS DATABASE API ERROR',
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          'Internal server error.'

      });

  }

}


/* ==========================================================
   EXACT FILTER
========================================================== */

function addExactFilter(
  params,
  column,
  value
) {

  const clean =
    String(
      value || ''
    )
      .trim();


  if (!clean) {

    return;

  }


  params.set(

    column,

    'eq.' +
    encodeURIComponent(
      clean
    )

  );

}


/* ==========================================================
   SAFE FILTER VALUE
========================================================== */

function escapeFilterValue(
  value
) {

  return String(
    value || ''
  )
    .replace(
      /[%*(),]/g,
      ''
    )
    .trim();

}
