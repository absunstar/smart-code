// start open football matches and close//
let closemButton = document.getElementById('closeMButton');
let mainfootballMatches = document.getElementById('mainfootballMatches');
let footballMatchesToggle= document.getElementById('footballMatchesToggle');


footballMatchesToggle.addEventListener("mousedown", () => {
    mainfootballMatches.classList.add('showAnddisplay') ;
});
closemButton.addEventListener("mousedown", () => {
    mainfootballMatches.classList.remove('showAnddisplay') ;
});
// end open football matches and close//