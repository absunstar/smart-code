function playCurrentVideo() {
  if ((videoPlayer = document.querySelector('video'))) {
    videoPlayer.play();
  }
}
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
