app.controller('create_content', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.ad = {};

  $scope.displayAddAd = function () {
    $scope.error = '';
    $scope.ad = {
      feedback_list: [],
      ad_rating: 0,
      date: new Date(),
      set_price: 'no',
      number_views: 0,
      number_comments: 0,
      number_favorites: 0,
      number_reports: 0,
      priority_level: 0,
      active: true,
    };

    if ($scope.defaultSettings.content) {
      if ($scope.defaultSettings.content.closing_system) {
        if ($scope.defaultSettings.content.closing_system.id == 2) {
          $scope.ad.expiry_date = new Date();
          $scope.ad.expiry_date.setDate($scope.ad.expiry_date.getDate() + 7);
        }
      }

      if ($scope.defaultSettings.content.status) {
        $scope.ad.ad_status = $scope.defaultSettings.content.status;
      }

      if ($scope.defaultSettings.content.upload_photos) {
        $scope.ad.images_list = [{}];
      }

      if ($scope.defaultSettings.content.upload_video) {
        $scope.ad.videos_list = [{}];
      }

      if ($scope.defaultSettings.content.quantities_can_be_used) {
        $scope.ad.quantity_list = [
          {
            price: 0,
            discount: 0,
            discount_type: 'number',
            net_value: 0,
            available_quantity: 0,
            maximum_order: 0,
            minimum_order: 0,
          },
        ];
      }

      $scope.ad.image_url = $scope.defaultSettings.content.default_image_ad || '/images/content.png';
    }
  };
  $scope.addAd = function () {
    $scope.error = '';
    const v = site.validated('#adAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (!$scope.defaultSettings.stores_settings.activate_stores) {
      if ($scope.address) {
        if ($scope.address.select_main) {
          $scope.ad.address = $scope.address.main;
        } else if ($scope.address.select_new) {
          $scope.ad.address = $scope.address.new;
        } else {
          $scope.address.other_list = $scope.address.other_list || [];
          $scope.address.other_list.forEach((_other) => {
            if (_other.$select_address) {
              $scope.ad.address = { ..._other };
            }
          });
        }
      }
    } else if ($scope.ad.store) {
      $scope.ad.address = $scope.ad.store.address;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/contents/add',
      data: $scope.ad,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (!$scope.defaultSettings.stores_settings.activate_stores) {
            $scope.address = {};
          }
          $scope.getDefaultSetting();
          site.showModal('#alert');
          $timeout(() => {
            site.hideModal('#alert');
          }, 1500);
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = '##word.err_maximum_adds##';
          } else if (response.data.error.like('*store must specifi*')) {
            $scope.error = '##word.store_must_specified##';
          } else if (response.data.error.like('*must be specified in feed*')) {
            $scope.error = '##word.user_must_specified_in_feedbacks##';
          } else if (response.data.error.like('*date is greater than the date of public*')) {
            $scope.error = '##word.today_date_greater_than_date_publication##';
          }
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
        select: { id: 1, name_ar: 1, name_en: 1, parent_list_id: 1, top_parent_id: 1, parent_id: 1 },
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

  $scope.calcDiscount = function (obj) {
    $scope.error = '';
    $timeout(() => {
      let discount = obj.discount || 0;
      if (obj.discount_type == 'percent') discount = (obj.price * obj.discount) / 100;

      obj.net_value = obj.price - discount;
    }, 200);
  };

  $scope.addQuantity = function () {
    $scope.error = '';
    $scope.ad.quantity_list = $scope.ad.quantity_list || [];
    let obj = {
      price: 0,
      discount: 0,
      discount_type: 'number',
      net_value: 0,
      available_quantity: 0,
      maximum_order: 0,
      minimum_order: 0,
    };
    $scope.ad.quantity_list.push(obj);
  };
  $scope.addImage = function () {
    $scope.error = '';
    $scope.ad.images_list = $scope.ad.images_list || [];
    $scope.ad.images_list.push({});
  };

  $scope.addVideos = function () {
    $scope.error = '';
    $scope.ad.videos_list = $scope.ad.videos_list || [];
    $scope.ad.videos_list.push({});
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

  $scope.getAdsStatusList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.aStatusList = [];
    $http({
      method: 'POST',
      url: '/api/content_status/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.contentStatusList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getUnitsList = function () {
    $scope.busy = true;
    $scope.unitsList = [];
    $http({
      method: 'POST',
      url: '/api/units/all',
      data: {
        where: { active: true },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.unitsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.selectAddress = function (address, type, index) {
    $scope.error = '';
    address = address || {};

    if (type == 'main') {
      address.select_new = false;
    } else if (type == 'other') {
      address.select_new = false;
      address.select_main = false;
    } else if (type == 'new') {
      address.select_main = false;
    }

    if (address.other_list && address.other_list.length > 0) {
      address.other_list.forEach((_other, i) => {
        if (type == 'other') {
          if (i != index) {
            _other.$select_address = false;
          }
        } else {
          _other.$select_address = false;
        }
      });
    }
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
          if ($scope.user) {
            $scope.ad.mobile = $scope.user.mobile;
            $scope.address = {
              main: $scope.user.profile.main_address,
              other_list: $scope.user.profile.other_addresses_list,
            };
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.getMyStoresList = function (where) {
    $scope.busy = true;
    $scope.myStoreslist = [];
    $http({
      method: 'POST',
      url: '/api/stores/all',
      data: {
        where: { 'user.id': site.toNumber('##user.id##') },
        select: { id: 1, name: 1, user: 1, address: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.myStoreslist = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.viewCategories = function (c) {
    $scope.category = c;
    site.showModal('#categoriesViewModal');
  };

  $scope.selectCategory = function (c) {
    $scope.ad.main_category = c;
    if (c && !c.top_parent_id) {
      $scope.ad.category_require_list = c.category_require_list;
    }
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
          $scope.displayAddAd();
          if (!$scope.defaultSettings.stores_settings.activate_stores) {
            $scope.getUser();
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getUnitsList();
  $scope.getCurrenciesList();
  $scope.loadMainCategories();
  $scope.getAdsStatusList();
  $scope.getMyStoresList();
  $scope.getDefaultSetting();
});
