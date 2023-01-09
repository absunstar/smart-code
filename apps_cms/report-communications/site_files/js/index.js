


app.controller("reportCommunications", function ($scope, $http, $timeout) {
  $scope.search = {};

  $scope.reportCommunications = {};
  $scope.showTab = function (event, selector) {
    if (selector == '#ads') {
      site.showTabContent(event, selector);
      $scope.search.type = 'ads';
      $scope.getReports($scope.search);
    } else if (selector == '#comments') {
      site.showTabContent(event, selector);
      $scope.search.type = 'comments';
      $scope.getReports($scope.search);
    } else if (selector == '#replies') {
      site.showTabContent(event, selector);
      $scope.search.type = 'replies';
      $scope.getReports($scope.search);
    }
  };

  $scope.getReports = function (search) {
    $scope.busy = true;
    $scope.notific_list = [];
    $http({
      method: 'POST',
      url: '/api/reportCommunications/all',
      data: {
        where: search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) { }
    );
  };


  $scope.searchAll = function () {
    $scope._search = {};

    if ($scope.search)
      $scope.customer = $scope.search.customer;

    site.hideModal('#reportInvoicesCustomersSearchModal');
    $scope.search = {}
  };
  $scope.getReports({ type: 'ads' });
});
site.onLoad(() => {
  setTimeout(() => {
    let btn1 = document.querySelector('#reportCommunications .tab-link');
    if (btn1) {
      btn1.click();
    }
  }, 500);

});