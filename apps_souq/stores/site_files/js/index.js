app.controller('stores', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store = {};

  $scope.displayAddStore = function () {
    $scope.error = '';
    $scope.store = {
      image_url: '/images/stores.png',
      feedback_list: [],
      store_rating: 0,
      number_views: 0,
      number_comments: 0,
      number_favorites: 0,
      number_reports: 0,
      priority_level: 0,
      active: true,
    };
    if ($scope.defaultSettings.stores_settings) {
      if ($scope.defaultSettings.stores_settings.store_status) {
        $scope.store.store_status = $scope.defaultSettings.stores_settings.store_status;
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
          if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = '##word.err_maximum_adds##';
          } else if (response.data.error.like('*user must specifi*')) {
            $scope.error = '##word.user_must_specified##';
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
          $scope.error = response.data.error;
          if (response.data.error.like('*ser must specifi*')) {
            $scope.error = '##word.user_must_specified##';
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#storeSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getStoreList($scope.search);
    site.hideModal('#storeSearchModal');
    $scope.search = {};
  };

  $scope.getReportsTypesList = function (where) {
    $scope.busy = true;
    $scope.reportsTypesList = [];
    $http({
      method: 'POST',
      url: '/api/reports_types/all',
      data: {
        where: { active: true },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.reportsTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getStoresStatusList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.storeStatusList = [];
    $http({
      method: 'POST',
      url: '/api/content_status/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.storeStatusList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDefaultSettings = function () {
    $scope.error = '';
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
      function (err) {}
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

  $scope.addImage = function () {
    $scope.error = '';
    $scope.store.images_list = $scope.store.images_list || [];
    $scope.store.images_list.push({});
  };

  $scope.getStoreList();
  $scope.getDefaultSettings();
  $scope.getCommentsTypesList();
  $scope.getUser();
  $scope.getReportsTypesList();
  $scope.getStoresStatusList();
});
