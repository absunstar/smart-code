// start open gold price and close//
let closeVButton = document.getElementById('closeVButton');
let videopalyer = document.getElementById('videopalyer');
let videopalyicon= document.getElementById('videopalyicon');

closeVButton.addEventListener("mousedown", () => {
    videopalyer.classList.remove('showAnddisplay') ;
    console.log("test");
});
videopalyicon.addEventListener("mousedown", () => {
    videopalyer.classList.add('showAnddisplay') ;
    console.log("test");
});
// end open gold price and close//