app.controller("amounts_out", function ($scope, $http) {
  $scope._search = {};

  $scope.amount_out = {};

  $scope.loadAll = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_out/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
          site.hideModal('#amountsOutSearchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope.error = '';
    $scope.loadAll($scope.search);
    $scope.search = {};
  };

  $scope.newAmountOut = function () {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.amount_out = {
          image_url: '/images/amount_out.png',
          shift: $scope.shift,
          date: new Date(),
        };
        if ($scope.defaultSettings) {
          if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting)
            $scope.amount_out.posting = true;

          if ($scope.defaultSettings.accounting) {
            if ($scope.defaultSettings.accounting.payment_method) {
              $scope.amount_out.payment_method = $scope.defaultSettings.accounting.payment_method;
              $scope.loadSafes($scope.amount_out.payment_method);
              if ($scope.amount_out.payment_method.id == 1) {
                if ($scope.defaultSettings.accounting.safe_box)
                  $scope.amount_out.safe = $scope.defaultSettings.accounting.safe_box;
              } else {
                if ($scope.defaultSettings.accounting.safe_bank)
                  $scope.amount_out.safe = $scope.defaultSettings.accounting.safe_bank;
              }
            }
          };
        }

        site.showModal('#addAmountOutModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
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


  $scope.showSearch = function () {
    $scope.error = '';

    site.showModal('#amountsOutSearchModal');
  };

  $scope.add = function () {

    $scope.error = '';
    let v = site.validated('#addAmountOutModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.amount_out.value === 0) {
      $scope.error = '##word.notzero##';
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_out/add",
      data: $scope.amount_out

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addAmountOutModal');
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

  $scope.edit = function (amount_out) {
    $scope.error = '';
    $scope.view(amount_out);
    $scope.amount_out = {};
    site.showModal('#updateAmountOutModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_out/update",
      data: $scope.amount_out
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateAmountOutModal');
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

  $scope.remove = function (amount_out) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(amount_out);
        $scope.amount_out = {};
        site.showModal('#deleteAmountOutModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (amount_out) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_out/view",
      data: { _id: amount_out._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.amount_out = response.data.doc;
          $scope.amount_out.date = new Date($scope.amount_out.date);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (amount_out) {
    $scope.error = '';
    $scope.view(amount_out);
    $scope.amount_out = {};
    site.showModal('#viewAmountOutModal');
  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_out/delete",
      data: { id: $scope.amount_out.id, name: $scope.amount_out.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteAmountOutModal');
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

  $scope.posting = function (amount_out) {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_out/posting",
      data: amount_out
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
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

  $scope.getSafeByType = function (obj) {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      $scope.loadSafes(obj.payment_method);
      if (obj.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box)
          obj.safe = $scope.defaultSettings.accounting.safe_box;
      } else {
        if ($scope.defaultSettings.accounting.safe_bank)
          obj.safe = $scope.defaultSettings.accounting.safe_bank;
      }
    }
  };

  $scope.loadSafes = function (method) {
    $scope.error = '';
    $scope.busy = true;
    let where = {};

    if (method.id == 1)
      where = { 'type.id': 1 };
    else where = { 'type.id': 2 };

    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
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


  $scope.loadInOutNames = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/all",
      data: {
        where: { out: true }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.namesList = response.data.list;
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
      data: {
        where: {
          'trainer': { $ne: true },
          'delivery': { $ne: true }
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employeesList = response.data.list;
        }
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
  $scope.getDefaultSettings();
  $scope.loadInOutNames();
  $scope.getPaymentMethodList();
  $scope.loadEmployees();
  $scope.loadAll({ date: new Date() });
});
