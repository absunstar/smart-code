app.controller("employee_offer", function ($scope, $http) {
  $scope._search = {};

  $scope.employee_offer = {};
  $scope.search = {};

  $scope.loadAll = function (where) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/employee_offer/all",
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
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          type : 1
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




  $scope.newemployee_offer = function () {
    $scope.error = '';
    $scope.employee_offer = {
      image_url: '/images/offer.png',
      date: new Date(),
      from_eng: false,
      from_company: false
    };
    site.showModal('#addemployeeOfferModal');
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


    $scope.loadAll(where);
  };

  $scope.add = function () {
    $scope.error = '';
    let v = site.validated('#addemployeeOfferModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_offer/add",
      data: $scope.employee_offer

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addemployeeOfferModal');
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



  $scope.edit = function (employee_offer) {
    $scope.error = '';
    $scope.view(employee_offer);
    $scope.employee_offer = {};
    site.showModal('#updateemployeeOfferModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_offer/update",
      data: $scope.employee_offer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateemployeeOfferModal');
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

  $scope.remove = function (employee_offer) {
    $scope.view(employee_offer);
    $scope.employee_offer = {};
    site.showModal('#deleteemployeeOfferModal');
  };

  $scope.view = function (employee_offer) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_offer/view",
      data: {
        _id: employee_offer._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_offer = response.data.doc;
          $scope.employee_offer.date = new Date($scope.employee_offer.date);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.details = function (employee_offer) {
    $scope.view(employee_offer);
    $scope.employee_offer = {};
    site.showModal('#viewemployeeOfferModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_offer/delete",
      data: {
        _id: $scope.employee_offer._id,
        name: $scope.employee_offer.name
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteemployeeOfferModal');
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
  $scope.loadEmployees();
  $scope.loadAll({date : new Date()});
});