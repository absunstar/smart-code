app.controller("amounts_report", function ($scope, $http) {
  $scope._search = {};

  $scope.showSearch = function () {
    site.showModal('#searchModal');
  };

  $scope.searchAll = function () {
    $scope.loadAmountsInList($scope.search);
    $scope.loadAmountsOutList($scope.search);

  };

  $scope.propertyName1 = 'date';
  $scope.reverse1 = true;

  $scope.propertyName2 = 'date';
  $scope.reverse2 = true;

  $scope.sortBy1 = function (propertyName) {
    $scope.reverse1 = ($scope.propertyName1 === propertyName) ? !$scope.reverse1 : false;
    $scope.propertyName1 = propertyName;
  };

  $scope.sortBy2 = function (propertyName) {
    $scope.reverse2 = ($scope.propertyName2 === propertyName) ? !$scope.reverse2 : false;
    $scope.propertyName2 = propertyName;
  };

  $scope.loadInOutNames = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/all",
      data:{}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.namesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.loadAmountsInList = function (search) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_in/amounts_report",
      data: { where: { search: search } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.total_in = 0;
          response.data.list.forEach(v => {
            $scope.total_in += site.toNumber(v.value);
          });
          $scope.amountsInList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )


  };

  $scope.loadAmountsOutList = function (search) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/amounts_out/amounts_report",
      data: { where: { search: search } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.total_out = 0;
          response.data.list.forEach(v => {
            $scope.total_out += site.toNumber(v.value);
          });
          $scope.amountsOutList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadInOutNames();
  $scope.loadAmountsInList();
  $scope.loadAmountsOutList();
});
