n = new Date();
y = n.getFullYear();
m = n.getMonth() + 1;
d = n.getDate();
document.getElementById('todaydateXlscreen').innerHTML = m + '/' + d + '/' + y;

function playVideo(src) {
  if ((a = document.querySelector('#videopalyer'))) {
    a.classList.add('videopalyer');
    if ((v = a.querySelector('video'))) {
      v.src = src;
      v.play();
    }
  }
}
function CloseVideo() {
  if ((a = document.querySelector('#videopalyer'))) {
    a.classList.remove('videopalyer');
    if ((au = a.querySelector('video'))) {
      au.pause();
      au.src = null;
    }
  }
}

function playAudio(src) {
  if ((a = document.querySelector('#audiopalyer'))) {
    a.classList.add('audiopalyer');
    if ((au = a.querySelector('audio'))) {
      au.src = src;
      au.play();
    }
  }
}
function CloseAudio() {
  if ((a = document.querySelector('#audiopalyer'))) {
    a.classList.remove('audiopalyer');
    if ((au = a.querySelector('audio'))) {
      au.pause();
      au.src = null;
    }
  }
}

var pt = window.matchMedia('(max-width: 425px)');
function myFunction(pt) {
  if (pt.matches) {
    let PrayerTime = document.querySelectorAll('.PrayerTime');
    let paryertimeItems = document.querySelectorAll('.paryertimeItems');
    for (let p = 0; p < PrayerTime.length; p++) {
      PrayerTime[p].addEventListener('click', () => {
        if (paryertimeItems[p].style.display == 'block') {
          paryertimeItems[p].style.display = 'none';
          console.log('mobiletoggelblock');
        } else {
          paryertimeItems[p].style.display = 'block';
          console.log('mobiletoggelnone');
        }
      });
    }
  } else {
    let PrayerTimeHover = document.querySelectorAll('.PrayerTime');
    let paryertimeItemsHover = document.querySelectorAll('.paryertimeItems');
    for (let i = 0; i < PrayerTimeHover.length; i++) {
      PrayerTimeHover[i].addEventListener('mouseout', () => {
        paryertimeItemsHover[i].style.display = 'none';
        console.log('desktophover');
      });
      PrayerTimeHover[i].addEventListener('mouseover', () => {
        paryertimeItemsHover[i].style.display = 'block';
        console.log('desktophover');
      });
    }
  }
}
myFunction(pt);

let closeButton = document.querySelector('.closeButton');
let burgermenuoverlay = document.getElementById('burgermenuoverlay');
let burgermenuToggle = document.getElementById('burgermenuToggle');

closeButton.addEventListener('mousedown', () => {
  burgermenuoverlay.classList.remove('showAnddisplay');
  console.log('test');
});
burgermenuToggle.addEventListener('mousedown', () => {
  burgermenuoverlay.classList.add('showAnddisplay');
  console.log('test');
});

let closeSButton = document.querySelectorAll('#closeSButton');
let albumimageslider = document.querySelectorAll('#albumimageslider');
let imagesFile = document.querySelectorAll('#imagesFile');
for (let i = 0; i < imagesFile.length; i++) {
  imagesFile[i].addEventListener('mousedown', () => {
    albumimageslider[i].classList.add('showAnddisplay');
    console.log('test');
  });
  for (let i = 0; i < closeSButton.length; i++) {
    closeSButton[i].addEventListener('mousedown', () => {
      albumimageslider[i].classList.remove('showAnddisplay');
      console.log('test');
    });
  }
}

let IsliderContainer = document.querySelectorAll('.imageslider-slider-container');
let IinnerSlider = document.querySelectorAll('.imageslider-inner-slider');
let albumImageSlider = document.querySelectorAll('.albumimageslider');

let Spressed = false;
let ISstartISx;
let ISx;
for (let i = 0; i < albumImageSlider.length; i++) {
  IsliderContainer[i].addEventListener('mousedown', (e) => {
    Spressed = true;
    ISstartISx = e.offsetX - IinnerSlider[i].offsetLeft;
    IsliderContainer[i].style.cursor = 'grabbing';
    IScheckBoundary();
  });

  IsliderContainer[i].addEventListener('mouseenter', () => {
    IsliderContainer[i].style.cursor = 'grab';
  });

  IsliderContainer[i].addEventListener('mouseup', () => {
    IsliderContainer[i].style.cursor = 'grab';
    Spressed = false;
  });

  IsliderContainer[i].addEventListener('mousemove', (e) => {
    if (!Spressed) return;
    e.preventDefault();

    ISx = e.offsetX;

    IinnerSlider[i].style.left = `${ISx - ISstartISx}px`;
  });

  const IScheckBoundary = () => {
    let outer = IsliderContainer[i].getBoundingClientRect();
    let inner = IinnerSlider[i].getBoundingClientRect();

    if (parseInt(IinnerSlider[i].style.left) > 0) {
      IinnerSlider[i].style.left = '0px';
    }

    if (inner.right < outer.right) {
      IinnerSlider[i].style.left = `-${inner.width - outer.width}px`;
    }
  };
}

let articlestimeItems = document.querySelectorAll('.articlestimeItems');
let moreDot = document.querySelectorAll('.moreDot');
let sectionTwo = document.querySelectorAll('.sectionTwo');
for (let i = 0; i < sectionTwo.length; i++) {
  moreDot[i].addEventListener('mousedown', () => {
    if (articlestimeItems[i].style.display === 'block') {
      articlestimeItems[i].style.display = 'none';
      console.log('test');
    } else {
      articlestimeItems[i].style.display = 'block';
      console.log('test');
    }
  });
}

let share = document.querySelectorAll('.share');
let shareMenu = document.querySelectorAll('.sharemenu');
let sharebutton = document.querySelectorAll('.sharebutton');

for (let s = 0; s < sharebutton.length; s++) {
  share[s].addEventListener('click', () => {
    if (shareMenu[s].style.display === 'block') {
      shareMenu[s].style.display = 'none';
      console.log('test');
    } else {
      shareMenu[s].style.display = 'block';
      console.log('test');
    }
  });
}

let voteprogres = document.querySelector('.voteprogres');
let survybutton = document.querySelector('.survybutton');
let answer = document.querySelector('.answer');
if (survybutton) {
  survybutton.addEventListener('mousedown', () => {
    if (voteprogres.style.display === 'flex' && answer.style.display === 'none') {
      voteprogres.style.display = 'none';
      answer.style.display = 'none';
    } else {
      voteprogres.style.display = 'flex';
      answer.style.display = 'none';
    }
  });
}

/*
function mainSliderMobile() {
  let slidertrack = document.querySelector('.MS-inner-slider');
  let slide = document.querySelectorAll('.frist-slider .MS-card');
  let slideCount = slide.length;
  let ChangeSLiderTime = 3000;
  let timerepet = slideCount * ChangeSLiderTime;

  moveslider();
  function moveslider() {
    for (let i = 0; i < slideCount; i++) {
      setTimeout(function () {
        sliderpx = -296;
        latestPostion = sliderpx;
        slidertrack.style.right = latestPostion * [i] + 'px';
        console.log(slidertrack.style.right);
        icount = i + 1;
        setTimeout(function () {
          if (icount === slideCount) {
            console.log(icount + ' ' + slideCount);
            slidertrack.style.right = '0px';
          }
        }, i * ChangeSLiderTime + ChangeSLiderTime);
      }, i * ChangeSLiderTime);
    }
  }
  repetmoveslider();
  function repetmoveslider() {
    moveslider();
  }
  setInterval(repetmoveslider, timerepet);
}

mainSliderMobile();
*/
