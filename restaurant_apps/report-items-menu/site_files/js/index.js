app.controller("report_items_menu", function ($scope, $http) {
  $scope._search = {};

  var Search = function () {
    return {
      tenant: {},
      date: new Date()
    } 
  };

  $scope.report = {};

  $scope.search = new Search();

  $scope.showSearch = function () {
    site.showModal('#searchModal');
  };

  $scope.searchAll = function () {

    $scope.getMenuList($scope.search);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };

  $scope.getTenantList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tenant/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tenantsList = response.data.list;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getMenuList = function (where) {

    $scope.report = {
      date: $scope.search.date,
    };

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/items_menu/display_items",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.attendList = response.data.list;
          $scope.list1 = [];
          $scope.attendList.forEach(itm1 => {
            let exit = false;

            $scope.list1.forEach(itm2 => {
              if (itm1.code == itm2.code) {
                itm2.list.push(itm1);
                exit = true;
              }
            });

            if (!exit) {
              $scope.list1.push({
                code: itm1.code,
                date : itm1.date,
                list: [itm1]
              });
            }
          });

        }
        $scope.search = {};
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTenantList();
  
  $scope.getMenuList();
});