app.controller("accounting_guide_budget", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.accounting_guide_budget = {};

  $scope.displayAddGuideBudget = function () {
    $scope._search = {};

    $scope.error = '';
    $scope.accounting_guide_budget = {
      image_url: '/images/accounting_guide_budget.png',
      active: true,
      count: false,
      side: 'creditor',
      type: 'detailed'
    };
    site.showModal('#guideBudgetAddModal');
  };

  $scope.addGuideBudget = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#guideBudgetAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_guide_budget/add",
      data: $scope.accounting_guide_budget
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.accounting_guide_budget = {
            image_url: '/images/accounting_guide_budget.jpg',
            active: true,
            count: false,
            side: 'creditor',
            type: 'detailed'
          };

          $scope.success = '##word.add_done##';
          setTimeout(() => $scope.success = '', 1000);

          $scope.list.push(response.data.doc);
          $scope.count = $scope.count + 1;
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*write Inventory code*')) {
            $scope.error = "##word.enter_code_inventory##";
          } else if (response.data.error.like('*duplicate key*')) {
            $scope.error = "##word.accounting_banks_code_err##";

          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateGuideBudget = function (accounting_guide_budget) {
    $scope._search = {};

    $scope.error = '';
    $scope.viewGuideBudget(accounting_guide_budget);
    $scope.accounting_guide_budget = {};
    site.showModal('#guideBudgetUpdateModal');
  };

  $scope.updateGuideBudget = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#guideBudgetUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/accounting_guide_budget/update",
      data: $scope.accounting_guide_budget
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#guideBudgetUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayViewGuideBudget = function (accounting_guide_budget) {
    $scope.error = '';
    $scope.viewGuideBudget(accounting_guide_budget);
    $scope.accounting_guide_budget = {};
    site.showModal('#guideBudgetDetailsModal');
  };

  $scope.viewGuideBudget = function (accounting_guide_budget) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_guide_budget/view",
      data: {
        id: accounting_guide_budget.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.accounting_guide_budget = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteGuideBudget = function (accounting_guide_budget) {
    $scope.error = '';
    $scope.viewGuideBudget(accounting_guide_budget);
    $scope.accounting_guide_budget = {};
    site.showModal('#guideBudgetDeleteModal');
  };

  $scope.deleteGuideBudget = function () {
    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/accounting_guide_budget/delete",
      data: {
        id: $scope.accounting_guide_budget.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#guideBudgetDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count = $scope.count - 1;

            }

          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getGuideBudgetList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/accounting_guide_budget/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope._search = {};

    $scope.getGuideBudgetList($scope.search);
    site.hideModal('#guideBudgetSearchModal');
    $scope.search = {}

  };

  $scope.getGuideBudgetList();

});