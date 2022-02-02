app.controller('products', function ($scope, $http, $timeout) {
  $scope.product = {};

  $scope.displayAddFoods = function () {
    $scope.error = '';
    $scope.product = {
      image_url: '/images/products.png',
      images_list : [''],
      active: true,
    };

    site.showModal('#productsAddModal');
  };

   $scope.deleteImage = function (i) {
    $scope.error = '';
    $scope.product.images_list.splice(i, 1);
    console.log(i);
  };
 
  $scope.addFoods = function () {
    $scope.error = '';
    const v = site.validated('#productsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/products/add',
      data: $scope.product,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productsAddModal');
          $scope.getFoodsList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateFoods = function (products) {
    $scope.error = '';
    $scope.viewFoods(products);
    $scope.product = {};
    site.showModal('#productsUpdateModal');
  };

  $scope.updateFoods = function () {
    $scope.error = '';
    const v = site.validated('#productsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/products/update',
      data: $scope.product,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productsUpdateModal');
          $scope.getFoodsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsFoods = function (products) {
    $scope.error = '';
    $scope.viewFoods(products);
    $scope.product = {};
    site.showModal('#productsViewModal');
  };

  $scope.viewFoods = function (products) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/products/view',
      data: {
        id: products.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.product = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayDeleteFoods = function (products) {
    $scope.error = '';
    $scope.viewFoods(products);
    $scope.product = {};
    site.showModal('#productsDeleteModal');
  };

  $scope.deleteFoods = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/products/delete',
      data: {
        id: $scope.product.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productsDeleteModal');
          $scope.getFoodsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getFoodsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/products/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#productsSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'products',
      },
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
    );
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#productsSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getFoodsList($scope.search);
    site.hideModal('#productsSearchModal');
    $scope.search = {};
  };

  $scope.getProductGroupList = function () {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/products_group/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.productsGroupsList = response.data.list;
          site.hideModal('#productGroupSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getFoodsList();
  $scope.getProductGroupList();
  $scope.getNumberingAuto();
});
