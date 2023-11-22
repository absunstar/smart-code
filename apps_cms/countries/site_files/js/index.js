app.controller("countries", function ($scope, $http, $timeout) {

  $scope.mode = 'add';
  $scope.countries = {};
  $scope.defaultSettings = site.showObject(`##data.#setting##`);

  $scope.displayAddCountries = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.countries = {
      image: '/images/countries.png',
      active: true,
      translatedList : []
    };
    $scope.defaultSettings.languagesList.forEach((l) => {
      if (l.active == true) {
        $scope.countries.translatedList.push({
          language: {
            id: l.id,
            en: l.en,
            ar: l.ar,
          },
        });
      }
    });

    site.showModal('#countriesManageModal');

  };

  $scope.addCountries = function () {
    $scope.error = '';
    const v = site.validated('#countriesManageModal');
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
          site.hideModal('#countriesManageModal');
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

  $scope.displayUpdateCountries = function (countries) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewCountries(countries);
    $scope.countries = {};
    site.showModal('#countriesManageModal');
  };

  $scope.updateCountries = function () {
    $scope.error = '';
    const v = site.validated('#countriesManageModal');
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
          site.hideModal('#countriesManageModal');
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
    $scope.mode = 'view';
    $scope.viewCountries(countries);
    $scope.countries = {};
    site.showModal('#countriesManageModal');
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
    $scope.mode = 'delete';
    $scope.viewCountries(countries);
    $scope.countries = {};
    site.showModal('#countriesManageModal');
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
          site.hideModal('#countriesManageModal');
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
        where: where,
        search : $scope.$search,
        select : {
          id :1 , name : 1 , active : 1 ,image : 1
        }
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

  $scope.addKeyWords = function (ev, obj) {
    $scope.error = '';

    if (ev.which !== 13 || !obj.$keyword) {
      return;
    }
    obj.keyWordsList = obj.keyWordsList || [];
    if (!obj.keyWordsList.some((k) => k === obj.$keyword)) {
      obj.keyWordsList.push(obj.$keyword);
    }

    obj.$keyword = '';
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#countriesSearchModal');

  };

  $scope.smartSearch = function () {
    $timeout(() => {
      $scope.getCountriesList();
    }, 200);
  };

  $scope.searchAll = function () {

    $scope.getCountriesList($scope.search);
    site.hideModal('#countriesSearchModal');
    $scope.search = {};
  };

  $scope.getCountriesList();
});