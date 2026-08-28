/* ==========================================================
   SS RANK UP SEASON
   FINAL FRONTEND

   FITUR:
   - Session login
   - Dashboard Supabase
   - Rank otomatis
   - 7 rank visual
   - Bulan season dinamis
   - WINNER / FAILED
   - Missed month otomatis
   - Music autoplay attempt
   - Play / pause music
   - Logout
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
   Hilangkan session token dari URL
   setelah berhasil diterima.
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

    /*
     Kalau session belum ada,
     arahkan ke login Apps Script.
    */

    if (!sessionToken) {

      await redirectToLogin();

      return;

    }


    /*
     Ambil data dashboard.
    */

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


    /*
     Simpan URL login.
    */

    if (
      result.loginUrl
    ) {

      loginUrl =
        result.loginUrl;

    }


    /*
     Kalau API gagal.
    */

    if (
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.message ||
        'Session invalid.'
      );

    }


    /*
     Render seluruh dashboard.
    */

    renderDashboard(
      result
    );

  }

  catch (error) {

    console.error(
      'LOAD DASHBOARD ERROR:',
      error
    );


    /*
     Hapus session browser.
    */

    localStorage.removeItem(
      'ss_rank_session'
    );


    sessionToken =
      null;


    /*
     Kembali ke login.
    */

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


  /*
   Simpan login URL.
  */

  loginUrl =
    data.loginUrl ||
    loginUrl;


  /*
   USER DATA
  */

  const name =
    String(
      user.name ||
      'USER'
    )
      .trim();


  const role =
    String(
      user.role ||
      'USER'
    )
      .trim()
      .toUpperCase();


  /*
   HEADER
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
   HERO NAME
  */

  if (heroUserName) {

    heroUserName.textContent =
      name;

  }


  /*
   AVATAR
  */

  if (avatar) {

    avatar.textContent =
      getInitials(
        name
      );

  }


  /*
   DEPARTMENT
  */

  if (departmentText) {

    departmentText.textContent =
      progress.department ||
      '-';

  }


  /*
   LOCATION
  */

  if (locationText) {

    locationText.textContent =
      progress.location ||
      '-';

  }


  /*
   SEASON STATE
  */

  if (seasonState) {

    if (
      season.active === false
    ) {

      seasonState.textContent =
        'SEASON CLOSED';

    }

    else {

      seasonState.textContent =
        'SEASON ACTIVE';

    }

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


  /*
   Rank dari API.
  */

  const rank =
    String(
      progress.rank ||
      'WARRIOR'
    )
      .trim()
      .toUpperCase();


  /*
   Total Approved Implementasi.
  */

  const totalApproved =
    Number(
      progress.totalApproved ||
      0
    );


  /*
   Status season.
  */

  const status =
    String(
      progress.status ||
      'FAILED'
    )
      .trim()
      .toUpperCase();


  /*
   Bulan yang belum achieve.
  */

  const missed =
    Array.isArray(
      progress.missedMonths
    )
      ? progress.missedMonths
      : [];


  /*
   Visual sesuai rank.
  */

  const visual =
    getRankVisual(
      rank
    );


  /*
   Hapus rank class lama.
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
   Pasang class rank baru.
  */

  rankPanel.classList.add(
    visual.className
  );


  /*
   Symbol emblem.
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
   Total SS Approved Implementasi.
  */

  if (rankTotal) {

    rankTotal.textContent =
      totalApproved +
      ' SS';

  }


  /*
   STATUS
  */

  renderSeasonStatus(
    status
  );


  /*
   MISSED MONTHS
  */

  renderMissedMonths(
    status,
    missed
  );

}


/* ==========================================================
   STATUS SEASON
========================================================== */

function renderSeasonStatus(
  status
) {

  if (!seasonStatus) {

    return;

  }


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


/* ==========================================================
   MISSED MONTH

   Tidak ada hardcode MEI/JUNI/JULI.

   Contoh:
   AGUSTUS = 0
   SEPTEMBER = 1
   OKTOBER = 0

   Maka:
   Missed: AGUSTUS, OKTOBER
========================================================== */

function renderMissedMonths(
  status,
  months
) {

  if (!missedMonths) {

    return;

  }


  /*
   Hanya muncul kalau FAILED.
  */

  if (
    status === 'FAILED' &&
    Array.isArray(months) &&
    months.length
  ) {

    missedMonths.textContent =
      'Missed: ' +
      months.join(', ');

  }

  else {

    missedMonths.textContent =
      '';

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
       0 SS
    ========================== */

    WARRIOR: {

      className:
        'rank-warrior',

      badge:
        'W'

    },


    /* ==========================
       1 SS
    ========================== */

    ELITE: {

      className:
        'rank-elite',

      badge:
        'E'

    },


    /* ==========================
       2 SS
    ========================== */

    EPIC: {

      className:
        'rank-epic',

      badge:
        'EP'

    },


    /* ==========================
       3 SS
    ========================== */

    LEGEND: {

      className:
        'rank-legend',

      badge:
        'L'

    },


    /* ==========================
       4-6 SS
    ========================== */

    MYTHIC: {

      className:
        'rank-mythic',

      badge:
        'M'

    },


    /* ==========================
       7-9 SS
    ========================== */

    'MYTHIC HONOR': {

      className:
        'rank-mythic-honor',

      badge:
        'MH'

    },


    /* ==========================
       >= 10 SS
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
   USER INITIAL
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

    .filter(Boolean)

    .slice(0,2)

    .map(
      function(word) {

        return word.charAt(0);

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

    /*
     API tanpa session akan mengembalikan
     Apps Script login URL.
    */

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
   MUSIC
========================================================== */

function setMusicButtonState(
  playing
) {

  if (!musicButton) {

    return;

  }


  musicButton.textContent =
    playing
      ? 'II'
      : '▶';


  musicButton.title =
    playing
      ? 'Pause Music'
      : 'Play Music';

}


/* ==========================================================
   TRY AUTOPLAY MUSIC

   Browser seperti Chrome / Edge bisa
   memblokir autoplay dengan suara.

   Kalau diblokir:
   musik otomatis mulai saat interaksi
   pertama user.
========================================================== */

async function tryAutoPlayMusic() {

  if (
    !bgMusic ||
    !musicButton
  ) {

    return;

  }


  /*
   Volume awal.
  */

  bgMusic.volume =
    0.35;


  try {

    await bgMusic.play();


    setMusicButtonState(
      true
    );

  }

  catch (error) {

    /*
     Autoplay diblokir browser.
    */

    setMusicButtonState(
      false
    );


    /*
     Mulai musik pada interaksi pertama.
    */

    const startMusic =
      async function() {

        try {

          /*
           Jangan play kalau user justru
           mengklik tombol music sendiri.
          */

          if (
            bgMusic.paused
          ) {

            await bgMusic.play();

          }


          setMusicButtonState(
            !bgMusic.paused
          );

        }

        catch (playError) {

          console.error(
            'AUTO MUSIC ERROR:',
            playError
          );

        }

      };


    /*
     Mouse / touch / keyboard.
    */

    document.addEventListener(
      'click',
      startMusic,
      {
        once:
          true
      }
    );


    document.addEventListener(
      'touchstart',
      startMusic,
      {
        once:
          true
      }
    );


    document.addEventListener(
      'keydown',
      startMusic,
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
  musicButton &&
  bgMusic
) {

  musicButton.addEventListener(
    'click',
    async function(event) {

      /*
       Jangan diteruskan ke listener
       autoplay document.
      */

      event.stopPropagation();


      /*
       PLAY
      */

      if (
        bgMusic.paused
      ) {

        try {

          await bgMusic.play();


          setMusicButtonState(
            true
          );

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


        setMusicButtonState(
          false
        );

      }

    }
  );

}


/* ==========================================================
   LOGOUT
========================================================== */

if (logoutButton) {

  logoutButton.addEventListener(
    'click',
    async function() {

      /*
       Simpan login URL sebelum reset.
      */

      const targetLoginUrl =
        loginUrl;


      /*
       Delete session server.
      */

      try {

        if (
          sessionToken
        ) {

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
          'LOGOUT ERROR:',
          error
        );

      }


      /*
       Clear browser session.
      */

      localStorage.removeItem(
        'ss_rank_session'
      );


      sessionToken =
        null;


      /*
       Stop music.
      */

      if (bgMusic) {

        bgMusic.pause();

        bgMusic.currentTime =
          0;

      }


      /*
       Redirect login.
      */

      if (
        targetLoginUrl
      ) {

        window.location.href =
          targetLoginUrl;

        return;

      }


      window.location.href =
        '/';

    }
  );

}


/* ==========================================================
   START
========================================================== */

tryAutoPlayMusic();

loadDashboard();

/* ==========================================================
   SEASON STORY INTERACTION
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


      const mouseX =
        (
          event.clientX -
          rect.left
        ) /
        rect.width;


      const mouseY =
        (
          event.clientY -
          rect.top
        ) /
        rect.height;


      const moveX =
        (
          mouseX - .5
        ) * 8;


      const moveY =
        (
          mouseY - .5
        ) * 5;


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
