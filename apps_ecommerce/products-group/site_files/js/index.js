app.controller("products_group", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.products_group = {};

  $scope.displayAddProductsGroup = function () {
    $scope.error = '';
    $scope.products_group = {
      image_url: '/images/products_group.png',
      active: true ,
    };
    site.showModal('#productsGroupAddModal');

  };

  $scope.addProductsGroup = function () {
    $scope.error = '';
    const v = site.validated('#productsGroupAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/products_group/add",
      data: $scope.products_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productsGroupAddModal');
          $scope.getProductsGroupList();
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

  $scope.displayUpdateProductsGroup = function (Products_group) {
    $scope.error = '';
    $scope.viewProductsGroup(Products_group);
    $scope.products_group = {};
    site.showModal('#productsGroupUpdateModal');
  };

  $scope.updateProductsGroup = function () {
    $scope.error = '';
    const v = site.validated('#productsGroupUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/products_group/update",
      data: $scope.products_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productsGroupUpdateModal');
          $scope.getProductsGroupList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsProductsGroup = function (Products_group) {
    $scope.error = '';
    $scope.viewProductsGroup(Products_group);
    $scope.products_group = {};
    site.showModal('#productsGroupViewModal');
  };

  $scope.viewProductsGroup = function (Products_group) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/products_group/view",
      data: {
        id: Products_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.products_group = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteProductsGroup = function (Products_group) {
    $scope.error = '';
    $scope.viewProductsGroup(Products_group);
    $scope.products_group = {};
    site.showModal('#productsGroupDeleteModal');

  };

  $scope.deleteProductsGroup = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/products_group/delete",
      data: {
        id: $scope.products_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productsGroupDeleteModal');
          $scope.getProductsGroupList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.loadItemsGroups = function () {
    $scope.busy = true;
    $scope.itemsGroupList = [];
    $http({
        method: 'POST',
        url: '/api/items_group/all',
        data: {
            select: {
                id: 1,
                name_ar: 1,
                name_en: 1,
                code: 1,
            },
        },
    }).then(
        function (response) {
            $scope.busy = false;
            if (response.data.done) {
                $scope.itemsGroupList = response.data.list;
            }
        },
        function (err) {
            $scope.busy = false;
            $scope.error = err;
        },
    );
};

  $scope.getProductsGroupList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/products_group/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#productsGroupSearchModal');
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
        screen: "Products_groups"
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
    site.showModal('#productsGroupSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getProductsGroupList($scope.search);
    site.hideModal('#productsGroupSearchModal');
    $scope.search = {};

  };

  $scope.getProductsGroupList();
  $scope.getNumberingAuto();
  $scope.loadItemsGroups();
});