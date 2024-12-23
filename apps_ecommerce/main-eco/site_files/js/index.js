app.controller("main_eco", function ($scope, $http, $timeout) {
  $scope._search = {};


  $scope.loadProductsGroups = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.productGroupList = [];

    $http({
      method: "POST",
      url: "/api/product_group/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1,
          name_En: 1,
          image_url: 1,
          color: 1,
          code: 1,
        },
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.productGroupList = response.data.list;
          /*   $scope.productGroupList.unshift({
            id: 0,
            name_Ar: "الأكثر مبيعا",
            name_En: "Best seller",
            color: "#F0F8FF",
            type: "all",
          }); */
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadProducts = function (group) {
    $scope.error = "";

    $scope.busy = true;
    $scope.productList = [];
    $http({
      method: "POST",
      url: "/api/product/all",
      data: {
        where: { product_group: group },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.productList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.bookList = function (product) {
    $scope.error = "";
    $scope.user.eco_order.items = $scope.user.eco_order.items || [];
    let exist = false;

    $scope.user.eco_order.items.forEach((el) => {
      if (product.id == el.id) {
        exist = true;
        el.count += 1;
      }
    });

    if (!exist) {
      let obj = {
        id: product.id,
        code: product.code,
        image_url: product.image_url,
        name_Ar: product.name_Ar,
        name_En: product.name_En,
        product_group: product.product_group,
        price: product.price,
        count: 1,
      };
      $scope.user.eco_order.items.unshift(obj);
    }
    $scope.calc($scope.user);
  };

  $scope.calc = function (obj) {
    $scope.error = "";
    $timeout(() => {
      obj.eco_order.net_value = 0;
      if (obj.eco_order.items && obj.eco_order.items.length > 0) {
        obj.eco_order.items.forEach((_p) => {
          _p.total = _p.price * _p.count;
          obj.eco_order.net_value += _p.total;
        });
      }
      $scope.updateUser(obj)
    }, 250);
  };

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/view",
      data: {
        id: "##user.id##",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          if (!$scope.user.eco_order) {
            $scope.user.eco_order = {
              total: 0,
              fee_upon_receipt : 0,
              normal_delivery_fee : 0,
              fast_delivery_fee : 0,
              items: [],
            };
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.updateUser = function (user) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/update",
      data: user,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.loadProductsGroups();
  $scope.getUser();
});
