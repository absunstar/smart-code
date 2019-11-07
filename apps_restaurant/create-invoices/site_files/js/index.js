app.controller("create_invoices", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.create_invoices = {};

  $scope.displayAddCreatInvoices = function () {

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
            source_type: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.source_type : null,
            payment_method: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.payment_method : null,
            safe: $scope.defaultSettings.accounting ? $scope.defaultSettings.accounting.safe : null,
            image_url: '/images/create_invoices.png',
            date: new Date(),
            active: true,

          };
          site.showModal('#creatInvoicesAddModal');

        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.addCreatInvoices = function () {
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
    $scope.detailsCreatInvoices(create_invoices);
    $scope.create_invoices = {};
    site.showModal('#creatInvoicesDeleteModal');
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
    if (!$scope.current.payment_safe.id) {
      $scope.error = "##word.should_select_safe##";
      return;
    };
    if (!$scope.current.payment_paid_up) {
      $scope.error = "##word.err_paid_up##";
      return;
    };
    if ($scope.current.payment_paid_up > $scope.current.remain_amount) {
      $scope.error = "##word.err_paid_up_payment##";
      return;
    };
    $scope.current.payment_list = $scope.current.payment_list || [];
    $scope.current.remain_amount = $scope.current.remain_amount - $scope.current.payment_paid_up;
    $scope.current.payment_list.push({
      paid_up: $scope.current.payment_paid_up,
      safe: $scope.current.payment_safe,
      date: $scope.current.payment_date,
    });
  };

  $scope.acceptPaymentInvoice = function () {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_invoices/update",
      data: $scope.current
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
    if (!$scope.create_invoices.order_invoices_type) {
      $scope.error = "##word.err_order_type##";
      return;
    } else if (ev.which === 13) {

      $http({
        method: "POST",
        url: "/api/order_invoice/invoices",
        data: {
          search: $scope.search_order
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
    $scope.create_invoices.total_tax = item.under_paid.total_tax;
    $scope.create_invoices.total_discount = item.under_paid.total_discount;
    $scope.create_invoices.price_delivery_service = item.under_paid.price_delivery_service;
    $scope.create_invoices.service = item.under_paid.service;
    $scope.create_invoices.net_value = item.under_paid.net_value;
    $scope.create_invoices.paid_up = 0;
    $scope.create_invoices.order_invoices_id = item.under_paid.order_invoice_id;

    item.under_paid.book_list.forEach(item => {
      if (item.count > 0) {
        $scope.create_invoices.current_book_list.push(item);
      }
    });

    $scope.total_tax = $scope.create_invoices.total_tax;
    $scope.total_discount = $scope.create_invoices.total_discount;
    $scope.price_delivery_service = $scope.create_invoices.price_delivery_service;
    $scope.service = $scope.create_invoices.service;
    $scope.orderInvoicesTypeList = [];
  };

  $scope.displayPaymentInvoices = function (invoices) {
    $scope.error = '';
    $scope.current = invoices;
    $scope.current.payment_date = new Date();
    $scope.current.payment_paid_up = 0;
    $scope.current.payment_safe = $scope.defaultSettings.accounting ? $scope.defaultSettings.accounting.safe : null;
    site.showModal('#invoicesPaymentModal');
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
      data: {}
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


  $scope.printInvoiceCreat = function () {
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

    let obj_print = {

      printer: $scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path ? $scope.defaultSettings.printer_program.printer_path.ip.trim() : '',
      data: [
        {
          type: 'text',
          value: $scope.defaultSettings.printer_program ? $scope.defaultSettings.printer_program.invoice_header : ''
        },
        {
          type: 'line'
        },
        {
          type: 'text',
          value: 'Date' + ' : ' + new Date($scope.create_invoices.date).toString()
        },
        {
          type: 'text',
          value: 'Invoice Service'
        },
        {
          type: 'text',
          value: $scope.create_invoices.customer ? 'Customer' + ' : ' + $scope.create_invoices.customer.name_ar : ''
        },
        {
          type: 'text',
          value: $scope.create_invoices.table ? 'Table' + ' : ' + ($scope.create_invoices.table.tables_group.name + ' - ' + $scope.create_invoices.table.name) : ''
        },
        {
          type: 'line'
        }

      ]
    };

    if ($scope.create_invoices.current_book_list && $scope.create_invoices.current_book_list.length > 0) {
      $scope.create_invoices.current_book_list.forEach(_current_book_list => {
        obj_print.data.push({
          type: 'text',
          value: _current_book_list.count + ' - ' + _current_book_list.name + ' - ' + _current_book_list.size
        })
      });
    };

    obj_print.data.push(
      {
        type: 'line'
      },
      {
        type: 'text',
        value: 'paid Require' + ' : ' + ($scope.create_invoices.net_value || 0)
      },
      {
        type: 'text',
        value: 'Current Paid Up' + ' : ' + ($scope.create_invoices.paid_up || 0)
      },
      {
        type: 'text',
        value: 'Total Remain' + ' : ' + ($scope.create_invoices.total_remain || 0)
      },
      {
        type: 'line'
      },
      {
        type: 'text',
        value: $scope.defaultSettings.printer_program ? $scope.defaultSettings.printer_program.invoice_footer : ''
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

  $scope.printInvoicePay = function () {
    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    }

    let obj_print = {

      printer: $scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path ? $scope.defaultSettings.printer_program.printer_path.ip.trim() : '',
      data: [
        {
          type: 'text',
          value: $scope.defaultSettings.printer_program ? $scope.defaultSettings.printer_program.invoice_header : ''
        },
        {
          type: 'line'
        },
        {
          type: 'text',
          value: 'Date' + ' : ' + new Date($scope.current.payment_date).toString()
        },
        {
          type: 'text',
          value: 'Invoice Service' + ' ' + $scope.current.code
        },
        {
          type: 'text',
          value: $scope.current.customer ? 'Customer' + ' : ' + $scope.current.customer.name_ar : ''
        },
        {
          type: 'text',
          value: $scope.current.table ? 'Table' + ' : ' + ($scope.current.table.tables_group.name + ' - ' + $scope.current.table.name) : ''
        },
        {
          type: 'line'
        }

      ]
    };

    if ($scope.current.current_book_list && $scope.current.current_book_list.length > 0) {
      $scope.current.current_book_list.forEach(_current_book_list => {
        obj_print.data.push({
          type: 'text',
          value: _current_book_list.count + ' - ' + _current_book_list.name + ' - ' + _current_book_list.size
        })
      });
    };

    $scope.current.total_paid_up = $scope.current.total_paid_up + $scope.current.payment_paid_up;
    $scope.current.total_remain = $scope.current.total_remain - $scope.current.payment_paid_up;
    obj_print.data.push(
      {
        type: 'line'
      },
      {
        type: 'text',
        value: 'paid Require' + ' : ' + ($scope.current.net_value || 0)
      },
      {
        type: 'text',
        value: 'Current Paid Up' + ' : ' + ($scope.current.payment_paid_up || 0)
      },
      {
        type: 'text',
        value: 'Total Paid Up' + ' : ' + ($scope.current.total_paid_up || 0)
      },
      {
        type: 'text',
        value: 'Total Remain' + ' : ' + ($scope.current.total_remain || 0)
      },
      {
        type: 'line'
      },
      {
        type: 'text',
        value: $scope.defaultSettings.printer_program ? $scope.defaultSettings.printer_program.invoice_footer : ''
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

  $scope.getDefaultSetting();
  $scope.getCreatInvoicesList();
  $scope.getSourceType();
  $scope.getTransactionTypeList();
  $scope.getSafesList();
  $scope.getPaymentMethodList();
});