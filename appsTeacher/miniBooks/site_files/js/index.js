app.controller("miniBooks", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.appName = "miniBooks";
  $scope.setting = site.showObject(`##data.#setting##`);
  $scope.modalID = "#miniBooksManageModal";
  $scope.modalSearchID = "#miniBooksSearchModal";
  $scope.mode = "add";
  $scope._search = {};
  $scope.structure = {
    image: { },
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
      linkList: [],
      fileList: [],
    };
    if (!$scope.setting.isOnline) {
      $scope.item.placeType = "offline";
    }
    site.showModal($scope.modalID);
  };

  $scope.add = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
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
      $scope.error = v.messages[0].ar;
      return;
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
          if ($scope.item.receiveLibrary) {
            $scope.item.studentList = $scope.item.studentList || [];
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

  $scope.getMiniBooksTypesList = function () {
    $scope.busy = true;
    $scope.miniBooksTypesList = [];
    $http({
      method: "POST",
      url: "/api/lecturesTypesList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.miniBooksTypesList = response.data.list;
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
    if ($scope.item.educationalLevel?.id && $scope.item.schoolYear?.id && $scope.item.subject?.id) {
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

  $scope.getStudent = function (ev, $search) {
    $scope.error = "";
    if (ev.which !== 13 || !$search) {
      return;
    }

    /*  if (!$scope.item.educationalLevel || !$scope.item.educationalLevel.id || !$scope.item.schoolYear || !$scope.item.schoolYear.id) {
      $scope.error = "##word.Data Not Completed##";
      return;
    } */
    let where = {
      type: "student",
      /*   "educationalLevel.id": $scope.item.educationalLevel.id,
      "schoolYear.id": $scope.item.schoolYear.id, */
      active: true,
    };
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manageUsers/receiveMiniBook",
      data: {
        where: where,
        search: $search,
        miniBookId: $scope.item.id,
        subscriptionList: $scope.item.subscriptionList,
        select: { id: 1, firstName: 1, barcode: 1, mobile: 1, parentMobile: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        console.log(response.data);

        if (response.data.done && response.data.doc) {
          if (!$scope.item.studentList.some((k) => k.student && k.student.id === response.data.doc.student.id)) {
            $scope.item.studentList.unshift(response.data.doc);
          } else {
            $scope.error = "##word.Student Exist##";
          }
        } else {
          $scope.error = "##word.Not Found##";
        }

        $scope.item.$studentSearch = "";
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.showReceiveMiniBook = function (_item) {
    $scope.error = "";
    $scope.item = {};
    $scope.view(_item);
    site.showModal("#studentsModal");
  };

  $scope.receiveMiniBook = function (_item, type) {
    $scope.error = "";
    _item.receiveDate = site.getDate();
    _item.receiveUser = {
      id: "##user.id##",
      firstName: "##user.FirstName##",
    };

    _item.receiveType = type;
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

  $scope.addLinks = function () {
    $scope.error = "";
    let code = (Math.random() + 1).toString(36).substring(7);
    $scope.item.linksList.push({ views: 0, code: code });
  };

  $scope.addFiles = function () {
    $scope.error = "";
    $scope.item.fileList.push({ views: 0 });
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
  $scope.getMiniBooksTypesList();
  $scope.getSubjectsList();
});
