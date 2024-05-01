app.controller('requestConsultations', function ($scope, $http, $timeout) {
  $scope.item = {};

  $scope.getConsultationsStatus = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/consultationsStatus",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.consultationsStatusList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getConsultationsClassifications = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/consultationsClassifications",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.consultationsClassificationsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getTypesConsultationsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/typesConsultations/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.typesConsultationsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getTypesConsultationsList();
  $scope.getConsultationsStatus();
  $scope.getConsultationsClassifications();
});
