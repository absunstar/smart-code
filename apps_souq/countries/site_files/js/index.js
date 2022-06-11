app.controller("countries", function ($scope, $http, $timeout) {

  $scope.countries = {};

  $scope.displayAddCountries = function () {
    $scope.error = '';
    $scope.countries = {
      image_url: '/images/countries.png',
      active: true

    };

    site.showModal('#countriesAddModal');

  };

  $scope.addCountries = function () {
    $scope.error = '';
    const v = site.validated('#countriesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/countries/add",
      data: $scope.countries
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#countriesAddModal');
          $scope.getCountriesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateCountries = function (countries) {
    $scope.error = '';
    $scope.viewCountries(countries);
    $scope.countries = {};
    site.showModal('#countriesUpdateModal');
  };

  $scope.updateCountries = function () {
    $scope.error = '';
    const v = site.validated('#countriesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/countries/update",
      data: $scope.countries
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#countriesUpdateModal');
          $scope.getCountriesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCountries = function (countries) {
    $scope.error = '';
    $scope.viewCountries(countries);
    $scope.countries = {};
    site.showModal('#countriesViewModal');
  };

  $scope.viewCountries = function (countries) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/countries/view",
      data: {
        id: countries.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.countries = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteCountries = function (countries) {
    $scope.error = '';
    $scope.viewCountries(countries);
    $scope.countries = {};
    site.showModal('#countriesDeleteModal');
  };

  $scope.deleteCountries = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/countries/delete",
      data: {
        id: $scope.countries.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#countriesDeleteModal');
          $scope.getCountriesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCountriesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/countries/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#countriesSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "countries"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#countriesSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getCountriesList($scope.search);
    site.hideModal('#countriesSearchModal');
    $scope.search = {};
  };

  $scope.getCountriesList();
  $scope.getNumberingAuto();
});