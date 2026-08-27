/* =====================================================
   SS RANK UP SEASON
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   STORAGE
===================================================== */

const STORAGE = {
  session: 'ss_rank_session',
  user: 'ss_rank_user',
  music: 'ss_rank_music'
};


let CURRENT_USER = null;
let DASHBOARD = null;
let CONFIG = {
  loginUrl: ''
};


/* =====================================================
   APP INITIALIZE
===================================================== */

document.addEventListener(
  'DOMContentLoaded',
  async function () {

    try {

      initializeNavigation();

      initializeMusic();

      await loadConfig();

      await initializeAuthentication();

    } catch (error) {

      console.error(
        'APP START ERROR:',
        error
      );

      showUnauthorized(
        'Terjadi kesalahan saat membuka dashboard.'
      );

    }

  }
);


/* =====================================================
   CONFIG
===================================================== */

async function loadConfig() {

  try {

    const response =
      await fetch('/api/config');

    const data =
      await response.json();

    if (data.success) {

      CONFIG.loginUrl =
        data.loginUrl || '';

    }

  } catch (error) {

    console.error(
      'Config error:',
      error
    );

  }

}


/* =====================================================
   AUTHENTICATION
===================================================== */

async function initializeAuthentication() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  let token =
    params.get('session');


  /* =========================================
     SESSION DARI APPS SCRIPT
  ========================================== */

  if (token) {

    localStorage.setItem(
      STORAGE.session,
      token
    );

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

  } else {

    token =
      localStorage.getItem(
        STORAGE.session
      );

  }


  if (!token) {

    showUnauthorized(
      'Login terlebih dahulu untuk membuka SS Rank Up Season.'
    );

    return;

  }


  try {

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        function () {

          controller.abort();

        },
        10000
      );


    const response =
      await fetch(

        '/api/session?session=' +
        encodeURIComponent(token),

        {
          signal: controller.signal
        }

      );


    clearTimeout(timeout);


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.success
    ) {

      clearSession();

      showUnauthorized(
        result.message ||
        'Session tidak valid.'
      );

      return;

    }


    CURRENT_USER =
      result.user;


    localStorage.setItem(
      STORAGE.user,
      JSON.stringify(
        CURRENT_USER
      )
    );


    /*
    =========================================
    USER VALID
    WEBSITE LANGSUNG DITAMPILKAN
    =========================================
    */

    renderUser(
      CURRENT_USER
    );


    showApp();


    /*
    =========================================
    DASHBOARD DILOAD DI BELAKANG
    =========================================
    */

    loadDashboard(token)
      .catch(
        function (error) {

          console.error(
            'Dashboard background error:',
            error
          );

        }
      );


  } catch (error) {

    console.error(
      'AUTH ERROR:',
      error
    );


    if (
      error.name ===
      'AbortError'
    ) {

      showUnauthorized(
        'Server terlalu lama merespons. Silakan login kembali.'
      );

    } else {

      showUnauthorized(
        'Tidak dapat memvalidasi session.'
      );

    }

  }

}


/* =====================================================
   LOAD DASHBOARD
===================================================== */

async function loadDashboard(token) {

  try {

    const controller =
      new AbortController();


    const timeout =
      setTimeout(
        function () {

          controller.abort();

        },
        10000
      );


    const response =
      await fetch(

        '/api/dashboard?session=' +
        encodeURIComponent(token),

        {
          signal: controller.signal
        }

      );


    clearTimeout(timeout);


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.success
    ) {

      console.warn(
        'Dashboard API:',
        result
      );


      renderEmptyDashboard();

      return;

    }


    DASHBOARD =
      result;


    renderDashboard(
      result
    );


  } catch (error) {

    console.error(
      'Dashboard error:',
      error
    );


    renderEmptyDashboard();

  }

}


/* =====================================================
   USER
===================================================== */

function renderUser(user) {

  const name =
    user?.name ||
    'Player';


  const role =
    user?.role ||
    'User';


  setText(
    'topUserName',
    name
  );


  setText(
    'heroUserName',
    name
  );


  setText(
    'topUserRole',
    role
  );


  setText(
    'avatar',
    getInitials(name)
  );


  applyRole(
    role
  );

}


/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard(data) {

  const stats =
    data.stats || {};


  const season =
    data.season;


  const totalPoints =
    Number(
      stats.totalPoints || 0
    );


  const completed =
    Number(
      stats.completed || 0
    );


  const target =
    Number(
      stats.target || 3
    );


  const rank =
    stats.currentRank ||
    'WARRIOR';


  setText(
    'heroRank',
    rank
  );


  setText(
    'currentRank',
    rank
  );


  setText(
    'heroPoint',
    formatNumber(
      totalPoints
    )
  );


  setText(
    'totalPoint',
    formatNumber(
      totalPoints
    )
  );


  setText(
    'completedImprovement',
    completed
  );


  setText(
    'targetImprovement',
    target
  );


  setText(
    'leaderboardPosition',

    stats.leaderboardPosition
      ? '#' +
        stats.leaderboardPosition
      : '-'
  );


  setText(
    'seasonName',

    season?.season_name ||
    'SS Rank Up Season'
  );


  setText(
    'totalSSLabel',

    `${stats.totalSS || 0} SS`
  );


  renderSeasonProgress(
    completed,
    target
  );


  renderRankProgress(
    stats
  );


  renderMission(
    completed,
    target
  );


  renderJourney(
    completed
  );


  renderSS(
    data.submissions || []
  );


  renderLeaderboard(
    data.leaderboard || []
  );


  renderAnnouncements(
    data.announcements || []
  );

}


/* =====================================================
   EMPTY DASHBOARD
===================================================== */

function renderEmptyDashboard() {

  setText(
    'heroRank',
    'WARRIOR'
  );


  setText(
    'currentRank',
    'WARRIOR'
  );


  setText(
    'heroPoint',
    '0'
  );


  setText(
    'totalPoint',
    '0'
  );


  setText(
    'completedImprovement',
    '0'
  );


  setText(
    'targetImprovement',
    '3'
  );


  setText(
    'leaderboardPosition',
    '-'
  );


  setText(
    'seasonProgressText',
    '0%'
  );


  setWidth(
    'seasonProgress',
    0
  );


  setText(
    'rankProgressText',
    '0%'
  );


  setWidth(
    'rankProgress',
    0
  );


  setText(
    'missionTitle',
    'Start Your Journey'
  );


  setText(
    'missionDescription',
    'Data improvement sedang dipersiapkan.'
  );


  renderJourney(0);

  renderSS([]);

  renderLeaderboard([]);

}


/* =====================================================
   MISSION
===================================================== */

function renderMission(
  completed,
  target
) {

  if (
    completed >= target
  ) {

    setText(
      'missionTitle',
      'Season Complete'
    );


    setText(
      'missionDescription',
      'You completed the season target. Keep improving and climb even higher.'
    );


    setText(
      'missionStatus',
      'COMPLETED'
    );


    return;

  }


  const next =
    completed + 1;


  setText(
    'missionTitle',
    `Complete Match ${String(next).padStart(2, '0')}`
  );


  if (next === 1) {

    setText(
      'missionDescription',
      'Complete your first SS until Approved Implementation.'
    );

  } else if (next === 2) {

    setText(
      'missionDescription',
      'Keep the momentum. Complete your second Approved Implementation.'
    );

  } else {

    setText(
      'missionDescription',
      'Final push. Complete the third improvement and finish the season.'
    );

  }


  setText(
    'missionStatus',
    'IN PROGRESS'
  );

}


/* =====================================================
   SEASON PROGRESS
===================================================== */

function renderSeasonProgress(
  completed,
  target
) {

  const percent =
    target > 0
      ? Math.min(
          100,
          Math.round(
            completed /
            target *
            100
          )
        )
      : 0;


  setWidth(
    'seasonProgress',
    percent
  );


  setText(
    'seasonProgressText',
    `${percent}%`
  );

}


/* =====================================================
   RANK PROGRESS
===================================================== */

function renderRankProgress(stats) {

  const points =
    Number(
      stats.totalPoints || 0
    );


  const min =
    Number(
      stats.rankMin || 0
    );


  const max =
    stats.rankMax === null ||
    stats.rankMax === undefined

      ? null

      : Number(
          stats.rankMax
        );


  if (max === null) {

    setWidth(
      'rankProgress',
      100
    );


    setText(
      'rankProgressText',
      'MAX'
    );


    setText(
      'nextRankName',
      'Peak Rank'
    );


    setText(
      'pointNeeded',
      'MAX'
    );


    return;

  }


  const range =
    Math.max(
      1,
      max - min + 1
    );


  const current =
    Math.max(
      0,
      points - min
    );


  const percentage =
    Math.min(
      100,
      Math.round(
        current /
        range *
        100
      )
    );


  setWidth(
    'rankProgress',
    percentage
  );


  setText(
    'rankProgressText',
    `${percentage}%`
  );


  const needed =
    Math.max(
      0,
      max + 1 -
      points
    );


  setText(
    'pointNeeded',
    `${formatNumber(needed)} PTS`
  );


  setText(
    'nextRankName',
    getNextRank(
      stats.currentRank
    )
  );

}


/* =====================================================
   NEXT RANK
===================================================== */

function getNextRank(rank) {

  const ranks = [
    'WARRIOR',
    'ELITE',
    'MASTER',
    'GRANDMASTER',
    'EPIC',
    'LEGEND',
    'MYTHIC'
  ];


  const index =
    ranks.indexOf(
      String(rank || '')
        .toUpperCase()
    );


  if (
    index === -1 ||
    index === ranks.length - 1
  ) {

    return 'Peak Rank';

  }


  return ranks[
    index + 1
  ];

}


/* =====================================================
   JOURNEY
===================================================== */

function renderJourney(completed) {

  for (
    let i = 1;
    i <= 3;
    i++
  ) {

    const card =
      document.getElementById(
        `matchCard${i}`
      );


    const state =
      document.getElementById(
        `matchState${i}`
      );


    if (
      !card ||
      !state
    ) {

      continue;

    }


    card.classList.remove(
      'completed',
      'active'
    );


    if (
      i <= completed
    ) {

      card.classList.add(
        'completed'
      );


      state.textContent =
        'COMPLETED';

    } else if (
      i === completed + 1
    ) {

      card.classList.add(
        'active'
      );


      state.textContent =
        'ACTIVE';

    } else {

      state.textContent =
        'LOCKED';

    }

  }

}


/* =====================================================
   SS
===================================================== */

function renderSS(items) {

  const empty =
    document.getElementById(
      'ssEmpty'
    );


  const wrap =
    document.getElementById(
      'ssTableWrap'
    );


  const body =
    document.getElementById(
      'ssTableBody'
    );


  if (
    !empty ||
    !wrap ||
    !body
  ) {

    return;

  }


  if (
    !items ||
    !items.length
  ) {

    empty.classList.add(
      'show'
    );


    wrap.style.display =
      'none';


    return;

  }


  empty.classList.remove(
    'show'
  );


  wrap.style.display =
    'block';


  body.innerHTML =
    items

      .slice(0, 10)

      .map(

        function(item) {

          return `

            <tr>

              <td>
                ${escapeHTML(
                  item.ss_number ||
                  '-'
                )}
              </td>

              <td>
                ${escapeHTML(
                  item.title ||
                  'Improvement'
                )}
              </td>

              <td>

                <span class="status-badge">

                  ${escapeHTML(
                    item.final_status ||
                    item.status_superior ||
                    'SUBMITTED'
                  )}

                </span>

              </td>

              <td>
                ${formatDate(
                  item.submitted_at ||
                  item.created_at
                )}
              </td>

            </tr>

          `;

        }

      )

      .join('');

}


/* =====================================================
   LEADERBOARD
===================================================== */

function renderLeaderboard(items) {

  const podium =
    document.getElementById(
      'podium'
    );


  const list =
    document.getElementById(
      'leaderboardList'
    );


  if (
    !podium ||
    !list
  ) {

    return;

  }


  if (
    !items ||
    !items.length
  ) {

    podium.innerHTML = `

      <div class="empty-state show">

        <span>◇</span>

        <strong>
          Leaderboard belum tersedia
        </strong>

        <p>
          Point akan muncul setelah sinkronisasi berjalan.
        </p>

      </div>

    `;


    list.innerHTML =
      '';


    return;

  }


  const top3 =
    items.slice(
      0,
      3
    );


  const podiumOrder = [
    top3[1],
    top3[0],
    top3[2]
  ];


  podium.innerHTML =
    podiumOrder

      .filter(Boolean)

      .map(

        function(item) {

          const position =
            Number(
              item.leaderboard_position
            );


          return `

            <div
              class="
                podium-item
                ${position === 1 ? 'first' : ''}
              "
            >

              <div class="podium-avatar">

                ${escapeHTML(
                  getInitials(
                    item.employee_name ||
                    'P'
                  )
                )}

              </div>

              <div class="podium-name">

                ${escapeHTML(
                  item.employee_name ||
                  'Player'
                )}

              </div>

              <div class="podium-point">

                ${formatNumber(
                  item.total_points
                )}
                pts

              </div>

              <div class="podium-base">

                #${position}

              </div>

            </div>

          `;

        }

      )

      .join('');


  list.innerHTML =
    items

      .map(

        function(item) {

          return `

            <div class="leader-row">

              <div class="leader-position">

                #${escapeHTML(
                  item.leaderboard_position
                )}

              </div>

              <div class="leader-name">

                <strong>

                  ${escapeHTML(
                    item.employee_name ||
                    'Player'
                  )}

                </strong>

                <span>
                  SS Rank Up Season
                </span>

              </div>

              <div class="leader-points">

                ${formatNumber(
                  item.total_points
                )}
                PTS

              </div>

            </div>

          `;

        }

      )

      .join('');

}


/* =====================================================
   ANNOUNCEMENTS
===================================================== */

function renderAnnouncements(items) {

  if (
    !items ||
    !items.length
  ) {

    return;

  }


  const container =
    document.getElementById(
      'announcementGrid'
    );


  if (!container) {

    return;

  }


  container.innerHTML =
    items

      .slice(0, 3)

      .map(

        function(item) {

          return `

            <article class="announcement-card">

              <span>

                ${escapeHTML(
                  item.announcement_type ||
                  'UPDATE'
                )}

              </span>

              <h3>

                ${escapeHTML(
                  item.title ||
                  'Season Update'
                )}

              </h3>

              <p>

                ${escapeHTML(
                  item.content ||
                  ''
                )}

              </p>

            </article>

          `;

        }

      )

      .join('');

}


/* =====================================================
   ROLE
===================================================== */

function applyRole(role) {

  const normalized =
    String(
      role || ''
    )
      .trim()
      .toLowerCase();


  const superiorSections =
    document.querySelectorAll(
      '.role-superior'
    );


  superiorSections.forEach(

    function(element) {

      if (
        normalized === 'superior' ||
        normalized === 'admin' ||
        normalized === 'pic'
      ) {

        element.style.display =
          'block';

      } else {

        element.style.display =
          'none';

      }

    }

  );

}


/* =====================================================
   SHOW APP
===================================================== */

function showApp() {

  const app =
    document.getElementById(
      'app'
    );


  const unauthorized =
    document.getElementById(
      'unauthorizedPage'
    );


  const boot =
    document.getElementById(
      'bootScreen'
    );


  if (app) {

    app.classList.add(
      'show'
    );

  }


  if (unauthorized) {

    unauthorized.classList.remove(
      'show'
    );

  }


  setTimeout(

    function() {

      if (boot) {

        boot.classList.add(
          'hide'
        );

      }

    },

    250

  );

}


/* =====================================================
   UNAUTHORIZED
===================================================== */

function showUnauthorized(message) {

  const app =
    document.getElementById(
      'app'
    );


  const unauthorized =
    document.getElementById(
      'unauthorizedPage'
    );


  const boot =
    document.getElementById(
      'bootScreen'
    );


  setText(
    'unauthorizedMessage',
    message
  );


  if (app) {

    app.classList.remove(
      'show'
    );

  }


  if (unauthorized) {

    unauthorized.classList.add(
      'show'
    );

  }


  if (boot) {

    boot.classList.add(
      'hide'
    );

  }

}


/* =====================================================
   LOGOUT
===================================================== */

async function logoutUser() {

  const token =
    localStorage.getItem(
      STORAGE.session
    );


  try {

    if (token) {

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
              token: token
            })

        }

      );

    }

  } catch (error) {

    console.error(
      'Logout error:',
      error
    );

  }


  clearSession();

  goToLogin();

}


/* =====================================================
   CLEAR SESSION
===================================================== */

function clearSession() {

  localStorage.removeItem(
    STORAGE.session
  );


  localStorage.removeItem(
    STORAGE.user
  );

}


/* =====================================================
   GO LOGIN
===================================================== */

function goToLogin() {

  clearSession();


  if (
    CONFIG.loginUrl
  ) {

    window.location.href =
      CONFIG.loginUrl;

    return;

  }


  alert(
    'URL login belum tersedia.'
  );

}


/* =====================================================
   MUSIC
===================================================== */

let musicPlaying =
  false;


function initializeMusic() {

  const music =
    getMusicElement();


  if (!music) {

    console.log(
      'Audio element tidak ditemukan.'
    );

    return;

  }


  music.addEventListener(
    'canplaythrough',
    function() {

      console.log(
        'Rank Up Season music ready.'
      );

    }
  );


  music.addEventListener(
    'error',
    function(error) {

      console.error(
        'Audio gagal dimuat:',
        error
      );

    }
  );

}


/* =====================================================
   MUSIC ELEMENT
===================================================== */

function getMusicElement() {

  return (
    document.getElementById(
      'backgroundMusic'
    )
    ||
    document.getElementById(
      'bgMusic'
    )
  );

}


/* =====================================================
   MUSIC BUTTON
===================================================== */

function getMusicButton() {

  return (
    document.getElementById(
      'musicButton'
    )
    ||
    document.getElementById(
      'musicBtn'
    )
  );

}


/* =====================================================
   TOGGLE MUSIC
===================================================== */

function toggleMusic() {

  const music =
    getMusicElement();


  const button =
    getMusicButton();


  if (
    !music ||
    !button
  ) {

    console.log(
      'Background music tidak ditemukan.'
    );

    return;

  }


  if (
    !music.paused
  ) {

    music.pause();

    musicPlaying =
      false;


    button.innerHTML =
      '♪';


    button.classList.remove(
      'playing',
      'active'
    );


    button.title =
      'Play Music';


    localStorage.setItem(
      STORAGE.music,
      'off'
    );


    return;

  }


  music.volume =
    0.4;


  music.play()

    .then(

      function() {

        musicPlaying =
          true;


        button.innerHTML =
          '❚❚';


        button.classList.add(
          'playing',
          'active'
        );


        button.title =
          'Pause Music';


        localStorage.setItem(
          STORAGE.music,
          'on'
        );

      }

    )

    .catch(

      function(error) {

        console.error(
          'Music error:',
          error
        );


        musicPlaying =
          false;


        button.innerHTML =
          '♪';

      }

    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function initializeNavigation() {

  const navItems =
    document.querySelectorAll(
      '.nav-item'
    );


  navItems.forEach(

    function(item) {

      item.addEventListener(

        'click',

        function() {

          navItems.forEach(

            function(nav) {

              nav.classList.remove(
                'active'
              );

            }

          );


          item.classList.add(
            'active'
          );

        }

      );

    }

  );

}


/* =====================================================
   SCROLL
===================================================== */

function scrollToJourney() {

  const section =
    document.getElementById(
      'journeySection'
    );


  if (section) {

    section.scrollIntoView({
      behavior: 'smooth'
    });

  }

}


function scrollToLeaderboard() {

  const section =
    document.getElementById(
      'leaderboardSection'
    );


  if (section) {

    section.scrollIntoView({
      behavior: 'smooth'
    });

  }

}


/* =====================================================
   UTILITIES
===================================================== */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value;

  }

}


function setWidth(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {

    return;

  }


  const number =
    Math.max(
      0,
      Math.min(
        100,
        Number(value) || 0
      )
    );


  element.style.width =
    `${number}%`;

}


function formatNumber(value) {

  return Number(
    value || 0
  ).toLocaleString(
    'id-ID'
  );

}


function formatDate(value) {

  if (!value) {

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

    return '-';

  }


  return date.toLocaleDateString(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  );

}


function getInitials(name) {

  return String(
    name || 'P'
  )

    .trim()

    .split(/\s+/)

    .slice(0, 2)

    .map(
      function(word) {

        return word.charAt(0);

      }
    )

    .join('')

    .toUpperCase();

}


function escapeHTML(value) {

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
