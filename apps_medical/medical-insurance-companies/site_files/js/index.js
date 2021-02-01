app.controller("medicalInsuranceCompanies", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.medical_insurance_company = {};

  $scope.displayAddMedicalInsuranceCompany = function () {
    $scope.error = '';
    $scope.medical_insurance_company = {
      image_url: '/images/medical_insurance_company.png',
      active: true,
      per_year: false,
      need_approve: false,

      insurance_slides_list: [{}],

      black_analyse_list: [{}],
      black_scan_list: [{}],
      black_drug_list: [{}],
      black_operation_list: [{}],

      approve_analyse_list: [{}],
      approve_scan_list: [{}],
      approve_drug_list: [{}],
      approve_operation_list: [{}]
    };
    site.showModal('#medicalInsuranceCompanyAddModal');
    document.querySelector('#medicalInsuranceCompanyAddModal .tab-link').click();
  };

  $scope.addMedicalInsuranceCompany = function () {
    $scope.error = '';
    const v = site.validated('#medicalInsuranceCompanyAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/add",
      data: $scope.medical_insurance_company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicalInsuranceCompanyAddModal');
          $scope.getMedicalInsuranceCompanyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateMedicalInsuranceCompany = function (medical_insurance_company) {
    $scope.error = '';
    $scope.detailsMedicalInsuranceCompany(medical_insurance_company);
    $scope.medical_insurance_company = {};
    site.showModal('#medicalInsuranceCompanyUpdateModal');
    document.querySelector('#medicalInsuranceCompanyUpdateModal .tab-link').click();
  };

  $scope.updateMedicalInsuranceCompany = function () {
    $scope.error = '';
    const v = site.validated('#medicalInsuranceCompanyUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/update",
      data: $scope.medical_insurance_company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicalInsuranceCompanyUpdateModal');
          $scope.getMedicalInsuranceCompanyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsMedicalInsuranceCompany = function (medical_insurance_company) {
    $scope.error = '';
    $scope.detailsMedicalInsuranceCompany(medical_insurance_company);
    $scope.medical_insurance_company = {};
    site.showModal('#medicalInsuranceCompanyViewModal');
    document.querySelector('#medicalInsuranceCompanyViewModal .tab-link').click();

  };

  $scope.detailsMedicalInsuranceCompany = function (medical_insurance_company) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/view",
      data: {
        id: medical_insurance_company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.medical_insurance_company = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteMedicalInsuranceCompany = function (medical_insurance_company) {
    $scope.error = '';
    $scope.detailsMedicalInsuranceCompany(medical_insurance_company);
    $scope.medical_insurance_company = {};
    site.showModal('#medicalInsuranceCompanyDeleteModal');
    document.querySelector('#medicalInsuranceCompanyDeleteModal .tab-link').click();

  };

  $scope.deleteMedicalInsuranceCompany = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/delete",
      data: {
        id: $scope.medical_insurance_company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#medicalInsuranceCompanyDeleteModal');
          $scope.getMedicalInsuranceCompanyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getMedicalInsuranceCompanyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.list = response.data.list;
        $scope.count = response.data.count;
        $scope.search = {};

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
        select: { id: 1, name: 1, code: 1 }
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
        select: { id: 1, name: 1, code: 1 }
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

  $scope.getAnalysesList = function (where) {
    $scope.busy = true;
    $scope.analysList = [];
    $http({
      method: "POST",
      url: "/api/analyses/all",
      data: {
        where: {
          active: true
        },
        select:{id:1, name:1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.analysList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getDrugsList = function (where) {
    $scope.busy = true;
    $scope.drugsList = [];
    $http({
      method: "POST",
      url: "/api/drugs/all",
      data: {
        where: {
          active: true
        },
        select:{id:1, name:1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.drugsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getOperationList = function (where) {
    $scope.busy = true;
    $scope.operationList = [];
    $http({
      method: "POST",
      url: "/api/operation/all",
      data: {
        where: {
          active: true
        },
        select:{id:1, name:1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.operationList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getScansList = function (where) {
    $scope.busy = true;
    $scope.scansList = [];
    $http({
      method: "POST",
      url: "/api/scans/all",
      data: {
        where: {
          active: true
        },
        select:{id:1, name:1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.scansList = response.data.list;
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
        screen: "medical_insurance_companies"
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

  $scope.searchAll = function () {

    $scope.getMedicalInsuranceCompanyList($scope.search);
    site.hideModal('#medicalInsuranceCompanySearchModal');
    $scope.search = {};
  };

  $scope.getMedicalInsuranceCompanyList();
  $scope.getGovList();
  $scope.getAnalysesList();
  $scope.getNumberingAuto();
  $scope.getDrugsList();
  $scope.getOperationList();
  $scope.getScansList();
});