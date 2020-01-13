app.controller("safes_payments", function ($scope, $http) {
  $scope._search = {};

  $scope.safe = {};

  $scope.transition_types = [{
    name: "##word.safes_payments_store_in##",
    id: 1,
    type: 'in'
  },
  {
    name: "##word.safes_payments_store_out##",
    id: 2,
    type: 'out'
  },
  ]

  $scope.loadEmployees = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          'trainer': { $ne: true },
          'delivery': { $ne: true }
        },
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employees = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.sourceList = [{
    name: "خزينة جديدة"
  },
  {
    name: "أذن توريد"
  },
  {
    name: "أذن صرف"
  },
  {
    name: "وارد"
  },
  {
    name: "منصرف"
  },
  {
    name: "سلفة موظف"
  },
  {
    name: "مديونية فني"
  },
  {
    name: "سداد سلفة لموظف"
  },
  {
    name: "حساب فاتورة"
  },
  {
    name: "مرتب فني"
  },
  {
    name: "مرتب موظف"
  },


  ];

  $scope.getSafeByType = function (obj) {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      $scope.loadSafes(obj.payment_method);
      if (obj.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box)
          obj.safe = $scope.defaultSettings.accounting.safe_box
      } else {
        if ($scope.defaultSettings.accounting.safe_bank)
          obj.safe = $scope.defaultSettings.accounting.safe_bank
      }
    }
  };

  $scope.loadSafes = function (method) {
    $scope.error = '';
    $scope.busy = true;
    let where = {};

    if (method.id == 1)
      where = { 'type.id': 1 };
    else where = { 'type.id': 2 };

    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          type: 1
        },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.safesList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDefaultSetting = function () {

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadAmountsInList = function (search) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes_payments/all",
      data: {
        where: {
          search: search
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.total_in = 0;
          response.data.list.forEach(v => {
            $scope.total_in += site.toNumber(v.value);
          });
          $scope.amountsInList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadAll = function (where) {
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes_payments/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
          site.hideModal('#safes_paymentsSearchModal');
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


  $scope.searchAll = function () {
 
    $scope._search = {};
    $scope.loadAll($scope.search);
    site.hideModal('#Safes_payment_SearchModal');
    $scope.search = {}

  };


  $scope.loadAll({ date: new Date() });
  // $scope.loadEmployees();
  $scope.getPaymentMethodList();
  $scope.getDefaultSetting();
});