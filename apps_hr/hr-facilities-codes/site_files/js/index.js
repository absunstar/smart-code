app.controller("facilities_codes", function ($scope, $http) {
  $scope._search = {};

  $scope.facility_code = {};


  $scope.loadFacilities_Codes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/facilities_codes/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.facilities_codes = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadAll = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/facilities_codes/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.newFacility_Code = function () {
    $scope.error = '';
    $scope.facility_code = { image_url: '/images/facility_code.png' };
    site.showModal('#addFacilityCodeModal');
  };

  $scope.add = function () {
    $scope.error = '';
    const v = site.validated('#addFacilityCodeModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/facilities_codes/add",
      data: $scope.facility_code
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addFacilityCodeModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
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

  $scope.edit = function (facility_code) {
    $scope.error = '';
    $scope.view(facility_code);
    $scope.facility_code = {};
    site.showModal('#updateFacilityCodeModal');
  };
  $scope.update = function () {
    $scope.error = '';
    const v = site.validated('#updateFacilityCodeModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/facilities_codes/update",
      data: $scope.facility_code
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateFacilityCodeModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.remove = function (facility_code) {
    $scope.view(facility_code);
    $scope.facility_code = {};
    site.showModal('#deleteFacilityCodeModal');
  };

  $scope.view = function (facility_code) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/facilities_codes/view",
      data: { _id: facility_code._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.facility_code = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.details = function (facility_code) {
    $scope.view(facility_code);
    $scope.facility_code = {};
    site.showModal('#viewFacilityCodeModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/facilities_codes/delete",
      data: { _id: $scope.facility_code._id, name: $scope.facility_code.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteFacilityCodeModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
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
        screen: "facilities"
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

  $scope.loadAll();
  $scope.loadFacilities_Codes();
  $scope.getNumberingAuto();
});
