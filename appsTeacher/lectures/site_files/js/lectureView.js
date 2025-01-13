app.controller("lectureView", function ($scope, $http, $timeout) {
  $scope.item = {};
  $scope.quiz = {};
  $scope.setting = site.showObject(`##data.#setting##`);
  $scope.purchase = {};
  $scope.baseURL = "";
  $scope.view = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/lectures/viewToStudent`,
      data: {
        _id: "##query.id##",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
          $scope.quizView();
          $scope.getPurchaseTypeTeacher($scope.item.teacherId);
          if($scope.item.$buy){

            $scope.alert = "##word.Purchased##";
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showEnterCode = function () {
    $scope.code = "";

    if (site.toNumber("##user.id##") < 1) {
      window.location.href = "/login";
    } else if ($scope.item.price === 0) {
      $scope.buyLecture("free");
    } else {
      site.showModal("#codeModal");
    }
  };

  $scope.buyLecture = function (type) {
    $scope.errorCode = "";
    if (type != "free") {
      const v = site.validated("#codeModal");
      if (!v.ok) {
        $scope.errorCode = v.messages[0].Ar;
        return;
      }
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/lectures/buyCode`,
      data: {
        purchase: $scope.purchase,
        lectureId: $scope.item.id,
        lecturePrice: $scope.item.price,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#codeModal");
          site.resetValidated("#codeModal");
          if (!response.data.isOpen) {
            $scope.alert = "##word.Please wait until your payment details are reviewed and your purchase is confirmed##";
          }
          $scope.view();
        } else {
          $scope.errorCode = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.quizView = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/quizzes/viewByUserLecture`,
      data: {
        "lecture.id": $scope.item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        
        if (response.data.done) {
          $scope.quiz = response.data.doc;
          console.log($scope.quiz);
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getPurchaseTypeTeacher = function (teacherId) {
    $scope.busy = true;
    $scope.error = "";
    $scope.purchaseTypeList = [];
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/manageUsers/purchaseTypeTeacher`,
      data: teacherId,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.purchaseTypeList = response.data.list;
          $scope.purchase.purchaseType = $scope.purchaseTypeList.find((p) => p.default);
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.openVideo = function (link) {
    if (!window.SOCIALBROWSER && !$scope.setting.allowVideoMobile) {
      site.showModal("#socialBrowserModal");
      return;
    }

    $scope.error = "";
    if (window.SOCIALBROWSER) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: `${$scope.baseURL}/api/lectures/changeView`,
        data: {
          socialBrowserID: SOCIALBROWSER.var.core.id,
          code: link.code,
          _id: "##query.id##",
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            let code_injected = `/*##lectures/custom-youtube-video.js*/`;
            code_injected += "youtubeRun();";
            SOCIALBROWSER.ipc("[open new popup]", {
              url: document.location.origin + "/view-video?code=" + link.code + "&id=" + $scope.item._id,
              eval: code_injected,
              show: true,
              iframe: true,
              center: true,
              maximize: true,
              trusted: true,
              allowMenu: true,
              showDevTools: false,
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
            if ($scope.item.typeExpiryView && $scope.item.typeExpiryView.name == "number") {
              let index = $scope.item.linksList.findIndex((itm) => itm.code === link.code);
              if (index !== -1) {
                $scope.item.linksList[index].remainNumber -= 1;
              }
            }
          } else {
            $scope.error = response.data.error;
          }
        },
        function (err) {
          $scope.busy = false;
        }
      );
    } else if (site.isMobile()) {
      $http({
        method: "POST",
        url: `${$scope.baseURL}/api/lectures/changeViewMobile`,
        data: {
          code: link.code,
          _id: "##query.id##",
        },
      }).then(function (response) {
        $scope.busy = false;
        if (response.data.done) {
          
          window.open(`/view-video?code=${link.code}&id=${$scope.item._id}`);
        }
      });
    } else {
      site.showModal("#socialBrowserModal");
      return;
    }
  };

  $scope.finishQuiz = function (quiz) {
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/quizzes/finishQuiz",
      data: quiz,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.quiz = response.data.doc;
          $scope.startQuizTime("finish");
          site.hideModal("#tackQuizModal");
        } else if (response.data.error) {
          $scope.error = response.data.error;
          if (response.data.error.like("*no questions for the exam*")) {
            $scope.error = "##word.no_questions_for_exam##";
          } else {
            $scope.error = "##word.there_error_while_taking_exam##";
          }
        }
      },
      function (err) {
        $scope.busy = false;
      }
    );
  };

  $scope.startQuiz = function () {
    $scope.error = "";
    $scope.quiz = {};
    $http({
      method: "POST",
      url: "/api/quizzes/startQuiz",
      data: {
        where: {
          "lecture.id": $scope.item.id,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.quiz = response.data.doc;
          $scope.startQuizTime("start");
        } else if (response.data.error) {
          $scope.error = response.data.error;
          if (response.data.error.like("*no questions for the exam*")) {
            $scope.error = "##word.no_questions_for_exam##";
          } else {
            $scope.error = "##word.there_error_while_taking_exam##";
          }
        }
      },
      function (err) {
        $scope.busy = false;
      }
    );
  };

  $scope.startQuizTime = function (type) {
    $scope.error = "";
    let minute = $scope.item.quizDuration - 1;
    let secound = 59;
    if (type == "start") {
      site.showModal("#tackQuizModal");
    }
    const timeQuizInterval = setInterval(function () {
      if (type == "finish") {
        clearInterval(timeQuizInterval);
      }
      if ("##session.lang##" == "Ar") {
        document.getElementById("timer").innerHTML = "##word.Remaining Time##" + " ( " + secound + " : " + minute + " ) ";
      } else {
        document.getElementById("timer").innerHTML = "##word.Remaining Time##" + " ( " + minute + " : " + secound + " ) ";
      }
      secound--;
      if (secound == 0) {
        if (secound <= 1 && minute < 1) {
          $scope.finishQuiz($scope.quiz);
        }
        minute--;
        secound = 60;
      }
    }, 1000);
  };

  $scope.checkCorrect = function (answersList, index) {
    $scope.error = "";
    answersList.forEach((_a, i) => {
      if (i != index) {
        _a.userAnswer = false;
      }
    });
  };

  $scope.view();
});
