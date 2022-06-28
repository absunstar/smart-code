app.controller('index_souq', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.getAdsList = function (ev, where) {
    $scope.busy = true;
    $scope.adsList = [];
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/ads/all',
        data: {
          where: where,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.adsList = response.data.list;
            $scope.adsList.forEach((ad) => {
              ad.like = $scope.user.feedback_list.some((_l) => _l.type && _l.ad && _l.type.id == 1 && _l.ad.id == ad.id);
              ad.favorite = $scope.user.feedback_list.some((_f) => _f.type && _f.ad && _f.type.id == 2 && _f.ad.id == ad.id);
            });
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.displayAd = function (id) {
    window.open(`/display_ad?id=${id}`, '_blank');
  };

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: '##user.id##',
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          $scope.user.ad_like_list = $scope.user.ad_like_list || [];
          $scope.user.ad_favorite_list = $scope.user.ad_favorite_list || [];
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

  $scope.bookList = function (ad, i) {
    $scope.error = '';
    $scope.user.cart.items = $scope.user.cart.items || [];
    let exist = false;

    $scope.user.cart.items.forEach((el) => {
      if (ad.id == el.id && el.select_quantity.unit.id == ad.quantity_list[i].unit.id) {
        exist = true;
        el.count += 1;
      }
    });

    if (!exist) {
      let obj = {
        id: ad.id,
        code: ad.code,
        image_url: ad.image_url,
        name_ar: ad.name_ar,
        name_en: ad.name_en,
        select_quantity: ad.quantity_list[i],
        count: 1,
      };
      $scope.user.cart.items.unshift(obj);
    }

    $scope.calc($scope.user);
  };

  $scope.calc = function (obj) {
    $scope.error = '';
    $timeout(() => {
      obj.cart.net_value = 0;
      if (obj.cart.items && obj.cart.items.length > 0) {
        obj.cart.items.forEach((_p) => {
          _p.total = _p.select_quantity.price * _p.count;
          obj.cart.net_value += _p.total;
        });
      }
      $http({
        method: 'POST',
        url: '/api/user/update',
        data: obj,
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
          } else {
            $scope.error = response.data.error;
          }
        },
        function (err) {
          $scope.getUser();
        }
      );
    }, 300);
  };

  $scope.updateComment = function (ad, type) {
    let data = { id: ad.id, feedback: { like: ad.like, favorite: ad.favorite, type: type } };

    $http({
      method: 'POST',
      url: '/api/ads/update_comment',
      data: data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getUser();
});
