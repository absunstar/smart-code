app.controller("groups", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.appName = "groups";
  $scope.modalID = "#groupsManageModal";
  $scope.modalSearchID = "#groupsSearchModal";
  $scope.mode = "add";
  $scope._search = {};
  $scope.structure = {
    image: { url: "/theme1/images/setting/groups.png" },
    active: true,
  };
  $scope.item = {};
  $scope.list = [];

  $scope.showAdd = function (_item) {
    $scope.error = "";
    $scope.mode = "add";
    $scope.item = { ...$scope.structure, dayList: [], studentList: [] };
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

  $scope.update = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
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
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
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

  $scope.view = function (_item) {
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

  $scope.getWeekDaysList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/weekDays",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.weekDaysList = response.data.list;
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
    if (ev.which !== 13) {
      return;
    }

    if (!$scope.item.educationalLevel || !$scope.item.educationalLevel.id || !$scope.item.schoolYear || !$scope.item.schoolYear.id) {
      $scope.error = "##word.Data Not Completed##";
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manageUsers/all",
      data: {
        search: $search,
        where: {
          type: "student",
          "educationalLevel.id": $scope.item.educationalLevel.id,
          "schoolYear.id": $scope.item.schoolYear.id,
          active: true,
        },
        select: { id: 1, firstName: 1, barcode: 1, mobile: 1, parentMobile: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          if (!$scope.item.studentList.some((k) => k.student && k.student.id === response.data.list[0].id)) {
            $scope.item.studentList.push({ student: response.data.list[0], attend: false });
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

  $scope.getTeachersList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manageUsers/all",
      data: {
        search: $search,
        where: {
          type: "teacher",
          active: true,
        },
        select: { id: 1, firstName: 1, image: 1, prefix: 1, mobile: 1, subject: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.teachersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
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

  $scope.getSchoolYearsList = function (educationalLevel) {
    $scope.busy = true;
    $scope.schoolYearsList = [];
    $http({
      method: "POST",
      url: "/api/schoolYears/all",
      data: {
        where: {
          active: true,
          "educationalLevel.id": educationalLevel.id,
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

  $scope.clickMoblie = function (item, type) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/clickMobile`,
      data: { id: $scope.item.id, studentId: item.student.id, type: type },
    }).then(
      function (response) {
        $scope.busy = false;
        if (type == "studentMobile") {
          item.clickStudentMoblie = true;
        } else if (type == "parentMobile") {
          item.clickSParentMobile = true;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.generateAppointments = function (item) {
    $scope.error = "";
    if (item.startDate && item.endDate) {
      let start = new Date(item.startDate);
      let end = new Date(item.endDate);
      item.dayList = [];
      let index = item.days.findIndex((itm) => itm.code === start.getDay());
      if (index !== -1) {
        item.dayList.push({ date: new Date(start), day: item.days[index] });
      }
      while (new Date(start) <= new Date(end)) {
        start.setTime(start.getTime() + 1 * 24 * 60 * 60 * 1000);
        let index = item.days.findIndex((itm) => itm.code === start.getDay());
        if (index !== -1 && new Date(start) <= new Date(end)) {
          item.dayList.push({ date: new Date(start), day: item.days[index] });
        }
        if (new Date(start) == new Date(end)) {
          break;
        }
      }
    }
  };

  $scope.changeDay = function (item) {
    $scope.error = "";
    item.date = new Date(item.date);
    let index = $scope.weekDaysList.findIndex((itm) => itm.code === item.date.getDay());
    if (index !== -1) {
      item.day = $scope.weekDaysList[index];
    }
  };

  $scope.selectTeacher = function () {
    $scope.error = "";
    $scope.item.subject = { ...$scope.item.teacher.subject };
    delete $scope.item.teacher.subject;
    
  };

  $scope.pushSpceficIndex = function (index) {
    $scope.error = "";
    $scope.dayList.splice(index, 0, { date: new Date() });
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
  $scope.getSubjectsList();
  $scope.getWeekDaysList();
  $scope.getEducationalLevelsList();
  $scope.getTeachersList();
});
