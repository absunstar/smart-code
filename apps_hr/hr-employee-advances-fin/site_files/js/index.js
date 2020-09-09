app.controller("employees_advances_fin", function ($scope, $http, $timeout) {
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
    let v = site.validated('#addEmployeesAdvancesModal');

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
        $scope.loadSafes(employees_advances_fin.payment_method, employees_advances_fin.currency);
        $scope.currency = employees_advances_fin.currency;
        $scope.value = employees_advances_fin.value;
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
              $scope.employees_advances_fin.date = new Date();
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

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name: 1,
          minor_currency: 1,
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
    $scope.calc();
  };

  $scope.loadSafes = function (method, currency) {
    $scope.error = '';
    $scope.busy = true;

    if (currency && currency.id && method && method.id) {

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
    }
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

  $scope.calc = function () {
    $timeout(() => {
      if ($scope.currency.id === $scope.employees_advances_fin.currency.id) {
        $scope.employees_advances_fin.value = $scope.value;
      } else {
        $scope.employees_advances_fin.value = ($scope.value * $scope.currency.ex_rate) / $scope.employees_advances_fin.currency.ex_rate;
      }
    }, 250)
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


  $scope.loadAll();
  $scope.loadCurrencies();
  $scope.getPaymentMethodList();
  $scope.getDefaultSettings();
});
