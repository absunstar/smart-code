app.controller('area', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.area = {};
  $scope.defaultSettings = site.showObject(`##data.#setting##`);

  $scope.displayAddArea = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.area = {
      image: '/images/areas.png',
      active: true,
      translatedList: [],
    };

    $scope.defaultSettings.languageList.forEach((l) => {
      if (l.active == true) {
        $scope.area.translatedList.push({
          language: {
            id: l.id,
            name: l.name,
          },
        });
      }
    });
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
      method: 'POST',
      url: '/api/areas/add',
      data: $scope.area,
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
    );
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
      method: 'POST',
      url: '/api/areas/update',
      data: $scope.area,
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
    );
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
      method: 'POST',
      url: '/api/areas/view',
      data: {
        id: area.id,
      },
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
    );
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
      method: 'POST',
      url: '/api/areas/delete',
      data: {
        id: $scope.area.id,
      },
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
    );
  };

  $scope.getAreaList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/areas/all',
      data: {
        where: where,
        search: $scope.$search,
        select: {
          id: 1,
          name: 1,
          active: 1,
          image: 1,
          country: 1,
          gov: 1,
          city: 1,
        },
      },
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
    );
  };

  $scope.getGovesList = function (country) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/goves/all',
      data: {
        where: {
          country: country,
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

  $scope.getCountriesList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/countries/all',
      data: {
        where: {
          active: true,
        },
        select: { id: 1, code: 1, name: 1 },
        search: $search,
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

  $scope.getCitiesList = function (gov) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/cities/all',
      data: {
        where: {
          gov: gov,
          active: true,
        },
        select: { id: 1, name: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.citiesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addKeyWords = function (ev, obj) {
    $scope.error = '';

    if (ev.which !== 13 || !obj.$keyword) {
      return;
    }
    obj.keyWordsList = obj.keyWordsList || [];
    if (!obj.keyWordsList.some((k) => k === obj.$keyword)) {
      obj.keyWordsList.push(obj.$keyword);
    }

    obj.$keyword = '';
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#areaSearchModal');
  };

  $scope.smartSearch = function () {
    $timeout(() => {
      $scope.getAreaList();
    }, 200);
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
