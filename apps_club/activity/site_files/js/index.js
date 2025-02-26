app.controller("activity", function ($scope, $http, $timeout) {

  $scope.activity = {};

  $scope.displayAddActivity = function () {
    $scope.error = '';
    $scope.activity = {
      image_url: '/images/activity.png',
      active: true,
      attend_count: 1,
      complex_activity: false,
      /* capaneighborhood : " - طالب",       
       immediate: false
 */    };
    site.showModal('#activityAddModal');

  };

  $scope.addActivity = function () {
    $scope.error = '';
    const v = site.validated('#activityAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    if ($scope.activity.complex_activity) {
      $scope.activity.attend_count = 0;
      $scope.activity.complex_activities_list.forEach(s => {
        $scope.activity.attend_count += (s.attend_count * s.count);
      });
    } else {
      $scope.activity.complex_activities_list = [];
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/activity/add",
      data: $scope.activity
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#activityAddModal');
          $scope.getActivityList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateActivity = function (activity) {
    $scope.error = '';
    $scope.viewActivity(activity);
    $scope.activity = {};
    site.showModal('#activityUpdateModal');
  };

  $scope.updateActivity = function () {
    $scope.error = '';
    const v = site.validated('#activityUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/activity/update",
      data: $scope.activity
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#activityUpdateModal');
          $scope.getActivityList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsActivity = function (activity) {
    $scope.error = '';
    $scope.viewActivity(activity);
    $scope.activity = {};
    site.showModal('#activityViewModal');
  };

  $scope.viewActivity = function (activity) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/activity/view",
      data: {
        id: activity.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.activity = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteActivity = function (activity) {
    $scope.error = '';
    $scope.viewActivity(activity);
    $scope.activity = {};
    site.showModal('#activityDeleteModal');

  };

  $scope.deleteActivity = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/activity/delete",
      data: {
        id: $scope.activity.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#activityDeleteModal');
          $scope.getActivityList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getActivityList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/activity/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#activitySearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSubscriptionsSystem = function () {
    $scope.busy = true;
    $scope.subscriptionsSystemList = [];
    $http({
      method: "POST",
      url: "/api/subscriptions_system/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.subscriptionsSystemList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getActivity = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/activity/all",
        data: {
          where: { name: $scope.search_activity, complex_activity: { $ne: true } },
          select: { id: 1, name_Ar: 1, name_En: 1, code: 1, activities_price: 1, complex_activities_list: 1, attend_count: 1 }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              $scope.activitiesList = response.data.list;
            }
          }
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.incertActivities = function () {
    $scope.error = '';
    $scope.activity.complex_activities_list = $scope.activity.complex_activities_list || [];

    if ($scope.selectedActivity && $scope.selectedActivity.id) {
      $scope.selectedActivity.count = 1;
      $scope.selectedActivity.total_attend_count = $scope.selectedActivity.attend_count;
      $scope.activity.complex_activities_list.unshift(Object.assign({}, $scope.selectedActivity));
    } else $scope.error = '##word.err_select_activity##';

    $scope.selectedActivity = {};
    $scope.calc();
  };

  $scope.deleteActivityList = function (activity) {
    $scope.error = '';
    $scope.activity.complex_activities_list.splice($scope.activity.complex_activities_list.indexOf(activity), 1);
  };

  $scope.calc = function () {
    $scope.error = '';
    $timeout(() => {

      $scope.activity.complex_activ_price = 0;
      $scope.activity.complex_activities_list.map(s => $scope.activity.complex_activ_price += Number(s.activities_price) * Number(s.count));

    }, 200);
  };


  $scope.attendCalc = function () {
    $scope.error = '';
    $scope.activity.attend_count = 0;
    $scope.activity.complex_activ_price = 0;
    $timeout(() => {
      if ($scope.activity.complex_activity) {
        $scope.activity.complex_activities_list.forEach(_s => {
          _s.total_attend_count = _s.attend_count * _s.count;
          $scope.activity.attend_count += _s.total_attend_count;
          $scope.activity.complex_activ_price += Number(_s.activities_price) * Number(_s.count)
        });
      }
    }, 200);

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "activities"
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
    site.showModal('#activitySearchModal');

  };

  $scope.searchAll = function () {
    $scope.getActivityList($scope.search);
    site.hideModal('#activitySearchModal');
    $scope.search = {};

  };

  $scope.getActivityList();
  $scope.getSubscriptionsSystem();
  $scope.getNumberingAuto();
  /*   $scope.getPeriod();
   */
});