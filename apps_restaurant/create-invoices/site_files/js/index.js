app.controller("create_invoices", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.create_invoices = {};

  $scope.displayaddCreateInvoice = function () {
    $scope.get_open_shift((shift) => {
      if (shift) {
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
              $scope._search = {};
              $scope.search_order = "";
              $scope.error = '';
              $scope.orderInvoicesTypeList = [];

              $scope.create_invoices = {
                image_url: '/images/create_invoices.png',
                date: new Date(),
                shift: shift,
                active: true,
              };

              if ($scope.defaultSettings.general_Settings) {

                if ($scope.defaultSettings.general_Settings.payment_method)
                  $scope.create_invoices.payment_method = $scope.defaultSettings.general_Settings.payment_method;

                if ($scope.defaultSettings.accounting) {
                  if ($scope.defaultSettings.accounting.safe)
                    $scope.create_invoices.safe = $scope.defaultSettings.accounting.safe;
                  if ($scope.defaultSettings.accounting.source_type)
                    $scope.create_invoices.source_type = $scope.defaultSettings.accounting.source_type;

                }

                if ($scope.defaultSettings.general_Settings.order_type && $scope.create_invoices.source_type.id == 3)
                  $scope.create_invoices.order_invoices_type = $scope.defaultSettings.general_Settings.order_type;
              }

              site.showModal('#creatInvoicesAddModal');

            };
          },
          function (err) {
            $scope.busy = false;
            $scope.error = err;
          }
        )
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addCreateInvoice = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;
    const v = site.validated('#creatInvoicesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    } else if ($scope.create_invoices.paid_up > 0 && !$scope.create_invoices.safe) {
      $scope.error = "##word.should_select_safe##";
      return;
    } else if ($scope.create_invoices.total_tax > $scope.total_tax) {
      $scope.error = "##word.err_total_tax##";
      return;
    } else if ($scope.create_invoices.total_discount > $scope.total_discount) {
      $scope.error = "##word.err_total_discount##";
      return;
    } else if ($scope.create_invoices.price_delivery_service > $scope.price_delivery_service) {
      $scope.error = "##word.err_price_delivery_service##";
      return;
    } else if ($scope.create_invoices.service > $scope.service) {
      $scope.error = "##word.err_service##";
      return;
    } else if ($scope.create_invoices.paid_up > $scope.create_invoices.net_value) {
      $scope.error = "##word.err_net_value##";
      return;
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
          site.hideModal('#creatInvoicesAddModal');
          $scope.getCreatInvoicesList();
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

  $scope.displayUpdateCreatInvoices = function (create_invoices) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsCreatInvoices(create_invoices);
    $scope.create_invoices = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#creatInvoicesUpdateModal');
  };

  $scope.updateCreatInvoices = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#creatInvoicesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $http({
      method: "POST",
      url: "/api/create_invoices/update",
      data: $scope.create_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#creatInvoicesUpdateModal');
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
    )
  };

  $scope.displayDetailsCreatInvoices = function (create_invoices) {
    $scope.error = '';
    $scope.detailsCreatInvoices(create_invoices);
    $scope.create_invoices = {};
    site.showModal('#creatInvoicesDetailsModal');
  };

  $scope.detailsCreatInvoices = function (create_invoices) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_invoices/view",
      data: {
        id: create_invoices.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.create_invoices = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCreatInvoices = function (create_invoices) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.detailsCreatInvoices(create_invoices);
        $scope.create_invoices = {};
        site.showModal('#creatInvoicesDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteCreatInvoices = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_invoices/delete",
      data: {
        id: $scope.create_invoices.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#creatInvoicesDeleteModal');
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
    )
  };

  $scope.getCreatInvoicesList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;

    $http({
      method: "POST",
      url: "/api/create_invoices/all",
      data: {
        where: where
      }
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
    )
  };

  $scope.paymentInvoice = function () {
    $scope.error = '';
    if (!$scope.create_invoices.payment_safe.id) {
      $scope.error = "##word.should_select_safe##";
      return;
    };
    if (!$scope.create_invoices.payment_paid_up) {
      $scope.error = "##word.err_paid_up##";
      return;
    };
    if ($scope.create_invoices.payment_paid_up > $scope.create_invoices.remain_amount) {
      $scope.error = "##word.err_paid_up_payment##";
      return;
    };
    $scope.create_invoices.payment_list = $scope.create_invoices.payment_list || [];
    $scope.create_invoices.remain_amount = $scope.create_invoices.remain_amount - $scope.create_invoices.payment_paid_up;
    $scope.create_invoices.payment_list.push({
      paid_up: $scope.create_invoices.payment_paid_up,
      safe: $scope.create_invoices.payment_safe,
      date: $scope.create_invoices.payment_date,
    });
  };

  $scope.acceptPaymentInvoice = function () {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_invoices/update",
      data: $scope.create_invoices
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {

          $scope.getCreatInvoicesList();
          site.hideModal('#invoicesPaymentModal');
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.loadOrderInvoicesType = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    $scope.orderInvoicesTypeList = [];
    if ($scope.create_invoices.source_type.id == 3 && !$scope.create_invoices.order_invoices_type) {
      $scope.error = "##word.err_order_type##";
      return;
    } else if (ev.which === 13) {

      let where = {};
      let url = "/api/stores_in/all";

      if ($scope.create_invoices.source_type) {

        if ($scope.create_invoices.source_type.id == 1) {
          url = "/api/stores_in/all";
          where = { 'type.id': 1, invoice: false || undefined };
        }

        else if ($scope.create_invoices.source_type.id == 2) {
          url = "/api/stores_out/all";
          where = { 'type.id': { $ne: 4 }, invoice: false || undefined };
        }

        else if ($scope.create_invoices.source_type.id == 3)
          url = "/api/order_invoice/invoices";
      }

      $http({
        method: "POST",
        url: url,
        data: {
          search: $scope.search_order,
          order_invoices_type: $scope.create_invoices.order_invoices_type,
          where: where
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.orderInvoicesTypeList = response.data.list;

          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.selectOrderInvoices = function (item) {
    $scope.error = '';
    $scope.create_invoices.current_book_list = [];
    $scope.create_invoices.customer = item.customer;
    $scope.create_invoices.delivery_employee = item.delivery_employee;
    $scope.create_invoices.table = item.table;
    if (item.under_paid) {
      $scope.create_invoices.total_tax = item.under_paid.total_tax;
      $scope.create_invoices.total_discount = item.under_paid.total_discount;
      $scope.create_invoices.price_delivery_service = item.under_paid.price_delivery_service;
      $scope.create_invoices.service = item.under_paid.service;
      $scope.create_invoices.net_value = item.under_paid.net_value;
    } else {

      $scope.create_invoices.total_tax = item.total_tax;
      $scope.create_invoices.total_discount = item.total_discount;
      $scope.create_invoices.net_value = item.net_value;
    }
    $scope.create_invoices.invoice_id = item.id;
    $scope.create_invoices.paid_up = 0;
    $scope.total_tax = $scope.create_invoices.total_tax;
    $scope.total_discount = $scope.create_invoices.total_discount;
    $scope.price_delivery_service = $scope.create_invoices.price_delivery_service;
    $scope.service = $scope.create_invoices.service;

    if ($scope.create_invoices.source_type && $scope.create_invoices.source_type.id == 3) {

      item.under_paid.book_list.forEach(_item => {
        if (_item.count > 0) {
          $scope.create_invoices.current_book_list.push(_item);
        }
      });

    } else $scope.create_invoices.current_book_list = item.items;

    $scope.orderInvoicesTypeList = [];
  };

  $scope.displayPaymentInvoices = function (invoices) {
    $scope.error = '';

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.create_invoices = invoices;
        $scope.create_invoices.payment_date = new Date();
        $scope.create_invoices.payment_paid_up = 0;
        $scope.create_invoices.payment_safe = $scope.defaultSettings.accounting ? $scope.defaultSettings.accounting.safe : null;
        site.showModal('#invoicesPaymentModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.calc = function () {
    $scope.error = '';
    $timeout(() => {
      let total_price_item = 0;
      $scope.create_invoices.current_book_list.forEach(item => {

        total_price_item += item.total_price;
      });
      $scope.create_invoices.net_value = total_price_item + ($scope.create_invoices.service || 0) + ($scope.create_invoices.price_delivery_service || 0) + ($scope.create_invoices.total_tax || 0) - ($scope.create_invoices.total_discount || 0)
    }, 250);
  };
  $scope.deleteItemsList = function (item) {
    $scope.error = '';

    if (item.count == 1) {
      $scope.create_invoices.current_book_list.splice($scope.create_invoices.current_book_list.indexOf(item), 1)

    } else if (item.count > 1) {
      item.count -= 1;
      item.total_price -= item.price;
      return item
    }
    item.total_price = item.count * item.price;
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

  $scope.getSourceType = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.sourceTypeList = [];
    $http({
      method: "POST",
      url: "/api/source_type/all"
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.sourceTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSafesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          type: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.safesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getCreatInvoicesList($scope.search);
    site.hideModal('#creatInvoicesSearchModal');
    $scope.search = {}

  };

  $scope.printCreateInvoive = function () {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

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
          value: 'Item',
          value2: 'Count',
          value3: 'Price'
        },
        {
          type: 'text3b',
          value: 'الصنف',
          value2: 'العدد',
          value3: 'السعر'
        }, {
        type: 'space'
      }
      );

      $scope.create_invoices.current_book_list.forEach(_current_book_list => {
        obj_print.data.push({
          type: 'text3',
          value: _current_book_list.size,
          value2: _current_book_list.count,
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
          type: 'text2',
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
        type: 'text2b',
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

  $scope.getOrderTypeSetting = function () {
    $scope.create_invoices.order_invoices_type = {};
    if ($scope.defaultSettings.general_Settings.order_type && $scope.create_invoices.source_type.id == 3)
      $scope.create_invoices.order_invoices_type = $scope.defaultSettings.general_Settings.order_type;
  };

  $scope.getDefaultSetting = function () {

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
        };
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

  $scope.getDefaultSetting();
  $scope.getCreatInvoicesList({ date: new Date() });
  $scope.getSourceType();
  $scope.getTransactionTypeList();
  $scope.getSafesList();
  $scope.getPaymentMethodList();
});