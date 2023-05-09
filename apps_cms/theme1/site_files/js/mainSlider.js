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
    if(i=== 0){
      mainImage = allSmallImage[i].src;
      let mainImageUrl = "url('" + mainImage + "')";
      document.getElementById('mainslide').style.backgroundImage = mainImageUrl;
      document.querySelector('.MS-newstitle').innerHTML = allsmallnewstitle[i].innerHTML;
      document.querySelector('.newsday').innerHTML = slideDays[i].innerHTML;
      document.querySelector('.newsdate').innerHTML = slideDates[i].innerHTML;
    }
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
