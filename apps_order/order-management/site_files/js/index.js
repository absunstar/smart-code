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
            if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.discount_method && $scope.defaultSettings.general_Settings.discount_method.id == 2 && order.status.id == 2) {
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
                items: order.book_list,
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
          $scope.account_invoices.currency = $scope.defaultSettings.accounting.currency;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.account_invoices.payment_method, $scope.account_invoices.currency);
            if ($scope.account_invoices.payment_method.id == 1)
              $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.account_invoices.currency) {
          $scope.amount_currency = site.toNumber($scope.account_invoices.net_value) / site.toNumber($scope.account_invoices.currency.ex_rate);
          $scope.amount_currency = site.toNumber($scope.amount_currency);
          $scope.account_invoices.paid_up = $scope.amount_currency;
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

  $scope.addAccountInvoice = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    if ($scope.account_invoices.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting)
      $scope.account_invoices.posting = false;
    else $scope.account_invoices.posting = true;

    $scope.order_invoice.invoice = true;

    $http({
      method: "POST",
      url: "/api/account_invoices/add",
      data: $scope.account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.account_invoices = response.data.doc;
          site.hideModal('#accountInvoiceModal');
          $scope.printAccountInvoive();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.printAccountInvoive = function () {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    $scope.account_invoices = $scope.account_invoices || {};
    $scope.account_invoices.order_invoices_type = $scope.order_invoice.transaction_type;
    $scope.account_invoices.total_paid_up = site.toNumber($scope.account_invoices.total_paid_up);
    $scope.account_invoices.total_tax = site.toNumber($scope.account_invoices.total_tax);
    $scope.account_invoices.total_discount = site.toNumber($scope.account_invoices.total_discount);
    $scope.account_invoices.net_value = site.toNumber($scope.account_invoices.net_value);
    $scope.account_invoices.paid_up = site.toNumber($scope.account_invoices.paid_up);
    $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.net_value) - site.toNumber($scope.account_invoices.paid_up);;
    $scope.account_invoices.payment_paid_up = site.toNumber($scope.account_invoices.payment_paid_up);


    if ($scope.safe)
      $scope.account_invoices.safe = $scope.safe;

    if ($scope.order_invoice.customer)
      $scope.account_invoices.customer = $scope.order_invoice.customer;

    if ($scope.order_invoice.delivery_employee)
      $scope.account_invoices.delivery_employee = $scope.order_invoice.delivery_employee;

    if ($scope.order_invoice.table)
      $scope.account_invoices.table = $scope.order_invoice.table;

    if ($scope.order_invoice) {
      $scope.account_invoices.current_book_list = $scope.order_invoice.book_list;
      $scope.account_invoices.invoice_id = $scope.order_invoice.id;

      if ($scope.order_invoice.total_tax)
        $scope.account_invoices.total_tax = $scope.order_invoice.total_tax;

      if ($scope.order_invoice.total_discount)
        $scope.account_invoices.total_discount = $scope.order_invoice.total_discount;

      if ($scope.order_invoice.price_delivery_service)
        $scope.account_invoices.price_delivery_service = $scope.order_invoice.price_delivery_service;

      if ($scope.order_invoice.service)
        $scope.account_invoices.service = $scope.order_invoice.service;

    }


    let ip = '127.0.0.1';
    let port = '60080';

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path) {
      ip = $scope.defaultSettings.printer_program.printer_path.ip_device || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.printer_path.Port_device || '60080';
    };


    $scope.account_invoices.total_remain = $scope.account_invoices.net_value - $scope.account_invoices.paid_up;

    $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.total_remain);
    let obj_print = { data: [] };

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path)
      obj_print.printer = $scope.defaultSettings.printer_program.printer_path.ip.trim();

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_header)
      obj_print.data.push({
        type: 'header',
        value: $scope.defaultSettings.printer_program.invoice_header
      });

    obj_print.data.push(
      {
        type: 'title',
        value: $scope.account_invoices.payment_paid_up ? ' Bill payment ' : 'Bill ' + ($scope.account_invoices.code || '')
      },
      {
        type: 'space'
      },
      {
        type: 'text2',
        value2: site.toDateXF($scope.account_invoices.date),
        value: 'Date'
      });

    if ($scope.account_invoices.customer)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.customer.name_ar,
        value: 'Cutomer'
      });

    if ($scope.account_invoices.table)
      obj_print.data.push({
        type: 'text2',
        value: $scope.account_invoices.table.name,
        value2: $scope.account_invoices.table.tables_group.name
      });

    if ($scope.account_invoices.current_book_list && $scope.account_invoices.current_book_list.length > 0) {

      obj_print.data.push(
        {
          type: 'space'
        },
        {
          type: 'line'
        },
        {
          type: 'text3b',
          value2: 'Item',
          value: 'Count',
          value3: 'Price'
        },
        {
          type: 'text3b',
          value2: 'الصنف',
          value: 'العدد',
          value3: 'السعر'
        }, {
        type: 'space'
      }
      );

      $scope.account_invoices.current_book_list.forEach(_current_book_list => {
        _current_book_list.total = site.toNumber(_current_book_list.total);
        obj_print.data.push({
          type: 'item',
          value: _current_book_list.count,
          value2: _current_book_list.size,
          value3: _current_book_list.total
        })
      });
    };

    obj_print.data.push({
      type: 'line'
    });

    if ($scope.account_invoices.total_tax)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.total_tax,
        value: 'Total Taxes'
      });

    if ($scope.account_invoices.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.total_discount,
        value: 'Total Discount'
      });

    if ($scope.account_invoices.price_delivery_service)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.price_delivery_service,
        value: 'Service Delivery'
      });

    if ($scope.account_invoices.service)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.service,
        value: 'Service'
      });

    obj_print.data.push({ type: 'space' });

    if ($scope.account_invoices.payment_paid_up) {
      $scope.account_invoices.total_remain = $scope.account_invoices.total_remain - $scope.account_invoices.payment_paid_up;
      $scope.account_invoices.total_paid_up = $scope.account_invoices.total_paid_up + $scope.account_invoices.payment_paid_up;

      $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.total_remain);
      $scope.account_invoices.total_paid_up = site.toNumber($scope.account_invoices.total_paid_up);
    }

    if ($scope.account_invoices.net_value)
      obj_print.data.push(
        {
          type: 'total',
          value2: $scope.account_invoices.net_value,
          value: "Total Value"
        });

    if ($scope.account_invoices.payment_paid_up || $scope.account_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.payment_paid_up || $scope.account_invoices.paid_up,
          value: "Paid Up"
        });

    if ($scope.account_invoices.payment_paid_up || $scope.account_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.total_paid_up || $scope.account_invoices.paid_up,
          value: "Total Payments"
        });

    obj_print.data.push({ type: 'space' });

    if ($scope.account_invoices.total_remain)
      obj_print.data.push({
        type: 'total',
        value2: $scope.account_invoices.total_remain,
        value: "Required to pay"
      });

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_footer)
      obj_print.data.push({
        type: 'footer',
        value: $scope.defaultSettings.printer_program.invoice_footer
      });

    $http({
      method: "POST",
      url: `http://${ip}:${port}/print`,
      data: obj_print
    }).then(
      function (response) {
        if (response)
          $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.calc = function (account_invoices) {
    if (account_invoices.currency) {
      $scope.amount_currency = account_invoices.net_value / account_invoices.currency.ex_rate;
      $scope.amount_currency = site.toNumber($scope.amount_currency);
    }


  };

  $scope.getSafeByType = function (obj) {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      $scope.loadSafes(obj.payment_method, obj.currency);
      if (obj.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box)
          obj.safe = $scope.defaultSettings.accounting.safe_box
      } else {
        if ($scope.defaultSettings.accounting.safe_bank)
          obj.safe = $scope.defaultSettings.accounting.safe_bank
      }
    }
  };

  $scope.loadSafes = function (method, currency) {
    $scope.error = '';
    $scope.busy = true;

    if (currency && currency.id && method && method.id) {

      let where = { 'currency.id': currency.id };

      if (method.id == 1)
        where['type.id'] = 1;
      else where['type.id'] = 2;

      $http({
        method: "POST",
        url: "/api/safes/all",
        data: {
          select: {
            id: 1,
            name: 1,
            commission: 1,
            currency: 1,
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
    }
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
        select: { id: 1, name: 1, code: 1, active: 1, busy: 1, tables_group: 1, image_url: 1 },

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
    $scope.getStockItems(order.book_list, callback => {
      if (!callback) {

        $scope.get_open_shift((shift) => {
          if (shift) {
            order.post = true;
            $scope.post = true;
            $scope.updateOrderManagement(order);
          } else $scope.error = '##word.open_shift_not_found##';
        });
      } else {
        $scope.error = '##word.err_stock_item##';
      }
    });
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
          ex_rate: 1
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

  $scope.getStockItems = function (items, callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/item_stock",
      data: items
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          if (response.data.found) {
            callback(true)
          } else {
            callback(false)
          }
        } else {
          callback(false)
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
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
  $scope.loadCurrencies();
  $scope.getOrderStatusList();
  $scope.getDeliveryEmployeesList();
  $scope.getDefaultSettingsList();

  if (site.feature('restaurant'))
    $scope.getTablesGroupList();

});