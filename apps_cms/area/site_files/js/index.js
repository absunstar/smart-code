app.controller("area", function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.area = {};

  $scope.displayAddArea = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.area = {
      imageUrl: '/images/area.png',
      active: true

    };
    site.showModal('#areaManageModal');

  };

  $scope.addArea = function () {
    $scope.error = '';
    const v = site.validated('#areaManageModal');
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
          site.hideModal('#areaManageModal');
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
    $scope.mode = 'edit';
    $scope.viewArea(area);
    $scope.area = {};
    site.showModal('#areaManageModal');
  };

  $scope.updateArea = function () {
    $scope.error = '';
    const v = site.validated('#areaManageModal');
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
          site.hideModal('#areaManageModal');
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
    $scope.mode = 'view';
    $scope.viewArea(area);
    $scope.area = {};
    site.showModal('#areaManageModal');
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
    $scope.mode = 'delete';
    $scope.viewArea(area);
    $scope.area = {};
    site.showModal('#areaManageModal');
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
          site.hideModal('#areaManageModal');
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

  $scope.getGovesList = function (country) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/goves/all',
      data: {
        where: {
          'country.id': country.id,
          active: true,
        },
        select: {
          id: 1,
          name: 1,
        },
      },
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
    );
  };

  $scope.getCountriesList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/countries/all',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
          code: 1,
          countryCode: 1,
          },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.countriesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select: { id: 1, name: 1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
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
  $scope.getCountriesList();
});