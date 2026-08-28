/* ==========================================================
   SS RANK UP SEASON
   API / SS DATABASE — FINAL REBUILD
========================================================== */

export default async function handler(
  req,
  res
) {

  try {

    /* ======================================================
       ENVIRONMENT
    ====================================================== */

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
      )
        .trim();


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
       PARAMETER
    ====================================================== */

    const page =
      Math.max(
        1,
        parseInt(
          req.query.page || '1',
          10
        ) || 1
      );


    const limit =
      Math.min(
        100,
        Math.max(
          1,
          parseInt(
            req.query.limit || '50',
            10
          ) || 50
        )
      );


    const search =
      String(
        req.query.search || ''
      )
        .trim();


    /* ======================================================
       FETCH ALL MATCHING DATA
       lalu sort priority server-side.

       Dataset sekitar ribuan row masih aman untuk API server.
       Browser tetap hanya menerima 25/50/100 row.
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


    /* ======================================================
       SEARCH
    ====================================================== */

    if (
      search
    ) {

      const clean =
        cleanSearchValue(
          search
        );


      /*
         ANGKA → EXACT SS ID
      */

      if (
        /^\d+$/.test(clean)
      ) {

        params.set(
          'ss_id',
          'eq.' + clean
        );

      }


      /*
         TEXT → NAMA
      */

      else {

        params.set(
          'employee_name',
          'ilike.*' +
          clean +
          '*'
        );

      }

    }


    /* ======================================================
       BASE SORT

       Supabase tetap beri urutan stabil.
       Priority DONE nanti diproses JS server.
    ====================================================== */

    params.set(
      'order',
      'source_row.asc'
    );


    /* ======================================================
       REQUEST SUPABASE
    ====================================================== */

    const url =

      supabaseUrl +

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
              'count=exact'

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
        'SUPABASE DATABASE ERROR:',
        response.status,
        text
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            'Database gagal dimuat.',

          detail:
            text

        });

    }


    let allRows = [];


    try {

      allRows =
        text
          ? JSON.parse(
              text
            )
          : [];

    }

    catch(error) {

      console.error(
        'DATABASE JSON ERROR:',
        error
      );


      allRows = [];

    }


    if (
      !Array.isArray(
        allRows
      )
    ) {

      allRows = [];

    }


    /* ======================================================
       PRIORITY SORT — GLOBAL

       1. DONE
       2. QUALIFIED
       3. NOT QUALIFIED
       4. STATUS LAIN
       5. BLANK

       Kemudian source_row.
    ====================================================== */

    allRows.sort(

      function(a, b) {

        const aPriority =
          getQualificationPriority(
            a.qualification
          );


        const bPriority =
          getQualificationPriority(
            b.qualification
          );


        if (
          aPriority !==
          bPriority
        ) {

          return (
            aPriority -
            bPriority
          );

        }


        /*
           Dalam kelompok yang sama,
           gunakan source row agar stabil.
        */

        const aSource =
          Number(
            a.source_row || 0
          );


        const bSource =
          Number(
            b.source_row || 0
          );


        return (
          aSource -
          bSource
        );

      }

    );


    /* ======================================================
       PAGINATION SETELAH SORT
    ====================================================== */

    const total =
      allRows.length;


    const totalPages =
      total > 0

        ? Math.ceil(
            total /
            limit
          )

        : 1;


    /*
       Kalau page terlalu besar,
       tetap aman.
    */

    const safePage =
      Math.min(
        page,
        totalPages
      );


    const startIndex =
      (
        safePage - 1
      ) *
      limit;


    const endIndex =
      startIndex +
      limit;


    const data =
      allRows.slice(
        startIndex,
        endIndex
      );


    /* ======================================================
       RESPONSE
    ====================================================== */

    return res
      .status(200)
      .json({

        success:
          true,

        data:
          data,

        pagination: {

          page:
            safePage,

          limit:
            limit,

          total:
            total,

          totalPages:
            totalPages,

          from:
            total > 0
              ? startIndex + 1
              : 0,

          to:
            total > 0
              ? Math.min(
                  endIndex,
                  total
                )
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

        success:
          false,

        message:
          'Internal server error.'

      });

  }

}


/* ==========================================================
   QUALIFICATION PRIORITY
========================================================== */

function getQualificationPriority(
  value
) {

  const status =
    String(
      value || ''
    )
      .trim()
      .toUpperCase();


  if (
    status === 'DONE'
  ) {

    return 0;

  }


  if (
    status === 'QUALIFIED'
  ) {

    return 1;

  }


  if (
    status === 'NOT QUALIFIED'
  ) {

    return 2;

  }


  if (
    status === ''
  ) {

    return 4;

  }


  return 3;

}


/* ==========================================================
   CLEAN SEARCH
========================================================== */

function cleanSearchValue(
  value
) {

  return String(
    value || ''
  )

    .trim()

    /*
       Hapus karakter yang berisiko
       mengganggu filter PostgREST.
    */

    .replace(
      /[%*(),]/g,
      ''
    )

    /*
       Rapikan spasi ganda.
    */

    .replace(
      /\s+/g,
      ' '
    );

}
