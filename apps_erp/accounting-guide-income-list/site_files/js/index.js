app.controller("accounting_guide_income_list", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.accounting_guide_income_list = {};

  $scope.displayAddGuideIncomeList = function () {
    $scope._search = {};

    $scope.error = '';
    $scope.accounting_guide_income_list = {
      image_url: '/images/accounting_guide_income_list.png',
      active: true,
      side: 'creditor',
      type: 'detailed'
    };
    site.showModal('#guideIncomeListAddModal');
  };

  $scope.addGuideIncomeList = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#guideIncomeListAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_guide_income_list/add",
      data: $scope.accounting_guide_income_list
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.accounting_guide_income_list = {
            image_url: '/images/accounting_guide_income_list.jpg',
            active: true,
            side: 'creditor',
            type: 'detailed'
          };

          $scope.success = '##word.add_done##';
          setTimeout(() => $scope.success = '', 1000);

          $scope.count = $scope.count + 1;

          $scope.list.push(response.data.doc);
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*write Inventory code*')) {
            $scope.error = "##word.enter_code_inventory##";
          } else if (response.data.error.like('*duplicate key*')) {
            $scope.error = "##word.accounting_banks_code_err##";
          } else if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateGuideIncomeList = function (accounting_guide_income_list) {
    $scope._search = {};

    $scope.error = '';
    $scope.viewGuideIncomeList(accounting_guide_income_list);
    $scope.accounting_guide_income_list = {};
    site.showModal('#guideIncomeListUpdateModal');
  };

  $scope.updateGuideIncomeList = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#guideIncomeListUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/accounting_guide_income_list/update",
      data: $scope.accounting_guide_income_list
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#guideIncomeListUpdateModal');
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

  $scope.displayViewGuideIncomeList = function (accounting_guide_income_list) {
    $scope.error = '';
    $scope.viewGuideIncomeList(accounting_guide_income_list);
    $scope.accounting_guide_income_list = {};
    site.showModal('#guideIncomeListDetailsModal');
  };

  $scope.viewGuideIncomeList = function (accounting_guide_income_list) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_guide_income_list/view",
      data: {
        id: accounting_guide_income_list.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.accounting_guide_income_list = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteGuideIncomeList = function (accounting_guide_income_list) {
    $scope.error = '';
    $scope.viewGuideIncomeList(accounting_guide_income_list);
    $scope.accounting_guide_income_list = {};
    site.showModal('#guideIncomeListDeleteModal');
  };

  $scope.deleteGuideIncomeList = function () {
    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/accounting_guide_income_list/delete",
      data: {
        id: $scope.accounting_guide_income_list.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#guideIncomeListDeleteModal');
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

  $scope.getGuideIncomeListList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/accounting_guide_income_list/all",
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "guide_income_list"
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


  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getGuideIncomeListList($scope.search);
    site.hideModal('#guideIncomeListSearchModal');
    $scope.search = {}
  };
 

  $scope.getGuideIncomeListList();
  $scope.getNumberingAuto();
});