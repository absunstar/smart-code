app.controller("view-video", function ($scope, $http, $timeout) {
  document.querySelector("iframe").addEventListener("load", function () {
    this.style.display = "block";
  });
  let setting = site.showObject("##data.#setting##");
  setting.blockPrograms = setting.blockPrograms || {};
  let exec = require("child_process").exec;
  exec("tasklist", function (err, stdout, stderr) {
    var programsList = [];
    var lines = stdout.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line === "") continue;
      var values = line.split(/\s+/);
      programsList.push({
        imageName: values[0],
        pid: values[1],
        sessionName: values[2],
        sessionNumber: values[3],
        memUsage: values[4],
      });
    }
      if (setting.blockPrograms.programsNamesList && setting.blockPrograms.programsNamesList.length > 0) {
        for (let i = 0; i < setting.blockPrograms.programsNamesList.length; i++) {
          let index = programsList.findIndex((itm) => itm.imageName === setting.blockPrograms.programsNamesList[i].name);
          if (index !== -1) {
            process.kill(programsList[index].pid);
          }
        }
      }
  });
});
