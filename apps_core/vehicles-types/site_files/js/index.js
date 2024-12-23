app.controller("vehicles_types", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.vehicles_types = {};

  $scope.displayAddVehiclesTypes = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.vehicles_types = {
      image_url: '/images/vehicles_types.png',
      subjects_list: [{}],
      active: true
    };
    site.showModal('#vehiclesTypesAddModal');
  };

  $scope.addVehiclesTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#vehiclesTypesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    if ($scope.vehicles_types.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/vehicles_types/add",
      data: $scope.vehicles_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vehiclesTypesAddModal');
          $scope.getVehiclesTypesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          } else if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateVehiclesTypes = function (vehicles_types) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsVehiclesTypes(vehicles_types);
    $scope.vehicles_types = {};
    site.showModal('#vehiclesTypesUpdateModal');
  };

  $scope.updateVehiclesTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#vehiclesTypesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    if ($scope.vehicles_types.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/vehicles_types/update",
      data: $scope.vehicles_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vehiclesTypesUpdateModal');
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

  $scope.displayDetailsVehiclesTypes = function (vehicles_types) {
    $scope.error = '';
    $scope.detailsVehiclesTypes(vehicles_types);
    $scope.vehicles_types = {};
    site.showModal('#vehiclesTypesDetailsModal');
  };

  $scope.detailsVehiclesTypes = function (vehicles_types) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vehicles_types/view",
      data: {
        id: vehicles_types.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.vehicles_types = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteVehiclesTypes = function (vehicles_types) {
    $scope.error = '';
    $scope.detailsVehiclesTypes(vehicles_types);
    $scope.vehicles_types = {};
    site.showModal('#vehiclesTypesDeleteModal');
  };

  $scope.deleteVehiclesTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vehicles_types/delete",
      data: {
        id: $scope.vehicles_types.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vehiclesTypesDeleteModal');
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

  $scope.getVehiclesTypesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/vehicles_types/all",
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

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getVehiclesTypesList($scope.search);
    site.hideModal('#vehiclesTypesSearchModal');
    $scope.search = {}

  };

  $scope.getSubjects = function () {
    $http({
      method: "POST",
      url: "/api/subjects/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.subjectsList = response.data.list;
      },
      function (err) {
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
        screen: "vehicles_types"
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

  $scope.getNumberingAuto();
  $scope.getSubjects();
  $scope.getVehiclesTypesList();

});