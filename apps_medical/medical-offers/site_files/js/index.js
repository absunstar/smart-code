app.controller("medical_offers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.medical_offers = {};

  $scope.displayAddMedicalOffers = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.medical_offers = {
      image_url: '/images/medical_offers.png',
      start_date : new Date(),
      old_price:0,
      new_price:0,
      active: true
    };
    site.showModal('#medicalOffersAddModal');
  };

  $scope.addMedicalOffers = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#medicalOffersAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/medical_offers/add",
      data: $scope.medical_offers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicalOffersAddModal');
          $scope.getMedicalOffersList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          } else if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateMedicalOffers = function (medical_offers) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsMedicalOffers(medical_offers);
    $scope.medical_offers = {};
    site.showModal('#medicalOffersUpdateModal');
  };

  $scope.updateMedicalOffers = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#medicalOffersUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
 
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/medical_offers/update",
      data: $scope.medical_offers
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicalOffersUpdateModal');
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

  $scope.displayDetailsMedicalOffers = function (medical_offers) {
    $scope.error = '';
    $scope.detailsMedicalOffers(medical_offers);
    $scope.medical_offers = {};
    site.showModal('#medicalOffersDetailsModal');
  };

  $scope.detailsMedicalOffers = function (medical_offers) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_offers/view",
      data: {
        id: medical_offers.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.medical_offers = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteMedicalOffers = function (medical_offers) {
    $scope.error = '';
    $scope.detailsMedicalOffers(medical_offers);
    $scope.medical_offers = {};
    site.showModal('#medicalOffersDeleteModal');
  };

  $scope.deleteMedicalOffers = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_offers/delete",
      data: {
        id: $scope.medical_offers.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicalOffersDeleteModal');
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

  $scope.getMedicalOffersList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/medical_offers/all",
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
    $scope.getMedicalOffersList($scope.search);
    site.hideModal('#medicalOffersSearchModal');
    $scope.search = {}

  };

  $scope.getSubjects = function () {
    $http({
      method: "POST",
      url: "/api/subjects/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.subjectsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
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
        screen: "medical_offers"
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

  $scope.getNumberingAuto();
  $scope.getSubjects();
  $scope.getMedicalOffersList();

});