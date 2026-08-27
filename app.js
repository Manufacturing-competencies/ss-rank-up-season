/* ==========================================================
   SS RANK UP SEASON
   FINAL FRONTEND
========================================================== */


/* ==========================================================
   QUERY + SESSION
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


const rankSymbol =
  document.getElementById(
    'rankSymbol'
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


  }

  catch (error) {

    console.error(
      'LOAD DASHBOARD ERROR:',
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
    String(
      user.name ||
      'USER'
    ).trim();


  const role =
    String(
      user.role ||
      'USER'
    )
      .trim()
      .toUpperCase();


  /*
   USER HEADER
  */

  if (headerUserName) {

    headerUserName.textContent =
      name;

  }


  if (headerUserRole) {

    headerUserRole.textContent =
      role;

  }


  /*
   HERO
  */

  if (heroUserName) {

    heroUserName.textContent =
      name;

  }


  if (avatar) {

    avatar.textContent =
      getInitials(
        name
      );

  }


  /*
   USER INFO
  */

  if (departmentText) {

    departmentText.textContent =
      progress.department ||
      '-';

  }


  if (locationText) {

    locationText.textContent =
      progress.location ||
      '-';

  }


  /*
   SEASON STATE
  */

  if (seasonState) {

    seasonState.textContent =
      season.active === false
        ? 'SEASON CLOSED'
        : 'SEASON ACTIVE';

  }


  /*
   RANK
  */

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

  if (!rankPanel) {

    return;

  }


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
   VISUAL RANK
  */

  const visual =
    getRankVisual(
      rank
    );


  /*
   Hapus seluruh rank class lama.
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


  /*
   Pasang rank class terbaru.
  */

  rankPanel.classList.add(
    visual.className
  );


  /*
   Symbol di emblem.
  */

  if (rankSymbol) {

    rankSymbol.textContent =
      visual.badge;

  }


  /*
   Nama rank.
  */

  if (rankName) {

    rankName.textContent =
      rank;

  }


  /*
   Total approved implementasi.
  */

  if (rankTotal) {

    rankTotal.textContent =
      totalApproved +
      ' SS';

  }


  /*
   STATUS
  */

  if (seasonStatus) {

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


  /*
   MISSED MONTH
  */

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
   RANK VISUAL CONFIG
========================================================== */

function getRankVisual(
  rank
) {

  const ranks = {


    /* ==========================
       WARRIOR
    ========================== */

    WARRIOR: {

      className:
        'rank-warrior',

      badge:
        'W'

    },


    /* ==========================
       ELITE
    ========================== */

    ELITE: {

      className:
        'rank-elite',

      badge:
        'E'

    },


    /* ==========================
       EPIC
    ========================== */

    EPIC: {

      className:
        'rank-epic',

      badge:
        'EP'

    },


    /* ==========================
       LEGEND
    ========================== */

    LEGEND: {

      className:
        'rank-legend',

      badge:
        'L'

    },


    /* ==========================
       MYTHIC
    ========================== */

    MYTHIC: {

      className:
        'rank-mythic',

      badge:
        'M'

    },


    /* ==========================
       MYTHIC HONOR
    ========================== */

    'MYTHIC HONOR': {

      className:
        'rank-mythic-honor',

      badge:
        'MH'

    },


    /* ==========================
       MYTHIC GLORY
    ========================== */

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

    .filter(Boolean)

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
   REDIRECT TO LOGIN
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

  catch (error) {

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
      '!';

  }


  if (departmentText) {

    departmentText.textContent =
      '';

  }


  if (locationText) {

    locationText.textContent =
      '';

  }


  if (rankName) {

    rankName.textContent =
      '';

  }


  if (rankTotal) {

    rankTotal.textContent =
      '';

  }


  if (seasonStatus) {

    seasonStatus.textContent =
      '';

  }


  if (missedMonths) {

    missedMonths.textContent =
      '';

  }

}


/* ==========================================================
   LOGOUT
========================================================== */

if (logoutButton) {

  logoutButton
    .addEventListener(
      'click',
      async function() {

        /*
         Hapus session browser.
        */

        localStorage.removeItem(
          'ss_rank_session'
        );


        /*
         Optional delete session
         dari Supabase lewat API logout.
        */

        try {

          if (sessionToken) {

            await fetch(

              '/api/logout',

              {

                method:
                  'POST',

                headers: {

                  'Content-Type':
                    'application/json'

                },

                body:
                  JSON.stringify({

                    session:
                      sessionToken

                  })

              }

            );

          }

        }

        catch (error) {

          console.error(
            'LOGOUT API ERROR:',
            error
          );

        }


        sessionToken =
          null;


        /*
         Kembali ke Apps Script login.
        */

        if (loginUrl) {

          window.location.href =
            loginUrl;

          return;

        }


        /*
         Fallback.
        */

        window.location.href =
          '/';

      }
    );

}


/* ==========================================================
   MUSIC
========================================================== */

if (
  musicButton &&
  bgMusic
) {

  musicButton
    .addEventListener(
      'click',
      async function() {

        /*
         PLAY
        */

        if (
          bgMusic.paused
        ) {

          try {

            await bgMusic.play();


            musicButton.textContent =
              'II';

          }

          catch (error) {

            console.error(
              'MUSIC PLAY ERROR:',
              error
            );

          }

        }


        /*
         PAUSE
        */

        else {

          bgMusic.pause();


          musicButton.textContent =
            '▶';

        }

      }
    );

}


/* ==========================================================
   START APP
========================================================== */
/* ==========================================================
   AUTO PLAY MUSIC
========================================================== */

async function tryAutoPlayMusic() {

  if (
    !bgMusic ||
    !musicButton
  ) {

    return;

  }


  bgMusic.volume =
    0.35;


  try {

    await bgMusic.play();


    musicButton.textContent =
      'II';

  }

  catch (error) {

    /*
     Browser biasanya memblokir autoplay
     dengan suara sebelum ada interaksi user.
    */

    musicButton.textContent =
      '▶';


    const startMusicOnFirstInteraction =
      async function() {

        try {

          await bgMusic.play();


          musicButton.textContent =
            'II';

        }

        catch (playError) {

          console.error(
            'MUSIC AUTOPLAY ERROR:',
            playError
          );

        }


        document.removeEventListener(
          'click',
          startMusicOnFirstInteraction
        );


        document.removeEventListener(
          'touchstart',
          startMusicOnFirstInteraction
        );

      };


    document.addEventListener(
      'click',
      startMusicOnFirstInteraction,
      {
        once:
          true
      }
    );


    document.addEventListener(
      'touchstart',
      startMusicOnFirstInteraction,
      {
        once:
          true
      }
    );

  }

}
tryAutoPlayMusic();

loadDashboard();
