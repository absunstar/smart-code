var app = app || angular.module('myApp', []);

/*let btn = document.querySelector('.sitebar .tab-link');
if (btn) {
    btn.click();
}*/

site.showTabs(event, '#main_tabs');

$('body').click(() => {
    $('.sitebar .links').hide(100);
});

app.controller('sitebar', ($scope, $http) => {

    $scope.register = function () {
        site.showModal('#registerModal');
    };

    $scope.showRegisterModal = function () {
        $scope.customer = {
            image_url: '/images/customer.png'
        };

        site.showModal('#customerRegisterModal')
    };


    $scope.login = function () {
        site.showModal('#loginModal');
    };

    $scope.showBranches = function () {
        site.showModal('#branchesModal');
    };

    $scope.logout = function () {
        site.showModal('#logoutModal');
    };

    $scope.changeLang = function (lang) {
        $http({
            method: 'POST',
            url: '/@language/change',
            data: {
                name: lang
            }
        }).then(function (response) {
            if (response.data.done) {
                window.location.reload(true);
            }
        });
    };

});