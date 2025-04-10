app.controller("report_daily", function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.search = { date: new Date() };

  $scope.report_daily = {};

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
        if (site.feature('club')) $scope.sourceTypeList = response.data.filter(i => i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('restaurant')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('pos') || site.feature('erp') || site.feature('ecommerce')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('academy')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 3);
        else $scope.sourceTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAccInvoList = function (currency) {
    $scope.busy = true;
    $scope.accInvoList = [];
    let where = $scope.search || {};
    where.currency = currency;
    $http({
      method: "POST",
      url: "/api/report_daily/acc_invo",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.accInvoList = response.data.list;

          if (!site.feature('academy')) $scope.accInvoList.splice(4, 3);
          if (!site.feature('club')) $scope.accInvoList.splice(3, 1);
          if ( !site.feature('erp') &&!site.feature('ecommerce') &&!site.feature('pos') && !site.feature('restaurant') && !site.feature('erp')) $scope.accInvoList.splice(2, 1);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getStoreInvoList = function (where) {
    $scope.busy = true;
    $scope.storeInvoList = [];
    $http({
      method: "POST",
      url: "/api/report_daily/store_invo",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.storeInvoList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPersonnelList = function (where) {
    $scope.busy = true;
    $scope.personnelList = [];
    $http({
      method: "POST",
      url: "/api/report_daily/personnel",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.personnelList = response.data.list;
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

    obj_print.data.push(
      {
        type: 'title',
        value: 'Total Accounts Daily'
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
    });

    $scope.accInvoList.forEach(_l => {
      obj_print.data.push({
        type: 'text2',
        value2: _l.paid_up,
        value: '##session.lang##' == 'Ar' ? _l.source_type.Ar : _l.source_type.En
      });
    });

    obj_print.data.push({ type: 'space' });

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.thermal_footer && $scope.defaultSettings.printer_program.thermal_footer.length > 0) {
      $scope.defaultSettings.printer_program.thermal_footer.forEach(_if => {
        obj_print.data.push({
          type: 'header',
          value: _if.name
        });
      });

    };

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

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          minor_currency_Ar: 1, minor_currency_en: 1,
          ex_rate: 1,
          code : 1
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

  $scope.viewPatchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;
    site.showModal('#patchesListViewModal');

  };

  $scope.showAccInvoDetails = function (c) {
    $scope.accInvoDetails = c;
    site.showModal('#accInvoDetailsModal');
  };
  $scope.showStoreInvoDetails = function (c) {
    $scope.storeInvoDetails = c;
    site.showModal('#storeInvoDetailsModal');
  };

  $scope.showPersonnelDetails = function (c) {
    $scope.personnelDetails = c;
    site.showModal('#personnelDetailsModal');
  };


  $scope.showStoreView = function (c) {
    $scope.storeView = c;
    $scope.storeView.net_txt = site.stringfiy($scope.storeView.net_value);
    site.showModal('#storeViewModal');
  };



  $scope.inventoryTransactions = function () {

    $scope.getStoreInvoList($scope.search);
    site.showTabContent(event, '#inventory_transactions')
  };

  $scope.personnel = function () {

    $scope.getPersonnelList($scope.search);
    site.showTabContent(event, '#personnel')
  };


  $scope.searchAll = function () {

    $scope.error = '';
    $scope._search = {};

    site.hideModal('#reportDailySearchModal');
  };

  $scope.showSearchAll = function () {

    $scope.error = '';
    $scope.search = {};

    site.showModal('#reportDailySearchModal');
  };


  $scope.getPaymentMethodList();
  $scope.loadCurrencies();
  $scope.getDefaultSettings();
  $scope.getSourceType();

});