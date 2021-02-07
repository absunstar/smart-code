app.controller("report_exams", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_exams = {};

  $scope.getCustomersList = function (ev) {
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer,
          where: {
            active: true
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.studentsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    }
  };

  $scope.getReportExamsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_exams/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.number_examinees = 0;
          $scope.number_non_examinees = 0;
          $scope.number_successful = 0;
          $scope.number_repeaters = 0;
        }
        if (($scope.customer && $scope.customer.id) || ($scope.exam && $scope.exam.id)) {

          $scope.list.forEach(_list => {
            if (_list.exam_procedure && _list.exam_procedure) {
              $scope.number_examinees = $scope.number_examinees + 1;

              if (_list.student_degree >= _list.degree_success) {
                $scope.number_successful = $scope.number_successful + 1;

              } else if (_list.degree_success > _list.student_degree) {
                $scope.number_repeaters = $scope.number_repeaters + 1;

              }

            } else {
              $scope.number_non_examinees = $scope.number_non_examinees + 1;
            }
          });
        }
        /*  else {
          $scope.list.forEach(_list => {
            _list.attend_list.forEach(_att => {

              if (_att.status && _att.status.name == 'attend') {
                $scope.attend_count = $scope.attend_count + 1

              } else if (_att.status && _att.status.name == 'absence') {
                $scope.absence_count = $scope.absence_count + 1
              }

            });


          });
        } */

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.viewStudentsAttend = function (c) {

    $scope.exams = c;
    $scope.exams.number_examinees = 0;
    $scope.exams.number_non_examinees = 0;
    $scope.exams.number_successful = 0;
    $scope.exams.number_repeaters = 0;
    $scope.exams.list.forEach(_stu => {

      if (_stu.exam_procedure && _stu.exam_procedure) {
        $scope.exams.number_examinees = $scope.exams.number_examinees + 1;

        if (_stu.student_degree >= _stu.degree_success) {
          $scope.exams.number_successful = $scope.exams.number_successful + 1;

        } else if (_stu.degree_success > _stu.student_degree) {
          $scope.exams.number_repeaters = $scope.exams.number_repeaters + 1;

        }

      } else {
        $scope.exams.number_non_examinees = $scope.exams.number_non_examinees + 1;
      }

    });

    site.showModal('#reportAttendDetailsModal');
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

  $scope.getStudentsYearsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/students_years/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.studentsYearsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getExams = function (shift) {
    $http({
      method: "POST",
      url: "/api/exams/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1
        },
        where: {
          active: true,
          'shift': shift
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.examsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getSubjects = function () {
    $http({
      method: "POST",
      url: "/api/subjects/all",
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
        $scope.subjectsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getShifts = function () {
    $http({
      method: "POST",
      url: "/api/shifts/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.shiftsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getExamsTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.examsTypesList = [];
    $http({
      method: "POST",
      url: "/api/exams_types/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.examsTypesList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
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

  $scope.viewSearchAll = function () {
    $scope.get_open_shift((shift) => {
      $scope.search = {};

      if (shift) {
        $scope.search.shift = $scope.shiftsList.find(_shift => { return _shift.id === shift.id });
        $scope.getExams($scope.search.shift);
      }

      site.showModal('#reportExamsSearchModal');

    });
  };

  $scope.searchAll = function () {
    $scope._search = {};

    if ($scope.search) {

      $scope.customer = $scope.search.customer;
      $scope.exam = $scope.search.exam;
    }

    $scope.getReportExamsList($scope.search);
    site.hideModal('#reportExamsSearchModal');
    $scope.search = {};
  };

  $scope.getReportExamsList({ date: new Date() });
  $scope.getSubjects();
  $scope.getShifts();
  $scope.getExamsTypes();
  $scope.getStudentsYearsList();
  $scope.getDefaultSettings();
});