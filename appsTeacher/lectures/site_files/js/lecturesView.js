app.controller("lecturesView", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.baseURL = "";
  $scope.setting = site.showObject(`##data.#setting##`);

  $scope.where = {};
  if ("##query.type##" == "myLectures") {
    $scope.where["myLectures"] = true;
  }
  if (site.toNumber("##query.subscription##") > 0) {
    $scope.where["subscriptionList.subscription.id"] = site.toNumber("##query.subscription##");
  }
  $scope.where.liveBroadcast = { $ne: true };
  $scope.getAll = function (ev) {
    $scope.busy = true;
    $scope.error = "";
    if (ev.which === 13) {

      if($scope.setting?.educationalLevel?.id) {
        $scope.where = {
          educationalLevel : {id : $scope.setting.educationalLevel.id},
          schoolYear : {id : "##query.school_year##"},
        }
      }
      
      $http({
        method: "POST",
        url: `${$scope.baseURL}/api/lectures/allToStudent`,
        data: {
          type: "toStudent",
          search: $scope.$search,
          where: $scope.where,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.list = response.data.list;
          } else {
            $scope.error = response.data.error;
          }
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.getEducationalLevelsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.educationalLevelsList = [];

    $http({
      method: "POST",
      url: "/api/educationalLevels/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.educationalLevelsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getSchoolYearsList = function (educationalLevelId) {
    $scope.busy = true;
    $scope.schoolYearsList = [];
    $http({
      method: "POST",
      url: "/api/schoolYears/all",
      data: {
        where: {
          active: true,
          "educationalLevel.id": educationalLevelId,
        },
        select: {
          id: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.schoolYearsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSubjectsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/subjects/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name: 1 },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.subjectsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getEducationalLevelsList();
  $scope.getSubjectsList();
  $scope.getAll({ which: 13 });
});
