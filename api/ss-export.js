/* ==========================================================
   SS RANK UP SEASON
   API / SS EXPORT — FINAL
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
       SEARCH PARAM
    ====================================================== */

    const search =
      String(
        req.query.search || ''
      )
        .trim();


    const params =
      new URLSearchParams();


    params.set(
      'select',
      [
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
        'source_row'
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


      if (
        /^\d+$/.test(clean)
      ) {

        params.set(
          'ss_id',
          'eq.' + clean
        );

      }

      else {

        params.set(
          'employee_name',
          'ilike.*' +
          clean +
          '*'
        );

      }

    }


    params.set(
      'order',
      'source_row.asc'
    );


    /* ======================================================
       FETCH SUPABASE
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
        'EXPORT SUPABASE ERROR:',
        response.status,
        text
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            'Gagal mengambil data export.'

        });

    }


    let rows = [];


    try {

      rows =
        text
          ? JSON.parse(text)
          : [];

    }

    catch {

      rows = [];

    }


    if (
      !Array.isArray(rows)
    ) {

      rows = [];

    }


    /* ======================================================
       SORT DONE FIRST
    ====================================================== */

    rows.sort(

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


        return (
          Number(
            a.source_row || 0
          ) -
          Number(
            b.source_row || 0
          )
        );

      }

    );


    /* ======================================================
       CSV HEADER
    ====================================================== */

    const csvRows = [];


    csvRows.push([
      'NO',
      'SS ID',
      'Status Admin',
      'Status Superior',
      'Status Implementasi',
      'Nama',
      'Departemen',
      'Jenis SS',
      'Superior',
      'Create Time',
      'Lokasi Kerja',
      'Month',
      'Validasi',
      'Tanggal Implementasi',
      'Kualifikasi',
      'Point',
      'Point Approval'
    ]);


    /* ======================================================
       CSV DATA
    ====================================================== */

    rows.forEach(

      function(row) {

        csvRows.push([

          row.row_no ?? '',

          row.ss_id ?? '',

          row.status_admin ?? '',

          row.status_superior ?? '',

          row.status_implementasi ?? '',

          row.employee_name ?? '',

          row.department ?? '',

          row.ss_type ?? '',

          row.superior_name ?? '',

          formatDateTimeForExport(
            row.created_time
          ),

          row.work_location ?? '',

          row.month_no ?? '',

          row.validation_month ?? '',

          formatDateForExport(
            row.implementation_date
          ),

          row.qualification ?? '',

          row.point ?? 0,

          row.point_approval ?? 0

        ]);

      }

    );


    /* ======================================================
       CREATE CSV
    ====================================================== */

    const csv =
      csvRows

        .map(

          function(row) {

            return row

              .map(
                csvEscape
              )

              .join(',');

          }

        )

        .join('\n');


    /* ======================================================
       FILE NAME
    ====================================================== */

    const today =
      new Date();


    const dateString =
      today
        .toISOString()
        .slice(
          0,
          10
        );


    const fileName =
      search

        ? (
            'SS_Rank_Up_Season_' +
            safeFileName(search) +
            '_' +
            dateString +
            '.csv'
          )

        : (
            'SS_Rank_Up_Season_All_' +
            dateString +
            '.csv'
          );


    /* ======================================================
       RESPONSE CSV

       BOM UTF-8 supaya Excel membaca
       karakter Indonesia dengan baik.
    ====================================================== */

    res.setHeader(
      'Content-Type',
      'text/csv; charset=utf-8'
    );


    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );


    res.setHeader(
      'Cache-Control',
      'no-store'
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
      'SS EXPORT ERROR:',
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          'Internal export error.'

      });

  }

}


/* ==========================================================
   PRIORITY
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

    .replace(
      /[%*(),]/g,
      ''
    )

    .replace(
      /\s+/g,
      ' '
    );

}


/* ==========================================================
   CSV ESCAPE
========================================================== */

function csvEscape(
  value
) {

  const text =
    String(
      value ?? ''
    );


  return (
    '"' +

    text.replace(
      /"/g,
      '""'
    ) +

    '"'
  );

}


/* ==========================================================
   SAFE FILE NAME
========================================================== */

function safeFileName(
  value
) {

  return String(
    value || ''
  )

    .trim()

    .replace(
      /[^a-zA-Z0-9_-]+/g,
      '_'
    )

    .replace(
      /^_+|_+$/g,
      ''

    )

    .slice(
      0,
      50
    );

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDateForExport(
  value
) {

  if (
    !value
  ) {

    return '';

  }


  const match =
    String(value)
      .match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );


  if (
    !match
  ) {

    return String(
      value
    );

  }


  return (
    match[3] +
    '/' +
    match[2] +
    '/' +
    match[1]
  );

}


/* ==========================================================
   FORMAT DATETIME
========================================================== */

function formatDateTimeForExport(
  value
) {

  if (
    !value
  ) {

    return '';

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(
      value
    );

  }


  try {

    return new Intl.DateTimeFormat(

      'id-ID',

      {

        timeZone:
          'Asia/Jakarta',

        day:
          '2-digit',

        month:
          '2-digit',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit',

        second:
          '2-digit',

        hour12:
          false

      }

    ).format(
      date
    );

  }

  catch {

    return String(
      value
    );

  }

}
