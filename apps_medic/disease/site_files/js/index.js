app.controller("disease", function ($scope, $http, $timeout) {

  $scope.disease = {};

  $scope.displayAddDisease = function () {
    $scope.error = '';
    $scope.disease = {
      image_url: '/images/disease.png',
      active: true

    };
    site.showModal('#diseaseAddModal');

  };

  $scope.addDisease = function () {
    $scope.error = '';
    const v = site.validated('#diseaseAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/disease/add",
      data: $scope.disease
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#diseaseAddModal');
          $scope.getDiseaseList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateDisease = function (disease) {
    $scope.error = '';
    $scope.viewDisease(disease);
    $scope.disease = {};
    site.showModal('#diseaseUpdateModal');
  };

  $scope.updateDisease = function () {
    $scope.error = '';
    const v = site.validated('#diseaseUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/disease/update",
      data: $scope.disease
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#diseaseUpdateModal');
          $scope.getDiseaseList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsDisease = function (disease) {
    $scope.error = '';
    $scope.viewDisease(disease);
    $scope.disease = {};
    site.showModal('#diseaseViewModal');
  };

  $scope.viewDisease = function (disease) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/disease/view",
      data: {
        id: disease.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disease = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteDisease = function (disease) {
    $scope.error = '';
    $scope.viewDisease(disease);
    $scope.disease = {};
    site.showModal('#diseaseDeleteModal');
  };

  $scope.deleteDisease = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/disease/delete",
      data: {
        id: $scope.disease.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#diseaseDeleteModal');
          $scope.getDiseaseList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDiseaseList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/disease/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#diseaseSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#diseaseSearchModal');

  };

  $scope.searchAll = function () {
 
    $scope.getDiseaseList($scope.search);
    site.hideModal('#diseaseSearchModal');
    $scope.search = {};
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "disease"
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

  $scope.getDiseaseList();
  $scope.getNumberingAuto();
});