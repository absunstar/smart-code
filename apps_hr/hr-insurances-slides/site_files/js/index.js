app.controller("insurances_slides", function ($scope, $http) {
  $scope._search = {};

  $scope.insurance_slide = {};


  $scope.loadinsurances_slides = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/insurances_slides/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1 ,code:1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.insurances_slides = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadAll = function (where, limit) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/insurances_slides/all",
      data: {
        where: where,
        limit: limit || 10000000
      }
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

  $scope.searchAll = function () {
    let where = {};



    if ($scope.search.name) {
      where['name'] = parseInt($scope.search.name);
    }

    if ($scope.search.value) {
      where['value'] = ($scope.search.value);
    }

    if ($scope.search.details) {
      where['details'] = ($scope.search.details);
    }

    $scope.loadAll(where, $scope.search.limit);
  };


  $scope.newInsurance_Slide = function () {
    $scope.error = '';
    $scope.insurance_slide = { image_url: '/images/insurance_slides.png' };
    site.showModal('#addInsuranceSlideModal');
  };
  $scope.add = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/insurances_slides/add",
      data: $scope.insurance_slide
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addInsuranceSlideModal');
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

  $scope.edit = function (insurance_slide) {
    $scope.error = '';
    $scope.view(insurance_slide);
    $scope.insurance_slide = {};
    site.showModal('#updateInsuranceSlideModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/insurances_slides/update",
      data: $scope.insurance_slide
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateInsuranceSlideModal');
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

  $scope.remove = function (insurance_slide) {
    $scope.view(insurance_slide);
    $scope.insurance_slide = {};
    site.showModal('#deleteInsuranceSlideModal');
  };

  $scope.view = function (insurance_slide) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/insurances_slides/view",
      data: { _id: insurance_slide._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.insurance_slide = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.details = function (insurance_slide) {
    $scope.view(insurance_slide);
    $scope.insurance_slide = {};
    site.showModal('#viewInsuranceSlideModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/insurances_slides/delete",
      data: { _id: $scope.insurance_slide._id, name: $scope.insurance_slide.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteInsuranceSlideModal');
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
        screen: "insurance_slides"
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
  $scope.loadinsurances_slides();
  $scope.getNumberingAuto();
});
