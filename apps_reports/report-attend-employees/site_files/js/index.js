app.controller("report_attend_employees", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_attend_employees = {};

  $scope.getEmployeesList = function (ev) {
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/employees/all",
        data: {
          search: $scope.search_employee,
          where: {
            active: true
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.employeesList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    }
  };

  $scope.getReportAttendEmployeesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_attend_employees/all",
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
        if ($scope.employee && $scope.employee.id) {

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

  $scope.searchAll = function () {
    $scope._search = {};

    if ($scope.search)
      $scope.employee = $scope.search.employee;

    $scope.getReportAttendEmployeesList($scope.search);
    site.hideModal('#reportAttendEmployeesSearchModal');
    $scope.search = {}
  };

  $scope.getReportAttendEmployeesList({ date: new Date() });
});