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
              ad.like = $scope.user.feedbackList.some((_l) => _l.type && _l.ad && _l.type.id == 1 && _l.ad.id == ad.id);
              ad.favorite = $scope.user.feedbackList.some((_f) => _f.type && _f.ad && _f.type.id == 2 && _f.ad.id == ad.id);
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

  $scope.loadMainCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.mainCategories = [];
    $http({
      method: 'POST',
      url: '/api/categories/all',
      data: {
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.categoriesList = response.data.list;
          $scope.categoriesList.forEach((l) => {
            $scope.mainCategories.push({
              id: l.id,
              name: l.name,
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
    $scope.search.mainCategory = c;
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
