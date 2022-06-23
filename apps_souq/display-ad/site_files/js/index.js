app.controller('display_ad', function ($scope, $http, $timeout) {
  $scope.activity = {};
  $scope.ad = {};
  $scope.dissplayAd = function () {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/ads/view',
      data: {
        id: site.toNumber('##query.id##'),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.ad = response.data.doc;
          $scope.ad.comments_activities = $scope.ad.comments_activities || [];
          $scope.ad.comments_activities.forEach((_c) => {
            if (_c.user && _c.user.id === site.toNumber('##user.id##')) {
              if (_c.comment_activity && _c.comment_activity.id == 1) {
                $scope.activity.like = true;
              } else if (_c.comment_activity && _c.comment_activity.id == 2) {
                $scope.activity.favorite = true;
              }
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.updateComment = function (type) {
    let data = { id: $scope.ad.id, type: type, obj: $scope.activity };

    $http({
      method: 'POST',
      url: '/api/ads/update_comment',
      data: data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (type == 'comment') {
            $scope.ad.comments_activities.push({
              user: { profile: { name: '##user.profile.name##' } },
              comment_activity: { id: 4, en: 'Comment', ar: 'تعليق' },
              comment_type: $scope.activity.comment_type,
              comment: $scope.activity.comment,
              date: new Date(),
            });
            $scope.activity.comment = '';
          } else if (type == 'report') {
            $scope.activity.report_type = {};
            $scope.activity.comment_report = '';
            site.hideModal('#reportModal');
          }
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getReportsTypesList = function (where) {
    $scope.busy = true;
    $scope.reportsTypesList = [];
    $http({
      method: 'POST',
      url: '/api/reports_types/all',
      data: {
        where: { active: true },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.reportsTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getReportsTypesList();
  $scope.dissplayAd();
});
