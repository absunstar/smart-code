app.controller("studentAmountsReports", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.search = {dateFrom : site.getDate()};
  $scope.baseURL = "";
  $scope.getAll = function (search) {
    const v = site.validated("#studentAmountsReportsSearch");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/studentAmountsReports/getGroupAmount`,
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

  $scope.getStudentsList = function ($search) {
    $scope.studentsList = [];
    if ($search && $search.length < 1) {
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manageUsers/all",
      data: {
        search: $search,
        where: {
          type: "student",

          active: true,
        },
        select: { id: 1, firstName: 1, barcode: 1, mobile: 1, parentMobile: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.studentsList = response.data.list;
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

  $scope.getStudentsList();
});
