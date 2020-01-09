app.controller("lawsuit_degrees", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.lawsuit_degrees = {};

  $scope.displayAddLawsuitDegrees = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.lawsuit_degrees = {
      image_url: '/images/lawsuit_degrees.png',
      active: true
    };
    site.showModal('#lawsuitDegreesAddModal');
  };

  $scope.addLawsuitDegrees = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#lawsuitDegreesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $http({
      method: "POST",
      url: "/api/lawsuit_degrees/add",
      data: $scope.lawsuit_degrees
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lawsuitDegreesAddModal');
          $scope.getLawsuitDegreesList();
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

  $scope.displayUpdateLawsuitDegrees = function (lawsuit_degrees) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsLawsuitDegrees(lawsuit_degrees);
    $scope.lawsuit_degrees = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#lawsuitDegreesUpdateModal');
  };

  $scope.updateLawsuitDegrees = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#lawsuitDegreesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $http({
      method: "POST",
      url: "/api/lawsuit_degrees/update",
      data: $scope.lawsuit_degrees
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lawsuitDegreesUpdateModal');
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

  $scope.displayDetailsLawsuitDegrees = function (lawsuit_degrees) {
    $scope.error = '';
    $scope.detailsLawsuitDegrees(lawsuit_degrees);
    $scope.lawsuit_degrees = {};
    site.showModal('#lawsuitDegreesDetailsModal');
  };

  $scope.detailsLawsuitDegrees = function (lawsuit_degrees) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lawsuit_degrees/view",
      data: {
        id: lawsuit_degrees.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.lawsuit_degrees = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteLawsuitDegrees = function (lawsuit_degrees) {
    $scope.error = '';
    $scope.detailsLawsuitDegrees(lawsuit_degrees);
    $scope.lawsuit_degrees = {};
    site.showModal('#lawsuitDegreesDeleteModal');
  };

  $scope.deleteLawsuitDegrees = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lawsuit_degrees/delete",
      data: {
        id: $scope.lawsuit_degrees.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lawsuitDegreesDeleteModal');
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

  $scope.getLawsuitDegreesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/lawsuit_degrees/all",
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
    $scope.getLawsuitDegreesList($scope.search);
    site.hideModal('#lawsuitDegreesSearchModal');
    $scope.search = {}

  };

  $scope.getLawsuitDegreesList();

});