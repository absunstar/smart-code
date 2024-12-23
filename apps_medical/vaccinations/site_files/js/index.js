app.controller("vaccinations", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.vaccinations = {};

  $scope.displayAddScans = function () {
    $scope.error = "";
    $scope.vaccinations = {
      image_url: "/images/vaccinations.png",
      active: true,
      price: 0,
      from_age : 0,
      to_age : 0,
      made_home_vaccination: false,
    };
    site.showModal("#vaccinationsAddModal");
  };

  $scope.addScans = function () {
    $scope.error = "";
    const v = site.validated("#vaccinationsAddModal");

    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vaccinations/add",
      data: $scope.vaccinations,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#vaccinationsAddModal");
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

  $scope.displayUpdateScans = function (vaccinations) {
    $scope.error = "";
    $scope.viewScans(vaccinations);
    $scope.vaccinations = {};
    site.showModal("#vaccinationsUpdateModal");
  };

  $scope.updateScans = function () {
    $scope.error = "";
    const v = site.validated("#vaccinationsUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vaccinations/update",
      data: $scope.vaccinations,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#vaccinationsUpdateModal");
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

  $scope.displayDetailsScans = function (vaccinations) {
    $scope.error = "";
    $scope.viewScans(vaccinations);
    $scope.vaccinations = {};
    site.showModal("#vaccinationsViewModal");
  };

  $scope.viewScans = function (vaccinations) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/vaccinations/view",
      data: {
        id: vaccinations.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.vaccinations = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteScans = function (vaccinations) {
    $scope.error = "";
    $scope.viewScans(vaccinations);
    $scope.vaccinations = {};
    site.showModal("#vaccinationsDeleteModal");
  };

  $scope.deleteScans = function () {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: "/api/vaccinations/delete",
      data: {
        id: $scope.vaccinations.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#vaccinationsDeleteModal");
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
      url: "/api/vaccinations/all",
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal("#vaccinationsSearchModal");
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
      url: "/api/period_vaccination/all",
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
        screen: "vaccinations",
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
    site.showModal("#vaccinationsSearchModal");
  };

  $scope.searchAll = function () {
    $scope.getScansList($scope.search);
    site.hideModal("#vaccinationsSearchModal");
    $scope.search = {};
  };

  $scope.getScansList();
  $scope.getNumberingAuto();
  $scope.getPeriod();
});
