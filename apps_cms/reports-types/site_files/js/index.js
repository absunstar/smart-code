app.controller('reportsTypes', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.reportsTypes = {};

  $scope.displayAddReportsTypes = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.reportsTypes = {
      active: true,
      translatedList: [],
    };
    $scope.defaultSettings.languageList.forEach((l) => {
      if (l.active == true) {
        $scope.reportsTypes.translatedList.push({
          language: {
            id: l.id,
            name: l.name,
          },
        });
      }
    });
    site.showModal('#reportsTypesManageModal');
  };

  $scope.addReportsTypes = function () {
    $scope.error = '';
    const v = site.validated('#reportsTypesManageModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/reportsTypes/add',
      data: $scope.reportsTypes,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reportsTypesManageModal');
          $scope.getReportsTypesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateReportsTypes = function (reportsTypes) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewReportsTypes(reportsTypes);
    $scope.reportsTypes = {};
    site.showModal('#reportsTypesManageModal');
  };

  $scope.updateReportsTypes = function () {
    $scope.error = '';
    const v = site.validated('#reportsTypesManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/reportsTypes/update',
      data: $scope.reportsTypes,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reportsTypesManageModal');
          $scope.getReportsTypesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsReportsTypes = function (reportsTypes) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewReportsTypes(reportsTypes);
    $scope.reportsTypes = {};
    site.showModal('#reportsTypesManageModal');
  };

  $scope.viewReportsTypes = function (reportsTypes) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/reportsTypes/view',
      data: {
        id: reportsTypes.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.reportsTypes = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteReportsTypes = function (reportsTypes) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewReportsTypes(reportsTypes);
    $scope.reportsTypes = {};
    site.showModal('#reportsTypesManageModal');
  };

  $scope.deleteReportsTypes = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/reportsTypes/delete',
      data: {
        id: $scope.reportsTypes.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reportsTypesManageModal');
          $scope.getReportsTypesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getReportsTypesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/reportsTypes/all',
      data: {
        where: where,
        select: { id: 1, translatedList: 1, name: 1, active: 1, image : 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#reportsTypesSearchModal');
          $scope.search = {};
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#reportsTypesSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getReportsTypesList($scope.search);
    site.hideModal('#reportsTypesSearchModal');
    $scope.search = {};
  };

  $scope.getReportsTypesList();
});
