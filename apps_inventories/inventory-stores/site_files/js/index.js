app.controller("stores", function ($scope, $http) {

  $scope._search = {};

  $scope.id = 1;

  $scope.searchAll = function () {
    $scope.error = '';
    let where = {};

    if ($scope.search.name) {
      where['name'] = $scope.search.name;
    }

    if ($scope.search.type) {

      where['type.id'] = $scope.search.type.id;
    }
    if ($scope.search.note) {
      where['note'] = $scope.search.note;
    }

    $scope.loadAll(where, $scope.search.limit);
  };

  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { where: {} }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.stores = response.data.list
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.loadAll = function (where, limit) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { where: where, limit: limit || 100000 }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
          $scope.count = $scope.list.length;
          site.hideModal('#StoreSearchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStoreTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/stores/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.store_types = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.newStore = function () {
    $scope.error = '';

    $scope.store = {
      image_url: '/images/store.png'
    };
    site.showModal('#addStoreModal');
    $('#store_name').focus();
  };


  $scope.add = function () {
    $scope.error = '';
    const v = site.validated('#addStoreModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/add",
      data: $scope.store
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addStoreModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }

      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.edit = function (store) {
    $scope.error = '';
    $scope.view(store);
    $scope.store = {};
    site.showModal('#updateStoreModal');
    $('#store_name').focus();
  };
  $scope.update = function () {
    $scope.error = '';
    const v = site.validated('#updateStoreModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/update",
      data: $scope.store
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateStoreModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.remove = function (store) {
    $scope.error = '';
    $scope.view(store);
    $scope.store = {};
    site.showModal('#deleteStoreModal');
  };

  $scope.view = function (store) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/view",
      data: {
        _id: store._id
      }
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
    )
  };
  $scope.details = function (store) {
    $scope.error = '';
    $scope.view(store);
    $scope.store = {};
    site.showModal('#viewStoreModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/delete",
      data: $scope.store
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Delete Store Its Exist In Other*')) {
            $scope.error = "##word.err_delete_store##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getGuideAccountList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_guide_accounts/all",
      data: {
        where: {
          status: 'active',
          type: 'detailed'
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.guideAccountList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCostCenterList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_cost_centers/all",
      data: {
        where: {
          status: 'active',
          type: 'detailed'
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.costCenterList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "stores"
      }
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
    )
  };


  $scope.loadStoreTypes();
  $scope.loadStores();
  $scope.loadAll();
  $scope.getNumberingAuto();
  if (site.feature('erp')) {
    $scope.getGuideAccountList();
    $scope.getCostCenterList();
  }


});