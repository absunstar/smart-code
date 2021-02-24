app.controller("nationalities", function ($scope, $http, $timeout) {

  $scope.nationalities = {};

  $scope.displayAddNationalities = function () {
    $scope.error = '';
    $scope.nationalities = {
      image_url: '/images/nationalities.png',
      active: true

    };

    site.showModal('#nationalitiesAddModal');

  };

  $scope.addNationalities = function () {
    $scope.error = '';
    const v = site.validated('#nationalitiesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/nationalities/add",
      data: $scope.nationalities
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#nationalitiesAddModal');
          $scope.getNationalitiesList();
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

  $scope.displayUpdateNationalities = function (nationalities) {
    $scope.error = '';
    $scope.viewNationalities(nationalities);
    $scope.nationalities = {};
    site.showModal('#nationalitiesUpdateModal');
  };

  $scope.updateNationalities = function () {
    $scope.error = '';
    const v = site.validated('#nationalitiesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/nationalities/update",
      data: $scope.nationalities
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#nationalitiesUpdateModal');
          $scope.getNationalitiesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsNationalities = function (nationalities) {
    $scope.error = '';
    $scope.viewNationalities(nationalities);
    $scope.nationalities = {};
    site.showModal('#nationalitiesViewModal');
  };

  $scope.viewNationalities = function (nationalities) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/nationalities/view",
      data: {
        id: nationalities.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.nationalities = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteNationalities = function (nationalities) {
    $scope.error = '';
    $scope.viewNationalities(nationalities);
    $scope.nationalities = {};
    site.showModal('#nationalitiesDeleteModal');
  };

  $scope.deleteNationalities = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/nationalities/delete",
      data: {
        id: $scope.nationalities.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#nationalitiesDeleteModal');
          $scope.getNationalitiesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getNationalitiesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/nationalities/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#nationalitiesSearchModal');
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
        screen: "nationalities"
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
    site.showModal('#nationalitiesSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getNationalitiesList($scope.search);
    site.hideModal('#nationalitiesSearchModal');
    $scope.search = {};
  };

  $scope.getNationalitiesList();
  $scope.getNumberingAuto();
});