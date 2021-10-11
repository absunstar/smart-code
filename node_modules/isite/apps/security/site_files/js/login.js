app.controller('login', function ($scope, $http) {

    $scope.busy = !1;
    $scope.tryLogin= function(ev){
        if (ev.which == 13){
          $scope.login();
        }
      };

    $scope.login = function () {
        $scope.error = '';
        $scope.busy = !0;
        $http({
            method: 'POST',
            url: '/api/user/login',
            data: {
                $encript : '123',
                email: site.to123($scope.userEmail),
                password: site.to123($scope.userPassword)
            }
        }).then(function (response) {
           
            if (response.data.error) {
                $scope.error = response.data.error;
            }
            if (response.data.done) {
                window.location.reload(!0);
            }
            $scope.busy = !1;
        } , function(err){
            $scope.busy = !1;
            $scope.error = err;
        });

    };
});