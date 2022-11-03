app.controller('index_souq', function ($scope, $http, $timeout) {
  $scope.search = { price_from: 0, price_to: 100000000 };
  $scope.getContentList = function (ev, where) {
    if ($scope.ContentBusy) {
      return;
    }
    $scope.ContentBusy = true;

    if (ev.which === 13) {

      where = where || {};
      where['ad_status.id'] = 1;

      if (where['country_code'] || where['gov_code']) {
        hsMap('hide');
        if (where['country_code']) {
          delete where['gov_code'];
        } else if (where['gov_code']) {
          delete where['country_code'];
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
            response.data.list.forEach(p=>{
              $scope.contentList.push(p);
            })
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

  window.onscroll = function () {
    if (!window.autoLoadingPosts) {
      return;
    }
    window.autoLoadingPosts = false;

    var y = document.documentElement.offsetHeight;
    var yy = window.pageYOffset + window.innerHeight;

    if (y - 1000 <= yy) {
      $scope.search['pages'] = true;
      $scope.getContentList({ which: 13 }, $scope.search);
    }
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
          name_ar: 1,
          name_en: 1,
          code: 1,
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
          name_ar: 1,
          name_en: 1,
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
        select: { id: 1, name_ar: 1, name_en: 1 },
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
        select: { id: 1, name_ar: 1, name_en: 1 },
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
    window.open(`/display_content?id=${id}`, '_blank');
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

  $scope.updateFeedback = function (ad, type ,status) {
    if(type == 'favorite') {
      ad.$favorite = status;
    }
    let data = { id: ad.id, feedback: { favorite: ad.$favorite, type: type } };

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
          status: 'active',
        },
        top : true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_list = response.data.list;
          $scope.topParentCategoriesList = response.data.top_list;
          $scope.category_list.forEach((_c) => {
            if (!_c.top_parent_id) {
              if (site.toNumber('##query.id##') == _c.id) {
                $scope.loadSubCategory(_c);
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
    $scope.getContentList({ which: 13 }, $scope.search);
    $scope.category = c;
    if ($scope.user) {
      $scope.user.follow_category_list.forEach((_f) => {
        if (c.id == _f) {
          $scope.category.follow = true;
        }
      });
    }
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
    $scope.getContentList({ which: 13 }, $scope.search);
    $scope.category = c;
    if ($scope.user) {
      $scope.user.follow_category_list.forEach((_f) => {
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
      $scope.user.follow_category_list.forEach((_f) => {
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
      $scope.user.follow_category_list.forEach((_f) => {
        if (c.id == _f) {
          $scope.category.follow = true;
        }
      });
    }
  };

  $scope.updateFollowCategory = function (categoryId, follow) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/follow_category',
      data: { follow: follow, id: categoryId },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
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

  if ('##query.id##' == 'undefined') {
    $scope.getContentList({ which: 13 }, {});
  }
  $scope.getUser();
  $scope.getDefaultSetting();
  $scope.getCountriesList();
});
