app.controller("attend_students", function ($scope, $http, $timeout, $interval) {

  $scope.attend_students = {};

  $scope.displayAddAttendStudents = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.attend_students = {
          image_url: '/images/attend_students.png',
          date: new Date()
        };
        if ($scope.defaultSettings.general_Settings) {
          $scope.attend_students.school_year = $scope.defaultSettings.general_Settings.school_year
        }
        site.showModal('#attendStudentsAddModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAttendStudents = function () {
    $scope.error = '';
    const v = site.validated('#attendStudentsAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_students/add",
      data: $scope.attend_students
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendStudentsAddModal');
          $scope.getAttendStudentsList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateAttendStudents = function (attend_students) {
    $scope.error = '';
    $scope.viewAttendStudents(attend_students);
    $scope.attend_students = {};
    site.showModal('#attendStudentsUpdateModal');
  };

  $scope.updateAttendStudents = function () {
    $scope.error = '';
    const v = site.validated('#attendStudentsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_students/update",
      data: $scope.attend_students
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendStudentsUpdateModal');
          $scope.getAttendStudentsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAttendStudents = function (attend_students) {
    $scope.error = '';
    $scope.viewAttendStudents(attend_students);
    $scope.attend_students = {};
    site.showModal('#attendStudentsViewModal');
  };

  $scope.viewAttendStudents = function (attend_students) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/attend_students/view",
      data: {
        id: attend_students.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.attend_students = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAttendStudents = function (attend_students) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewAttendStudents(attend_students);
        $scope.attend_students = {};
        site.showModal('#attendStudentsDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteAttendStudents = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/attend_students/delete",
      data: {
        id: $scope.attend_students.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendStudentsDeleteModal');
          $scope.getAttendStudentsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAttendStudentsList = function (where) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/attend_students/all",
      data: {
        where: where,
        limit: 10
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          if ($scope.list && $scope.list.length == response.data.list.length) {
            response.data.list.forEach((d, i) => {
              if (!$scope.list[i].leave_date && d.leave_date) {
                $scope.list[i].leave_date = d.leave_date;
                $scope.list[i].leave = d.leave;
              }

            });
          } else {
            $scope.list = response.data.list;
            $scope.count = response.data.count;
            site.hideModal('#attendStudentsSearchModal');
            $scope.search = {};
          }

        } else {
          $scope.list = [];
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#attendStudentsSearchModal');

  };

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.shift = response.data.doc;
          callback(response.data.doc);
        } else {
          callback(null);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
        callback(null);
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "attend_students"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchStudents = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev === 'searchAll' || ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/attend_students/get",
        data: {
          search: $scope.search_customer,
          where: {
            school_grade: $scope.attend_students.school_grade,
            hall: $scope.attend_students.hall,
            active: true
          },
          whereAttend: {
            date: $scope.attend_students.date
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {

            if (ev === 'searchAll') {
              $scope.attend_students.attend_list = response.data.list;
            } else if (ev.which === 13) {
              $scope.customersList = response.data.list;
            }

          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };



  $scope.attendNow = function (c, action) {
    $scope.attend_students.date = new Date($scope.attend_students.date);
    /*     $scope.attend_students.date.setTime(new Date().getTime());
     */

    c.school_year = $scope.attend_students.school_year;
    if (action == 'attend') {

      c.status = {
        name: 'attend',
        ar: 'حضور',
        en: 'Attend'
      };
      c.attend_time = {
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
      };

    } else if (action == 'leave') {

      c.leave_time = {
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
      };

    } else if (action == 'absence') {
      c.status = { name: 'absence', ar: 'غياب', en: 'Absence' };

    }

    $http({
      method: "POST",
      url: "/api/attend_students/transaction",
      data: {
        obj: c,
        where: {
          customer: c.customer,
          date: $scope.attend_students.date
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDefaultSettings = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;

        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };


  $scope.selectStudent = function (c) {
    let found = false;
    if ($scope.attend_students.attend_list && $scope.attend_students.attend_list.length > 0) {
      found = $scope.attend_students.attend_list.some(_al => c.id == _al.customer.id);
    } else {
      $scope.attend_students.attend_list = []
    }

    if (!found)
      $scope.attend_students.attend_list.push(c);

    $scope.search_customer = '';
    $scope.attend_students.customer = {};
  };

  $scope.getSchoolGradeList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/school_grade/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.schoolGradeList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getSchoolGradeList($scope.search);
    site.hideModal('#schoolGradeSearchModal');
    $scope.search = {}

  };

  $scope.loadSchoolYears = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/school_years/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.schoolYearsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getHalls = function () {
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.hallsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope.getAttendStudentsList($scope.search);
    site.hideModal('#attendStudentsSearchModal');
    $scope.search = {};
  };

  $scope.getAttendStudentsList();
  $scope.getHalls();
  $scope.getSchoolGradeList();
  $scope.getDefaultSettings();
  $scope.loadSchoolYears();
  $scope.getNumberingAuto();
});