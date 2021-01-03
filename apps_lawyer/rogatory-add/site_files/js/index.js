app.controller("rogatory_add", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.rogatory_add = {};

  $scope.displayAddRogatoryAdd = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.rogatory_add = {
      image_url: '/images/rogatory_add.png',
      active: true,
      date: new Date()
    };
    site.showModal('#rogatoryAddAddModal');
  };

  $scope.addRogatoryAdd = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#rogatoryAddAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/rogatory_add/add",
      data: $scope.rogatory_add
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryAddAddModal');
          $scope.getRogatoryAddList();
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

  $scope.displayUpdateRogatoryAdd = function (rogatory_add) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsRogatoryAdd(rogatory_add);
    $scope.rogatory_add = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#rogatoryAddUpdateModal');
  };

  $scope.updateRogatoryAdd = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#rogatoryAddUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_add/update",
      data: $scope.rogatory_add
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryAddUpdateModal');
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

  $scope.displayDetailsRogatoryAdd = function (rogatory_add) {
    $scope.error = '';
    $scope.detailsRogatoryAdd(rogatory_add);
    $scope.rogatory_add = {};
    site.showModal('#rogatoryAddDetailsModal');
  };

  $scope.detailsRogatoryAdd = function (rogatory_add) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_add/view",
      data: {
        id: rogatory_add.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.rogatory_add = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRogatoryAdd = function (rogatory_add) {
    $scope.error = '';
    $scope.detailsRogatoryAdd(rogatory_add);
    $scope.rogatory_add = {};
    site.showModal('#rogatoryAddDeleteModal');
  };

  $scope.deleteRogatoryAdd = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_add/delete",
      data: {
        id: $scope.rogatory_add.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryAddDeleteModal');
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

  $scope.getRogatoryAddList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/rogatory_add/all",
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
    $scope.getRogatoryAddList($scope.search);
    site.hideModal('#rogatoryAddSearchModal');
    $scope.search = {}

  };

  $scope.loadRogatoryPlace = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_places/all",
      data: {
        select: { id: 1, name: 1, description: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.rogatoryPlaceList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadRogatoryTypeList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_types/all",
      data: {
        select: { id: 1, name: 1, description: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.rogatoryTypeList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getRogatoryAddList();
  $scope.loadRogatoryPlace();
  $scope.loadRogatoryTypeList();
});