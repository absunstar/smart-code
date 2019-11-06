app.controller("tables", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.tables = {};

  $scope.displayAddTables = function () {
    $scope.error = '';
    $scope.tables = {
      image_url: '/images/tables.png',
      active: true
/*       immediate : false
 */    };
    site.showModal('#tablesAddModal');

  };

  $scope.addTables = function () {
    $scope.error = '';
    const v = site.validated('#tablesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tables/add",
      data: $scope.tables
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#tablesAddModal');
          $scope.getTablesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateTables = function (tables) {
    $scope.error = '';
    $scope.viewTables(tables);
    $scope.tables = {};
    site.showModal('#tablesUpdateModal');
  };

  $scope.updateTables = function () {
    $scope.error = '';
    const v = site.validated('#tablesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tables/update",
      data: $scope.tables
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#tablesUpdateModal');
          $scope.getTablesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsTables = function (tables) {
    $scope.error = '';
    $scope.viewTables(tables);
    $scope.tables = {};
    site.showModal('#tablesViewModal');
  };

  $scope.viewTables = function (tables) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/tables/view",
      data: {
        id: tables.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tables = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteTables = function (tables) {
    $scope.error = '';
    $scope.viewTables(tables);
    $scope.tables = {};
    site.showModal('#tablesDeleteModal');
  };

  $scope.deleteTables = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/tables/delete",
      data: {
        id: $scope.tables.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#tablesDeleteModal');
          $scope.getTablesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getTablesGroupList = function (where) {
    $scope.busy = true;
    $scope.tablesGroupList = [];
    $http({
      method: "POST",
      url: "/api/tables_group/all",
      data: {
        select: { id: 1, name: 1, code: 1 },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.tablesGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTablesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/tables/all",
      data: {
        select: { id: 1, name: 1, code: 1, busy: 1, tables_group: 1, image_url: 1 },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#tablesSearchModal');
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
    site.showModal('#tablesSearchModal');

  };

  $scope.searchAll = function () {
    $scope.getTablesList($scope.search);
    site.hideModal('#tablesSearchModal');
    $scope.search = {};

  };

  $scope.getTablesList();
  $scope.getTablesGroupList();
});