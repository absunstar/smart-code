app.controller("report_sales_total", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_sales_total = {};

  $scope.getReportSalesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/report_sales_total/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {
          $scope.count = response.data.doc.length;
          $scope.list = response.data.doc;


          $scope.average_cost = 0;
          $scope.count = 0;
          $scope.total = 0;
          $scope.list.forEach(_list => {
            _list.average_cost = site.toNumber(_list.average_cost);
            $scope.average_cost += site.toNumber(_list.average_cost);
            $scope.count += _list.count;
            $scope.total += _list.total;

          });

          $scope.average_cost = site.toNumber($scope.average_cost);
          $scope.count = site.toNumber($scope.count);
          $scope.total = site.toNumber($scope.total);
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
      obj_print.printer = $scope.defaultSettings.printer_program.printer_path.ip.name.trim();

    if ($scope.defaultSettings.printer_program.invoice_header && $scope.defaultSettings.printer_program.invoice_header.length > 0) {
      $scope.defaultSettings.printer_program.invoice_header.forEach(_ih => {
        obj_print.data.push({
          type: 'header',
          value: _ih.name
        });
      });

    }

    obj_print.data.push(
      {
        type: 'title',
        value: 'Total Sales Items'
      }, {
      type: 'space'
    }, {
      type: 'text2',
      value: 'Date',
      value2: site.toDateXF(InvoiceDate)
    }, {
      type: 'line'
    }, {
      type: 'text2',
      value: 'Total Selling Count',
      value2: $scope.count
    }, {
      type: 'text2',
      value: 'Total Selling Price',
      value2: $scope.total
    }, {
      type: 'line'
    }, {
      type: 'text3b',
      value: 'Item',
      value2: " Total Price",
      value3: 'Count'
    }, {
      type: 'text3b',
      value: 'الصنف',
      value2: "إجمالي السعر",
      value3: 'العدد'
    }, {
      type: 'space'
    });


    _itemsList.forEach(_item => {
      _item.total = site.toNumber(_item.total);

      obj_print.data.push(
        {
          type: 'text3',
          value: _item.size_ar,
          value2: _item.total,
          value3: _item.count
        }, { type: 'line' });

    });

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_footer && $scope.defaultSettings.printer_program.invoice_footer.length > 0) {
      $scope.defaultSettings.printer_program.invoice_footer.forEach(_if => {
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


  $scope.loadUnits = function () {
    $scope.busy = true;
    $scope.unitsList = [];
    $http({
      method: "POST",
      url: "/api/units/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.unitsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
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

  $scope.loadItemsGroups = function () {
    $scope.busy = true;
    $scope.itemsGroupList = [];
    $http({
      method: "POST",
      url: "/api/items_group/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
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


  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getReportSalesList($scope.search);
    site.hideModal('#reportSalesSearchModal');
    $scope.search = {}
  };

  $scope.getReportSalesList();
  $scope.getDefaultSettings();
  $scope.loadItemsGroups();
  $scope.loadUnits();
});