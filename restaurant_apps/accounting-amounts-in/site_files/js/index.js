app.controller("amounts_in", function ($scope, $http) {
  $scope._search = {};

  $scope.amount_in = {};
  $scope.search = {};

 

  $scope.newAmount_In = function () {
    $scope.error = '';
    $scope.amount_in = {
      image_url: '/images/amount_in.png',
      date: new Date(),
      from_eng: false,
      from_company: false
    };
    site.showModal('#addAmountInModal');
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

    if ($scope.search.customer && $scope.search.customer.id) {
      where['customer.id'] = $scope.search.customer.id;
    }

    if ($scope.search.unemployee && $scope.search.unemployee.id) {
      where['unemployee.id'] = $scope.search.unemployee.id;
    }

    if ($scope.search.employee && $scope.search.employee.id) {
      where['employee.id'] = $scope.search.employee.id;
    }

    if ($scope.search.safe && $scope.search.safe.id) {
      where['safe.id'] = $scope.search.safe.id;
    }
    if ($scope.search.value) {
      where['value'] = parseInt($scope.search.value);
    }

    if ($scope.search.description) {
      where['description'] = ($scope.search.description);
    }

    $scope.loadAll(where , $scope.search.limit);

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
      url: "/api/amounts_in/add",
      data: $scope.amount_in

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addAmountInModal');
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

  $scope.edit = function (amount_in) {
    $scope.error = '';
    $scope.view(amount_in);
    $scope.amount_in = {};
    site.showModal('#updateAmountInModal');
  };

  $scope.update = function () {

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_in/update",
      data: $scope.amount_in
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateAmountInModal');
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

  $scope.remove = function (amount_in) {
    $scope.error = '';
    $scope.view(amount_in);
    $scope.amount_in = {};
    site.showModal('#deleteAmountInModal');
  };

  $scope.view = function (amount_in) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_in/view",
      data: {
        _id: amount_in._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.amount_in = response.data.doc;
          $scope.amount_in.date = new Date($scope.amount_in.date);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (amount_in) {
    $scope.error = '';
    $scope.view(amount_in);
    $scope.amount_in = {};
    site.showModal('#viewAmountInModal');
  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_in/delete",
      data: {
        _id: $scope.amount_in._id,
        name: $scope.amount_in.name
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteAmountInModal');
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

  $scope.loadAll = function (where , limit) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/amounts_in/all",
      data: {
        where: where,
        limit : limit ||10000000
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

  $scope.loadInOutNames = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/all",
      data: {
        where: { in: true
        }
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