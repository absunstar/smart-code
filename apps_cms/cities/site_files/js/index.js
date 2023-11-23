app.controller('city', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.city = {};
  $scope.defaultSettings = site.showObject(`##data.#setting##`);

  $scope.displayaddCity = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.city = {
      image: '/images/cities.png',
      active: true,
      translatedList: [],
    };

    $scope.defaultSettings.languagesList.forEach((l) => {
      if (l.active == true) {
        $scope.city.translatedList.push({
          language: {
            id: l.id,
            en: l.en,
            ar: l.ar,
          },
        });
      }
    });
    site.showModal('#cityManageModal');
  };

  $scope.addCity = function () {
    $scope.error = '';
    const v = site.validated('#cityManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/cities/add',
      data: $scope.city,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#cityManageModal');
          $scope.getCitiesList();
        } else {
          $scope.error = 'Please Login First';
        
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateCity = function (city) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewCity(city);
    $scope.city = {};
    site.showModal('#cityManageModal');
  };

  $scope.updateCity = function () {
    $scope.error = '';
    const v = site.validated('#cityManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/cities/update',
      data: $scope.city,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#cityManageModal');
          $scope.getCitiesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsCity = function (city) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewCity(city);
    $scope.city = {};
    site.showModal('#cityManageModal');
  };

  $scope.viewCity = function (city) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/cities/view',
      data: {
        id: city.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.city = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displaydeleteCity = function (city) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewCity(city);
    $scope.city = {};
    site.showModal('#cityManageModal');
  };

  $scope.deleteCity = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/cities/delete',
      data: {
        id: $scope.city.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#cityManageModal');
          $scope.getCitiesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getCitiesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/cities/all',
      data: {
        where: where,
        search : $scope.$search,
        select : {
          id :1 , name : 1 , active : 1 ,image : 1 , country : 1 , gov : 1
        }
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#citySearchModal');
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

  $scope.smartSearch = function () {
    $timeout(() => {
      $scope.getCitiesList();
    }, 200);
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#citySearchModal');
  };

  $scope.searchAll = function () {
    $scope.error = '';

    $scope.search = $scope.search || {};
    site.hideModal('#citySearchModal');
    $scope.getCitiesList($scope.search);
  };

  $scope.getCitiesList();
  $scope.getCountriesList();
});
