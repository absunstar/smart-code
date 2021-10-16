app.controller("buildings", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.building = {};

  $scope.displayAddGov = function () {
    $scope.error = '';
    $scope.building = {
      image_url: '/images/building.png',
      active: true
    };

    site.showModal('#buildingAddModal');

  };

  $scope.addGov = function () {
    $scope.error = '';
    const v = site.validated('#buildingAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/buildings/add",
      data: $scope.building
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#buildingAddModal');
          $scope.getGovList();
        } else {
          $scope.error = response.data.error;
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

  $scope.displayUpdateGov = function (building) {
    $scope.error = '';
    $scope.viewGov(building);
    $scope.building = {};
    site.showModal('#buildingUpdateModal');
  };

  $scope.updateGov = function () {
    $scope.error = '';
    const v = site.validated('#buildingUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/buildings/update",
      data: $scope.building
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#buildingUpdateModal');
          $scope.getGovList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsGov = function (building) {
    $scope.error = '';
    $scope.viewGov(building);
    $scope.building = {};
    site.showModal('#buildingViewModal');
  };

  $scope.viewGov = function (building) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/buildings/view",
      data: {
        id: building.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.building = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteGov = function (building) {
    $scope.error = '';
    $scope.viewGov(building);
    $scope.building = {};
    site.showModal('#buildingDeleteModal');
  };

  $scope.deleteGov = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/buildings/delete",
      data: {
        id: $scope.building.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#buildingDeleteModal');
          $scope.getGovList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/buildings/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#buildingSearchModal');
          $scope.search = {};

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
        screen: "building"
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
    site.showModal('#buildingSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getGovList($scope.search);
    site.hideModal('#buildingSearchModal');
    $scope.search = {};
  };

  $scope.getGovList();
  $scope.getNumberingAuto();
});