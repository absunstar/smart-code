app.controller('logout', function ($scope, $http) {

    $scope.busy = !1;
   

    $scope.logout = function () {
        $scope.error = '';
        $scope.busy = !0;

        $http.post('/api/user/logout').then(function (response) {
           
            if (response.data.done) {
                window.location.href = '/';
            }else{
                $scope.error = response.data.error;
                $scope.busy = !1;
            }
        }, function (error) {
            $scope.busy = !1;
            $scope.error = error;
        });
    };
});