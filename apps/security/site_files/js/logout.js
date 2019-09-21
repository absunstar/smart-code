app.controller('logout', function ($scope, $http) {

    $scope.busy = false;
   

    $scope.logout = function () {
        $scope.error = '';
        $scope.busy = true;

        $http.post('/api/user/logout').then(function (response) {
           
            if (response.data.done) {
                window.location.href = '/';
            }else{
                $scope.error = response.data.error;
                $scope.busy = false;
            }
        }, function (error) {
            $scope.busy = false;
            $scope.error = error;
        });
    };
});