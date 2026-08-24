/* =====================================================
   SS RANK UP SEASON
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   MUSIC
===================================================== */

let musicPlaying = false;


function toggleMusic() {

  const music =
    document.getElementById('bgMusic');

  const button =
    document.getElementById('musicBtn');


  if (!music || !button) {

    console.log(
      'Background music element tidak ditemukan.'
    );

    return;

  }


  /* =========================
     PAUSE
  ========================== */

  if (!music.paused) {

    music.pause();

    musicPlaying = false;

    button.innerHTML = '♪';

    button.classList.remove(
      'playing'
    );

    button.title =
      'Play Music';

    return;

  }



  /* =========================
     PLAY
  ========================== */

  music.volume = 0.4;


  music.play()

    .then(function() {


      musicPlaying = true;


      button.innerHTML =
        '❚❚';


      button.classList.add(
        'playing'
      );


      button.title =
        'Pause Music';


    })

    .catch(function(error) {


      console.error(
        'Music error:',
        error
      );


      musicPlaying = false;


      button.innerHTML =
        '♪';


      button.classList.remove(
        'playing'
      );


      alert(
        'Musik belum dapat diputar. Pastikan file "Rank Up Season.mp3" sudah berada di folder assets/music.'
      );


    });

}



/* =====================================================
   CHECK MUSIC
===================================================== */

document.addEventListener(
  'DOMContentLoaded',
  function() {


    const music =
      document.getElementById(
        'bgMusic'
      );


    if (!music) {

      console.log(
        'Audio element tidak ditemukan.'
      );

      return;

    }



    /* MUSIC LOADED */

    music.addEventListener(
      'canplaythrough',
      function() {

        console.log(
          'Rank Up Season music ready.'
        );

      }
    );



    /* MUSIC ERROR */

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
);



/* =====================================================
   NAVIGATION ACTIVE STATE
===================================================== */

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
