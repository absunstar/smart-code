app.controller("view-video", function ($scope, $http, $timeout) {
  document.querySelector("iframe").addEventListener("load", function () {
    this.style.display = "block";
  });
  let setting = site.showObject("##data.#setting##");
  setting.blockPrograms = setting.blockPrograms || {};
  function hideStudenData() {
    let  showme = document.getElementById("student-data");
    showme.style.display = "none";

    setTimeout(() => {
    
      showme.style.display = "flex";
    }, 1000 * 57);
  }
  setInterval(() => {
    hideStudenData();
  }, 1000 * 60);

  hideStudenData();

  if (window.SOCIALBROWSER) {
    setInterval(() => {
      setting.blockPrograms.programsNamesList.forEach((program) => {
        SOCIALBROWSER.kill(program.name);
      });
    }, 1000 * 3);
  }
});
