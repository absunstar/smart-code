// start open gold price and close//
let closegButton = document.getElementById('closeButton');
let mainGoldprice = document.getElementById('mainGoldprice');
let goldpricetoggle= document.getElementById('goldpricetoggle');


goldpricetoggle.addEventListener("mousedown", () => {
    mainGoldprice.classList.add('showAnddisplay') ;
    console.log("test");
});
closegButton.addEventListener("mousedown", () => {
    mainGoldprice.classList.remove('showAnddisplay') ;
    console.log("test");
});
// end open gold price and close//

// start slider //

let sliderContainer = document.querySelector('.slider-container');
let innerSlider = document.querySelector('.inner-slider');

let pressed = false;
let startX;
let x;

sliderContainer.addEventListener("mousedown", (e) => {
    pressed = true;
    startX = e.offsetX - innerSlider.offsetLeft;
    sliderContainer.style.cursor = "grabbing";
    checkBoundary();
});

sliderContainer.addEventListener("mouseenter", () => {
    sliderContainer.style.cursor = "grab";
});

sliderContainer.addEventListener("mouseup", () => {
    sliderContainer.style.cursor = "grab";
    pressed = false;
});

sliderContainer.addEventListener("mousemove", (e) => {
    if (!pressed) return;
    e.preventDefault();

    x = e.offsetX;

    innerSlider.style.left = `${x - startX}px`;
});

const checkBoundary = () => {
    let outer = sliderContainer.getBoundingClientRect();
    let inner = innerSlider.getBoundingClientRect();

    if (parseInt(innerSlider.style.left) > 0) {
        innerSlider.style.left = "0px";
    }

    if (inner.right < outer.right) {
        innerSlider.style.left = `-${inner.width - outer.width}px`;
    }
};

// end slider //