app.controller("reportsTypes", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.reportsTypes = {};

  $scope.displayAddReportsTypes = function () {
    $scope.error = '';
    $scope.reportsTypes = {
      image: '/images/reportsTypes.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#reportsTypesAddModal');
    
  };

  $scope.addReportsTypes = function () {
    $scope.error = '';
    const v = site.validated('#reportsTypesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/reportsTypes/add",
      data: $scope.reportsTypes
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reportsTypesAddModal');
          $scope.getReportsTypesList();
        } else {
          $scope.error = response.data.error;
       
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateReportsTypes = function (reportsTypes) {
    $scope.error = '';
    $scope.viewReportsTypes(reportsTypes);
    $scope.reportsTypes = {};
    site.showModal('#reportsTypesUpdateModal');
  };

  $scope.updateReportsTypes = function () {
    $scope.error = '';
    const v = site.validated('#reportsTypesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/reportsTypes/update",
      data: $scope.reportsTypes
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reportsTypesUpdateModal');
          $scope.getReportsTypesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsReportsTypes = function (reportsTypes) {
    $scope.error = '';
    $scope.viewReportsTypes(reportsTypes);
    $scope.reportsTypes = {};
    site.showModal('#reportsTypesViewModal');
  };

  $scope.viewReportsTypes = function (reportsTypes) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/reportsTypes/view",
      data: {
        id: reportsTypes.id
      }
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
    )
  };

  $scope.displayDeleteReportsTypes = function (reportsTypes) {
    $scope.error = '';
    $scope.viewReportsTypes(reportsTypes);
    $scope.reportsTypes = {};
    site.showModal('#reportsTypesDeleteModal');

  };

  $scope.deleteReportsTypes = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/reportsTypes/delete",
      data: {
        id: $scope.reportsTypes.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reportsTypesDeleteModal');
          $scope.getReportsTypesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getReportsTypesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/reportsTypes/all",
      data: {
        where: where
      }
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
    )
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