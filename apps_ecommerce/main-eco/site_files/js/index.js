app.controller("main_eco", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.purchase_order = { total: 0 };

  $scope.createOrder = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    if ($scope.purchase_order.product_list.length < 1) {
      $scope.error = "##word.products_must_added##";
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order_eco/add",
      data: $scope.purchase_order,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#purchasesModal");
          $scope.purchase_order = { total: 0 };
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like("*duplicate key error*")) {
            $scope.error = "##word.code_exisit##";
          } else if (response.data.error.like("*Please write code*")) {
            $scope.error = "##word.enter_code_inventory##";
          } else if (response.data.error.like("*Must Enter Code*")) {
            $scope.error = "##word.must_enter_code##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

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
          name_ar: 1,
          name_en: 1,
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
            name_ar: "الأكثر مبيعا",
            name_en: "Best seller",
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
        where: { products_group: group },
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
    $scope.purchase_order.product_list =
      $scope.purchase_order.product_list || [];
    let exist = false;

    $scope.purchase_order.product_list.forEach((el) => {
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
        name_ar: product.name_ar,
        name_en: product.name_en,
        product_group: product.product_group,
        price: product.price,
        count: 1,
      };
      $scope.purchase_order.product_list.unshift(obj);
    }
    $scope.calc($scope.purchase_order);
  };

  $scope.calc = function (obj) {
    $scope.error = "";
    $timeout(() => {
      obj.total = 0;
      if (obj.product_list && obj.product_list.length > 0) {
        obj.product_list.forEach((_p) => {
          _p.total = _p.price * _p.count;
          obj.total += _p.total;
        });
      }
    }, 250);
  };

  $scope.loadProductsGroups();
});
