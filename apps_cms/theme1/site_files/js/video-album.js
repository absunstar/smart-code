// start open video album and close//
let closeVButton = document.getElementById('closeVButton');
let videopalyer = document.getElementById('videopalyer');
let videoNews= document.getElementById('videoNews');

closeVButton.addEventListener("mousedown", () => {
    videopalyer.classList.remove('showAnddisplay') ;
    console.log("test");
});
videoNews.addEventListener("mousedown", () => {
    videopalyer.classList.add('showAnddisplay') ;
    console.log("test");
});
// end open video album and close//