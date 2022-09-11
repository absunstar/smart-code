var app = app || angular.module('myApp', []);

/*let btn = document.querySelector('.sitebar .tab-link');
if (btn) {
    btn.click();
}*/

site.showTabs(event, '#main_tabs');

/*$('body').click(() => {
    $('.sitebar .links').hide(100);
});*/

app.controller('sitebar', ($scope, $http) => {
  $scope.register = function () {
    site.showModal('#registerModal');
  };

  $scope.showRegisterModal = function () {
    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,
      balance_creditor: 0,
      balance_debtor: 0,
      branch_list: [
        {
          charge: [{}],
        },
      ],
      currency_list: [],
      opening_balance: [{ initial_balance: 0 }],
      bank_list: [{}],
      dealing_company: [{}],
    };

    site.showModal('#customerRegisterModal');
  };

  $scope.login = function () {
    site.showModal('#loginModal');
  };

  $scope.customerRegister = function () {
    site.showModal('#customerRegisterModal');
  };

  $scope.showBranches = function () {
    site.showModal('#branchesModal');
  };

  $scope.logout = function () {
    site.showModal('#logOutModal');
  };

  $scope.changeLang = function (lang) {
    $http({
      method: 'POST',
      url: '/x-language/change',
      data: {
        name: lang,
      },
    }).then(function (response) {
      if (response.data.done) {
        window.location.reload(true);
      }
    });
  };

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getDefaultSetting();
});
