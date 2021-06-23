app.controller("report_itineraries", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_itineraries = {};

  $scope.getDelegateList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delegates/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.delegatesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getReportItinerariesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_itineraries/all",
      data: {
        where: where,
        select: {

        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = $scope.list.length;

          $scope.missions_existing = 0;
          $scope.missions_completed = 0;
          $scope.missions_canceled = 0;

          $scope.list.forEach(_itinerary => {

            if (_itinerary.status == 1) $scope.missions_existing = $scope.missions_existing + 1;
            if (_itinerary.status == 2) $scope.missions_completed = $scope.missions_completed + 1;
            if (_itinerary.status == 3) $scope.missions_canceled = $scope.missions_canceled + 1;

          });

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.showMissions = function (c) {
    $scope._search = {};
    $scope.itineraries = c;
    site.showModal('#reportInvoicesDetailsModal');
  };


  $scope.searchAll = function () {
    $scope._search = {};

    if ($scope.search)
      $scope.delegate = $scope.search.delegate;

    $scope.getReportItinerariesList($scope.search);
    site.hideModal('#reportItinerariesSearchModal');
    $scope.search = {}
  };

  $scope.getDelegateList();
});