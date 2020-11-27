app.controller("numbering_transactions", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.numbering_show = true;
  $scope.numbering_transactions = {};

  $scope.openTab = function (m,type) {
    if (type == 'files') {
      site.showTabContent(event, '#tabFiles_' + m.id);
    } else {
      
      site.showTabContent(event, '#tab_' + m.id);
    }
   
  };

  $scope.getData = function () {
    $http({
      method: 'POST',
      url: '/api/numbering_transactions/get',
      data: {}
    }).then(
      function (response) {
        if (response.data.done) {
          $scope.numbering_transactions = response.data.doc;
        } else {
          $scope.numbering_transactions = {};
        }
      }
    )
  };


  $scope.saveTransactionNumbering = function () {

    if ($scope.busy) {
      return;
    }

    $scope.error = '';
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/numbering_transactions/save",
      data: $scope.numbering_transactions
    }).then(
      function (response) {
        $scope.busy = false;
        if (!response.data.done) {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getStatus = function (itm) {
    if (itm.current_value >= itm.value) {
      $scope.numbering_show =false
    }


  };


 
  

  $scope.getData();

});