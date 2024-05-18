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
        id: site.toNumber("##query.id##"),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
          document.getElementById("description").innerHTML =
            $scope.item.description;
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
    site.showModal("#codeModal");
  };

  $scope.buyLecture = function () {
    $scope.errorCode = "";
    const v = site.validated("#codeModal");
    if (!v.ok) {
      $scope.errorCode = v.messages[0].ar;
      return;
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
        "lecture.id": site.toNumber("##query.id##"),
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
          $scope.startQuizTime('finish');
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
        lecture: { id: $scope.item.id, name: $scope.item.name },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.quiz = response.data.doc;
          $scope.startQuizTime('start');
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
        document.getElementById("timer").innerHTML =
          "##word.Remaining Time##" + " ( " + secound + " : " + minute + " ) ";
      } else {
        document.getElementById("timer").innerHTML =
          "##word.Remaining Time##" + " ( " + minute + " : " + secound + " ) ";
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
