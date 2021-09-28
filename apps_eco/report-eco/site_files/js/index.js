app.controller("report_eco", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_eco = {};

  $scope.displayDeleveryOrderEco = function (report_eco) {
    $scope._search = {};

    $scope.error = "";
    $scope.detailsOrderEco(report_eco);
    $scope.report_eco = {};
    site.showModal("#deliveryEcoModal");
  };

  $scope.updateOrderEco = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#deliveryEcoModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order_eco/update",
      data: $scope.report_eco,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#deliveryEcoModal");
          $scope.getOrderEcoList();

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.updateStatusEco = function (report_eco, id) {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";
    report_eco.status = $scope.ecoStatusList.find((_status) => {
      return _status.id === id;
    });

    if (id == 3) {
      const v = site.validated("#deliveryEcoModal");
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/update",
      data: report_eco,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (id == 2) {
            $scope.displayDeleveryOrderEco(report_eco);
          } else if (id == 3) {
            site.hideModal("#deliveryEcoModal");
          }
          $scope.getOrderEcoList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsOrderEco = function (report_eco) {
    $scope.error = "";
    $scope.detailsOrderEco(report_eco);
    $scope.report_eco = {};
    site.showModal("#reportEcoDetailsModal");
  };

  $scope.detailsOrderEco = function (report_eco) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/view",
      data: {
        id: report_eco.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.report_eco = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteOrderEco = function (report_eco) {
    $scope.error = "";
    $scope.detailsOrderEco(report_eco);
    $scope.report_eco = {};
    site.showModal("#reportEcoDeleteModal");
  };

  $scope.deleteOrderEco = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/delete",
      data: {
        id: $scope.report_eco.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#reportEcoDeleteModal");
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

  $scope.getOrderEcoList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/order_eco/all",
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

  $scope.loadEcoStatus = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/eco_status/all",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.ecoStatusList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadDeliveryAgency = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/report_eco/delivery_agency/all",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.deliveryAgencyList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadconductor = function (id) {
    $scope.busy = true;
    $scope.conductorList = [];

    let url = "/api/delegates/all";

    if (id == 1) {
      url = "/api/shipping_company/all";
    }

    $http({
      method: "POST",
      url: url,
      data: {
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.conductorList = response.data.list;
          console.log($scope.conductorList);
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
    $scope.getOrderEcoList($scope.search);
    site.hideModal("#reportEcoSearchModal");
    $scope.search = {};
  };

  $scope.getOrderEcoList();
  $scope.loadEcoStatus();
  $scope.loadDeliveryAgency();
});
