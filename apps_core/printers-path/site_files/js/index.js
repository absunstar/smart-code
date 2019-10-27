app.controller("printers_path", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.printer_path = {};

  $scope.displayAddPrinterPath = function () {
    $scope.error = '';
    $scope.printer_path = {
      image_url: '/images/printer_path.png',
      active: true
    };
    site.showModal('#printerPathAddModal');
  };

  $scope.addPrinterPath = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    const v = site.validated('#printerPathAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/printers_path/add",
      data: $scope.printer_path
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#printerPathAddModal');
          $scope.list.push(response.data.doc);
          $scope.count += 1;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdatePrinterPath = function (printer_path) {
    $scope.error = '';
    $scope.detailsPrinterPath(printer_path);
    $scope.printer_path = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#printerPathUpdateModal');
  };

  $scope.updatePrinterPath = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#printerPathUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/printers_path/update",
      data: $scope.printer_path
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#printerPathUpdateModal');
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

  $scope.displayDetailsPrinterPath = function (printer_path) {
    $scope.error = '';
    $scope.detailsPrinterPath(printer_path);
    $scope.printer_path = {};
    site.showModal('#printerPathDetailsModal');
  };

  $scope.detailsPrinterPath = function (printer_path) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/printers_path/view",
      data: {
        id: printer_path.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.printer_path = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeletePrinterPath = function (printer_path) {
    $scope.error = '';
    $scope.detailsPrinterPath(printer_path);
    $scope.printer_path = {};
    site.showModal('#printerPathDeleteModal');
  };

  $scope.deletePrinterPath = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/printers_path/delete",
      data: {
        id: $scope.printer_path.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#printerPathDeleteModal');
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

  $scope.getPrinterPathList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/printers_path/all",
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

  $scope.getPrinterTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.printerTypeList = [];
    $http({
      method: "POST",
      url: "/api/printer_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.printerTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope.getPrinterPathList($scope.search);
    site.hideModal('#printerPathSearchModal');
    $scope.search = {}

  };

  $scope.getPrinterPathList();
  $scope.getPrinterTypeList();
});