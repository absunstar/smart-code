app.controller("employees_advances", function ($scope, $http) {
  $scope._search = {};

  $scope.employees_advances = {};
  $scope.search = {};

  $scope.loadAll = function (where) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/employees_advances/all",
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
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.employees_advances = {
          image_url: '/images/discount.png',
          date: new Date(),
          shift: shift,
          period: 1,
          value: 0
        };
        if ($scope.defaultSettings && $scope.defaultSettings.accounting) {
          $scope.employees_advances.currency = $scope.defaultSettings.accounting.currency;
          if ($scope.defaultSettings.accounting.payment_method) {

            $scope.employees_advances.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.employees_advances.payment_method, $scope.employees_advances.currency);

            if ($scope.employees_advances.payment_method.id == 1)
              $scope.employees_advances.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.employees_advances.safe = $scope.defaultSettings.accounting.safe_bank;

          }
        }
        site.showModal('#addEmployeesAdvancesModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };


  $scope.searchAll = function () {
    
    $scope.loadAll($scope.search);
    $scope.search = {};
  };

  $scope.add = function () {

    $scope.error = '';
    let v = site.validated('#addEmployeesAdvancesModal');

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

  $scope.getDefaultSettings = function () {

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

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name: 1,
          ex_rate: 1
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

  $scope.getSafeByType = function (obj) {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      $scope.loadSafes(obj.payment_method, obj.currency);
      if (obj.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box)
          obj.safe = $scope.defaultSettings.accounting.safe_box
      } else {
        if ($scope.defaultSettings.accounting.safe_bank)
          obj.safe = $scope.defaultSettings.accounting.safe_bank
      }
    }
  };

  $scope.loadSafes = function (method, currency) {
    $scope.error = '';
    $scope.busy = true;

    let where = { 'currency.id': currency.id };

    if (method.id == 1)
      where['type.id'] = 1;
    else where['type.id'] = 2;

    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          commission: 1,
          currency: 1,
          type: 1
        },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.safesList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPaymentMethodList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.paymentMethodList = [];
    $http({
      method: "POST",
      url: "/api/payment_method/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.paymentMethodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.edit = function (employees_advances) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(employees_advances);
        $scope.employees_advances = {};
        site.showModal('#updateEmployeesAdvancesModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
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
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(employees_advances);
        $scope.employees_advances = {};
        site.showModal('#deleteEmployeesAdvancesModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
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


  
  if(!site.feature('lawyer')){
    
    $scope.getDefaultSettings();
    $scope.getPaymentMethodList();
  }
  $scope.loadCurrencies();
  $scope.loadEmployees();
  $scope.loadAll({ date: new Date() });
});