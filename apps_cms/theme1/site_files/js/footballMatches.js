let closemButton = document.getElementById('closeMButton');
let mainfootballMatches = document.getElementById('mainfootballMatches');
let footballMatchesToggle = document.getElementById('footballMatchesToggle');
if (footballMatchesToggle) {
  footballMatchesToggle.addEventListener('mousedown', () => {
    mainfootballMatches.classList.add('showAnddisplay');
  });
  closemButton.addEventListener('mousedown', () => {
    mainfootballMatches.classList.remove('showAnddisplay');
  });
}
