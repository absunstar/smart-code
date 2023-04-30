// start slider //

// start small slider animation //

let MSsliderContainer = document.querySelector('.MS-slider-container');
let MSinnerslider = document.querySelector('.MS-inner-slider');

let MSpressed = false;
let MSstartX;
let MSx;

MSsliderContainer.addEventListener("mousedown", (e) => {
    MSpressed = true;
    MSstartX = e.offsetX - MSinnerslider.offsetLeft;
    MSsliderContainer.style.cursor = "grabbing";
    MScheckBoundary();
});

MSsliderContainer.addEventListener("mouseenter", () => {
    MSsliderContainer.style.cursor = "grab";
});

MSsliderContainer.addEventListener("mouseup", () => {
    MSsliderContainer.style.cursor = "grab";
    MSpressed = false;
});

MSsliderContainer.addEventListener("mousemove", (e) => {
    if (!MSpressed) return;
    e.preventDefault();

    MSx = e.offsetX;

    MSinnerslider.style.left = `${MSx - MSstartX}px`;
});

const MScheckBoundary = () => {
    let outer = MSsliderContainer.getBoundingClientRect();
    let inner = MSinnerslider.getBoundingClientRect();

    if (parseInt(MSinnerslider.style.left) > 0) {
        MSinnerslider.style.left = "-474px";
    }

    if (inner.right < outer.right) {
        MSinnerslider.style.left = `-${inner.width - outer.width}px`;
    }
};

// end small slider animation //

// start change main news slider //

    let mainSlider = document.querySelector('.mainslider')
    let slideImageNews = document.querySelectorAll('.slide-imageNews');
    // main news slider data //
    let mainSlide = document.getElementById('mainslide').style.backgroundImage;
    let mainImage = mainSlide.match(/url\(["']?([^"']*)["']?\)/)[1];
    let mainnewstitle = document.querySelector('.MS-newstitle').innerHTML;
    // small news slider //
    let smallImage = document.querySelector('.smallSlideIamge').src;
    let allSmallImage = document.querySelectorAll('.smallSlideIamge');

    let allsmallnewstitle = document.querySelectorAll('.slide-newstitle');
    for(let i=0 ; i< slideImageNews.length; i++){
        slideImageNews[i].addEventListener("mouseenter", () => {
            mainImage = allSmallImage[i].currentSrc ;
            let mainImageUrl = "url('"+mainImage+"')";
            document.getElementById('mainslide').style.backgroundImage = mainImageUrl ;
            document.querySelector('.MS-newstitle').innerHTML = allsmallnewstitle[i].innerHTML;
        });
    }
// end change main news slider //
// end slider //