app.controller("scans", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.scans = {};

  $scope.displayAddScans = function () {
    $scope.error = "";
    $scope.scans = {
      image_url: "/images/scans.png",
      active: true,
      price: 0,
      immediate: false,
    };
    site.showModal("#scansAddModal");
  };

  $scope.addScans = function () {
    $scope.error = "";
    const v = site.validated("#scansAddModal");

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/scans/add",
      data: $scope.scans,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#scansAddModal");
          $scope.getScansList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateScans = function (scans) {
    $scope.error = "";
    $scope.viewScans(scans);
    $scope.scans = {};
    site.showModal("#scansUpdateModal");
  };

  $scope.updateScans = function () {
    $scope.error = "";
    const v = site.validated("#scansUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/scans/update",
      data: $scope.scans,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#scansUpdateModal");
          $scope.getScansList();
        } else {
          $scope.error = "Please Login First";
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsScans = function (scans) {
    $scope.error = "";
    $scope.viewScans(scans);
    $scope.scans = {};
    site.showModal("#scansViewModal");
  };

  $scope.viewScans = function (scans) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/scans/view",
      data: {
        id: scans.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.scans = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteScans = function (scans) {
    $scope.error = "";
    $scope.viewScans(scans);
    $scope.scans = {};
    site.showModal("#scansDeleteModal");
  };

  $scope.deleteScans = function () {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: "/api/scans/delete",
      data: {
        id: $scope.scans.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#scansDeleteModal");
          $scope.getScansList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getScansList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/scans/all",
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal("#scansSearchModal");
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getPeriod = function () {
    $scope.busy = true;
    $scope.periodList = [];
    $http({
      method: "POST",
      url: "/api/period_scan/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.periodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "scans",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displaySearchModal = function () {
    $scope.error = "";
    site.showModal("#scansSearchModal");
  };

  $scope.searchAll = function () {
    $scope.getScansList($scope.search);
    site.hideModal("#scansSearchModal");
    $scope.search = {};
  };

  $scope.getScansList();
  $scope.getNumberingAuto();
  $scope.getPeriod();
});
