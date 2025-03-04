var app = app || angular.module("myApp", []);
app.controller("teacherTheme", function ($scope, $http, $timeout) {
  $scope.setting = site.showObject(`##data.#setting##`);
  $scope.changeLang = function (language) {
    if (typeof language == 'string') {
      language = { id: language, dir: 'rtl', text: 'right' };
      if (language.id.like('*en*')) {
        language.dir = 'ltr';
        language.text = 'left';
      }
    }
    $http({
      method: 'POST',
      url: '/x-language/change',
      data: language,
    }).then(function (response) {
      if (response.data.done) {
        window.location.reload(!0);
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

  $scope.getSchoolYearsList = function (educationalLevelId) {
    $scope.busy = true;
    $scope.schoolYearsList = [];
    $http({
      method: "POST",
      url: "/api/schoolYears/all",
      data: {
        where: {
          active: true,
          "educationalLevel.id": educationalLevelId,
        },
        select: {
          id: 1,
          name: 1,
          image: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.schoolYearsList = response.data.list;
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
        url: document.location.origin + "/view-live?id=" + lectureId,
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

  if($scope.setting?.educationalLevel?.id){

    $scope.getSchoolYearsList($scope.setting.educationalLevel.id)
  }
});
