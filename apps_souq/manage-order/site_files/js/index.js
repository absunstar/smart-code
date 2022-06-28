app.controller("manage_order", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.manage_order = {};

  $scope.displayDeleveryManageOrder = function (manage_order) {
    $scope._search = {};

    $scope.error = "";
    $scope.detailsManageOrder(manage_order);
    $scope.manage_order = {};
    site.showModal("#deliveryOrderModal");
  };

  $scope.updateManageOrder = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#deliveryOrderModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order/update",
      data: $scope.manage_order,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#deliveryOrderModal");
          $scope.getManageOrderList();

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.updateStatusOrder = function (manage_order, id) {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";
    manage_order.status = $scope.orderStatusList.find((_status) => {
      return _status.id === id;
    });

    if (id == 3) {
      const v = site.validated("#deliveryOrderModal");
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order/update",
      data: manage_order,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (id == 2) {
            $scope.displayDeleveryManageOrder(manage_order);
          } else if (id == 3) {
            site.hideModal("#deliveryOrderModal");
          }
          $scope.getManageOrderList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsManageOrder = function (manage_order) {
    $scope.error = "";
    $scope.detailsManageOrder(manage_order);
    $scope.manage_order = {};
    site.showModal("#manageOrderDetailsModal");
  };

  $scope.detailsManageOrder = function (manage_order) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order/view",
      data: {
        id: manage_order.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.manage_order = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteManageOrder = function (manage_order) {
    $scope.error = "";
    $scope.detailsManageOrder(manage_order);
    $scope.manage_order = {};
    site.showModal("#manageOrderDeleteModal");
  };

  $scope.deleteManageOrder = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order/delete",
      data: {
        id: $scope.manage_order.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#manageOrderDeleteModal");
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

  $scope.getManageOrderList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/order/all",
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

  $scope.loadOrderStatus = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order/order_status/all",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.orderStatusList = response.data;
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
      url: "/api/order/delivery_agency/all",
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
    $scope.getManageOrderList($scope.search);
    site.hideModal("#manageOrderSearchModal");
    $scope.search = {};
  };

  $scope.getManageOrderList();
  $scope.loadOrderStatus();
  $scope.loadDeliveryAgency();
});
