app.controller("prices_codes", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.prices_codes = {};

  $scope.displayAddPricesCodes = function () {
    $scope._search = {};
    $scope.error = "";
    $scope.prices_codes = {
      image_url: "/images/prices_codes.png",
      price: 0,
      active: true,
    };
    site.showModal("#pricesCodesAddModal");
  };

  $scope.addPricesCodes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#pricesCodesAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/prices_codes/add",
      data: $scope.prices_codes,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#pricesCodesAddModal");
          $scope.getPricesCodesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like("*duplicate key error*")) {
            $scope.error = "##word.code_exisit##";
          } else if (response.data.error.like("*Please write code*")) {
            $scope.error = "##word.enter_code_inventory##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdatePricesCodes = function (prices_codes) {
    $scope._search = {};

    $scope.error = "";
    $scope.detailsPricesCodes(prices_codes);
    $scope.prices_codes = {};
    site.showModal("#pricesCodesUpdateModal");
  };

  $scope.updatePricesCodes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#pricesCodesUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/prices_codes/update",
      data: $scope.prices_codes,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#pricesCodesUpdateModal");
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsPricesCodes = function (prices_codes) {
    $scope.error = "";
    $scope.detailsPricesCodes(prices_codes);
    $scope.prices_codes = {};
    site.showModal("#pricesCodesDetailsModal");
  };

  $scope.detailsPricesCodes = function (prices_codes) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/prices_codes/view",
      data: {
        id: prices_codes.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.prices_codes = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeletePricesCodes = function (prices_codes) {
    $scope.error = "";
    $scope.detailsPricesCodes(prices_codes);
    $scope.prices_codes = {};
    site.showModal("#pricesCodesDeleteModal");
  };

  $scope.deletePricesCodes = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/prices_codes/delete",
      data: {
        id: $scope.prices_codes.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#pricesCodesDeleteModal");
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getPricesCodesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/prices_codes/all",
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getPricesCodesList($scope.search);
    site.hideModal("#pricesCodesSearchModal");
    $scope.search = {};
  };

  $scope.getNumberingAuto = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "prices_codes",
      },
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
    );
  };

  $scope.getPricesCodesList();
  $scope.getNumberingAuto();
});
