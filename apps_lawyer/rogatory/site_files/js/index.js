app.controller("rogatory", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.rogatory = {};

  $scope.displayAddRogatory = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.rogatory = {
      image_url: '/images/rogatory.png',
      active: true,
      date: new Date()
    };
    site.showModal('#rogatoryAddModal');
    document.querySelector('#rogatoryAddModal .tab-link').click();

  };

  $scope.addRogatory = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#rogatoryAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/rogatory/add",
      data: $scope.rogatory
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryAddModal');
          $scope.getRogatoryList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateRogatory = function (rogatory) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsRogatory(rogatory);
    $scope.rogatory = {};
    site.showModal('#rogatoryUpdateModal');
    document.querySelector('#rogatoryUpdateModal .tab-link').click();

  };

  $scope.updateRogatory = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#rogatoryUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory/update",
      data: $scope.rogatory
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryUpdateModal');
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

  $scope.displayDetailsRogatory = function (rogatory) {
    $scope.error = '';
    $scope.detailsRogatory(rogatory);
    $scope.rogatory = {};
    site.showModal('#rogatoryDetailsModal');
    document.querySelector('#rogatoryDetailsModal .tab-link').click();

  };

  $scope.detailsRogatory = function (rogatory) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory/view",
      data: {
        id: rogatory.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.rogatory = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRogatory = function (rogatory) {
    $scope.error = '';
    $scope.detailsRogatory(rogatory);
    $scope.rogatory = {};
    site.showModal('#rogatoryDeleteModal');
    document.querySelector('#rogatoryDeleteModal .tab-link').click();

  };

  $scope.deleteRogatory = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory/delete",
      data: {
        id: $scope.rogatory.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#rogatoryDeleteModal');
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

  $scope.getRogatoryList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/rogatory/all",
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
    $scope.getRogatoryList($scope.search);
    site.hideModal('#rogatorySearchModal');
    $scope.search = {}

  };

  $scope.getCustomerList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer,
          where: {
            active: true
          }

        }
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
      )
    };
  };

  $scope.getOfficeLawyersList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/office_lawyers/all",
        data: {
          search: $scope.search_office_lawyers,
          select: { name_ar: 1, name_en: 1, id: 1, code: 1 }

        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.officeLawyersList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.loadAdjectives = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/adjectives/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1, description: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.adjectivesList = response.data.list;
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
    $scope.rogatory.files_list = $scope.rogatory.files_list || [];
    $scope.rogatory.files_list.push({
      file_date: new Date(),
      file_upload_date: new Date(),
      upload_by: '##user.name##',
    })
  };

  $scope.loadRogatoryPlace = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_places/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1, description: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.rogatoryPlaceList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadRogatoryTypeList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/rogatory_types/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1, description: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.rogatoryTypeList = response.data.list;
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
        screen: "rogatory"
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

  
  $scope.addClients = function () {

    $scope.rogatory.clients_list = $scope.rogatory.clients_list || [];

    if ($scope.customer && $scope.customer.id && $scope.customer_adjective) {
      $scope.rogatory.clients_list.push({
        customer: $scope.customer,
        adjective: $scope.customer_adjective
      });
      $scope.customer = {};
      $scope.customer_adjective = {};
    }
  };

  $scope.addOfficeLawyers = function () {

    $scope.rogatory.office_lawyers_list = $scope.rogatory.office_lawyers_list || [];

    if ($scope.office_lawyer && $scope.office_lawyer.id && $scope.office_lawyer_adjective) {

      $scope.rogatory.office_lawyers_list.push({
        office_lawyer: $scope.office_lawyer,
        adjective: $scope.office_lawyer_adjective
      });
      $scope.office_lawyer = {};
      $scope.office_lawyer_adjective = {};
    }
  };


  $scope.getNumberingAuto();
  $scope.getRogatoryList();
  $scope.loadRogatoryPlace();
  $scope.getFilesTypesList();
  $scope.loadAdjectives();
  $scope.loadRogatoryTypeList();
});