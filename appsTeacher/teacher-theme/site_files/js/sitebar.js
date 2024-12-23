var app = app || angular.module('myApp', []);

site.showTabs(event, '#main_tabs');

app.controller('sitebar', ($scope, $http) => {
  $scope.register = function () {
    site.showModal('#registerModal');
  };
  $scope.indexLocation = function () {
    window.location.href = '/';

  };


  $scope.showRegisterModal = function () {
    $scope.customer = {
      image: '/images/customer.png',
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

  $scope.selectCategoryHeader = function (id) {
    window.location.href = `/?id=${id}`;
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
    $scope.error = '';
    $scope.busy = true;
    $http.post('/api/user/logout').then(
      function (response) {
        if (response.data.done) {
          window.location.href = '/';
        } else {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
      },
      function (error) {
        $scope.busy = false;
        $scope.error = error;
      },
    );
  };
  $scope.changeLang = function (language) {
    if (typeof language == 'string') {
      language = { id: language, dir: 'rtl', text: 'right' };
      if (language.id.like('*en*')) {
        language.dir = 'ltr';
        language.text = 'left';
      }
    }
    $http({
      method: 'POST',
      url: '/x-language/change',
      data: language,
    }).then(function (response) {
      if (response.data.done) {
        window.location.reload(!0);
      }
    });
  };

});
