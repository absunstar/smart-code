app.controller('contents', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.ad = {};

  $scope.displayAddAd = function () {
    $scope.error = '';
    $scope.ad = {
      feedback_list: [],
      ad_rating: 0,
      set_price: 'no',
      date: new Date(),
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

      if ($scope.defaultSettings.content.upload_photos) {
        $scope.ad.images_list = [{}];
      }

      if ($scope.defaultSettings.content.upload_video) {
        $scope.ad.videos_list = [{}];
      }


      $scope.ad.image_url = $scope.defaultSettings.content.default_image_ad || '/images/content.png';
    }
    site.showModal('#adAddModal');
  };

  $scope.addAd = function () {
    $scope.error = '';
    const v = site.validated('#adAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    if (!$scope.defaultSettings.stores_settings.activate_stores && $scope.address) {
      if ( $scope.address.select_main) {
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
          $scope.getAdList();
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

  $scope.showCommentReport = function (comment) {
    $scope.error = '';
    $scope.comment = comment;
    site.showModal('#reportCommentModal');
  };

  
  $scope.showReplyReport = function (reply) {
    $scope.error = '';
    $scope.reply = reply;
    site.showModal('#reportReplyModal');
  };

  $scope.showCommentReplies = function (comment) {
    $scope.error = '';
    $scope.comment = comment;
    site.showModal('#commentReplyModal');
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
      $scope.error = v.messages[0].Ar;
      return;
    }

    if ($scope.address && !$scope.defaultSettings.stores_settings.activate_stores) {
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
      url: '/api/contents/update',
      data: $scope.ad,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#adUpdateModal');
          $scope.getAdList();
        } else {
          $scope.error = 'Please Login First';
          if (response.data.error.like('*store must specifi*')) {
            $scope.error = '##word.store_must_specified##';
          } else if (response.data.error.like('*must be specified in feed*')) {
            $scope.error = '##word.user_must_specified_in_feedbacks##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.publishingAd = function (ad) {
    $scope.error = '';
    $scope.busy = true;
    ad.ad_status = $scope.contentStatusList[0];
    $http({
      method: 'POST',
      url: '/api/contents/update',
      data: ad,
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
          $scope.getAdList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
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
        select: { id: 1, name_Ar: 1, name_En: 1, parent_list_id: 1,category_require_list : 1, top_parent_id: 1, parent_id: 1 },
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

  window.onscroll = function () {
    if (!window.autoLoadingPosts) {
      return;
    }
    window.autoLoadingPosts = false;

    var y = document.documentElement.offsetHeight;
    var yy = window.pageYOffset + window.innerHeight;

    if (y - 1000 <= yy) {
      $scope.search = $scope.search || {};
      $scope.search['pages'] = true;
      $scope.getAdList($scope.search);
    }
  };

  $scope.getAdList = function (where) {
    $scope.busy = true;
    window.page_limit = window.page_limit || 20;
    window.page_number = window.page_number || 0;
    where = where || {};

    if (where['pages']) {
      $scope.list = $scope.list || [];
      window.page_number++;
      delete where['pages'];
    } else {
      $scope.list = [];
      window.page_number = 0;
    }
    $http({
      method: 'POST',
      url: '/api/contents/all',
      data: {
        where: where,
        page_limit: window.page_limit,
        page_number: window.page_number,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          response.data.list.forEach(p => {
            $scope.list.push(p);
          });

          $scope.count = response.data.count;
          site.hideModal('#adSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#adSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getAdList($scope.search);
    site.hideModal('#adSearchModal');
    $scope.search = {};
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

          $scope.address = {
            main: $scope.user.profile.main_address,
            other_list: $scope.user.profile.other_addresses_list,
          };
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) { }
    );
  };

  $scope.getUnitsList();
  $scope.getCurrenciesList();
  $scope.loadMainCategories();
  $scope.getAdList({});
  $scope.getAdsStatusList();
  $scope.getDefaultSetting();
});
