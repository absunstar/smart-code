app.controller("medical_specialties", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.medical_specialty = {};

  $scope.displayAddMedicalSpecialty = function () {
    $scope.error = '';
    $scope.medical_specialty = {
      image_url: '/images/medical_specialty.png',
      active: true

    };

    site.showModal('#medicalSpecialtyAddModal');

  };

  $scope.addMedicalSpecialty = function () {
    $scope.error = '';
    const v = site.validated('#medicalSpecialtyAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_specialties/add",
      data: $scope.medical_specialty
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicalSpecialtyAddModal');
          $scope.getMedicalSpecialtyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
       
  $scope.displayUpdateMedicalSpecialty = function (medicalSpecialty) {
    $scope.error = '';
    $scope.detailsMedicalSpecialty(medicalSpecialty);
    $scope.medical_specialty = {};
    site.showModal('#medicalSpecialtyUpdateModal');
  };

  $scope.updateMedicalSpecialty = function () {
    $scope.error = '';
    const v = site.validated('#medicalSpecialtyUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_specialties/update",
      data: $scope.medical_specialty
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicalSpecialtyUpdateModal');
          $scope.getMedicalSpecialtyList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsMedicalSpecialty = function (medical_specialty) {
    $scope.error = '';
    $scope.detailsMedicalSpecialty(medical_specialty);
    $scope.medical_specialty = {};
    site.showModal('#medicalSpecialtyViewModal');
  };

  $scope.detailsMedicalSpecialty = function (medical_specialty) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/medical_specialties/view",
      data: {
        id: medical_specialty.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.medical_specialty = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteMedicalSpecialty = function (medical_specialty) {
    $scope.error = '';
    $scope.detailsMedicalSpecialty(medical_specialty);
    $scope.medical_specialty = {};
    site.showModal('#medicalSpecialtyDeleteModal');
  };

  $scope.deleteMedicalSpecialty = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/medical_specialties/delete",
      data: {
        id: $scope.medical_specialty.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicalSpecialtyDeleteModal');
          $scope.getMedicalSpecialtyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getMedicalSpecialtyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/medical_specialties/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#medicalSpecialtySearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
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
        screen: "medical_specialties"
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#medicalSpecialtySearchModal');

  };

  $scope.searchAll = function () {
  
    $scope.getMedicalSpecialtyList($scope.search);
    site.hideModal('#medicalSpecialtySearchModal');
    $scope.search = {};
  };
  
  $scope.getMedicalSpecialtyList();
  $scope.getNumberingAuto();
  

});