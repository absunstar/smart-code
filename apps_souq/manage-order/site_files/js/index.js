app.controller('manage_order', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.manage_order = {};

  $scope.displayDeliveryManageOrder = function (manage_order) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsManageOrder(manage_order);
    $scope.manage_order = {};
    if ('##user.type.id##' == 2 && manage_order.shipping_company) {
      $scope.loadDelegate(manage_order.shipping_company.id);
    }
    site.showModal('#deliveryOrderModal');
  };

  $scope.notDelivered = function (manage_order,type) {
    $scope.error = '';
    if(type == 'cancelling_order') {
      manage_order.$cancelling_order;
    } else if(type == 'non_delivery') {
      manage_order.$non_delivery;
    }
    $scope.manage_order = manage_order;
    site.showModal('#notDeliveredModal');
  };

  $scope.updateManageOrder = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    /*     const v = site.validated('#deliveryOrderModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    } */

    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/order/update',
      data: $scope.manage_order,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deliveryOrderModal');
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
    $scope.error = '';
    manage_order.status = $scope.orderStatusList.find((_status) => {
      return _status.id === id;
    });

    if (id == 3) {
      const v = site.validated('#deliveryOrderModal');
      if (!v.ok) {
        $scope.error = v.messages[0].Ar;
        return;
      }
    }
    if (id == 4) {
      manage_order.$done_delivery = true;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/order/update',
      data: manage_order,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (id == 2) {
            $scope.displayDeliveryManageOrder(manage_order);
          } else if (id == 3) {
            site.hideModal('#deliveryOrderModal');
          }else if (id == 5) {
            site.hideModal('#notDeliveredModal');
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
    $scope.error = '';
    $scope.detailsManageOrder(manage_order);
    $scope.manage_order = {};
    site.showModal('#manageOrderDetailsModal');
  };

  $scope.detailsManageOrder = function (manage_order) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/order/view',
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
    $scope.error = '';
    $scope.detailsManageOrder(manage_order);
    $scope.manage_order = {};
    site.showModal('#manageOrderDeleteModal');
  };

  $scope.deleteManageOrder = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/order/delete',
      data: {
        id: $scope.manage_order.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#manageOrderDeleteModal');
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
      method: 'POST',
      url: '/api/order/all',
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
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/order_status/all',
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

  $scope.loadShippingCompany = function () {
    $scope.busy = true;
    $scope.shippingCompanyList = [];
    $http({
      method: 'POST',
      url: '/api/users/all',
      data: {
        where: {
          active: true,
          'type.id': 2,
        },
        select: {
          id: 1,
          email: 1,
          profile: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.shippingCompanyList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadDelegate = function (shippingCompanyId) {
    $scope.busy = true;
    $scope.delegateList = [];
    $http({
      method: 'POST',
      url: '/api/users/all',
      data: {
        where: {
          active: true,
          'shipping_company.id': shippingCompanyId,
          'type.id': 3,
        },
        select: {
          id: 1,
          email: 1,
          profile: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.delegateList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
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
    site.hideModal('#manageOrderSearchModal');
    $scope.search = {};
  };

  $scope.getManageOrderList();
  $scope.loadOrderStatus();
  $scope.loadShippingCompany();
  $scope.getDefaultSetting();
});
