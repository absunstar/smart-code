app.controller("banks", function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.bank = {};

  $scope.displayAddBank = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.bank = {
      image_url: '/images/bank.jpeg',
      active: true,
      all_branches: false,
      branches_list: [{}],
      opening_balances: [{
        debit_value: 0,
        credit_value: 0
      }]
    };
    site.showModal('#bankAddModal');
  };

  $scope.addBank = function () {

    if ($scope.busy) {
      return;
    }

    $scope.error = '';
    const v = site.validated('#bankAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if (!$scope.bank.all_branches && $scope.bank.branches_list.length == 0) {
      $scope.error = "##word.branch_err##";
      return;
    } else if (!$scope.bank.all_branches && $scope.bank.branches_list.length > 0 && (!$scope.bank.branches_list[0].branch || !$scope.bank.branches_list[0].branch.code)) {
      $scope.error = "##word.branch_err##";
      return;
    }

    if ($scope.bank.all_branches) {
      $scope.bank.branches_list = $scope.companyBranchesList;
    };

    if ($scope.accountsSettingsList.link_cash_with_financial_transactions == true && !$scope.bank.gl_accounts) {

      $scope.error = "##word.account_error##";
      return;

    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/banks/add",
      data: $scope.bank
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.bank = {
            image_url: '/images/bank.jpeg',
            active: true,
            all_branches: false,
            branches_list: [{}],
            opening_balances: [{
              debit_value: 0,
              credit_value: 0
            }]
          };
          
          $scope.success = '##word.add_done##';
          setTimeout(() => $scope.success = '', 1000);
          
          $scope.list.push(response.data.doc);
          $scope.count += 1;
        } else {
          $scope.error = response.data.error;

          if (response.data.error.like('*duplicate key*')) {
            $scope.error = "##word.banks_code_err##";

          } else if (response.data.error.like('*write Inventory code*')) {
            $scope.error = "##word.enter_code_inventory##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateBank = function (bank) {
    $scope._search = {};
    $scope.error = '';
    $scope.detailsBank(bank);
    $scope.bank = {};
    site.showModal('#bankUpdateModal');
  };

  $scope.updateBank = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    $scope.error = '';
    const v = site.validated('#bankUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/banks/update",
      data: $scope.bank
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#bankUpdateModal');
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

  $scope.displayDetailsBank = function (bank) {
    $scope.error = '';
    $scope.detailsBank(bank);
    $scope.bank = {};
    site.showModal('#bankDetailsModal');
  };

  $scope.detailsBank = function (bank) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/banks/view",
      data: {
        id: bank.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.bank = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteBank = function (bank) {
    $scope.error = '';
    $scope.detailsBank(bank);
    $scope.bank = {};
    site.showModal('#bankDeleteModal');
  };

  $scope.deleteBank = function () {
    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/banks/delete",
      data: {
        id: $scope.bank.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#bankDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
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

  $scope.getBankList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/banks/all",
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

  $scope.getGuideAccountList = function () {
    $scope.error = '';
    $scope.guideAccountList = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_guide_accounts/all",
      data: {
        where: {
          type: 'detailed',
          status: 'active'
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.guideAccountList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCurrencyList = function () {
    $scope.error = '';
    $scope.currenciesList = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currencies/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.currenciesList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCurrenciesList = function (balance) {
    $scope.error = '';
    $scope.busy = true;
    $scope.currencyList = $scope.currencyList || [];
    $scope.currencyNameList = [];
    $http({
      method: "POST",
      url: "/api/currencies/all",
      data: {
        where: {
          id: balance.account_name.currency.id
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        balance.account_name.$currencyList = response.data.list;
        balance.currency = balance.account_name.$currencyList[0];
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAccountsSettingsList = function () {
    $scope.busy = true;
    $scope.accountsSettingsList = [];
    $http({
      method: "POST",
      url: "/api/gl_accounts_settings/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.accountsSettingsList = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getItem = function (ev) {
    if (ev.which === 13) {
      $scope.bank.opening_balances.push({
        debit_value: 0,
        credit_value: 0
      });
    }
  };

  $scope.getCompanyList = function (where) {
    $scope.busy = true;
    $scope.company = {};
    $scope.companyBranchesList = [];
    $http({
      method: "POST",
      url: "/api/company/view",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;

        $scope.companyBranchesList = response.data.doc.branch_list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope._search = {};

    $scope.getBankList($scope.search);
    site.hideModal('#bankSearchModal');
    $scope.search = {}
  };

  $scope.getScreenType = function () {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/numbering_transactions_status/get",
      data: {
        screen_name: "accounting_banks"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data) {
          $scope.disabledCode = response.data.doc == 'auto' ? true : false;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getScreenType();

  $scope.getBankList();
  $scope.getCurrencyList();
  $scope.getAccountsSettingsList();
  $scope.getGuideAccountList();
  $scope.getCompanyList();

  if ('##query.action##' == 'add') {
    $scope.displayAddBank();
  }
});