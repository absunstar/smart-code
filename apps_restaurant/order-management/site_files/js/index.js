app.controller("order_management", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.order_management = {};

  $scope.showDetailes = function (order) {
    $scope.order_management = order;
    site.showModal('#reportInvoicesDetailsModal');
  };

  $scope.returnToKitchen = function (order, i) {
    $scope.error = '';
    $scope.busy = true;
    i.order_id = order.id;
    
    $http({
      method: "POST",
      url: "/api/order_management/update_kitchen",
      data: i
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          i.done_kitchen = false
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.updateOrderManagement = function (order) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_management/update",
      data: order
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#employeeDeliveryModal');
          $scope.getOrderManagementList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDeliveryEmployeesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.deliveryEmployeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTransactionTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.transactionTypeList = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/transaction_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.transactionTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getOrderStatusList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.orderStatusList = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/order_status/all"
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.orderStatusList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCustomerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.customersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTablesGroupList = function (where) {
    $scope.busy = true;
    $scope.tablesGroupList = [];
    $http({
      method: "POST",
      url: "/api/tables_group/all",
      data: {
        select: { id: 1, name: 1 , code: 1 },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.tablesGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTablesList = function (tables_group) {
    $scope.busy = true;
    $scope.tablesList = [];
    $http({
      method: "POST",
      url: "/api/tables/all",
      data: {
        select: { id: 1, name: 1, code: 1, busy: 1, tables_group: 1,image_url:1 },
        where: {
          'tables_group.id': tables_group.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.tablesList = response.data.list;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDeliveryEmployeesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.deliveryEmployeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDefaultSettingsList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
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
    )
  };

  $scope.getOrderManagementList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/order_management/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          $scope.remain_amount = 0;
          $scope.net_value = 0;
          $scope.paid_up = 0;
          $scope.list.forEach(invoice => {
            $scope.remain_amount += invoice.remain_amount;
            $scope.net_value += invoice.net_value;
            $scope.paid_up += invoice.paid_up;
          })
        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.showDeliveryEmployee = function (document) {
    $scope.delivery_management = document;
    site.showModal('#employeeDeliveryModal');
  };

  $scope.postOrder = function (order) {
    order.post = true;
    order.reset_items = true;
    $scope.updateOrderManagement(order);
  };


  $scope.returnToOrders = function (order) {
    order.status = {
      id: 1,
      en: "Opened",
      ar: "مفتوحة"
    };
    $scope.updateOrderManagement(order);
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getOrderManagementList($scope.search);
    site.hideModal('#reportInvoicesSearchModal');
    $scope.search = {}
  };

  $scope.getOrderManagementList();
  $scope.getDeliveryEmployeesList();
  $scope.getTransactionTypeList();
  $scope.getCustomerList();
  $scope.getTablesGroupList();
  $scope.getOrderStatusList();
  $scope.getDeliveryEmployeesList();
  $scope.getDefaultSettingsList();
});