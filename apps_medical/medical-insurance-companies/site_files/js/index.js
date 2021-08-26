app.controller("medicalInsuranceCompanies", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.medical_insurance_company = {};

  $scope.displayAddMedicalInsuranceCompany = function () {
    $scope.error = "";
    $scope.medical_insurance_company = {
      image_url: "/images/medical_insurance_company.png",
      active: true,
      per_year: false,
      need_approve: false,

      insurance_slides_list: [{}],

      black_analyse_list: [{}],
      black_scan_list: [{}],
      black_medicine_list: [],
      black_operation_list: [{}],

      approve_analyse_list: [{}],
      approve_scan_list: [{}],
      approve_medicine_list: [],
      approve_operation_list: [{}],
    };
    site.showModal("#medicalInsuranceCompanyAddModal");
    document
      .querySelector("#medicalInsuranceCompanyAddModal .tab-link")
      .click();
  };

  $scope.addMedicalInsuranceCompany = function () {
    $scope.error = "";
    const v = site.validated("#medicalInsuranceCompanyAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/add",
      data: $scope.medical_insurance_company,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#medicalInsuranceCompanyAddModal");
          $scope.getMedicalInsuranceCompanyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateMedicalInsuranceCompany = function (
    medical_insurance_company
  ) {
    $scope.error = "";
    $scope.detailsMedicalInsuranceCompany(medical_insurance_company);
    $scope.medical_insurance_company = {};
    site.showModal("#medicalInsuranceCompanyUpdateModal");
    document
      .querySelector("#medicalInsuranceCompanyUpdateModal .tab-link")
      .click();
  };

  $scope.updateMedicalInsuranceCompany = function () {
    $scope.error = "";
    const v = site.validated("#medicalInsuranceCompanyUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/update",
      data: $scope.medical_insurance_company,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#medicalInsuranceCompanyUpdateModal");
          $scope.getMedicalInsuranceCompanyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsMedicalInsuranceCompany = function (
    medical_insurance_company
  ) {
    $scope.error = "";
    $scope.detailsMedicalInsuranceCompany(medical_insurance_company);
    $scope.medical_insurance_company = {};
    site.showModal("#medicalInsuranceCompanyViewModal");
    document
      .querySelector("#medicalInsuranceCompanyViewModal .tab-link")
      .click();
  };

  $scope.detailsMedicalInsuranceCompany = function (medical_insurance_company) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/view",
      data: {
        id: medical_insurance_company.id,
      },
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
    );
  };

  $scope.displayDeleteMedicalInsuranceCompany = function (
    medical_insurance_company
  ) {
    $scope.error = "";
    $scope.detailsMedicalInsuranceCompany(medical_insurance_company);
    $scope.medical_insurance_company = {};
    site.showModal("#medicalInsuranceCompanyDeleteModal");
    document
      .querySelector("#medicalInsuranceCompanyDeleteModal .tab-link")
      .click();
  };

  $scope.deleteMedicalInsuranceCompany = function () {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/delete",
      data: {
        id: $scope.medical_insurance_company.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#medicalInsuranceCompanyDeleteModal");
          $scope.getMedicalInsuranceCompanyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getMedicalInsuranceCompanyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/all",
      data: {
        where: where,
      },
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
    );
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
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
    );
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          "gov.id": gov.id,
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
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
    );
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          "city.id": city.id,
          active: true,
        },
      },
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
    );
  };

  $scope.getAnalysisList = function (where) {
    $scope.busy = true;
    $scope.analysList = [];
    $http({
      method: "POST",
      url: "/api/analysis/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          price: 1,
          delivery_time: 1,
          period: 1,
          immediate: 1,
          male: 1,
          female: 1,
          child: 1,
        },
      },
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
    );
  };

  $scope.getItemsName = function (ev, type) {
    $scope.error = "";
    if (ev.which === 13) {
      if (!$scope.item) {
        $scope.item = {};
      }
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: { "item_type.id": 3 },
          search: $scope.item.search_item_name,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              let foundSize = false;

              response.data.list.forEach((_item) => {
                if (_item.sizes && _item.sizes.length > 0)
                  _item.sizes.forEach((_size) => {
                    _size.information_instructions =
                      _item.information_instructions;

                    let indxUnit = 0;
                    _size.add_sizes = _item.add_sizes;
                    if (
                      _size.size_units_list &&
                      _size.size_units_list.length > 0
                    )
                      _size.size_units_list.forEach((_unit, i) => {
                        if (_unit.id == _item.main_unit.id) indxUnit = i;
                      });

                    if (
                      _size.barcode === $scope.item.search_item_name ||
                      _size.size_units_list[indxUnit].barcode ===
                        $scope.item.search_item_name
                    ) {
                      _size.name_ar = _item.name_ar;
                      _size.name_en = _item.name_en;
                      _size.item_group = _item.item_group;
                      _size.count = 1;
                      _size.unit = _size.size_units_list[indxUnit];

                      if (
                        _size.branches_list &&
                        _size.branches_list.length > 0
                      ) {
                        let foundBranch = false;
                        let indxBranch = 0;
                        _size.branches_list.map((_branch, i) => {
                          if (_branch.code == "##session.branch.code##") {
                            foundBranch = true;
                            indxBranch = i;
                          }
                        });

                        if (foundBranch) {
                          if (
                            _size.branches_list[indxBranch].code ==
                            "##session.branch.code##"
                          ) {
                            if (
                              _size.branches_list[indxBranch].stores_list &&
                              _size.branches_list[indxBranch].stores_list
                                .length > 0
                            ) {
                              let foundStore = false;
                              let indxStore = 0;

                              if (foundStore)
                                _size.store_count =
                                  _size.branches_list[indxBranch].stores_list[
                                    indxStore
                                  ].current_count;
                            } else _size.store_count = 0;
                          } else _size.store_count = 0;
                        } else _size.store_count = 0;
                      } else _size.store_count = 0;
                      if (type == "black") {
                        foundSize =
                          $scope.medical_insurance_company.black_medicine_list.some(
                            (_itemSize) => _itemSize.barcode === _size.barcode
                          );

                        if (!foundSize)
                          $scope.medical_insurance_company.black_medicine_list.unshift(
                            _size
                          );
                      } else {
                        foundSize =
                          $scope.medical_insurance_company.approve_medicine_list.some(
                            (_itemSize) => _itemSize.barcode === _size.barcode
                          );

                        if (!foundSize)
                          $scope.medical_insurance_company.approve_medicine_list.unshift(
                            _size
                          );
                      }
                    }
                  });
              });

              if (!foundSize) $scope.itemsNameList = response.data.list;
              else if (foundSize) $scope.error = "##word.dublicate_item##";
            }
            $scope.item.search_item_name = "";
          } else {
            $scope.error = response.data.error;
            $scope.item = {
              sizes: [],
            };
          }
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.itemsMedicines = function (type) {
    $scope.error = "";
    let foundSize = false;
    if (
      $scope.item.itm &&
      $scope.item.itm.sizes &&
      $scope.item.itm.sizes.length > 0
    )
      $scope.item.itm.sizes.forEach((_item) => {
        _item.add_sizes = $scope.item.itm.add_sizes;
        _item.name_ar = $scope.item.itm.name_ar;
        _item.name_en = $scope.item.itm.name_en;
        _item.item_group = $scope.item.itm.item_group;
        _item.count = 1;
        let indxUnit = 0;
        if (_item.size_units_list && _item.size_units_list.length > 0) {
          indxUnit = _item.size_units_list.findIndex(
            (_unit) => _unit.id == $scope.item.itm.main_unit.id
          );

          _item.unit = _item.size_units_list[indxUnit];
        }

        if (_item.branches_list && _item.branches_list.length > 0) {
          let foundBranch = false;
          let indxBranch = 0;
          _item.branches_list.map((_branch, i) => {
            if (_branch.code == "##session.branch.code##") {
              foundBranch = true;
              indxBranch = i;
            }
          });
          if (foundBranch) {
            if (
              _item.branches_list[indxBranch].code == "##session.branch.code##"
            ) {
              if (
                _item.branches_list[indxBranch].stores_list &&
                _item.branches_list[indxBranch].stores_list.length > 0
              ) {
                let foundStore = false;
                let indxStore = 0;

                if (foundStore)
                  _item.store_count =
                    _item.branches_list[indxBranch].stores_list[
                      indxStore
                    ].current_count;
              } else _item.store_count = 0;
            } else _item.store_count = 0;
          } else _item.store_count = 0;
        } else _item.store_count = 0;

        if (type == "black") {
          foundSize = $scope.medical_insurance_company.black_medicine_list.some(
            (_itemSize) => _itemSize.barcode === _item.barcode
          );
          if (!foundSize)
            $scope.medical_insurance_company.black_medicine_list.unshift(_item);
        } else {
          foundSize =
            $scope.medical_insurance_company.approve_medicine_list.some(
              (_itemSize) => _itemSize.barcode === _item.barcode
            );
          if (!foundSize)
            $scope.medical_insurance_company.approve_medicine_list.unshift(
              _item
            );
        }
      });
  };

  $scope.viewInformationInstructions = function (c) {
    $scope.view_info_instruc = c;
    site.showModal("#informationInstructionsModal");
  };

  $scope.getOperationList = function (where) {
    $scope.busy = true;
    $scope.operationList = [];
    $http({
      method: "POST",
      url: "/api/operation/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1 },
      },
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
    );
  };

  $scope.getScansList = function (where) {
    $scope.busy = true;
    $scope.scansList = [];
    $http({
      method: "POST",
      url: "/api/scans/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          price: 1,
          delivery_time: 1,
          period: 1,
          immediate: 1,
        },
      },
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
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "medical_insurance_companies",
      },
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
    );
  };

  $scope.searchAll = function () {
    $scope.getMedicalInsuranceCompanyList($scope.search);
    site.hideModal("#medicalInsuranceCompanySearchModal");
    $scope.search = {};
  };

  $scope.getMedicalInsuranceCompanyList();
  $scope.getGovList();
  $scope.getAnalysisList();
  $scope.getNumberingAuto();
  $scope.getOperationList();
  $scope.getScansList();
});
