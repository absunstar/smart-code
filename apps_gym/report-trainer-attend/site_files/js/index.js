app.controller("report_trainer_attend", function ($scope, $http) {

  var Search = function () {
    return {
      trainer: {},
      date: new Date()
    }
  };

  $scope.report = {};

  $scope.search = new Search();

  $scope.showSearch = function () {
    site.showModal('#searchModal');
    $scope.report.trainer_list = [];
  };

  $scope.searchAll = function () {

    $scope.trainer = $scope.search.trainer;
    $scope.getAttendList($scope.search.trainer);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
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

  $scope.getAttendList = function (trainer) {

    $scope.report = {
      date: $scope.search.date,
    };

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/request_service/trainer_attend",
      data: {
        where: { 'dates_list.trainer.id': trainer.id }
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
              if (itm1.course.id == itm2.course.id) {
                itm2.list.push(itm1);
                exit = true;
              }
            });

            if (!exit) {
              $scope.list1.push({
                course: itm1.course,
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