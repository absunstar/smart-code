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

          $scope.login(response.data.doc);
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
        company: site.to123({
          id: u.company.id,
          name_ar: u.company.name_ar,
          name_en: u.company.name_en,
          item: u.company.item,
          store: u.company.store,
          unit: u.company.unit,
          currency: u.company.currency,
          users_count: u.company.users_count,
          customers_count: u.company.customers_count,
          employees_count: u.company.employees_count,
          host: u.company.host,
          tax_number: u.company.tax_number,
        }),
        branch: site.to123({
          code: u.branch.code,
          name_ar: u.branch.name_ar,
          name_en: u.branch.name_en,
        }),
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

  $scope.showMessage = function (m) {
    $scope.message = m;
  };

  $scope.sendMessage = function (message) {
    $scope.busy = true;

    if (!$scope.send_message) {
      $scope.error = '##word.must_write_message##';
      return;
    }

    message.messages_list = message.messages_list || [];
    message.messages_list.push({
      date: new Date(),
      message: $scope.send_message,
      user_id: $scope.manage_user.id,
      user_name: $scope.manage_user.profile.name,
      image_url: $scope.manage_user.image_url,
      show: false,
    });

    $http({
      method: 'POST',
      url: '/api/messages/update',
      data: message,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.send_message = undefined;
          $scope.busy = false;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.geMessagesList = function (where) {
    $scope.busy = true;
    $scope.messagesList = [];
    $http({
      method: 'POST',
      url: '/api/messages/all',
      data: {
        where: {
          'users_list.id': $scope.manage_user.id,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.messagesList = response.data.list;
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

    if (selector == '#messages') {
      $scope.geMessagesList();
    } else if (selector == '#my_orders') {
      $scope.getOrdersList();
    } else if (selector == '#my_ads') {
      $scope.getMyAdsList();
      $scope.loadMainCategories();
      $scope.getUnitsList();
      $scope.getStoresList($scope.manage_user.id);
      $scope.getCurrenciesList();
    } else if (selector == '#liked_ads') {
      $scope.getLikedAdsList();
    } else if (selector == '#favorite_ads') {
      $scope.getFavoriteAdsList();
    }
  };

  $scope.getMyAdsList = function (where) {
    $scope.busy = true;
    $scope.myAdslist = [];
    $http({
      method: 'POST',
      url: '/api/ads/all',
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

  $scope.getLikedAdsList = function (where) {
    $scope.busy = true;
    $scope.likedAdslist = [];
    $http({
      method: 'POST',
      url: '/api/ads/all',
      data: {
        where: {
          $and: [
            {
              'feedback_list.user.id': $scope.manage_user.id,
            },
            {
              'feedback_list.type.id': 1,
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
          $scope.likedAdslist = response.data.list;
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
      url: '/api/ads/all',
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

  $scope.displayAddAd = function () {
    $scope.error = '';
    $scope.ad = {
      feedback_list: [{ date: new Date() }],
      ad_rating: 0,
      number_views: 0,
      number_likes: 0,
      number_comments: 0,
      number_favorites: 0,
      number_reports: 0,
      priority_level: 0,
      active: true,
    };
    if ($scope.defaultSettings.ads_settings) {
      if ($scope.defaultSettings.ads_settings.ad_status) {
        $scope.ad.ad_status = $scope.defaultSettings.ads_settings.ad_status;
      }
      if ($scope.defaultSettings.ads_settings.quantities_can_be_used) {
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
      if ($scope.defaultSettings.ads_settings.upload_multiple_photos) {
        $scope.ad.images_list = [{}];
      }
      $scope.ad.image_url = $scope.defaultSettings.ads_settings.default_image_ad || '/images/ads.png';
    }
    site.showModal('#adAddModal');
  };

  $scope.addAd = function () {
    $scope.error = '';
    const v = site.validated('#adAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/ads/add',
      data: $scope.ad,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
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
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/ads/update',
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
      url: '/api/ads/view',
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
      url: '/api/ads/delete',
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
              name_ar: l.name_ar,
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
        select: { id: 1, code: 1, name_ar: 1, name_en: 1, user: 1 },
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
    $scope.error = "";

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/update",
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

  $scope.loadManageUser();
  $scope.getGender();
  $scope.getDefaultSetting();
});
