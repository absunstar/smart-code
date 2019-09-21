app.controller("neighborhood", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.neighborhood = {};

  $scope.displayAddNeighborhood = function () {
    $scope.error = '';
    $scope.neighborhood = {
      image_url: '/images/neighborhood.png',
      active: true

    };
    site.showModal('#neighborhoodAddModal');

  };

  $scope.addNeighborhood = function () {
    $scope.error = '';
    const v = site.validated('#neighborhoodAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/neighborhood/add",
      data: $scope.neighborhood
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#neighborhoodAddModal');
          $scope.getNeighborhoodList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
       
  $scope.displayUpdateNeighborhood = function (neighborhood) {
    $scope.error = '';
    $scope.viewNeighborhood(neighborhood);
    $scope.neighborhood = {};
    site.showModal('#neighborhoodUpdateModal');
  };

  $scope.updateNeighborhood = function () {
    $scope.error = '';
    const v = site.validated('#neighborhoodUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/neighborhood/update",
      data: $scope.neighborhood
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#neighborhoodUpdateModal');
          $scope.getNeighborhoodList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsNeighborhood = function (neighborhood) {
    $scope.error = '';
    $scope.viewNeighborhood(neighborhood);
    $scope.neighborhood = {};
    site.showModal('#neighborhoodViewModal');
  };

  $scope.viewNeighborhood = function (neighborhood) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/neighborhood/view",
      data: {
        id: neighborhood.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.neighborhood = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteNeighborhood = function (neighborhood) {
    $scope.error = '';
    $scope.viewNeighborhood(neighborhood);
    $scope.neighborhood = {};
    site.showModal('#neighborhoodDeleteModal');
  };

  $scope.deleteNeighborhood = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/neighborhood/delete",
      data: {
        id: $scope.neighborhood.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#neighborhoodDeleteModal');
          $scope.getNeighborhoodList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getNeighborhoodList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/neighborhood/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#neighborhoodSearchModal');

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getGovesList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true
        },
        select:{
          id: 1, name :1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govesList = response.data.list;

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
    site.showModal('#neighborhoodSearchModal');

  };

  $scope.searchAll = function () {

    $scope.error = '';

    $scope.search = $scope.search || {};
    site.hideModal('#neighborhoodSearchModal');
    $scope.getNeighborhoodList($scope.search);
  };

  $scope.getNeighborhoodList();
  $scope.getGovesList();

});