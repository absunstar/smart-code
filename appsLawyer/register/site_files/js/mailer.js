app.controller('mailer', function ($scope, $http, $timeout) {

  $scope.getMailer = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/mailer/all',
      data: {
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getMailer();
});
