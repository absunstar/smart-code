app.controller("reset", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.reset = {};

  $scope.resetItems = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_items/reset_items"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.resetSafesPayment = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes_payments/drop"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.resetItemTransaction = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/item_transaction/drop"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.safesReset = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/safes/reset"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };


  $scope.unPostStoreIn = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_in/un_post"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.unPostStoreOut = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_out/un_post"
    }).then(
      function (response) {
        if (response.data.done) { }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.unPostAssemble = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_assemble/un_post"
    }).then(
      function (response) {
        if (response.data.done) { }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.unPostStoreTransfer = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/transfer_branch/un_confirm"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.unPostStoreStock = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_stock/un_confirm"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.unPostAccInvoice = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/account_invoices/un_post"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };


});