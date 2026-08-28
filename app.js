/* ==========================================================
   SS RANK UP SEASON
   APP.JS — FINAL COMPLETE
========================================================== */


/* ==========================================================
   CONFIG
========================================================== */

const DEFAULT_LOGIN_URL =
  'https://script.google.com/macros/s/AKfycbw8wpMyhTvg0_O9Nj2TSyp6gZvDlWllv-hRnJHMknIcfwFrTx9p7R241gZZHRiMutRN/exec';


const DASHBOARD_API =
  '/api/dashboard';


const DATABASE_API =
  '/api/ss-database';


const DATABASE_EXPORT_API =
  '/api/ss-export';


const POINT_API =
  '/api/points';


const POINT_EXPORT_API =
  '/api/point-export';


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


/* ==========================================================
   SAVE SESSION
========================================================== */

if (
  urlParams.has('session')
) {

  const incomingToken =
    urlParams.get('session');


  if (
    incomingToken
  ) {

    sessionToken =
      incomingToken;


    localStorage.setItem(
      'ss_rank_session',
      incomingToken
    );

  }


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
   DOM — HERO / RANK
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
   DOM — POINT
========================================================== */

const pointSearch =
  document.getElementById(
    'pointSearch'
  );


const pointLimit =
  document.getElementById(
    'pointLimit'
  );


const pointExport =
  document.getElementById(
    'pointExport'
  );


const pointTableBody =
  document.getElementById(
    'pointTableBody'
  );


const pointMobile =
  document.getElementById(
    'pointMobile'
  );


const pointPodium =
  document.getElementById(
    'pointPodium'
  );


const pointStatus =
  document.getElementById(
    'pointStatus'
  );


const pointPrev =
  document.getElementById(
    'pointPrev'
  );


const pointNext =
  document.getElementById(
    'pointNext'
  );


const pointPageInfo =
  document.getElementById(
    'pointPageInfo'
  );


const pointTotal =
  document.getElementById(
    'pointTotal'
  );


const pointWinner =
  document.getElementById(
    'pointWinner'
  );


const pointLose =
  document.getElementById(
    'pointLose'
  );


const pointMonth1Header =
  document.getElementById(
    'pointMonth1Header'
  );


const pointMonth2Header =
  document.getElementById(
    'pointMonth2Header'
  );


const pointMonth3Header =
  document.getElementById(
    'pointMonth3Header'
  );


/* ==========================================================
   STATE — DATABASE
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
   STATE — POINT
========================================================== */

let pointLoaded =
  false;


let pointPage =
  1;


let pointTotalPages =
  1;


let pointSearchTimer =
  null;


/* ==========================================================
   HELPER
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
    String(value).trim() === ''
  ) {

    return '-';

  }


  return escapeHtml(
    value
  );

}


/* ==========================================================
   NUMBER
========================================================== */

function safeNumber(
  value
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(number)
    ? number
    : 0;

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
      word =>
        word.charAt(0)
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
   DASHBOARD
========================================================== */

async function loadDashboard() {

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
          method: 'GET',
          cache: 'no-store'
        }

      );


    let result = {};


    try {

      result =
        await response.json();

    }

    catch {

      throw new Error(
        'Dashboard response tidak valid.'
      );

    }


    if (
      result.loginUrl
    ) {

      loginUrl =
        result.loginUrl;

    }


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
    heroUserName
  ) {

    heroUserName.textContent =
      name;

  }


  if (
    avatar
  ) {

    avatar.textContent =
      getInitials(
        name
      );

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


  renderRank(
    progress
  );


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

  return safeNumber(

    firstValue(

      progress.totalApproved,

      progress.total_approved,

      progress.sum,

      0

    )

  );

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
   MISSED MONTH
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


  return [

    {
      name: progress.month_1_name,
      value: safeNumber(
        progress.month_1_value
      )
    },

    {
      name: progress.month_2_name,
      value: safeNumber(
        progress.month_2_value
      )
    },

    {
      name: progress.month_3_name,
      value: safeNumber(
        progress.month_3_value
      )
    }

  ]

    .filter(
      month =>
        month.name &&
        month.value < 1
    )

    .map(
      month =>
        month.name
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
  total
) {

  const value =
    safeNumber(
      total
    );


  if (
    value >= 10
  ) {

    return 'MYTHIC GLORY';

  }


  if (
    value >= 7
  ) {

    return 'MYTHIC HONOR';

  }


  if (
    value >= 4
  ) {

    return 'MYTHIC';

  }


  if (
    value === 3
  ) {

    return 'LEGEND';

  }


  if (
    value === 2
  ) {

    return 'EPIC';

  }


  if (
    value === 1
  ) {

    return 'ELITE';

  }


  return 'WARRIOR';

}


/* ==========================================================
   RANK CLASS
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
   RENDER RANK
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


  if (
    rankName
  ) {

    rankName.textContent =
      rank;

  }


  if (
    rankTotal
  ) {

    rankTotal.textContent =
      totalApproved +
      ' SS';

  }


  if (
    rankSymbol
  ) {

    const symbols = {

      WARRIOR: 'W',

      ELITE: 'E',

      EPIC: 'E',

      LEGEND: 'L',

      MYTHIC: 'M',

      'MYTHIC HONOR': 'MH',

      'MYTHIC GLORY': 'MG'

    };


    rankSymbol.textContent =
      symbols[rank] ||
      'W';

  }


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


  if (
    missedMonths
  ) {

    if (
      status !== 'WINNER' &&
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
   RENDER JOURNEY
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
        safeNumber(
          card.dataset.index
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

        'Target konsistensi bulanan terpenuhi.';

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


  if (
    currentCard &&
    window.innerWidth <= 1000
  ) {

    setTimeout(
      function() {

        currentCard.scrollIntoView({

          behavior: 'smooth',

          block: 'nearest',

          inline: 'center'

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


        navItems.forEach(
          nav =>
            nav.classList.remove(
              'active'
            )
        );


        appPages.forEach(
          page =>
            page.classList.remove(
              'active'
            )
        );


        item.classList.add(
          'active'
        );


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


        if (
          pageName === 'database'
        ) {

          initDatabasePage();

        }


        if (
          pageName === 'point'
        ) {

          initPointPage();

        }


        window.scrollTo({

          top: 0,

          behavior: 'smooth'

        });

      }
    );

  }
);


/* ==========================================================
   DATABASE INIT
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
        ? databaseSearch.value.trim()
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
          method: 'GET',
          cache: 'no-store'
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


    databasePage =
      safeNumber(
        pagination.page
      ) || 1;


    databaseTotalPages =
      safeNumber(
        pagination.totalPages
      ) || 1;


    if (
      databaseStatus
    ) {

      databaseStatus.textContent =

        'Menampilkan ' +

        safeNumber(
          pagination.from
        ) +

        '–' +

        safeNumber(
          pagination.to
        ) +

        ' dari ' +

        safeNumber(
          pagination.total
        ) +

        ' data';

    }


    if (
      databasePageInfo
    ) {

      databasePageInfo.textContent =

        'Page ' +

        databasePage +

        ' / ' +

        databaseTotalPages;

    }


    if (
      databasePrev
    ) {

      databasePrev.disabled =
        databasePage <= 1;

    }


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
   RENDER DATABASE
========================================================== */

function renderDatabaseRows(
  rows
) {

  if (
    databaseTableBody
  ) {

    databaseTableBody.innerHTML =
      '';

  }


  if (
    databaseMobile
  ) {

    databaseMobile.innerHTML =
      '';

  }


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


      if (
        databaseMobile
      ) {

        const card =
          document.createElement(
            'article'
          );


        card.className =
          'database-mobile-card';


        card.innerHTML = `

          <div class="database-mobile-card-head">

            <div>

              <div class="database-mobile-id">

                SS #${safeText(row.ss_id)}

              </div>

              <div class="database-mobile-name">

                ${safeText(row.employee_name)}

              </div>

              <div class="database-mobile-dept">

                ${safeText(row.department)}

              </div>

            </div>

          </div>


          <div class="database-mobile-info">

            ${mobileInfo(
              'Jenis SS',
              row.ss_type
            )}

            ${mobileInfo(
              'Superior',
              row.superior_name
            )}

            ${mobileInfo(
              'Status Admin',
              row.status_admin
            )}

            ${mobileInfo(
              'Status Superior',
              row.status_superior
            )}

            ${mobileInfo(
              'Implementasi',
              row.status_implementasi
            )}

            ${mobileInfo(
              'Create Time',
              formatDateTimeDatabase(
                row.created_time
              )
            )}

            ${mobileInfo(
              'Lokasi',
              row.work_location
            )}

            ${mobileInfo(
              'Month',
              row.month_no
            )}

            ${mobileInfo(
              'Validasi',
              row.validation_month
            )}

            ${mobileInfo(
              'Tgl Implementasi',
              formatImplementationDate(
                row.implementation_date
              )
            )}

            ${mobileInfo(
              'Kualifikasi',
              row.qualification
            )}

            ${mobileInfo(
              'Point',
              formatPointDatabase(
                row.point
              )
            )}

            ${mobileInfo(
              'Point Approval',
              formatPointDatabase(
                row.point_approval
              )
            )}

          </div>

        `;


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

  return `

    <div>

      <small>
        ${escapeHtml(label)}
      </small>

      <strong>
        ${safeText(value)}
      </strong>

    </div>

  `;

}


/* ==========================================================
   POINT FORMAT
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
    Number.isNaN(number)
  ) {

    return value;

  }


  return number.toLocaleString(
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

    String(
      Number(match[3])
    )
      .padStart(
        2,
        '0'
      ) +

    ' ' +

    months[
      Number(match[2])
    ] +

    ' ' +

    Number(match[1])

  );

}


/* ==========================================================
   DATETIME
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

  catch {

    return String(
      value
    );

  }

}


/* ==========================================================
   STATUS CLASS
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

    status === 'QUALIFIED' ||

    status === 'WINNER'

  ) {

    return 'db-status-success';

  }


  if (

    status === 'NOT APPROVED' ||

    status === 'NOT OK' ||

    status === 'FAILED' ||

    status === 'LOSE' ||

    status === 'LOSER' ||

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
   DATABASE PREV
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
   DATABASE NEXT
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
   DATABASE EXPORT
========================================================== */

if (
  databaseExport
) {

  databaseExport.addEventListener(
    'click',
    function() {

      const search =
        databaseSearch
          ? databaseSearch.value.trim()
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
        DATABASE_EXPORT_API;


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
   POINT INIT
========================================================== */

function initPointPage() {

  if (
    pointLoaded
  ) {

    return;

  }


  pointLoaded =
    true;


  pointPage =
    1;


  loadPoint();

}


/* ==========================================================
   LOAD POINT
========================================================== */

async function loadPoint() {

  try {

    if (
      pointStatus
    ) {

      pointStatus.textContent =
        'Loading leaderboard...';

    }


    const search =
      pointSearch
        ? pointSearch.value.trim()
        : '';


    const limit =
      pointLimit
        ? pointLimit.value
        : '50';


    const params =
      new URLSearchParams();


    params.set(
      'page',
      pointPage
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

        POINT_API +
        '?' +
        params.toString(),

        {
          method: 'GET',
          cache: 'no-store'
        }

      );


    let result = {};


    try {

      result =
        await response.json();

    }

    catch {

      throw new Error(
        'Response Point tidak valid.'
      );

    }


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.message ||
        'Point leaderboard gagal dimuat.'
      );

    }


    renderPointSummary(
      result.summary || {}
    );


    renderPointPodium(
      result.podium || []
    );


    renderPointRows(
      result.data || []
    );


    const pagination =
      result.pagination || {};


    pointPage =
      safeNumber(
        pagination.page
      ) || 1;


    pointTotalPages =
      safeNumber(
        pagination.totalPages
      ) || 1;


    if (
      pointStatus
    ) {

      pointStatus.textContent =

        'Menampilkan ' +

        safeNumber(
          pagination.from
        ) +

        '–' +

        safeNumber(
          pagination.to
        ) +

        ' dari ' +

        safeNumber(
          pagination.total
        ) +

        ' peserta';

    }


    if (
      pointPageInfo
    ) {

      pointPageInfo.textContent =

        'Page ' +

        pointPage +

        ' / ' +

        pointTotalPages;

    }


    if (
      pointPrev
    ) {

      pointPrev.disabled =
        pointPage <= 1;

    }


    if (
      pointNext
    ) {

      pointNext.disabled =
        pointPage >=
        pointTotalPages;

    }

  }

  catch(error) {

    console.error(
      'POINT ERROR:',
      error
    );


    if (
      pointStatus
    ) {

      pointStatus.textContent =
        'Leaderboard gagal dimuat.';

    }


    if (
      pointPodium
    ) {

      pointPodium.innerHTML =
        '';

    }


    if (
      pointTableBody
    ) {

      pointTableBody.innerHTML =
        '';

    }


    if (
      pointMobile
    ) {

      pointMobile.innerHTML =
        '';

    }

  }

}


/* ==========================================================
   POINT SUMMARY
========================================================== */

function renderPointSummary(
  summary
) {

  if (
    pointTotal
  ) {

    pointTotal.textContent =
      safeNumber(
        summary.total
      );

  }


  if (
    pointWinner
  ) {

    pointWinner.textContent =
      safeNumber(
        summary.winner
      );

  }


  if (
    pointLose
  ) {

    pointLose.textContent =
      safeNumber(
        summary.lose
      );

  }

}


/* ==========================================================
   POINT PODIUM
========================================================== */

function renderPointPodium(
  rows
) {

  if (
    !pointPodium
  ) {

    return;

  }


  pointPodium.innerHTML =
    '';


  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {

    pointPodium.innerHTML = `

      <div class="point-empty">

        Belum ada peserta Winner.

      </div>

    `;


    return;

  }


  /*
     Visual order:
     Juara 2 | Juara 1 | Juara 3
  */

  const visualOrder =
    [1, 0, 2];


  visualOrder.forEach(
    function(index) {

      const row =
        rows[index];


      if (
        !row
      ) {

        return;

      }


      const position =
        index + 1;


      const icon =

        position === 1

          ? '♛'

          : position === 2

            ? '◆'

            : '▲';


      const card =
        document.createElement(
          'article'
        );


      card.className =
        'podium-card podium-' +
        position;


      card.innerHTML = `

        <div class="podium-crown">
          ${icon}
        </div>


        <div class="podium-position">
          #${position}
        </div>


        <div class="podium-avatar">
          ${escapeHtml(
            getInitials(
              row.employee_name
            )
          )}
        </div>


        <h3>
          ${safeText(
            row.employee_name
          )}
        </h3>


        <p>
          ${safeText(
            row.department
          )}
        </p>


        <div class="podium-score">

          <strong>
            ${safeNumber(
              row.ss_done
            )}
          </strong>

          <span>
            SS DONE
          </span>

        </div>


        <div class="podium-approved">

          ${formatPointDatabase(
            row.point_approved
          )}

          POINT APPROVED

        </div>


        <div class="podium-rank">

          ${safeText(
            row.rank || 'WARRIOR'
          )}

        </div>

      `;


      pointPodium.appendChild(
        card
      );

    }
  );

}


/* ==========================================================
   POINT RENDER ROWS
========================================================== */

function renderPointRows(
  rows
) {

  if (
    pointTableBody
  ) {

    pointTableBody.innerHTML =
      '';

  }


  if (
    pointMobile
  ) {

    pointMobile.innerHTML =
      '';

  }


  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {

    if (
      pointStatus
    ) {

      pointStatus.textContent =
        'Data tidak ditemukan.';

    }


    return;

  }


  /* ========================================================
     MONTH HEADER DYNAMIC
  ======================================================== */

  const monthSource =
    rows.find(
      row =>
        row.month_1_name ||
        row.month_2_name ||
        row.month_3_name
    ) ||
    rows[0];


  if (
    pointMonth1Header
  ) {

    pointMonth1Header.textContent =
      monthSource.month_1_name ||
      'MONTH 1';

  }


  if (
    pointMonth2Header
  ) {

    pointMonth2Header.textContent =
      monthSource.month_2_name ||
      'MONTH 2';

  }


  if (
    pointMonth3Header
  ) {

    pointMonth3Header.textContent =
      monthSource.month_3_name ||
      'MONTH 3';

  }


  rows.forEach(
    function(row) {

      const status =
        normalizePointStatus(
          row.status ||
          row.season_status
        );


      /* ====================================================
         DESKTOP
      ==================================================== */

      if (
        pointTableBody
      ) {

        const tr =
          document.createElement(
            'tr'
          );


        tr.className =

          status === 'WINNER'

            ? 'point-row-winner'

            : 'point-row-lose';


        tr.innerHTML = `

          <td>

            <span class="point-position">

              #${safeNumber(
                row.position
              )}

            </span>

          </td>


          <td>

            <strong>

              ${safeText(
                row.employee_name
              )}

            </strong>

          </td>


          <td>
            ${safeText(
              row.department
            )}
          </td>


          <td>
            ${safeText(
              row.superior_name
            )}
          </td>


          <td>
            ${safeText(
              row.work_location
            )}
          </td>


          <td class="point-main-score">

            ${safeNumber(
              row.ss_done
            )}

          </td>


          <td>

            ${formatPointDatabase(
              row.point
            )}

          </td>


          <td class="point-approved-score">

            ${formatPointDatabase(
              row.point_approved
            )}

          </td>


          <td>

            ${safeNumber(
              row.ss_submit
            )}

          </td>


          <td>

            ${safeNumber(
              row.month_1_value
            )}

          </td>


          <td>

            ${safeNumber(
              row.month_2_value
            )}

          </td>


          <td>

            ${safeNumber(
              row.month_3_value
            )}

          </td>


          <td>

            <span class="point-status-badge ${
              status === 'WINNER'
                ? 'winner'
                : 'lose'
            }">

              ${escapeHtml(
                status
              )}

            </span>

          </td>


          <td>

            ${safeNumber(
              firstValue(
                row.sum,
                row.total_approved,
                0
              )
            )}

          </td>


          <td>

            <span class="point-rank-badge">

              ${safeText(
                row.rank ||
                'WARRIOR'
              )}

            </span>

          </td>

        `;


        pointTableBody.appendChild(
          tr
        );

      }


      /* ====================================================
         MOBILE
      ==================================================== */

      if (
        pointMobile
      ) {

        const card =
          document.createElement(
            'article'
          );


        card.className =
          'point-mobile-card';


        card.innerHTML = `

          <div class="point-mobile-head">

            <span class="point-position">

              #${safeNumber(
                row.position
              )}

            </span>


            <span class="point-status-badge ${
              status === 'WINNER'
                ? 'winner'
                : 'lose'
            }">

              ${escapeHtml(
                status
              )}

            </span>

          </div>


          <h3>

            ${safeText(
              row.employee_name
            )}

          </h3>


          <p>

            ${safeText(
              row.department
            )}

          </p>


          <div class="point-mobile-score">


            <div>

              <strong>
                ${safeNumber(
                  row.ss_done
                )}
              </strong>

              <span>
                SS DONE
              </span>

            </div>


            <div>

              <strong>
                ${formatPointDatabase(
                  row.point_approved
                )}
              </strong>

              <span>
                APPROVED
              </span>

            </div>


            <div>

              <strong>
                ${formatPointDatabase(
                  row.point
                )}
              </strong>

              <span>
                POINT
              </span>

            </div>


          </div>


          <div class="point-mobile-bottom">

            <span>

              ${safeText(
                row.work_location
              )}

            </span>

            <strong>

              ${safeText(
                row.rank ||
                'WARRIOR'
              )}

            </strong>

          </div>

        `;


        pointMobile.appendChild(
          card
        );

      }

    }
  );

}


/* ==========================================================
   NORMALIZE POINT STATUS
========================================================== */

function normalizePointStatus(
  value
) {

  const status =
    String(
      value || ''
    )
      .trim()
      .toUpperCase();


  if (
    status === 'WINNER'
  ) {

    return 'WINNER';

  }


  if (

    status === 'FAILED' ||

    status === 'LOSER' ||

    status === 'LOSE'

  ) {

    return 'LOSE';

  }


  return status ||
    'LOSE';

}


/* ==========================================================
   POINT SEARCH
========================================================== */

if (
  pointSearch
) {

  pointSearch.addEventListener(
    'input',
    function() {

      clearTimeout(
        pointSearchTimer
      );


      pointSearchTimer =
        setTimeout(
          function() {

            pointPage =
              1;


            loadPoint();

          },
          400
        );

    }
  );

}


/* ==========================================================
   POINT LIMIT
========================================================== */

if (
  pointLimit
) {

  pointLimit.addEventListener(
    'change',
    function() {

      pointPage =
        1;


      loadPoint();

    }
  );

}


/* ==========================================================
   POINT PREV
========================================================== */

if (
  pointPrev
) {

  pointPrev.addEventListener(
    'click',
    function() {

      if (
        pointPage > 1
      ) {

        pointPage--;


        loadPoint();

      }

    }
  );

}


/* ==========================================================
   POINT NEXT
========================================================== */

if (
  pointNext
) {

  pointNext.addEventListener(
    'click',
    function() {

      if (
        pointPage <
        pointTotalPages
      ) {

        pointPage++;


        loadPoint();

      }

    }
  );

}


/* ==========================================================
   POINT EXPORT
========================================================== */

if (
  pointExport
) {

  pointExport.addEventListener(
    'click',
    function() {

      const search =
        pointSearch
          ? pointSearch.value.trim()
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
        POINT_EXPORT_API;


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
   LOGOUT
========================================================== */

if (
  logoutButton
) {

  logoutButton.addEventListener(
    'click',
    function() {

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
   MUSIC PLAY
========================================================== */

async function playMusic() {

  if (
    !bgMusic
  ) {

    return;

  }


  try {

    bgMusic.volume =
      0.30;


    await bgMusic.play();


    if (
      musicButton
    ) {

      musicButton.textContent =
        'II';

    }

  }

  catch {

    /* autoplay blocked */

  }

}


/* ==========================================================
   MUSIC PAUSE
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
   MUSIC AUTOSTART
========================================================== */

async function tryStartMusic() {

  if (
    !bgMusic
  ) {

    return;

  }


  try {

    bgMusic.volume =
      0.30;


    await bgMusic.play();


    if (
      musicButton
    ) {

      musicButton.textContent =
        'II';

    }

  }

  catch {

    document.addEventListener(
      'pointerdown',
      async function() {

        await playMusic();

      },
      {
        once: true
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

  window
    .matchMedia(
      '(hover:hover) and (pointer:fine)'
    )
    .matches

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
          x - 0.5
        ) *
        7;


      const moveY =
        (
          y - 0.5
        ) *
        4;


      storyContent
        .style
        .transform =

        `translate3d(
          ${moveX}px,
          ${moveY}px,
          0
        )`;

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
        threshold: 0.12
      }
    );


  observer.observe(
    journeySection
  );

}


/* ==========================================================
   START
========================================================== */

loadDashboard();
