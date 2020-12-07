app.controller("report_safes", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_safes = {};

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
        if (site.feature('gym')) $scope.sourceTypeList = response.data.filter(i => i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('restaurant')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('pos') || site.feature('erp')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('academy')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 3);
        else $scope.sourceTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getReportInvoicesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_safes/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;



          $scope.total_incoming = 0;
          $scope.total_outgoing = 0;

          $scope.total_incoming_comm = 0;
          $scope.total_outgoing_comm = 0;

          $scope.list.forEach(_invoice => {
            if (_invoice.source_type) {

              if (_invoice.source_type.id == 1) {
                if (_invoice.invoice_type && _invoice.invoice_type.id != 4) {
                  $scope.total_outgoing += _invoice.paid;
                  $scope.total_outgoing_comm += _invoice.commission;

                } else if (_invoice.invoice_type && _invoice.invoice_type.id == 4) {
                  $scope.total_incoming += _invoice.paid;
                  $scope.total_incoming_comm += _invoice.commission;
                }

              } else if (_invoice.source_type.id == 2) {

                if (_invoice.invoice_type && _invoice.invoice_type.id != 6) {
                  $scope.total_incoming += _invoice.paid;
                  $scope.total_incoming_comm += _invoice.commission;
                } else if (_invoice.invoice_type && _invoice.invoice_type.id == 6) {
                  $scope.total_outgoing += _invoice.paid;
                  $scope.total_outgoing_comm += _invoice.commission;
                }

              } else if (_invoice.source_type.id == 3) {
                $scope.total_incoming += _invoice.paid;
                $scope.total_incoming_comm += _invoice.commission;

              } else if (_invoice.source_type.id == 4) {
                $scope.total_incoming += _invoice.paid;
                $scope.total_incoming_comm += _invoice.commission;

              } else if (_invoice.source_type.id == 5) {
                $scope.total_incoming += _invoice.paid;
                $scope.total_incoming_comm += _invoice.commission;

              } else if (_invoice.source_type.id == 6) {
                $scope.total_outgoing += _invoice.paid;
                $scope.total_outgoing_comm += _invoice.commission;

              } else if (_invoice.source_type.id == 7) {
                $scope.total_incoming += _invoice.paid;
                $scope.total_incoming_comm += _invoice.commission;

              } else if (_invoice.source_type.id == 8) {
                $scope.total_incoming += _invoice.paid;
                $scope.total_incoming_comm += _invoice.commission;

              } else if (_invoice.source_type.id == 9) {
                $scope.total_outgoing += _invoice.paid;
                $scope.total_outgoing_comm += _invoice.commission;

              } else if (_invoice.source_type.id == 10) {
                $scope.total_incoming += _invoice.paid;
                $scope.total_incoming_comm += _invoice.commission;

              } else if (_invoice.source_type.id == 11) {
                $scope.total_outgoing += _invoice.paid;
                $scope.total_outgoing_comm += _invoice.commission;

              } else if (_invoice.source_type.id == 12) {
                $scope.total_incoming += _invoice.paid;
                $scope.total_incoming_comm += _invoice.commission;


              }
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
    };


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
        value: 'Total  Accounts Invoices'
      }, {
      type: 'space'
    }, {
      type: 'text2',
      value: 'Date',
      value2: site.toDateXF(InvoiceDate)
    }, {
      type: 'line'
    }, {
      type: 'space'
    }, {
      type: 'text2',
      value: 'Required',
      value2: $scope.net_value
    }, {
      type: 'space'
    }, {
      type: 'text2',
      value: 'Paid Up',
      value2: $scope.paid_up
    }, {
      type: 'space'
    }, {
      type: 'text2',
      value: 'Remain',
      value2: $scope.remain_amount
    }, {
      type: 'space'
    }, {
      type: 'text2',
      value: 'Tax',
      value2: $scope.total_tax
    }, {
      type: 'space'
    }, {
      type: 'text2',
      value: 'Discount',
      value2: $scope.total_discount
    }, {
      type: 'space'
    }, {
      type: 'text2',
      value: 'Cash',
      value2: $scope.cash
    }, {
      type: 'space'
    }, {
      type: 'text2',
      value: 'Bank',
      value2: $scope.bank
    });


    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_footer) {

      obj_print.data.push({
        type: 'space'
      }, {
        type: 'footer',
        value: $scope.defaultSettings.printer_program.invoice_footer
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

  $scope.getDefaultSettings = function () {
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

        };
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
    $scope.getReportInvoicesList($scope.search);
    site.hideModal('#reportSafesSearchModal');
    $scope.search = { safe: $scope.search.safe }
  };




  $scope.getPaymentMethodList();
  $scope.getSafesList();
  $scope.getDefaultSettings();
  $scope.getSourceType();

  if (site.feature('restaurant') || site.feature('pos') || site.feature('erp'))
    $scope.getTransactionTypeList();


});