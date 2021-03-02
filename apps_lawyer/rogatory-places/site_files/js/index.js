app.controller("rogatory_places", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.rogatory_places = {};

  $scope.displayAddRogatoryPlaces = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.rogatory_places = {
      image_url: '/images/rogatory_places.png',
      active: true
    };
    site.showModal('#rogatoryPlacesAddModal');
  };

  $scope.addRogatoryPlaces = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#rogatoryPlacesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/rogatory_places/add",
      data: $scope.rogatory_places
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryPlacesAddModal');
          $scope.getRogatoryPlacesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateRogatoryPlaces = function (rogatory_places) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsRogatoryPlaces(rogatory_places);
    $scope.rogatory_places = {};
    site.showModal('#rogatoryPlacesUpdateModal');
  };

  $scope.updateRogatoryPlaces = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#rogatoryPlacesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/rogatory_places/update",
      data: $scope.rogatory_places
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryPlacesUpdateModal');
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

  $scope.displayDetailsRogatoryPlaces = function (rogatory_places) {
    $scope.error = '';
    $scope.detailsRogatoryPlaces(rogatory_places);
    $scope.rogatory_places = {};
    site.showModal('#rogatoryPlacesDetailsModal');
  };

  $scope.detailsRogatoryPlaces = function (rogatory_places) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_places/view",
      data: {
        id: rogatory_places.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.rogatory_places = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRogatoryPlaces = function (rogatory_places) {
    $scope.error = '';
    $scope.detailsRogatoryPlaces(rogatory_places);
    $scope.rogatory_places = {};
    site.showModal('#rogatoryPlacesDeleteModal');
  };

  $scope.deleteRogatoryPlaces = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_places/delete",
      data: {
        id: $scope.rogatory_places.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryPlacesDeleteModal');
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

  $scope.getRogatoryPlacesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/rogatory_places/all",
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
    $scope.getRogatoryPlacesList($scope.search);
    site.hideModal('#rogatoryPlacesSearchModal');
    $scope.search = {}

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "rogatory_places"
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
  $scope.getRogatoryPlacesList();

});