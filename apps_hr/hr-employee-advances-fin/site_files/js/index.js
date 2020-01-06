app.controller("employees_advances_fin", function ($scope, $http) {
  $scope._search = {};

  $scope.employees_advances_fin = {};
  $scope.search = {};



  $scope.approved = function () {

    $scope.busy = true;

    $scope.employees_advances_fin.done = true

    $http({
      method: "POST",
      url: "/api/employees_advances_fin/approved",
      data: $scope.employees_advances_fin
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#employees_advances_fin');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.loadAll = function (where) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/employees_advances_fin/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;

          site.hideModal('#amountsInSearchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.loadSafes = function () {
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          type: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.safes = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };




  $scope.newemployees_advances_fin = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.employees_advances_fin = { image_url: '/images/discount.png', date: new Date(), from_eng: false, from_company: false };
        site.showModal('#addEmployeesAdvancesFinModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };


  $scope.searchAll = function () {
    let where = {};


    if ($scope.search.date) {
      where['date'] = $scope.search.date;
    }

    if ($scope.search.dateFrom) {
      where['date_from'] = $scope.search.dateFrom;
    }

    if ($scope.search.dateTo) {
      where['date_to'] = $scope.search.dateTo;
    }

    if ($scope.search.employee && $scope.search.employee.id) {
      where['employee.id'] = $scope.search.employee.id;
    }

    if ($scope.search.value) {
      where['value'] = parseInt($scope.search.value);
    }



    $scope.loadAll(where);
  };

  $scope.add = function () {

    $scope.error = '';
    let v = site.validated();

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances_fin/add",
      data: $scope.employees_advances_fin

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addEmployeesAdvancesFinModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.edit = function (employees_advances_fin) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(employees_advances_fin);
        $scope.employees_advances_fin = {};
        site.showModal('#updateEmployeesAdvancesFinModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };


  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances_fin/update",
      data: $scope.employees_advances_fin
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateEmployeesAdvancesFinModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.remove = function (employees_advances_fin) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(employees_advances_fin);
        $scope.employees_advances_fin = {};
        site.showModal('#deleteEmployeesAdvancesFinModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (employees_advances_fin) {
    $scope.busy = true;
    $scope.get_open_shift((shift) => {
      if (shift) {
        $http({
          method: "POST",
          url: "/api/employees_advances_fin/view",
          data: { _id: employees_advances_fin._id }
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              $scope.employees_advances_fin = response.data.doc;
              $scope.employees_advances_fin.date = new Date($scope.employees_advances_fin.date);
              $scope.employees_advances_fin.shift = shift;
            } else {
              $scope.error = response.data.error;
            }
          },
          function (err) {
            console.log(err);
          }
        )
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };
  $scope.details = function (employees_advances_fin) {
    $scope.view(employees_advances_fin);
    $scope.employees_advances_fin = {};
    site.showModal('#viewEmployeesAdvancesFinModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances_fin/delete",
      data: { _id: $scope.employees_advances_fin._id, name: $scope.employees_advances_fin.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteEmployeesAdvancesFinModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.get_open_shift = function (callback) {
    $scope.error = '';
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


  $scope.loadSafes();
  $scope.loadAll({ date: new Date() });
});
