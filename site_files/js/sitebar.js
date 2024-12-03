var app = app || angular.module("myApp", []);

/*let btn = document.querySelector('.sitebar .tab-link');
if (btn) {
    btn.click();
}*/

site.showTabs(event, "#main_tabs");

/*$('body').click(() => {
    $('.sitebar .links').hide(100);
});*/

app.controller("sitebar", ($scope, $http) => {
  $scope.register = function () {
    site.showModal("#registerModal");
  };

  $scope.showRegisterModal = function () {
    $scope.customer = {
      image_url: "/images/customer.png",
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

    if (site.feature("medical")) {
      $scope.customer.image_url = "/images/patients.png";
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];
    } else if (site.feature("school") || site.feature("academy")) {
      $scope.customer.image_url = "/images/student.png";
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];
    }

    site.showModal("#customerRegisterModal");
  };

  $scope.login = function () {
    site.showModal("#loginModal");
  };

  $scope.customerRegister = function () {
    site.showModal("#customerRegisterModal");
  };

  $scope.showBranches = function () {
    site.showModal("#branchesModal");
  };

  $scope.logout = function () {
    $scope.error = "";
    $scope.busy = true;

    $http.post("/api/user/logout").then(
      function (response) {
        if (response.data.done) {
          window.location.href = "/";
        } else {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
      },
      function (error) {
        $scope.busy = false;
        $scope.error = error;
      }
    );
  };

  $scope.changeLang = function (language) {
    if (typeof language == "string") {
      language = { id: language, dir: "rtl", text: "right" };
      if (!language.id.like("*ar*")) {
        language.dir = "ltr";
        language.text = "left";
      }
    }
    $http({
      method: "POST",
      url: "/x-language/change",
      data: language,
    }).then(function (response) {
      if (response.data.done) {
        window.location.reload(!0);
      }
    });
  };

 
});
