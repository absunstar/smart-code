app.controller("profileEdit", function ($scope, $http, $timeout) {
  $scope.displayUser = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/user/view",
      data: {
        id: site.toNumber("##params.id##"),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          $scope.user.startWorkTime = $scope.user.startWorkTime || new Date();
          $scope.user.endWorkTime = $scope.user.endWorkTime || new Date();
          document.querySelector(`#profileEdit .tab-link`).click();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getServicesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/services/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
          image: 1,
          price: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.servicesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addToServices = function () {
    if ($scope.user.$service && $scope.user.$service.id) {
      $scope.user.servicesList = $scope.user.servicesList || [];
      if (
        $scope.user.servicesList.some((s) => s.id === $scope.user.$service.id)
      ) {
        $scope.errorService = "##word.The Service Already Exists##";
      } else {
        $scope.user.servicesList.unshift({
          id: $scope.user.$service.id,
          image: $scope.user.$service.image,
          name: $scope.user.$service.name,
          price: $scope.user.$service.price,
        });
      }
      $scope.user.$service = {};
    }
    $timeout(() => {
      $scope.errorService = "";
    }, 2000);
  };

  $scope.getMyRequestConsultationsList = function () {
    $scope.myRequestConsultationsList = [];
    let where = {};
    if ("##user.type##" == "lawyer") {
      where["lawyer.id"] = site.toNumber("##user.id##");
      where["status.name"] = "pending";
    } else {
      where["user.id"] = site.toNumber("##user.id##");
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/requestConsultations/all",
      data: {
        where,
        select: {
          id: 1,
          name: 1,
          lawyer: 1,
          status: 1,
          typeConsultation: 1,
          consultationClassification: 1,
          user: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.myRequestConsultationsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getRequestConsultationsList = function () {
    $scope.requestConsultationsList = [];
    let where = {};
    where["status.name"] = "pending";
    where["lawyer.id"] = null;

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/requestConsultations/all",
      data: {
        where,
        select: {
          id: 1,
          name: 1,
          lawyer: 1,
          status: 1,
          typeConsultation: 1,
          consultationClassification: 1,
          user: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.requestConsultationsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCountriesList = function () {
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

  $scope.getSpecialtiesList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/specialties/all",
      data: {
        where: {
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
          $scope.specialtiesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.updateUser = function (user) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/update",
      data: user,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.showModal("#alert");
          $timeout(() => {
            site.hideModal("#alert");
          }, 1500);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.showPassword = function () {
    $timeout(() => {
      document.querySelectorAll(".pass input").forEach((p) => {
        p.setAttribute("type", $scope.showPassword ? "text" : "password");
      });
    }, 100);
  };

  $scope.displayUser();
  $scope.getCountriesList();
  $scope.getServicesList();
  $scope.getSpecialtiesList();
  $scope.getMyRequestConsultationsList();
  $scope.getRequestConsultationsList();
});
