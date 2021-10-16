app.controller("floor", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.floor = {};

  $scope.displayaddFloor = function () {
    $scope.error = '';
    $scope.floor = {
      image_url: '/images/floor.png',
      active: true

    };
    site.showModal('#floorAddModal');

  };

  $scope.addFloor = function () {
    $scope.error = '';
    const v = site.validated('#floorAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/floor/add",
      data: $scope.floor
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#floorAddModal');
          $scope.getFloorList();
        } else {
          $scope.error = 'Please Login First';
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateFloor = function (floor) {
    $scope.error = '';
    $scope.viewFloor(floor);
    $scope.floor = {};
    site.showModal('#floorUpdateModal');
  };

  $scope.updateFloor = function () {
    $scope.error = '';
    const v = site.validated('#floorUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/floor/update",
      data: $scope.floor
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#floorUpdateModal');
          $scope.getFloorList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsFloor = function (floor) {
    $scope.error = '';
    $scope.viewFloor(floor);
    $scope.floor = {};
    site.showModal('#floorViewModal');
  };

  $scope.viewFloor = function (floor) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/floor/view",
      data: {
        id: floor.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.floor = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displaydeleteFloor = function (floor) {
    $scope.error = '';
    $scope.viewFloor(floor);
    $scope.floor = {};
    site.showModal('#floorDeleteModal');
  };

  $scope.deleteFloor = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/floor/delete",
      data: {
        id: $scope.floor.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#floorDeleteModal');
          $scope.getFloorList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getFloorList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/floor/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#floorSearchModal');

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getBuildingsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/buildings/all",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1, name_ar: 1, name_en: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.buildingsList = response.data.list;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "floor"
      }
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
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#floorSearchModal');

  };

  $scope.searchAll = function () {

    $scope.error = '';

    $scope.search = $scope.search || {};
    site.hideModal('#floorSearchModal');
    $scope.getFloorList($scope.search);
  };

  $scope.getFloorList();
  $scope.getBuildingsList();
  $scope.getNumberingAuto();
});