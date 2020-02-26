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
            _list.average_cost = (site.toNumber(_list.average_cost) || 0) / site.toNumber(_list.count);
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

    let ip = '127.0.0.1';
    let port = '11111';

    let InvoiceDate = new Date();

    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
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
        value: 'Total Sales Items'
      }, {
      type: 'space'
    }, {
      type: 'text2',
      value2: site.toDateXF(InvoiceDate),
      value: 'Date'
    }, {
      type: 'line'
    }, {
      type: 'text2',
      value2: $scope.count,
      value: 'Total Selling Count'
    }, {
      type: 'text2',
      value2: $scope.total,
      value: 'Total Selling Price'
    }, {
      type: 'space'
    }, {
      type: 'line'
    }, {
      type: 'space'
    }, {
      type: 'text3b',
      value: 'Item',
      value2: "Unit",
      value3: 'Count'
    }, {
      type: 'text3b',
      value: 'الصنف',
      value2: "الوحدة",
      value3: 'العدد'
    }, {
      type: 'space'
    });


    _itemsList.forEach(_item => {
      obj_print.data.push(
        { type: 'space' }, {
        type: 'text3',
        value: _item.size,
        value2: _item.unit.id,
        value3: _item.count
      }, { type: 'line' }, { type: 'space' });

    });

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_footer)
      obj_print.data.push({
        type: 'space'
      }, {
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


  $scope.loadUnits = function () {
    $scope.busy = true;
    $scope.unitsList = [];
    $http({
      method: "POST",
      url: "/api/units/all",
      data: {
        select: {
          id: 1,
          name: 1
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


  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getReportSalesList($scope.search);
    site.hideModal('#reportSalesSearchModal');
    $scope.search = {}
  };

  $scope.getReportSalesList();
  $scope.getDefaultSettings();
  $scope.loadUnits();
});