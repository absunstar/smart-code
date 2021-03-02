app.controller("employees_salary_report", function ($scope, $http) {
  $scope._search = {};

  $scope.search = {
    employee: {}
  };

  $scope.showSearch = function () {
    $scope.error = '';
    $scope.search = {
      employee: {},
    };
    site.showModal('#searchModal');
  };

  $scope.loadEmployeeReport = function (where, callback) {

    callback = callback || function () { };

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/employees_salary_report/all",
      data: {
        where: where,
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          if (response.data.list.length > 0) {
            $scope.employee_salary_report = response.data.list[0];
            $scope.employee_salary_report.dateFrom = new Date($scope.employee_salary_report.dateFrom);
            $scope.employee_salary_report.dateTo = new Date($scope.employee_salary_report.dateTo);
            callback($scope.employee_salary_report);
          } else {
            $scope.searchAll(); /* re calc */
          }
          site.hideModal('#searchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.searchEmployeeReport = function () {

    let where = {};

    $scope.employee_salary_report = {};

    if ($scope.search && $scope.search.date) {
      where['year'] = $scope.search.date.getFullYear();
      where['month'] = $scope.search.date.getMonth();
      $scope.employee_salary_report.date = $scope.search.date;
    }

    if ($scope.search && $scope.search.employee) {
      where['employee.id'] = $scope.search.employee.id;
      $scope.employee_salary_report.employee = $scope.search.employee;
    }

    $scope.loadEmployeeReport(where);

  };

  $scope.searchAll = function () {

    $scope.employee_salary_report = $scope.employee_salary_report || {};
    $scope.employee_salary_report.employee = $scope.search.employee;
    $scope.employee_salary_report.date = $scope.search.date;
    if($scope.search && $scope.search.date){
      $scope.employee_salary_report.year = $scope.search.date.getFullYear();
      $scope.employee_salary_report.month = $scope.search.date.getMonth();
    }

    $scope.employee_salary_report.dateFrom = $scope.search.dateFrom = new Date($scope.employee_salary_report.year, $scope.employee_salary_report.month, 1);
    $scope.employee_salary_report.dateTo = $scope.search.dateTo = new Date($scope.employee_salary_report.year, $scope.employee_salary_report.month + 1, 0);


    if ($scope.search && $scope.search.employee && $scope.userList && $scope.userList.length > 0) {

      $scope.userList.forEach(user => {
        if (user.employee_id == $scope.search.employee.id) {
          $scope.employee_salary_report.user_id = user.id;
        }
      });

    } else {
      return;
    }


    $scope.getEmployeeAdvancesList()
    $scope.getEmployeeDiscountList();
    $scope.getEmployeeInsuranceList();
    $scope.getEmployeeOfferList();
    site.hideModal('#searchModal');
  };

  $scope.clearAll = function () {
    $scope.search = {
      employee: {}
    }
  };

  $scope.getEmployeeList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employeeList = response.data.list;
          $scope.calc();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.calc = function () {

    if (!$scope.employee_salary_report) {
      return;
    }
    $scope.employee_salary_report.total_advances = 0;
    $scope.employee_salary_report.total_offers = 0;
    $scope.employee_salary_report.total_discounts = 0;
    $scope.employee_salary_report.total_insurance = 0;

    if ($scope.employee_salary_report.employeeOfferList) {
      $scope.employee_salary_report.employeeOfferList.forEach(offer => {
        $scope.employee_salary_report.total_offers = site.toNumber($scope.employee_salary_report.total_offers) + offer.value;
      });
    }

    if ($scope.employee_salary_report.employeeAdvancesList) {
      $scope.employee_salary_report.employeeAdvancesList.forEach(advance => {
        $scope.employee_salary_report.total_advances = site.toNumber($scope.employee_salary_report.total_advances) + advance.value;
      });
    }



    if ($scope.employee_salary_report.employeeinsuranceList) {
      $scope.employee_salary_report.employeeinsuranceList.forEach(insurance => {
        $scope.employee_salary_report.total_insurance = site.toNumber($scope.employee_salary_report.total_insurance) + site.toNumber(insurance.salary_discount);
      });
    }

    if ($scope.employee_salary_report.employeeDiscountList) {
      $scope.employee_salary_report.employeeDiscountList.forEach(discount => {
        $scope.employee_salary_report.total_discounts = $scope.employee_salary_report.total_discounts + discount.value;
      });
    }
    if ($scope.employee_salary_report.employee.degree) {

      $scope.employee_salary_report.employee.total_salary0 = site.toNumber($scope.employee_salary_report.employee.degree.salary) + (site.toNumber($scope.employee_salary_report.employee.extra_salary || 0) || 0);
    }

    $scope.employee_salary_report.total_salary1 = site.toNumber($scope.employee_salary_report.total_offers) - (site.toNumber($scope.employee_salary_report.total_discounts)) - (site.toNumber($scope.employee_salary_report.total_insurance));

    if ($scope.employee_salary_report.employee.total_salary0 > 0) {
      $scope.employee_salary_report.total_salary = site.toNumber($scope.employee_salary_report.total_salary1) + (site.toNumber($scope.employee_salary_report.employee.total_salary0));
    } else {
      $scope.employee_salary_report.total_salary = 0;
    }
  }

  $scope.loadSafes = function () {

    $scope.safes = [];
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          commission: 1,
          type: 1,
          code : 1
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

  $scope.loadUsers = function () {
    if ($scope.userList) {
      return
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/users/all",
      data: {
        select: {
          id: 1,
          employee_id: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.userList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getEmployeeOfferList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_offer/all",
      data: {
        where: {
          'employee.id': $scope.search.employee.id,
          date_from: $scope.search.dateFrom,
          date_to: $scope.search.dateTo
        },
        limit: 1
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_salary_report.employeeOfferList = response.data.list;
          $scope.calc();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getEmployeeDiscountList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_discount/all",
      data: {
        where: {
          'employee.id': $scope.search.employee.id,
          date_from: $scope.search.dateFrom,
          date_to: $scope.search.dateTo
        },
        limit: 1
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_salary_report.employeeDiscountList = response.data.list;
          $scope.calc();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getEmployeeAdvancesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances/all",
      data: {
        where: {
          'employee.id': $scope.search.employee.id/* ,
          date_from: $scope.search.dateFrom,
          date_to: $scope.search.dateTo */
        },
        limit: 1
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_salary_report.employeeAdvancesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getEmployeeInsuranceList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_insurances/all",
      data: {
        where: {
          'employee.id': $scope.search.employee.id
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_salary_report.employeeinsuranceList = response.data.list;
          $scope.calc();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.propertyName = 'date';
  $scope.reverse = true;

  $scope.sortBy = function (propertyName) {
    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
    $scope.propertyName = propertyName;
  };

  $scope.getEmployeeList();
  $scope.loadUsers();
  $scope.loadSafes();
});