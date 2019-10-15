app.controller('register', function ($scope, $http) {

    $scope.busy = false;
  
    $scope.register = function () {
        $scope.error = '';
        $scope.busy = true;
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
                $scope.busy = false;
            }
            if (response.data.user) {
                window.location.href="/";
            }
        } , function(err){
            $scope.busy = false;
            $scope.error = err;
        });

    };
});