app.controller("safes_payments", function ($scope, $http) {

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
    name: "مرتب فني"
  },
  {
    name: "مرتب موظف"
  },


  ];
  
  $scope.loadSafes = function () {
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.safes = response.data.list;
        }
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
            $scope.total_in += parseFloat(v.value);
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




  $scope.loadAll = function (where, limit) {
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes_payments/all",
      data: {
        where: where,
        limit: limit || 10000000000
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


  $scope.searchAll = function () {
    let where = {};


    if ($scope.search.date) {
      where['date'] = $scope.search.date;
    }

    if ($scope.search.safe && $scope.search.safe.id) {
      where['safe.id'] = $scope.search.safe.id;
    }


    if ($scope.search.value) {
      where['value'] = site.toNumber($scope.search.value);
    }

    if ($scope.search.source) {
      where['source'] = $scope.search.source.name;
    }
    if ($scope.search.transition_type) {
      where['transition_type'] = $scope.search.transition_type.type;
    }
    site.hideModal('#Safes_payment_SearchModal');

    $scope.loadAll(where, $scope.search.limit);


  };






  $scope.loadAll();
  // $scope.loadEmployees();
  $scope.loadSafes();


});