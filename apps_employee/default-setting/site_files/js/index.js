
let btn1 = document.querySelector('#setting_default .tab-link');
if (btn1) {
  btn1.click();
}

app.controller("default_setting", function ($scope, $http) {
  $scope._search = {};

  $scope.default_setting = {

  };


  $scope.showSearch = function () {
    site.showModal('#searchModal');
  };

  $scope.searchAll = function () {

    $scope.getMenuList($scope.search);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };



  $scope.loadVendors = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.vendorsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.loadCustomers = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.customersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name: 1, type: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.stores = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.loadSafes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.safes = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.getSourceType = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.sourceTypeList = [];
    $http({
      method: "POST",
      url: "/api/source_type/all"
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.sourceTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          'job.trainer': true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.trainerList = response.data.list;
          console.log($scope.trainerList);

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getHallList = function () {
    $scope.busy = true;
    $scope.hallList = [];
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        select: {
          id: 1, name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.hallList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getDiscountMethodList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.discountMethodList = [];
    $http({
      method: "POST",
      url: "/api/discount_method/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.discountMethodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPlaceProgramList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.placeProgramList = [];
    $http({
      method: "POST",
      url: "/api/place_program/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.placeProgramList = response.data;
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

  $scope.loadSetting = function (where) {
    $scope.default_setting = {};
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.default_setting = response.data.doc
        } else {
          $scope.default_setting = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.saveSetting = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/save",
      data: $scope.default_setting
    }).then(
      function (response) {
        $scope.busy = false;
        if (!response.data.done) {
          $scope.error = response.data.error
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPrintersPath = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/printers_path/all",
      data: {
        select: {
          id: 1,
          name: 1,
          type: 1,
          ip: 1,
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.printersPathList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadSafes();
  $scope.loadStores();
  $scope.loadVendors();
  $scope.loadCustomers();
  $scope.getTrainerList();
  $scope.getPaymentMethodList();
  $scope.getDiscountMethodList();
  $scope.getPlaceProgramList();
  $scope.getHallList();
  $scope.getSourceType();
  $scope.loadSetting();
  $scope.getPrintersPath();
});