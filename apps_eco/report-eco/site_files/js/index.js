app.controller("report_eco", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_eco = {};

  $scope.displayUpdateOrderEco = function (report_eco) {
    $scope._search = {};

    $scope.error = "";
    $scope.detailsOrderEco(report_eco);
    $scope.report_eco = {};
    site.showModal("#reportEcoUpdateModal");
  };

  $scope.updateOrderEco = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    const v = site.validated("#reportEcoUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.report_eco.subjects_list.length < 1) {
      $scope.error = "##word.err_subject_list##";
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order_eco/update",
      data: $scope.report_eco,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#reportEcoUpdateModal");
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
    );
  };

  $scope.displayDetailsOrderEco = function (report_eco) {
    $scope.error = "";
    $scope.detailsOrderEco(report_eco);
    $scope.report_eco = {};
    site.showModal("#reportEcoDetailsModal");
  };

  $scope.detailsOrderEco = function (report_eco) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/view",
      data: {
        id: report_eco.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.report_eco = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteOrderEco = function (report_eco) {
    $scope.error = "";
    $scope.detailsOrderEco(report_eco);
    $scope.report_eco = {};
    site.showModal("#reportEcoDeleteModal");
  };

  $scope.deleteOrderEco = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/delete",
      data: {
        id: $scope.report_eco.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#reportEcoDeleteModal");
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
    );
  };

  $scope.getOrderEcoList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/order_eco/all",
      data: {
        where: where,
      },
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
    );
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getOrderEcoList($scope.search);
    site.hideModal("#reportEcoSearchModal");
    $scope.search = {};
  };

  $scope.getOrderEcoList();
});
