app.controller('cart', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.cart = {};

  $scope.createOrder = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#orderCart');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.user.cart.items.length < 1) {
      $scope.error = '##word.products_must_added##';
      return;
    }
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/order/add',
      data: $scope.user.cart,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user.cart = {
            total: 0,
            fee_upon_receipt: 0,
            normal_delivery_fee: 0,
            fast_delivery_fee: 0,
            items: [],
          };
          site.showModal('#alert');
          $timeout(() => {
            site.hideModal('#alert');
          }, 1500);

          $scope.updateUser($scope.user);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.loadCartPayment = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/cart/order_payment/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.orderPaymentList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadCartDelivery = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/cart/order_delivery/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.orderDeliveryList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.calc = function (obj) {
    $scope.error = '';
    $timeout(() => {
      obj.cart.net_value = 0;
      if (obj.cart.payment_method && obj.cart.payment_method.id == 1 && $scope.defaultSettings.order_settings) {
        obj.cart.fee_upon_receipt = $scope.defaultSettings.order_settings.fee_upon_receipt;
      } else {
        obj.cart.fee_upon_receipt = 0;
      }

      /*    if (obj.cart.delivery_type) {
        if (obj.cart.delivery_type.id == 1) {
          obj.cart.normal_delivery_fee = $scope.souqSetting.normal_delivery_fee;
          obj.cart.fast_delivery_fee = 0;
        } else if (obj.cart.delivery_type.id == 2) {
          obj.cart.fast_delivery_fee = $scope.souqSetting.fast_delivery_fee;
          obj.cart.normal_delivery_fee = 0;
        }
      } else {
        obj.cart.normal_delivery_fee = 0;
        obj.cart.fast_delivery_fee = 0;
      }
 */
      let ex_rate = 1;
      if (obj.cart.currency && obj.cart.currency.ex_rate) {
        ex_rate = obj.cart.currency.ex_rate;
      }

      if (obj.cart.items && obj.cart.items.length > 0) {
        obj.cart.items.forEach((_p) => {
          _p.total = _p.select_quantity.price * _p.count;
          _p.total = site.toNumber(_p.total);
          let total = _p.total * _p.select_quantity.currency.ex_rate;
          obj.cart.net_value += total / ex_rate;
          obj.cart.net_value = site.toNumber(obj.cart.net_value);
        });
      }

      obj.cart.paid_require = obj.cart.net_value + obj.cart.fee_upon_receipt;
      obj.cart.paid_require = site.toNumber(obj.cart.paid_require);

      $scope.updateUser(obj);
    }, 250);
  };

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: site.toNumber('##user.id##'),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          if (!$scope.user.cart) {
            $scope.user.cart = {
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
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/update',
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

  $scope.getCurrenciesList = function () {
    $scope.busy = true;
    $scope.currenciesList = [];
    $http({
      method: 'POST',
      url: '/api/currency/all',
      data: {
        where: { active: true },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.currenciesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getUser();
  $scope.getCurrenciesList();
  $scope.loadCartPayment();
  $scope.loadCartDelivery();
  $scope.getDefaultSetting();
});
