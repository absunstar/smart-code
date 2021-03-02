app.controller("doctors", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.doctor = {};

  $scope.displayAddDoctor = function () {
    $scope.error = '';
    $scope.doctor = {
      image_url: '/images/doctor.png',
      active: true

    };
    site.showModal('#doctorAddModal');
    document.querySelector('#doctorAddModal .tab-link').click();

  };

  $scope.addDoctor = function () {
    $scope.error = '';
    const v = site.validated('#doctorAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/doctors/add",
      data: $scope.doctor
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#doctorAddModal');
          $scope.getDoctorList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateDoctor = function (doctor) {
    $scope.error = '';
    $scope.detailsDoctor(doctor);
    $scope.doctor = {};
    site.showModal('#doctorUpdateModal');
    document.querySelector('#doctorUpdateModal .tab-link').click();
  };

  $scope.updateDoctor = function () {
    $scope.error = '';
    const v = site.validated('#doctorUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/doctors/update",
      data: $scope.doctor
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#doctorUpdateModal');
          $scope.getDoctorList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsDoctor = function (doctor) {
    $scope.error = '';
    $scope.detailsDoctor(doctor);
    $scope.doctor = {};
    site.showModal('#doctorViewModal');
  };

  $scope.detailsDoctor = function (doctor) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/doctors/view",
      data: {
        id: doctor.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.doctor = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteDoctor = function (doctor) {
    $scope.error = '';
    $scope.detailsDoctor(doctor);
    $scope.doctor = {};
    site.showModal('#doctorDeleteModal');
  };

  $scope.deleteDoctor = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/doctors/delete",
      data: {
        id: $scope.doctor.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#doctorDeleteModal');
          $scope.getDoctorList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDoctorList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/doctors/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#doctorSearchModal');
          $scope.search ={};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };
  
 
  $scope.getSpecialtyList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_specialties/all",
      data: {
        where: {
          active: true
        },
        select : {id : 1 , name_ar: 1, name_en: 1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.specialtyList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true
        },
        select: { id: 1, name_ar: 1, name_en: 1 ,code:1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          'city.id': city.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaList = response.data.list;
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
        screen: "doctors"
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
    site.showModal('#doctorSearchModal');

  };

  $scope.searchAll = function () {
  
    $scope.getDoctorList($scope.search);
    site.hideModal('#doctorSearchModal');
    $scope.search ={};
  };

  $scope.getDoctorList();
  $scope.getGovList();
  $scope.getNumberingAuto();
  $scope.getSpecialtyList();

});