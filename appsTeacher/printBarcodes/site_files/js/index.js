app.controller("printBarcodes", function ($scope, $http, $timeout) {
  $scope.setting = site.showObject(`##data.#setting##`);
  $scope.invoiceLogo = document.location.origin + $scope.setting?.barcodeCard?.url;
  console.log($scope.invoiceLogo);

  $scope.baseURL = "";
  $scope.appName = "printBarcodes";
  $scope.modalID = "#codesManageModal";
  $scope.modalSearchID = "#codesSearchModal";
  $scope.mode = "add";
  $scope._search = {};
  $scope.structure = {
    expired: false,
    price: 0,
  };
  $scope.generate = {
    count: 0,
    price: 0,
  };
  $scope.distribution = {
    from: 0,
    to: 0,
  };
  $scope.item = {};
  $scope.list = [];

  $scope.barCodesGenerate = function () {
    if ($scope.busy) return;
    $scope.busy = true;

    $("#printBarcodes").removeClass("hidden");

    $scope.barcodeList = [];
    for (var i = $scope.print.from; i <= $scope.print.to; i++) {
      $scope.barcodeList.push(i);
    }

    $timeout(() => {
      for (var i = $scope.print.from; i <= $scope.print.to; i++) {
        JsBarcode("#barcode_" + i, i, {
          format: "CODE128",
          displayValue: true,
          textMargin: 0,
          height: 20,
          fontSize: 17,
          fontOptions: "bold",
        });
      }
      $scope.busy = false;
    }, 1000 * 2);
  };

  $scope.barCodesPrint = function () {
    if ($scope.busy) return;
    $scope.busy = true;

    $timeout(() => {
      site.print({
        selector: "#printBarcodes",
        ip: "127.0.0.1",
        port: "60080",
        pageSize: "A4",
        printer: "Microsoft Print to PDF",
        dpi: { horizontal: 200, vertical: 640 },
      });
    }, 500);
    $timeout(() => {
      $scope.busy = false;
      $("#printBarcodes").addClass("hidden");
    }, 8000);
  };
});
