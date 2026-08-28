rows.sort(

  function(a, b) {

    /* ======================================================
       1. STATUS
       WINNER dulu, baru LOSE
    ====================================================== */

    const statusDiff =
      getStatusPriority(
        a.season_status
      ) -
      getStatusPriority(
        b.season_status
      );


    if (
      statusDiff !== 0
    ) {

      return statusDiff;

    }


    /* ======================================================
       2. SS DONE
       terbesar dulu
    ====================================================== */

    const ssDoneDiff =
      Number(
        b.ss_done || 0
      ) -
      Number(
        a.ss_done || 0
      );


    if (
      ssDoneDiff !== 0
    ) {

      return ssDoneDiff;

    }


    /* ======================================================
       3. POINT APPROVED
       terbesar dulu
    ====================================================== */

    const pointApprovedDiff =
      Number(
        b.point_approved || 0
      ) -
      Number(
        a.point_approved || 0
      );


    if (
      pointApprovedDiff !== 0
    ) {

      return pointApprovedDiff;

    }


    /* ======================================================
       4. POINT
       terbesar dulu
    ====================================================== */

    const pointDiff =
      Number(
        b.point || 0
      ) -
      Number(
        a.point || 0
      );


    if (
      pointDiff !== 0
    ) {

      return pointDiff;

    }


    /* ======================================================
       5. NAMA A-Z
    ====================================================== */

    return String(
      a.employee_name || ''
    ).localeCompare(

      String(
        b.employee_name || ''
      ),

      'id',

      {
        sensitivity:
          'base'
      }

    );

  }

);
