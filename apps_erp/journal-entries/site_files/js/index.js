app.controller("journal_entries", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.journal_entries = {};

  $scope.displayAddJournalEntries = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.journal_entries = {
      accountingList: [{}]
    };
    site.showModal('#journalEntriesAddModal');
  };

  $scope.addJournalEntries = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#journalEntriesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

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
    $scope.busy = true;

    const v = site.validated('#journalEntriesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
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


  $scope.getGuideAccountList = function (ev, search, account) {
    $scope.busy = true;
    if (ev.which !== 13) {
      return;
    };
    if (account) $scope.current_account = account;

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
          $scope.guideAccountList = response.data.list;
          site.showModal('#accountsListModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.selectGuideAccount = function (account) {
    if (account.side == 'creditor') {
      account.debtor = 0;
      $scope.current_account.debtor = account.debtor;

    } else if (account.side == 'debtor') {
      account.creditor = 0;
      $scope.current_account.creditor = account.creditor;

    }
    $scope.current_account.name_ar = account.name_ar;
    $scope.current_account.name_en = account.name_en;
    $scope.current_account.code = account.code;
    $scope.current_account.currency = account.currency;
    $scope.current_account.side = account.side;
    $scope.calcDifference();
    site.hideModal('#accountsListModal');

  };

  $scope.calcDifference = function () {
    $timeout(() => {
      let creditor = 0;
      let debtor = 0;
      if ($scope.journal_entries.accountingList && $scope.journal_entries.accountingList.length > 0) {

        $scope.journal_entries.accountingList.forEach(_accList => {
          if (_accList.creditor) creditor += _accList.creditor;
          else if (_accList.debtor) debtor += _accList.debtor;
        });

      }
      $scope.journal_entries.debtor = debtor;
      $scope.journal_entries.creditor = creditor;

      $scope.journal_entries.difference = $scope.journal_entries.creditor - $scope.journal_entries.debtor;
    }, 250);
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getJournalEntriesList($scope.search);
    site.hideModal('#journalEntriesSearchModal');
    $scope.search = {}

  };

  $scope.getJournalEntriesList();

});