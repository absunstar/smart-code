app.controller("amounts_out", function ($scope, $http) {
  $scope._search = {};

  $scope.amount_out = {};

  $scope.loadAll = function (where, limit) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_out/all",
      data: {
        where: where,
        limit: limit || 10000000
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

    if ($scope.search.safe && $scope.search.safe.id) {
      where['safe.id'] = $scope.search.safe.id;
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


    $scope.loadAll(where, $scope.search.limit);
  };


  $scope.newAmount_Out = function () {

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
          $scope.error = '';
          $scope.amount_out = {
            image_url: '/images/amount_out.png',
            safe: $scope.defaultSettings.accounting.safe,
            date: new Date(),
          };
          site.showModal('#addAmountOutModal');
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
    let v = site.validated();

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
    $scope.view(amount_out);
    $scope.amount_out = {};
    site.showModal('#deleteAmountOutModal');
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
      data: { _id: $scope.amount_out._id, name: $scope.amount_out.name }
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


  $scope.loadSafes();
  $scope.loadInOutNames();
  $scope.loadEmployees();
  $scope.loadAll();
});
