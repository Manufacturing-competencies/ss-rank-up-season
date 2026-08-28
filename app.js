/* ==========================================================
   SS RANK UP SEASON
   APP.JS — CLEAN FINAL
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

const LEADERBOARD_API =
  '/api/leaderboard';

const LEADERBOARD_EXPORT_API =
  '/api/leaderboard-export';

const REWARD_API =
  '/api/rewards';

const REWARD_EXPORT_API =
  '/api/reward-export';

const PROFILE_API =
  '/api/profile';

const PROFILE_PHOTO_API =
  '/api/profile-photo';

const PLAYER_PHOTOS_API =
  '/api/player-photos';


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
   SAVE INCOMING SESSION
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
   GLOBAL STATE
========================================================== */

let currentUserName =
  '';

let currentDashboardData =
  null;

let playerPhotoMap =
  {};

let databaseLoaded =
  false;

let pointLoaded =
  false;

let leaderboardLoaded =
  false;

let rewardLoaded =
  false;

let profileLoaded =
  false;

let databasePage =
  1;

let databaseTotalPages =
  1;

let pointPage =
  1;

let pointTotalPages =
  1;

let leaderboardPage =
  1;

let leaderboardTotalPages =
  1;

let databaseSearchTimer =
  null;

let pointSearchTimer =
  null;

let leaderboardSearchTimer =
  null;

let rewardSearchTimer =
  null;

let pendingProfilePhoto =
  '';


/* ==========================================================
   GLOBAL DOM
========================================================== */

const navItems =
  document.querySelectorAll(
    '.nav-item'
  );

const appPages =
  document.querySelectorAll(
    '.app-page'
  );

const headerUserName =
  document.getElementById(
    'headerUserName'
  );

const headerUserRole =
  document.getElementById(
    'headerUserRole'
  );

const avatar =
  document.getElementById(
    'avatar'
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

const globalLoader =
  document.getElementById(
    'globalLoader'
  );


/* ==========================================================
   HOME DOM
========================================================== */

const seasonState =
  document.getElementById(
    'seasonState'
  );

const heroUserName =
  document.getElementById(
    'heroUserName'
  );

const departmentText =
  document.getElementById(
    'departmentText'
  );

const locationText =
  document.getElementById(
    'locationText'
  );

const homeSsSubmit =
  document.getElementById(
    'homeSsSubmit'
  );

const homeSsDone =
  document.getElementById(
    'homeSsDone'
  );

const homePointApproved =
  document.getElementById(
    'homePointApproved'
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

const homeNextRankName =
  document.getElementById(
    'homeNextRankName'
  );

const homeNextProgressBar =
  document.getElementById(
    'homeNextProgressBar'
  );

const homeNextRankText =
  document.getElementById(
    'homeNextRankText'
  );

const homeMonth1Name =
  document.getElementById(
    'homeMonth1Name'
  );

const homeMonth1Value =
  document.getElementById(
    'homeMonth1Value'
  );

const homeMonth1State =
  document.getElementById(
    'homeMonth1State'
  );

const homeMonth2Name =
  document.getElementById(
    'homeMonth2Name'
  );

const homeMonth2Value =
  document.getElementById(
    'homeMonth2Value'
  );

const homeMonth2State =
  document.getElementById(
    'homeMonth2State'
  );

const homeMonth3Name =
  document.getElementById(
    'homeMonth3Name'
  );

const homeMonth3Value =
  document.getElementById(
    'homeMonth3Value'
  );

const homeMonth3State =
  document.getElementById(
    'homeMonth3State'
  );

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

const homeActionButtons =
  document.querySelectorAll(
    '[data-home-target]'
  );


/* ==========================================================
   DATABASE DOM
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

const databaseStatus =
  document.getElementById(
    'databaseStatus'
  );

const databaseTableBody =
  document.getElementById(
    'databaseTableBody'
  );

const databaseMobile =
  document.getElementById(
    'databaseMobile'
  );

const databasePrev =
  document.getElementById(
    'databasePrev'
  );

const databaseNext =
  document.getElementById(
    'databaseNext'
  );

const databasePageInfo =
  document.getElementById(
    'databasePageInfo'
  );


/* ==========================================================
   POINT DOM
========================================================== */

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

const pointPodium =
  document.getElementById(
    'pointPodium'
  );

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

const pointStatus =
  document.getElementById(
    'pointStatus'
  );

const pointTableBody =
  document.getElementById(
    'pointTableBody'
  );

const pointMobile =
  document.getElementById(
    'pointMobile'
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
   LEADERBOARD DOM
========================================================== */

const leaderboardTotalPlayers =
  document.getElementById(
    'leaderboardTotalPlayers'
  );

const leaderboardMaxPlayers =
  document.getElementById(
    'leaderboardMaxPlayers'
  );

const leaderboardPlayer =
  document.getElementById(
    'leaderboardPlayer'
  );

const leaderboardTop10 =
  document.getElementById(
    'leaderboardTop10'
  );

const leaderboardSearch =
  document.getElementById(
    'leaderboardSearch'
  );

const leaderboardLimit =
  document.getElementById(
    'leaderboardLimit'
  );

const leaderboardExport =
  document.getElementById(
    'leaderboardExport'
  );

const leaderboardStatus =
  document.getElementById(
    'leaderboardStatus'
  );

const leaderboardTableBody =
  document.getElementById(
    'leaderboardTableBody'
  );

const leaderboardMobile =
  document.getElementById(
    'leaderboardMobile'
  );

const leaderboardPrev =
  document.getElementById(
    'leaderboardPrev'
  );

const leaderboardNext =
  document.getElementById(
    'leaderboardNext'
  );

const leaderboardPageInfo =
  document.getElementById(
    'leaderboardPageInfo'
  );


/* ==========================================================
   REWARD DOM
========================================================== */

const rewardRevealButton =
  document.getElementById(
    'rewardRevealButton'
  );

const rewardWinnerCount =
  document.getElementById(
    'rewardWinnerCount'
  );

const rewardCategoryCount =
  document.getElementById(
    'rewardCategoryCount'
  );

const rewardCards =
  document.getElementById(
    'rewardCards'
  );

const rewardSearch =
  document.getElementById(
    'rewardSearch'
  );

const rewardParticipantFilter =
  document.getElementById(
    'rewardParticipantFilter'
  );

const rewardExport =
  document.getElementById(
    'rewardExport'
  );

const rewardStatus =
  document.getElementById(
    'rewardStatus'
  );

const rewardTableBody =
  document.getElementById(
    'rewardTableBody'
  );


/* ==========================================================
   PROFILE DOM
========================================================== */

const profileAvatar =
  document.getElementById(
    'profileAvatar'
  );

const profilePhotoInput =
  document.getElementById(
    'profilePhotoInput'
  );

const profilePhotoSave =
  document.getElementById(
    'profilePhotoSave'
  );

const profilePhotoStatus =
  document.getElementById(
    'profilePhotoStatus'
  );

const profileName =
  document.getElementById(
    'profileName'
  );

const profileRole =
  document.getElementById(
    'profileRole'
  );

const profileDepartment =
  document.getElementById(
    'profileDepartment'
  );

const profileLocation =
  document.getElementById(
    'profileLocation'
  );

const profileSuperior =
  document.getElementById(
    'profileSuperior'
  );

const profileRank =
  document.getElementById(
    'profileRank'
  );

const profileSeasonStatus =
  document.getElementById(
    'profileSeasonStatus'
  );

const profileSsSubmit =
  document.getElementById(
    'profileSsSubmit'
  );

const profileSsDone =
  document.getElementById(
    'profileSsDone'
  );

const profilePointApproved =
  document.getElementById(
    'profilePointApproved'
  );

const profileLeaderboardPosition =
  document.getElementById(
    'profileLeaderboardPosition'
  );

const profileGameScore =
  document.getElementById(
    'profileGameScore'
  );

const profileGameProgress =
  document.getElementById(
    'profileGameProgress'
  );

const profileGameText =
  document.getElementById(
    'profileGameText'
  );

const profileMonthGrid =
  document.getElementById(
    'profileMonthGrid'
  );

const profileAchievements =
  document.getElementById(
    'profileAchievements'
  );


/* ==========================================================
   HELPERS
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


function formatNumber(
  value
) {

  return safeNumber(
    value
  )
    .toLocaleString(
      'id-ID'
    );

}


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
    .slice(
      0,
      2
    )
    .map(
      word =>
        word.charAt(0)
    )
    .join('')
    .toUpperCase();

}


function showLoader() {

  if (
    globalLoader
  ) {

    globalLoader.hidden =
      false;

  }

}


function hideLoader() {

  if (
    globalLoader
  ) {

    globalLoader.hidden =
      true;

  }

}


/* ==========================================================
   LOGIN
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
   RANK ENGINE
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


function calculateRankFromTotal(
  total
) {

  total =
    safeNumber(
      total
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
    total >= 3
  ) {

    return 'LEGEND';

  }

  if (
    total >= 2
  ) {

    return 'EPIC';

  }

  if (
    total >= 1
  ) {

    return 'ELITE';

  }

  return 'WARRIOR';

}


function normalizeRank(
  rank
) {

  const value =
    String(
      rank ||
      'WARRIOR'
    )
      .trim()
      .toUpperCase();

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
    value
  )
    ? value
    : 'WARRIOR';

}


function getRankClass(
  rank
) {

  return {

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

  }[rank] ||
  'rank-warrior';

}


function getRankSymbol(
  rank
) {

  return {

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

  }[rank] ||
  'W';

}


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


function getMissedMonths(
  progress
) {

  return [

    {
      name:
        progress.month_1_name,
      value:
        safeNumber(
          progress.month_1_value
        )
    },

    {
      name:
        progress.month_2_name,
      value:
        safeNumber(
          progress.month_2_value
        )
    },

    {
      name:
        progress.month_3_name,
      value:
        safeNumber(
          progress.month_3_value
        )
    }

  ]
    .filter(
      item =>
        item.name &&
        item.value < 1
    )
    .map(
      item =>
        item.name
    );

}


function getNextRankInfo(
  totalApproved
) {

  const total =
    safeNumber(
      totalApproved
    );

  if (
    total >= 10
  ) {

    return {

      name:
        'MAX RANK',

      target:
        10,

      remaining:
        0,

      progress:
        100,

      text:
        'Mythic Glory reached'

    };

  }

  const targets = [

    {
      name:
        'ELITE',
      min:
        0,
      target:
        1
    },

    {
      name:
        'EPIC',
      min:
        1,
      target:
        2
    },

    {
      name:
        'LEGEND',
      min:
        2,
      target:
        3
    },

    {
      name:
        'MYTHIC',
      min:
        3,
      target:
        4
    },

    {
      name:
        'MYTHIC HONOR',
      min:
        4,
      target:
        7
    },

    {
      name:
        'MYTHIC GLORY',
      min:
        7,
      target:
        10
    }

  ];

  const next =
    targets.find(
      item =>
        total <
        item.target
    );

  const remaining =
    next.target -
    total;

  const range =
    next.target -
    next.min;

  const achieved =
    Math.max(
      0,
      total -
      next.min
    );

  const progress =
    Math.round(
      Math.min(
        100,
        (
          achieved /
          range
        ) *
        100
      )
    );

  return {

    ...next,

    remaining,

    progress,

    text:

      remaining +

      ' SS to ' +

      next.name

  };

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

  showLoader();

  try {

    const response =
      await fetch(

        DASHBOARD_API +

        '?session=' +

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

    currentDashboardData =
      result;

    renderDashboard(
      result
    );

    await loadPlayerPhotos();

    renderHeaderPhoto();

    tryStartMusic();

  }

  catch(error) {

    console.error(
      'DASHBOARD ERROR:',
      error
    );

    goToLogin();

  }

  finally {

    hideLoader();

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

        data.user_name,

        progress.employee_name,

        'USER'

      )

    )
      .trim()
      .toUpperCase();

  currentUserName =
    name;

  const role =
    String(

      firstValue(

        user.role,

        session.role,

        'USER'

      )

    )
      .trim()
      .toUpperCase();

  const department =
    firstValue(

      progress.department,

      user.department,

      user.departemen,

      '-'

    );

  const location =
    firstValue(

      progress.work_location,

      progress.location,

      user.location,

      user.work_location,

      '-'

    );

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

    seasonState.textContent =

      season.active === false ||
      season.is_active === false

        ? 'SEASON CLOSED'

        : 'SEASON ACTIVE';

  }

  renderRank(
    progress
  );

  renderHomeLobby(
    progress
  );

  renderJourney(
    progress
  );

}


/* ==========================================================
   HOME
========================================================== */

function renderHomeLobby(
  progress
) {

  const ssSubmit =
    safeNumber(

      firstValue(

        progress.ssSubmit,

        progress.ss_submit,

        0

      )

    );

  const ssDone =
    safeNumber(

      firstValue(

        progress.ssDone,

        progress.ss_done,

        0

      )

    );

  const pointApproved =
    safeNumber(

      firstValue(

        progress.pointApproved,

        progress.point_approved,

        0

      )

    );

  if (
    homeSsSubmit
  ) {

    homeSsSubmit.textContent =
      formatNumber(
        ssSubmit
      );

  }

  if (
    homeSsDone
  ) {

    homeSsDone.textContent =
      formatNumber(
        ssDone
      );

  }

  if (
    homePointApproved
  ) {

    homePointApproved.textContent =
      formatNumber(
        pointApproved
      );

  }


  const months = [

    {
      name:
        progress.month_1_name ||
        'MONTH 1',

      value:
        safeNumber(
          progress.month_1_value
        ),

      nameElement:
        homeMonth1Name,

      valueElement:
        homeMonth1Value,

      stateElement:
        homeMonth1State
    },

    {
      name:
        progress.month_2_name ||
        'MONTH 2',

      value:
        safeNumber(
          progress.month_2_value
        ),

      nameElement:
        homeMonth2Name,

      valueElement:
        homeMonth2Value,

      stateElement:
        homeMonth2State
    },

    {
      name:
        progress.month_3_name ||
        'MONTH 3',

      value:
        safeNumber(
          progress.month_3_value
        ),

      nameElement:
        homeMonth3Name,

      valueElement:
        homeMonth3Value,

      stateElement:
        homeMonth3State
    }

  ];

  months.forEach(
    month => {

      if (
        month.nameElement
      ) {

        month.nameElement.textContent =
          month.name;

      }

      if (
        month.valueElement
      ) {

        month.valueElement.textContent =
          month.value;

      }

      if (
        month.stateElement
      ) {

        month.stateElement.classList.remove(
          'complete',
          'missed'
        );

        const complete =
          month.value >= 1;

        month.stateElement.textContent =
          complete
            ? 'COMPLETE'
            : 'MISSED';

        month.stateElement.classList.add(
          complete
            ? 'complete'
            : 'missed'
        );

      }

    }
  );


  const nextRank =
    getNextRankInfo(
      getTotalApproved(
        progress
      )
    );

  if (
    homeNextRankName
  ) {

    homeNextRankName.textContent =
      nextRank.name;

  }

  if (
    homeNextProgressBar
  ) {

    homeNextProgressBar.style.width =
      nextRank.progress +
      '%';

  }

  if (
    homeNextRankText
  ) {

    homeNextRankText.textContent =
      nextRank.text;

  }

}


/* ==========================================================
   CURRENT RANK
========================================================== */

function renderRank(
  progress
) {

  const total =
    getTotalApproved(
      progress
    );

  const rank =
    normalizeRank(

      firstValue(

        progress.rank,

        calculateRankFromTotal(
          total
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
    rankSymbol
  ) {

    rankSymbol.textContent =
      getRankSymbol(
        rank
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
      total +
      ' SS';

  }

  if (
    seasonStatus
  ) {

    seasonStatus.classList.remove(
      'winner',
      'failed'
    );

    seasonStatus.textContent =
      status;

    seasonStatus.classList.add(

      status === 'WINNER'

        ? 'winner'

        : 'failed'

    );

  }

  if (
    missedMonths
  ) {

    missedMonths.textContent =

      status !== 'WINNER' &&
      missed.length

        ? 'Missed: ' +
          missed.join(', ')

        : '';

  }

}


/* ==========================================================
   JOURNEY
========================================================== */

function renderJourney(
  progress
) {

  if (
    !journeyTrack
  ) {

    return;

  }

  const total =
    getTotalApproved(
      progress
    );

  const rank =
    normalizeRank(

      firstValue(

        progress.rank,

        calculateRankFromTotal(
          total
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

  const order = [

    'WARRIOR',

    'ELITE',

    'EPIC',

    'LEGEND',

    'MYTHIC',

    'MYTHIC HONOR',

    'MYTHIC GLORY'

  ];

  const currentIndex =
    Math.max(
      0,
      order.indexOf(
        rank
      )
    );

  const cards =
    journeyTrack.querySelectorAll(
      '.journey-card'
    );

  cards.forEach(
    card => {

      const index =
        safeNumber(
          card.dataset.index
        );

      const state =
        card.querySelector(
          '.journey-card-state'
        );

      card.classList.remove(
        'current',
        'achieved',
        'locked'
      );

      if (
        index <
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
        index ===
        currentIndex
      ) {

        card.classList.add(
          'current'
        );

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

      '<b>Current:</b> ' +

      escapeHtml(
        rank
      ) +

      ' &nbsp;•&nbsp; ' +

      '<b>Approved:</b> ' +

      total +

      ' SS &nbsp;•&nbsp; ' +

      '<b>Season:</b> ' +

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

        '<strong class="winner">' +

        'WINNER' +

        '</strong> — ' +

        'monthly mission completed.';

    }

    else {

      journeyNote.innerHTML =

        'Season Status: ' +

        '<strong class="failed">' +

        'FAILED' +

        '</strong> — ' +

        'rank tetap mengikuti Approved Implementasi. ' +

        (
          missed.length

            ? 'Missed: <b>' +
              escapeHtml(
                missed.join(', ')
              ) +
              '</b>.'

            : ''
        );

    }

  }

}


/* ==========================================================
   NAVIGATION
========================================================== */

function openPage(
  pageName
) {

  navItems.forEach(
    item => {

      item.classList.toggle(

        'active',

        item.dataset.page ===
        pageName

      );

    }
  );

  appPages.forEach(
    page => {

      page.classList.toggle(

        'active',

        page.id ===
        'page-' +
        pageName

      );

    }
  );


  switch(
    pageName
  ) {

    case 'database':

      initDatabasePage();

      break;


    case 'point':

      initPointPage();

      break;


    case 'leaderboard':

      initLeaderboardPage();

      break;


    case 'reward':

      initRewardPage();

      break;


    case 'profile':

      initProfilePage();

      break;

  }


  window.scrollTo({

    top:
      0,

    behavior:
      'smooth'

  });

}


navItems.forEach(
  item => {

    item.addEventListener(
      'click',
      function() {

        openPage(
          item.dataset.page
        );

      }
    );

  }
);


homeActionButtons.forEach(
  button => {

    button.addEventListener(
      'click',
      function() {

        const target =
          button.dataset.homeTarget;

        if (
          target
        ) {

          openPage(
            target
          );

        }

      }
    );

  }
);


/* ==========================================================
   PLAYER PHOTO ENGINE
========================================================== */

async function loadPlayerPhotos() {

  if (
    !sessionToken
  ) {

    return;

  }

  try {

    const response =
      await fetch(

        PLAYER_PHOTOS_API +

        '?session=' +

        encodeURIComponent(
          sessionToken
        ),

        {
          cache:
            'no-store'
        }

      );

    if (
      !response.ok
    ) {

      return;

    }

    const result =
      await response.json();

    if (
      result.success
    ) {

      playerPhotoMap =
        result.photos || {};

    }

  }

  catch(error) {

    console.warn(
      'PLAYER PHOTOS:',
      error
    );

  }

}


function getPlayerPhoto(
  name
) {

  return playerPhotoMap[
    String(
      name || ''
    )
      .trim()
      .toUpperCase()
  ] || '';

}


function playerAvatarMarkup(
  name,
  imageClass = ''
) {

  const photo =
    getPlayerPhoto(
      name
    );

  if (
    photo
  ) {

    return `

      <img
        class="${escapeHtml(imageClass)}"
        src="${escapeHtml(photo)}"
        alt="${escapeHtml(name)}"
        loading="lazy"
      >

    `;

  }

  return escapeHtml(
    getInitials(
      name
    )
  );

}


function renderHeaderPhoto() {

  if (
    !avatar
  ) {

    return;

  }

  const photo =
    getPlayerPhoto(
      currentUserName
    );

  if (
    photo
  ) {

    avatar.classList.add(
      'has-photo'
    );

    avatar.innerHTML = `

      <img
        src="${escapeHtml(photo)}"
        alt="${escapeHtml(currentUserName)}"
      >

    `;

  }

  else {

    avatar.classList.remove(
      'has-photo'
    );

    avatar.textContent =
      getInitials(
        currentUserName
      );

  }

}


/* ==========================================================
   DATABASE
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


async function loadDatabase() {

  try {

    if (
      databaseStatus
    ) {

      databaseStatus.textContent =
        'Loading database...';

    }

    const params =
      new URLSearchParams();

    params.set(
      'page',
      databasePage
    );

    params.set(

      'limit',

      databaseLimit
        ? databaseLimit.value
        : '50'

    );

    const search =
      databaseSearch
        ? databaseSearch.value.trim()
        : '';

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

        `Menampilkan ${safeNumber(pagination.from)}–${safeNumber(pagination.to)} dari ${safeNumber(pagination.total)} data`;

    }

    if (
      databasePageInfo
    ) {

      databasePageInfo.textContent =

        `Page ${databasePage} / ${databaseTotalPages}`;

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
      'DATABASE:',
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
    row => {

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
            formatDateTime(
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
            formatDate(
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
            formatNumber(
              row.point
            )
          ) +

          tableCell(
            formatNumber(
              row.point_approval
            )
          );

        databaseTableBody.appendChild(
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

          <div class="mobile-card-head">

            <div>

              <span class="mobile-id">
                SS #${safeText(row.ss_id)}
              </span>

              <h3>
                ${safeText(row.employee_name)}
              </h3>

              <p>
                ${safeText(row.department)}
              </p>

            </div>

          </div>


          <div class="mobile-info-grid">

            ${mobileInfo(
              'Jenis SS',
              row.ss_type
            )}

            ${mobileInfo(
              'Superior',
              row.superior_name
            )}

            ${mobileInfo(
              'Admin',
              row.status_admin
            )}

            ${mobileInfo(
              'Superior Status',
              row.status_superior
            )}

            ${mobileInfo(
              'Implementasi',
              row.status_implementasi
            )}

            ${mobileInfo(
              'Kualifikasi',
              row.qualification
            )}

            ${mobileInfo(
              'Point',
              formatNumber(
                row.point
              )
            )}

            ${mobileInfo(
              'Approval',
              formatNumber(
                row.point_approval
              )
            )}

          </div>

        `;

        databaseMobile.appendChild(
          card
        );

      }

    }
  );

}


/* ==========================================================
   POINT
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


async function loadPoint() {

  try {

    if (
      pointStatus
    ) {

      pointStatus.textContent =
        'Loading point ranking...';

    }

    const params =
      new URLSearchParams();

    params.set(
      'page',
      pointPage
    );

    params.set(

      'limit',

      pointLimit
        ? pointLimit.value
        : '50'

    );

    const search =
      pointSearch
        ? pointSearch.value.trim()
        : '';

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
        'Point gagal dimuat.'
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

        `Menampilkan ${safeNumber(pagination.from)}–${safeNumber(pagination.to)} dari ${safeNumber(pagination.total)} peserta`;

    }

    if (
      pointPageInfo
    ) {

      pointPageInfo.textContent =

        `Page ${pointPage} / ${pointTotalPages}`;

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
      'POINT:',
      error
    );

    if (
      pointStatus
    ) {

      pointStatus.textContent =
        'Point gagal dimuat.';

    }

  }

}


function renderPointSummary(
  summary
) {

  if (
    pointTotal
  ) {

    pointTotal.textContent =
      formatNumber(
        summary.total
      );

  }

  if (
    pointWinner
  ) {

    pointWinner.textContent =
      formatNumber(
        summary.winner
      );

  }

  if (
    pointLose
  ) {

    pointLose.textContent =
      formatNumber(
        summary.lose
      );

  }

}


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
    !rows.length
  ) {

    pointPodium.innerHTML = `

      <div class="empty-state">
        Belum ada Winner.
      </div>

    `;

    return;

  }

  const visualOrder =
    [1, 0, 2];

  visualOrder.forEach(
    index => {

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
        `podium-card podium-${position}`;

      card.innerHTML = `

        <div class="podium-crown">
          ${icon}
        </div>

        <div class="podium-position">
          #${position}
        </div>

        <div class="podium-avatar">

          ${playerAvatarMarkup(
            row.employee_name,
            'podium-photo'
          )}

        </div>

        <h3>
          ${safeText(row.employee_name)}
        </h3>

        <p>
          ${safeText(row.department)}
        </p>

        <div class="podium-score">

          <strong>
            ${safeNumber(row.ss_done)}
          </strong>

          <span>
            SS DONE
          </span>

        </div>

        <div class="podium-approved">

          ${formatNumber(row.point_approved)}
          POINT APPROVED

        </div>

        <div class="podium-rank">
          ${safeText(row.rank || 'WARRIOR')}
        </div>

      `;

      pointPodium.appendChild(
        card
      );

    }
  );

}


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
    !rows.length
  ) {

    return;

  }

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
    row => {

      const status =
        normalizePointStatus(

          row.status ||
          row.season_status

        );

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
            <strong class="table-position">
              #${safeNumber(row.position)}
            </strong>
          </td>

          <td>
            <strong>
              ${safeText(row.employee_name)}
            </strong>
          </td>

          <td>
            ${safeText(row.department)}
          </td>

          <td>
            ${safeText(row.superior_name)}
          </td>

          <td>
            ${safeText(row.work_location)}
          </td>

          <td>
            <strong class="success-number">
              ${safeNumber(row.ss_done)}
            </strong>
          </td>

          <td>
            ${formatNumber(row.point)}
          </td>

          <td>
            <strong>
              ${formatNumber(row.point_approved)}
            </strong>
          </td>

          <td>
            ${safeNumber(row.ss_submit)}
          </td>

          <td>
            ${safeNumber(row.month_1_value)}
          </td>

          <td>
            ${safeNumber(row.month_2_value)}
          </td>

          <td>
            ${safeNumber(row.month_3_value)}
          </td>

          <td>

            <span class="status-badge ${
              status === 'WINNER'
                ? 'winner'
                : 'lose'
            }">

              ${escapeHtml(status)}

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
            <strong class="rank-text">
              ${safeText(row.rank || 'WARRIOR')}
            </strong>
          </td>

        `;

        pointTableBody.appendChild(
          tr
        );

      }


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

          <div class="mobile-card-head">

            <strong class="table-position">
              #${safeNumber(row.position)}
            </strong>

            <span class="status-badge ${
              status === 'WINNER'
                ? 'winner'
                : 'lose'
            }">

              ${escapeHtml(status)}

            </span>

          </div>

          <h3>
            ${safeText(row.employee_name)}
          </h3>

          <p>
            ${safeText(row.department)}
          </p>

          <div class="mobile-score-grid">

            <div>

              <strong>
                ${safeNumber(row.ss_done)}
              </strong>

              <span>
                SS DONE
              </span>

            </div>

            <div>

              <strong>
                ${formatNumber(row.point_approved)}
              </strong>

              <span>
                APPROVED
              </span>

            </div>

            <div>

              <strong>
                ${formatNumber(row.point)}
              </strong>

              <span>
                POINT
              </span>

            </div>

          </div>

        `;

        pointMobile.appendChild(
          card
        );

      }

    }
  );

}


function normalizePointStatus(
  value
) {

  const status =
    String(
      value || ''
    )
      .trim()
      .toUpperCase();

  return status === 'WINNER'
    ? 'WINNER'
    : 'LOSE';

}


/* ==========================================================
   LEADERBOARD
========================================================== */

function initLeaderboardPage() {

  if (
    leaderboardLoaded
  ) {

    return;

  }

  leaderboardLoaded =
    true;

  leaderboardPage =
    1;

  loadLeaderboard();

}


async function loadLeaderboard() {

  try {

    if (
      leaderboardStatus
    ) {

      leaderboardStatus.textContent =
        'Loading leaderboard...';

    }

    const params =
      new URLSearchParams();

    params.set(
      'page',
      leaderboardPage
    );

    params.set(

      'limit',

      leaderboardLimit
        ? leaderboardLimit.value
        : '50'

    );

    if (
      currentUserName
    ) {

      params.set(
        'player',
        currentUserName
      );

    }

    const search =
      leaderboardSearch
        ? leaderboardSearch.value.trim()
        : '';

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

        LEADERBOARD_API +

        '?' +

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
        'Leaderboard gagal dimuat.'
      );

    }

    renderLeaderboardSummary(
      result.summary || {}
    );

    renderLeaderboardPlayer(
      result.player || null
    );

    renderLeaderboardTop10(
      result.top10 || []
    );

    renderLeaderboardRows(
      result.data || []
    );

    const pagination =
      result.pagination || {};

    leaderboardPage =
      safeNumber(
        pagination.page
      ) || 1;

    leaderboardTotalPages =
      safeNumber(
        pagination.totalPages
      ) || 1;

    if (
      leaderboardStatus
    ) {

      leaderboardStatus.textContent =

        `Menampilkan ${safeNumber(pagination.from)}–${safeNumber(pagination.to)} dari ${safeNumber(pagination.total)} pemain`;

    }

    if (
      leaderboardPageInfo
    ) {

      leaderboardPageInfo.textContent =

        `Page ${leaderboardPage} / ${leaderboardTotalPages}`;

    }

    if (
      leaderboardPrev
    ) {

      leaderboardPrev.disabled =
        leaderboardPage <= 1;

    }

    if (
      leaderboardNext
    ) {

      leaderboardNext.disabled =
        leaderboardPage >=
        leaderboardTotalPages;

    }

  }

  catch(error) {

    console.error(
      'LEADERBOARD:',
      error
    );

    if (
      leaderboardStatus
    ) {

      leaderboardStatus.textContent =
        'Leaderboard gagal dimuat.';

    }

  }

}


function renderLeaderboardSummary(
  summary
) {

  if (
    leaderboardTotalPlayers
  ) {

    leaderboardTotalPlayers.textContent =
      formatNumber(
        summary.totalPlayers
      );

  }

  if (
    leaderboardMaxPlayers
  ) {

    leaderboardMaxPlayers.textContent =
      formatNumber(
        summary.maxScorePlayers
      );

  }

}


function renderLeaderboardPlayer(
  player
) {

  if (
    !leaderboardPlayer
  ) {

    return;

  }

  if (
    !player
  ) {

    leaderboardPlayer.innerHTML = `

      <div class="empty-state">
        Posisi kamu belum ditemukan.
      </div>

    `;

    return;

  }

  const score =
    safeNumber(
      player.game_score
    );

  const progress =
    Math.min(
      100,
      safeNumber(
        player.progress
      )
    );

  leaderboardPlayer.innerHTML = `

    <div class="lb-player-rank">

      <span>
        YOUR POSITION
      </span>

      <strong>
        #${safeNumber(player.position)}
      </strong>

    </div>


    <div class="lb-player-identity">

      <div class="lb-player-avatar">

        ${playerAvatarMarkup(
          player.employee_name,
          'lb-player-photo'
        )}

      </div>

      <div>

        <h3>
          ${safeText(player.employee_name)}
        </h3>

        <p>

          ${safeText(player.department)}

          •

          ${safeText(player.work_location)}

        </p>

      </div>

    </div>


    <div class="lb-player-score">

      <div class="lb-score-head">

        <span>
          GAME SCORE
        </span>

        <strong>

          ${score}

          <small>
            / 240
          </small>

        </strong>

      </div>


      <div class="lb-progress-track">

        <span
          class="lb-progress-fill"
          style="width:${progress}%"
        ></span>

      </div>


      <div class="lb-progress-label">

        <span>

          ${safeNumber(player.approved_ss)}
          / 6 SS

        </span>

        <strong>

          ${
            player.maxed

              ? 'MAX POINT'

              : safeNumber(
                  player.remaining
                ) +
                ' POINT TO MAX'
          }

        </strong>

      </div>

    </div>

  `;

}


function renderLeaderboardTop10(
  rows
) {

  if (
    !leaderboardTop10
  ) {

    return;

  }

  leaderboardTop10.innerHTML =
    '';

  if (
    !rows.length
  ) {

    leaderboardTop10.innerHTML = `

      <div class="empty-state">
        Belum ada Leaderboard.
      </div>

    `;

    return;

  }

  rows.forEach(
    row => {

      const position =
        safeNumber(
          row.position
        );

      const progress =
        Math.min(
          100,
          safeNumber(
            row.progress
          )
        );

      const card =
        document.createElement(
          'article'
        );

      card.className =
        `lb-top-card lb-top-${position}` +

        (
          row.maxed
            ? ' lb-maxed'
            : ''
        );

      const icon =

        position === 1
          ? '♛'

          : position === 2
            ? '◆'

            : position === 3
              ? '▲'

              : '✦';

      card.innerHTML = `

        <div class="lb-top-shine"></div>

        <div class="lb-top-position">

          <span>
            ${icon}
          </span>

          <strong>
            #${position}
          </strong>

        </div>


        <div class="lb-top-avatar">

          ${playerAvatarMarkup(
            row.employee_name,
            'lb-top-photo'
          )}

        </div>


        <h3>
          ${safeText(row.employee_name)}
        </h3>

        <p>
          ${safeText(row.department)}
        </p>


        <div class="lb-top-score">

          <strong>
            ${safeNumber(row.game_score)}
          </strong>

          <span>
            POINT
          </span>

        </div>


        <div class="lb-progress-track">

          <span
            class="lb-progress-fill"
            style="width:${progress}%"
          ></span>

        </div>


        <div class="lb-top-footer">

          <span>
            ${safeNumber(row.approved_ss)}
            / 6 SS
          </span>

          <b>

            ${
              row.maxed

                ? 'MAX POINT'

                : safeNumber(
                    row.remaining
                  ) +
                  ' LEFT'
            }

          </b>

        </div>

      `;

      leaderboardTop10.appendChild(
        card
      );

    }
  );

}


function renderLeaderboardRows(
  rows
) {

  if (
    leaderboardTableBody
  ) {

    leaderboardTableBody.innerHTML =
      '';

  }

  if (
    leaderboardMobile
  ) {

    leaderboardMobile.innerHTML =
      '';

  }

  rows.forEach(
    row => {

      const progress =
        Math.min(
          100,
          safeNumber(
            row.progress
          )
        );

      const current =
        String(
          row.employee_name || ''
        )
          .trim()
          .toUpperCase() ===
        String(
          currentUserName
        )
          .trim()
          .toUpperCase();

      if (
        leaderboardTableBody
      ) {

        const tr =
          document.createElement(
            'tr'
          );

        if (
          current
        ) {

          tr.classList.add(
            'current-player-row'
          );

        }

        tr.innerHTML = `

          <td>
            <strong class="table-position">
              #${safeNumber(row.position)}
            </strong>
          </td>

          <td>
            <strong>
              ${safeText(row.employee_name)}
            </strong>
          </td>

          <td>
            ${safeText(row.department)}
          </td>

          <td>
            ${safeText(row.superior_name)}
          </td>

          <td>
            ${safeText(row.work_location)}
          </td>

          <td>

            <strong class="success-number">

              ${safeNumber(row.game_score)}

            </strong>

            / 240

          </td>

          <td>

            <div class="table-progress">

              <div>

                <span
                  style="width:${progress}%"
                ></span>

              </div>

              <small>

                ${safeNumber(row.approved_ss)}

                / 6 SS

              </small>

            </div>

          </td>

        `;

        leaderboardTableBody.appendChild(
          tr
        );

      }


      if (
        leaderboardMobile
      ) {

        const card =
          document.createElement(
            'article'
          );

        card.className =
          'lb-mobile-card' +

          (
            current
              ? ' current-player-card'
              : ''
          );

        card.innerHTML = `

          <div class="mobile-card-head">

            <strong class="table-position">
              #${safeNumber(row.position)}
            </strong>

            ${
              row.maxed
                ? '<span class="max-badge">MAX POINT</span>'
                : ''
            }

          </div>

          <h3>
            ${safeText(row.employee_name)}
          </h3>

          <p>
            ${safeText(row.department)}
          </p>

          <div class="lb-mobile-score">

            <strong>
              ${safeNumber(row.game_score)}
            </strong>

            <span>
              / 240 POINT
            </span>

          </div>

          <div class="lb-progress-track">

            <span
              class="lb-progress-fill"
              style="width:${progress}%"
            ></span>

          </div>

        `;

        leaderboardMobile.appendChild(
          card
        );

      }

    }
  );

}


/* ==========================================================
   REWARD
========================================================== */

function initRewardPage() {

  if (
    rewardLoaded
  ) {

    return;

  }

  rewardLoaded =
    true;

  loadRewards();

}


async function loadRewards() {

  try {

    if (
      rewardStatus
    ) {

      rewardStatus.textContent =
        'Loading Season Rewards...';

    }

    const params =
      new URLSearchParams();

    params.set(
      'session',
      sessionToken
    );

    const search =
      rewardSearch
        ? rewardSearch.value.trim()
        : '';

    const participant =
      rewardParticipantFilter
        ? rewardParticipantFilter.value
        : 'ALL';

    if (
      search
    ) {

      params.set(
        'search',
        search
      );

    }

    if (
      participant
    ) {

      params.set(
        'participant',
        participant
      );

    }

    const response =
      await fetch(

        REWARD_API +

        '?' +

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
        'Reward gagal dimuat.'
      );

    }

    if (
      rewardWinnerCount
    ) {

      rewardWinnerCount.textContent =
        formatNumber(
          result.summary?.winners
        );

    }

    if (
      rewardCategoryCount
    ) {

      rewardCategoryCount.textContent =
        formatNumber(
          result.summary?.categories
        );

    }

    renderRewardCards(
      result.data || []
    );

    renderRewardTable(
      result.data || []
    );

    if (
      rewardStatus
    ) {

      rewardStatus.textContent =

        `${safeNumber(result.summary?.winners)} achievement ditemukan`;

    }

  }

  catch(error) {

    console.error(
      'REWARD:',
      error
    );

    if (
      rewardStatus
    ) {

      rewardStatus.textContent =
        'Reward gagal dimuat.';

    }

  }

}


function getRewardVisual(
  category
) {

  const value =
    String(
      category || ''
    )
      .trim()
      .toUpperCase();

  if (
    value.includes(
      'MVP'
    )
  ) {

    return {
      icon:
        '♛',
      type:
        'mvp'
    };

  }

  if (
    value.includes(
      'FAST'
    )
  ) {

    return {
      icon:
        'ϟ',
      type:
        'fast'
    };

  }

  if (
    value.includes(
      'IMPACT'
    )
  ) {

    return {
      icon:
        '◆',
      type:
        'impact'
    };

  }

  if (
    value.includes(
      'COACH'
    )
  ) {

    return {
      icon:
        '★',
      type:
        'coach'
    };

  }

  if (
    value.includes(
      'ZERO'
    )
  ) {

    return {
      icon:
        '✓',
      type:
        'zero'
    };

  }

  return {
    icon:
      '✦',
    type:
      'default'
  };

}


function renderRewardCards(
  rows
) {

  if (
    !rewardCards
  ) {

    return;

  }

  rewardCards.innerHTML =
    '';

  if (
    !rows.length
  ) {

    rewardCards.innerHTML = `

      <div class="empty-state">
        Belum ada Reward pada periode ini.
      </div>

    `;

    return;

  }

  rows.forEach(
    (
      row,
      index
    ) => {

      const visual =
        getRewardVisual(
          row.category
        );

      const card =
        document.createElement(
          'article'
        );

      card.className =
        `reward-card reward-${visual.type}`;

      card.style.setProperty(
        '--delay',
        `${index * 70}ms`
      );

      card.innerHTML = `

        <div class="reward-card-shine"></div>

        <div class="reward-category-icon">
          ${visual.icon}
        </div>

        <div class="reward-category">
          ${safeText(row.category)}
        </div>

        <div class="reward-winner-avatar">

          ${playerAvatarMarkup(
            row.employee_name,
            'reward-photo'
          )}

        </div>

        <h3>
          ${safeText(row.employee_name)}
        </h3>

        <p class="reward-department">
          ${safeText(row.department)}
        </p>

        <div class="reward-description">
          ${safeText(row.description)}
        </div>

        <span class="reward-player-type">
          ${safeText(row.participant_type)}
        </span>

      `;

      rewardCards.appendChild(
        card
      );

    }
  );

}


function renderRewardTable(
  rows
) {

  if (
    !rewardTableBody
  ) {

    return;

  }

  rewardTableBody.innerHTML =
    '';

  rows.forEach(
    row => {

      const tr =
        document.createElement(
          'tr'
        );

      tr.innerHTML = `

        <td>
          <strong>
            ${safeText(row.employee_name)}
          </strong>
        </td>

        <td>
          ${safeText(row.nip)}
        </td>

        <td>
          ${safeText(row.department)}
        </td>

        <td>
          <strong>
            ${safeText(row.category)}
          </strong>
        </td>

        <td>
          ${safeText(row.description)}
        </td>

        <td>
          ${safeText(row.participant_type)}
        </td>

      `;

      rewardTableBody.appendChild(
        tr
      );

    }
  );

}


/* ==========================================================
   PROFILE
========================================================== */

function initProfilePage() {

  if (
    profileLoaded
  ) {

    return;

  }

  profileLoaded =
    true;

  loadProfile();

}


async function loadProfile() {

  try {

    const response =
      await fetch(

        PROFILE_API +

        '?session=' +

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
      !response.ok ||
      !result.success
    ) {

      throw new Error(
        result.message ||
        'Profile gagal dimuat.'
      );

    }

    renderProfile(
      result
    );

  }

  catch(error) {

    console.error(
      'PROFILE:',
      error
    );

    if (
      profilePhotoStatus
    ) {

      profilePhotoStatus.textContent =
        'Profile gagal dimuat.';

    }

  }

}


function renderProfile(
  result
) {

  const profile =
    result.profile || {};

  const progress =
    result.progress || {};

  const game =
    result.game || {};

  const rewards =
    result.rewards || [];

  const name =
    profile.name ||
    currentUserName ||
    'PLAYER';

  if (
    profileName
  ) {

    profileName.textContent =
      String(
        name
      )
        .toUpperCase();

  }

  if (
    profileRole
  ) {

    profileRole.textContent =
      String(
        profile.role ||
        'USER'
      )
        .toUpperCase();

  }

  if (
    profileDepartment
  ) {

    profileDepartment.textContent =
      profile.department ||
      '-';

  }

  if (
    profileLocation
  ) {

    profileLocation.textContent =
      profile.location ||
      '-';

  }

  if (
    profileSuperior
  ) {

    profileSuperior.textContent =
      profile.superior ||
      '-';

  }

  renderProfilePhoto(
    profile.photo_url,
    name
  );

  if (
    profileRank
  ) {

    profileRank.textContent =
      normalizeRank(

        firstValue(

          progress.rank,

          calculateRankFromTotal(
            progress.total_approved
          )

        )

      );

  }

  const status =
    getProgressStatus(
      progress
    );

  if (
    profileSeasonStatus
  ) {

    profileSeasonStatus.textContent =
      status;

    profileSeasonStatus.classList.toggle(
      'winner',
      status === 'WINNER'
    );

  }

  if (
    profileSsSubmit
  ) {

    profileSsSubmit.textContent =
      formatNumber(
        progress.ss_submit
      );

  }

  if (
    profileSsDone
  ) {

    profileSsDone.textContent =
      formatNumber(
        progress.ss_done
      );

  }

  if (
    profilePointApproved
  ) {

    profilePointApproved.textContent =
      formatNumber(
        progress.point_approved
      );

  }

  if (
    profileLeaderboardPosition
  ) {

    profileLeaderboardPosition.textContent =

      game.position

        ? '#' +
          game.position

        : '-';

  }

  const gameScore =
    safeNumber(
      game.score
    );

  if (
    profileGameScore
  ) {

    profileGameScore.textContent =
      gameScore;

  }

  const percent =
    Math.min(
      100,
      Math.round(
        (
          gameScore /
          240
        ) *
        100
      )
    );

  if (
    profileGameProgress
  ) {

    profileGameProgress.style.width =
      percent +
      '%';

  }

  if (
    profileGameText
  ) {

    profileGameText.textContent =

      safeNumber(
        game.remaining
      ) === 0

        ? 'MAX POINT REACHED'

        : safeNumber(
            game.remaining
          ) +
          ' point to max';

  }

  renderProfileMonths(
    progress
  );

  renderProfileAchievements(
    rewards
  );

}


function renderProfilePhoto(
  photo,
  name
) {

  if (
    !profileAvatar
  ) {

    return;

  }

  if (
    photo
  ) {

    profileAvatar.classList.add(
      'has-photo'
    );

    profileAvatar.innerHTML = `

      <img
        src="${escapeHtml(photo)}"
        alt="${escapeHtml(name)}"
      >

    `;

  }

  else {

    profileAvatar.classList.remove(
      'has-photo'
    );

    profileAvatar.textContent =
      getInitials(
        name
      );

  }

}


function renderProfileMonths(
  progress
) {

  if (
    !profileMonthGrid
  ) {

    return;

  }

  profileMonthGrid.innerHTML =
    '';

  const months = [

    {
      name:
        progress.month_1_name ||
        'MONTH 1',

      value:
        safeNumber(
          progress.month_1_value
        )
    },

    {
      name:
        progress.month_2_name ||
        'MONTH 2',

      value:
        safeNumber(
          progress.month_2_value
        )
    },

    {
      name:
        progress.month_3_name ||
        'MONTH 3',

      value:
        safeNumber(
          progress.month_3_value
        )
    }

  ];

  months.forEach(
    month => {

      const complete =
        month.value >= 1;

      const card =
        document.createElement(
          'article'
        );

      card.className =
        'profile-month-card ' +

        (
          complete
            ? 'complete'
            : 'missed'
        );

      card.innerHTML = `

        <span>
          ${safeText(month.name)}
        </span>

        <strong>
          ${month.value}
        </strong>

        <small>
          SS APPROVED
        </small>

        <b>

          ${
            complete
              ? 'COMPLETE'
              : 'MISSED'
          }

        </b>

      `;

      profileMonthGrid.appendChild(
        card
      );

    }
  );

}


function renderProfileAchievements(
  rewards
) {

  if (
    !profileAchievements
  ) {

    return;

  }

  profileAchievements.innerHTML =
    '';

  if (
    !rewards.length
  ) {

    profileAchievements.innerHTML = `

      <div class="empty-state">
        No achievement unlocked yet.
        Keep playing and improving.
      </div>

    `;

    return;

  }

  rewards.forEach(
    reward => {

      const visual =
        getRewardVisual(
          reward.category
        );

      const card =
        document.createElement(
          'article'
        );

      card.className =
        'profile-achievement-card';

      card.innerHTML = `

        <div class="achievement-icon">
          ${visual.icon}
        </div>

        <span>
          UNLOCKED
        </span>

        <h3>
          ${safeText(reward.category)}
        </h3>

        <p>
          ${safeText(reward.description)}
        </p>

      `;

      profileAchievements.appendChild(
        card
      );

    }
  );

}


/* ==========================================================
   PROFILE PHOTO
========================================================== */

if (
  profilePhotoInput
) {

  profilePhotoInput.addEventListener(
    'change',
    async function() {

      const file =
        profilePhotoInput.files?.[0];

      if (
        !file
      ) {

        return;

      }

      const allowedTypes = [

        'image/jpeg',

        'image/png',

        'image/webp'

      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        profilePhotoStatus.textContent =
          'Gunakan JPG, PNG atau WEBP.';

        return;

      }

      if (
        file.size >
        8 * 1024 * 1024
      ) {

        profilePhotoStatus.textContent =
          'File terlalu besar. Maksimal 8 MB sebelum kompresi.';

        return;

      }

      try {

        profilePhotoStatus.textContent =
          'Preparing photo...';

        pendingProfilePhoto =
          await prepareProfileImage(
            file
          );

        renderProfilePhoto(
          pendingProfilePhoto,
          currentUserName
        );

        profilePhotoSave.hidden =
          false;

        profilePhotoStatus.textContent =
          'Preview ready. Klik Save Photo.';

      }

      catch(error) {

        console.error(
          error
        );

        profilePhotoStatus.textContent =
          'Foto gagal diproses.';

      }

    }
  );

}


function prepareProfileImage(
  file
) {

  return new Promise(
    function(
      resolve,
      reject
    ) {

      const reader =
        new FileReader();

      reader.onload =
        function() {

          const image =
            new Image();

          image.onload =
            function() {

              const sourceSize =
                Math.min(
                  image.width,
                  image.height
                );

              const sourceX =
                (
                  image.width -
                  sourceSize
                ) /
                2;

              const sourceY =
                (
                  image.height -
                  sourceSize
                ) /
                2;

              const canvas =
                document.createElement(
                  'canvas'
                );

              canvas.width =
                700;

              canvas.height =
                700;

              const context =
                canvas.getContext(
                  '2d'
                );

              context.drawImage(

                image,

                sourceX,

                sourceY,

                sourceSize,

                sourceSize,

                0,

                0,

                700,

                700

              );

              resolve(

                canvas.toDataURL(
                  'image/jpeg',
                  0.82
                )

              );

            };

          image.onerror =
            reject;

          image.src =
            reader.result;

        };

      reader.onerror =
        reject;

      reader.readAsDataURL(
        file
      );

    }
  );

}


if (
  profilePhotoSave
) {

  profilePhotoSave.addEventListener(
    'click',
    async function() {

      if (
        !pendingProfilePhoto
      ) {

        return;

      }

      try {

        profilePhotoSave.disabled =
          true;

        profilePhotoStatus.textContent =
          'Uploading photo...';

        const response =
          await fetch(

            PROFILE_PHOTO_API,

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
                    sessionToken,

                  imageData:
                    pendingProfilePhoto

                })

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
            'Upload gagal.'
          );

        }

        const key =
          String(
            currentUserName
          )
            .trim()
            .toUpperCase();

        playerPhotoMap[
          key
        ] =
          result.photo_url;

        pendingProfilePhoto =
          '';

        profilePhotoSave.hidden =
          true;

        renderProfilePhoto(
          result.photo_url,
          currentUserName
        );

        renderHeaderPhoto();

        profilePhotoStatus.textContent =
          'Profile photo updated ✓';

        /*
          Force refresh other pages
          so new photo appears everywhere.
        */

        pointLoaded =
          false;

        leaderboardLoaded =
          false;

        rewardLoaded =
          false;

      }

      catch(error) {

        console.error(
          'PHOTO UPLOAD:',
          error
        );

        profilePhotoStatus.textContent =
          error.message ||
          'Upload foto gagal.';

      }

      finally {

        profilePhotoSave.disabled =
          false;

      }

    }
  );

}


/* ==========================================================
   SEARCH EVENTS
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
          400
        );

    }
  );

}


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


if (
  leaderboardSearch
) {

  leaderboardSearch.addEventListener(
    'input',
    function() {

      clearTimeout(
        leaderboardSearchTimer
      );

      leaderboardSearchTimer =
        setTimeout(
          function() {

            leaderboardPage =
              1;

            loadLeaderboard();

          },
          400
        );

    }
  );

}


if (
  rewardSearch
) {

  rewardSearch.addEventListener(
    'input',
    function() {

      clearTimeout(
        rewardSearchTimer
      );

      rewardSearchTimer =
        setTimeout(
          loadRewards,
          400
        );

    }
  );

}


if (
  rewardParticipantFilter
) {

  rewardParticipantFilter.addEventListener(
    'change',
    loadRewards
  );

}


/* ==========================================================
   LIMIT EVENTS
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


if (
  leaderboardLimit
) {

  leaderboardLimit.addEventListener(
    'change',
    function() {

      leaderboardPage =
        1;

      loadLeaderboard();

    }
  );

}


/* ==========================================================
   PAGINATION
========================================================== */

if (
  databasePrev
) {

  databasePrev.addEventListener(
    'click',
    function() {

      if (
        databasePage >
        1
      ) {

        databasePage--;

        loadDatabase();

      }

    }
  );

}


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


if (
  pointPrev
) {

  pointPrev.addEventListener(
    'click',
    function() {

      if (
        pointPage >
        1
      ) {

        pointPage--;

        loadPoint();

      }

    }
  );

}


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


if (
  leaderboardPrev
) {

  leaderboardPrev.addEventListener(
    'click',
    function() {

      if (
        leaderboardPage >
        1
      ) {

        leaderboardPage--;

        loadLeaderboard();

      }

    }
  );

}


if (
  leaderboardNext
) {

  leaderboardNext.addEventListener(
    'click',
    function() {

      if (
        leaderboardPage <
        leaderboardTotalPages
      ) {

        leaderboardPage++;

        loadLeaderboard();

      }

    }
  );

}


/* ==========================================================
   EXPORT
========================================================== */

if (
  databaseExport
) {

  databaseExport.addEventListener(
    'click',
    function() {

      const params =
        new URLSearchParams();

      const search =
        databaseSearch
          ? databaseSearch.value.trim()
          : '';

      if (
        search
      ) {

        params.set(
          'search',
          search
        );

      }

      window.location.href =

        DATABASE_EXPORT_API +

        (
          params.toString()

            ? '?' +
              params.toString()

            : ''
        );

    }
  );

}


if (
  pointExport
) {

  pointExport.addEventListener(
    'click',
    function() {

      const params =
        new URLSearchParams();

      const search =
        pointSearch
          ? pointSearch.value.trim()
          : '';

      if (
        search
      ) {

        params.set(
          'search',
          search
        );

      }

      window.location.href =

        POINT_EXPORT_API +

        (
          params.toString()

            ? '?' +
              params.toString()

            : ''
        );

    }
  );

}


if (
  leaderboardExport
) {

  leaderboardExport.addEventListener(
    'click',
    function() {

      const params =
        new URLSearchParams();

      const search =
        leaderboardSearch
          ? leaderboardSearch.value.trim()
          : '';

      if (
        search
      ) {

        params.set(
          'search',
          search
        );

      }

      window.location.href =

        LEADERBOARD_EXPORT_API +

        (
          params.toString()

            ? '?' +
              params.toString()

            : ''
        );

    }
  );

}


if (
  rewardExport
) {

  rewardExport.addEventListener(
    'click',
    function() {

      window.location.href =

        REWARD_EXPORT_API +

        '?session=' +

        encodeURIComponent(
          sessionToken
        );

    }
  );

}


/* ==========================================================
   REWARD REVEAL
========================================================== */

if (
  rewardRevealButton
) {

  rewardRevealButton.addEventListener(
    'click',
    function() {

      const cards =
        rewardCards
          ? rewardCards.querySelectorAll(
              '.reward-card'
            )
          : [];

      cards.forEach(
        (
          card,
          index
        ) => {

          card.classList.remove(
            'revealed'
          );

          setTimeout(
            function() {

              card.classList.add(
                'revealed'
              );

            },
            index * 130
          );

        }
      );

      rewardRevealButton.textContent =
        '✦ WINNERS REVEALED';

    }
  );

}


/* ==========================================================
   DATABASE HELPERS
========================================================== */

function tableCell(
  value,
  className = ''
) {

  return `

    <td${
      className
        ? ` class="${className}"`
        : ''
    }>

      ${safeText(value)}

    </td>

  `;

}


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
    [
      'DONE',
      'APPROVED',
      'QUALIFIED',
      'WINNER'
    ].includes(
      status
    )
  ) {

    return 'status-success';

  }

  if (
    [
      'NOT APPROVED',
      'FAILED',
      'LOSE',
      'LOSER',
      'NOT QUALIFIED'
    ].includes(
      status
    )
  ) {

    return 'status-danger';

  }

  if (
    [
      'SUBMITTED',
      'IMPLEMENTASI',
      'NEED REVISION'
    ].includes(
      status
    )
  ) {

    return 'status-warning';

  }

  return '';

}


function formatDate(
  value
) {

  if (
    !value
  ) {

    return '-';

  }

  const match =
    String(
      value
    ).match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (
    !match
  ) {

    return value;

  }

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

    match[3] +

    ' ' +

    monthNames[
      Number(
        match[2]
      )
    ] +

    ' ' +

    match[1]

  );

}


function formatDateTime(
  value
) {

  if (
    !value
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

    return value;

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

    return value;

  }

}


/* ==========================================================
   MUSIC
========================================================== */

async function tryStartMusic() {

  if (
    !bgMusic
  ) {

    return;

  }

  try {

    bgMusic.volume =
      0.25;

    await bgMusic.play();

    if (
      musicButton
    ) {

      musicButton.textContent =
        'II';

    }

  }

  catch {

    if (
      musicButton
    ) {

      musicButton.textContent =
        '▶';

    }

  }

}


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

        try {

          await bgMusic.play();

          musicButton.textContent =
            'II';

        }

        catch {

          /* ignored */

        }

      }

      else {

        bgMusic.pause();

        musicButton.textContent =
          '▶';

      }

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
   START APPLICATION
========================================================== */

document.addEventListener(
  'DOMContentLoaded',
  function() {

    loadDashboard();

  }
);
