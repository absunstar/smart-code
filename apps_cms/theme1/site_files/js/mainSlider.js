let MSsliderContainer = document.querySelector('.MS-slider-container');
let MSinnerslider = document.querySelector('.MS-inner-slider');

if (MSsliderContainer) {
  let MSpressed = false;
  let MSstartX;
  let MSx;

  MSsliderContainer.addEventListener('mousedown', (e) => {
    MSpressed = true;
    MSstartX = e.offsetX - MSinnerslider.offsetLeft;
    MSsliderContainer.style.cursor = 'grabbing';
    MScheckBoundary();
  });

  MSsliderContainer.addEventListener('mouseenter', () => {
    MSsliderContainer.style.cursor = 'grab';
  });

  MSsliderContainer.addEventListener('mouseup', () => {
    MSsliderContainer.style.cursor = 'grab';
    MSpressed = false;
  });

  MSsliderContainer.addEventListener('mousemove', (e) => {
    if (!MSpressed) return;
    e.preventDefault();

    MSx = e.offsetX;

    MSinnerslider.style.left = `${MSx - MSstartX}px`;
  });

  const MScheckBoundary = () => {
    let outer = MSsliderContainer.getBoundingClientRect();
    let inner = MSinnerslider.getBoundingClientRect();

    if (parseInt(MSinnerslider.style.left) > 0) {
      MSinnerslider.style.left = '-474px';
    }

    if (inner.right < outer.right) {
      MSinnerslider.style.left = `-${inner.width - outer.width}px`;
    }
  };

  let slideImageNews = document.querySelectorAll('.slide-imageNews');
  let slideDays = document.querySelectorAll('.slide-day');
  let slideDates = document.querySelectorAll('.slide-date');
  let mainSlide = document.getElementById('mainslide').style.backgroundImage;
  let mainImage = mainSlide.match(/url\(["']?([^"']*)["']?\)/)[1];
  let allSmallImage = document.querySelectorAll('.smallSlideIamge');

  let allsmallnewstitle = document.querySelectorAll('.slide-newstitle');
  for (let i = 0; i < slideImageNews.length; i++) {
    slideImageNews[i].addEventListener('mouseenter', () => {
      mainImage = allSmallImage[i].currentSrc;
      let mainImageUrl = "url('" + mainImage + "')";
      document.getElementById('mainslide').style.backgroundImage = mainImageUrl;
      document.querySelector('.MS-newstitle').innerHTML = allsmallnewstitle[i].innerHTML;
      document.querySelector('.newsday').innerHTML = slideDays[i].innerHTML;
      document.querySelector('.newsdate').innerHTML = slideDates[i].innerHTML;
    });
  }
}

var slideURL = '';
var MScardsIndex = -1;
var MScards = document.querySelectorAll('.mainslide .MS-card');
setInterval(() => {
  MScardsIndex++;
  if (MScardsIndex >= MScards.length) {
    MScardsIndex = 0;
  }
  let s = MScards[MScardsIndex];
  if (s) {
    document.querySelector('#mainslide').style.backgroundImage = "url('" + s.querySelector('img').src + "')";
    document.querySelector('.MS-newstitle').innerHTML = s.querySelector('.slide-newstitle').innerHTML;
    document.querySelector('.newsday').innerHTML = s.querySelector('.slide-day').innerHTML;
    document.querySelector('.newsdate').innerHTML = s.querySelector('.slide-date').innerHTML;
    slideURL = s.querySelector('.slide-link').href;
  }
}, 1000 * 3);

gotoSlide = function () {
  if (slideURL) {
    document.location.href = slideURL;
  }
};
