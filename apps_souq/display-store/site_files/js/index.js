app.controller('display_store', function ($scope, $http, $timeout) {
  $scope.activity = {};
  $scope.store = {};
  $scope.dissplayStore = function () {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/stores/view',
      data: {
        id: site.toNumber('##query.id##'),
        display: true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.store = response.data.doc;
          $scope.store.$number_favorites =  $scope.store.number_favorites;
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
    let data = { user: $scope.store.user, message: $scope.activity.message };

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

  $scope.updateFeedback = function (type) {
    let data = { id: $scope.store.id, feedback: { ...$scope.activity, type: type } };

    $http({
      method: 'POST',
      url: '/api/stores/update_feedback',
      data: data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (type == 'comment') {
            $scope.store.feedback_list.push({
              user: { profile: { name: '##user.profile.name##' } },
              type: { id: 4, en: 'Comment', ar: 'تعليق' },
              comment_type: $scope.activity.comment_type,
              comment: $scope.activity.comment,
              date: new Date(),
            });
            $scope.activity.comment = '';
            $scope.store.number_comments += 1;
          } else if (type == 'report') {
            $scope.activity.report_type = {};
            $scope.activity.comment_report = '';
            site.hideModal('#reportModal');
          } else if (type == 'favorite') {
            if ($scope.activity.favorite) {
              $scope.store.$number_favorites += 1;
            } else {
              $scope.store.$number_favorites -= 1;
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
          $scope.activity.favorite = $scope.user.feedback_list.some((_f) => _f.type && _f.store && _f.type.id == 2 && _f.store.id == site.toNumber('##query.id##'));
          $scope.getAdsList({ which: 13 });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.showCommunication = function (obj) {
    $scope.main_obj = obj;
    site.showModal('#communicationModal');
  };

  $scope.updateFeedbackAd = function (ad, type) {
    let data = { id: ad.id, feedback: { favorite: ad.favorite, type: type } };

    $http({
      method: 'POST',
      url: '/api/contents/update_feedback',
      data: data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getAdsList({ which: 13 });
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
        image_url: ad.image_url,
        name_ar: ad.name_ar,
        name_en: ad.name_en,
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
          $scope.getUser();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
      }
    );
  };

  $scope.getAdsList = function (ev, where) {
    $scope.busy = true;
    $scope.contentList = [];
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/contents/all',
        data: {
          where: { 'store.id': site.toNumber('##query.id##'), 'ad_status.id': 1 },
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.contentList = response.data.list;
            $scope.contentList.forEach((ad) => {
              ad.favorite = $scope.user.feedback_list.some((_f) => _f.type && _f.ad && _f.type.id == 2 && _f.ad.id == ad.id);
            });
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.displayAd = function (id) {
    window.open(`/display_ad?id=${id}`, '_blank');
  };

  $scope.getReportsTypesList();
  $scope.dissplayStore();
  $scope.getUser();
});
