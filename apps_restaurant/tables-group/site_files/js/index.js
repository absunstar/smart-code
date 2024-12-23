app.controller("tables_group", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.tables_group = {};

  $scope.displayAddTablesGroup = function () {
    $scope.error = '';
    $scope.tables_group = {
      image_url: '/images/tables_group.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#tablesGroupAddModal');
    
  };

  $scope.addTablesGroup = function () {
    $scope.error = '';
    const v = site.validated('#tablesGroupAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tables_group/add",
      data: $scope.tables_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#tablesGroupAddModal');
          $scope.getTablesGroupList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateTablesGroup = function (tables_group) {
    $scope.error = '';
    $scope.viewTablesGroup(tables_group);
    $scope.tables_group = {};
    site.showModal('#tablesGroupUpdateModal');
  };

  $scope.updateTablesGroup = function () {
    $scope.error = '';
    const v = site.validated('#tablesGroupUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tables_group/update",
      data: $scope.tables_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#tablesGroupUpdateModal');
          $scope.getTablesGroupList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsTablesGroup = function (tables_group) {
    $scope.error = '';
    $scope.viewTablesGroup(tables_group);
    $scope.tables_group = {};
    site.showModal('#tablesGroupViewModal');
  };

  $scope.viewTablesGroup = function (tables_group) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/tables_group/view",
      data: {
        id: tables_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tables_group = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteTablesGroup = function (tables_group) {
    $scope.error = '';
    $scope.viewTablesGroup(tables_group);
    $scope.tables_group = {};
    site.showModal('#tablesGroupDeleteModal');

  };

  $scope.deleteTablesGroup = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/tables_group/delete",
      data: {
        id: $scope.tables_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#tablesGroupDeleteModal');
          $scope.getTablesGroupList();
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
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/tables_group/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#tablesGroupSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "tables_groups"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
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
    site.showModal('#tablesGroupSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getTablesGroupList($scope.search);
    site.hideModal('#tablesGroupSearchModal');
    $scope.search = {};

  };

  $scope.getTablesGroupList();
  $scope.getNumberingAuto();
});