app.controller("drinks", function ($scope, $http, $timeout) {

  $scope.drinks = {};

  $scope.displayAddDrinks = function () {
    $scope.error = '';
    $scope.drinks = {
      image_url: '/images/drinks.png',
      active: true

    };

    site.showModal('#drinksAddModal');

  };

  $scope.addDrinks = function () {
    $scope.error = '';
    const v = site.validated('#drinksAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/drinks/add",
      data: $scope.drinks
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#drinksAddModal');
          $scope.getDrinksList();
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

  $scope.displayUpdateDrinks = function (drinks) {
    $scope.error = '';
    $scope.viewDrinks(drinks);
    $scope.drinks = {};
    site.showModal('#drinksUpdateModal');
  };

  $scope.updateDrinks = function () {
    $scope.error = '';
    const v = site.validated('#drinksUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/drinks/update",
      data: $scope.drinks
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#drinksUpdateModal');
          $scope.getDrinksList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsDrinks = function (drinks) {
    $scope.error = '';
    $scope.viewDrinks(drinks);
    $scope.drinks = {};
    site.showModal('#drinksViewModal');
  };

  $scope.viewDrinks = function (drinks) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/drinks/view",
      data: {
        id: drinks.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.drinks = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteDrinks = function (drinks) {
    $scope.error = '';
    $scope.viewDrinks(drinks);
    $scope.drinks = {};
    site.showModal('#drinksDeleteModal');
  };

  $scope.deleteDrinks = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/drinks/delete",
      data: {
        id: $scope.drinks.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#drinksDeleteModal');
          $scope.getDrinksList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDrinksList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/drinks/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#drinksSearchModal');
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
        screen: "drinks"
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
    site.showModal('#drinksSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getDrinksList($scope.search);
    site.hideModal('#drinksSearchModal');
    $scope.search = {};
  };

  $scope.getDrinksList();
  $scope.getNumberingAuto();
});