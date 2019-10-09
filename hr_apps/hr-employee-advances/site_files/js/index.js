app.controller("employees_advances", function ($scope, $http) {
  $scope._search = {};

  $scope.employees_advances = {};
  $scope.search = {};

  $scope.loadAll = function (where, limit) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/employees_advances/all",
      data: {
        where: where,
        limit: limit || 10000000
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
      data: {}
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

  $scope.loadEmployees = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employeeList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.newemployees_advances = function () {
    $scope.error = '';
    $scope.employees_advances = {
      image_url: '/images/discount.png',
      date: new Date(),
      from_eng: false,
      from_company: false
    };
    site.showModal('#addEmployeesAdvancesModal');
  };


  $scope.searchAll = function () {
    let where = {};


    if ($scope.search.date) {
      where['date'] = $scope.search.date;
    }

    if ($scope.search.dateFrom) {
      where['from_date'] = $scope.search.dateFrom;
    }

    if ($scope.search.dateTo) {
      where['to_date'] = $scope.search.dateTo;
    }


    if ($scope.search.safe && $scope.search.safe.id) {
      where['safe.id'] = $scope.search.safe.id;
    }

    if ($scope.search.source && $scope.search.source.id) {
      where['source.id'] = $scope.search.source.id;
    }

    if ($scope.search.customer && $scope.search.customer.id) {
      where['customer.id'] = $scope.search.customer.id;
    }

    if ($scope.search.employee && $scope.search.employee.id) {
      where['employee.id'] = $scope.search.employee.id;
    }

    if ($scope.search.value) {
      where['value'] = ($scope.search.value);
    }

    if ($scope.search.description) {
      where['description'] = ($scope.search.description);
    }


    $scope.loadAll(where, $scope.search.limit);
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
      url: "/api/employees_advances/add",
      data: $scope.employees_advances

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addEmployeesAdvancesModal');
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



  $scope.edit = function (employees_advances) {
    $scope.error = '';
    $scope.view(employees_advances);
    $scope.employees_advances = {};
    site.showModal('#updateEmployeesAdvancesModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances/update",
      data: $scope.employees_advances
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateEmployeesAdvancesModal');
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

  $scope.remove = function (employees_advances) {
    $scope.view(employees_advances);
    $scope.employees_advances = {};
    site.showModal('#deleteEmployeesAdvancesModal');
  };

  $scope.view = function (employees_advances) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances/view",
      data: {
        _id: employees_advances._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employees_advances = response.data.doc;
          $scope.employees_advances.date = new Date($scope.employees_advances.date);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.details = function (employees_advances) {
    $scope.view(employees_advances);
    $scope.employees_advances = {};
    site.showModal('#viewEmployeesAdvancesModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances/delete",
      data: {
        _id: $scope.employees_advances._id,
        name: $scope.employees_advances.name
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteEmployeesAdvancesModal');
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


  $scope.loadSafes();
  $scope.loadEmployees();
  $scope.loadAll();
});