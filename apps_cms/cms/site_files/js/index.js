app.controller('cms', function ($scope, $http, $timeout) {
  $scope.search = { price_from: 0, price_to: 100000000 };
  $scope.getContentList = function (ev, where) {
    if ($scope.ContentBusy) {
      return;
    }
    $scope.ContentBusy = true;

    if (ev.which === 13) {
      where = where || {};

      where['ad_status.id'] = 1;
      if (where['category_id']) {

        window.history.pushState(null, null, '/category/' + where['category_id'] + '/' + where['category_name']);

        delete where['category_name'];

      }

      if (where['countryCode'] || where['gov_code']) {
        hsMap('hide');
        if (where['countryCode']) {
          delete where['gov_code'];
        } else if (where['gov_code']) {
          delete where['countryCode'];
        }
      }

      window.page_limit = window.page_limit || 20;
      window.page_number = window.page_number || 0;

      if (where['pages']) {
        $scope.contentList = $scope.contentList || [];
        window.page_number++;
        delete where['pages'];
      } else {
        $scope.contentList = [];
        window.page_number = 0;
      }

      $http({
        method: 'POST',
        url: '/api/contents/all',
        data: {
          where: where,
          page_limit: window.page_limit,
          page_number: window.page_number,
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
      },
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
    $scope.cityList = [];
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

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $scope.cityList = [];
    $scope.areaList = [];
    $http({
      method: 'POST',
      url: '/api/city/all',
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
          $scope.cityList = response.data.list;
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
      url: '/api/area/all',
      data: {
        where: {
          'city.id': city.id,
          active: true,
        },
        select: { id: 1,   name: 1 },
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
      function (err) { }
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
        select: { id: 1, name: 1, topParentId: 1, parent_id: 1 ,parent_list_id : 1},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

/*   $scope.loadMainCategories = function () {
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
        top: true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_list = response.data.list;
          $scope.topParentCategoriesList = response.data.top_list;
          $scope.category_list.forEach((_c) => {

            if (site.toNumber('##params.id##') == _c.id) {
              if (!_c.topParentId) {
                $scope.loadSubCategory(_c);
              } else if(_c.parent_list_id && _c.parent_list_id.length > 0){
                if(_c.parent_list_id.length == 1) {
                  $scope.loadSubCategory2(_c);
                } else  if(_c.parent_list_id.length == 2) {
                  $scope.loadSubCategory3(_c);
                } else if(_c.parent_list_id.length == 3) {
                  $scope.loadSubCategory4(_c);
                }
              }
            }
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  }; */

  $scope.loadSubCategory = function (c) {
    if (c && c.id) {

      $scope.topParentCategoriesList.forEach(_c => {
        _c.$isSelected = false;
      });
      c.$isSelected = true;

      $scope.error = '';
      $scope.search.category_id = c.id;
      $scope.search.category_name = c.name;
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
    $scope.search.category_id = c.id;
    $scope.search.category_name = c.name;
    $scope.searchAll($scope.search);
    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList2.push(_c);
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
    $scope.search.category_id = c.id;
    $scope.searchAll($scope.search);
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList3.push(_c);
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
    $scope.search.category_id = c.id;

    $scope.searchAll($scope.search);
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList4.push(_c);
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
