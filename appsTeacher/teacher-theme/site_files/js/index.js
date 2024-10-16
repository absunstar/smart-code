var app = app || angular.module("myApp", []);
app.controller("teacherTheme", function ($scope, $http, $timeout) {
  $scope.setting = site.showObject(`##data.#setting##`);
  $scope.changeLang = function (lang) {
    $http({
      method: "POST",
      url: "/x-language/change",
      data: { name: lang },
    }).then(function (response) {
      if (response.data.done) {
        window.location.reload(true);
      }
    });
  };
  $scope.selectTeacher = function (id) {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/selectTeacher",
      data: id,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          window.location.href = "/";
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };


  $scope.openLive = function (lectureId) {
    if (!window.SOCIALBROWSER && !$scope.setting.allowVideoMobile) {
      site.showModal("#socialBrowserModal");
      return;
    }

    $scope.error = "";
    if (window.SOCIALBROWSER) {
      $scope.busy = true;

      let code_injected = `/*##lectures/custom-youtube-video.js*/`;
      code_injected += "youtubeRun();";
      SOCIALBROWSER.ipc("[open new popup]", {
        url: document.location.origin + "/view-life?id=" + lectureId,
        eval: code_injected,
        show: true,
        iframe: true,
        center: true,
        maximize: true,
        trusted: true,
        showDevTools: false,
        allowMenu: true,
        allowDevTools: false,
        allowDownload: false,
        allowAds: false,
        allowNewWindows: false,
        allowSaveUserData: false,
        allowSaveUrls: false,
        allowSocialBrowser: true,
        // allowRedirect: false,
        allowSelfRedirect: false,
        allowSelfWindow: false,
        allowJavascript: true,
        allowAudio: true,
        allowPopup: false,
        width: 800,
        height: 800,
        security: false,
        $timeout: 5000,
      });
    } else if (site.isMobile()) {
      window.open(`/view-live?id=${lectureId}`);
    } else {
      site.showModal("#socialBrowserModal");
      return;
    }
  };

  $scope.centersView = function () {
    $scope.error = "";
    if ("##user.id##" > 0) {
      window.location.href = "/centersView";
    } else {
      window.location.href = "/login";
    }
  };
});
