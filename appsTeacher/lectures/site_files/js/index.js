app.controller("lectures", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.appName = "lectures";
  $scope.setting = site.showObject(`##data.#setting##`);
  $scope.modalID = "#lecturesManageModal";
  $scope.modalSearchID = "#lecturesSearchModal";
  $scope.mode = "add";
  $scope._search = {};
  $scope.structure = {
    image: {},
    active: true,
  };
  $scope.item = {};
  $scope.list = [];

  $scope.showAdd = function (_item) {
    $scope.error = "";
    $scope.mode = "add";
    $scope.item = {
      ...$scope.structure,
      price: 0,
      linksList: [],
      filesList: [],
    };
    if(!$scope.setting.isOnline) {
      $scope.item.placeType = 'offline';
    }
    site.showModal($scope.modalID);
  };

  $scope.add = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/add`,
      data: $scope.item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
          $scope.list.unshift(response.data.doc);
        } else {
          $scope.error = response.data.error;
          if (response.data.error && response.data.error.like("*Must Enter Code*")) {
            $scope.error = "##word.Must Enter Code##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showUpdate = function (_item) {
    $scope.error = "";
    $scope.mode = "edit";
    $scope.view(_item);
    $scope.item = {};
    site.showModal($scope.modalID);
  };

  $scope.update = function (_item, modal) {
    $scope.error = "";
    const v = site.validated(modal);
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    if (modal == "#quizModal") {
      _item.$quiz = true;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/update`,
      data: _item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal(modal);
          site.resetValidated(modal);
          let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
          if (index !== -1) {
            $scope.list[index] = response.data.result.doc;
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

  $scope.showView = function (_item) {
    $scope.error = "";
    $scope.mode = "view";
    $scope.item = {};
    $scope.view(_item);
    site.showModal($scope.modalID);
  };

  $scope.view = function (_item, type) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/view`,
      data: {
        id: _item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
          if (type == "quiz") {
            site.showModal("#quizModal");
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

  $scope.showDelete = function (_item) {
    $scope.error = "";
    $scope.mode = "delete";
    $scope.item = {};
    $scope.view(_item);
    site.showModal($scope.modalID);
  };

  $scope.delete = function (_item) {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/delete`,
      data: {
        id: $scope.item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
          if (index !== -1) {
            $scope.list.splice(index, 1);
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

  $scope.getAll = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/all`,
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal($scope.modalSearchID);
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getQuestionTypesList = function () {
    $scope.busy = true;
    $scope.questionTypesList = [];
    $http({
      method: "POST",
      url: "/api/questionTypesList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.questionTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getTypesExpiryViewsList = function () {
    $scope.busy = true;
    $scope.typesExpiryViewsList = [];
    $http({
      method: "POST",
      url: "/api/typesExpiryViewsList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.typesExpiryViewsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getLecturesTypesList = function () {
    $scope.busy = true;
    $scope.lecturesTypesList = [];
    $http({
      method: "POST",
      url: "/api/lecturesTypesList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.lecturesTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSubscriptionsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.subscriptionsList = [];
    if ($scope.item.educationalLevel?.id && $scope.item.subject?.id) {
      $scope.busy = true;

      $http({
        method: "POST",
        url: "/api/subscriptions/all",
        data: {
          where: {
            active: true,
          },
          select: {
            id: 1,
            name: 1,
          },
          search: $search,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.subscriptionsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    } else {
      $scope.error = "##word.The required data must be completed##";
    }
  };

  $scope.getEducationalLevelsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.educationalLevelsList = [];

    $http({
      method: "POST",
      url: "/api/educationalLevels/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.educationalLevelsList = response.data.list;
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

  $scope.getSubjectsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/subjects/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name: 1 },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.subjectsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.activateQuiz = function () {
    $scope.error = "";
    if ($scope.activateQuiz) {
      $scope.item.quizDuration = 45;
      $scope.item.timesEnterQuiz = 1;
      $scope.item.questionsList = $scope.item.questionsList || [];
    }
  };

  $scope.activateSubscription = function () {
    $scope.error = "";
    $scope.getSubscriptionsList();
    if ($scope.item.activateSubscription) {
      $scope.item.subscriptionList = [{ price: 0 }];
    } else {
      $scope.item.subscriptionList = [];
    }
  };
  $scope.addSubscription = function () {
    $scope.error = "";
    $scope.item.subscriptionList.unshift({ price: 0 });
  };
  $scope.letterType = function (type, length) {
    let numbering = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
    let arabic = ["أ", "ب", "ج", "د", "ه", "و", "ز", "ح", "ط", "ي", "ك", "ل", "م", "ن", "س", "ع", "ف", "ص", "ق", "ر", "ش", "ت", "ث", "خ", "ذ", "ض", "ظ", "غ", "أ-أ", "ب-ب", "ج-ج", "د-د", "ه-ه", "و-و", "ز-ز", "ح-ح", "ط-ط", "ي-ي", "ك-ك", "ل-ل", "م-م", "ن-ن", "س-س", "ع-ع", "ف-ف", "ص-ص", "ق-ق", "ر-ر", "ش-ش", "ت-ت", "ث-ث", "خ-خ", "ذ-ذ", "ض-ض", "ظ-ظ", "غ-غ"];
    let english = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "A-A", "B-B", "C-C", "D-D", "E-E", "F-F", "G-G", "H-H", "I-I", "J-J", "K-K", "L-L", "M-M", "N-N", "O-O", "P-P", "Q-Q", "R-R", "S-S", "T-T", "U-U", "V-V", "W-W", "X-X", "Y-Y", "Z-Z"];
    let st = "";
    if (type == "numbering") {
      st = numbering[length];
    } else if (type == "arabic") {
      st = arabic[length];
    } else if (type == "english") {
      st = english[length];
    }
    return st;
  };

  $scope.addQuestion = function () {
    $scope.error = "";
    let numbering = $scope.letterType($scope.item.questionNumbering, $scope.item.questionsList.length);

    $scope.item.questionsList.push({ answersList: [], numbering, questionType: $scope.item.questionType });
  };

  $scope.addAnswer = function (question) {
    $scope.error = "";
    let numbering = $scope.letterType($scope.item.answerNumbering, question.answersList.length);
    question.answersList.push({ correct: false, numbering });
  };

  $scope.addLinks = function () {
    $scope.error = "";
    let code = (Math.random() + 1).toString(36).substring(7);
    $scope.item.linksList.push({ views: 0, code: code });
  };

  $scope.addFiles = function () {
    $scope.error = "";
    $scope.item.filesList.push({ views: 0 });
  };

  $scope.correctAnswer = function (answer, question) {
    $scope.error = "";

    for (let i = 0; i < question.answersList.length; i++) {
      question.answersList[i].correct = false;
    }
    answer.correct = true;
  };

  $scope.showSearch = function () {
    $scope.error = "";
    site.showModal($scope.modalSearchID);
  };

  $scope.searchAll = function () {
    $scope.getAll($scope.search);
    site.hideModal($scope.modalSearchID);
    $scope.search = {};
  };

  $scope.getAll();
  $scope.getEducationalLevelsList();
  $scope.getTypesExpiryViewsList();
  $scope.getLecturesTypesList();
  $scope.getQuestionTypesList();
  $scope.getSubjectsList();
});
