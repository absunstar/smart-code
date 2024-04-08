app.controller("register", function ($scope, $http, $timeout) {
  $scope.user = { image: "/images/user_logo.png" };

  $scope.typeSelect = function (type, e) {
    $scope.type = type;

    document.querySelectorAll("button").forEach((a) => {
      a.classList.remove("user-type-select");
    });

    let element = document.getElementById(type);
    element.classList.add("user-type-select");
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
      image: user.image,
      country: user.country,
      gov: user.gov,
      city: user.city,
      area: user.area,
    };

    obj.country_code = user.country.country_code;
    obj.length_mobile = user.country.length_mobile;

    if (user) {
      if (user.password === user.rePassword) {
        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/register",
          data: { user: obj, type: $scope.type },
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
          image: 1,
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
          image: 1,
          callingCode: 1,
          lengthMobile: 1,
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
