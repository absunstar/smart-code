
app.controller("employee_discount", function ($scope, $http) {
  $scope._search = {};

  $scope.employee_discount = {};
  $scope.search = {};

  $scope.loadAll = function (where) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/employee_discount/all",
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
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          commission: 1,
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

  $scope.newemployee_discount = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {

      if (shift) {
        $scope.employee_discount = {
          image_url: '/images/discount.png',
          date: new Date(),
          value : 0,
          shift: shift
        };
        site.showModal('#addEmployeeDiscountModal');
      } else $scope.error = '##word.open_shift_not_found##';
    })
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


    if ($scope.search.company && $scope.search.company.id) {
      where['company.id'] = $scope.search.company.id;
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
      where['value'] = parseInt($scope.search.value);
    }

    if ($scope.search.description) {
      where['description'] = ($scope.search.description);
    }

    site.hideModal('#Employee_Discount_SearchModal');

    $scope.loadAll(where);
  };


  $scope.add = function () {

    $scope.error = '';
    let v = site.validated('#addEmployeeDiscountModal');

    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_discount/add",
      data: $scope.employee_discount

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addEmployeeDiscountModal');
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



  $scope.edit = function (employee_discount) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {

      if (shift) {
        $scope.view(employee_discount);
        $scope.employee_discount = {};
        site.showModal('#updateEmployeeDiscountModal');
      } else $scope.error = '##word.open_shift_not_found##';
    })
  };
  $scope.update = function () {
    $scope.error = '';
    const v = site.validated('#updateEmployeeDiscountModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_discount/update",
      data: $scope.employee_discount
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateEmployeeDiscountModal');
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

  $scope.remove = function (employee_discount) {
    $scope.get_open_shift((shift) => {

      if (shift) {
        $scope.view(employee_discount);
        $scope.employee_discount = {};
        site.showModal('#deleteEmployeeDiscountModal');
      } else $scope.error = '##word.open_shift_not_found##';
    })
  };

  $scope.view = function (employee_discount) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_discount/view",
      data: { _id: employee_discount._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_discount = response.data.doc;
          $scope.employee_discount.date = new Date($scope.employee_discount.date);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.details = function (employee_discount) {
    $scope.view(employee_discount);
    $scope.employee_discount = {};
    site.showModal('#viewEmployeeDiscountModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_discount/delete",
      data: { _id: $scope.employee_discount._id}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteEmployeeDiscountModal');
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

  $scope.getEmployeeList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/employees/all",
        data: {
          search: $scope.search_employee,

          /*  select: {
            id: 1,
            name_Ar: 1,
            name_En: 1,
          } */
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.employeeList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.get_open_shift = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1,
          from_date: 1,
          from_time: 1,
          to_date: 1,
          to_time: 1
        }
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

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          minor_currency_Ar: 1, minor_currency_en: 1,
          ex_rate: 1,
          code : 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.currenciesList = response.data.list;
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
        screen: "employees_discount"
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

  $scope.loadSafes();
  $scope.loadCurrencies();
  $scope.getNumberingAuto();
  $scope.loadAll({ date: new Date() });
});
