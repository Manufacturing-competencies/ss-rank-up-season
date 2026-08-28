/* ==========================================================
   SS RANK UP SEASON
   DATABASE API

   /api/ss-database

   FEATURES
   - Pagination
   - Search Nama
   - Search SS ID
   - Server side
   - Ringan
========================================================== */

export default async function handler(req, res) {

  try {

    const supabaseUrl =
      process.env.SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_KEY;


    if (!supabaseUrl || !serviceKey) {

      return res.status(500).json({
        success: false,
        message: 'Supabase environment belum tersedia.'
      });

    }


    /* ======================================================
       PARAMETER
    ====================================================== */

    const page =
      Math.max(
        1,
        parseInt(req.query.page || '1', 10)
      );


    const limit =
      Math.min(
        100,
        Math.max(
          1,
          parseInt(req.query.limit || '50', 10)
        )
      );


    const search =
      String(req.query.search || '')
        .trim();


    const from =
      (page - 1) * limit;


    const to =
      from + limit - 1;


    /* ======================================================
       QUERY
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
      Data terbaru di atas.
    */

    params.set(
      'order',
      'source_row.asc'
    );


    /* ======================================================
       SEARCH
    ====================================================== */

    if (search) {

      const cleanSearch =
        cleanSearchValue(search);


      /*
        Kalau yang diketik angka:
        dianggap SS ID.

        Contoh:
        168345
      */

      if (/^\d+$/.test(cleanSearch)) {

        params.set(
          'ss_id',
          'eq.' + cleanSearch
        );

      }

      /*
        Kalau huruf:
        dianggap pencarian nama.

        Bisa:
        DENI
        Deni
        deni saputra
        DENI SAPUTRA
      */

      else {

        params.set(
          'employee_name',
          'ilike.*' +
          cleanSearch +
          '*'
        );

      }

    }


    /* ======================================================
       URL SUPABASE
    ====================================================== */

    const url =

      supabaseUrl.replace(/\/+$/, '') +

      '/rest/v1/ss_rank_up_database?' +

      params.toString();


    /* ======================================================
       REQUEST
    ====================================================== */

    const response =
      await fetch(
        url,
        {
          method: 'GET',

          headers: {

            apikey:
              serviceKey,

            Authorization:
              'Bearer ' +
              serviceKey,

            Prefer:
              'count=exact',

            Range:
              `${from}-${to}`

          },

          cache:
            'no-store'
        }
      );


    const text =
      await response.text();


    if (!response.ok) {

      console.error(
        'SUPABASE ERROR:',
        response.status,
        text
      );


      return res.status(500).json({

        success: false,

        message:
          'Database gagal dimuat.',

        detail:
          text

      });

    }


    let data = [];


    try {

      data =
        text
          ? JSON.parse(text)
          : [];

    }

    catch {

      data = [];

    }


    /* ======================================================
       TOTAL
    ====================================================== */

    const contentRange =
      response.headers.get(
        'content-range'
      );


    let total = 0;


    if (
      contentRange &&
      contentRange.includes('/')
    ) {

      const totalText =
        contentRange.split('/').pop();


      if (totalText !== '*') {

        total =
          Number(totalText) || 0;

      }

    }


    const totalPages =
      total > 0
        ? Math.ceil(total / limit)
        : 1;


    /* ======================================================
       RESPONSE
    ====================================================== */

    return res
      .status(200)
      .json({

        success: true,

        data,

        pagination: {

          page,

          limit,

          total,

          totalPages,

          from:
            total > 0
              ? from + 1
              : 0,

          to:
            total > 0
              ? Math.min(to + 1, total)
              : 0

        }

      });


  }

  catch(error) {

    console.error(
      'SS DATABASE API ERROR:',
      error
    );


    return res
      .status(500)
      .json({

        success: false,

        message:
          'Internal server error.'

      });

  }

}


/* ==========================================================
   CLEAN SEARCH
========================================================== */

function cleanSearchValue(value) {

  return String(value || '')

    .trim()

    .replace(
      /[%*(),]/g,
      ''
    );

}
