let closeVButton = document.getElementById('closeVButton');
let videopalyer = document.getElementById('videopalyer');
let videopalyicon= document.querySelector('.videoArticle');

closeVButton.addEventListener("mousedown", () => {
    videopalyer.classList.remove('showAnddisplay') ;
});
videopalyicon.addEventListener("mousedown", () => {
    videopalyer.classList.add('showAnddisplay') ;
});
