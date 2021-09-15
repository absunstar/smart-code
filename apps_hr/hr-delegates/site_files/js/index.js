app.controller("delegate_list", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.delegate_list = {};

  $scope.displayAddDelegate = function () {
    $scope.error = '';
    $scope.delegate_list = {
      image_url: '/images/delegate.png',
      /*  class_rooms_list : [{}],
       courses_list : [{}], */
      active: true

    };
    site.showModal('#delegateAddModal');
    document.querySelector('#delegateAddModal .tab-link').click();

  };

  $scope.addDelegate = function () {
    $scope.error = '';
    const v = site.validated('#delegateAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delegates/add",
      data: $scope.delegate_list
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#delegateAddModal');
          $scope.getDelegateList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          } else if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = "##word.err_maximum_adds##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateDelegate = function (delegate_list) {
    $scope.error = '';
    $scope.detailsDelegate(delegate_list);
    $scope.delegate_list = {};
    site.showModal('#delegateUpdateModal');
    document.querySelector('#delegateUpdateModal .tab-link').click();
  };

  $scope.updateDelegate = function () {
    $scope.error = '';
    const v = site.validated('#delegateUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delegates/update",
      data: $scope.delegate_list
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#delegateUpdateModal');
          $scope.getDelegateList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsDelegate = function (delegate_list) {
    $scope.error = '';
    $scope.detailsDelegate(delegate_list);
    $scope.delegate_list = {};
    site.showModal('#delegateViewModal');
    document.querySelector('#delegateViewModal .tab-link').click();

  };

  $scope.detailsDelegate = function (delegate_list) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/delegates/view",
      data: {
        id: delegate_list.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.delegate_list = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteDelegate = function (delegate_list) {
    $scope.error = '';
    $scope.detailsDelegate(delegate_list);
    $scope.delegate_list = {};
    site.showModal('#delegateDeleteModal');
    document.querySelector('#delegateDeleteModal .tab-link').click();

  };

  $scope.deleteDelegate = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/delegates/delete",
      data: {
        id: $scope.delegate_list.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#delegateDeleteModal');
          $scope.getDelegateList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDelegateList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/delegates/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#delegateSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getClassRoomsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.hallsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getCoursesList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/courses/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.coursesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.loadMaritalsStatus = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/maritals_status/all",
      data: {
        select: {
          id: 1, name_ar: 1, name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.maritals_status = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadMilitariesStatus = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/militaries_status/all",
      data: {
        select: {
          id: 1, name_ar: 1, name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.militaries_status = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getGender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: "POST",
      url: "/api/gender/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
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
        select: {
          id: 1, name_ar: 1, name_en: 1,
          code: 1
        }
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


  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name_ar: 1, name_en: 1, type: 1, code: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.storesList = response.data.list;
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
        screen: "delegates"
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

  $scope.getDegree = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_degrees/all",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.degreeList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.netSalary = function () {
    $scope.error = "";
    $timeout(() => {
      $scope.delegate_list.net_salary = 0;
      if ($scope.delegate_list.degree) {
        $scope.delegate_list.salary_differance =
          $scope.delegate_list.salary_differance || 0;
        let total =
          $scope.delegate_list.degree.salary +
          $scope.delegate_list.salary_differance;
          let net_salary =
          (total * site.toNumber($scope.delegate_list.degree.tax)) / 100;

        $scope.delegate_list.net_salary =
        total - net_salary;
      }
    }, 250);
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#delegateSearchModal');

  };

  $scope.searchAll = function () {
    $scope.getDelegateList($scope.search);
    site.hideModal('#delegateSearchModal');
    $scope.search = {};
  };


  $scope.email_examble = '';
  if (typeof '##session.company.host##' === 'string') {
    $scope.email_examble = 'examble##session.company.host##';
  } else {
    $scope.email_examble = 'you@examble.com';
  }


  $scope.getDelegateList();
  $scope.loadStores();
  $scope.getGovList();
  $scope.getClassRoomsList();
  $scope.getCoursesList();
  $scope.getDegree();
  $scope.getGender();
  $scope.getNumberingAuto();
  $scope.loadMaritalsStatus();
  $scope.loadMilitariesStatus();
});