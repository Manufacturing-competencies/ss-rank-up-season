const params =
  new URLSearchParams(
    window.location.search
  );


let sessionToken =
  params.get('session') ||
  localStorage.getItem(
    'ss_rank_session'
  );


if (
  params.get('session')
) {

  localStorage.setItem(
    'ss_rank_session',
    params.get('session')
  );


  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );

}


/* ===============================
   RANK ASSETS
=============================== */

const rankAssets = {

  WARRIOR:
    '/assets/ranks/warrior.png',

  ELITE:
    '/assets/ranks/elite.png',

  EPIC:
    '/assets/ranks/epic.png',

  LEGEND:
    '/assets/ranks/legend.png',

  MYTHIC:
    '/assets/ranks/mythic.png',

  'MYTHIC HONOR':
    '/assets/ranks/mythic-honor.png',

  'MYTHIC GLORY':
    '/assets/ranks/mythic-glory.png'

};


/* ===============================
   LOAD DASHBOARD
=============================== */

async function loadDashboard() {

  if (!sessionToken) {

    showInvalidSession();

    return;

  }


  try {

    const response =
      await fetch(

        '/api/dashboard?session=' +

        encodeURIComponent(
          sessionToken
        )

      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        'Dashboard gagal dimuat.'
      );

    }


    renderDashboard(
      data
    );


  } catch (error) {

    console.error(
      error
    );


    showInvalidSession();

  }

}


/* ===============================
   RENDER DASHBOARD
=============================== */

function renderDashboard(data) {

  const user =
    data.user || {};


  const season =
    data.season || {};


  const name =
    user.name ||
    'USER';


  const role =
    user.role ||
    'USER';


  document
    .getElementById(
      'userName'
    )
    .textContent =
    name;


  document
    .getElementById(
      'userRole'
    )
    .textContent =
    String(role)
      .toUpperCase();


  document
    .getElementById(
      'heroName'
    )
    .textContent =
    name;


  document
    .getElementById(
      'avatar'
    )
    .textContent =
    getInitials(
      name
    );


  renderRank(
    season
  );

}


/* ===============================
   RENDER RANK
=============================== */

function renderRank(season) {

  const rank =
    String(
      season.rank ||
      'WARRIOR'
    )
      .trim()
      .toUpperCase();


  const total =
    Number(
      season.totalApproved ||
      0
    );


  const status =
    String(
      season.status ||
      ''
    )
      .trim()
      .toUpperCase();


  const missedMonths =
    Array.isArray(
      season.missedMonths
    )
      ? season.missedMonths
      : [];


  const visual =
    getRankVisual(
      rank
    );


  document
    .documentElement
    .style
    .setProperty(
      '--rank-accent',
      visual.accent
    );


  document
    .documentElement
    .style
    .setProperty(
      '--rank-glow',
      visual.glow
    );


  document
    .getElementById(
      'rankName'
    )
    .textContent =
    rank;


  document
    .getElementById(
      'rankCount'
    )
    .textContent =
    total +
    ' SS';


  document
    .getElementById(
      'rankImage'
    )
    .src =
    rankAssets[rank] ||
    rankAssets.WARRIOR;


  const resultElement =
    document
      .getElementById(
        'seasonResult'
      );


  resultElement
    .classList
    .remove(
      'winner',
      'failed'
    );


  if (
    status === 'WINNER'
  ) {

    resultElement
      .textContent =
      'WINNER';


    resultElement
      .classList
      .add(
        'winner'
      );

  }

  else if (
    status === 'FAILED'
  ) {

    resultElement
      .textContent =
      'FAILED';


    resultElement
      .classList
      .add(
        'failed'
      );

  }

  else {

    resultElement
      .textContent =
      '';

  }


  const missedElement =
    document
      .getElementById(
        'missedMonths'
      );


  if (
    status === 'FAILED' &&
    missedMonths.length
  ) {

    missedElement
      .textContent =
      'Missed: ' +
      missedMonths.join(', ');

  }

  else {

    missedElement
      .textContent =
      '';

  }

}


/* ===============================
   VISUAL PER RANK
=============================== */

function getRankVisual(rank) {

  const visuals = {

    WARRIOR: {
      accent:'#94a3b8',
      glow:'rgba(148,163,184,.65)'
    },

    ELITE: {
      accent:'#38bdf8',
      glow:'rgba(56,189,248,.65)'
    },

    EPIC: {
      accent:'#8b5cf6',
      glow:'rgba(139,92,246,.72)'
    },

    LEGEND: {
      accent:'#facc15',
      glow:'rgba(250,204,21,.72)'
    },

    MYTHIC: {
      accent:'#34d399',
      glow:'rgba(52,211,153,.72)'
    },

    'MYTHIC HONOR': {
      accent:'#a855f7',
      glow:'rgba(168,85,247,.78)'
    },

    'MYTHIC GLORY': {
      accent:'#fbbf24',
      glow:'rgba(251,191,36,.88)'
    }

  };


  return (
    visuals[rank] ||
    visuals.WARRIOR
  );

}


/* ===============================
   INITIAL
=============================== */

function getInitials(name) {

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


/* ===============================
   INVALID SESSION
=============================== */

function showInvalidSession() {

  localStorage
    .removeItem(
      'ss_rank_session'
    );


  document
    .getElementById(
      'userName'
    )
    .textContent =
    'SESSION ENDED';


  document
    .getElementById(
      'heroName'
    )
    .textContent =
    'PLEASE LOGIN AGAIN';


  document
    .getElementById(
      'rankName'
    )
    .textContent =
    '';


  document
    .getElementById(
      'rankCount'
    )
    .textContent =
    '';

}


/* ===============================
   LOGOUT
=============================== */

document
  .getElementById(
    'logoutButton'
  )
  .addEventListener(
    'click',
    async function() {

      try {

        if (
          sessionToken
        ) {

          await fetch(
            '/api/logout',
            {

              method:'POST',

              headers:{
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

      } catch (error) {

        console.error(
          error
        );

      }


      localStorage
        .removeItem(
          'ss_rank_session'
        );


      window.location.href =
        '/';

    }
  );


/* ===============================
   MUSIC
=============================== */

const music =
  document
    .getElementById(
      'bgMusic'
    );


const musicButton =
  document
    .getElementById(
      'musicButton'
    );


musicButton
  .addEventListener(
    'click',
    async function() {

      if (
        music.paused
      ) {

        try {

          await music.play();

          musicButton
            .textContent =
            'II';

        } catch (error) {

          console.error(
            error
          );

        }

      }

      else {

        music.pause();

        musicButton
          .textContent =
          '▶';

      }

    }
  );


loadDashboard();
