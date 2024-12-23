app.controller('haraj', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.search = {};
  $scope.getAdsList = function (ev, where) {
    $scope.busy = true;
    $scope.contentList = [];
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/contents/all',
        data: {
          where: where,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.contentList = response.data.list;
            $scope.contentList.forEach((ad) => {
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

  $scope.displayContent = function (id) {
    window.open(`/display-content?id=${id}`, '_blank');
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
        name_Ar: ad.name_Ar,
        name_En: ad.name_En,
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
      url: '/api/contents/update_feedback',
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
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_list = response.data.list;
          $scope.category_list.forEach((l) => {
            $scope.mainCategories.push({
              id: l.id,
              name_Ar: l.name_Ar,
              idname_en: l.idname_en,
            });
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displayAdvancedSearch = function () {
    $scope.error = '';
    site.showModal('#adAdvancedSearchModal');
  };

  $scope.loadSubCategory1 = function (c) {
    $scope.error = '';
    $scope.search.main_category = c;
    if (c.sub_category_list && c.sub_category_list.length) {
      $scope.sub_category_list1 = c.sub_category_list[0].sub_category_list;
    }
    $scope.getAdsList({ which: 13 }, $scope.search);
  };

  $scope.loadSubCategory2 = function (c) {
    $scope.error = '';
    if (c.sub_category_list && c.sub_category_list.length) {
      $scope.sub_category_list2 = c.sub_category_list[0].sub_category_list;
    }
    $scope.search.category2 = c;
    $scope.getAdsList({ which: 13 }, $scope.search);
  };

  $scope.loadSubCategory3 = function (c) {
    $scope.error = '';
    if (c.sub_category_list && c.sub_category_list.length) {
      $scope.sub_category_list3 = c.sub_category_list[0].sub_category_list;
    }
    $scope.search.category3 = c;
    $scope.getAdsList({ which: 13 }, $scope.search);
  };

  $scope.loadSubCategory4 = function (c) {
    $scope.error = '';
    if (c.sub_category_list && c.sub_category_list.length) {
      $scope.sub_category_list4 = c.sub_category_list[0].sub_category_list;
    }
    $scope.search.sub_category3 = c;
    $scope.getAdsList({ which: 13 }, $scope.search);
  };

  $scope.loadSubCategory5 = function (c) {
    $scope.error = '';
    if (c.sub_category_list && c.sub_category_list.length) {
      $scope.sub_category_list5 = c.sub_category_list[0].sub_category_list;
    }
    $scope.search.sub_category4 = c;
    $scope.getAdsList({ which: 13 }, $scope.search);
  };

  $scope.searchAll = function (search) {
    $scope.error = '';

    site.hideModal('#adAdvancedSearchModal');
    $scope.getAdsList({ which: 13 }, search);
  };
  $scope.loadMainCategories();
  $scope.getUser();
});
