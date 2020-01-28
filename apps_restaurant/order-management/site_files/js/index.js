app.controller("order_management", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.order_management = {};

  $scope.showDetailes = function (order) {
    $scope.error = '';
    $scope.order_management = order;
    site.showModal('#reportInvoicesDetailsModal');
  };

  $scope.returnToKitchen = function (order, i) {
    $scope.error = '';

    $scope.get_open_shift((shift) => {
      if (shift) {
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
      } else $scope.error = '##word.open_shift_not_found##';
    });
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
          if (order.post && $scope.post)
            if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.discount_method && $scope.defaultSettings.general_Settings.discount_method.id == 2 && $scope.order_invoice.status.id == 2) {
              let store_out = {
                image_url: '/images/store_out.png',
                supply_date: new Date(),
                date: order.date,
                order_id: order.id,
                customer: order.customer,
                shift: order.shift,
                net_value: order.net_value,
                paid_up: order.net_value,
                payment_method: order.payment_method,
                store: order.store,
                order_code: order.code,
                items: $scope.order_invoice.book_list,
                total_discount: order.total_discount,
                total_tax: order.total_tax,
                total_value: order.total_value,
                net_value: order.net_value,
                type: {
                  id: 4,
                  en: "Orders Screen",
                  ar: "شاشة الطلبات"
                },
                active: true
              };
              if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting)
                store_out.posting = true;
              $scope.addStoresOut(store_out)
            }
          $scope.post = false;
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

  $scope.displayAccountInvoice = function (order_invoice) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: order_invoice.id,
          customer: order_invoice.customer,
          shift: shift,
          order_invoices_type: order_invoice.transaction_type,
          net_value: order_invoice.net_value,
          paid_up: 0,
          invoice_code: order_invoice.number,
          total_discount: order_invoice.total_discount,
          total_tax: order_invoice.total_tax,
          current_book_list: order_invoice.under_paid.book_list,
          source_type: {
            id: 3,
            en: "Orders Screen",
            ar: "شاشة الطلبات"
          },
          active: true
        };

        if ($scope.defaultSettings.accounting) {
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.account_invoices.payment_method);
            if ($scope.account_invoices.payment_method.id == 1) {
              if ($scope.defaultSettings.accounting.safe_box)
                $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            } else {
              if ($scope.defaultSettings.accounting.safe_bank)
                $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
            }
          }
        }
        site.showModal('#accountInvoiceModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
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

  $scope.getSafeByType = function (account_invoices) {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      $scope.loadSafes(account_invoices.payment_method);
      if (account_invoices.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box)
          account_invoices.safe = $scope.defaultSettings.accounting.safe_box
      } else {
        if ($scope.defaultSettings.accounting.safe_bank)
          account_invoices.safe = $scope.defaultSettings.accounting.safe_bank
      }
    }
  };

  $scope.loadSafes = function (method) {
    $scope.error = '';
    $scope.busy = true;
    let where = {};

    if (method.id == 1)
      where = { 'type.id': 1 };
    else where = { 'type.id': 2 };

    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          type: 1
        },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.safesList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.addStoresOut = function (store_out) {

    if (store_out.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_out/add",
        data: store_out
      }).then(
        function (response) {
          if (response.data.done) {
            $scope.busy = false;
          } else $scope.error = response.data.error;
        },
        function (err) {
          $scope.error = err.message;
        }
      )
    } else {
      $scope.error = "##word.must_enter_quantity##";
      return;
    }
  };



  $scope.getDeliveryEmployeesList = function () {
    $scope.error = '';
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
    $scope.error = '';
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
    $scope.error = '';
    $scope.busy = true;
    $scope.tablesGroupList = [];
    $http({
      method: "POST",
      url: "/api/tables_group/all",
      data: {
        select: { id: 1, name: 1, code: 1 },
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
    $scope.error = '';
    $scope.busy = true;
    $scope.tablesList = [];
    $http({
      method: "POST",
      url: "/api/tables/all",
      data: {
        select: { id: 1, name: 1, code: 1, busy: 1, tables_group: 1, image_url: 1 },
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
    $scope.error = '';
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

  $scope.handelOrders = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_management/handel_orders",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.handelorders = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDefaultSettingsList = function () {
    $scope.error = '';
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
    $scope.error = '';
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
        $scope.post = false;
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
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.delivery_management = document;
        site.showModal('#employeeDeliveryModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.postOrder = function (order) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        order.post = true;
        $scope.post = true;
        $scope.updateOrderManagement(order);
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  /*   $scope.returnToOrders = function (order) {
      $scope.error = '';
      $scope.get_open_shift((shift) => {
        if (shift) {
          order.status = {
            id: 1,
            en: "Opened",
            ar: "مفتوحة"
          };
          $scope.updateOrderManagement(order);
        } else $scope.error = '##word.open_shift_not_found##';
      });
    }; */

  $scope.searchAll = function () {
    $scope.error = '';
    $scope._search = {};
    $scope.getOrderManagementList($scope.search);
    site.hideModal('#reportInvoicesSearchModal');
    $scope.search = {}
  };

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
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

  $scope.getOrderManagementList({ date: new Date() });
  $scope.getDeliveryEmployeesList();
  $scope.getTransactionTypeList();
  $scope.getPaymentMethodList();
  $scope.getCustomerList();
  $scope.getTablesGroupList();
  $scope.getOrderStatusList();
  $scope.getDeliveryEmployeesList();
  $scope.getDefaultSettingsList();
});