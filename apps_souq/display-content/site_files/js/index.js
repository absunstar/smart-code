app.controller('display_content', function ($scope, $http, $timeout) {
  $scope.activity = {};
  $scope.ad = {};

  $scope.getContentList = function (ad) {
    $scope.busy = true;
      $scope.contentList = [];
      where = {};
      where['ad_status.id'] = 1;
      where['main_category.id'] = ad.main_category.id;
      where['id'] = {$ne : ad.id};

      if(ad.address){
        if(ad.address.country && ad.address.country.id){
          where['address.country.id'] = ad.address.country.id;
        }
      }

      if(ad.address){
        if(ad.address.gov && ad.address.gov.id){
          where['address.gov.id'] = ad.address.gov.id;
        }
      }

      $http({
        method: 'POST',
        url: '/api/contents/all',
        data: {
          where: where,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.contentList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    
  };

  $scope.dissplayAd = function () {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/contents/view',
      data: {
        id: site.toNumber('##query.id##'),
        display: true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.ad = response.data.doc;
          $scope.getContentList($scope.ad);
          $scope.ad.$number_favorites = $scope.ad.number_favorites;
          $scope.ad.comments_activities = $scope.ad.comments_activities || [];
          $scope.ad.$time = xtime($scope.ad.date);
          $scope.ad.comments_activities.forEach((_c) => {
            if (_c.user && _c.user.id === site.toNumber('##user.id##')) {
              if (_c.comment_activity && _c.comment_activity.id == 2) {
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

  $scope.sendMessage = function () {
    let data = { user: $scope.ad.store.user, message: $scope.activity.message };

    $http({
      method: 'POST',
      url: '/api/messages/update',
      data: data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.activity.message = '';
          site.hideModal('#messageModal');
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showCommunication = function (obj) {
    $scope.main_obj = obj;
    site.showModal('#communicationModal');
  };

  $scope.updateFeedback = function (type) {
    let data = { id: $scope.ad.id, feedback: { ...$scope.activity, type: type } };

    $http({
      method: 'POST',
      url: '/api/contents/update_feedback',
      data: data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (type == 'comment') {
            $scope.ad.feedback_list.push({
              user: { profile: { name: '##user.profile.name##' } },
              type: { id: 4, en: 'Comment', ar: 'تعليق' },
              comment_type: $scope.activity.comment_type,
              comment: $scope.activity.comment,
              date: new Date(),
            });
            $scope.activity.comment = '';
            $scope.ad.number_comments += 1;
          } else if (type == 'report') {
            $scope.activity.report_type = {};
            $scope.activity.comment_report = '';
            site.hideModal('#reportModal');
          } else if (type == 'favorite') {
            if ($scope.activity.favorite) {
              $scope.ad.$number_favorites += 1;
            } else {
              $scope.ad.$number_favorites -= 1;
            }
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

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: site.toNumber('##user.id##'),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          if (!$scope.user.cart) {
            $scope.user.cart = {
              total: 0,
              fee_upon_receipt: 0,
              normal_delivery_fee: 0,
              fast_delivery_fee: 0,
              items: [],
            };
          }

          $scope.activity.favorite = $scope.user.feedback_list.some((_f) => _f.type && _f.ad && _f.type.id == 2 && _f.ad.id == site.toNumber('##query.id##'));
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.bookList = function (ad, i) {
    $scope.error = '';
    $scope.user.cart.items = $scope.user.cart.items || [];
    let exist = false;

    $scope.user.cart.items.forEach((el) => {
      if (ad.id == el.id && el.select_quantity.unit.id == ad.quantity_list[i].unit.id) {
        exist = true;
        el.count += 1;
      }
    });

    if (!exist) {
      let obj = {
        id: ad.id,
        code: ad.code,
        image_url: ad.image_url,
        name_ar: ad.name_ar,
        name_en: ad.name_en,
        unit: ad.unit,
        select_quantity: ad.quantity_list[i],
        count: 1,
      };
      $scope.user.cart.items.unshift(obj);
    }

    $scope.updateCart($scope.user);
  };

  $scope.updateCart = function (obj) {
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/user/update',
      data: obj,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        $scope.getUser();
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
  $scope.getUser();
});
