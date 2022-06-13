app.controller('shops', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.shop = {};

  $scope.displayAddShop = function () {
    $scope.error = '';
    $scope.shop = {
      image_url: '/images/shops.png',
      active: true,
    };
    site.showModal('#shopAddModal');
  };

  $scope.addShop = function () {
    $scope.error = '';
    const v = site.validated('#shopAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/shops/add',
      data: $scope.shop,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shopAddModal');
          $scope.getShopList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          } else if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = '##word.err_maximum_adds##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateShop = function (shop) {
    $scope.error = '';
    $scope.viewShop(shop);
    $scope.shop = {};
    site.showModal('#shopUpdateModal');
  };

  $scope.updateShop = function () {
    $scope.error = '';
    const v = site.validated('#shopUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/shops/update',
      data: $scope.shop,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shopUpdateModal');
          $scope.getShopList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsShop = function (shop) {
    $scope.error = '';
    $scope.viewShop(shop);
    $scope.shop = {};
    site.showModal('#shopViewModal');
  };

  $scope.viewShop = function (shop) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/shops/view',
      data: {
        id: shop.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.shop = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteShop = function (shop) {
    $scope.error = '';

    $scope.viewShop(shop);
    $scope.shop = {};
    site.showModal('#shopDeleteModal');
  };

  $scope.deleteShop = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/shops/delete',
      data: {
        id: $scope.shop.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shopDeleteModal');
          $scope.getShopList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
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

  $scope.getShopList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/shops/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#shopSearchModal');
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
        screen: 'shops',
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
    site.showModal('#shopSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getShopList($scope.search);
    site.hideModal('#shopSearchModal');
    $scope.search = {};
  };

  $scope.getCommentsTypesList = function (where) {
    $scope.busy = true;
    $scope.commentsTypesList = [];
    $http({
      method: "POST",
      url: "/api/comments_types/all",
      data: {
        where: {active:true}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.commentsTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.addImage = function () {
    $scope.error = '';
    $scope.shop.images_list = $scope.shop.images_list || [];
    $scope.shop.images_list.push({});
  };

  $scope.addComments = function () {
    $scope.error = '';
    $scope.shop.comments_list = $scope.shop.comments_list || [];
    $scope.shop.comments_list.push({});
  };

  $scope.getShopList();
  $scope.getNumberingAuto();
  $scope.getDefaultSetting();
  $scope.getCommentsTypesList();
});
