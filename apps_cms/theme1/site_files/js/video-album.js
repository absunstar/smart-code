(() => {
  let videopalyer = document.getElementById('videopalyer');
  let videoNews = document.getElementById('videoNews');

  if ((closeVButton = document.getElementById('closeVButton'))) {
    closeVButton.addEventListener('mousedown', () => {
      videopalyer.classList.remove('showAnddisplay');
      console.log('test');
    });
    videoNews.addEventListener('mousedown', () => {
      videopalyer.classList.add('showAnddisplay');
      console.log('test');
    });
  }
})();
