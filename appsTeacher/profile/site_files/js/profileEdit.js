app.controller("profileEdit", function ($scope, $http, $timeout) {
  $scope.baseURL = "";

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

  $scope.getPackages = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/packages/all`,
      data: {
        type: 'myStudent',
        select: {
          id: 1,
          name: 1,
          image: 1,
          educationalLevel: 1,
          schoolYear: 1,
          price: 1,
          totalLecturesPrice: 1,
          date: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.packagesList = response.data.list;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getLectures = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/lectures/all`,
      data: {
        type: 'myStudent',
        select: {
          id: 1,
          name: 1,
          image: 1,
          educationalLevel: 1,
          schoolYear: 1,
          price: 1,
          date: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.lecturesList = response.data.list;
          console.log($scope.lecturesList);

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getLectures();
  $scope.getPackages();
  $scope.displayUser();
  $scope.getCountriesList();
});
