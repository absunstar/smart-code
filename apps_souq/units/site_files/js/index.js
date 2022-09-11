app.controller("units", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.unit = {};

  $scope.displayAddUnit = function () {
    $scope.error = '';
    $scope.unit = {
      image_url: '/images/unit.png',
      active: true
    };
    site.showModal('#unitAddModal');
  };

  $scope.addUnit = function () {
    $scope.error = '';
    const v = site.validated('#unitAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/units/add",
      data: $scope.unit
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#unitAddModal');
          $scope.getUnitList();
        } else {
          $scope.error = response.data.error;
        if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = "##word.err_maximum_adds##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateUnit = function (unit) {
    $scope.error = '';
    $scope.viewUnit(unit);
    $scope.unit = {};
    site.showModal('#unitUpdateModal');
  };

  $scope.updateUnit = function () {
    $scope.error = '';
    const v = site.validated('#unitUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/units/update",
      data: $scope.unit
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#unitUpdateModal');
          $scope.getUnitList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsUnit = function (unit) {
    $scope.error = '';
    $scope.viewUnit(unit);
    $scope.unit = {};
    site.showModal('#unitViewModal');
  };

  $scope.viewUnit = function (unit) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/units/view",
      data: {
        id: unit.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.unit = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteUnit = function (unit) {
    $scope.error = '';

    $scope.viewUnit(unit);
    $scope.unit = {};
    site.showModal('#unitDeleteModal');
  };

  $scope.deleteUnit = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/units/delete",
      data: {
        id: $scope.unit.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#unitDeleteModal');
          $scope.getUnitList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  

  $scope.getUnitList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/units/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#unitSearchModal');
          $scope.search = {};
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
    site.showModal('#unitSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getUnitList($scope.search);
    site.hideModal('#unitSearchModal');
    $scope.search = {};
  };

  $scope.getUnitList();
});