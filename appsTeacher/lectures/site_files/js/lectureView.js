app.controller("lectureView", function ($scope, $http, $timeout) {
  $scope.item = {};
  $scope.quiz = {};
  $scope.baseURL = "";
  $scope.view = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/lectures/view`,
      data: {
        _id: "##query.id##",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
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
        $scope.errorCode = v.messages[0].ar;
        return;
      }
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/lectures/buyCode`,
      data: {
        code: $scope.code,
        lectureId: $scope.item.id,
        lecturePrice: $scope.item.price,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#codeModal");
          site.resetValidated("#codeModal");
          $scope.code = "";
          $scope.item = response.data.doc;
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
        "user.id": site.toNumber("##user.id##"),
        "lecture._id": "##query.id##",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.quiz = response.data.doc;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.openVideo = function (link) {
    if (!window.SOCIALBROWSER) {
      site.showModal("#socialBrowserModal");
      return;
    }

    $scope.error = "";
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
            allowMenu: false,
            allowWindows: false,
            allowAudio: true,
            allowDev: false,
            width: 800,
            height: 800,
            security: true,
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
          "user.id": site.toNumber("##user.id##"),
        },
        questionsList: $scope.item.questionsList,
        lecture: { _id: $scope.item._id, id: $scope.item.id, name: $scope.item.name },
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
          clearInterval(timeQuizInterval);
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
  $scope.quizView();
});
