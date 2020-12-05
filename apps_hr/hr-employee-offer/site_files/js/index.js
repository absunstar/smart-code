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

          site.hideModal('#EployeeOfferSearchModal');
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
          name: 1,
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




  $scope.newemployee_offer = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {

      if (shift) {
        $scope.employee_offer = {
          image_url: '/images/offer.png',
          date: new Date(),
          shift: shift
        };
        site.showModal('#addemployeeOfferModal');
      } else $scope.error = '##word.open_shift_not_found##';
    })
  };


  $scope.searchAll = function () {

    $scope.loadAll($scope.search);
    $scope.search = {};
    site.hideModal('#EployeeOfferSearchModal')
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
    $scope.get_open_shift((shift) => {

      if (shift) {
        $scope.view(employee_offer);
        $scope.employee_offer = {};
        site.showModal('#deleteemployeeOfferModal');
      } else $scope.error = '##word.open_shift_not_found##';
    })
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
            name_ar: 1,
            name_en: 1,
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
          name: 1,
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "employees_offers"
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