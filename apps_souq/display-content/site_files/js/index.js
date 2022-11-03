app.controller('display_content', function ($scope, $http, $timeout) {
  $scope.activity = {};
  $scope.ad = {};
  $scope.userId = site.toNumber('##user.id##');

  $scope.getContentList = function (ad, type) {
    $scope.busy = true;
    $scope.contentList = [];
    where = {};
    where['ad_status.id'] = 1;
      where['main_category.id'] = ad.main_category.id;
      where['id'] = { $ne: ad.id };
    if (type) {

      if (ad.address.country && ad.address.country.id && type == 'country') {
        where['address.country.id'] = ad.address.country.id;
      } else if (ad.address.gov && ad.address.gov.id && type == 'gov') {
        where['address.gov.id'] = ad.address.gov.id;
      } else if (ad.address.city && ad.address.city.id && type == 'city') {
        where['address.city.id'] = ad.address.city.id;
      } else if (ad.address.area && ad.address.area.id && type == 'area') {
        where['address.area.id'] = ad.address.area.id;
      }
    }

    $http({
      method: 'POST',
      url: '/api/contents/all',
      data: {
        where: where,
        page_limit: 18,
        post: true,
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
  
  $scope.selectCategoryHeader = function (id) {
    window.location.href = `/?id=${id}`;
  };

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
          if ($scope.defaultSettings.content.warning_message_ad_list && $scope.defaultSettings.content.warning_message_ad_list.length > 0) {
            $scope.ad.$warning_message = $scope.defaultSettings.content.warning_message_ad_list[Math.floor(Math.random() * $scope.defaultSettings.content.warning_message_ad_list.length)];
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadMainCategories = function (main_category) {
    $scope.error = '';
    $scope.busy = true;
    $scope.category_list = [];

    $http({
      method: 'POST',
      url: '/api/main_categories/all',
      data: {
        where: {
          status: 'active',
          $or: [
            { id: main_category.id },
            { id: { $in: main_category.parent_list_id } }
          ]
        },
        select: { id: 1, name_ar: 1, name_en: 1, image_url: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displayAd = function () {
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
          $scope.ad.$number_favorites = $scope.ad.number_favorites;
          $scope.activity.favorite = $scope.ad.$favorite;
          $scope.getContentList($scope.ad);
          $scope.getUserAd($scope.ad.store.user.id);
          $scope.loadMainCategories($scope.ad.main_category);
          $scope.getDefaultSetting();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showMessage = function (user) {
    $scope.error = '';
    $scope.activity.user_message = user;
    site.showModal('#messageModal');
  };

  $scope.sendMessage = function () {
    let data = { receiver: $scope.activity.user_message, message: $scope.activity.message };

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

  $scope.showReportComment = function (i) {
    $scope.activity.comment_index = i;
    site.showModal('#reportCommentModal');
  };



  $scope.updateFeedback = function (type, status) {
    if (type == 'favorite') {
      $scope.activity.favorite = status;
    }

    let data = { id: $scope.ad.id, feedback: { ...$scope.activity, type: type } };

    if (type == 'report') {
      let v = site.validated('#reportModal');

      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      };

    } else if (type == 'report_comment') {
      let v = site.validated('#reportCommentModal');

      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      };
    }

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
          } else if (type == 'report_comment') {
            $scope.activity.report_type = {};
            $scope.activity.comment_report = '';
            site.hideModal('#reportCommentModal');
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

  $scope.getUserAd = function (id) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.userAd = response.data.doc;

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) { }
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
        if (response.data.done && response.data.doc && response.data.doc.id) {
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
      function (err) { }
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
        post: true,
        select: { id: 1, name_ar: 1, name_en: 1, report_comments: 1 }
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.reportAdList = response.data.report_ad_list;
          $scope.reportCommentList = response.data.report_comment_list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getReportsTypesList();
  $scope.displayAd();
  $scope.getUser();
});
