/* ==========================================================
   SS RANK UP SEASON
   FINAL FRONTEND
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


/* ==========================================================
   SAVE SESSION
========================================================== */

if (
  query.get('session')
) {

  sessionToken =
    query.get('session');


  localStorage.setItem(
    'ss_rank_session',
    sessionToken
  );


  /*
   Hilangkan token dari address bar.
  */

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


const rankBadgeText =
  document.getElementById(
    'rankBadgeText'
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


  } catch (error) {

    console.error(
      'LOAD DASHBOARD ERROR',
      error
    );


    localStorage.removeItem(
      'ss_rank_session'
    );


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
========================================================== */

function renderDashboard(data) {

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


  headerUserName.textContent =
    name;


  headerUserRole.textContent =
    String(role)
      .toUpperCase();


  heroUserName.textContent =
    name;


  avatar.textContent =
    getInitials(
      name
    );


  departmentText.textContent =
    progress.department ||
    '';


  locationText.textContent =
    progress.location ||
    '';


  /*
   Season state.
  */

  seasonState.textContent =
    season.active === false
      ? 'SEASON CLOSED'
      : 'SEASON ACTIVE';


  renderRank(
    progress
  );

}


/* ==========================================================
   RENDER RANK
========================================================== */

function renderRank(
  progress
) {

  const rank =
    String(
      progress.rank ||
      'WARRIOR'
    )
      .trim()
      .toUpperCase();


  const totalApproved =
    Number(
      progress.totalApproved ||
      0
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


  /*
   Remove rank class lama.
  */

  rankPanel.classList.remove(

    'rank-warrior',

    'rank-elite',

    'rank-epic',

    'rank-legend',

    'rank-mythic',

    'rank-mythic-honor',

    'rank-mythic-glory'

  );


  const visual =
    getRankVisual(
      rank
    );


  rankPanel.classList.add(
    visual.className
  );


  rankBadgeText.textContent =
    visual.badge;


  rankName.textContent =
    rank;


  rankTotal.textContent =
    totalApproved +
    ' SS';


  /*
   STATUS
  */

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


  /*
   MISSED MONTH
  */

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


/* ==========================================================
   RANK VISUAL
========================================================== */

function getRankVisual(rank) {

  const ranks = {

    WARRIOR: {

      className:
        'rank-warrior',

      badge:
        'W'

    },


    ELITE: {

      className:
        'rank-elite',

      badge:
        'E'

    },


    EPIC: {

      className:
        'rank-epic',

      badge:
        'E'

    },


    LEGEND: {

      className:
        'rank-legend',

      badge:
        'L'

    },


    MYTHIC: {

      className:
        'rank-mythic',

      badge:
        'M'

    },


    'MYTHIC HONOR': {

      className:
        'rank-mythic-honor',

      badge:
        'MH'

    },


    'MYTHIC GLORY': {

      className:
        'rank-mythic-glory',

      badge:
        'MG'

    }

  };


  return (
    ranks[rank] ||
    ranks.WARRIOR
  );

}


/* ==========================================================
   INITIALS
========================================================== */

function getInitials(
  name
) {

  return String(
    name || ''
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


  } catch (error) {

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

  headerUserName.textContent =
    'SESSION ENDED';


  headerUserRole.textContent =
    'LOGIN REQUIRED';


  heroUserName.textContent =
    'PLEASE LOGIN AGAIN';


  rankName.textContent =
    '';


  rankTotal.textContent =
    '';


  seasonStatus.textContent =
    '';

}


/* ==========================================================
   LOGOUT
========================================================== */

logoutButton
  .addEventListener(
    'click',
    function() {

      localStorage.removeItem(
        'ss_rank_session'
      );


      sessionToken =
        null;


      if (loginUrl) {

        window.location.href =
          loginUrl;

        return;

      }


      window.location.href =
        '/';

    }
  );


/* ==========================================================
   MUSIC
========================================================== */

musicButton
  .addEventListener(
    'click',
    async function() {

      if (
        bgMusic.paused
      ) {

        try {

          await bgMusic.play();


          musicButton.textContent =
            'II';

        } catch (error) {

          console.error(
            error
          );

        }

      }

      else {

        bgMusic.pause();


        musicButton.textContent =
          '▶';

      }

    }
  );


/* ==========================================================
   START
========================================================== */

loadDashboard();
