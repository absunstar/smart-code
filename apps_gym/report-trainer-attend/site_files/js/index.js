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
      url: "/api/trainer/all",
      data: {
        where: {
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
          $scope.attend_count = 0;

          $scope.attendList.forEach(_attend => {
            let found = false;
            $scope.list.forEach(_list => {
              if (_attend.code == _list.code) {
                _list.list.push(_attend);
                _list.count = _list.count + 1;
                found = true;
              }
            });
            if (!found) {
              $scope.list.push({
                code: _attend.code,
                count: 1,
                list: [_attend]
              });
            }
          });

          $scope.list.map(_list => $scope.attend_count += _list.count)
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