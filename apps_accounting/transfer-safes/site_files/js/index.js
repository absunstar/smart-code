app.controller("transfer_safes", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.transfer_safes = {};

  $scope.displayAddTransferSafes = function () {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope._search = {};
        $scope.error = '';
        $scope.transfer_safes = {
          image_url: '/images/transfer_safes.png',
          shift: shift,
          date: new Date()
        };
        site.showModal('#transferSafesAddModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addTransferSafes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#transferSafesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

  
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/transfer_safes/add",
      data: $scope.transfer_safes
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#transferSafesAddModal');
          $scope.getTransferSafesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
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

  $scope.displayUpdateTransferSafes = function (transfer_safes) {

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope._search = {};

        $scope.error = '';
        $scope.detailsTransferSafes(transfer_safes);
        $scope.transfer_safes = {
          image_url: '/images/vendor_logo.png',

        };
        site.showModal('#transferSafesUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateTransferSafes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#transferSafesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
  
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/transfer_safes/update",
      data: $scope.transfer_safes
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#transferSafesUpdateModal');
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

  $scope.displayDetailsTransferSafes = function (transfer_safes) {
    $scope.error = '';
    $scope.detailsTransferSafes(transfer_safes);
    $scope.transfer_safes = {};
    site.showModal('#transferSafesDetailsModal');
  };

  $scope.detailsTransferSafes = function (transfer_safes) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_safes/view",
      data: {
        id: transfer_safes.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.transfer_safes = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteTransferSafes = function (transfer_safes) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.detailsTransferSafes(transfer_safes);
        $scope.transfer_safes = {};
        site.showModal('#transferSafesDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteTransferSafes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_safes/delete",
      data: {
        id: $scope.transfer_safes.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#transferSafesDeleteModal');
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

  $scope.getTransferSafesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/transfer_safes/all",
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
    $scope.getTransferSafesList($scope.search);
    site.hideModal('#transferSafesSearchModal');
    $scope.search = {}

  };


  $scope.getSafeTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.safeTypeList = [];
    $http({
      method: "POST",
      url: "/api/safe_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.safeTypesList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadCurrencies = function (safe, type) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name: 1,
          minor_currency: 1,
          ex_rate: 1,
          code: 1
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
          $scope.currenciesList.forEach(_c => {
            if (_c.id === safe.currency.id) {
              if (type === 'from') $scope.transfer_safes.currency_from = _c;
              if (type === 'to') $scope.transfer_safes.currency_to = _c;
            }
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadSafes = function (type,t) {
    $scope.error = '';
    $scope.busy = true;

    if (type && type.id) {

      let where = {};

      if (type.id == 1)
        where['type.id'] = 1;
      else where['type.id'] = 2;

      $http({
        method: "POST",
        url: "/api/safes/all",
        data: {
          select: {
            id: 1,
            name: 1,
            commission: 1,
            currency: 1,
            balance: 1,
            type: 1,
            code: 1
          },
          where: where
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {

            if (t === 'from') $scope.safesListFrom = response.data.list;
            if (t === 'to') $scope.safesListTo = response.data.list;
          }

        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    }
  };

  $scope.calc = function () {
    $timeout(() => {
    if($scope.transfer_safes.safe_from && $scope.transfer_safes.safe_to){

      let value_from = (($scope.transfer_safes.value_from || 0) * $scope.transfer_safes.currency_from.ex_rate);
      $scope.transfer_safes.value_to = value_from / $scope.transfer_safes.currency_to.ex_rate;

      $scope.transfer_safes.value_to = site.toNumber($scope.transfer_safes.value_to);

      $scope.transfer_safes.safe_transferred_from =$scope.transfer_safes.safe_from.balance + $scope.transfer_safes.value_from;
      $scope.transfer_safes.safe_transferred_to =$scope.transfer_safes.safe_to.balance + $scope.transfer_safes.value_to;



    }
      
    }, 300);

  },

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.shift = response.data.doc;
          callback(response.data.doc);
        } else {
          callback(null);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
        callback(null);
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
        screen: "transfer_safes"
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

  $scope.getNumberingAuto();
  $scope.getSafeTypeList();
  $scope.getTransferSafesList();
});