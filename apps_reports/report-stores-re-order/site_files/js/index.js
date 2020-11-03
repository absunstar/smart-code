app.controller("report_stores_re_order", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_stores_re_order = {};

  $scope.getReportStoreReOrderList = function (where) {
    $scope.busy = true;
    $scope.list = [];

    $http({
      method: "POST",
      url: "/api/report_stores_re_order/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done && response.data.doc) {
          $scope.count = response.data.doc.length;
          $scope.list = response.data.doc;

          $scope.total_average_cost = site.toNumber($scope.total_average_cost)
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
        value: 'Total StoreReOrder Items'
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
          value: _item.size,
          value2: _item.total,
          value3: _item.count
        }, { type: 'line' });

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

  $scope.loadItemsGroups = function () {
    $scope.busy = true;
    $scope.itemsGroupList = [];
    $http({
      method: "POST",
      url: "/api/items_group/all",
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
          $scope.itemsGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadBranches = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/branches/all"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.branchesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStores = function (branch) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: {
        select: { id: 1, name: 1, type: 1 },
        branchTo: branch
      }

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.storesList = response.data.list;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
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
          name: 1,
          barcode: 1
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

  $scope.searchAll = function () {

    const v = site.validated('#reportStoreReOrderSearchModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope._search = {};
    $scope.getReportStoreReOrderList($scope.search);
    site.hideModal('#reportStoreReOrderSearchModal');
    $scope.search = {
      unit: $scope.search.unit
    }
  };

  $scope.showSearchAll = function () {
    $scope.search = {};
    site.showModal('#reportStoreReOrderSearchModal');
  };




  $scope.getDefaultSettings();
  $scope.loadBranches();
  $scope.loadUnits();
  $scope.loadItemsGroups();
  $scope.loadUnits();
});