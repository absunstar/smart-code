var app = app || angular.module('myApp', []);

app.controller('footer_cms' , ($scope , $http)=>{

    $scope.changeLang = function(lang){
        $http({
            method: 'POST',
            url: '/x-language/change',
            data:{ name : lang}
        }).then(function (response) {
            if (response.data.done) {
              window.location.reload(true);
            }
        });
      };

});