/* ==========================================================
   SS RANK UP SEASON
   APP.JS — FINAL CLEAN VERSION
========================================================== */


/* ==========================================================
   SESSION
========================================================== */

const query = new URLSearchParams(
  window.location.search
);

let sessionToken =
  query.get('session') ||
  localStorage.getItem('ss_rank_session');

let loginUrl = null;


/*
  Jika datang dari Apps Script:
  ?session=xxxxx

  Simpan token lalu bersihkan URL.
*/

if (query.get('session')) {

  sessionToken =
    query.get('session');

  localStorage.setItem(
    'ss_rank_session',
    sessionToken
  );

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );

}


/* ==========================================================
   MAIN ELEMENTS
========================================================== */

const headerUserName =
  document.getElementById('headerUserName');

const headerUserRole =
  document.getElementById('headerUserRole');

const heroUserName =
  document.getElementById('heroUserName');

const avatar =
  document.getElementById('avatar');

const departmentText =
  document.getElementById('departmentText');

const locationText =
  document.getElementById('locationText');

const rankPanel =
  document.getElementById('rankPanel');

const rankName =
  document.getElementById('rankName');

const rankTotal =
  document.getElementById('rankTotal');

const seasonStatus =
  document.getElementById('seasonStatus');

const missedMonths =
  document.getElementById('missedMonths');

const seasonState =
  document.getElementById('seasonState');

const rankSymbol =
  document.getElementById('rankSymbol');

const logoutButton =
  document.getElementById('logoutButton');

const musicButton =
  document.getElementById('musicButton');

const bgMusic =
  document.getElementById('bgMusic');


/* ==========================================================
   JOURNEY ELEMENTS
========================================================== */

const journeySummary =
  document.getElementById('journeySummary');

const journeyTrack =
  document.getElementById('journeyTrack');

const journeyNote =
  document.getElementById('journeyNote');

const journeySection =
  document.getElementById(
    'rankJourneySection'
  );


/* ==========================================================
   GENERIC VALUE HELPER
========================================================== */

function firstValue(...values) {

  for (const value of values) {

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
   LOAD DASHBOARD
========================================================== */

async function loadDashboard() {

  try {

    if (!sessionToken) {

      await redirectToLogin();

      return;

    }


    const response =
      await fetch(

        '/api/dashboard?session=' +
        encodeURIComponent(
          sessionToken
        ),

        {
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


    if (result.loginUrl) {

      loginUrl =
        result.loginUrl;

    }


    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.message ||
        'Session invalid.'
      );

    }


    renderDashboard(result);

    tryStartMusic();


  }

  catch(error) {

    console.error(
      'LOAD DASHBOARD ERROR:',
      error
    );


    localStorage.removeItem(
      'ss_rank_session'
    );

    sessionToken = null;


    if (loginUrl) {

      window.location.href =
        loginUrl;

      return;

    }


    showSessionError();

  }

}


/* ==========================================================
   RENDER DASHBOARD

   Dibuat fleksibel terhadap:
   name
   user_name
   employee_name

   Jadi tidak lagi mudah fallback USER.
========================================================== */

function renderDashboard(data) {

  const user =
    data.user || {};

  const session =
    data.session || {};

  const season =
    data.season || {};

  const progress =
    data.progress || {};


  loginUrl =
    data.loginUrl ||
    loginUrl;


  /* ========================================================
     USER NAME

     PRIORITAS:
     user.name
     user.user_name
     user.employee_name
     session.user_name
     data.user_name
     progress.employee_name
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

    ).trim();


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

    ).trim();


  /* ========================================================
     DEPARTMENT
  ======================================================== */

  const department =
    String(

      firstValue(

        progress.department,

        progress.department_name,

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

        progress.location,

        progress.work_location,

        user.location,

        user.work_location,

        session.location,

        data.location,

        '-'

      )

    ).trim();


  /* ========================================================
     HEADER
  ======================================================== */

  if (headerUserName) {

    headerUserName.textContent =
      name;

  }


  if (headerUserRole) {

    headerUserRole.textContent =
      role.toUpperCase();

  }


  /* ========================================================
     HERO
  ======================================================== */

  if (heroUserName) {

    heroUserName.textContent =
      name.toUpperCase();

  }


  if (avatar) {

    avatar.textContent =
      getInitials(name);

  }


  if (departmentText) {

    departmentText.textContent =
      department;

  }


  if (locationText) {

    locationText.textContent =
      location;

  }


  /* ========================================================
     SEASON
  ======================================================== */

  if (seasonState) {

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


  renderRank(progress);

  renderJourney(progress);

}


/* ==========================================================
   PROGRESS HELPERS
========================================================== */

function getTotalApproved(progress) {

  return Number(

    firstValue(

      progress.totalApproved,

      progress.total_approved,

      progress.sum,

      0

    )

  ) || 0;

}


function getProgressStatus(progress) {

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


function getMissedMonths(progress) {

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


  /*
    Kalau API tidak mengirim missedMonths,
    hitung sendiri dari 3 bulan.
  */

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

    .filter(function(month) {

      return (
        month.name &&
        month.value < 1
      );

    })

    .map(function(month) {

      return month.name;

    });

}


/* ==========================================================
   RENDER HERO RANK
========================================================== */

function renderRank(progress) {

  const totalApproved =
    getTotalApproved(progress);


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
    getProgressStatus(progress);


  const missed =
    getMissedMonths(progress);


  /* ========================================================
     RANK CLASS
  ======================================================== */

  if (rankPanel) {

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
      getRankClass(rank)
    );

  }


  /* ========================================================
     RANK NAME
  ======================================================== */

  if (rankName) {

    rankName.textContent =
      rank;

  }


  /* ========================================================
     TOTAL SS
  ======================================================== */

  if (rankTotal) {

    rankTotal.textContent =
      totalApproved +
      ' SS';

  }


  /* ========================================================
     SYMBOL
  ======================================================== */

  if (rankSymbol) {

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
     WINNER / FAILED
  ======================================================== */

  if (seasonStatus) {

    seasonStatus.classList.remove(
      'winner',
      'failed'
    );


    if (status === 'WINNER') {

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
     MISSED MONTH
  ======================================================== */

  if (missedMonths) {

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
   RENDER JOURNEY
========================================================== */

function renderJourney(progress) {

  if (!journeyTrack) {

    return;

  }


  const totalApproved =
    getTotalApproved(progress);


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
    getProgressStatus(progress);


  const missed =
    getMissedMonths(progress);


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


  if (currentIndex < 0) {

    currentIndex = 0;

  }


  const cards =
    journeyTrack.querySelectorAll(
      '.journey-card'
    );


  let currentCard =
    null;


  cards.forEach(function(card) {

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


    /* ALREADY PASSED */

    if (
      cardIndex <
      currentIndex
    ) {

      card.classList.add(
        'achieved'
      );


      if (state) {

        state.textContent =
          'UNLOCKED';

      }

    }


    /* CURRENT */

    else if (
      cardIndex ===
      currentIndex
    ) {

      card.classList.add(
        'current'
      );


      currentCard =
        card;


      if (state) {

        state.textContent =
          'CURRENT';

      }

    }


    /* LOCKED */

    else {

      card.classList.add(
        'locked'
      );


      if (state) {

        state.textContent =
          'LOCKED';

      }

    }

  });


  /* ========================================================
     SUMMARY
  ======================================================== */

  if (journeySummary) {

    journeySummary.innerHTML =

      '<b>Current Rank:</b>&nbsp;' +

      escapeHtml(currentRank) +

      '&nbsp;&nbsp; • &nbsp;&nbsp;' +

      '<b>Total Approved:</b>&nbsp;' +

      totalApproved +

      ' SS' +

      '&nbsp;&nbsp; • &nbsp;&nbsp;' +

      '<b>Season:</b>&nbsp;' +

      escapeHtml(status);

  }


  /* ========================================================
     NOTE
  ======================================================== */

  if (journeyNote) {

    if (status === 'WINNER') {

      journeyNote.innerHTML =

        'Season Status: ' +

        '<span class="winner">' +
        'WINNER' +
        '</span>. ' +

        'Kamu berhasil menjaga minimal ' +

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

        'Rank tetap mengikuti total ' +
        'Approved Implementasi, tetapi ' +
        'season dianggap tidak complete ' +
        'karena bulan yang terlewat: ' +

        '<b>' +
        escapeHtml(missedText) +
        '</b>.';

    }

  }


  /* ========================================================
     MOBILE AUTO FOCUS
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
   NORMALIZE RANK
========================================================== */

function normalizeRank(value) {

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


  const valid = [

    'WARRIOR',
    'ELITE',
    'EPIC',
    'LEGEND',
    'MYTHIC',
    'MYTHIC HONOR',
    'MYTHIC GLORY'

  ];


  return valid.includes(rank)

    ? rank

    : 'WARRIOR';

}


/* ==========================================================
   TOTAL APPROVED → RANK

   0      WARRIOR
   1      ELITE
   2      EPIC
   3      LEGEND
   4-6    MYTHIC
   7-9    MYTHIC HONOR
   >=10   MYTHIC GLORY
========================================================== */

function calculateRankFromTotal(
  totalApproved
) {

  const total =
    Number(
      totalApproved || 0
    );


  if (total >= 10) {

    return 'MYTHIC GLORY';

  }


  if (total >= 7) {

    return 'MYTHIC HONOR';

  }


  if (total >= 4) {

    return 'MYTHIC';

  }


  if (total === 3) {

    return 'LEGEND';

  }


  if (total === 2) {

    return 'EPIC';

  }


  if (total === 1) {

    return 'ELITE';

  }


  return 'WARRIOR';

}


/* ==========================================================
   RANK CLASS
========================================================== */

function getRankClass(rank) {

  const classMap = {

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
    classMap[rank] ||
    'rank-warrior'
  );

}


/* ==========================================================
   INITIALS
========================================================== */

function getInitials(name) {

  return String(name || '')

    .trim()

    .split(/\s+/)

    .slice(0, 2)

    .map(function(word) {

      return word.charAt(0);

    })

    .join('')

    .toUpperCase();

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHtml(value) {

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
   REDIRECT LOGIN
========================================================== */

async function redirectToLogin() {

  try {

    const response =
      await fetch(

        '/api/dashboard',

        {
          cache:
            'no-store'
        }

      );


    const data =
      await response.json();


    if (data.loginUrl) {

      window.location.href =
        data.loginUrl;

      return;

    }

  }

  catch(error) {

    console.error(
      'LOGIN REDIRECT ERROR:',
      error
    );

  }


  showSessionError();

}


/* ==========================================================
   SESSION ERROR
========================================================== */

function showSessionError() {

  if (headerUserName) {

    headerUserName.textContent =
      'SESSION ENDED';

  }


  if (headerUserRole) {

    headerUserRole.textContent =
      'LOGIN REQUIRED';

  }


  if (heroUserName) {

    heroUserName.textContent =
      'PLEASE LOGIN AGAIN';

  }


  if (avatar) {

    avatar.textContent =
      '--';

  }


  if (departmentText) {

    departmentText.textContent =
      '-';

  }


  if (locationText) {

    locationText.textContent =
      '-';

  }


  if (rankName) {

    rankName.textContent =
      '-';

  }


  if (rankTotal) {

    rankTotal.textContent =
      '';

  }


  if (seasonStatus) {

    seasonStatus.textContent =
      '';

  }

}


/* ==========================================================
   LOGOUT
========================================================== */

if (logoutButton) {

  logoutButton.addEventListener(

    'click',

    function() {

      localStorage.removeItem(
        'ss_rank_session'
      );


      sessionToken = null;


      if (loginUrl) {

        window.location.href =
          loginUrl;

        return;

      }


      redirectToLogin();

    }

  );

}


/* ==========================================================
   MUSIC
========================================================== */

async function playMusic() {

  if (!bgMusic) {

    return;

  }


  try {

    bgMusic.volume = .30;

    await bgMusic.play();


    if (musicButton) {

      musicButton.textContent =
        'II';

    }

  }

  catch(error) {

    console.log(
      'Music autoplay blocked.'
    );

  }

}


function pauseMusic() {

  if (!bgMusic) {

    return;

  }


  bgMusic.pause();


  if (musicButton) {

    musicButton.textContent =
      '▶';

  }

}


async function tryStartMusic() {

  if (!bgMusic) {

    return;

  }


  try {

    bgMusic.volume = .30;

    await bgMusic.play();


    if (musicButton) {

      musicButton.textContent =
        'II';

    }

  }

  catch(error) {

    const activateMusic =
      async function() {

        await playMusic();

      };


    document.addEventListener(
      'pointerdown',
      activateMusic,
      {
        once: true
      }
    );

  }

}


if (musicButton) {

  musicButton.addEventListener(

    'click',

    async function() {

      if (!bgMusic) {

        return;

      }


      if (bgMusic.paused) {

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
        (x - .5) * 7;


      const moveY =
        (y - .5) * 4;


      storyContent.style.transform =

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

      storyContent.style.transform =
        'translate3d(0,0,0)';

    }

  );

}


/* ==========================================================
   JOURNEY REVEAL
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
                .classList.add(
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
   APP PAGE NAVIGATION
========================================================== */

const navItems =
  document.querySelectorAll(
    '.nav-item'
  );

const appPages =
  document.querySelectorAll(
    '.app-page'
  );


navItems.forEach(function(item) {

  item.addEventListener(

    'click',

    function() {

      const page =
        item.dataset.page;


      navItems.forEach(
        function(nav) {

          nav.classList.remove(
            'active'
          );

        }
      );


      appPages.forEach(
        function(section) {

          section.classList.remove(
            'active'
          );

        }
      );


      item.classList.add(
        'active'
      );


      const target =
        document.getElementById(
          'page-' + page
        );


      if (target) {

        target.classList.add(
          'active'
        );

      }


      /*
        DATABASE hanya load ketika dibuka.
      */

      if (
        page === 'database'
      ) {

        initDatabasePage();

      }


      window.scrollTo({

        top: 0,

        behavior:
          'smooth'

      });

    }

  );

});


/* ==========================================================
   DATABASE STATE
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
   DATABASE ELEMENTS
========================================================== */

const databaseSearch =
  document.getElementById(
    'databaseSearch'
  );

const databaseLimit =
  document.getElementById(
    'databaseLimit'
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
   INIT DATABASE
========================================================== */

function initDatabasePage() {

  if (databaseLoaded) {

    return;

  }


  databaseLoaded = true;

  loadDatabase();

}


/* ==========================================================
   LOAD DATABASE
========================================================== */

async function loadDatabase() {

  try {

    if (databaseStatus) {

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


    if (search) {

      params.set(
        'search',
        search
      );

    }


    const response =
      await fetch(

        '/api/ss-database?' +
        params.toString(),

        {
          cache:
            'no-store'
        }

      );


    const result =
      await response.json();


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
      pagination.totalPages || 1;


    if (databaseStatus) {

      databaseStatus.textContent =

        'Menampilkan ' +

        (pagination.from || 0) +

        '–' +

        (pagination.to || 0) +

        ' dari ' +

        (pagination.total || 0) +

        ' data';

    }


    if (databasePageInfo) {

      databasePageInfo.textContent =

        'Page ' +

        databasePage +

        ' / ' +

        databaseTotalPages;

    }


    if (databasePrev) {

      databasePrev.disabled =
        databasePage <= 1;

    }


    if (databaseNext) {

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


    if (databaseStatus) {

      databaseStatus.textContent =
        'Database gagal dimuat.';

    }

  }

}


/* ==========================================================
   RENDER DATABASE
========================================================== */

function renderDatabaseRows(rows) {

  if (databaseTableBody) {

    databaseTableBody.innerHTML =
      '';

  }


  if (databaseMobile) {

    databaseMobile.innerHTML =
      '';

  }


  if (
    !rows ||
    !rows.length
  ) {

    if (databaseStatus) {

      databaseStatus.textContent =
        'Data tidak ditemukan.';

    }

    return;

  }


  rows.forEach(function(row) {


    /* ======================================================
       DESKTOP
    ====================================================== */

    if (databaseTableBody) {

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
        .appendChild(tr);

    }


    /* ======================================================
       MOBILE
    ====================================================== */

    if (databaseMobile) {

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
            'Tanggal Implementasi',
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
        .appendChild(card);

    }

  });

}


/* ==========================================================
   DATABASE TABLE CELL
========================================================== */

function tableCell(
  value,
  className = ''
) {

  const cssClass =
    className

      ? ` class="${className}"`

      : '';


  return (

    `<td${cssClass}>` +

      safeText(value) +

    '</td>'

  );

}


/* ==========================================================
   POINT FORMAT
========================================================== */

function formatPointDatabase(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {

    return '-';

  }


  const number =
    Number(value);


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

function formatImplementationDate(value) {

  if (
    !value ||
    value === 'null'
  ) {

    return '-';

  }


  const match =
    String(value).match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );


  if (!match) {

    return String(value);

  }


  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);


  const monthNames = [

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

    monthNames[month] +

    ' ' +

    year

  );

}


/* ==========================================================
   CREATE TIME
========================================================== */

function formatDateTimeDatabase(value) {

  if (
    !value ||
    value === 'null'
  ) {

    return '-';

  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return String(value);

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
      .format(date)
      .replace(
        ',',
        ' •'
      );

  }

  catch {

    return String(value);

  }

}


/* ==========================================================
   DATABASE STATUS CLASS
========================================================== */

function getStatusClass(value) {

  const status =
    String(value || '')
      .trim()
      .toUpperCase();


  if (
    status === 'APPROVED' ||
    status === 'DONE' ||
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
   DATABASE SAFE TEXT
========================================================== */

function safeText(value) {

  return escapeHtml(

    value === null ||
    value === undefined ||
    value === ''

      ? '-'

      : String(value)

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

        escapeHtml(label) +

      '</small>' +

      '<strong>' +

        safeText(value) +

      '</strong>' +

    '</div>'

  );

}


/* ==========================================================
   DATABASE SEARCH
========================================================== */

if (databaseSearch) {

  databaseSearch.addEventListener(

    'input',

    function() {

      clearTimeout(
        databaseSearchTimer
      );


      databaseSearchTimer =
        setTimeout(

          function() {

            databasePage = 1;

            loadDatabase();

          },

          400

        );

    }

  );

}


/* ==========================================================
   DATABASE LIMIT
========================================================== */

if (databaseLimit) {

  databaseLimit.addEventListener(

    'change',

    function() {

      databasePage = 1;

      loadDatabase();

    }

  );

}


/* ==========================================================
   DATABASE PREVIOUS
========================================================== */

if (databasePrev) {

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

if (databaseNext) {

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
   START APP
========================================================== */

loadDashboard();
