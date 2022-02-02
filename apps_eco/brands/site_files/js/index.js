app.controller("brands", function ($scope, $http, $timeout) {

  $scope.brands = {};

  $scope.displayAddBrands = function () {
    $scope.error = '';
    $scope.brands = {
      image_url: '/images/brands.png',
      active: true
    };

    site.showModal('#brandsAddModal');

  };

  $scope.addBrands = function () {
    $scope.error = '';
    const v = site.validated('#brandsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/brands/add",
      data: $scope.brands
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#brandsAddModal');
          $scope.getBrandsList();
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

  $scope.displayUpdateBrands = function (brands) {
    $scope.error = '';
    $scope.viewBrands(brands);
    $scope.brands = {};
    site.showModal('#brandsUpdateModal');
  };

  $scope.updateBrands = function () {
    $scope.error = '';
    const v = site.validated('#brandsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/brands/update",
      data: $scope.brands
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#brandsUpdateModal');
          $scope.getBrandsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsBrands = function (brands) {
    $scope.error = '';
    $scope.viewBrands(brands);
    $scope.brands = {};
    site.showModal('#brandsViewModal');
  };

  $scope.viewBrands = function (brands) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/brands/view",
      data: {
        id: brands.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.brands = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteBrands = function (brands) {
    $scope.error = '';
    $scope.viewBrands(brands);
    $scope.brands = {};
    site.showModal('#brandsDeleteModal');
  };

  $scope.deleteBrands = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/brands/delete",
      data: {
        id: $scope.brands.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#brandsDeleteModal');
          $scope.getBrandsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getBrandsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/brands/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#brandsSearchModal');
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
        screen: "brands"
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
    site.showModal('#brandsSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getBrandsList($scope.search);
    site.hideModal('#brandsSearchModal');
    $scope.search = {};
  };

  $scope.getBrandsList();
  $scope.getNumberingAuto();
});