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

        window.history.pushState(null, null, '/category/' + where['category_id'] + '/' + where['category_name_en'] + '-' + where['category_name_ar']);

        delete where['category_name_ar'];
        delete where['category_name_en'];

      }

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
          name_ar: 1,
          name_en: 1,
          code: 1,
          country_code: 1,
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
  $scope.updateFeedback = function (ad, type, status) {
    if (type == 'favorite') {
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
              if (!_c.top_parent_id) {
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
  };
  $scope.moveCategory = function (type) {

    let index = $scope.topParentCategoriesList.findIndex(_c => {
      return _c.$isSelected == true;
    });
    if (type == 'next') {

      if (index < 0) {
        $scope.loadSubCategory($scope.topParentCategoriesList[0]);
        if (el = document.querySelector('#cat_' + $scope.topParentCategoriesList[0].id)) {
          el.scrollIntoView()
        }
      } else if (index + 1 != $scope.topParentCategoriesList.length) {
        $scope.loadSubCategory($scope.topParentCategoriesList[index + 1])
        if (el = document.querySelector('#cat_' + $scope.topParentCategoriesList[index + 1].id)) {
          el.scrollIntoView();
          document.querySelector('.tag-list').scrollLeft = el.offsetLeft;
        }
      }

    } else if (type == 'previous') {
      if (index > 0) {

        $scope.loadSubCategory($scope.topParentCategoriesList[index - 1])
        if (el = document.querySelector('#cat_' + $scope.topParentCategoriesList[index - 1].id)) {
          el.scrollIntoView()
          document.querySelector('.tag-list').scrollLeft += 50;
        }
      }
    }
  };



  $scope.loadSubCategory = function (c) {
    if (c && c.id) {

      $scope.topParentCategoriesList.forEach(_c => {
        _c.$isSelected = false;
      });
      c.$isSelected = true;

      $scope.error = '';
      $scope.search.category_id = c.id;
      $scope.search.category_name_ar = c.name_ar;
      $scope.search.category_name_en = c.name_en;
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
    }

  };

  $scope.loadSubCategory2 = function (c) {
    $scope.error = '';
    $scope.search.category_id = c.id;
    $scope.search.category_name_ar = c.name_ar;
    $scope.search.category_name_en = c.name_en;
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

  if ('##params.id##' == 'undefined') {
    $scope.getContentList({ which: 13 }, {});
  }
  $scope.getUser();
  $scope.getDefaultSetting();
  $scope.getCountriesList();
});
