app.controller("report_attend_students", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_attend_students = {};

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

  $scope.getReportAttendstudentsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_attend_students/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.attend_count = 0;
          $scope.absence_count = 0;
        }
        if ($scope.customer && $scope.customer.id) {

          $scope.list.forEach(_list => {
            if (_list.status && _list.status.name == 'attend') {
              $scope.attend_count = $scope.attend_count + 1

            } else if (_list.status && _list.status.name == 'absence') {
              $scope.absence_count = $scope.absence_count + 1
            }
          });
        } else {
          $scope.list.forEach(_list => {
            _list.attend_list.forEach(_att => {

              if (_att.status && _att.status.name == 'attend') {
                $scope.attend_count = $scope.attend_count + 1

              } else if (_att.status && _att.status.name == 'absence') {
                $scope.absence_count = $scope.absence_count + 1
              }

            });


          });
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.viewStudentsAttend = function (c) {

    $scope.attend = c;
    $scope.attend.attend_count = 0;
    $scope.attend.absence_count = 0;

    $scope.attend.attend_list.forEach(_att => {

      if (_att.status.name == 'attend') {
        $scope.attend.attend_count = $scope.attend.attend_count + 1

      } else if (_att.status.name == 'absence') {
        $scope.attend.absence_count = $scope.attend.absence_count + 1
      }

    });

    site.showModal('#reportAttendDetailsModal');
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
    $scope._search = {};

    if ($scope.search)
      $scope.customer = $scope.search.customer;

    $scope.getReportAttendstudentsList($scope.search);
    site.hideModal('#reportAttendCustomersSearchModal');
    $scope.search = {}
  };

  $scope.getReportAttendstudentsList({ date: new Date() });
  $scope.getHalls();
  $scope.getSchoolGradeList();
});