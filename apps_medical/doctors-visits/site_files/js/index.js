app.controller("doctors_visits", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.doctors_visits = {};
  $scope.search_linic = {};

  $scope.displayAddDoctorsVisits = function () {
    $scope.error = "";
    $scope.doctors_visits = {};
    $scope.customer_search = "";
    $scope.doctor_search = "";
    $scope.clinic_search = {};
    $scope.address = false;
    $scope.spicialty = false;
    $scope.doctor = false;
    $scope.clinicBookList = [];

    $scope.doctors_visits = {
      image_url: "/images/doctors_visits.png",
      active: true,
      date: new Date(),
      status: $scope.statusList[0],
      scans_list: [{ active: true }],
      analysis_list: [{ active: true }],
      operation_list: [{ active: true }],
      favorite_food_list: [{}],
      favorite_drink_list: [{}],
      forbidden_food_list: [{}],
      forbidden_drink_list: [{}],
      paid: 0,
    };

    if ($scope.defaultSettings.general_Settings) {
      if ($scope.defaultSettings.general_Settings.specialty) {
        $scope.doctors_visits.specialty = $scope.specialtyList.find(
          (_specialty) => {
            return (
              _specialty.id ===
              $scope.defaultSettings.general_Settings.specialty.id
            );
          }
        );
      }

      if ($scope.defaultSettings.general_Settings.clinic)
        $scope.doctors_visits.clinic = $scope.clinicList.find((_clinic) => {
          return (
            _clinic.id === $scope.defaultSettings.general_Settings.clinic.id
          );
        });

      if ($scope.defaultSettings.general_Settings.visit_type)
        $scope.doctors_visits.visit_type =
          $scope.defaultSettings.general_Settings.visit_type;
    }
    site.showModal("#doctorsVisitsAddModal");
  };

  $scope.addDoctorsVisits = function () {
    $scope.error = "";
    const v = site.validated("#doctorsVisitsAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.clinic = $scope.clinic || {};
    $scope.clinic.vacation_list = $scope.clinic.vacation_list || [];
    let found_vacation = $scope.clinic.vacation_list.some(
      (_vacation) =>
        new Date($scope.doctors_visits.date) == new Date(_vacation.date)
    );

    if (found_vacation) {
      $scope.error = "##word.cannot_booked_holiday_clinic##";
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/doctors_visits/add",
      data: $scope.doctors_visits,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#doctorsVisitsAddModal");
          $scope.getDoctorsVisitsList({ date: new Date() });
        } else {
          $scope.error = "Please Login First";
          if (response.data.error.like("*Must Enter Code*")) {
            $scope.error = "##word.must_enter_code##";
          } else if (
            response.data.error.like("*holding ticket for this patient*")
          ) {
            $scope.error = "##word.err_hold_ticket_patient##";
          } else if (response.data.error.like("*must selected time*")) {
            $scope.error = "##word.must_selected_time##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDynamicDoctorsVisits = function () {
    $scope.error = "";
    $scope.doctors_visits = {};
    $scope.doctor_search = "";
    $scope.clinic_search = {};
    $scope.address = false;
    $scope.spicialty = false;
    $scope.doctor = false;

    $scope.dynamic_doctors_visits = {
      image_url: "/images/doctors_visits.png",
      active: true,
      status: $scope.statusList[4],
      medicines_list: [
        {
          active: true,
        },
      ],
      scans_list: [
        {
          active: true,
        },
      ],
      analysis_list: [
        {
          active: true,
        },
      ],
      operation_list: [
        {
          active: true,
        },
      ],
    };
    site.showModal("#dynamicDoctorsVisitsModal");
  };

  $scope.GenerateDoctorsVisits = function () {
    $scope.error = "";
    const v = site.validated("#dynamicDoctorsVisitsModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/doctors_visits/generate_doctors_visits",
      data: {
        clinic: {
          id: $scope.dynamic_doctors_visits.clinic.id,
          name: $scope.dynamic_doctors_visits.clinic.name,
        },
        doctor: {
          detection_Duration:
            $scope.dynamic_doctors_visits.doctor.detection_Duration,
          id: $scope.dynamic_doctors_visits.doctor.id,
          name: $scope.dynamic_doctors_visits.doctor.name,
          specialty: $scope.dynamic_doctors_visits.doctor.specialty,
        },
        shift: $scope.dynamic_doctors_visits.shift,
        period_doctors_visits:
          $scope.dynamic_doctors_visits.period_doctors_visits,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#dynamicDoctorsVisitsModal");
          $scope.getDoctorsVisitsList({ date: new Date() });
        } else {
          $scope.error = "Please Login First";
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateDoctorsVisits = function (doctors_visits) {
    $scope.error = "";
    $scope.detailsDoctorsVisits(doctors_visits);
    /*   $scope.doctors_visits = {
        status: $scope.statusList[0],
  
      }; */
    site.showModal("#doctorsVisitsUpdateModal");
    document.querySelector("#doctorsVisitsUpdateModal .tab-link").click();
  };

  $scope.updateDoctorsVisits = function () {
    $scope.error = "";
    const v = site.validated("#doctorsVisitsUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.doctors_visits.status.id === 5) {
      $scope.doctors_visits.status = $scope.statusList[0];
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/doctors_visits/update",
      data: $scope.doctors_visits,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#doctorsVisitsUpdateModal");
          site.hideModal("#doctorsVisitsViewModal");
          $scope.getDoctorsVisitsList({ date: new Date() });
        } else {
          $scope.error = "Please Login First";
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.updateView = function () {
    $scope.error = "";

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/doctors_visits/update",
      data: $scope.doctors_visits,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#doctorsVisitsViewModal");
          site.hideModal("#doctorsVisitsNotes");
          $scope.getDoctorsVisitsList({ date: new Date() });
        } else {
          $scope.error = "Please Login First";
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.updateStatus = function () {
    $scope.error = "";

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/doctors_visits/update",
      data: $scope.doctors_visits,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = "Please Login First";
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsDoctorsVisits = function (doctors_visits) {
    $scope.error = "";
    $scope.detailsDoctorsVisits(doctors_visits);
    $scope.doctors_visits = {};
    site.showModal("#doctorsVisitsViewModal");
    document.querySelector("#doctorsVisitsViewModal .tab-link").click();
  };

  $scope.detailsDoctorsVisits = function (doctors_visits) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/doctors_visits/view",
      data: {
        id: doctors_visits.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.doctors_visits = response.data.doc;
          $scope.clinicList = [$scope.doctors_visits.selected_clinic];
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteDoctorsVisits = function (doctors_visits) {
    $scope.error = "";
    $scope.detailsDoctorsVisits(doctors_visits);
    $scope.doctors_visits = {};
    site.showModal("#doctorsVisitsDeleteModal");
    document.querySelector("#doctorsVisitsDeleteModal .tab-link").click();
  };

  $scope.deleteDoctorsVisits = function () {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: "/api/doctors_visits/delete",
      data: {
        id: $scope.doctors_visits.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#doctorsVisitsDeleteModal");
          site.hideModal("#doctorsVisitsViewModal");
          $scope.getDoctorsVisitsList({ date: new Date() });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getDoctorsVisitsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/doctors_visits/all",
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal("#doctorsVisitsSearchModal");
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSpecialtyList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medical_specialties/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.specialtyList = response.data.list;
          $scope.specialtyList.unshift({
            id: 0,
            name_ar: "كل التخصصات",
            name_en: "All specialties",
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getClinicList = function (where) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/clinics/all",
      data: {
        where: where,
        /*  select: {
           id: 1,
           name_ar: 1, name_en: 1,
           doctor_list: 1,
           specialty: 1
         } */
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.clinicList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getClinicList2 = function (where) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/clinics/all",
      data: {
        where: where,
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          doctor_list: 1,
          specialty: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.clinicList2 = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getClinicBookList = function (search_linic) {
    $scope.error = "";

    const v = site.validated("#doctorsVisitsAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/clinics/all",
      data: {
        where: {
          specialty: search_linic.specialty,
          clinic: search_linic.clinic,
          doctor: search_linic.doctor,
          active: true,
        },
        /*  select: {
           id: 1,
           name_ar: 1, name_en: 1,
           doctor_list: 1,
           specialty: 1
         } */
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.clinicBookList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDoctorList = function (ev) {
    $scope.error = "";

    $scope.busy = true;
    if (ev.which !== 13) {
      return;
    }

    let where = {};
    if ($scope.search_linic.specialty && $scope.search_linic.specialty.id > 0) {
      where = {
        "specialty.id": $scope.search_linic.specialty.id,
      };
    }

    $scope.doctorList = [];
    $http({
      method: "POST",
      url: "/api/doctors/all",
      data: {
        search: $scope.doctor_search,
        where: where,
        select: {},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.doctorList = response.data.list;
          $scope.doctor_search = "";
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getMedicinesList = function (ev, item) {
    $scope.error = "";
    let barcode = "";

    if (ev.which !== 13 && ev != "alt_view") {
      return;
    }

    $scope.busy = true;

    let where = {};
    where = { "item_type.id": 3 };

    if (
      ev === "alt_view" &&
      item.information_instructions.active_substance &&
      item.information_instructions.active_substance.id
    ) {
      where = {
        "item_type.id": 3,
        "information_instructions.active_substance.id":
          item.information_instructions.active_substance.id,
      };
      barcode = item.barcode;
    }

    $scope.medicine = $scope.medicine || {
      search: "",
      item: {},
      list: [],
      alternative_list: [],
    };

    $scope.medicine.alternative_list = [];
    $scope.medicine.list = [];
    $scope.medicine.item = {};

    $http({
      method: "POST",
      url: "/api/stores_items/sizes_all",
      data: {
        search: $scope.medicine.search,
        barcode: barcode,
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          if (ev === "alt_view") {
            $scope.medicine.alternative_list = response.data.list;
            site.showModal("#selectItemsModal");
          } else {
            $scope.medicine.list = response.data.list;
          }

          $scope.medicine.search = "";
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.selectMedicine = function (item) {
    $scope.doctors_visits.medicines_list =
      $scope.doctors_visits.medicines_list || [];

    let foundSize = $scope.doctors_visits.medicines_list.some(
      (_itemSize) => _itemSize.barcode === item.barcode
    );

    if (!foundSize) {
      item.count = 1;
      $scope.doctors_visits.medicines_list.unshift(item);
    }
  };

  $scope.displayAddCustomer = function () {
    $scope.error = "";
    $scope.customer = {
      image_url: "/images/customer.png",
      active: true,
      balance_creditor: 0,
      balance_debtor: 0,
      branch_list: [
        {
          charge: [{}],
        },
      ],
      currency_list: [],
      opening_balance: [{ initial_balance: 0 }],
      bank_list: [{}],
      dealing_company: [{}],
    };

    if (site.feature("medical")) {
      $scope.customer.image_url = "/images/patients.png";
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];
    } else if (site.feature("school") || site.feature("academy")) {
      $scope.customer.image_url = "/images/student.png";
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];
    }
    site.showModal("#customerAddModal");
    document.querySelector("#customerAddModal .tab-link").click();
  };

  $scope.addCustomer = function () {
    $scope.error = "";
    if ($scope.busy) {
      return;
    }

    const v = site.validated("#customerAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/add",
      data: $scope.customer,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#customerAddModal");
          $scope.count = $scope.list.length;
        } else {
          $scope.error = "Please Login First";
          if (response.data.error.like("*Must Enter Code*")) {
            $scope.error = "##word.must_enter_code##";
          } else if (
            response.data.error.like("*maximum number of adds exceeded*")
          ) {
            $scope.error = "##word.err_maximum_adds##";
          } else if (
            response.data.error.like("*ername must be typed correctly*")
          ) {
            $scope.error = "##word.err_username_contain##";
          } else if (response.data.error.like("*User Is Exist*")) {
            $scope.error = "##word.user_exists##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getPatientList = function (ev) {
    $scope.busy = true;

    if (ev.which !== 13) {
      return;
    }

    $scope.customersList = [];
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        search: $scope.patient_search,
        select: {},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.customersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getScansList = function () {
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

  $scope.getAnalysisList = function () {
    $scope.busy = true;
    $scope.analysisList = [];
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
          $scope.analysisList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getOperationList = function () {
    $scope.busy = true;
    $scope.operationList = [];
    $http({
      method: "POST",
      url: "/api/operation/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
        },
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

  $scope.getStatus = function () {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/status/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.statusList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCustomerGroupList = function () {
    $http({
      method: "POST",
      url: "/api/customers_group/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.customerGroupList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.Gender = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: "POST",
      url: "/api/gender/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getBloodType = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.bloodTypeList = [];
    $http({
      method: "POST",
      url: "/api/blood_type/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.bloodTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.showPatient = function (id) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/view",
      data: {
        id: id,
        select: {},
      },
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {
          $scope.customer = response.data.doc;
          site.showModal("#customerDetailsModal");
          document.querySelector("#customerDetailsModal .tab-link").click();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  /*   $scope.showDoctors = function (clinic) {
      $scope.doctors_visits.selected_clinic = clinic;
      site.showModal('#doctorsVisitsSelectDoctor');
    };
   */

  $scope.changeDoctorsVisitsPrice = function () {
    if (
      $scope.doctors_visits.visit_type &&
      $scope.doctors_visits.visit_type.id
    ) {
      if ($scope.doctors_visits.visit_type.id === 1) {
        if (
          $scope.doctors_visits.doctor_price &&
          $scope.doctors_visits.doctor_price.detection
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.doctor_price.detection;
        else if (
          $scope.doctors_visits.clinic_price &&
          $scope.doctors_visits.clinic_price.detection
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.clinic_price.detection;
      } else if ($scope.doctors_visits.visit_type.id === 2) {
        if (
          $scope.doctors_visits.doctor_price &&
          $scope.doctors_visits.doctor_price.re_detection
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.doctor_price.re_detection;
        else if (
          $scope.doctors_visits.clinic_price &&
          $scope.doctors_visits.clinic_price.re_detection
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.clinic_price.re_detection;
      } else if ($scope.doctors_visits.visit_type.id === 3) {
        if (
          $scope.doctors_visits.doctor_price &&
          $scope.doctors_visits.doctor_price.consultation
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.doctor_price.consultation;
        else if (
          $scope.doctors_visits.clinic_price &&
          $scope.doctors_visits.clinic_price.consultation
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.clinic_price.consultation;
      } else if ($scope.doctors_visits.visit_type.id === 4) {
        if (
          $scope.doctors_visits.doctor_price &&
          $scope.doctors_visits.doctor_price.session
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.doctor_price.session;
        else if (
          $scope.doctors_visits.clinic_price &&
          $scope.doctors_visits.clinic_price.session
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.clinic_price.session;
      } /* else if ($scope.doctors_visits.visit_type.id === 5) {
        if ($scope.doctors_visits.doctor_price && $scope.doctors_visits.doctor_price.external_visit)
          $scope.doctors_visits.doctor_visit_price = $scope.doctors_visits.doctor_price.external_visit;
        else if ($scope.doctors_visits.clinic_price && $scope.doctors_visits.clinic_price.external_visit)
          $scope.doctors_visits.doctor_visit_price = $scope.doctors_visits.clinic_price.external_visit;
      } */
    }
  };

  $scope.showTimes = function (d, c) {
    $scope.doctors_visits.clinic_price = c.detection_price;
    $scope.doctors_visits.doctor_price = d.detection_price;

    if (
      d.detection_price &&
      d.detection_price.urgent_visit &&
      d.detection_price.urgent_visit.price
    ) {
      $scope.doctors_visits.urgent_visit = {
        price: d.detection_price.urgent_visit.price,
        type: d.detection_price.urgent_visit.type
          ? d.detection_price.urgent_visit.type
          : c.detection_price.urgent_visit.type,
      };
    } else if (
      c.detection_price.urgent_visit &&
      c.detection_price.urgent_visit.price
    ) {
      $scope.doctors_visits.urgent_visit = {
        price: c.detection_price.urgent_visit.price,
        type:
          d.detection_price &&
          d.detection_price.urgent_visit &&
          d.detection_price.urgent_visit.type
            ? d.detection_price.urgent_visit.type
            : c.detection_price.urgent_visit.type,
      };
    }
    $scope.clinic = Object.assign({}, c);
    $scope.doctors_visits.selected_clinic = {
      id: c.id,
      name_ar: c.name_ar,
      name_en: c.name_en,
    };

    $scope.doctors_visits.selected_specialty = {
      id: c.specialty.id,
      name_ar: c.specialty.name_ar,
      name_en: c.specialty.name_en,
    };
    $scope.doctors_visits.selected_doctor = d.doctor;
    $scope.doctors_visits.selected_shift = {};

    if (
      $scope.doctors_visits.visit_type &&
      $scope.doctors_visits.visit_type.id
    ) {
      if ($scope.doctors_visits.visit_type.id == 1) {
        if (
          $scope.doctors_visits.doctor_price &&
          $scope.doctors_visits.doctor_price.detection
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.doctor_price.detection;
        else if (
          $scope.doctors_visits.clinic_price &&
          $scope.doctors_visits.clinic_price.detection
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.clinic_price.detection;
      } else if ($scope.doctors_visits.visit_type.id == 2) {
        if (
          $scope.doctors_visits.doctor_price &&
          $scope.doctors_visits.doctor_price.re_detection
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.doctor_price.re_detection;
        else if (
          $scope.doctors_visits.clinic_price &&
          $scope.doctors_visits.clinic_price.re_detection
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.clinic_price.re_detection;
      } else if ($scope.doctors_visits.visit_type.id == 3) {
        if (
          $scope.doctors_visits.doctor_price &&
          $scope.doctors_visits.doctor_price.consultation
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.doctor_price.consultation;
        else if (
          $scope.doctors_visits.clinic_price &&
          $scope.doctors_visits.clinic_price.consultation
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.clinic_price.consultation;
      } else if ($scope.doctors_visits.visit_type.id == 4) {
        if (
          $scope.doctors_visits.doctor_price &&
          $scope.doctors_visits.doctor_price.session
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.doctor_price.session;
        else if (
          $scope.doctors_visits.clinic_price &&
          $scope.doctors_visits.clinic_price.session
        )
          $scope.doctors_visits.doctor_visit_price =
            $scope.doctors_visits.clinic_price.session;
      }

      /* else if ($scope.doctors_visits.visit_type.id == 5) {
        if ($scope.doctors_visits.doctor_price && $scope.doctors_visits.doctor_price.external_visit)
          $scope.doctors_visits.doctor_visit_price = $scope.doctors_visits.doctor_price.external_visit;
        else if ($scope.doctors_visits.clinic_price && $scope.doctors_visits.clinic_price.external_visit)
          $scope.doctors_visits.doctor_visit_price = $scope.doctors_visits.clinic_price.external_visit;
      } */
    }

    $http({
      method: "POST",
      url: "/api/clinics/shifts/all",
      data: {
        shiftId: d.shift.id,
        where: {
          id: c.id,
        },
      },
    }).then(function (response) {
      $scope.busy = false;

      if (response.data.done) {
        $scope.doctors_visits.selected_shift = response.data.shift;
        site.showModal("#doctorsVisitsSelectTimes");
      }
    });
  };

  $scope.booking = function (time) {
    $scope.doctors_visits.selected_time = time;
    $scope.calc($scope.doctors_visits);
    site.hideModal("#doctorsVisitsSelectTimes");
  };

  $scope.bookingSlot = function (time_slot) {
    $scope.doctors_visits_add.selected_time_slot = time_slot;
  };

  $scope.attend = function (doctors_visits) {
    if (
      doctors_visits.status &&
      doctors_visits.status.id &&
      doctors_visits.status.id == 1
    ) {
      doctors_visits.status = $scope.statusList[1];
      $scope.doctors_visits = doctors_visits;
      $scope.updateStatus();
    }
  };

  $scope.without = function (doctors_visits) {
    if (
      doctors_visits.status &&
      doctors_visits.status.id &&
      doctors_visits.status.id != 1
    ) {
      doctors_visits.status = $scope.statusList[0];
      $scope.doctors_visits = doctors_visits;
      $scope.updateStatus();
    }
  };

  $scope.enter = function (doctors_visits) {
    if (doctors_visits.status.id == 2) {
      doctors_visits.status = $scope.statusList[2];
      $scope.doctors_visits = doctors_visits;
      $scope.updateStatus();
      site.hideModal("#doctorsVisitsNotes");
    }
  };

  $scope.sellorder = function (doctors_visits) {
    if (
      doctors_visits.status &&
      doctors_visits.status.id &&
      doctors_visits.status.id != 2
    ) {
      doctors_visits.status = $scope.statusList[1];
      $scope.doctors_visits = doctors_visits;
      $scope.updateStatus();
    }
  };

  $scope.detection = function (doctors_visits) {
    if (
      doctors_visits.status &&
      doctors_visits.status.id &&
      doctors_visits.status.id == 3
    ) {
      doctors_visits.status = $scope.statusList[3];
      $scope.doctors_visits = doctors_visits;
      $scope.updateStatus();
      site.showModal("#doctorsVisitsViewModal");
      document.querySelector("#doctorsVisitsViewModal .tab-link").click();
    }
  };

  $scope.atTheDoctor = function (doctors_visits) {
    if (
      doctors_visits.status &&
      doctors_visits.status.id &&
      doctors_visits.status.id != 3
    ) {
      doctors_visits.status = $scope.statusList[2];
      $scope.doctors_visits = doctors_visits;
      $scope.updateStatus();
    }
  };

  $scope.displaySearchModal = function () {
    $scope.error = "";
    site.showModal("#doctorsVisitsSearchModal");
  };

  $scope.searchAll = function () {
    $scope.getDoctorsVisitsList($scope.search);
    site.hideModal("#doctorsVisitsSearchModal");

    $scope.search = {};
  };

  $scope.getClinicDoctorsVisitsList = function (hospital) {
    $scope.busy = true;
    $scope.clinicDoctorsVisitsList = [];
    $scope.dynamic_doctors_visits = $scope.dynamic_doctors_visits || {};
    let where = {
      active: true,
    };

    $http({
      method: "POST",
      url: "/api/clinics/all",
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done && response.data.list.length > 0) {
          $scope.clinicDoctorsVisitsList = response.data.list;

          $scope.dynamic_doctors_visits.$clinic_list = [];
          $scope.dynamic_doctors_visits.$doctor_list = [];

          response.data.list.forEach((clinc) => {
            $scope.dynamic_doctors_visits.$clinic_list.push({
              id: clinc.id,
              name: clinc.name,
              $doctor_list: clinc.doctor_list,
            });

            clinc.doctor_list.forEach((d) => {
              $scope.dynamic_doctors_visits.$doctor_list.push({
                id: d.doctor.id,
                name: d.doctor.name,
                detection_Duration: d.detection_Duration,
                $shift_list: [d.shift],
              });
            });
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getClincDoctorList = function (clinic) {
    $scope.dynamic_doctors_visits.$doctor_list = [];

    clinic.$doctor_list.forEach((d) => {
      $scope.dynamic_doctors_visits.$doctor_list.push({
        id: d.doctor.id,
        name: d.doctor.name,
        detection_Duration: d.detection_Duration,
        specialty: d.doctor.specialty,
        $shift_list: [d.shift],
      });
    });
  };

  $scope.getDoctorsVisitsTypeList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/visit_type/all",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.doctorsVisitsTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getResultVisitList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/result_visit/all",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.resultVisitList = response.data;
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

  $scope.getDiseaseList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/disease/all",
      data: {
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.diseaseList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadTaxTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tax_types/all",
      data: {
        select: {
          code: 1,
          id: 1,
          name_ar: 1,
          name_en: 1,
          value: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tax_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getFoodsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/foods/all",
      data: {
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.foodsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDrinksList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/drinks/all",
      data: {
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.drinksList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadDiscountTypes = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {
          code: 1,
          id: 1,
          name_ar: 1,
          name_en: 1,
          value: 1,
          type: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.discount_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDefaultSettings = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addDiscount = function () {
    $scope.error = "";
    if (!$scope.discount.value) {
      $scope.error = "##word.error_discount##";
      return;
    } else {
      $scope.doctors_visits.discountes = $scope.doctors_visits.discountes || [];
      $scope.doctors_visits.discountes.push({
        name_ar: $scope.discount.name_ar,
        name_en: $scope.discount.name_en,
        value: $scope.discount.value,
        type: $scope.discount.type,
      });
    }
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.doctors_visits.discountes.splice(
      $scope.doctors_visits.discountes.indexOf(_ds),
      1
    );
  };

  $scope.viewInformationInstructions = function (c) {
    $scope.view_info_instruc = c;
    site.showModal("#informationInstructionsModal");
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

  $scope.getItemsName = function (ev) {
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
              $scope.doctors_visits.medicines_list =
                $scope.doctors_visits.medicines_list || [];
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
                      _size.value_added = _size.not_value_added
                        ? 0
                        : $scope.defaultSettings.inventory.value_added || 0;
                      _size.unit = _size.size_units_list[indxUnit];
                      _size.discount = _size.size_units_list[indxUnit].discount;
                      _size.average_cost =
                        _size.size_units_list[indxUnit].average_cost;
                      _size.cost = _size.size_units_list[indxUnit].cost;
                      _size.price = _size.size_units_list[indxUnit].price;
                      _size.total = _size.count * _size.cost;

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

                      foundSize = $scope.doctors_visits.medicines_list.some(
                        (_itemSize) => _itemSize.barcode === _size.barcode
                      );

                      if (!foundSize)
                        $scope.doctors_visits.medicines_list.unshift(_size);
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

  $scope.itemsMedicines = function () {
    $scope.error = "";
    $scope.doctors_visits.medicines_list =
      $scope.doctors_visits.medicines_list || [];
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
        _item.value_added = _item.not_value_added
          ? 0
          : $scope.defaultSettings.inventory.value_added;

        let indxUnit = 0;
        if (_item.size_units_list && _item.size_units_list.length > 0) {
          indxUnit = _item.size_units_list.findIndex(
            (_unit) => _unit.id == $scope.item.itm.main_unit.id
          );

          _item.unit = _item.size_units_list[indxUnit];
          _item.discount = _item.size_units_list[indxUnit].discount;
          _item.average_cost = _item.size_units_list[indxUnit].average_cost;
          _item.cost = _item.size_units_list[indxUnit].cost;
          _item.price = _item.size_units_list[indxUnit].price;
        }

        _item.total = _item.count * _item.cost;

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
        foundSize = $scope.doctors_visits.medicines_list.some(
          (_itemSize) => _itemSize.barcode === _item.barcode
        );
        if (!foundSize) $scope.doctors_visits.medicines_list.unshift(_item);
      });
  };

  $scope.calc = function (obj) {
    $scope.error = "";
    $timeout(() => {
      obj.total_discount = 0;
      obj.total_value = 0;

      if (obj.urgent_visit && obj.is_urgent_visit) {
        if (obj.urgent_visit.type == "percent")
          obj.urgent_visit.value =
            (obj.doctor_visit_price * site.toNumber(obj.urgent_visit.price)) /
            100;
        else obj.urgent_visit.value = site.toNumber(obj.urgent_visit.price);
        obj.total_value = obj.doctor_visit_price + obj.urgent_visit.value;
      } else obj.total_value = obj.doctor_visit_price;

      if (obj.discountes && obj.discountes.length > 0)
        obj.discountes.forEach((ds) => {
          if (ds.type == "percent")
            obj.total_discount +=
              (obj.total_value * site.toNumber(ds.value)) / 100;
          else obj.total_discount += site.toNumber(ds.value);
        });

      obj.net_value = obj.total_value - obj.total_discount;
      obj.remain = obj.net_value - (obj.paid || 0);
      $scope.discount = {
        type: "number",
      };
    }, 250);
  };

  $scope.getNumberingAuto = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "doctors_visits",
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

  $scope.getDoctorsVisitsList({ date: new Date() });
  $scope.getSpecialtyList();
  /*$scope.getMedicinesList();*/
  $scope.getScansList();
  $scope.getAnalysisList();
  $scope.getOperationList();
  $scope.getStatus();
  $scope.getDiseaseList();
  $scope.getGovList();
  $scope.getCustomerGroupList();
  $scope.Gender();
  $scope.getBloodType();
  $scope.getFoodsList();
  $scope.getDrinksList();
  $scope.getClinicList();
  $scope.getClinicList2();
  $scope.getDoctorsVisitsTypeList();
  $scope.getResultVisitList();
  $scope.loadDiscountTypes();
  $scope.loadTaxTypes();
  $scope.getClinicDoctorsVisitsList();
  $scope.getDefaultSettings();
  $scope.getNumberingAuto();
});
