app.controller("adjectives", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.adjectives = {};

  $scope.displayAddAdjectives = function () {
    $scope.error = '';
    $scope.adjectives = {
      image_url: '/images/adjectives.png',
      active: true
    };
    site.showModal('#adjectivesAddModal');
  };

  $scope.addAdjectives = function () {
    $scope.error = '';
    const v = site.validated('#adjectivesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/adjectives/add",
      data: $scope.adjectives
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#adjectivesAddModal');
          $scope.getAdjectivesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateAdjectives = function (adjectives) {
    $scope.error = '';
    $scope.viewAdjectives(adjectives);
    $scope.adjectives = {};
    site.showModal('#adjectivesUpdateModal');
  };

  $scope.updateAdjectives = function () {
    $scope.error = '';
    const v = site.validated('#adjectivesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/adjectives/update",
      data: $scope.adjectives
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#adjectivesUpdateModal');
          $scope.getAdjectivesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAdjectives = function (adjectives) {
    $scope.error = '';
    $scope.viewAdjectives(adjectives);
    $scope.adjectives = {};
    site.showModal('#adjectivesViewModal');
  };

  $scope.viewAdjectives = function (adjectives) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/adjectives/view",
      data: {
        id: adjectives.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.adjectives = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAdjectives = function (adjectives) {
    $scope.error = '';
    $scope.viewAdjectives(adjectives);
    $scope.adjectives = {};
    site.showModal('#adjectivesDeleteModal');
  };

  $scope.deleteAdjectives = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/adjectives/delete",
      data: {
        id: $scope.adjectives.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#adjectivesDeleteModal');
          $scope.getAdjectivesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAdjectivesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/adjectives/all",
      data: {
        where: where,
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#adjectivesSearchModal');
          $scope.search = {};

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
    site.showModal('#adjectivesSearchModal');

  };

  $scope.searchAll = function () {
  
    $scope.getAdjectivesList($scope.search);
    site.hideModal('#adjectivesSearchModal');
    $scope.search = {};
  };

  $scope.getAdjectivesList();

});