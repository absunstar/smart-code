app.controller('register', function ($scope, $http) {

    $scope.busy = !1;
  
    $scope.register = function () {
        $scope.error = '';
        $scope.busy = !0;
        $http({
            method: 'POST',
            url: '/api/user/register',
            data: {
                $encript : '123',
                email: site.to123($scope.userEmail),
                password: site.to123($scope.userPassword)
            }
        }).then(function (response) {
           
            if (response.data.error) {
                $scope.error = response.data.error;
                $scope.busy = !1;
            }
            if (response.data.user) {
                window.location.href = '/';
            }
        } , function(err){
            $scope.busy = !1;
            $scope.error = err;
        });

    };
});