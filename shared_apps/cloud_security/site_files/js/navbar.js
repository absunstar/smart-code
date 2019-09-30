app.controller('navbar' , ($scope , $http)=>{

    $scope.register = function(){
        site.showModal('#registerModal');
    };

    $scope.login = function(){
        site.showModal('#loginModal');
    };

    $scope.logout = function(){
        site.showModal('#logoutModal');
    };

    $scope.changeLang = function(lang){
        $http({
            method: 'POST',
            url: '/@language/change',
            data:{ name : lang}
        }).then(function (response) {
            if (response.data.done) {
              window.location.reload(true);
            }
        });
      };

});