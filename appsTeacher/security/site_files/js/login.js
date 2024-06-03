app.controller('login', function ($scope, $http) {
  $scope.busy = false;
  $scope.user = {};

 
  $scope.login = function (b) {
    $scope.error = '';
    console.log('b', b);
    const v = site.validated('#loginModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/login',
      data: {
        $encript: '123',
        email: site.to123($scope.user.email),
        password: site.to123($scope.user.password),
       
      
      },
    }).then(
      function (response) {
        console.log('response', response);

        if (response.data.error) {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
        if (response.data.done) {
          window.location.reload(true);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  

});
