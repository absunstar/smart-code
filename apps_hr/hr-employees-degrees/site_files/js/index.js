app.controller("employees_degrees", function ($scope, $http) {
  $scope._search = {};

  $scope.employee_degree = {};

  $scope.loadAll = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_degrees/all",
      data: { where: where }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.newEmployee_Degree = function () {
    $scope.error = '';
    $scope.employee_degree = { 
      salary : 0,
      tax : 0,
      image_url: '/images/employee_degree.png'
     };
    site.showModal('#addEmployeeDegreeModal');
  };
  

  $scope.add = function () {
    $scope.error = '';
    const v = site.validated('#addEmployeeDegreeModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_degrees/add",
      data: $scope.employee_degree
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addEmployeeDegreeModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
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

  $scope.edit = function (employee_degree) {
    $scope.error = '';
    $scope.view(employee_degree);
    $scope.employee_degree = {};
    site.showModal('#updateEmployeeDegreeModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_degrees/update",
      data: $scope.employee_degree
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateEmployeeDegreeModal');
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

  $scope.remove = function (employee_degree) {
    $scope.view(employee_degree);
    $scope.employee_degree = {};
    site.showModal('#deleteEmployeeDegreeModal');
  };

  $scope.view = function (employee_degree) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_degrees/view",
      data: { id: employee_degree.id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_degree = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (employee_degree) {
    $scope.view(employee_degree);
    $scope.employee_degree = {};
    site.showModal('#viewEmployeeDegreeModal');
  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_degrees/delete",
      data: { id: $scope.employee_degree.id, name: $scope.employee_degree.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteEmployeeDegreeModal');
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

  $scope.loadEmployees_degrees = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/Employees_degrees/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          balance: 1,
          code : 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employees_degrees = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
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
        screen: "employees_degrees"
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

  $scope.searchAll = function () {
    $scope.loadAll($scope.search);

    site.hideModal('#SearchModal');
    $scope.search = {}

  };

  $scope.loadAll();
  $scope.loadEmployees_degrees();
  $scope.getNumberingAuto();
});
