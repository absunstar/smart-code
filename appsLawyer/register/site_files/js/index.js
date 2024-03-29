app.controller("register", function ($scope, $http, $timeout) {
  $scope.user = { imageUrl: "/images/user_logo.png" };
  $scope.type = "client";

  $scope.showTab = function (event, selector) {
    if (selector == "#registerClient") {
      $scope.type = "client";
    } else if (selector == "#registerLawyer") {
      $scope.type = "lawyer";
    }
  };

  $scope.register = function (user) {
    $scope.error = "";
    const v = site.validated("#emailData");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    let obj = {
      $encript: "123",
      email: site.to123(user.email),
      password: site.to123(user.password),
      mobile: user.mobile,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      country: user.country,
      gov: user.gov,
      city: user.city,
      area: user.area,
    };

    obj.country_code = user.country.country_code;
    obj.length_mobile = user.country.length_mobile;

    if (user) {
      if (user.password === user.re_password) {
        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/register",
          data: {user :obj,type :$scope.type},
        }).then(
          function (response) {
            if (response.data.error) {
              $scope.error = response.data.error;
              if (response.data.error.like("*enter a valid mobile*")) {
                $scope.error = "##word.please_enter_valid_mobile_number##";
              }
              $scope.busy = false;
            } else if (response.data.user) {

              window.location.href = "/";
            }
          },
          function (err) {
            $scope.busy = false;
            $scope.error = err;
          }
        );
      } else {
        $scope.error = "##word.Password Not Match##";
      }
    }
  };
 $scope.getOfficesList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/offices/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          nameAr: 1,
          nameEn: 1,
          imageUrl: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.countriesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getCountriesList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/countries/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          nameAr: 1,
          nameEn: 1,
          imageUrl: 1,
          country_code: 1,
          length_mobile: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.countriesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getGovesList = function (country) {
    $scope.busy = true;
    $scope.govesList = [];

    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true,
          "country.id": country.id,
        },
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCitiesList = function (gov) {
    $scope.busy = true;
    $scope.citiesList = [];
    $http({
      method: "POST",
      url: "/api/cities/all",
      data: {
        where: {
          "gov.id": gov.id,
          active: true,
        },
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.citiesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAreasList = function (city) {
    $scope.busy = true;
    $scope.areasList = [];
    $http({
      method: "POST",
      url: "/api/areas/all",
      data: {
        where: {
          "city.id": city.id,
          active: true,
        },
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areasList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.showPassword = function () {
    $timeout(() => {
      document.querySelectorAll(".pass input").forEach((p) => {
        p.setAttribute("type", $scope.show_password ? "text" : "password");
      });
    }, 100);
  };
  $scope.getCountriesList();
});

site.onLoad(() => {
  setTimeout(() => {
    let btn1 = document.querySelector("#register .tab-link");
    if (btn1) {
      btn1.click();
    }
  }, 500);
});
