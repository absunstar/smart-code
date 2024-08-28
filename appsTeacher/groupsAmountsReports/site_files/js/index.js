app.controller("groupsAmountsReports", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.search = {dateFrom : new Date()};
  $scope.baseURL = "";
  $scope.getAll = function (search) {
    const v = site.validated("#groupsAmountsReportsSearch");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/groupsAmountsReports/getGroupAmount`,
      data: search,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.result;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getGroupsList = function ($search) {
    $scope.groupsList = [];
    if ($search && $search.length < 1) {
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/groups/all",
      data: {
        search: $search,
        where: {
          active: true,
        },
        select: { id: 1, name: 1, educationalLevel: 1, schoolYear: 1, subject: 1, teacher: 1, paymentMethod: 1, price: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.groupsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displayDetails = function (item) {
    $scope.detail = item;
    site.showModal("#detailsModal");

  };

  $scope.getGroupsList();
});
