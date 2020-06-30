
let btn1 = document.querySelector('#setting_default .tab-link');
if (btn1) {
  btn1.click();
}

app.controller("default_setting", function ($scope, $http) {
  $scope._search = {};

  $scope.default_setting = {};

  $scope.priceMethod = [
    {
      id: 1,
      ar: 'الفرع',
      en: 'Branch'
    },
    {
      id: 2,
      ar: 'المخزن',
      en: 'Store'
    }
  ];

  $scope.showSearch = function () {
    site.showModal('#searchModal');
  };

  $scope.searchAll = function () {

    $scope.getMenuList($scope.search);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };

  $scope.getCustomerList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer,

          /*  select: {
            id: 1,
            name_ar: 1,
            name_en: 1,
          } */
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.customersList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.loadVendors = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.vendorsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTransactionTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.transactionTypeList = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/transaction_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.transactionTypeList = response.data.filter(i => i.id == 2 || i.id == 3);
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name: 1, type: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.storesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name: 1,
          ex_rate: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.currenciesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadSafesBox = function () {
    $scope.error = '';
    $scope.busy = true;
    let where = { 'type.id': 1 }
    if ($scope.default_setting && $scope.default_setting.accounting && $scope.default_setting.accounting.currency) {
      where['currency.id'] = $scope.default_setting.accounting.currency.id
    }
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          currency: 1,
          type: 1
        },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.safesBoxList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadSafesBank = function () {
    $scope.error = '';
    $scope.busy = true;
    let where = { 'type.id': 2 }
    if ($scope.default_setting && $scope.default_setting.accounting && $scope.default_setting.accounting.currency) {
      where['currency.id'] = $scope.default_setting.accounting.currency.id
    }
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          currency: 1,
          type: 1
        },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.safesBankList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSourceType = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.sourceTypeList = [];
    $http({
      method: "POST",
      url: "/api/source_type/all"
    }).then(
      function (response) {
        $scope.busy = false;

        if (site.feature('gym')) $scope.sourceTypeList = response.data.filter(i => i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('restaurant') || site.feature('pos')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('academy')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 3);
        else $scope.sourceTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getDiscountMethodList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.discountMethodList = [];
    $http({
      method: "POST",
      url: "/api/discount_method/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.discountMethodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPlaceProgramList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.placeProgramList = [];
    $http({
      method: "POST",
      url: "/api/place_program/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.placeProgramList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadDelegates = function () {
    $scope.busy = true;
    $scope.delegatesList = [];
    $http({
      method: "POST",
      url: "/api/delegates/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.delegatesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStoresOutTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/stores_out/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.storesOutTypes = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStoresInTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/stores_in/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.storesInTypes = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadItemsGroups = function () {
    $scope.busy = true;
    $scope.itemsGroupList = [];
    $http({
      method: "POST",
      url: "/api/items_group/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemsGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getPaymentMethodList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.paymentMethodList = [];
    $http({
      method: "POST",
      url: "/api/payment_method/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.paymentMethodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadSetting = function (where) {
    $scope.default_setting = {};
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.default_setting = response.data.doc
        } else {
          $scope.default_setting = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.saveSetting = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/save",
      data: $scope.default_setting
    }).then(
      function (response) {
        $scope.busy = false;
        if (!response.data.done) {
          $scope.error = response.data.error
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDeliveryEmployeesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.deliveryEmployeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadUnits = function () {
    $scope.busy = true;
    $scope.unitsList = [];
    $http({
      method: "POST",
      url: "/api/units/all",
      data: {
        select: {
          id: 1,
          name: 1,
          barcode: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.unitsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.loadKitchens = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/kitchen/all",
      data: {
        select: {
          id: 1,
          name: 1,
          printer_path: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.kitchensList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getPrintersPath = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/printers_path/all",
      data: {
        select: {
          id: 1,
          name: 1,
          type: 1,
          ip: 1,
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.printersPathList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStores();
  $scope.loadVendors();
  $scope.getPaymentMethodList();
  $scope.getDiscountMethodList();
  $scope.getPlaceProgramList();
  $scope.loadStoresOutTypes();
  $scope.loadItemsGroups();
  $scope.loadDelegates();
  $scope.getSourceType();
  $scope.loadSafesBank();
  $scope.loadUnits();
  $scope.loadCurrencies();
  $scope.loadSafesBox();
  $scope.loadStoresInTypes();
  $scope.loadSetting();
  $scope.getPrintersPath();
  $scope.getTransactionTypeList();
  if (site.feature('restaurant') || site.feature('pos')) {
    $scope.getDeliveryEmployeesList();
  }
  if (site.feature('restaurant')) {
    $scope.loadKitchens();
  }
});