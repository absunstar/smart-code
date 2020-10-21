app.controller("currency", function ($scope, $http, $timeout) {

  $scope.currency = {};

  $scope.displayAddCurrency = function () {
    $scope.error = '';
    $scope.currency = {
      image_url: '/images/currency.png',
      active: true

    };
    site.showModal('#currencyAddModal');

  };

  $scope.addCurrency = function () {
    $scope.error = '';
    const v = site.validated('#currencyAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/add",
      data: $scope.currency
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#currencyAddModal');
          $scope.getCurrencyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateCurrency = function (currency) {
    $scope.error = '';
    $scope.viewCurrency(currency);
    $scope.currency = {};
    site.showModal('#currencyUpdateModal');
  };

  $scope.updateCurrency = function () {
    $scope.error = '';
    const v = site.validated('#currencyUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/update",
      data: $scope.currency
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#currencyUpdateModal');
          $scope.getCurrencyList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCurrency = function (currency) {
    $scope.error = '';
    $scope.viewCurrency(currency);
    $scope.currency = {};
    site.showModal('#currencyViewModal');
  };

  $scope.viewCurrency = function (currency) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/currency/view",
      data: {
        id: currency.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.currency = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteCurrency = function (currency) {
    $scope.error = '';
    $scope.viewCurrency(currency);
    $scope.currency = {};
    site.showModal('#currencyDeleteModal');
  };

  $scope.deleteCurrency = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/currency/delete",
      data: $scope.currency
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#currencyDeleteModal');
          $scope.getCurrencyList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Delete Currency Its Exist In Other*')) {
            $scope.error = "##word.err_delete_currency##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCurrencyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#currencySearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#currencySearchModal');

  };

  $scope.searchAll = function () {

    $scope.getCurrencyList($scope.search);
    site.hideModal('#currencySearchModal');
    $scope.search = {};
  };

  $scope.getCurrencyList();

});