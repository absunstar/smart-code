app.controller("nursing", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.nurse = {};

  $scope.displayAddNurse = function () {
    $scope.error = '';
    $scope.nurse = {
      image_url: '/images/nurse.png',
      active: true

    };
    site.showModal('#nurseAddModal');
    document.querySelector('#nurseAddModal .tab-link').click();

  };

  $scope.addNurse = function () {
    $scope.error = '';
    const v = site.validated('#nurseAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/nursing/add",
      data: $scope.nurse
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#nurseAddModal');
          $scope.getNurseList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateNurse = function (nurse) {
    $scope.error = '';
    $scope.detailsNurse(nurse);
    $scope.nurse = {};
    site.showModal('#nurseUpdateModal');
    document.querySelector('#nurseUpdateModal .tab-link').click();
  };

  $scope.updateNurse = function () {
    $scope.error = '';
    const v = site.validated('#nurseUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/nursing/update",
      data: $scope.nurse
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#nurseUpdateModal');
          $scope.getNurseList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsNurse = function (nurse) {
    $scope.error = '';
    $scope.detailsNurse(nurse);
    $scope.nurse = {};
    site.showModal('#nurseViewModal');
  };

  $scope.detailsNurse = function (nurse) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/nursing/view",
      data: {
        id: nurse.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.nurse = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteNurse = function (nurse) {
    $scope.error = '';
    $scope.detailsNurse(nurse);
    $scope.nurse = {};
    site.showModal('#nurseDeleteModal');
  };

  $scope.deleteNurse = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/nursing/delete",
      data: {
        id: $scope.nurse.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#nurseDeleteModal');
          $scope.getNurseList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getNurseList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/nursing/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#nursingSearchModal');
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
        select:{
          id: 1 , name_Ar: 1, name_En: 1
        }
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

  $scope.addFiles = function () {
    $scope.error = '';
    $scope.nurse.files_list = $scope.nurse.files_list || [];
    $scope.nurse.files_list.push({
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
        screen: "nursing"
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
    site.showModal('#nursingSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getNurseList($scope.search);
    site.hideModal('#nursingSearchModal');
    $scope.search ={};
  };

  $scope.getNurseList();
  $scope.getGovList();
  $scope.getFilesTypesList();
  $scope.getNumberingAuto();
  $scope.getSpecialtyList();

});