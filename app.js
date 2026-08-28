/* ==========================================================
   SS RANK UP SEASON
   APP.JS — FINAL REBUILD
========================================================== */


/* ==========================================================
   CONFIG
========================================================== */

const DEFAULT_LOGIN_URL =
  'https://script.google.com/macros/s/AKfycbw8wpMyhTvg0_O9Nj2TSyp6gZvDlWllv-hRnJHMknIcfwFrTx9p7R241gZZHRiMutRN/exec';


const DATABASE_API =
  '/api/ss-database';


const DASHBOARD_API =
  '/api/dashboard';


/* ==========================================================
   SESSION
========================================================== */

const urlParams =
  new URLSearchParams(
    window.location.search
  );


let sessionToken =
  urlParams.get('session') ||
  localStorage.getItem(
    'ss_rank_session'
  );


let loginUrl =
  DEFAULT_LOGIN_URL;


/*
   Jika user datang dari Apps Script:

   /?session=xxxx
*/

if (
  urlParams.has('session')
) {

  const incomingToken =
    urlParams.get('session');


  if (incomingToken) {

    sessionToken =
      incomingToken;


    localStorage.setItem(
      'ss_rank_session',
      incomingToken
    );

  }


  /*
     Hapus ?session= dari URL
     supaya token tidak terlihat.
  */

  window.history.replaceState(

    {},

    document.title,

    window.location.pathname

  );

}


/* ==========================================================
   DOM — USER
========================================================== */

const headerUserName =
  document.getElementById(
    'headerUserName'
  );


const headerUserRole =
  document.getElementById(
    'headerUserRole'
  );


const heroUserName =
  document.getElementById(
    'heroUserName'
  );


const avatar =
  document.getElementById(
    'avatar'
  );


const departmentText =
  document.getElementById(
    'departmentText'
  );


const locationText =
  document.getElementById(
    'locationText'
  );


/* ==========================================================
   DOM — HERO RANK
========================================================== */

const seasonState =
  document.getElementById(
    'seasonState'
  );


const rankPanel =
  document.getElementById(
    'rankPanel'
  );


const rankName =
  document.getElementById(
    'rankName'
  );


const rankTotal =
  document.getElementById(
    'rankTotal'
  );


const seasonStatus =
  document.getElementById(
    'seasonStatus'
  );


const missedMonths =
  document.getElementById(
    'missedMonths'
  );


const rankSymbol =
  document.getElementById(
    'rankSymbol'
  );


/* ==========================================================
   DOM — BUTTON
========================================================== */

const logoutButton =
  document.getElementById(
    'logoutButton'
  );


const musicButton =
  document.getElementById(
    'musicButton'
  );


const bgMusic =
  document.getElementById(
    'bgMusic'
  );


/* ==========================================================
   DOM — JOURNEY
========================================================== */

const journeySummary =
  document.getElementById(
    'journeySummary'
  );


const journeyTrack =
  document.getElementById(
    'journeyTrack'
  );


const journeyNote =
  document.getElementById(
    'journeyNote'
  );


const journeySection =
  document.getElementById(
    'rankJourneySection'
  );


/* ==========================================================
   DOM — NAVIGATION
========================================================== */

const navItems =
  document.querySelectorAll(
    '.nav-item'
  );


const appPages =
  document.querySelectorAll(
    '.app-page'
  );


/* ==========================================================
   DOM — DATABASE
========================================================== */

const databaseSearch =
  document.getElementById(
    'databaseSearch'
  );


const databaseLimit =
  document.getElementById(
    'databaseLimit'
  );

const databaseExport =
  document.getElementById(
    'databaseExport'
  );

const databaseTableBody =
  document.getElementById(
    'databaseTableBody'
  );


const databaseMobile =
  document.getElementById(
    'databaseMobile'
  );


const databaseStatus =
  document.getElementById(
    'databaseStatus'
  );


const databasePageInfo =
  document.getElementById(
    'databasePageInfo'
  );


const databasePrev =
  document.getElementById(
    'databasePrev'
  );


const databaseNext =
  document.getElementById(
    'databaseNext'
  );


/* ==========================================================
   APP STATE
========================================================== */

let databaseLoaded =
  false;


let databasePage =
  1;


let databaseTotalPages =
  1;


let databaseSearchTimer =
  null;


/* ==========================================================
   GENERAL HELPER
========================================================== */

function firstValue(
  ...values
) {

  for (
    const value of values
  ) {

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {

      return value;

    }

  }


  return '';

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHtml(
  value
) {

  return String(
    value ?? ''
  )

    .replace(
      /&/g,
      '&amp;'
    )

    .replace(
      /</g,
      '&lt;'
    )

    .replace(
      />/g,
      '&gt;'
    )

    .replace(
      /"/g,
      '&quot;'
    )

    .replace(
      /'/g,
      '&#039;'
    );

}


/* ==========================================================
   SAFE TEXT
========================================================== */

function safeText(
  value
) {

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {

    return '-';

  }


  return escapeHtml(
    value
  );

}


/* ==========================================================
   INITIALS
========================================================== */

function getInitials(
  name
) {

  const words =
    String(
      name || ''
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (
    !words.length
  ) {

    return '--';

  }


  return words

    .slice(0, 2)

    .map(
      function(word) {

        return word
          .charAt(0);

      }
    )

    .join('')

    .toUpperCase();

}


/* ==========================================================
   LOGIN REDIRECT
========================================================== */

function goToLogin() {

  localStorage.removeItem(
    'ss_rank_session'
  );


  sessionStorage.clear();


  sessionToken =
    null;


  window.location.replace(
    loginUrl ||
    DEFAULT_LOGIN_URL
  );

}


/* ==========================================================
   LOAD DASHBOARD
========================================================== */

async function loadDashboard() {

  /*
     Tidak punya token?
     langsung login.
  */

  if (
    !sessionToken
  ) {

    goToLogin();

    return;

  }


  try {

    const response =
      await fetch(

        DASHBOARD_API +

        '?session=' +

        encodeURIComponent(
          sessionToken
        ),

        {

          method:
            'GET',

          cache:
            'no-store'

        }

      );


    let result = {};


    try {

      result =
        await response.json();

    }

    catch(error) {

      throw new Error(
        'Dashboard response tidak valid.'
      );

    }


    /*
       API boleh mengirim login URL.
    */

    if (
      result.loginUrl
    ) {

      loginUrl =
        result.loginUrl;

    }


    /*
       Session expired / invalid
    */

    if (
      response.status === 401 ||
      response.status === 403
    ) {

      goToLogin();

      return;

    }


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.message ||
        'Dashboard gagal dimuat.'
      );

    }


    renderDashboard(
      result
    );


    tryStartMusic();

  }

  catch(error) {

    console.error(
      'LOAD DASHBOARD ERROR:',
      error
    );


    /*
       Jangan tampilkan
       PLEASE LOGIN AGAIN lagi.
    */

    goToLogin();

  }

}


/* ==========================================================
   RENDER DASHBOARD
========================================================== */

function renderDashboard(
  data
) {

  const user =
    data.user || {};


  const session =
    data.session || {};


  const season =
    data.season || {};


  const progress =
    data.progress || {};


  /* ========================================================
     NAME
  ======================================================== */

  const name =
    String(

      firstValue(

        user.name,

        user.user_name,

        user.employee_name,

        session.user_name,

        session.name,

        data.user_name,

        data.name,

        progress.employee_name,

        'USER'

      )

    )
      .trim()
      .toUpperCase();


  /* ========================================================
     ROLE
  ======================================================== */

  const role =
    String(

      firstValue(

        user.role,

        session.role,

        data.role,

        'USER'

      )

    )
      .trim()
      .toUpperCase();


  /* ========================================================
     DEPARTMENT
  ======================================================== */

  const department =
    String(

      firstValue(

        progress.department,

        user.department,

        user.departemen,

        session.department,

        data.department,

        '-'

      )

    ).trim();


  /* ========================================================
     LOCATION
  ======================================================== */

  const location =
    String(

      firstValue(

        progress.work_location,

        progress.location,

        user.work_location,

        user.location,

        session.location,

        data.location,

        '-'

      )

    ).trim();


  /* ========================================================
     HEADER
  ======================================================== */

  if (
    headerUserName
  ) {

    headerUserName.textContent =
      name;

  }


  if (
    headerUserRole
  ) {

    headerUserRole.textContent =
      role;

  }


  if (
    avatar
  ) {

    avatar.textContent =
      getInitials(
        name
      );

  }


  /* ========================================================
     HERO
  ======================================================== */

  if (
    heroUserName
  ) {

    heroUserName.textContent =
      name;

  }


  if (
    departmentText
  ) {

    departmentText.textContent =
      department;

  }


  if (
    locationText
  ) {

    locationText.textContent =
      location;

  }


  /* ========================================================
     SEASON STATE
  ======================================================== */

  if (
    seasonState
  ) {

    const active =
      firstValue(

        season.active,

        season.is_active,

        true

      );


    seasonState.textContent =

      active === false

        ? 'SEASON CLOSED'

        : 'SEASON ACTIVE';

  }


  /* ========================================================
     RANK
  ======================================================== */

  renderRank(
    progress
  );


  /* ========================================================
     JOURNEY
  ======================================================== */

  renderJourney(
    progress
  );

}


/* ==========================================================
   TOTAL APPROVED
========================================================== */

function getTotalApproved(
  progress
) {

  const value =
    firstValue(

      progress.totalApproved,

      progress.total_approved,

      progress.sum,

      0

    );


  return Number(
    value
  ) || 0;

}


/* ==========================================================
   STATUS
========================================================== */

function getProgressStatus(
  progress
) {

  return String(

    firstValue(

      progress.status,

      progress.season_status,

      'FAILED'

    )

  )
    .trim()
    .toUpperCase();

}


/* ==========================================================
   MISSED MONTHS
========================================================== */

function getMissedMonths(
  progress
) {

  if (
    Array.isArray(
      progress.missedMonths
    )
  ) {

    return progress.missedMonths;

  }


  if (
    Array.isArray(
      progress.missed_months
    )
  ) {

    return progress.missed_months;

  }


  const months = [

    {

      name:
        progress.month_1_name,

      value:
        Number(
          progress.month_1_value || 0
        )

    },

    {

      name:
        progress.month_2_name,

      value:
        Number(
          progress.month_2_value || 0
        )

    },

    {

      name:
        progress.month_3_name,

      value:
        Number(
          progress.month_3_value || 0
        )

    }

  ];


  return months

    .filter(

      function(month) {

        return (
          month.name &&
          month.value < 1
        );

      }

    )

    .map(

      function(month) {

        return month.name;

      }

    );

}


/* ==========================================================
   NORMALIZE RANK
========================================================== */

function normalizeRank(
  value
) {

  const rank =
    String(
      value || 'WARRIOR'
    )

      .trim()

      .toUpperCase()

      .replace(
        /\s+/g,
        ' '
      );


  const validRanks = [

    'WARRIOR',
    'ELITE',
    'EPIC',
    'LEGEND',
    'MYTHIC',
    'MYTHIC HONOR',
    'MYTHIC GLORY'

  ];


  return validRanks.includes(
    rank
  )

    ? rank

    : 'WARRIOR';

}


/* ==========================================================
   CALCULATE RANK
========================================================== */

function calculateRankFromTotal(
  totalApproved
) {

  const total =
    Number(
      totalApproved || 0
    );


  if (
    total >= 10
  ) {

    return 'MYTHIC GLORY';

  }


  if (
    total >= 7
  ) {

    return 'MYTHIC HONOR';

  }


  if (
    total >= 4
  ) {

    return 'MYTHIC';

  }


  if (
    total === 3
  ) {

    return 'LEGEND';

  }


  if (
    total === 2
  ) {

    return 'EPIC';

  }


  if (
    total === 1
  ) {

    return 'ELITE';

  }


  return 'WARRIOR';

}


/* ==========================================================
   RANK CSS CLASS
========================================================== */

function getRankClass(
  rank
) {

  const map = {

    WARRIOR:
      'rank-warrior',

    ELITE:
      'rank-elite',

    EPIC:
      'rank-epic',

    LEGEND:
      'rank-legend',

    MYTHIC:
      'rank-mythic',

    'MYTHIC HONOR':
      'rank-mythic-honor',

    'MYTHIC GLORY':
      'rank-mythic-glory'

  };


  return (
    map[rank] ||
    'rank-warrior'
  );

}


/* ==========================================================
   RENDER HERO RANK
========================================================== */

function renderRank(
  progress
) {

  const totalApproved =
    getTotalApproved(
      progress
    );


  const rank =
    normalizeRank(

      firstValue(

        progress.rank,

        calculateRankFromTotal(
          totalApproved
        )

      )

    );


  const status =
    getProgressStatus(
      progress
    );


  const missed =
    getMissedMonths(
      progress
    );


  /* ========================================================
     PANEL CLASS
  ======================================================== */

  if (
    rankPanel
  ) {

    rankPanel.classList.remove(

      'rank-warrior',
      'rank-elite',
      'rank-epic',
      'rank-legend',
      'rank-mythic',
      'rank-mythic-honor',
      'rank-mythic-glory'

    );


    rankPanel.classList.add(
      getRankClass(
        rank
      )
    );

  }


  /* ========================================================
     RANK NAME
  ======================================================== */

  if (
    rankName
  ) {

    rankName.textContent =
      rank;

  }


  /* ========================================================
     TOTAL
  ======================================================== */

  if (
    rankTotal
  ) {

    rankTotal.textContent =
      totalApproved +
      ' SS';

  }


  /* ========================================================
     SYMBOL
  ======================================================== */

  if (
    rankSymbol
  ) {

    const symbols = {

      WARRIOR:
        'W',

      ELITE:
        'E',

      EPIC:
        'E',

      LEGEND:
        'L',

      MYTHIC:
        'M',

      'MYTHIC HONOR':
        'MH',

      'MYTHIC GLORY':
        'MG'

    };


    rankSymbol.textContent =
      symbols[rank] ||
      'W';

  }


  /* ========================================================
     STATUS
  ======================================================== */

  if (
    seasonStatus
  ) {

    seasonStatus.classList.remove(
      'winner',
      'failed'
    );


    if (
      status === 'WINNER'
    ) {

      seasonStatus.textContent =
        'WINNER';


      seasonStatus.classList.add(
        'winner'
      );

    }

    else {

      seasonStatus.textContent =
        'FAILED';


      seasonStatus.classList.add(
        'failed'
      );

    }

  }


  /* ========================================================
     MISSED
  ======================================================== */

  if (
    missedMonths
  ) {

    if (
      status === 'FAILED' &&
      missed.length
    ) {

      missedMonths.textContent =

        'Missed: ' +

        missed.join(', ');

    }

    else {

      missedMonths.textContent =
        '';

    }

  }

}


/* ==========================================================
   RENDER RANK JOURNEY
========================================================== */

function renderJourney(
  progress
) {

  if (
    !journeyTrack
  ) {

    return;

  }


  const totalApproved =
    getTotalApproved(
      progress
    );


  const currentRank =
    normalizeRank(

      firstValue(

        progress.rank,

        calculateRankFromTotal(
          totalApproved
        )

      )

    );


  const status =
    getProgressStatus(
      progress
    );


  const missed =
    getMissedMonths(
      progress
    );


  const rankOrder = [

    'WARRIOR',
    'ELITE',
    'EPIC',
    'LEGEND',
    'MYTHIC',
    'MYTHIC HONOR',
    'MYTHIC GLORY'

  ];


  let currentIndex =
    rankOrder.indexOf(
      currentRank
    );


  if (
    currentIndex < 0
  ) {

    currentIndex =
      0;

  }


  const cards =
    journeyTrack.querySelectorAll(
      '.journey-card'
    );


  let currentCard =
    null;


  cards.forEach(

    function(card) {

      const cardIndex =
        Number(
          card.dataset.index || 0
        );


      const state =
        card.querySelector(
          '.journey-card-state'
        );


      card.classList.remove(
        'achieved',
        'current',
        'locked'
      );


      if (
        cardIndex <
        currentIndex
      ) {

        card.classList.add(
          'achieved'
        );


        if (
          state
        ) {

          state.textContent =
            'UNLOCKED';

        }

      }


      else if (
        cardIndex ===
        currentIndex
      ) {

        card.classList.add(
          'current'
        );


        currentCard =
          card;


        if (
          state
        ) {

          state.textContent =
            'CURRENT';

        }

      }


      else {

        card.classList.add(
          'locked'
        );


        if (
          state
        ) {

          state.textContent =
            'LOCKED';

        }

      }

    }

  );


  /* ========================================================
     JOURNEY SUMMARY
  ======================================================== */

  if (
    journeySummary
  ) {

    journeySummary.innerHTML =

      '<b>Current Rank:</b>&nbsp;' +

      escapeHtml(
        currentRank
      ) +

      '&nbsp;&nbsp; • &nbsp;&nbsp;' +

      '<b>Total Approved:</b>&nbsp;' +

      totalApproved +

      ' SS' +

      '&nbsp;&nbsp; • &nbsp;&nbsp;' +

      '<b>Season:</b>&nbsp;' +

      escapeHtml(
        status
      );

  }


  /* ========================================================
     JOURNEY NOTE
  ======================================================== */

  if (
    journeyNote
  ) {

    if (
      status === 'WINNER'
    ) {

      journeyNote.innerHTML =

        'Season Status: ' +

        '<span class="winner">' +
        'WINNER' +
        '</span>. ' +

        'Kamu berhasil menyelesaikan minimal ' +

        '<b>1 SS Approved Implementasi ' +
        'di setiap bulan</b>.';

    }

    else {

      const missedText =
        missed.length

          ? missed.join(', ')

          : '-';


      journeyNote.innerHTML =

        'Season Status: ' +

        '<span class="failed">' +
        'FAILED' +
        '</span>. ' +

        'Rank tetap mengikuti total Approved Implementasi. ' +

        'Bulan yang belum memenuhi target: ' +

        '<b>' +

        escapeHtml(
          missedText
        ) +

        '</b>.';

    }

  }


  /* ========================================================
     MOBILE CURRENT CARD
  ======================================================== */

  if (
    currentCard &&
    window.innerWidth <= 1000
  ) {

    setTimeout(

      function() {

        currentCard.scrollIntoView({

          behavior:
            'smooth',

          block:
            'nearest',

          inline:
            'center'

        });

      },

      250

    );

  }

}


/* ==========================================================
   NAVIGATION
========================================================== */

navItems.forEach(

  function(item) {

    item.addEventListener(

      'click',

      function() {

        const pageName =
          item.dataset.page;


        /* RESET NAV */

        navItems.forEach(

          function(nav) {

            nav.classList.remove(
              'active'
            );

          }

        );


        /* RESET PAGE */

        appPages.forEach(

          function(page) {

            page.classList.remove(
              'active'
            );

          }

        );


        /* ACTIVE NAV */

        item.classList.add(
          'active'
        );


        /* ACTIVE PAGE */

        const targetPage =
          document.getElementById(

            'page-' +
            pageName

          );


        if (
          targetPage
        ) {

          targetPage.classList.add(
            'active'
          );

        }


        /* DATABASE */

        if (
          pageName ===
          'database'
        ) {

          initDatabasePage();

        }


        window.scrollTo({

          top:
            0,

          behavior:
            'smooth'

        });

      }

    );

  }

);


/* ==========================================================
   INIT DATABASE
========================================================== */

function initDatabasePage() {

  if (
    databaseLoaded
  ) {

    return;

  }


  databaseLoaded =
    true;


  databasePage =
    1;


  loadDatabase();

}


/* ==========================================================
   LOAD DATABASE
========================================================== */

async function loadDatabase() {

  try {

    if (
      databaseStatus
    ) {

      databaseStatus.textContent =
        'Loading database...';

    }


    const search =
      databaseSearch

        ? databaseSearch
            .value
            .trim()

        : '';


    const limit =
      databaseLimit

        ? databaseLimit.value

        : '50';


    const params =
      new URLSearchParams();


    params.set(
      'page',
      databasePage
    );


    params.set(
      'limit',
      limit
    );


    if (
      search
    ) {

      params.set(
        'search',
        search
      );

    }


    const response =
      await fetch(

        DATABASE_API +

        '?' +

        params.toString(),

        {

          method:
            'GET',

          cache:
            'no-store'

        }

      );


    let result = {};


    try {

      result =
        await response.json();

    }

    catch {

      throw new Error(
        'Database response tidak valid.'
      );

    }


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.message ||
        'Database gagal dimuat.'
      );

    }


    renderDatabaseRows(
      result.data || []
    );


    const pagination =
      result.pagination || {};


    databaseTotalPages =
      Number(
        pagination.totalPages ||
        1
      );


    /* ========================================================
       STATUS
    ======================================================== */

    if (
      databaseStatus
    ) {

      databaseStatus.textContent =

        'Menampilkan ' +

        Number(
          pagination.from || 0
        ) +

        '–' +

        Number(
          pagination.to || 0
        ) +

        ' dari ' +

        Number(
          pagination.total || 0
        ) +

        ' data';

    }


    /* ========================================================
       PAGE INFO
    ======================================================== */

    if (
      databasePageInfo
    ) {

      databasePageInfo.textContent =

        'Page ' +

        databasePage +

        ' / ' +

        databaseTotalPages;

    }


    /* ========================================================
       PREVIOUS
    ======================================================== */

    if (
      databasePrev
    ) {

      databasePrev.disabled =
        databasePage <= 1;

    }


    /* ========================================================
       NEXT
    ======================================================== */

    if (
      databaseNext
    ) {

      databaseNext.disabled =

        databasePage >=
        databaseTotalPages;

    }

  }

  catch(error) {

    console.error(
      'DATABASE ERROR:',
      error
    );


    if (
      databaseStatus
    ) {

      databaseStatus.textContent =
        'Database gagal dimuat.';

    }

  }

}


/* ==========================================================
   RENDER DATABASE ROWS
========================================================== */

function renderDatabaseRows(
  rows
) {

  /* RESET DESKTOP */

  if (
    databaseTableBody
  ) {

    databaseTableBody.innerHTML =
      '';

  }


  /* RESET MOBILE */

  if (
    databaseMobile
  ) {

    databaseMobile.innerHTML =
      '';

  }


  /* EMPTY */

  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {

    if (
      databaseStatus
    ) {

      databaseStatus.textContent =
        'Data tidak ditemukan.';

    }


    return;

  }


  rows.forEach(

    function(row) {


      /* ====================================================
         DESKTOP TABLE
      ==================================================== */

      if (
        databaseTableBody
      ) {

        const tr =
          document.createElement(
            'tr'
          );


        tr.innerHTML =

          tableCell(
            row.ss_id
          ) +

          tableCell(
            row.employee_name
          ) +

          tableCell(
            row.department
          ) +

          tableCell(
            row.ss_type
          ) +

          tableCell(
            row.superior_name
          ) +

          tableCell(

            row.status_admin,

            getStatusClass(
              row.status_admin
            )

          ) +

          tableCell(

            row.status_superior,

            getStatusClass(
              row.status_superior
            )

          ) +

          tableCell(

            row.status_implementasi,

            getStatusClass(
              row.status_implementasi
            )

          ) +

          tableCell(

            formatDateTimeDatabase(
              row.created_time
            )

          ) +

          tableCell(
            row.work_location
          ) +

          tableCell(
            row.month_no
          ) +

          tableCell(
            row.validation_month
          ) +

          tableCell(

            formatImplementationDate(
              row.implementation_date
            )

          ) +

          tableCell(

            row.qualification,

            getStatusClass(
              row.qualification
            )

          ) +

          tableCell(

            formatPointDatabase(
              row.point
            )

          ) +

          tableCell(

            formatPointDatabase(
              row.point_approval
            )

          );


        databaseTableBody
          .appendChild(
            tr
          );

      }


      /* ====================================================
         MOBILE CARD
      ==================================================== */

      if (
        databaseMobile
      ) {

        const card =
          document.createElement(
            'article'
          );


        card.className =
          'database-mobile-card';


        card.innerHTML =

          '<div class="database-mobile-card-head">' +

            '<div>' +

              '<div class="database-mobile-id">' +

                'SS #' +

                safeText(
                  row.ss_id
                ) +

              '</div>' +


              '<div class="database-mobile-name">' +

                safeText(
                  row.employee_name
                ) +

              '</div>' +


              '<div class="database-mobile-dept">' +

                safeText(
                  row.department
                ) +

              '</div>' +

            '</div>' +

          '</div>' +


          '<div class="database-mobile-info">' +

            mobileInfo(
              'Jenis SS',
              row.ss_type
            ) +

            mobileInfo(
              'Superior',
              row.superior_name
            ) +

            mobileInfo(
              'Status Admin',
              row.status_admin
            ) +

            mobileInfo(
              'Status Superior',
              row.status_superior
            ) +

            mobileInfo(
              'Implementasi',
              row.status_implementasi
            ) +

            mobileInfo(
              'Create Time',
              formatDateTimeDatabase(
                row.created_time
              )
            ) +

            mobileInfo(
              'Lokasi',
              row.work_location
            ) +

            mobileInfo(
              'Month',
              row.month_no
            ) +

            mobileInfo(
              'Validasi',
              row.validation_month
            ) +

            mobileInfo(
              'Tgl Implementasi',
              formatImplementationDate(
                row.implementation_date
              )
            ) +

            mobileInfo(
              'Kualifikasi',
              row.qualification
            ) +

            mobileInfo(
              'Point',
              formatPointDatabase(
                row.point
              )
            ) +

            mobileInfo(
              'Point Approval',
              formatPointDatabase(
                row.point_approval
              )
            ) +

          '</div>';


        databaseMobile
          .appendChild(
            card
          );

      }

    }

  );

}


/* ==========================================================
   TABLE CELL
========================================================== */

function tableCell(
  value,
  className = ''
) {

  const classAttribute =
    className

      ? ` class="${className}"`

      : '';


  return (

    `<td${classAttribute}>` +

      safeText(
        value
      ) +

    '</td>'

  );

}


/* ==========================================================
   MOBILE INFO
========================================================== */

function mobileInfo(
  label,
  value
) {

  return (

    '<div>' +

      '<small>' +

        escapeHtml(
          label
        ) +

      '</small>' +

      '<strong>' +

        safeText(
          value
        ) +

      '</strong>' +

    '</div>'

  );

}


/* ==========================================================
   FORMAT POINT
========================================================== */

function formatPointDatabase(
  value
) {

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {

    return '-';

  }


  const number =
    Number(
      value
    );


  if (
    Number.isNaN(
      number
    )
  ) {

    return value;

  }


  return number
    .toLocaleString(
      'id-ID'
    );

}


/* ==========================================================
   IMPLEMENTATION DATE
========================================================== */

function formatImplementationDate(
  value
) {

  if (
    !value ||
    value === 'null'
  ) {

    return '-';

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


  const year =
    Number(
      match[1]
    );


  const month =
    Number(
      match[2]
    );


  const day =
    Number(
      match[3]
    );


  const months = [

    '',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des'

  ];


  return (

    String(day)
      .padStart(
        2,
        '0'
      ) +

    ' ' +

    (
      months[month] ||
      ''
    ) +

    ' ' +

    year

  );

}


/* ==========================================================
   CREATE TIME
========================================================== */

function formatDateTimeDatabase(
  value
) {

  if (
    !value ||
    value === 'null'
  ) {

    return '-';

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
          'short',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit',

        hour12:
          false

      }

    )
      .format(
        date
      )
      .replace(
        ',',
        ' •'
      );

  }

  catch(error) {

    return String(
      value
    );

  }

}


/* ==========================================================
   DATABASE STATUS
========================================================== */

function getStatusClass(
  value
) {

  const status =
    String(
      value || ''
    )
      .trim()
      .toUpperCase();


  if (
    status === 'DONE' ||
    status === 'APPROVED' ||
    status === 'QUALIFIED'
  ) {

    return 'db-status-success';

  }


  if (
    status === 'NOT APPROVED' ||
    status === 'NOT OK' ||
    status === 'FAILED' ||
    status === 'NOT QUALIFIED'
  ) {

    return 'db-status-danger';

  }


  if (
    status === 'SUBMITTED' ||
    status === 'IMPLEMENTASI' ||
    status === 'NEED REVISION'
  ) {

    return 'db-status-process';

  }


  return '';

}


/* ==========================================================
   DATABASE SEARCH
========================================================== */

if (
  databaseSearch
) {

  databaseSearch.addEventListener(

    'input',

    function() {

      clearTimeout(
        databaseSearchTimer
      );


      databaseSearchTimer =
        setTimeout(

          function() {

            databasePage =
              1;


            loadDatabase();

          },

          450

        );

    }

  );

}


/* ==========================================================
   DATABASE LIMIT
========================================================== */

if (
  databaseLimit
) {

  databaseLimit.addEventListener(

    'change',

    function() {

      databasePage =
        1;


      loadDatabase();

    }

  );

}


/* ==========================================================
   PREVIOUS
========================================================== */

if (
  databasePrev
) {

  databasePrev.addEventListener(

    'click',

    function() {

      if (
        databasePage > 1
      ) {

        databasePage--;


        loadDatabase();

      }

    }

  );

}


/* ==========================================================
   NEXT
========================================================== */

if (
  databaseNext
) {

  databaseNext.addEventListener(

    'click',

    function() {

      if (
        databasePage <
        databaseTotalPages
      ) {

        databasePage++;


        loadDatabase();

      }

    }

  );

}


/* ==========================================================
   LOGOUT — FINAL
========================================================== */

if (
  logoutButton
) {

  logoutButton.addEventListener(

    'click',

    function() {

      /*
         Logout benar-benar
         kembali ke Apps Script.
      */

      localStorage.removeItem(
        'ss_rank_session'
      );


      sessionStorage.clear();


      sessionToken =
        null;


      window.location.replace(
        loginUrl ||
        DEFAULT_LOGIN_URL
      );

    }

  );

}


/* ==========================================================
   MUSIC
========================================================== */

async function playMusic() {

  if (
    !bgMusic
  ) {

    return;

  }


  try {

    bgMusic.volume =
      .30;


    await bgMusic.play();


    if (
      musicButton
    ) {

      musicButton.textContent =
        'II';

    }

  }

  catch(error) {

    /*
       Browser dapat memblokir autoplay.
    */

  }

}


/* ==========================================================
   PAUSE MUSIC
========================================================== */

function pauseMusic() {

  if (
    !bgMusic
  ) {

    return;

  }


  bgMusic.pause();


  if (
    musicButton
  ) {

    musicButton.textContent =
      '▶';

  }

}


/* ==========================================================
   AUTOSTART MUSIC
========================================================== */

async function tryStartMusic() {

  if (
    !bgMusic
  ) {

    return;

  }


  try {

    bgMusic.volume =
      .30;


    await bgMusic.play();


    if (
      musicButton
    ) {

      musicButton.textContent =
        'II';

    }

  }

  catch(error) {

    /*
       Kalau autoplay diblokir,
       musik mulai setelah
       interaksi pertama.
    */

    const activateMusic =
      async function() {

        await playMusic();

      };


    document.addEventListener(

      'pointerdown',

      activateMusic,

      {
        once:
          true
      }

    );

  }

}


/* ==========================================================
   MUSIC BUTTON
========================================================== */

if (
  musicButton
) {

  musicButton.addEventListener(

    'click',

    async function() {

      if (
        !bgMusic
      ) {

        return;

      }


      if (
        bgMusic.paused
      ) {

        await playMusic();

      }

      else {

        pauseMusic();

      }

    }

  );

}


/* ==========================================================
   STORY PARALLAX
========================================================== */

const seasonStory =
  document.querySelector(
    '.season-story'
  );


const storyContent =
  document.querySelector(
    '.story-content'
  );


if (
  seasonStory &&
  storyContent &&
  window.matchMedia(
    '(hover:hover) and (pointer:fine)'
  ).matches
) {

  seasonStory.addEventListener(

    'mousemove',

    function(event) {

      const rect =
        seasonStory
          .getBoundingClientRect();


      const x =

        (
          event.clientX -
          rect.left
        ) /

        rect.width;


      const y =

        (
          event.clientY -
          rect.top
        ) /

        rect.height;


      const moveX =
        (
          x - .5
        ) *
        7;


      const moveY =
        (
          y - .5
        ) *
        4;


      storyContent
        .style
        .transform =

        'translate3d(' +

        moveX +

        'px,' +

        moveY +

        'px,0)';

    }

  );


  seasonStory.addEventListener(

    'mouseleave',

    function() {

      storyContent
        .style
        .transform =
        'translate3d(0,0,0)';

    }

  );

}


/* ==========================================================
   JOURNEY OBSERVER
========================================================== */

if (
  journeySection &&
  'IntersectionObserver'
  in window
) {

  const observer =
    new IntersectionObserver(

      function(entries) {

        entries.forEach(

          function(entry) {

            if (
              entry.isIntersecting
            ) {

              journeySection
                .classList
                .add(
                  'journey-visible'
                );


              observer.unobserve(
                entry.target
              );

            }

          }

        );

      },

      {

        threshold:
          .12

      }

    );


  observer.observe(
    journeySection
  );

}

/* ==========================================================
   EXPORT DATABASE
========================================================== */

if (
  databaseExport
) {

  databaseExport.addEventListener(

    'click',

    function() {

      const search =
        databaseSearch

          ? databaseSearch
              .value
              .trim()

          : '';


      const params =
        new URLSearchParams();


      if (
        search
      ) {

        params.set(
          'search',
          search
        );

      }


      let exportUrl =
        '/api/ss-export';


      if (
        params.toString()
      ) {

        exportUrl +=
          '?' +
          params.toString();

      }


      window.location.href =
        exportUrl;

    }

  );

}

/* ==========================================================
   START
========================================================== */

loadDashboard();
