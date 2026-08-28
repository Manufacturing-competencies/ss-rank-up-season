/* ==========================================================
   SS RANK UP SEASON
   FINAL APP.JS
========================================================== */


/* ==========================================================
   SESSION
========================================================== */

const query =
  new URLSearchParams(
    window.location.search
  );


let sessionToken =
  query.get('session') ||
  localStorage.getItem(
    'ss_rank_session'
  );


let loginUrl =
  null;


if (
  query.get('session')
) {

  localStorage.setItem(
    'ss_rank_session',
    query.get('session')
  );


  sessionToken =
    query.get('session');


  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );

}


/* ==========================================================
   ELEMENTS
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


const seasonState =
  document.getElementById(
    'seasonState'
  );


const rankSymbol =
  document.getElementById(
    'rankSymbol'
  );


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


/* JOURNEY */

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
   LOAD DASHBOARD
========================================================== */

async function loadDashboard() {

  try {

    if (
      !sessionToken
    ) {

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
          cache:
            'no-store'
        }

      );


    const result =
      await response.json();


    if (
      result.loginUrl
    ) {

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


    renderDashboard(
      result
    );


    tryStartMusic();


  }

  catch(error) {

    console.error(
      'LOAD DASHBOARD ERROR',
      error
    );


    localStorage.removeItem(
      'ss_rank_session'
    );


    sessionToken =
      null;


    if (
      loginUrl
    ) {

      window.location.href =
        loginUrl;

      return;

    }


    showSessionError();

  }

}


/* ==========================================================
   DASHBOARD
========================================================== */

function renderDashboard(
  data
) {

  const user =
    data.user || {};


  const season =
    data.season || {};


  const progress =
    data.progress || {};


  loginUrl =
    data.loginUrl ||
    loginUrl;


  const name =
    user.name ||
    'USER';


  const role =
    user.role ||
    'USER';


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
      String(role)
        .toUpperCase();

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
      progress.department ||
      user.department ||
      '-';

  }


  if (
    locationText
  ) {

    locationText.textContent =
      progress.location ||
      user.location ||
      '-';

  }


  if (
    seasonState
  ) {

    seasonState.textContent =

      season.active === false

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
   RENDER HERO RANK
========================================================== */

function renderRank(
  progress
) {

  const totalApproved =
    Number(
      progress.totalApproved ||
      0
    );


  const rank =
    normalizeRank(
      progress.rank ||
      calculateRankFromTotal(
        totalApproved
      )
    );


  const status =
    String(
      progress.status ||
      'FAILED'
    )
      .trim()
      .toUpperCase();


  const missed =
    Array.isArray(
      progress.missedMonths
    )

      ? progress.missedMonths

      : [];


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


  /*
   Symbol isi biasa tetap ada
   sebagai fallback.

   CSS akan membuat bentuk
   simbol sebenarnya.
  */

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

function renderJourney(
  progress
) {

  if (
    !journeyTrack
  ) {

    return;

  }


  const totalApproved =
    Number(
      progress.totalApproved ||
      0
    );


  const currentRank =
    normalizeRank(

      progress.rank ||

      calculateRankFromTotal(
        totalApproved
      )

    );


  const status =
    String(
      progress.status ||
      'FAILED'
    )
      .trim()
      .toUpperCase();


  const missed =
    Array.isArray(
      progress.missedMonths
    )

      ? progress.missedMonths

      : [];


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
    journeyTrack
      .querySelectorAll(
        '.journey-card'
      );


  let currentCard =
    null;


  cards.forEach(

    function(card) {

      const cardIndex =
        Number(
          card.dataset.index ||
          0
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
      status ===
      'WINNER'
    ) {

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
        escapeHtml(
          missedText
        ) +
        '</b>.';

    }

  }


  /*
   Di mobile auto fokus
   ke rank saat ini.

   Delay kecil supaya browser
   selesai render dulu.
  */

  if (
    currentCard &&
    window.innerWidth <=
    1000
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
   RANK HELPERS
========================================================== */

function normalizeRank(
  value
) {

  const rank =
    String(
      value ||
      'WARRIOR'
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


  return valid.includes(
    rank
  )

    ? rank

    : 'WARRIOR';

}


/* ==========================================================
   TOTAL → RANK

   0     WARRIOR
   1     ELITE
   2     EPIC
   3     LEGEND
   4-6   MYTHIC
   7-9   MYTHIC HONOR
   >=10  MYTHIC GLORY
========================================================== */

function calculateRankFromTotal(
  totalApproved
) {

  const total =
    Number(
      totalApproved ||
      0
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
   RANK CLASS
========================================================== */

function getRankClass(
  rank
) {

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

function getInitials(
  name
) {

  return String(
    name ||
    ''
  )

    .trim()

    .split(/\s+/)

    .slice(0,2)

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
   ESCAPE HTML
========================================================== */

function escapeHtml(
  value
) {

  return String(
    value ||
    ''
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
   LOGIN REDIRECT
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


    if (
      data.loginUrl
    ) {

      window.location.href =
        data.loginUrl;

      return;

    }

  }

  catch(error) {

    console.error(
      error
    );

  }


  showSessionError();

}


/* ==========================================================
   SESSION ERROR
========================================================== */

function showSessionError() {

  if (
    headerUserName
  ) {

    headerUserName.textContent =
      'SESSION ENDED';

  }


  if (
    headerUserRole
  ) {

    headerUserRole.textContent =
      'LOGIN REQUIRED';

  }


  if (
    heroUserName
  ) {

    heroUserName.textContent =
      'PLEASE LOGIN AGAIN';

  }


  if (
    rankName
  ) {

    rankName.textContent =
      '-';

  }


  if (
    rankTotal
  ) {

    rankTotal.textContent =
      '';

  }


  if (
    seasonStatus
  ) {

    seasonStatus.textContent =
      '';

  }

}


/* ==========================================================
   LOGOUT
========================================================== */

if (
  logoutButton
) {

  logoutButton
    .addEventListener(

      'click',

      function() {

        localStorage.removeItem(
          'ss_rank_session'
        );


        sessionToken =
          null;


        if (
          loginUrl
        ) {

          window.location.href =
            loginUrl;

          return;

        }


        window.location.href =
          '/';

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
     Autoplay may be blocked.
    */

  }

}


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
     Browser blocked autoplay.

     Play on first interaction.
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


if (
  musicButton
) {

  musicButton
    .addEventListener(

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
   STORY PARALLAX DESKTOP
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

              journeySection.classList.add(
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
   START
========================================================== */

loadDashboard();
