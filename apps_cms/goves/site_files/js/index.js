app.controller('goves', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.gov = {};

  $scope.displayAddGov = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.gov = {
      image: '/images/gov.png',
      active: true,
      translatedList: [],
    };

    $scope.defaultSettings.languagesList.forEach((l) => {
      if (l.language.active == true) {
        $scope.gov.translatedList.push({
          language: {
            id: l.language.id,
            en: l.language.en,
            ar: l.language.ar,
          },
        });
      }
    });
    site.showModal('#govManageModal');
  };

  $scope.addGov = function () {
    $scope.error = '';
    const v = site.validated('#govManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/goves/add',
      data: $scope.gov,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#govManageModal');
          $scope.getGovList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateGov = function (gov) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewGov(gov);
    $scope.gov = {};
    site.showModal('#govManageModal');
  };

  $scope.updateGov = function () {
    $scope.error = '';
    const v = site.validated('#govManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/goves/update',
      data: $scope.gov,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#govManageModal');
          $scope.getGovList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsGov = function (gov) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewGov(gov);
    $scope.gov = {};
    site.showModal('#govManageModal');
  };

  $scope.viewGov = function (gov) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/goves/view',
      data: {
        id: gov.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.gov = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteGov = function (gov) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewGov(gov);
    $scope.gov = {};
    site.showModal('#govManageModal');
  };

  $scope.deleteGov = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/goves/delete',
      data: {
        id: $scope.gov.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#govManageModal');
          $scope.getGovList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.searchAll = function () {
    $scope.getGovList($scope.search);
    site.hideModal('#govSearchModal');
    $scope.search = {};
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/goves/all',
      data: {
        where: where,
        select : {
          id :1 , name : 1 , active : 1 ,image : 1 , country : 1
        }
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#govSearchModal');
          $scope.search = {};
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
        }
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

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/get-site-setting',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
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
    site.showModal('#govSearchModal');
  };

  $scope.getGovList();
  $scope.getCountriesList();
  $scope.getDefaultSetting();
});
