app.controller('index_souq', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.search = {};
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

          if (!$scope.user.cart) {
            $scope.user.cart = {
              total: 0,
              fee_upon_receipt: 0,
              normal_delivery_fee: 0,
              fast_delivery_fee: 0,
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

    $scope.updateCart($scope.user);
  };

  $scope.updateCart = function (obj) {
    $scope.error = '';

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
  };

  $scope.updateFeedback = function (ad, type) {
    let data = { id: ad.id, feedback: { like: ad.like, favorite: ad.favorite, type: type } };

    $http({
      method: 'POST',
      url: '/api/ads/update_feedback',
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

  $scope.loadMainCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.mainCategories = [];
    $http({
      method: 'POST',
      url: '/api/main_categories/all',
      data: {
        where: {
          status: 'active',
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_list = response.data.list;
          $scope.topParentCategoriesList = [];
          $scope.category_list.forEach((_c) => {
            if (!_c.top_parent_id) {
              $scope.topParentCategoriesList.push(_c);
            }
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadSubCategory = function (c) {
    $scope.error = '';
    $scope.search.category_id = c.id;
    $scope.searchAll($scope.search);
    $scope.subCategoriesList = [];
    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList.push(_c);
      }
    });
    $scope.getAdsList({ which: 13 }, $scope.search);
  };

  $scope.loadSubCategory2 = function (c) {
    $scope.error = '';
    $scope.search.category_id = c.id;
    $scope.searchAll($scope.search);
    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList2.push(_c);
      }
    });
    $scope.getAdsList({ which: 13 }, $scope.search);
  };

  $scope.loadSubCategory3 = function (c) {
    $scope.error = '';
    $scope.search.category_id = c.id;
    $scope.searchAll($scope.search);
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList3.push(_c);
      }
    });
    $scope.getAdsList({ which: 13 }, $scope.search);
  };

  $scope.loadSubCategory4 = function (c) {
    $scope.error = '';
    $scope.search.category_id = c.id;

    $scope.searchAll($scope.search);
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList4.push(_c);
      }
    });
    $scope.getAdsList({ which: 13 }, $scope.search);
  };
  $scope.displayAdvancedSearch = function () {
    $scope.error = '';
    site.showModal('#adAdvancedSearchModal');
  };

  $scope.changeLang = function (lang) {
    $http({
      method: 'POST',
      url: '/x-language/change',
      data: { name: lang },
    }).then(function (response) {
      if (response.data.done) {
        window.location.reload(true);
      }
    });
  };

  $scope.searchAll = function (search) {
    $scope.error = '';

    site.hideModal('#adAdvancedSearchModal');
    $scope.getAdsList({ which: 13 }, search);
  };
  $scope.loadMainCategories();
  $scope.getAdsList({ which: 13 }, {});
  $scope.getUser();
});
