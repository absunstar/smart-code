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
      $scope.error = v.messages[0].Ar;
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
      $scope.error = v.messages[0].Ar;
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
        select : {id : 1 , name_Ar: 1, name_En: 1}
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
        select: { id: 1, name_Ar: 1, name_En: 1 ,code:1}
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

  $scope.getFilesTypesList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/file_type/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.files_types_List = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDegreeList = function () {
    $http({
      method: "POST",
      url: "/api/degree/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.degreeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addFiles = function () {
    $scope.error = '';
    $scope.doctor.files_list = $scope.doctor.files_list || [];
    $scope.doctor.files_list.push({
      file_date : new Date(),
      file_upload_date : new Date(),
      upload_by : '##user.name##',
    })
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
  $scope.getDegreeList();
  $scope.getFilesTypesList();
  $scope.getNumberingAuto();
  $scope.getSpecialtyList();

});