app.controller("safes", function ($scope, $http) {
  $scope._search = {};

  $scope.safe = {};

  $scope.loadEmployees = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          trainer: { $ne: true },
          delivery: { $ne: true },
          delegate: { $ne: true },
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employees = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.loadAll = function (where, limit) {
    $scope.list = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        where: where,
        limit: limit || 1000000000
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#safesSearchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.newSafe = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.safe = { image_url: '/images/safe.png', balance: 0, shift: shift };
        site.showModal('#addSafeModal');
        $('#safe_name').focus();
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.add = function () {
    $scope.error = '';
    const v = site.validated('#addSafeModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/add",
      data: $scope.safe
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addSafeModal');
          $scope.loadAll();
        }

        else if (response.data.error.contains('duplicate')) {

          $scope.error = "##word.duplicate_alarm##";
        }
        else {
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

  $scope.edit = function (safe) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(safe);
        $scope.safe = {};
        site.showModal('#updateSafeModal');
        $('#safe_name').focus();
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';
    const v = site.validated('#updateSafeModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/update",
      data: $scope.safe
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateSafeModal');
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

  $scope.remove = function (safe) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(safe);
        $scope.safe = {};
        site.showModal('#deleteSafeModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (safe) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/view",
      data: { _id: safe._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.safe = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (safe) {
    $scope.error = '';
    $scope.view(safe);
    $scope.safe = {};
    site.showModal('#viewSafeModal');
  };

  $scope.delete = function (safe) {
    $scope.busy = true;


    $http({
      method: "POST",
      url: "/api/safes/delete",
      data: safe
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteSafeModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Delete Safe Its Exist In Other*')) {
            $scope.error = "##word.err_delete_safe##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
    /* } else {
      $scope.busy = false;
      $scope.error = '##word.cannt_delete_safe##';
    } */
  };

  $scope.getSafeTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.safeTypeList = [];
    $http({
      method: "POST",
      url: "/api/safe_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.safeTypesList = response.data;
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
          name_ar: 1, name_en: 1,
          minor_currency_ar: 1, minor_currency_en: 1,
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


  $scope.searchAll = function () {
    $scope.error = '';
    let where = {};

    if ($scope.search.employee) {
      where['employee'] = $scope.search.employee;
    }

    if ($scope.search.balance) {
      where['balance'] = site.toNumber($scope.search.balance);
    }
    if ($scope.search.name_ar) {
      where['name_ar'] = $scope.search.name_ar;
    }
    if ($scope.search.name_en) {
      where['name_en'] = $scope.search.name_en;
    }

    if ($scope.search.description) {
      where['description'] = $scope.search.description;
    }
    $scope.loadAll(where, $scope.search.limit);
    site.hideModal('#SafesSearchModal');

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "safes"
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

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
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
  $scope.getSafeTypeList();
  $scope.loadEmployees();
  $scope.getNumberingAuto();
  $scope.loadCurrencies();
  // $scope.loadSafes();


});
