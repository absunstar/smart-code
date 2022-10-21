let btn1 = document.querySelector('#manage_user .tab-link');
if (btn1) {
  btn1.click();
}

app.controller('manage_user', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.manage_user = {};
  $scope.viewText = '';

  $scope.loadManageUser = function () {
    $scope.manage_user = {};
    $scope.busy = true;

    let id = site.toNumber('##user.id##');
    $http({
      method: 'POST',
      url: '/api/manage_user/view',
      data: { id: id },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.manage_user = response.data.doc;
          $scope.manage_user.$permissions_info;
          $scope.permissions_list = [];
          $scope.address = {
            main: $scope.manage_user.profile.main_address,
            other_list: $scope.manage_user.profile.other_addresses_list,
          };
          $scope.manage_user.$permissions_info.forEach((_p) => {
            $scope.permissions_list.push({
              name: _p.screen_name,
              module_name: _p.module_name,
            });
          });

          $http({
            method: 'POST',
            url: '/api/get_dir_names',
            data: $scope.permissions_list,
          }).then(
            function (response) {
              let data = response.data.doc;
              if (data) {
                $scope.permissions_list.forEach((_s) => {
                  if (_s.name) {
                    let newname = data.find((el) => el.name == _s.name.replace(/-/g, '_'));
                    if (newname) {
                      _s.name_ar = newname.ar;
                      _s.name_en = newname.en;
                    }
                  }
                });
              }
            },
            function (err) {}
          );
        } else {
          $scope.manage_user = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.editPersonalInfoUser = function (type) {
    $scope.busy = true;

    const v = site.validated('#viewManageUserModal');
    if (!v.ok && type == 'password') {
      $scope.error = v.messages[0].ar;
      return;
    }

    $http({
      method: 'POST',
      url: '/api/manage_user/update_personal_info',
      data: {
        user: $scope.manage_user,
        type: type,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.busy = false;
          site.hideModal('#viewManageUserModal');
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          } else if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = '##word.err_maximum_adds##';
          } else if (response.data.error.like('*mail must be typed correctly*')) {
            $scope.error = '##word.err_username_contain##';
          } else if (response.data.error.like('*User Is Exist*')) {
            $scope.error = '##word.user_exists##';
          } else if (response.data.error.like('*Password does not match*')) {
            $scope.error = '##word.password_err_match##';
          } else if (response.data.error.like('*Current Password Error*')) {
            $scope.error = '##word.current_password_incorrect##';
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.login = function (u) {
    $scope.error = '';

    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/user/login',
      data: {
        $encript: '123',
        email: site.to123(u.email),
        password: site.to123(u.password),
      },
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
        if (response.data.done) {
          window.location.reload(true);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: 'POST',
      url: '/api/gender/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.view = function (type) {
    $scope.error = '';
    $scope.viewText = type;
    site.showModal('#viewManageUserModal');
  };

  $scope.viewOrder = function (order) {
    $scope.error = '';
    $scope.order = order;
    site.showModal('#orderModal');
  };

  $scope.getOrdersList = function (where) {
    $scope.busy = true;
    $scope.orderslist = [];
    $scope.count = 0;
    $http({
      method: 'POST',
      url: '/api/order/all',
      data: {
        where: { 'user.id': $scope.manage_user.id },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.orderslist = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.showTab = function (event, selector) {
    site.showTabContent(event, selector);

    if (selector == '#my_orders') {
      $scope.getOrdersList();
    } else if (selector == '#my_ads') {
      $scope.getMyAdsList();
      $scope.loadMainCategories();
      $scope.getUnitsList();
      $scope.getStoresList($scope.manage_user.id);
      $scope.getCurrenciesList();
    } else if (selector == '#favorite_ads') {
      $scope.getFavoriteAdsList();
    } else if (selector == '#favorite_stores') {
      $scope.getFavoriteStoresList();
    } else if (selector == '#my_stores') {
      $scope.getMyStoresList();
    }
  };

  $scope.displayContent = function (id) {
    window.open(`/display_content?id=${id}`, '_blank');
  };

  $scope.displayStore = function (id) {
    window.open(`/display_store?id=${id}`, '_blank');
  };

  $scope.getMyAdsList = function (where) {
    $scope.busy = true;
    $scope.myAdslist = [];
    $http({
      method: 'POST',
      url: '/api/contents/all',
      data: {
        where: {
          $and: [
            {
              'store.user.id': $scope.manage_user.id,
            },
          ],
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.myAdslist = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getMyStoresList = function (where) {
    $scope.busy = true;
    $scope.myStoreslist = [];
    $http({
      method: 'POST',
      url: '/api/stores/all',
      data: {
        where: {
          $and: [
            {
              'user.id': $scope.manage_user.id,
            },
          ],
        },
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

  $scope.getFavoriteAdsList = function (where) {
    $scope.busy = true;
    $scope.favoriteAdslist = [];
    $http({
      method: 'POST',
      url: '/api/contents/all',
      data: {
        where: {
          $and: [
            {
              'feedback_list.user.id': $scope.manage_user.id,
            },
            {
              'feedback_list.type.id': 2,
            },
            {
              'ad_status.id': { $ne: 3 },
            },
          ],
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.favoriteAdslist = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getFavoriteStoresList = function (where) {
    $scope.busy = true;
    $scope.favoriteStoreslist = [];
    $http({
      method: 'POST',
      url: '/api/stores/all',
      data: {
        where: {
          $and: [
            {
              'feedback_list.user.id': $scope.manage_user.id,
            },
            {
              'feedback_list.type.id': 2,
            },
            {
              'store_status.id': { $ne: 3 },
            },
          ],
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.favoriteStoreslist = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displayAddStore = function () {
    $scope.error = '';
    $scope.store = {
      image_url: '/images/stores.png',
      mobile: $scope.manage_user.profile.mobile,
      feedback_list: [],
      store_rating: 0,
      number_views: 0,
      number_comments: 0,
      number_favorites: 0,
      number_reports: 0,
      priority_level: 0,
      active: true,
    };
    if ($scope.defaultSettings) {
      if ($scope.defaultSettings.stores_settings && $scope.defaultSettings.stores_settings.store_status) {
        $scope.store.store_status = $scope.defaultSettings.stores_settings.store_status;
      } else {
        $scope.store.store_status = {
          id: 2,
          en: 'Under review',
          ar: 'قيد المراجعة',
        };
      }
    }
    site.showModal('#storeAddModal');
  };

  $scope.addStore = function () {
    $scope.error = '';
    const v = site.validated('#storeAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.store.user = {
      id: $scope.manage_user.id,
      profile: $scope.manage_user,
      email: $scope.manage_user.email,
    };

    if ($scope.address.select_main) {
      $scope.store.address = $scope.address.main;
    } else if ($scope.address.select_new) {
      $scope.store.address = $scope.address.new;
    } else {
      $scope.address.other_list = $scope.address.other_list || [];
      $scope.address.other_list.forEach((_other) => {
        if (_other.$select_address) {
          $scope.store.address = { ..._other };
        }
      });
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores/add',
      data: $scope.store,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.address = {};
          site.hideModal('#storeAddModal');
          $scope.getStoreList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          } else if (response.data.error.like('*maximum stores to user*')) {
            $scope.error = '##word.maximum_number_stores_exceeded##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateStore = function (store) {
    $scope.error = '';
    $scope.viewStore(store);
    $scope.store = {};
    site.showModal('#storeUpdateModal');
  };

  $scope.updateStore = function () {
    $scope.error = '';
    const v = site.validated('#storeUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.address.select_main) {
      $scope.store.address = $scope.address.main;
    } else if ($scope.address.select_new) {
      $scope.store.address = $scope.address.new;
    } else {
      $scope.address.other_list = $scope.address.other_list || [];
      $scope.address.other_list.forEach((_other) => {
        if (_other.$select_address) {
          $scope.store.address = { ..._other };
        }
      });
    }

    if ($scope.defaultSettings.stores_settings && $scope.defaultSettings.stores_settings.store_status) {
      $scope.store.store_status = $scope.defaultSettings.stores_settings.store_status;
    } else {
      $scope.store.store_status = {
        id: 2,
        en: 'Under review',
        ar: 'قيد المراجعة',
      };
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores/update',
      data: $scope.store,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.address = {};
          site.hideModal('#storeUpdateModal');
          $scope.getStoreList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsStore = function (store) {
    $scope.error = '';
    $scope.viewStore(store);
    $scope.store = {};
    site.showModal('#storeViewModal');
  };

  $scope.viewStore = function (store) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/stores/view',
      data: {
        id: store.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.store = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteStore = function (store) {
    $scope.error = '';

    $scope.viewStore(store);
    $scope.store = {};
    site.showModal('#storeDeleteModal');
  };

  $scope.deleteStore = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/stores/delete',
      data: {
        id: $scope.store.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#storeDeleteModal');
          $scope.getStoreList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getStoreList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/stores/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#storeSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.displayAddAd = function () {
    window.open(`/create_content`,'_top');
  };
  /*  $scope.displayAddAd = function () {
    $scope.error = '';
    $scope.ad = {
      mobile: $scope.manage_user.profile.mobile,
      feedback_list: [],
      set_price: 'no',
      ad_rating: 0,
      number_views: 0,
      number_comments: 0,
      number_favorites: 0,
      number_reports: 0,
      priority_level: 0,
      active: true,
    };
    if ($scope.defaultSettings.content) {
      if ($scope.defaultSettings.content.status) {
        $scope.ad.ad_status = $scope.defaultSettings.content.status;
      } else {
        $scope.ad.ad_status = {
          id: 2,
          en: 'Under review',
          ar: 'قيد المراجعة',
        };
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
      if ($scope.defaultSettings.content.upload_photos) {
        $scope.ad.images_list = [{}];
      }
      $scope.ad.image_url = $scope.defaultSettings.content.default_image_ad || '/images/content.png';
    }
    site.showModal('#adAddModal');
  }; */

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

  $scope.addAd = function () {
    $scope.error = '';
    const v = site.validated('#adAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (!$scope.defaultSettings.stores_settings.activate_stores) {
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
          site.hideModal('#adAddModal');
          $scope.getMyAdsList();
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

  $scope.displayUpdateAd = function (ad) {
    $scope.error = '';
    $scope.viewAd(ad);
    $scope.ad = {};
    site.showModal('#adUpdateModal');
  };

  $scope.updateAd = function () {
    $scope.error = '';
    const v = site.validated('#adUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.ad.store) {
      $scope.ad.address = $scope.ad.store.address;
    }

    if ($scope.defaultSettings.content.status) {
      $scope.ad.ad_status = $scope.defaultSettings.content.status;
    } else {
      $scope.ad.ad_status = {
        id: 2,
        en: 'Under review',
        ar: 'قيد المراجعة',
      };
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/contents/update',
      data: $scope.ad,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#adUpdateModal');
          $scope.getMyAdsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsAd = function (ad) {
    $scope.error = '';
    $scope.viewAd(ad);
    $scope.ad = {};
    site.showModal('#adViewModal');
  };

  $scope.viewAd = function (ad) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/contents/view',
      data: {
        id: ad.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.ad = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteAd = function (ad) {
    $scope.error = '';

    $scope.viewAd(ad);
    $scope.ad = {};
    site.showModal('#adDeleteModal');
  };

  $scope.deleteAd = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/contents/delete',
      data: {
        id: $scope.ad.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#adDeleteModal');
          $scope.getMyAdsList();
        } else {
          $scope.error = response.data.error;
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

  $scope.getStoresList = function (id) {
    $scope.busy = true;
    $scope.storesList = [];
    $http({
      method: 'POST',
      url: '/api/stores/all',
      data: {
        where: { 'user.id': id },
        select: { id: 1, code: 1, name: 1, user: 1, address: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.storesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.saveUserChanges = function (user) {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/update',
      data: user,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
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

  $scope.loadManageUser();
  $scope.getGender();
  $scope.getDefaultSetting();
});
