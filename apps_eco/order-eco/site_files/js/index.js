app.controller("order_eco", function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.order_eco = {};

  $scope.createOrder = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = "";

    if ($scope.user.eco_order.items.length < 1) {
      $scope.error = "##word.products_must_added##";
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order_eco/add",
      data: $scope.user.eco_order,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user.eco_order = {
            total: 0,
            fee_upon_receipt: 0,
            normal_delivery_fee: 0,
            fast_delivery_fee: 0,
            items: [],
          };
          $scope.updateUser($scope.user);
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

  $scope.loadEcoPayment = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/eco_payment/all",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.ecoPaymentList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadEcoDelivery = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/eco_delivery/all",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.ecoDeliveryList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.calc = function (obj) {
    $scope.error = "";
    $timeout(() => {
      obj.eco_order.net_value = 0;
      if (
        obj.eco_order.pay_method_eco &&
        obj.eco_order.pay_method_eco.id == 1
      ) {
        obj.eco_order.fee_upon_receipt = $scope.ecoSetting.fee_upon_receipt;
      } else {
        obj.eco_order.fee_upon_receipt = 0;
      }

      if (obj.eco_order.delivery_type) {
        if (obj.eco_order.delivery_type.id == 1) {
          obj.eco_order.normal_delivery_fee =
            $scope.ecoSetting.normal_delivery_fee;
          obj.eco_order.fast_delivery_fee = 0;
        } else if (obj.eco_order.delivery_type.id == 2) {
          obj.eco_order.fast_delivery_fee = $scope.ecoSetting.fast_delivery_fee;
          obj.eco_order.normal_delivery_fee = 0;
        }
      } else {
        obj.eco_order.normal_delivery_fee = 0;
        obj.eco_order.fast_delivery_fee = 0;
      }

      if (obj.eco_order.items && obj.eco_order.items.length > 0) {
        obj.eco_order.items.forEach((_p) => {
          _p.total = _p.price * _p.count;
          obj.eco_order.net_value += _p.total;
        });
      }

      obj.eco_order.paid_require =
        obj.eco_order.net_value +
        obj.eco_order.normal_delivery_fee +
        obj.eco_order.fast_delivery_fee +
        obj.eco_order.fee_upon_receipt;

      $scope.updateUser(obj);
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
              fee_upon_receipt: 0,
              normal_delivery_fee: 0,
              fast_delivery_fee: 0,
              items: [],
            };
          } else {
            $scope.calc($scope.user);
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

  $scope.getEcoSetting = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/eco_setting/get",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.ecoSetting = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getUser();
  $scope.loadEcoPayment();
  $scope.loadEcoDelivery();
  $scope.getEcoSetting();
});
