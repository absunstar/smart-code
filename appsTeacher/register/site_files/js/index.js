app.controller("register", function ($scope, $http, $timeout) {
  $scope.user = { image: "/images/user_logo.png" };
  $scope.setting = site.showObject(`##data.#setting##`);
  if(!$scope.setting.showParent) {
    $scope.user.type = 'student'
  }
  if(!$scope.setting.isOnline) {
    $scope.user.placeType = 'offline'

  }
  $scope.placeTypeSelect = function (type, e) {
    $scope.user.placeType = type;

    document.querySelectorAll("button").forEach((a) => {
      a.classList.remove("user-type-select");
    });

    let element = document.getElementById(type);
    element.classList.add("user-type-select");
  };

  $scope.typeSelect = function (type, e) {
    $scope.user.type = type;

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
    if ($scope.user.placeType == "offline") {
      if (!user.center || !user.center.id) {
        $scope.error = "##word.Must Enter Center##";
        return;
      }
    } else if ($scope.user.placeType == "online") {
      if (!user.nationalIdImage) {
        $scope.error = "##word.Must Enter NationalIdImage##";
        return;
      } else if (!user.nationalId) {
        $scope.error = "##word.Must Enter National ID##";
        return;
      } else if (!user.latitude || !user.longitude) {
        $scope.error = "##word.Must Select Location Information##";
        return;
      }
    }
    let obj = {
      $encript: "123",
      email: site.to123(user.email),
      password: site.to123(user.password),
      placeType: user.placeType,
      mobile: user.mobile,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      schoolYear: user.schoolYear,
      educationalLevel: user.educationalLevel,
      parentMobile: user.parentMobile,
      gender: user.gender,
      bitrhOfDate: user.bitrhOfDate,
      nationalIdImage: user.nationalIdImage,
      nationalId: user.nationalId,
      country: user.country,
      gov: user.gov,
      city: user.city,
      area: user.area,
      center: user.center,
      address: user.address,
      latitude: user.latitude,
      longitude: user.longitude,
      type: user.type,
    };

    if (user) {
      if (user.password === user.rePassword) {
        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/register",
          data: { user: obj, placeType: user.placeType },
        }).then(
          function (response) {
            if (response.data.error) {
              $scope.error = response.data.error;
              if (response.data.error.like("*enter a valid mobile*")) {
                $scope.error = "##word.please_enter_valid_mobile_number##";
              }
              $scope.busy = false;
            } else if (response.data.user) {
              if (user.placeType == "online") {
                site.showModal('#alert');
                $timeout(() => {
                  window.location.href = "/";
                }, 5000);
              } else {
                window.location.href = "/";
              }
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

  $scope.getCentersList = function () {
    if ($scope.user.schoolYear && $scope.user.schoolYear.id && $scope.user.educationalLevel && $scope.user.educationalLevel.id) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/centers/all",
        data: {
          where: {
            active: true,
            schoolYearId: $scope.user.schoolYear.id,
            educationalLevelId: $scope.user.educationalLevel.id,
          },
          view: true,
          select: {
            id: 1,
            name: 1,
            host: 1,
            educationalLevel: 1,
            schoolYear: 1,
          },
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.centersList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
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
          name: 1,
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
          name: 1,
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
          name: 1,
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
          name: 1,
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

  $scope.getEducationalLevelsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.educationalLevelsList = [];

    $http({
      method: "POST",
      url: "/api/educationalLevels/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.educationalLevelsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSchoolYearsList = function (educationalLevel) {
    $scope.busy = true;
    $scope.schoolYearsList = [];
    $http({
      method: "POST",
      url: "/api/schoolYears/all",
      data: {
        where: {
          active: true,
          "educationalLevel.id": educationalLevel.id,
        },
        select: {
          id: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.schoolYearsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGenders = function () {
    $scope.busy = true;
    $scope.gendersList = [];
    $http({
      method: "POST",
      url: "/api/genders",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.gendersList = response.data.list;
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

  $scope.getLocation = function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        $scope.user.latitude = position.coords.latitude;
        $scope.user.longitude = position.coords.longitude;
        $scope.$applyAsync();
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  $scope.getCountriesList();
  $scope.getEducationalLevelsList();
  $scope.getGenders();
});

site.onLoad(() => {
  setTimeout(() => {
    let btn1 = document.querySelector("#register .tab-link");
    if (btn1) {
      btn1.click();
    }
  }, 500);
});
