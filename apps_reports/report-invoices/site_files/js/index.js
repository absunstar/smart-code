app.controller('report_invoices', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_invoices = {};

  $scope.getTransactionTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.transactionTypeList = [];
    $http({
      method: 'POST',
      url: '/api/order_invoice/transaction_type/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.transactionTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getPaymentMethodList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.paymentMethodList = [];
    $http({
      method: 'POST',
      url: '/api/payment_method/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.paymentMethodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSourceType = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.sourceTypeList = [];
    $http({
      method: 'POST',
      url: '/api/source_type/all',
    }).then(
      function (response) {
        $scope.busy = false;
        if (site.feature('club')) $scope.sourceTypeList = response.data.filter((i) => i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('restaurant')) $scope.sourceTypeList = response.data.filter((i) => i.id != 4 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('pos') || site.feature('erp') || site.feature('ecommerce')) $scope.sourceTypeList = response.data.filter((i) => i.id != 4 && i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('academy')) $scope.sourceTypeList = response.data.filter((i) => i.id != 4 && i.id != 3);
        else $scope.sourceTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getReportInvoicesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    where = where || {};
    where.source_type = { id: site.toNumber('##query.type##') };

    $http({
      method: 'POST',
      url: '/api/report_invoices/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          $scope.remain_amount = response.data.remain_amount;
          $scope.net_value = response.data.net_value;
          $scope.total_tax = response.data.total_tax;
          $scope.total_discount = response.data.total_discount;
          $scope.total_value_added = response.data.total_value_added;
          $scope.cash = response.data.cash;
          $scope.bank = response.data.bank;
          $scope.remain_amount = site.toNumber($scope.remain_amount);
          $scope.net_value = site.toNumber($scope.net_value);
          $scope.total_value_added = site.toNumber($scope.total_value_added);
          $scope.total_tax = site.toNumber($scope.total_tax);
          $scope.total_discount = site.toNumber($scope.total_discount);

          $scope.paid_up = $scope.net_value - $scope.remain_amount;
          $scope.paid_up = site.toNumber($scope.paid_up);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.printAccountInvoive = function (_itemsList) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    let InvoiceDate = new Date();

    let ip = '127.0.0.1';
    let port = '60080';

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path) {
      ip = $scope.defaultSettings.printer_program.printer_path.ip_device || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.printer_path.Port_device || '60080';
    }

    let obj_print = { data: [] };

    if ($scope.defaultSettings.printer_program) {
      if ($scope.defaultSettings.printer_program.printer_path) obj_print.printer = $scope.defaultSettings.printer_program.printer_path.ip.name.trim();

      if ($scope.defaultSettings.printer_program.invoice_top_title) {
        obj_print.data.push({
          type: 'invoice-top-title',
          name: $scope.defaultSettings.printer_program.invoice_top_title,
        });
      } else {
        obj_print.data.push({
          type: 'invoice-top-title',
          name: 'Smart Code',
        });
      }

      if ($scope.defaultSettings.printer_program.invoice_logo) {
        obj_print.data.push({
          type: 'invoice-logo',
          url: document.location.origin + $scope.defaultSettings.printer_program.invoice_logo,
        });
      } else {
        obj_print.data.push({
          type: 'invoice-logo',
          url: 'http://127.0.0.1/images/logo.png',
        });
      }

      if ($scope.defaultSettings.printer_program.thermal_header && $scope.defaultSettings.printer_program.thermal_header.length > 0) {
        $scope.defaultSettings.printer_program.thermal_header.forEach((_ih) => {
          obj_print.data.push({
            type: 'header',
            value: _ih.name,
          });
        });
      }
    }

    obj_print.data.push(
      {
        type: 'title',
        value: 'Total  Accounts Invoices',
      },
      {
        type: 'space',
      },
      {
        type: 'text2',
        value: 'Date',
        value2: site.toDateXF(InvoiceDate),
      },
      {
        type: 'line',
      },
      {
        type: 'space',
      },
      {
        type: 'text2',
        value: 'Required',
        value2: $scope.net_value,
      },
      {
        type: 'space',
      },
      {
        type: 'text2',
        value: 'Paid Up',
        value2: $scope.paid_up,
      },
      {
        type: 'space',
      },
      {
        type: 'text2',
        value: 'Remain',
        value2: $scope.remain_amount,
      },
      {
        type: 'space',
      },
      {
        type: 'text2',
        value: 'Tax',
        value2: $scope.total_tax,
      },
      {
        type: 'space',
      },
      {
        type: 'text2',
        value: 'Discount',
        value2: $scope.total_discount,
      },
      {
        type: 'space',
      },
      {
        type: 'text2',
        value: 'Cash',
        value2: $scope.cash,
      },
      {
        type: 'space',
      },
      {
        type: 'text2',
        value: 'Bank',
        value2: $scope.bank,
      }
    );

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.thermal_footer && $scope.defaultSettings.printer_program.thermal_footer.length > 0) {
      $scope.defaultSettings.printer_program.thermal_footer.forEach((_if) => {
        obj_print.data.push({
          type: 'header',
          value: _if.name,
        });
      });
    }

    $http({
      method: 'POST',
      url: `http://${ip}:${port}/print`,
      data: obj_print,
    }).then(
      function (response) {
        if (response.data.done) $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getDefaultSettings = function () {
    $scope.error = '';
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

  $scope.getTargetAccountList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.targetAccountList = [];
    $http({
      method: 'POST',
      url: '/api/target_account/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.targetAccountList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getStudentsYearsList = function () {
    $http({
      method: 'POST',
      url: '/api/students_years/all',
      data: {
        select: {
          id: 1,
          name_Ar: 1,
          name_En: 1,
          code: 1,
          types_expenses_list: 1,
        },
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.studentsYearsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.displayDetails = function (patients_tickets, type) {
    $scope.busy = true;
    $scope.error = '';

    let where = {
      id: patients_tickets.invoice_id,
      customer: patients_tickets.customer,
    };

    $http({
      method: 'POST',
      url: '/api/patients_tickets/display_data',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.ticket_data = response.data.cb;

        if (type === 'view') {
          site.showModal('#displayDataModal');
        } else if (type === 'close') {
          $scope.patients_tickets = patients_tickets;
          $scope.displayAccountInvoice($scope.ticket_data);
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getCustomersList = function (ev) {
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/customers/all',
        data: {
          search: $scope.search_customer,
          where: {
            active: true,
          },
        },
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
      );
    }
  };

  $scope.loadVendors = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/vendors/all',
        data: {},
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.vendorsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.searchAll = function () {
    $scope._search = {};

    if ($scope.search && $scope.search.customer && $scope.search.customer.id) {
      $scope.customer = $scope.search.customer;
    }
    if ($scope.search && $scope.search.vendor && $scope.search.vendor.id) {
      $scope.vendor = $scope.search.vendor;
    }

    if ($scope.search && $scope.search.target_account && $scope.search.target_account.id) {
      $scope.target_account = $scope.search.target_account;
    }

    $scope.getReportInvoicesList($scope.search);
    site.hideModal('#reportInvoicesSearchModal');
    $scope.search = {};
  };

  $scope.getReportInvoicesList({ date: new Date() });
  if (site.feature('restaurant') || site.feature('pos') || site.feature('ecommerce') || site.feature('erp')) {
    $scope.getTransactionTypeList();
  }

  if (site.feature('school')) {
    $scope.getStudentsYearsList();
  }

  $scope.getPaymentMethodList();
  $scope.getDefaultSettings();
  $scope.getSourceType();
  $scope.getTargetAccountList();
});
