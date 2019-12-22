app.controller("order_invoice", function ($scope, $http, $timeout) {

  $scope._search = {};
  $scope.discount = {
    type: 'number'
  };
  $scope.tax = {};
  $scope.kitchensList = [];

  $scope.displayAddOrderInvoice = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.order_invoice = {
          shift: shift,
          image_url: '/images/order_invoice.png',
          active: true
        };
        site.showModal('#OrderInvoiceAddModal');
      }
    })


  };

  $scope.newOrderInvoice = function () {
    $scope.error = "";

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.order_invoice = {
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
            $scope.order_invoice.store = $scope.defaultSettings.inventory.store;
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.order_type) {
            $scope.order_invoice.transaction_type = $scope.defaultSettings.general_Settings.order_type;

            if ($scope.defaultSettings.general_Settings.order_type.id == 2)
              $scope.order_invoice.delivery_employee = $scope.defaultSettings.general_Settings.delivery_employee;

            if ($scope.defaultSettings.general_Settings.order_type.id == 1) {
              if ($scope.defaultSettings.general_Settings.service)
                $scope.order_invoice.service = $scope.defaultSettings.general_Settings.service;
            }
          }

          if ($scope.defaultSettings.general_Settings.customer) {
            $scope.order_invoice.customer = $scope.defaultSettings.general_Settings.customer;
            if ($scope.defaultSettings.general_Settings.customer.gov)
              $scope.order_invoice.gov = $scope.defaultSettings.general_Settings.customer.gov;

            if ($scope.defaultSettings.general_Settings.customer.city)
              $scope.order_invoice.city = $scope.defaultSettings.general_Settings.customer.city;

            if ($scope.defaultSettings.general_Settings.customer.area) {
              $scope.order_invoice.area = $scope.defaultSettings.general_Settings.customer.area;

              if ($scope.defaultSettings.general_Settings.customer.area.price_delivery_service)
                $scope.order_invoice.price_delivery_service = $scope.defaultSettings.general_Settings.customer.area.price_delivery_service;
            };

            if ($scope.defaultSettings.general_Settings.customer.address)
              $scope.order_invoice.address = $scope.defaultSettings.general_Settings.customer.address;

            if ($scope.defaultSettings.general_Settings.customer.customer_phone)
              $scope.order_invoice.customer_phone = $scope.defaultSettings.general_Settings.customer.customer_phone;

            if ($scope.defaultSettings.general_Settings.customer.customer_mobile)
              $scope.order_invoice.customer_mobile = $scope.defaultSettings.general_Settings.customer.customer_mobile;
          }
        }

      } else {
        $scope.error = '##word.open_shift_not_found##'
      };
    });

  };

  $scope.addOrderInvoice = function () {
    $scope.error = '';
    if ($scope.order_invoice.shift) {

      const v = site.validated('#OrderInvoiceAddModal');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      };
      if (!$scope.order_invoice.transaction_type) {
        $scope.error = "##word.err_transaction_type##";
        return;
      };
      if (!$scope.order_invoice.customer && $scope.order_invoice.transaction_type == 2) {
        $scope.error = "##word.err_customer##";
        return;
      };
      if (!$scope.order_invoice.table && $scope.order_invoice.transaction_type == 1) {
        $scope.error = "##word.err_table##";
        return;
      };

      if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
        let max_discount = false;

        $scope.order_invoice.book_list.forEach(_itemSize => {
          if (_itemSize.discount.value > _itemSize.discount.max)
            max_discount = true;
        });

        if (max_discount) {
          $scope.error = "##word.err_maximum_discount##";
          return;
        }
      }

      if ($scope.order_invoice.transaction_type.id != 2 && $scope.order_invoice.delivery_employee)
        $scope.order_invoice.delivery_employee = {};

      if ($scope.order_invoice.transaction_type.id != 1 && $scope.order_invoice.table)
        $scope.order_invoice.table = {};

      if ($scope.order_invoice.transaction_type.id != 1 && $scope.order_invoice.service)
        $scope.order_invoice.service = 0;

      if ($scope.order_invoice.transaction_type.id != 2 && $scope.order_invoice.price_delivery_service)
        $scope.order_invoice.price_delivery_service = 0;

      let url = '/api/order_invoice/update';
      if ($scope.order_invoice.id) url = '/api/order_invoice/update';
      else url = '/api/order_invoice/add';

      $scope.busy = true;
      $http({
        method: "POST",
        url: url,
        data: $scope.order_invoice
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.sendToKitchens(Object.assign({}, response.data.doc));
            /*  if ($scope.order_invoice.status && $scope.order_invoice.status.id == 2) {
               $scope.newOrderInvoice();
             } else {
             } */

            $scope.order_invoice = response.data.doc;

          } else {
            $scope.error = response.data.error;
          }
        },
        function (err) {
          console.log(err);
        }
      )
    } else $scope.error = '##word.open_shift_not_found##';
  };

  $scope.sendToKitchens = function (_order_invoice) {
    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    }

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
        value2: site.toDateXF(_order_invoice.date),
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
        value: 'Invoice Code',
        value2: _order_invoice.code
      });

      if (_order_invoice.customer)
        _kitchen.data.push({
          type: 'text2',
          value2: _order_invoice.customer.name_ar,
          value: 'Customer'
        });

      if (_order_invoice.table)
        _kitchen.data.push({
          type: 'text2',
          value2: _order_invoice.table.name,
          value: _order_invoice.table.tables_group.name
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


      _order_invoice.book_list.forEach(item_book => {
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

    $scope.updateOrderInvoice(_order_invoice);

  };

  $scope.addAccountInvoice = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    $scope.create_invoices = {
      shift: $scope.order_invoice.shift,
      source_type: {
        id: 3,
        en: "Orders Screen",
        ar: "شاشة الطلبات"
      },
      image_url: '/images/create_invoices.png',
      date: new Date(),
      active: true,
      net_value: $scope.order_invoice.net_value,
      paid_up: $scope.paid_up || 0
    };

    $scope.create_invoices.payment_method = $scope.payment_method;
    $scope.create_invoices.order_invoices_type = $scope.order_invoice.transaction_type;

    if ($scope.safe)
      $scope.create_invoices.safe = $scope.safe;

    if ($scope.order_invoice.customer)
      $scope.create_invoices.customer = $scope.order_invoice.customer;

    if ($scope.order_invoice.delivery_employee)
      $scope.create_invoices.delivery_employee = $scope.order_invoice.delivery_employee;

    if ($scope.order_invoice.table)
      $scope.create_invoices.table = $scope.order_invoice.table;

    if ($scope.order_invoice) {
      $scope.create_invoices.current_book_list = $scope.order_invoice.book_list;
      $scope.create_invoices.order_invoices_id = $scope.order_invoice.id;

      if ($scope.order_invoice.total_tax)
        $scope.create_invoices.total_tax = $scope.order_invoice.total_tax;

      if ($scope.order_invoice.total_discount)
        $scope.create_invoices.total_discount = $scope.order_invoice.total_discount;

      if ($scope.order_invoice.price_delivery_service)
        $scope.create_invoices.price_delivery_service = $scope.order_invoice.price_delivery_service;

      if ($scope.order_invoice.service)
        $scope.create_invoices.service = $scope.order_invoice.service;
    }

    if ($scope.create_invoices.paid_up <= 0) $scope.create_invoices.safe = null;

    $http({
      method: "POST",
      url: "/api/create_invoices/add",
      data: $scope.create_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.order_invoice.has_invoice = true;
          $scope.create_invoices = response.data.doc;
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


    $scope.create_invoices = {
      shift: $scope.order_invoice.shift,
      source_type: {
        id: 3,
        en: "Orders Screen",
        ar: "شاشة الطلبات"
      },
      image_url: '/images/create_invoices.png',
      date: new Date(),
      active: true,
      net_value: $scope.order_invoice.net_value,
      paid_up: $scope.paid_up || 0
    };

    $scope.create_invoices.payment_method = $scope.payment_method;
    $scope.create_invoices.order_invoices_type = $scope.order_invoice.transaction_type;

    if ($scope.safe)
      $scope.create_invoices.safe = $scope.safe;

    if ($scope.order_invoice.customer)
      $scope.create_invoices.customer = $scope.order_invoice.customer;

    if ($scope.order_invoice.delivery_employee)
      $scope.create_invoices.delivery_employee = $scope.order_invoice.delivery_employee;

    if ($scope.order_invoice.table)
      $scope.create_invoices.table = $scope.order_invoice.table;

    if ($scope.order_invoice) {
      $scope.create_invoices.current_book_list = $scope.order_invoice.book_list;
      $scope.create_invoices.order_invoices_id = $scope.order_invoice.id;

      if ($scope.order_invoice.total_tax)
        $scope.create_invoices.total_tax = $scope.order_invoice.total_tax;

      if ($scope.order_invoice.total_discount)
        $scope.create_invoices.total_discount = $scope.order_invoice.total_discount;

      if ($scope.order_invoice.price_delivery_service)
        $scope.create_invoices.price_delivery_service = $scope.order_invoice.price_delivery_service;

      if ($scope.order_invoice.service)
        $scope.create_invoices.service = $scope.order_invoice.service;

    }

    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    };

    $scope.create_invoices.total_remain = $scope.create_invoices.net_value - $scope.create_invoices.paid_up;
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
        value: $scope.create_invoices.payment_paid_up ? ' Bill payment ' : 'Bill ' + ($scope.create_invoices.code || '')
      },
      {
        type: 'space'
      },
      {
        type: 'text2',
        value2: site.toDateXF($scope.create_invoices.date),
        value: 'Date'
      });

    if ($scope.create_invoices.customer)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.create_invoices.customer.name_ar,
        value: 'Cutomer'
      });

    if ($scope.create_invoices.table)
      obj_print.data.push({
        type: 'text2',
        value: $scope.create_invoices.table.name,
        value2: $scope.create_invoices.table.tables_group.name
      });

    if ($scope.create_invoices.current_book_list && $scope.create_invoices.current_book_list.length > 0) {

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

      $scope.create_invoices.current_book_list.forEach(_current_book_list => {
        obj_print.data.push({
          type: 'item',
          value: _current_book_list.count,
          value2: _current_book_list.size,
          value3: _current_book_list.total_price
        })
      });
    };

    obj_print.data.push({
      type: 'line'
    });

    if ($scope.create_invoices.total_tax)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.create_invoices.total_tax,
        value: 'Total Taxes'
      });

    if ($scope.create_invoices.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.create_invoices.total_discount,
        value: 'Total Discount'
      });

    if ($scope.create_invoices.price_delivery_service)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.create_invoices.price_delivery_service,
        value: 'Service Delivery'
      });

    if ($scope.create_invoices.service)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.create_invoices.service,
        value: 'Service'
      });

    obj_print.data.push({ type: 'space' });

    if ($scope.create_invoices.payment_paid_up) {
      $scope.create_invoices.total_remain = $scope.create_invoices.total_remain - $scope.create_invoices.payment_paid_up;
      $scope.create_invoices.total_paid_up = $scope.create_invoices.total_paid_up + $scope.create_invoices.payment_paid_up;
    }

    if ($scope.create_invoices.net_value)
      obj_print.data.push(
        {
          type: 'total',
          value2: $scope.create_invoices.net_value,
          value: "Total Value"
        });

    if ($scope.create_invoices.payment_paid_up || $scope.create_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.create_invoices.payment_paid_up || $scope.create_invoices.paid_up,
          value: "Paid Up"
        });

    if ($scope.create_invoices.payment_paid_up || $scope.create_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.create_invoices.total_paid_up || $scope.create_invoices.paid_up,
          value: "Total Payments"
        });

    obj_print.data.push({ type: 'space' });

    if ($scope.create_invoices.total_remain)
      obj_print.data.push({
        type: 'total',
        value2: $scope.create_invoices.total_remain,
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

  $scope.displayUpdateOrderInvoice = function (order_invoice) {
    $scope.error = '';
    $scope.viewOrderInvoice(order_invoice);
    $scope.order_invoice = {};
    site.showModal('#OrderInvoiceUpdateModal');
  };

  $scope.updateOrderInvoice = function (_order_invoice) {
    $scope.error = '';
    const v = site.validated('#OrderInvoiceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_invoice/update",
      data: _order_invoice || $scope.order_invoice
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.doc.status.id == 1) {
            $scope.order_invoice = response.data.doc;
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

  $scope.displayAccountInvoice = function (order_invoice) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: order_invoice.id,
          customer: order_invoice.customer,
          shift: shift,
          net_value: order_invoice.net_value,
          paid_up: 0,
          invoice_code: order_invoice.number,
          total_discount: order_invoice.total_discount,
          total_tax: order_invoice.total_tax,
          current_book_list: order_invoice.items,
          source_type: {
            id: 2,
            en: "Stores Out / Sales Invoice",
            ar: "إذن صرف / فاتورة بيع"
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
        site.showModal('#createInvoiceModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.displayDetailsOrderInvoice = function (order_invoice) {
    $scope.error = '';
    $scope.viewOrderInvoice(order_invoice);
    $scope.order_invoice = {};
    site.showModal('#OrderInvoiceViewModal');
  };

  $scope.viewOrderInvoice = function (order_invoice) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/order_invoice/view",
      data: {
        id: order_invoice.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.order_invoice = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.deleteOrderInvoice = function (order) {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/order_invoice/delete",
      data: order
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#OrderInvoiceDeleteModal');
          $scope.getOrderInvoiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getOrderInvoiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#OrderInvoiceSearchModal');
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
          $scope.newOrderInvoice();
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
          image_url: 1
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
          ip: 1,
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
          printer_path: 1
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

  $scope.displayAddCustomer = function () {
    $scope.error = '';
    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,
      allergic_food_list: [{}],
      allergic_drink_list: [{}],
      medicine_list: [{}],
      disease_list: [{}],
    };
    site.showModal('#customerAddModal');
    document.querySelector('#customerAddModal .tab-link').click();
  };

  $scope.addCustomer = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#customerAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/add",
      data: $scope.customer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerAddModal');
          $scope.count = $scope.list.length;
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCustomerList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer
          /*  select: {
            id: 1,
            name_ar: 1,
            name_en: 1,
          } */
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
  };

  $scope.getCustomerGroupList = function () {
    $http({
      method: "POST",
      url: "/api/customers_group/all",
      data: {
        select: { id: 1, name: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.customerGroupList = response.data.list;
      },
      function (err) {
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
        select: { id: 1, name: 1 }
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
          name: 1
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

  $scope.getTablesGroupList = function () {
    $scope.busy = true;
    $scope.tablesGroupList = [];
    $http({
      method: "POST",
      url: "/api/tables_group/all",
      data: {
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
          response.data.list.forEach(tablesGroup => {
            tablesGroup.tables_list = [];
            $scope.tablesList.forEach(tables => {
              if (tablesGroup.id === tables.tables_group.id)
                tablesGroup.tables_list.push(tables)
            });
          });
          $scope.tablesGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTablesList = function (callback) {
    callback = callback || function () { };

    $scope.busy = true;
    $scope.tablesList = [];
    $http({
      method: "POST",
      url: "/api/tables/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1,
          busy: 1,
          tables_group: 1,
          image_url: 1
        },
        where: {
          /*'tables_group.id': tables_group.id,*/
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0)
          $scope.tablesList = response.data.list;
        callback();
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getOrderInvoicesActiveList = function (callback) {
    callback = callback || function () { };
    $scope.busy = true;
    $scope.invoicesActivelist = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/active_all",
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

  $scope.viewInvoicesTablesList = function () {
    if (!$scope.openShift) {
      $scope.getOrderInvoicesActiveList(() => {
        $scope.invoicesTablelist = [];
        $scope.invoicesActivelist.forEach(_invoiceActive => {
          if (_invoiceActive.transaction_type && _invoiceActive.transaction_type.id == 1 && _invoiceActive.id != $scope.order_invoice.id) {
            $scope.invoicesTablelist.push(_invoiceActive);
          };
        });

        if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
          $scope.error = "##word.err_waiting_list_empty##";
          return;
        };
        site.showModal('#mergeTablesModal');
      });
    } else $scope.error = '##word.open_shift_not_found##';
  };

  $scope.viewInvoicesActiveList = function () {
    if (!$scope.openShift) {
      $scope.getOrderInvoicesActiveList(() => {
        if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
          $scope.error = "##word.err_waiting_list_empty##";
          return;
        };
        site.showModal('#orderInvoicesActiveAddModal');
      });
    } else $scope.error = '##word.open_shift_not_found##';
  };

  $scope.mergeTables = function (order) {
    $scope.error = '';
    $scope.order_invoice.book_list = $scope.order_invoice.book_list || [];
    let exist = false;

    order.book_list.forEach(item => {
      $scope.order_invoice.book_list.forEach(el => {

        if (item.size == el.size) {
          exist = true;

          el.count = el.count + item.count;

          el.total_price += el.price;
        };
      });
      if (!exist) {
        $scope.order_invoice.book_list.push(item);
      };
    });
    $scope.calc();
    $scope.deleteOrderInvoice(order);
    site.hideModal("#mergeTablesModal");
  };

  $scope.returnWaitingOrder = function (item) {
    $scope.order_invoice = item;
    site.hideModal("#orderInvoicesActiveAddModal")
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



  $scope.closeOrder = function () {

    $scope.order_invoice.shift = $scope.order_invoice.shift || $scope.shift;
    if (!$scope.order_invoice || !$scope.order_invoice.shift) {
      return;
    }

    if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.discount_method && $scope.defaultSettings.general_Settings.discount_method.id == 1) {
      $scope.order_invoice.reset_items = true
    } else {
      $scope.order_invoice.reset_items = false;
      $scope.order_invoice.post = false;
    }

    $scope.order_invoice.status = {
      id: 2,
      en: "Closed Of Orders Screen",
      ar: "مغلق من شاشة الأوردرات"
    };

    $scope.order_invoice.under_paid = {
      book_list: $scope.order_invoice.book_list,
      total_tax: $scope.order_invoice.total_tax,
      total_discount: $scope.order_invoice.total_discount,
      price_delivery_service: $scope.order_invoice.price_delivery_service,
      service: $scope.order_invoice.service,
      net_value: $scope.order_invoice.net_value,
      items_price: 0
    };

    if ($scope.order_invoice.id)
      $scope.order_invoice.under_paid.order_invoice_id = $scope.order_invoice.id;
    $scope.order_invoice.book_list.forEach(book_list => {
      $scope.order_invoice.under_paid.items_price += book_list.total_price;
    });

    $scope.addOrderInvoice();
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
    if ($scope.current_items.sizes) $scope.current_items.sizes.forEach(size => {
      size.item_id = $scope.current_items.id;
      size.name = $scope.current_items.name;
    });
    site.showModal('#sizesModal');
  };

  $scope.deliveryServiceHide = function () {
    site.hideModal('#deliveryServiceModal');
  };

  $scope.bookList = function (item) {

    $scope.error = '';
    $scope.order_invoice.book_list = $scope.order_invoice.book_list || [];
    let exist = false;

    $scope.order_invoice.book_list.forEach(el => {
      if (item.size == el.size && !el.printed) {
        exist = true;
        el.total_price += (item.price - item.discount.value);
        el.count += 1;
      };
    });

    if (!exist) {
      $scope.order_invoice.book_list.push({
        item_id: item.item_id,
        kitchen: item.kitchen,
        name: item.name,
        store: item.store,
        barcode: item.barcode,
        size: item.size,
        total_price: (item.price - item.discount.value),
        vendor: item.vendor,
        store: item.store,
        price: item.price,
        discount: item.discount,
        count: 1
      });
    };
    $scope.calc();
  };

  $scope.deleteItemsList = function (item) {
    $scope.error = '';

    if (item.count == 1) {
      $scope.order_invoice.book_list.splice($scope.order_invoice.book_list.indexOf(item), 1)

    } else if (item.count > 1) {
      item.count -= 1;
      item.total_price -= item.price;
      return item
    };
  };

  $scope.addTax = function () {
    if (!$scope.tax.value) {
      $scope.error = '##word.error_tax##';
      return;
    } else {
      $scope.order_invoice.taxes = $scope.order_invoice.taxes || [];
      if ($scope.tax.value) {
        $scope.order_invoice.taxes.push({
          name: $scope.tax.name,
          value: $scope.tax.value
        });
      };
      $scope.tax = {};
    };
  };

  $scope.deleteTax = function (_tx) {
    for (let i = 0; i < $scope.order_invoice.taxes.length; i++) {
      let tx = $scope.order_invoice.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value) {
        $scope.order_invoice.taxes.splice(i, 1);
      };
    };
  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {

      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.order_invoice.discountes = $scope.order_invoice.discountes || [];
      $scope.order_invoice.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
    };
  };

  $scope.deleteDiscount = function (_ds) {
    for (let i = 0; i < $scope.order_invoice.discountes.length; i++) {
      let ds = $scope.order_invoice.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type) {
        $scope.order_invoice.discountes.splice(i, 1);
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
          discount = size.discount.value * (size.cost * size.count) / 100;

        size.total_price = (site.toNumber(size.price) * site.toNumber(size.count)) - discount;
      }
      $scope.calc();
    }, 100);
  };


  $scope.calc = function () {

    $timeout(() => {
      $scope.order_invoice.total_value = 0;
      $scope.order_invoice.net_value = 0;
      $scope.order_invoice.total_tax = 0;
      $scope.order_invoice.total_discount = 0;

      if ($scope.order_invoice.book_list && $scope.order_invoice.book_list.length > 0) {
        $scope.order_invoice.book_list.forEach(itm => {
          $scope.order_invoice.total_value += site.toNumber(itm.total_price);
        });
      };

      if ($scope.order_invoice.taxes && $scope.order_invoice.taxes.length > 0) {
        $scope.order_invoice.taxes.forEach(tx => {
          $scope.order_invoice.total_tax += $scope.order_invoice.total_value * site.toNumber(tx.value) / 100;
        });
      };

      if ($scope.order_invoice.discountes && $scope.order_invoice.discountes.length > 0) {
        $scope.order_invoice.discountes.forEach(ds => {

          if (ds.type === "percent")
            $scope.order_invoice.total_discount += $scope.order_invoice.total_value * site.toNumber(ds.value) / 100;
          else
            $scope.order_invoice.total_discount += site.toNumber(ds.value);
        });
      };

      if ($scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 2) {
        $scope.order_invoice.service = 0;
        $scope.order_invoice.price_delivery_service = $scope.order_invoice.price_delivery_service || 0;
      };

      if ($scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 1) {
        $scope.order_invoice.service = $scope.order_invoice.service || 0;
        $scope.order_invoice.price_delivery_service = 0;
      };

      if ($scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 3) {
        $scope.order_invoice.service = 0;
        $scope.order_invoice.price_delivery_service = 0;
      };
      $scope.order_invoice.net_value = ($scope.order_invoice.total_value + ($scope.order_invoice.service || 0) + ($scope.order_invoice.total_tax || 0) + ($scope.order_invoice.price_delivery_service || 0)) - ($scope.order_invoice.total_discount || 0);
      $scope.discount = {
        type: 'number'
      };
    }, 250);

  };

  $scope.changeCustomerAddresses = function (customer) {

    $scope.order_invoice.gov = customer.gov;
    $scope.order_invoice.city = customer.city;
    $scope.order_invoice.area = customer.area;
    $scope.order_invoice.address = customer.address;
    $scope.order_invoice.customer_phone = customer.phone;
    $scope.order_invoice.customer_mobile = customer.mobile;
    $scope.order_invoice.customer_mobile = customer.mobile;
    $scope.order_invoice.transaction_type.id == 2 ? $scope.order_invoice.price_delivery_service = customer.area.price_delivery_service : 0;

  };

  $scope.showTable = function () {
    $scope.error = '';
    if (!$scope.openShift) {
      $scope.getTablesList(() => {
        $scope.getTablesGroupList();
        site.showModal('#showTablesModal');
      });
    } else $scope.error = '##word.open_shift_not_found##';
  };

  $scope.selectTable = function (table, group) {
    if (table.busy) {
      $scope.error = '##word.table_busy##';
      return;
    }
    $scope.error = '';
    if ($scope.order_invoice.table && $scope.order_invoice.table.id) {
      $scope.order_invoice.table.busy = false;
      $http({
        method: "POST",
        url: "/api/tables/update",
        data: $scope.order_invoice.table
      });
    }
    $scope.order_invoice.table = table;
    $scope.order_invoice.table.busy = true;
    $http({
      method: "POST",
      url: "/api/tables/update",
      data: $scope.order_invoice.table
    });
    $scope.order_invoice.table_group = group;
    site.hideModal('#showTablesModal');
    $scope.addOrderInvoice();
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#OrderInvoiceSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getOrderInvoiceList($scope.search);
    site.hideModal('#OrderInvoiceSearchModal');
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

  $scope.getOrderInvoiceList();
  $scope.loadItemsGroups();
  $scope.loadDiscountTypes();
  $scope.getTransactionTypeList();
  $scope.loadTaxTypes();
  $scope.getDeliveryEmployeesList();
  $scope.getOpenShiftList();
  $scope.getGovList();
  $scope.getTablesList();
  $scope.getPrintersPath();
  $scope.getPaymentMethodList();
  $scope.getDefaultSettingsList();
  $scope.getCustomerGroupList();
  $scope.loadKitchenList();
});