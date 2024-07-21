app.controller('cms', function ($scope, $http, $timeout) {
  $scope.search = {};
  $scope.getContentList = function (ev, where) {
    if ($scope.ContentBusy) {
      return;
    }
    $scope.ContentBusy = true;

    if (ev.which === 13) {
      where = where || {};

      where['adStatus.id'] = 1;
      if (where['categoryId']) {
        window.history.pushState(null, null, '/category/' + where['categoryId'] + '/' + where['categoryName']);

        delete where['categoryName'];
      }

      if (where['countryCode'] || where['govCode']) {
        hsMap('hide');
        if (where['countryCode']) {
          delete where['govCode'];
        } else if (where['govCode']) {
          delete where['countryCode'];
        }
      }

      window.pageLimit = window.pageLimit || 20;
      window.pageNumber = window.pageNumber || 0;

      if (where['pages']) {
        $scope.contentList = $scope.contentList || [];
        window.pageNumber++;
        delete where['pages'];
      } else {
        $scope.contentList = [];
        window.pageNumber = 0;
      }

      $http({
        method: 'POST',
        url: '/api/contents/all',
        data: {
          where: where,
          pageLimit: window.pageLimit,
          pageNumber: window.pageNumber,
          post: true,
        },
      }).then(
        function (response) {
          $scope.ContentBusy = false;
          if (response.data.done && response.data.list.length > 0) {
            response.data.list.forEach((p) => {
              $scope.contentList.push(p);
            });
          }
          $timeout(() => {
            window.autoLoadingPosts = true;
          }, 2000);
        },
        function (err) {
          $scope.ContentBusy = false;
          $scope.error = err;
          $timeout(() => {
            window.autoLoadingPosts = true; 
          }, 2000);
        }
      );
    }
  };

  $scope.logout = function () {
    $scope.error = '';
    $scope.busy = true;
    $http.post('/api/user/logout').then(
      function (response) {
        if (response.data.done) {
          window.location.href = '/';
        } else {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
      },
      function (error) {
        $scope.busy = false;
        $scope.error = error;
      }
    );
  };

  $scope.loadMore = function () {
    if (!window.autoLoadingPosts) {
      return;
    }
    window.autoLoadingPosts = false;

    $scope.search['pages'] = true;
    $scope.getContentList({ which: 13 }, $scope.search);
  };

  $scope.getCountriesList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/countries/all',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
          code: 1,
          countryCode: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.countriesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGovesList = function (country) {
    $scope.busy = true;
    $scope.govesList = [];
    $scope.citiesList = [];
    $scope.areaList = [];
    $http({
      method: 'POST',
      url: '/api/goves/all',
      data: {
        where: {
          'country.id': country.id,
          active: true,
        },
        select: {
          id: 1,
          name: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCitiesList = function (gov) {
    $scope.busy = true;
    $scope.citiesList = [];
    $scope.areaList = [];
    $http({
      method: 'POST',
      url: '/api/cities/all',
      data: {
        where: {
          'gov.id': gov.id,
          active: true,
        },
        select: { id: 1, name: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.citiesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $scope.areaList = [];
    $http({
      method: 'POST',
      url: '/api/areas/all',
      data: {
        where: {
          'city.id': city.id,
          active: true,
        },
        select: { id: 1, name: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
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

          if ($scope.user && !$scope.user.cart) {
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
          status: 'active',
        },
        select: { id: 1, name: 1, topParentId: 1, parentId: 1, parentListId: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.mainCategories = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadSubCategory = function (c) {
    if (c && c.id) {
      $scope.topParentcategoryList.forEach((_c) => {
        _c.$isSelected = false;
      });
      c.$isSelected = true;

      $scope.error = '';
      $scope.search.categoryId = c.id;
      $scope.search.categoryName = c.name;
      $scope.searchAll($scope.search);
      $scope.subcategoryList = [];
      $scope.subcategoryList2 = [];
      $scope.subcategoryList3 = [];
      $scope.subcategoryList4 = [];
      $scope.categoryList.forEach((_c) => {
        if (c.id == _c.parentId) {
          $scope.subcategoryList.push(_c);
        }
      });
      $scope.getContentList({ which: 13 }, $scope.search);
      $scope.category = c;
      if ($scope.user) {
        $scope.user.followCategoryList.forEach((_f) => {
          if (c.id == _f) {
            $scope.category.follow = true;
          }
        });
      }
    }
  };

  $scope.loadSubCategory2 = function (c) {
    $scope.error = '';
    $scope.search.categoryId = c.id;
    $scope.search.categoryName = c.name;
    $scope.searchAll($scope.search);
    $scope.subcategoryList2 = [];
    $scope.subcategoryList3 = [];
    $scope.subcategoryList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c.id == _c.parentId) {
        $scope.subcategoryList2.push(_c);
      }
    });
    $scope.getContentList({ which: 13 }, $scope.search);
    $scope.category = c;
    if ($scope.user) {
      $scope.user.followCategoryList.forEach((_f) => {
        if (c.id == _f) {
          $scope.category.follow = true;
        }
      });
    }
  };

  $scope.loadSubCategory3 = function (c) {
    $scope.error = '';
    $scope.search.categoryId = c.id;
    $scope.searchAll($scope.search);
    $scope.subcategoryList3 = [];
    $scope.subcategoryList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c.id == _c.parentId) {
        $scope.subcategoryList3.push(_c);
      }
    });
    $scope.getContentList({ which: 13 }, $scope.search);
    $scope.category = c;
    if ($scope.user) {
      $scope.user.followCategoryList.forEach((_f) => {
        if (c.id == _f) {
          $scope.category.follow = true;
        }
      });
    }
  };

  $scope.loadSubCategory4 = function (c) {
    $scope.error = '';
    $scope.search.categoryId = c.id;

    $scope.searchAll($scope.search);
    $scope.subcategoryList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c.id == _c.parentId) {
        $scope.subcategoryList4.push(_c);
      }
    });
    $scope.getContentList({ which: 13 }, $scope.search);
    $scope.category = c;
    if ($scope.user) {
      $scope.user.followCategoryList.forEach((_f) => {
        if (c.id == _f) {
          $scope.category.follow = true;
        }
      });
    }
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

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/get-site-setting',
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

  $scope.searchAll = function (search) {
    $scope.error = '';
    $scope.getContentList({ which: 13 }, search);
  };

  $scope.mapSearch = function () {
    $scope.error = '';

    $scope.getContentList({ which: 13 }, search);
  };

  $scope.loadMainCategories();
  if ('##params.id##' == 'undefined') {
    $scope.getContentList({ which: 13 }, {});
  }
  $scope.getUser();
  $scope.getDefaultSetting();
  $scope.getCountriesList();
});
