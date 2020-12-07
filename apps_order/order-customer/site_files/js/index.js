app.controller("order_customer", function ($scope, $http, $timeout) {

  $scope._search = {};
  $scope.discount = {
    type: 'number'
  };
  $scope.tax = {};
  $scope.kitchensList = [];

  $scope.displayAddOrderCustomer = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.order_customer = {
          shift: shift,
          image_url: '/images/order_customer.png',
          active: true
        };
        site.showModal('#OrderCustomerAddModal');
      }
    })
  };

  $scope.cancelOrderCustomer = function () {

    $scope.busy = true;

    if ($scope.order_customer && $scope.order_customer.status && $scope.order_customer.status.id == 1) {
      $scope.deleteOrderCustomer($scope.order_customer);
      $scope.newOrderCustomer();
    }
  };

  $scope.newOrderCustomer = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {

        $scope.order_customer = {
          shift: shift,
          book_list: [],
          discountes: [],
          taxes: [],
          date: new Date(),
          details: [],
          status: {
            id: 1,
            en: "Opened",
            ar: "مفتوحة"
          }
        };

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.order_customer.store = $scope.defaultSettings.inventory.store;
        };

        if ($scope.defaultSettings.general_Settings) {
          $scope.order_customer.delivery_employee = $scope.defaultSettings.general_Settings.delivery_employee;
        }
        $scope.getCustomerList();

      } else {
        $scope.error = '##word.open_shift_not_found##'
      };
    });

  };

  $scope.addOrderCustomer = function () {
    $scope.error = '';
    if ($scope.order_customer.shift) {

      const v = site.validated('#OrderCustomerAddModal');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        $scope.order_customer.posting = false;

        $scope.order_customer.status = {
          id: 1,
          en: "Opened",
          ar: "مفتوحة"
        }
        return;
      };

      if (new Date($scope.order_customer.date) > new Date()) {

        $scope.error = "##word.date_exceed##";
        $scope.order_customer.posting = false;

        $scope.order_customer.status = {
          id: 1,
          en: "Opened",
          ar: "مفتوحة"
        }
        return;

      };

      if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
        let max_discount = false;

        $scope.order_customer.book_list.forEach(_itemSize => {
          if (_itemSize.discount.value > _itemSize.discount.max)
            max_discount = true;
        });

        if (max_discount) {
          $scope.error = "##word.err_maximum_discount##";
          $scope.order_customer.posting = false;

          $scope.order_customer.status = {
            id: 1,
            en: "Opened",
            ar: "مفتوحة"
          }
          return;
        }
      }

      let url = '/api/order_customer/update';
      if ($scope.order_customer.id) url = '/api/order_customer/update';
      else url = '/api/order_customer/add';

      $scope.busy = true;
      $http({
        method: "POST",
        url: url,
        data: $scope.order_customer
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.sendToKitchens(Object.assign({}, response.data.doc));
            $scope.order_customer = response.data.doc;

          } else {
            $scope.error = response.data.error;
            if (response.data.error.like('*Must Enter Code*')) {
              $scope.error = "##word.must_enter_code##";
              $scope.order_customer.posting = false;

              $scope.order_customer.status = {
                id: 1,
                en: "Opened",
                ar: "مفتوحة"
              }
            }
          }
        },
        function (err) {
          console.log(err);
        }
      )
    } else $scope.error = '##word.open_shift_not_found##';
  };

  $scope.addStoresOut = function (store_out) {

    if (store_out.items && store_out.items.length > 0) {
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

  $scope.sendToKitchens = function (_order_customer) {

    let ip = '127.0.0.1';
    let port = '60080';

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path) {
      ip = $scope.defaultSettings.printer_program.printer_path.ip_device || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.printer_path.Port_device || '60080';
    };


    $scope.kitchensList.forEach(_kitchen => {
      _kitchen.data = [];
      if (!_kitchen.printer_path) {
        _kitchen.printer = null;
        return;
      }

      _kitchen.printer = _kitchen.printer_path.ip;
      _kitchen.has_items = false;

      if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_header) {
        _kitchen.data.push({
          type: 'header',
          value: $scope.defaultSettings.printer_program.invoice_header
        })
      }




      _kitchen.data.push({
        type: 'text2',
        value2: site.toDateXF(_order_customer.date),
        value: 'Date'
      });

      _kitchen.data.push({
        type: 'text2b',
        value2: _kitchen.name,
        value: 'Kitchen'
      });


      _kitchen.data.push({
        type: 'space'
      });

      _kitchen.data.push({
        type: 'text2',
        value: 'Customer Code',
        value2: _order_customer.code
      });

      if (_order_customer.customer)
        _kitchen.data.push({
          type: 'text2',
          value2: _order_customer.customer.name_ar,
          value: 'Customer'
        });

      _kitchen.data.push({
        type: 'line'
      });

      _kitchen.data.push({
        type: 'text3b',
        value: 'Item',
        value2: 'Count',
        value3: "Notes"
      });

      _kitchen.data.push({
        type: 'text3b',
        value: 'الصنف',
        value2: 'العدد',
        value3: "ملاحظات"
      });
      _kitchen.data.push({
        type: 'space'
      });


      _order_customer.book_list.forEach(item_book => {
        if (!item_book.kitchen || item_book.printed) return;
        if (item_book.kitchen.id == _kitchen.id) {
          item_book.printed = true;
          _kitchen.has_items = true;
          _kitchen.data.push({
            type: 'text3',
            value: item_book.size,
            value2: item_book.count,
            value3: item_book.notes || ' ... '
          });
        }

      });

      _kitchen.data.push({
        type: 'line'
      });

      if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_footer) {
        _kitchen.data.push({
          type: 'footer',
          value: $scope.defaultSettings.printer_program.invoice_footer
        })
      }

      if (_kitchen.has_items) {
        $http({
          method: "POST",
          url: `http://${ip}:${port}/print`,
          data: _kitchen
        }).then(
          function (err) {
            console.log(err);
          }
        )
      }

    });

    /*     $scope.updateOrderCustomer(_order_customer);
     */
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

    $scope.order_customer.invoice = true;

    $http({
      method: "POST",
      url: "/api/account_invoices/add",
      data: $scope.account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.account_invoices = response.data.doc;
          site.hideModal('#accountCustomerModal');
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

    $scope.account_invoices.total_paid_up = site.toNumber($scope.account_invoices.total_paid_up);
    $scope.account_invoices.total_tax = site.toNumber($scope.account_invoices.total_tax);
    $scope.account_invoices.total_discount = site.toNumber($scope.account_invoices.total_discount);
    $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.total_remain);
    $scope.account_invoices.net_value = site.toNumber($scope.account_invoices.net_value);
    $scope.account_invoices.paid_up = site.toNumber($scope.account_invoices.paid_up);
    $scope.account_invoices.payment_paid_up = site.toNumber($scope.account_invoices.payment_paid_up);



    if ($scope.safe)
      $scope.account_invoices.safe = $scope.safe;

    if ($scope.order_customer.customer)
      $scope.account_invoices.customer = $scope.order_customer.customer;

    if ($scope.order_customer.delivery_employee)
      $scope.account_invoices.delivery_employee = $scope.order_customer.delivery_employee;

    if ($scope.order_customer) {
      $scope.account_invoices.current_book_list = $scope.order_customer.book_list;
      $scope.account_invoices.invoice_id = $scope.order_customer.id;

      if ($scope.order_customer.total_tax)
        $scope.account_invoices.total_tax = $scope.order_customer.total_tax;

      if ($scope.order_customer.total_discount)
        $scope.account_invoices.total_discount = $scope.order_customer.total_discount;

      if ($scope.order_customer.price_delivery_service)
        $scope.account_invoices.price_delivery_service = $scope.order_customer.price_delivery_service;

      if ($scope.order_customer.service)
        $scope.account_invoices.service = $scope.order_customer.service;

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
        if (response.data.done)
          $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateOrderCustomer = function (order_customer) {
    $scope.error = '';
    $scope.viewOrderCustomer(order_customer);
    $scope.order_customer = {};
    site.showModal('#OrderCustomerUpdateModal');
  };

  $scope.updateOrderCustomer = function (_order_customer) {
    $scope.error = '';
    const v = site.validated('#OrderCustomerUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_customer/update",
      data: _order_customer || $scope.order_customer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.doc.status.id == 1) {
            $scope.order_customer = response.data.doc;
          }

        } else {
          $scope.error = response.data.errro;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAccountCustomer = function (order_customer) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: order_customer.id,
          customer: order_customer.customer,
          shift: shift,
          net_value: order_customer.net_value,
          paid_up: 0,
          invoice_code: order_customer.number,
          total_discount: order_customer.total_discount,
          total_tax: order_customer.total_tax,
          current_book_list: order_customer.under_paid.book_list,
          source_type: {
            id: 5,
            en: "Orders Customers",
            ar: "طلبات العملاء"
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
        if ($scope.account_invoices.currency)
          $scope.amount_currency = site.toNumber($scope.account_invoices.net_value) / site.toNumber($scope.account_invoices.currency.ex_rate);
        $scope.calc($scope.account_invoices);

        site.showModal('#accountCustomerModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.displayDetailsOrderCustomer = function (order_customer) {
    $scope.error = '';
    $scope.viewOrderCustomer(order_customer);
    $scope.order_customer = {};
    site.showModal('#OrderCustomerViewModal');
  };

  $scope.viewOrderCustomer = function (order_customer) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/order_customer/view",
      data: {
        id: order_customer.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.order_customer = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.deleteOrderCustomer = function (order) {
    $scope.error = '';
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order_customer/delete",
      data: order
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          $scope.viewCustomersActiveList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getOrderCustomerList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/order_customer/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#OrderCustomerSearchModal');
          $scope.search = {};

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
          $scope.newOrderCustomer();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadItemsGroups = function () {
    $scope.busy = true;
    $scope.itemsGroupList = [];

    $http({
      method: "POST",
      url: "/api/items_group/all",
      data: {
        select: {
          id: 1,
          name: 1,
          image_url: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemsGroupList = response.data.list;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
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
          $scope.currenciesList.forEach(_c => {
            if ($scope.defaultSettings && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.currency && $scope.defaultSettings.accounting.currency.id == _c.id) {
              $scope.currencySetting = _c
            }
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
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

  $scope.getPrintersPath = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/printers_path/all",
      data: {
        select: {
          id: 1,
          name: 1,
          type: 1,
          ip_device: 1,
          Port_device: 1,
          ip: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.printersPathList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadKitchenList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/kitchen/all",
      data: {
        select: {
          id: 1,
          name: 1,
          printer_path: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.kitchensList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadTaxTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tax_types/all",
      data: {
        select: {
          code: 1,
          id: 1,
          name: 1,
          value: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tax_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadDiscountTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {
          code: 1,
          id: 1,
          name: 1,
          value: 1,
          type: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.discount_types = response.data.list;
        }
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
    let id = 0;

    if ('##user.type##' == 'customer') id = '##user.ref_info.id##';

    $http({
      method: "POST",
      url: "/api/customers/view",
      data: {
        id: id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.customerDoc = response.data.doc;

          $scope.order_customer.customer = $scope.customerDoc;
          $scope.order_customer.gov = $scope.customerDoc.gov;
          $scope.order_customer.city = $scope.customerDoc.city;
          $scope.order_customer.area = $scope.customerDoc.area;
          if ($scope.order_customer.area) $scope.order_customer.price_delivery_service = $scope.customerDoc.area.price_delivery_service;
          $scope.order_customer.address = $scope.customerDoc.address;
          $scope.order_customer.customer_mobile = $scope.customerDoc.mobile;
          $scope.order_customer.customer_phone = $scope.customerDoc.phone;
          $scope.order_customer.net_value = ($scope.customerDoc.net_value || 0) + (site.toNumber($scope.order_customer.price_delivery_service) || 0);

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

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true
        },
        select: { id: 1, name: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select: {
          id: 1,
          name: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          'city.id': city.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaList = response.data.list;
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


  $scope.getOrderCustomersActiveList = function (callback) {
    callback = callback || function () { };
    $scope.busy = true;
    $scope.invoicesActivelist = [];
    $http({
      method: "POST",
      url: "/api/order_customer/active_all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0)
          $scope.invoicesActivelist = response.data.list;
        callback()
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.viewCustomersActiveList = function () {
    if (!$scope.openShift) {
      $scope.getOrderCustomersActiveList(() => {
        if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
          $scope.error = "##word.err_waiting_list_empty##";
          return;
        };
        site.showModal('#orderCustomersActiveAddModal');
      });
    } else $scope.error = '##word.open_shift_not_found##';
  };


  $scope.returnWaitingOrder = function (item) {
    $scope.order_customer = item;
    site.hideModal("#orderCustomersActiveAddModal")
  };


  $scope.closeOrder = function () {

    $scope.getStockItems($scope.order_customer.book_list, callback => {

      if (!callback) {

        $scope.order_customer.shift = $scope.order_customer.shift || $scope.shift;
        if (!$scope.order_customer || !$scope.order_customer.shift) {
          return;
        }

        if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.discount_method && $scope.defaultSettings.inventory.discount_method.id == 1)
          $scope.order_customer.posting = true;

        $scope.order_customer.status = {
          id: 2,
          en: "Closed Of Orders Screen",
          ar: "مغلق من شاشة الأوردرات"
        };

        $scope.order_customer.under_paid = {
          book_list: $scope.order_customer.book_list,
          total_tax: $scope.order_customer.total_tax,
          total_discount: $scope.order_customer.total_discount,
          price_delivery_service: $scope.order_customer.price_delivery_service,
          service: $scope.order_customer.service,
          net_value: $scope.order_customer.net_value,
        };


        $scope.addOrderCustomer();
      } else {
        $scope.error = '##word.err_stock_item##';
      }
    })
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


  $scope.loadItems = function (group) {
    if (!$scope.openShift) {

      $scope.busy = true;
      $scope.itemsList = [];
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: {
            "item_group.id": group.id,
            service_item: { $ne: true },
            "is_pos": true
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.itemsList = response.data.list;
            $scope.current_items = [];
            site.showModal('#itemsListModal');
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    } else $scope.error = '##word.open_shift_not_found##';
  };

  $scope.showItemsIn = function (i) {
    $scope.current_items = i;
    if ($scope.current_items.sizes) {

      $scope.current_items.sizes.forEach(_size => {
        _size.main_unit = $scope.current_items.main_unit;
        _size.item_group = $scope.current_items.item_group;
        _size.size_units_list.forEach(_unit => {
          if (_unit.id === _size.main_unit.id) {
            _size.price = _unit.price
          }
        });
        _size.item_id = $scope.current_items.id;
        _size.name = $scope.current_items.name;
      });
    }
    site.showModal('#sizesModal');
  };

  $scope.deliveryServiceHide = function () {
    site.hideModal('#deliveryServiceModal');
  };

  $scope.bookList = function (item) {

    $scope.error = '';
    $scope.order_customer.book_list = $scope.order_customer.book_list || [];
    let exist = false;
    let foundHold = false;
    let kitchenBranch = {};
    if (item.branches_list && item.branches_list.length > 0) {

      item.branches_list.forEach(_branch => {
        if (_branch.code == '##session.branch.code##') {
          kitchenBranch = _branch.kitchen;
          _branch.stores_list.forEach(_store => {
            if (_store.store && _store.store.id == $scope.order_customer.store.id) {
              if (_store.hold) foundHold = true;
            }
          });
        }
      });
    }

    $scope.order_customer.book_list.forEach(el => {
      if (item.size == el.size && item.barcode == el.barcode && !el.printed) {
        exist = true;
        el.total += (item.price - item.discount.value);
        el.count += 1;
      };
    });

    if (!exist) {

      let indxUnit = item.size_units_list.findIndex(_unit => _unit.id == item.main_unit.id);

      item.unit = item.size_units_list[indxUnit];
      item.discount = item.size_units_list[indxUnit].discount;
      item.price = item.size_units_list[indxUnit].price;
      if (!foundHold) {

        $scope.order_customer.book_list.push({
          item_id: item.item_id,
          kitchen: kitchenBranch,
          name: item.name,
          store: item.store,
          barcode: item.barcode,
          size: item.size,
          size_en: item.size_en,
          item_group: item.item_group,
          unit: item.unit,
          total: (item.price - item.discount.value),
          vendor: item.vendor,
          store: item.store,
          price: item.price,
          discount: item.discount,
          count: 1
        });
      }
    };
    $scope.calc($scope.order_customer);
  };

  $scope.deleteItemsList = function (item) {
    $scope.error = '';

    if (item.count == 1) {
      $scope.order_customer.book_list.splice($scope.order_customer.book_list.indexOf(item), 1)

    } else if (item.count > 1) {
      item.count -= 1;
      item.total -= item.price;
      return item
    };
  };

  $scope.addTax = function () {
    if (!$scope.tax.value) {
      $scope.error = '##word.error_tax##';
      return;
    } else {
      $scope.order_customer.taxes = $scope.order_customer.taxes || [];
      if ($scope.tax.value) {
        $scope.order_customer.taxes.push({
          name: $scope.tax.name,
          value: $scope.tax.value
        });
      };
      $scope.tax = {};
    };
  };

  $scope.deleteTax = function (_tx) {
    for (let i = 0; i < $scope.order_customer.taxes.length; i++) {
      let tx = $scope.order_customer.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value) {
        $scope.order_customer.taxes.splice(i, 1);
      };
    };
  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {

      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.order_customer.discountes = $scope.order_customer.discountes || [];
      $scope.order_customer.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
    };
  };

  $scope.deleteDiscount = function (_ds) {
    for (let i = 0; i < $scope.order_customer.discountes.length; i++) {
      let ds = $scope.order_customer.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type) {
        $scope.order_customer.discountes.splice(i, 1);
      };
    };
  };

  $scope.calcSize = function (size) {
    $scope.error = '';
    setTimeout(() => {
      let discount = 0;
      if (size.price && size.count) {
        if (size.discount.type == 'number')
          discount = size.discount.value * size.count;
        else if (size.discount.type == 'percent')
          discount = size.discount.value * (size.price * size.count) / 100;

        size.total = (site.toNumber(size.price) * site.toNumber(size.count)) - discount;
      }
      $scope.calc($scope.order_customer);
    }, 100);
  };

  $scope.calc = function (obj) {

    $timeout(() => {
      obj.total_value = 0;
      obj.total_tax = 0;
      obj.total_discount = 0;

      if (obj.book_list && obj.book_list.length > 0) {
        obj.book_list.forEach(itm => {
          obj.total_value += site.toNumber(itm.total);
        });
      };

      if (obj.taxes && obj.taxes.length > 0) {
        obj.taxes.forEach(tx => {
          obj.total_tax += obj.total_value * site.toNumber(tx.value) / 100;
        });
      };

      if (obj.discountes && obj.discountes.length > 0) {
        obj.discountes.forEach(ds => {

          if (ds.type === "percent")
            obj.total_discount += site.toNumber(obj.total_value) * site.toNumber(ds.value) / 100;
          else
            obj.total_discount += site.toNumber(ds.value);
        });
      };

      obj.price_delivery_service = site.toNumber(obj.price_delivery_service) || 0;

      if (obj.book_list && obj.book_list.length > 0)
        obj.net_value = (site.toNumber(obj.total_value) + (obj.total_tax || 0) + obj.price_delivery_service || 0) - (obj.total_discount || 0);

      if (obj.currency) {
        $scope.amount_currency = obj.net_value / obj.currency.ex_rate;
        $scope.amount_currency = site.toNumber($scope.amount_currency);
      }

      $scope.discount = {
        type: 'number'
      };
    }, 250);

  };

  $scope.changeCustomerAddresses = function (customer) {

    $scope.order_customer.gov = customer.gov;
    $scope.order_customer.city = customer.city;
    $scope.order_customer.area = customer.area;
    $scope.order_customer.address = customer.address;
    $scope.order_customer.customer_phone = customer.phone;
    $scope.order_customer.customer_mobile = customer.mobile;
    $scope.order_customer.customer_mobile = customer.mobile;
    $scope.order_customer.price_delivery_service = customer.area.price_delivery_service;
  };


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#OrderCustomerSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getOrderCustomerList($scope.search);
    site.hideModal('#OrderCustomerSearchModal');
    $scope.search = {};
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

  $scope.getOpenShiftList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/open_shift",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1,
          name: 1,
          code: 1,
          from_date: 1,
          from_time: 1,
          to_date: 1,
          to_time: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done)
          $scope.openShift = true;
        else $scope.openShift = false;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "o_customer_screen"
      }
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
    )
  };

  $scope.getDefaultSettingsList();
  $scope.newOrderCustomer();
  $scope.getOrderCustomerList();
  $scope.loadItemsGroups();
  $scope.loadDiscountTypes();
  $scope.loadTaxTypes();
  $scope.getDeliveryEmployeesList();
  $scope.getOpenShiftList();
  $scope.getGovList();
  $scope.loadCurrencies();
  $scope.getPrintersPath();
  $scope.getPaymentMethodList();
  $scope.getNumberingAuto();
  if (site.feature('restaurant'))
    $scope.loadKitchenList();
});