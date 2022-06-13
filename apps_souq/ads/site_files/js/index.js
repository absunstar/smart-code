app.controller('ads', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.ad = {};

  $scope.displayAddAd = function () {
    $scope.error = '';
    $scope.ad = {
      comments_list : [{}],
      active: true,
    };
    if ($scope.defaultSettings.ads_settings) {
      if ($scope.defaultSettings.ads_settings.ad_status) {
        $scope.ad.ad_status = $scope.defaultSettings.ads_settings.ad_status;
      }
      if ($scope.defaultSettings.ads_settings.quantities_can_be_used) {
        $scope.ad.quantity_list = [{}];
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
          $scope.getAdList();
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
          $scope.getAdList();
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
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAdList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/ads/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'ads',
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
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

  $scope.getCommentsTypesList = function (where) {
    $scope.busy = true;
    $scope.commentsTypesList = [];
    $http({
      method: 'POST',
      url: '/api/comments_types/all',
      data: {
        where: { active: true },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.commentsTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAdStatusList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.adStatusList = [];
    $http({
      method: 'POST',
      url: '/api/ads_status/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.adStatusList = response.data;
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

  $scope.addImage = function () {
    $scope.error = '';
    $scope.ad.images_list = $scope.ad.images_list || [];
    $scope.ad.images_list.push({});
  };

  $scope.addComments = function () {
    $scope.error = '';
    $scope.ad.comments_list = $scope.ad.comments_list || [];
    $scope.ad.comments_list.push({});
  };

  $scope.addQuantity = function () {
    $scope.error = '';
    $scope.ad.quantity_list = $scope.ad.quantity_list || [];
    $scope.ad.quantity_list.push({});
  };

  $scope.getAdList();
  $scope.getNumberingAuto();
  $scope.getDefaultSetting();
  $scope.getCommentsTypesList();
  $scope.getUnitsList();
  $scope.getAdStatusList();
  $scope.getCurrenciesList();
});
