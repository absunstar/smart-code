app.controller("reports_types", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.reports_types = {};

  $scope.displayAddReportsTypes = function () {
    $scope.error = '';
    $scope.reports_types = {
      image_url: '/images/reports_types.png',
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
      url: "/api/reports_types/add",
      data: $scope.reports_types
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

  $scope.displayUpdateReportsTypes = function (reports_types) {
    $scope.error = '';
    $scope.viewReportsTypes(reports_types);
    $scope.reports_types = {};
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
      url: "/api/reports_types/update",
      data: $scope.reports_types
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

  $scope.displayDetailsReportsTypes = function (reports_types) {
    $scope.error = '';
    $scope.viewReportsTypes(reports_types);
    $scope.reports_types = {};
    site.showModal('#reportsTypesViewModal');
  };

  $scope.viewReportsTypes = function (reports_types) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/reports_types/view",
      data: {
        id: reports_types.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.reports_types = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteReportsTypes = function (reports_types) {
    $scope.error = '';
    $scope.viewReportsTypes(reports_types);
    $scope.reports_types = {};
    site.showModal('#reportsTypesDeleteModal');

  };

  $scope.deleteReportsTypes = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/reports_types/delete",
      data: {
        id: $scope.reports_types.id
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
      url: "/api/reports_types/all",
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