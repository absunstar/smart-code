app.controller("report_trainer_attend", function ($scope, $http) {

  $scope.report = {};


  $scope.showSearch = function () {
    site.showModal('#searchModal');
    $scope.report.trainer_list = [];
  };

  $scope.searchAll = function () {

    $scope.trainer = $scope.search.trainer;
    $scope.getAttendList($scope.search);

    site.hideModal('#searchModal');
  };

  $scope.getTrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          'job.trainer': true,
          busy: { $ne: true }
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.trainersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAttendList = function (where) {

    $scope.report = { date: $scope.search.date };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/report_trainer_attend/trainer_attend",
      data: { where: where }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.attendList = response.data.list;
          $scope.list = [];
          $scope.attendList.forEach(itm1 => {
            let exit = false;
            $scope.list.forEach(itm2 => {
              if (itm1.code == itm2.code) {
                itm2.list.push(itm1);
                exit = true;
              }
            });
            if (!exit) {
              $scope.list.push({
                code: itm1.code,
                list: [itm1]
              });
            }
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTrainerList();

});