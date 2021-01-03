app.controller("rogatory_types", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.rogatory_types = {};

  $scope.displayAddRogatoryTypes = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.rogatory_types = {
      image_url: '/images/rogatory_types.png',
      active: true
    };
    site.showModal('#rogatoryTypesAddModal');
  };

  $scope.addRogatoryTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#rogatoryTypesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/rogatory_types/add",
      data: $scope.rogatory_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryTypesAddModal');
          $scope.getRogatoryTypesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateRogatoryTypes = function (rogatory_types) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsRogatoryTypes(rogatory_types);
    $scope.rogatory_types = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#rogatoryTypesUpdateModal');
  };

  $scope.updateRogatoryTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#rogatoryTypesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/rogatory_types/update",
      data: $scope.rogatory_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryTypesUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsRogatoryTypes = function (rogatory_types) {
    $scope.error = '';
    $scope.detailsRogatoryTypes(rogatory_types);
    $scope.rogatory_types = {};
    site.showModal('#rogatoryTypesDetailsModal');
  };

  $scope.detailsRogatoryTypes = function (rogatory_types) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_types/view",
      data: {
        id: rogatory_types.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.rogatory_types = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRogatoryTypes = function (rogatory_types) {
    $scope.error = '';
    $scope.detailsRogatoryTypes(rogatory_types);
    $scope.rogatory_types = {};
    site.showModal('#rogatoryTypesDeleteModal');
  };

  $scope.deleteRogatoryTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_types/delete",
      data: {
        id: $scope.rogatory_types.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryTypesDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getRogatoryTypesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/rogatory_types/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getRogatoryTypesList($scope.search);
    site.hideModal('#rogatoryTypesSearchModal');
    $scope.search = {}

  };

  $scope.getRogatoryTypesList();

});