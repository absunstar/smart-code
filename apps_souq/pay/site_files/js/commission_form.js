app.controller('commission_form', function ($scope, $http, $timeout) {
  $scope.pay = {};
  $scope.commission_due = 0;


  $scope.calc = function () {
    $timeout(() => {
      let commission_value = 0;
      if($scope.defaultSettings.show_commission_add_content){
        commission_value = site.toNumber($scope.defaultSettings.commission_value)
      }
      $scope.commission_due = 0;
     $scope.commission_due = ($scope.price * commission_value) / 100;
     if($scope.commission_due < 1) {
      $scope.commission_due = 0;
     }
    }, 300);

  },

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addCommission = function (pay) {
    $scope.error = '';

    if(site.toNumber('##user.id##') > 0) {
      pay.user_name = '##user.profile.name##' + ' ' + '##user.profile.last_name##';
      pay.mobile = '##user.mobile##';
    }

    const v = site.validated('#payModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/pay/add',
      data: pay,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.pay = {};
          site.showModal("#alert");
          $timeout(() => {
            site.hideModal("#alert");

          }, 1500);
        } else {
          $scope.error = response.data.error;
        
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };



  $scope.getDefaultSetting();

});
