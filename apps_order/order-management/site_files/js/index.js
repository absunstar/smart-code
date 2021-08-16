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
      url: "/api/stores_out/view",
      data: {
        order_id: order.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          let store_out = response.data.doc;
          store_out.posting = true;
          $http({
            method: "POST",
            url: "/api/stores_out/posting",
            data: store_out
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {

                $http({
                  method: "POST",
                  url: "/api/order_management/update",
                  data: order
                }).then(
                  function (response) {
                    $scope.busy = false;
                    if (response.data.done) {
                      site.hideModal('#employeeDeliveryModal');

                      $scope.posting = false;
                      $scope.getOrderManagementList();
                    } else {
                      $scope.error = 'Please Login First';
                    }
                  },
                  function (err) {
                    console.log(err);
                  }
                )

              } else {
                $scope.error = '##word.error##';
                if (response.data.error.like('*OverDraft Not*')) {
                  $scope.error = "##word.overdraft_not_active##"
                } else if (response.data.error.like('*n`t Found Open Shi*')) {
                  $scope.error = "##word.open_shift_not_found##"
                } else if (response.data.error.like('*n`t Open Perio*')) {
                  $scope.error = "##word.should_open_period##"
                } if (response.data.error.like('*t`s Have Account Invo*')) {
                  $scope.error = "##word.cant_process_found_invoice##"
                }
                if (store_out.posting) store_out.posting = false;
                else store_out.posting = true;
              }
            },
            function (err) {
              console.log(err);
            }
          )

        }
      }
    )

  };


  $scope.displayAccountInvoice = function (order_invoice) {
    $scope.order_invoice = order_invoice;
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
          total_value: order_invoice.total_value,
          total_value_added: order_invoice.total_value_added,
          invoice_code: order_invoice.number,
          total_discount: order_invoice.total_discount,
          total_tax: order_invoice.total_tax,
          items: order_invoice.under_paid.items,
          source_type: {
            id: 3,
            en: "Orders Screen",
            ar: "شاشة الطلبات"
          },
          active: true
        };

        if ($scope.defaultSettings.accounting) {
          if ($scope.defaultSettings.accounting.currency)
            $scope.account_invoices.currency = $scope.currenciesList.find(_currency => { return _currency.id === $scope.defaultSettings.accounting.currency.id });

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


    $http({
      method: "POST",
      url: "/api/account_invoices/add",
      data: $scope.account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.account_invoices = response.data.doc;
          if ($scope.account_invoices.source_type.id == 3 && $scope.account_invoices.paid_up > 0) {
            $scope.printAccountInvoive(response.data.doc);

            $scope.account_invoices.in_type = {
              id: 2,
              en: "Orders Screen",
              ar: "شاشة الطلبات"
            };
            $scope.account_invoices.source_type = {
              id: 8,
              en: "Amount In",
              ar: "سند قبض"
            };
            $scope.addAccountInvoice();
          }
          site.hideModal('#accountInvoiceModal');

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

  $scope.printAccountInvoive = function (obj) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;


    let name_lang = 'name_ar';
    if ('##session.lang##' === 'en') name_lang = 'name_en';

    if (obj.invoice_id) {
      obj.total_remain = ($scope.amount_currency - obj.paid_up);
      obj.total_remain = site.toNumber(obj.total_remain);
      obj.transaction_type = obj.order_invoices_type;
      obj.items = obj.items;
    } else {
      obj.total_remain = 0

    }


    let ip = '127.0.0.1';
    let port = '60080';

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path) {
      ip = $scope.defaultSettings.printer_program.printer_path.ip_device || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.printer_path.Port_device || '60080';
    };


    let obj_print = {
      data: []
    };
    if ($scope.defaultSettings.printer_program) {

      if ($scope.defaultSettings.printer_program.printer_path)
        obj_print.printer = $scope.defaultSettings.printer_program.printer_path.ip.name.trim();


      if ($scope.defaultSettings.printer_program.invoice_top_title) {
        obj_print.data.push({
          type: 'invoice-top-title',
          name: $scope.defaultSettings.printer_program.invoice_top_title
        });
      } else {
        obj_print.data.push({
          type: 'invoice-top-title',
          name: "Smart Code"
        });
      }

      if ($scope.defaultSettings.printer_program.invoice_logo) {

        obj_print.data.push({
          type: 'invoice-logo',
          url: document.location.origin + $scope.defaultSettings.printer_program.invoice_logo
        });
      } else {
        obj_print.data.push({
          type: 'invoice-logo',
          url: "http://127.0.0.1/images/logo.png"
        });
      }

      if ($scope.defaultSettings.printer_program.thermal_header && $scope.defaultSettings.printer_program.thermal_header.length > 0) {
        $scope.defaultSettings.printer_program.thermal_header.forEach(_ih => {
          obj_print.data.push({
            type: 'header',
            value: _ih.name
          });
        });

      }

    }

    obj_print.data.push({
      type: 'invoice-code',
      name: 'O-Invoice',
      value: obj.code || 'Test'
    }, {
      type: 'invoice-date',
      name: '##word.date##',
      value: site.toDateXF(obj.date)
    }, {
      type: 'space'
    }, {
      type: 'text2',
      value2: obj.transaction_type['##session.lang##'],
      value: '##word.order_type##'
    });


    if (obj.customer)
      obj_print.data.push({
        type: 'text2',
        value2: obj.customer[name_lang],
        value: '##word.customer##'
      });

    if (obj.table)
      obj_print.data.push({
        type: 'invoice-table',
        name: obj.table.tables_group[name_lang],
        value: obj.table[name_lang]
      });

    if (obj.items && obj.items.length > 0) {

      let size_lang = 'size_ar';
      if ('##session.lang##' === 'en') size_lang = 'size_en';


      obj_print.data.push({
        type: 'line'
      }, {
        type: 'invoice-item-title',
        count: '##word.count##',
        name: '##word.name##',
        price: '##word.price##'
      }, {
        type: 'line2'
      });

      obj.items.forEach((_items, i) => {
        _items.total = site.toNumber(_items.total);
        obj_print.data.push({
          type: 'invoice-item',
          count: _items.count,
          name: _items[size_lang],
          price: site.addSubZero(_items.total, 2)
        });
        if (i < obj.items.length - 1) {
          obj_print.data.push({
            type: 'line3'
          });
        }

      });
    };

    obj_print.data.push(
      {
        type: 'line'
      }
    );

    if (obj.currency)
      obj_print.data.push(
        {
          type: 'text2',
          value2: obj.currency[name_lang],
          value: "##word.currency##"
        });

    obj_print.data.push(
      {
        type: 'invoice-total',
        value: site.addSubZero((account_invoices.total_value - (account_invoices.total_value_added || 0)), 2),
        name: "##word.total_before_taxes_discounts##"
      }
    );

    if (obj.total_value_added) {

      obj_print.data.push({
        type: 'text2',
        value2: `${site.addSubZero(obj.total_value_added, 2)}  (${($scope.defaultSettings.inventory.value_added || 0)}%)`,
        value: "##word.total_value_added##"
      });
    }

    if (obj.total_tax)
      obj_print.data.push({
        type: 'text2',
        value2: obj.total_tax,
        value: '##word.total_tax##'
      });

    if (obj.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: obj.total_discount,
        value: '##word.total_discount##'
      });

    if (obj.price_delivery_service)
      obj_print.data.push({
        type: 'text2',
        value2: obj.price_delivery_service,
        value: '##word.delivery_service##'
      });

    if (obj.service)
      obj_print.data.push({
        type: 'text2',
        value2: obj.service,
        value: '##word.service##'
      });

    obj_print.data.push({
      type: 'space'
    });


    if (obj.net_value) {

      obj_print.data.push(
        {
          type: 'invoice-total',
          value: site.addSubZero(obj.net_value, 2),
          name: "##word.total_value##"
        },
        {
          type: 'invoice-total',
          value: site.stringfiy(obj.net_value) + $scope.defaultSettings.accounting.end_num_to_str,
        },
        {
          type: 'line'
        }
      );
    }

    if (obj.paid_up)
      obj_print.data.push({
        type: 'text2',
        value2: site.addSubZero(obj.paid_up, 2),
        value: "##word.paid_up##"
      });

    obj_print.data.push({
      type: 'space'
    });
    if (obj.invoice_id)
      obj_print.data.push({
        type: 'text2',
        value2: site.addSubZero(obj.total_remain, 2),
        value: "##word.remain##"
      });

    obj_print.data.push(
      {
        type: 'line'
      },
      {
        type: 'invoice-barcode',
        value: obj.code || 'test'
      },
      {
        type: 'invoice-total',
        value: $scope.defaultSettings.printer_program.tax_number,
        name: "##word.tax_number##"
      },
      {
        type: 'line'
      }
    );


    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.thermal_footer && $scope.defaultSettings.printer_program.thermal_footer.length > 0) {
      $scope.defaultSettings.printer_program.thermal_footer.forEach(_if => {
        obj_print.data.push({
          type: 'header',
          value: _if.name
        });
      });

    }

    $http({
      method: "POST",
      url: `http://${ip}:${port}/print`,
      data: obj_print
    }).then(
      function (response) {
        if (response.data.done)
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
            name_ar: 1, name_en: 1,
            commission: 1,
            currency: 1,
            type: 1,
            code: 1
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

  /*  $scope.addStoresOut = function (store_out) {
 
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
   }; */



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
      data: {
        where: {
          active: true
        }
      }
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
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
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
        select: { id: 1, name_ar: 1, name_en: 1, code: 1, active: 1, busy: 1, tables_group: 1, image_url: 1 },

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
        $scope.posting = false;
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
    $scope.getStockItems(order.items, order.store, callback => {
      if (!callback) {

        $scope.get_open_shift((shift) => {
          if (shift) {
            order.posting = true;
            $scope.posting = true;
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
          name_ar: 1, name_en: 1,
          minor_currency_ar: 1, minor_currency_en: 1,
          ex_rate: 1,
          code: 1
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

  $scope.getStockItems = function (items, store, callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/item_stock",
      data: { items: items, store: store }
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

  $scope.paymentsPayable = function (type) {
    $scope.error = '';
    $scope.account_invoices = $scope.account_invoices || {};
    $scope.account_invoices.payable_list = $scope.account_invoices.payable_list || [{}];
    if (type === 'view') {
      site.showModal('#addPaymentsModal');

    }
  };

  $scope.showExtrasItems = function (size) {
    $scope.error = '';
    $scope.size = size;
    site.showModal('#extrasModal');

  };

  $scope.getNumberingAutoInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "o_screen_invoices"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCodeInvoice = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
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
  $scope.getNumberingAutoInvoice();
  if (site.feature('restaurant'))
    $scope.getTablesGroupList();

});