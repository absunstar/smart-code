app.controller("area", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.area = {};

  $scope.displayAddArea = function () {
    $scope.error = '';
    $scope.area = {
      image_url: '/images/area.png',
      active: true

    };
    site.showModal('#areaAddModal');

  };

  $scope.addArea = function () {
    $scope.error = '';
    const v = site.validated('#areaAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/add",
      data: $scope.area
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#areaAddModal');
          $scope.getAreaList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateArea = function (area) {
    $scope.error = '';
    $scope.viewArea(area);
    $scope.area = {};
    site.showModal('#areaUpdateModal');
  };

  $scope.updateArea = function () {
    $scope.error = '';
    const v = site.validated('#areaUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/update",
      data: $scope.area
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#areaUpdateModal');
          $scope.getAreaList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsArea = function (area) {
    $scope.error = '';
    $scope.viewArea(area);
    $scope.area = {};
    site.showModal('#areaViewModal');
  };

  $scope.viewArea = function (area) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/area/view",
      data: {
        id: area.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.area = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteArea = function (area) {
    $scope.error = '';
    $scope.viewArea(area);
    $scope.area = {};
    site.showModal('#areaDeleteModal');
  };

  $scope.deleteArea = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/area/delete",
      data: {
        id: $scope.area.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#areaDeleteModal');
          $scope.getAreaList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAreaList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#areaSearchModal');

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true
        },
        select : {id : 1 , name : 1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getNeighborhoodList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/neighborhood/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select : {id : 1 , name : 1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.neighborhoodList = response.data.list;
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
    site.showModal('#areaSearchModal');

  };

  $scope.searchAll = function () {

    $scope.error = '';

    $scope.search = $scope.search || {};
    site.hideModal('#areaSearchModal');
    $scope.getAreaList($scope.search);
  };

  $scope.getAreaList();
  $scope.getGovList();
});