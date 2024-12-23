app.controller("attend_employees", function ($scope, $http, $timeout, $interval) {

  $scope.attend_employees = {};

  $scope.displayAddAttendEmployees = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.attend_employees = {
          image_url: '/images/attend_employees.png',
          date: new Date()
        };
        site.showModal('#attendEmployeesAddModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAttendEmployees = function () {
    $scope.error = '';
    const v = site.validated('#attendEmployeesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_employees/add",
      data: $scope.attend_employees
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendEmployeesAddModal');
          $scope.getAttendEmployeesList();
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

  $scope.displayUpdateAttendEmployees = function (attend_employees) {
    $scope.error = '';
    $scope.viewAttendEmployees(attend_employees);
    $scope.attend_employees = {};
    site.showModal('#attendEmployeesUpdateModal');
  };

  $scope.updateAttendEmployees = function () {
    $scope.error = '';
    const v = site.validated('#attendEmployeesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_employees/update",
      data: $scope.attend_employees
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendEmployeesUpdateModal');
          $scope.getAttendEmployeesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAttendEmployees = function (attend_employees) {
    $scope.error = '';
    $scope.viewAttendEmployees(attend_employees);
    $scope.attend_employees = {};
    site.showModal('#attendEmployeesViewModal');
  };

  $scope.viewAttendEmployees = function (attend_employees) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/attend_employees/view",
      data: {
        id: attend_employees.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.attend_employees = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAttendEmployees = function (attend_employees) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewAttendEmployees(attend_employees);
        $scope.attend_employees = {};
        site.showModal('#attendEmployeesDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteAttendEmployees = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/attend_employees/delete",
      data: {
        id: $scope.attend_employees.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendEmployeesDeleteModal');
          $scope.getAttendEmployeesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAttendEmployeesList = function (where) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/attend_employees/all",
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
            site.hideModal('#attendEmployeesSearchModal');
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
    site.showModal('#attendEmployeesSearchModal');

  };

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
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
        screen: "attend_employees"
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

  $scope.searchEmployees = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev === 'searchAll' || ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/attend_employees/get",
        data: {
          search: $scope.search_employee,
          where: {
            active: true
          },
          whereAttend: {
            date: $scope.attend_employees.date
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {

            if (ev === 'searchAll') {

              $scope.attend_employees.attend_list = response.data.list;

            } else if (ev.which === 13) {
              $scope.employeesList = response.data.list;
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
    $scope.attend_employees.date = new Date($scope.attend_employees.date);
    /*     $scope.attend_employees.date.setTime(new Date().getTime());
     */

    if (action == 'attend') {

      c.status = {
        name: 'attend',
        Ar: 'حضور',
        En: 'Attend'
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
      c.status = { name: 'absence', Ar: 'غياب', En: 'Absence' };

    }

    $http({
      method: "POST",
      url: "/api/attend_employees/transaction",
      data: {
        obj: c,
        where: {
          employee: c.employee,
          date: $scope.attend_employees.date
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


  $scope.selectEmployee = function () {
    if($scope.select_employee){

    let found = false;
    $scope.attend_employees.attend_list = $scope.attend_employees.attend_list || [];

    found = $scope.attend_employees.attend_list.some(_al => $scope.select_employee.employee.id == _al.employee.id);

    if (!found)
      $scope.attend_employees.attend_list.push($scope.select_employee);

    $scope.search_employee = '';
    $scope.select_employee = undefined;
    $scope.employeesList = [];

  }

  };


  $scope.searchAll = function () {
    $scope.getAttendEmployeesList($scope.search);
    site.hideModal('#attendEmployeesSearchModal');
    $scope.search = {};
  };

  $scope.getAttendEmployeesList();
  $scope.getDefaultSettings();
  $scope.getNumberingAuto();
});