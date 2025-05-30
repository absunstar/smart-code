app.controller('qr_storeout', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.print = function () {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;
    if ($scope.defaultSettings.printer_program.a4_printer) {
      if ($scope.store_out.items.length > 7) {
        $scope.invList = [];
        let inv_length = $scope.store_out.items.length / 7;
        inv_length = parseInt(inv_length);
        let ramain_items = $scope.store_out.items.length - inv_length * 7;

        if (ramain_items) {
          inv_length += 1;
        }

        for (let i_inv = 0; i_inv < inv_length; i_inv++) {
          let s_o = { ...$scope.store_out };

          s_o.items = [];
          $scope.store_out.items.forEach((itm, i) => {
            itm.$index = i + 1;
            if (i < (i_inv + 1) * 7 && !itm.$done_inv) {
              itm.$done_inv = true;
              s_o.items.push(itm);
            }
          });

          $scope.invList.push(s_o);
        }
      } else {
        $scope.store_out.items.forEach((_item, i) => {
          _item.$index = i + 1;
        });
        $scope.invList = [{ ...$scope.store_out }];
      }
      $timeout(() => {
        site.print({
          selector: '#storeOutDetails',
          ip: '127.0.0.1',
          port: '60080',
          printer: $scope.defaultSettings.printer_program.a4_printer.ip.name.trim(),
        });
      }, 2000);
    } else {
      $scope.error = '##word.a4_printer_must_select##';
    }
    $scope.busy = false;
  };

  $scope.view = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_out/view',
      data: {
        id: site.toNumber('##query.id##'),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_out = response.data.doc;

          if ($scope.store_out.currency) {
            site.strings['currency'] = {
              Ar: ' ' + $scope.store_out.currency.name_Ar + ' ',
              En: ' ' + $scope.store_out.currency.name_En + ' ',
            };
            site.strings['from100'] = {
              Ar: ' ' + $scope.store_out.currency.minor_currency_Ar + ' ',
              En: ' ' + $scope.store_out.currency.minor_currency_En+ ' ',
            };
            $scope.store_out.net_txt = site.stringfiy($scope.store_out.net_value);
          }
          $scope.getDefaultSettings();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getDefaultSettings = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {
        company: $scope.store_out.company,
        branch: $scope.store_out.branch,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
          $scope.invoice_logo = document.location.origin + $scope.defaultSettings.printer_program.invoice_logo;

          if ($scope.store_out.currency) {
            site.strings['currency'] = {
              Ar: ' ' + $scope.store_out.currency.name_Ar + ' ',
              En: ' ' + $scope.store_out.currency.name_En + ' ',
            };
            site.strings['from100'] = {
              Ar: ' ' + $scope.store_out.currency.minor_currency_Ar + ' ',
              En: ' ' + $scope.store_out.currency.minor_currency_En+ ' ',
            };
            $scope.store_out.net_txt = site.stringfiy($scope.store_out.net_value);
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.view();
});
