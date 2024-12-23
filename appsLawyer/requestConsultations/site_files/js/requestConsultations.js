app.controller('requestConsultations', function ($scope, $http, $timeout) {
  $scope.item = {};
  $scope.baseURL = '';
  $scope.appName = 'requestConsultations';
  $scope.modalID = '#requestConsultationsModal';

  $scope.add = function (_item) {
    $scope.error = '';
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: `${$scope.baseURL}/api/${$scope.appName}/add`,
      data: $scope.item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = {};
          site.resetValidated($scope.modalID);

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
          price: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.typesConsultationsList = response.data.list;
          if('##query.consult##') {
            $scope.item.typeConsultation = $scope.typesConsultationsList.find((t)=>{return t.id == '##query.consult##'} )
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  
  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: site.toNumber('##query.lawyerId##'),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item.lawyer = {
            id :response.data.doc.id,
            firstName :response.data.doc.firstName,
            lastName :response.data.doc.lastName,
          };

        
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };
  
  $scope.getTypesConsultationsList();
  $scope.getConsultationsStatus();
  $scope.getConsultationsClassifications();
  if('##query.lawyerId##'){
    $scope.getUser();
  }
});
