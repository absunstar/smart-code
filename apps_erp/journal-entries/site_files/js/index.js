app.controller("journal_entries", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.journal_entries = {};

  $scope.displayAddJournalEntries = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.journal_entries = {
      accountingList: []
    };
    $scope.search_cost_centers = '';
    $scope.search_account = '';
    $scope.cost_center = {};
    $scope.guide_account = {};

    site.showModal('#journalEntriesAddModal');
  };

  $scope.addJournalEntries = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#journalEntriesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/journal_entries/add",
      data: $scope.journal_entries
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#journalEntriesAddModal');
          $scope.getJournalEntriesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          } else if (response.data.error.like('*debtor_creditor_must_equal*')) {
            $scope.error = "##word.debtor_creditor_must_equal##"
          } else if (response.data.error.like('*sum_debit_credit_equal_amount*')) {
            $scope.error = "##word.sum_debit_credit_equal_amount##"
          } else if (response.data.error.like('*ratios_amounts_cost_centers_account*')) {

            $scope.error = `##word.ratios_amounts_cost_centers_account##   ( ${response.data.accounts_arr.join('-')} )`;
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

  $scope.displayUpdateJournalEntries = function (journal_entries) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsJournalEntries(journal_entries);
    $scope.journal_entries = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#journalEntriesUpdateModal');
  };

  $scope.updateJournalEntries = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#journalEntriesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/journal_entries/update",
      data: $scope.journal_entries
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#journalEntriesUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          } else if (response.data.error.like('*debtor_creditor_must_equal*')) {
            $scope.error = "##word.debtor_creditor_must_equal##"
          } else if (response.data.error.like('*sum_debit_credit_equal_amount*')) {
            $scope.error = "##word.sum_debit_credit_equal_amount##"
          } else if (response.data.error.like('*ratios_amounts_cost_centers_account*')) {

            $scope.error = `##word.ratios_amounts_cost_centers_account##   ( ${response.data.accounts_arr.join('-')} )`;
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsJournalEntries = function (journal_entries) {
    $scope.error = '';
    $scope.detailsJournalEntries(journal_entries);
    $scope.journal_entries = {};
    site.showModal('#lawsuitTypesDetailsModal');
  };

  $scope.detailsJournalEntries = function (journal_entries) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/journal_entries/view",
      data: {
        id: journal_entries.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.journal_entries = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteJournalEntries = function (journal_entries) {
    $scope.error = '';
    $scope.detailsJournalEntries(journal_entries);
    $scope.journal_entries = {};
    site.showModal('#journalEntriesDeleteModal');
  };

  $scope.deleteJournalEntries = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/journal_entries/delete",
      data: {
        id: $scope.journal_entries.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#journalEntriesDeleteModal');
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

  $scope.getJournalEntriesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/journal_entries/all",
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

  $scope.getCostCentersList = function (ev, search) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which !== 13) {
      return;
    };

    $scope.costCentersList = [];
    $http({
      method: "POST",
      url: "/api/accounting_cost_centers/all",
      data: {
        search: search,
        where: {
          type: 'detailed',
          status: 'active'
        },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1, type: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;

        $scope.search_cost_centers = '';
        $scope.cost_center = {};
        $scope.costCentersList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getGuideAccountList = function (ev, search) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which !== 13) {
      return;
    };

    $http({
      method: "POST",
      url: "/api/accounting_guide_accounts/all",
      data: {
        search: search,
        where: {
          status: 'active',
          type: 'detailed'
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.search_account = '';
          $scope.guide_account = {};
          $scope.guideAccountList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.selectGuideAccount = function (account) {
    $scope.error = '';
    let current_account = {
      name_ar: account.name_ar,
      name_en: account.name_en,
      code: account.code,
      currency: account.currency,
      side: account.side,
      cost_list: account.cost_list || []
    };

    if (account.side == 'creditor') {
      account.debtor = 0;
      current_account.debtor = account.debtor;

    } else if (account.side == 'debtor') {
      account.creditor = 0;
      current_account.creditor = account.creditor;

    }

    $scope.journal_entries.accountingList.push(current_account);

    site.hideModal('#accountsListModal');

  };

  $scope.selectCostCenter = function (costCenter) {
    $scope.error = '';

    if ($scope.current_account.cost_list && $scope.current_account.cost_list.length > 0) {
      let foundCostCenter = $scope.current_account.cost_list.some(_costCenter => _costCenter.code === costCenter.code);

      if (!foundCostCenter) {
        $scope.current_account.cost_list.push(costCenter)
      }
    } else {
      $scope.current_account.cost_list = [costCenter]
    }

  };

  $scope.showCostCentersList = function (account_list) {
    $scope.error = '';

    $scope.current_account = account_list;

    site.showModal('#costCentersModal');
  };

  $scope.calcDifference = function () {
    $timeout(() => {
      $scope.error = '';
      let creditor = 0;
      let debtor = 0;
      if ($scope.journal_entries.accountingList && $scope.journal_entries.accountingList.length > 0) {

        $scope.journal_entries.accountingList.forEach(_accList => {
          let amount = 0;
          if (_accList.creditor) {
            amount = _accList.creditor;
            creditor += _accList.creditor;

          } else if (_accList.debtor) {
            amount = _accList.debtor;
            debtor += _accList.debtor;
          }

          if (_accList.cost_list && _accList.cost_list.length > 0) {
            _accList.cost_list.forEach(_costList => {
              _costList.amount = amount * _costList.rate / 100
            });
          }

        });

      }
      $scope.journal_entries.debtor = debtor;
      $scope.journal_entries.creditor = creditor;

      $scope.journal_entries.difference = $scope.journal_entries.creditor - $scope.journal_entries.debtor;
    }, 250);
  };

  $scope.calcCostCentersRate = function (costCenter, x) {
    $timeout(() => {

      let amount = 0;

      if ($scope.current_account.creditor) {
        amount = $scope.current_account.creditor;
      } else if ($scope.current_account.debtor) {
        amount = $scope.current_account.debtor;
      }

      if (x) {
        costCenter.amount = amount * costCenter.rate / 100
      } else {
        costCenter.rate = costCenter.amount / amount * 100
      }


    }, 250);
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "journal_entries"
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
    $scope.getJournalEntriesList($scope.search);
    site.hideModal('#journalEntriesSearchModal');
    $scope.search = {}

  };

  $scope.getJournalEntriesList();
  $scope.getNumberingAuto();
});