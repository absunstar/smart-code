app.controller("vehicles", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.vehicles = {};

  $scope.displayAddVehicles = function () {
    $scope.error = '';
    $scope.vehicles = {
      image_url: '/images/vehicles.png',
      active: true,
      busy: false
    };
    site.showModal('#vehiclesAddModal');

  };

  $scope.addVehicles = function () {
    $scope.error = '';
    const v = site.validated('#vehiclesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vehicles/add",
      data: $scope.vehicles
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vehiclesAddModal');
          $scope.getVehiclesList();
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

  $scope.displayUpdateVehicles = function (vehicles) {

    $scope.error = '';
    $scope.viewVehicles(vehicles);
    $scope.vehicles = {};
    site.showModal('#vehiclesUpdateModal');
  };

  $scope.updateVehicles = function () {
    $scope.error = '';
    const v = site.validated('#vehiclesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vehicles/update",
      data: $scope.vehicles
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vehiclesUpdateModal');
          $scope.getVehiclesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsVehicles = function (vehicles) {
    $scope.error = '';
    $scope.viewVehicles(vehicles);
    $scope.vehicles = {};
    site.showModal('#vehiclesViewModal');
  };

  $scope.viewVehicles = function (vehicles) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/vehicles/view",
      data: {
        id: vehicles.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.vehicles = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteVehicles = function (vehicles) {
    $scope.error = '';
    $scope.viewVehicles(vehicles);
    $scope.vehicles = {};
    site.showModal('#vehiclesDeleteModal');
  };

  $scope.deleteVehicles = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/vehicles/delete",
      data: {
        id: $scope.vehicles.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vehiclesDeleteModal');
          $scope.getVehiclesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getVehiclesGroupList = function (where) {
    $scope.busy = true;
    $scope.vehiclesGroupList = [];
    $http({
      method: "POST",
      url: "/api/vehicles_group/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.vehiclesGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getVehiclesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/vehicles/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#vehiclesSearchModal');
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
        screen: "vehicles"
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
    site.showModal('#vehiclesSearchModal');

  };

  $scope.getDeliveryEmployeesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.deliveryEmployeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getVehiclesTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vehicles_types/all",
      data: {
        where: {
          active: true
        },
        select: { id: 1, name_ar: 1, name_en: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.vehiclesTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.searchAll = function () {
    $scope.getVehiclesList($scope.search);
    site.hideModal('#vehiclesSearchModal');
    $scope.search = {};

  };
  $scope.getVehiclesList();
  $scope.getVehiclesGroupList();
  $scope.getNumberingAuto();
  $scope.getVehiclesTypes();
  $scope.getDeliveryEmployeesList();
});