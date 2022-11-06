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
      description: '##word.details##',
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
        $scope.ad.images_list = [];
      }

      if ($scope.defaultSettings.content.upload_video) {
        $scope.ad.videos_list = [];
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
      /*  if ($scope.address) {
         if ($scope.ad.$address_type == 'main') {
           $scope.ad.address = $scope.address.main;
         } else if ($scope.ad.$address_type == 'new') {
           $scope.ad.address = $scope.address.new;
         } else if ($scope.ad.$address_type == 'other') {
           $scope.address.other_list = $scope.address.other_list || [];
           $scope.address.other_list.forEach((_other) => {
             if (_other.$select_address) {
               $scope.ad.address = { ..._other };
             }
           });
         }
       } */
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
            window.location.href = '/';
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

  $scope.acceptDeal = function (ad) {
    ad.$accept_deal = true;
    $('#adDeal').hide();
    $('#adCategory').show('slow');
  };



  $scope.acceptCategory = function (ad, cat) {

    $scope.loadSubCategory2(cat);
    if (cat.type == 'primary') {
      $('#adCategory').hide();
      if (cat.category_require_list && cat.category_require_list.length > 0) {
        $('#adCategoryRequire').show('slow');
      } else {
        $('#adAddressType').show('slow');
      }
    }
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
        select: { id: 1, name_ar: 1, name_en: 1, parent_list_id: 1, top_parent_id: 1, category_require_list: 1, parent_id: 1, image_url: 1, type: 1 },
        top: true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_list = response.data.list;
          $scope.top_category_list = response.data.top_list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadSubCategory2 = function (c) {
    $scope.error = '';
    $scope.ad.main_category = c;
    $scope.ad.category_require_list = c.category_require_list;
    $scope.ad.$category1 = $scope.ad.main_category;
    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.subCategoriesList5 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList2.push(_c);
      }
    });
  };

  $scope.loadSubCategory3 = function (c) {
    $scope.error = '';
    $scope.ad.main_category = c;
    $scope.ad.$category2 = $scope.ad.main_category;
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.subCategoriesList5 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList3.push(_c);
      }
    });
  };

  $scope.loadSubCategory4 = function (c) {
    $scope.error = '';
    $scope.ad.main_category = c;
    $scope.ad.$category3 = $scope.ad.main_category;
    $scope.subCategoriesList4 = [];
    $scope.subCategoriesList5 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList4.push(_c);
      }
    });
  };


  $scope.loadSubCategory5 = function (c) {
    $scope.error = '';
    $scope.ad.main_category = c;
    $scope.ad.$category4 = $scope.ad.main_category;
    $scope.subCategoriesList5 = [];
    $scope.category_list.forEach((_c) => {
      if (c.id == _c.parent_id) {
        $scope.subCategoriesList5.push(_c);
      }
    });
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
    if ($scope.ad.$image && $scope.ad.$image.image_url) {
      $scope.ad.images_list.push({
        image_url: $scope.ad.$image.image_url,
        description: $scope.ad.$image.desc,
      });
    };
    $scope.ad.$image = { image_url: '/images/no.jpg' };
  };

  $scope.addVideos = function () {
    $scope.error = '';
    $scope.ad.videos_list = $scope.ad.videos_list || [];
    if ($scope.ad.$video && $scope.ad.$video.link) {

      $scope.ad.videos_list.push({
        link: $scope.ad.$video.link,
        description: $scope.ad.$video.desc,
      });
    }
    $scope.ad.$video = {};
  };

  $scope.doneSelectImages = function () {
    $scope.error = '';
    if ($scope.defaultSettings.content.upload_video) {
      $('#adImages').hide();
      $('#adVideo').show('slow');
    } else {
      $('#adImages').hide();
      $('#adContent').show('slow');
    }
  };

  $scope.doneSelectVideos = function () {
    $scope.error = '';

    $('#adVideo').hide();
    $('#adContent').show('slow');

  };

  $scope.upDownList = function (list, type, index) {

    let element = list[index];
    let toIndex = index;

    if (type == 'up') {
      toIndex = index - 1
    } else if (type == 'down') {
      toIndex = index + 1
    }

    list.splice(index, 1);
    list.splice(toIndex, 0, element);

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

  $scope.adBack = function (id1, id2) {
    $(`#${id1}`).hide();
    $(`#${id2}`).show('slow');
  };

  $scope.continuationNotSelectAddress = function () {
    $('#adAddressType').hide();
    $('#adImages').show('slow');
  };

  $scope.continuationToSelectAddress = function () {
    $('#adCategoryRequire').hide();
    $('#adAddressType').show('slow');
  };

  $scope.showAddress = function (ad, type) {
    ad.$address_type = type;
    $('#adAddressType').hide();
    $('#adAddressSelect').show('slow');
  };

  $scope.selectAddress = function (index) {
    $scope.error = '';

    if ($scope.ad.$address_type == 'main') {
      $scope.ad.address = $scope.address.main;
    } else if ($scope.ad.$address_type == 'other') {
      $scope.address.other_list = $scope.address.other_list || [];
      $scope.address.other_list.forEach((_other, i) => {
        if (i == index) {
          $scope.ad.address = { ..._other };
        }

      });
    } else if ($scope.ad.$address_type == 'new') {
      $scope.ad.address = $scope.address.new;

    }

    $('#adAddressSelect').hide();
    $('#adImages').show('slow');
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
      function (err) { }
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
