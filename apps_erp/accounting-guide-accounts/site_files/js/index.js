app.controller("accounting_guide_accounts", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.accounting_guide_accounts = {};

  $scope.displayAddGuideAccounts = function (parent_guide_account) {
    $scope._search = {};

    $scope.error = '';

    if (parent_guide_account && parent_guide_account.type == 'detailed') {
      return;
    };

    $scope.accounting_guide_accounts = {
      image_url: '/images/accounting_guide_accounts.png',
      type: 'detailed',
      side: 'debtor',
      report: 'income_list',
      cost: 'choice',
      cash_flow: 'choice',
      status: 'active'
    };

    if (parent_guide_account) {
      $scope.accounting_guide_accounts.parent_id = parent_guide_account.id;
      $scope.accounting_guide_accounts.top_parent_id = parent_guide_account.top_parent_id || parent_guide_account.id;
    };

    if ($scope.accounting_guide_accounts.top_parent_id) {
      $scope.accounting_guide_accounts = {
        side: parent_guide_account.side,
        code: parent_guide_account.code,
        type: 'detailed',
        report: parent_guide_account.report,
        cost: parent_guide_account.cost,
        cash_flow: parent_guide_account.cash_flow,
        status: parent_guide_account.status,
        currency: parent_guide_account.currency,
        image_url: parent_guide_account.image_url
      };
      $scope.accounting_guide_accounts.parent_id = parent_guide_account.id;
      $scope.accounting_guide_accounts.top_parent_id = parent_guide_account.top_parent_id || parent_guide_account.id;
    };

    if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.auto_generate_account_code_and_cost_center) {
      $scope.accounting_guide_accounts.length_level = $scope.defaultSettings.accounting.length_level || 0;
    };

    site.showModal('#guideAccountsAddModal');
  };

  $scope.addGuideAccounts = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#guideAccountsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.accounting_guide_accounts.cost == 'mandatory') {
      if (!$scope.accounting_guide_accounts.cost_list || $scope.accounting_guide_accounts.cost_list.length < 1) {
        $scope.error = "##word.accounting_guide_accounts_cost_center_err##";
        return;
      }
    };

    if ($scope.defaultSettings.accounting.link_gl_accounts_with_income_statement_and_budget == true && $scope.accounting_guide_accounts.type == 'detailed') {
      if (!$scope.accounting_guide_accounts.category) {
        $scope.error = "##word.accounting_guide_accounts_category_err##";
        return;
      }
    };

    if ($scope.accounting_guide_accounts.cost_list && $scope.accounting_guide_accounts.cost_list.length > 0) {
      let total = 0;
      $scope.accounting_guide_accounts.cost_list.forEach(rates => {
        total += rates.rate;

      });
      if (total != 100) {
        $scope.error = "##word.accounting_guide_accounts_total_rate##";
        return;
      }
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_guide_accounts/add",
      data: $scope.accounting_guide_accounts
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.accounting_guide_accounts = {
            image_url: '/images/accounting_guide_accounts.jpg',
            type: 'detailed',
            side: 'debtor',
            report: 'income_list',
            cost: 'choice',
            cash_flow: 'choice',
            status: 'active'
          };
          site.hideModal('#guideAccountsAddModal');
          $scope.list.push(response.data.doc);
          $scope.getGuideAccountsList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key*')) {
            $scope.error = "##word.accounting_guide_accounts_code_err##";
          } else if (response.data.error.like('*enter tree code*')) {
            $scope.error = "##word.enter_code_tree##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateGuideAccounts = function (accounting_guide_accounts) {
    $scope._search = {};

    $scope.error = '';
    $scope.viewGuideAccounts(accounting_guide_accounts);
    $scope.accounting_guide_accounts = {};

    site.showModal('#guideAccountsUpdateModal');
  };

  $scope.updateGuideAccounts = function () {

    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#guideAccountsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.accounting_guide_accounts.cost_list && $scope.accounting_guide_accounts.cost_list.length > 0) {
      let total = 0;
      $scope.accounting_guide_accounts.cost_list.forEach(rates => {
        total += rates.rate;

      });
      if (total != 100) {
        $scope.error = "##word.accounting_guide_accounts_total_rate##";
        return;
      }
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/accounting_guide_accounts/update",
      data: $scope.accounting_guide_accounts
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#guideAccountsUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
            $scope.getGuideAccountsList();
          });
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Detailed Err*')) {
            $scope.error = "##word.detailed_err##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayViewGuideAccounts = function (accounting_guide_accounts) {
    $scope.error = '';
    $scope.viewGuideAccounts(accounting_guide_accounts);
    $scope.accounting_guide_accounts = {};
    site.showModal('#guideAccountsDetailsModal');
  };

  $scope.viewGuideAccounts = function (accounting_guide_accounts) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_guide_accounts/view",
      data: {
        id: accounting_guide_accounts.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.accounting_guide_accounts = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteGuideAccounts = function (accounting_guide_accounts) {
    $scope.error = '';
    $scope.viewGuideAccounts(accounting_guide_accounts);
    $scope.accounting_guide_accounts = {};
    site.showModal('#guideAccountsDeleteModal');
  };

  $scope.deleteGuideAccounts = function () {
    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/accounting_guide_accounts/delete",
      data: {
        id: $scope.accounting_guide_accounts.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          site.hideModal('#guideAccountsDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
            }
            $scope.getGuideAccountsList();
          });
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Delete Acc Err*')) {
            $scope.error = "##word.cant_delete##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getGuideAccountsList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/accounting_guide_accounts/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          response.data.list.forEach(n => {
            n.name2 = n.code + '-' + n.name_ar;
          });

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

  $scope.getCurrencyList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.currencyList = [];
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.currencyList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getCategoryList = function () {
    $scope.error = '';

    let url = '/api/accounting_guide_income_list/all';

    if ($scope.accounting_guide_accounts.report == 'budget') {
      url = '/api/accounting_guide_budget/all';
    } else if ($scope.accounting_guide_accounts.report == 'income_list') {
      url = '/api/accounting_guide_income_list/all';
    };

    $scope.categoryList = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: url,
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.categoryList = response.data.list;

      },
      function (err) {
        $scope.error = err;
      }
    )
  };


  $scope.getDefaultSetting = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.defaultSettings = [];
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
          $scope.disabledCode = response.data.doc.accounting.auto_generate_account_code_and_cost_center == true ? true : false;

        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getCostCentersList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.costCentersList = [];
    $http({
      method: "POST",
      url: "/api/accounting_cost_centers/all",
      data: {
        where: {
          type: 'detailed',
          status: 'active'
        }
      }
    }).then(
      function (response) {
        $scope.costCentersList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.pushCostCenters = function () {
    $scope.accounting_guide_accounts = $scope.accounting_guide_accounts || [];
    $scope.accounting_guide_accounts.cost_list = $scope.accounting_guide_accounts.cost_list || [];
    if ($scope.accounting_guide_accounts.cost_center.name_ar) {

      $scope.accounting_guide_accounts.cost_list.unshift({
        code: $scope.accounting_guide_accounts.cost_center.code,
        name_ar: $scope.accounting_guide_accounts.cost_center.name_ar,
        name_en: $scope.accounting_guide_accounts.cost_center.name_en
      });
    };
  };

  $scope.displayDeleteItemModal = function (index) {
    $scope.error = '';
    $scope.deletedIndex = index;
    site.showModal("#guideAccountsDelete");
  };

  $scope.deleteFromItms = function (index) {

    $scope.accounting_guide_accounts.cost_list = $scope.accounting_guide_accounts.cost_list || [];

    $scope.accounting_guide_accounts.cost_list.splice(index, 1);
    site.hideModal('#guideAccountsDelete');


  };

  $scope.searchAll = function () {
    $scope._search = {};

    let where = {};

    if ($scope.search.code) {

      where['code'] = $scope.search.code;
    }
    if ($scope.search.country) {

      where['country'] = $scope.search.country;
    }
    if ($scope.search.name_ar) {

      where['name_ar'] = $scope.search.name_ar;
    }
    if ($scope.search.name_en) {

      where['name_en'] = $scope.search.name_en;
    }
    if ($scope.search.swift_code) {

      where['swift_code'] = $scope.search.swift_code;
    }
    if ($scope.search.iban_number) {

      where['iban_number'] = $scope.search.iban_number;
    }
    if ($scope.search.customer_service) {

      where['customer_service'] = $scope.search.customer_service;
    }
    if ($scope.search.address) {

      where['address'] = $scope.search.address;
    }
    where['active'] = 'all';

    $scope.getGuideAccountsList(where);

    site.hideModal('#guideAccountsSearchModal');
    $scope.search = {}

  };


  $scope.getCategoryList();
  $scope.getGuideAccountsList();
  $scope.getCurrencyList();
  $scope.getDefaultSetting();
  $scope.getCostCentersList();
});