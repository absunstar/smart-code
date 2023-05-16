document.querySelectorAll('.videoArticle').forEach((v) => {
  v.addEventListener('click', () => {
    if ((videoPlayer = v.parentNode.querySelector('#videopalyer'))) {
      videoPlayer.classList.add('showAnddisplay');
    }
  });
});
/*
let allcloseAButton = document.querySelectorAll('.closeAButton');
let allaudiopalyer = document.querySelectorAll('.audiopalyer');
let allaudioFile = document.querySelectorAll('.audioFile');
for (let i = 0; i < allaudioFile.length; i++) {
  allaudioFile[i].addEventListener('mousedown', () => {
    allaudiopalyer[i].classList.add('showAnddisplay');
  });
  for (let i = 0; i < allcloseAButton.length; i++) {
    allcloseAButton[i].addEventListener('mousedown', () => {
      allaudiopalyer[i].classList.remove('showAnddisplay');
    });
  }
}
*/