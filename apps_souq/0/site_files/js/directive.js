app.directive('iUser', [
  '$http',
  '$interval',
  '$timeout',
  'isite',
  function ($http, $interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        ngModel: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        if (!$scope.id2) {
          $scope.id2 = Math.random().toString().replace('.', '_');
        }
        $scope.showModal = function (params) {
          site.showModal('#userMoal_' + $scope.id2);
        };
        $scope.hideModal = function (params) {
          site.hideModal('#userMoal_' + $scope.id2);
        };

        $scope.loadUsers = function (ev, search_user) {
          $scope.users_list = [];
          if (ev.which === 13) {
            $scope.busy = true;
            $http({
              method: 'POST',
              url: '/api/users/all',
              data: {
                where: {
                  search: search_user,
                },
                select: { id: 1, email: 1, mobile: 1, profile: 1 },
              },
            }).then(
              function (response) {
                $scope.busy = false;

                if (response.data.done) {
                  $scope.users_list = response.data.users;
                } else {
                }
              },
              function (err) {
                $scope.busy = false;
                $scope.error = err;
              }
            );
          }
        };
      },
      template: `/*##0/i-user.html*/`,
    };
  },
]);

app.directive('iStore', [
  '$http',
  '$interval',
  '$timeout',
  'isite',
  function ($http, $interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        ngModel: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        if (!$scope.id2) {
          $scope.id2 = Math.random().toString().replace('.', '_');
        }
        $scope.showModal = function (params) {
          site.showModal('#storeMoal_' + $scope.id2);
        };
        $scope.hideModal = function (params) {
          site.hideModal('#storeMoal_' + $scope.id2);
        };

        $scope.loadStores = function (ev, search_stores) {
          $scope.stores_list = [];
          if (ev.which === 13) {
            $scope.busy = true;
            $http({
              method: 'POST',
              url: '/api/stores/all',
              data: {
                where: {
                  search: search_stores,
                },
                select: { id: 1, name: 1, user: 1, address: 1 },
              },
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                  $scope.stores_list = response.data.list;
                } else {
                }
              },
              function (err) {
                $scope.busy = false;
                $scope.error = err;
              }
            );
          }
        };
      },
      template: `/*##0/i-store.html*/`,
    };
  },
]);

app.directive('iCategory', [
  '$http',
  '$interval',
  '$timeout',
  'isite',
  function ($http, $interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        ngModel: '=',
        ngList: '=',
        ngLabel: '@',
      },
      link: function ($scope, element, attrs, ctrl) {
        if (!$scope.id2) {
          $scope.id2 = Math.random().toString().replace('.', '_');
        }
        $scope.log = function (msg) {
          console.log(msg);
        };
      },
      template: `/*##0/i-category.html*/`,
    };
  },
]);

app.directive('iFeedback', [
  '$http',
  '$interval',
  '$timeout',
  'isite',
  function ($http, $interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        ngModel: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        if (!$scope.id2) {
          $scope.id2 = Math.random().toString().replace('.', '_');
        }

        $scope.filter = {
          like: true,
          favorite: true,
          report: true,
          comment: true,
        };
        /*  $scope.filterComments = function (type) {

          $scope.ngModel.feedback_list = response.data.filter((i) => i.id != 4 && i.id != 5 && i.id != 6 && i.id != 7);


        }; */

        $scope.getFeedbackTypeList = function () {
          $scope.error = '';
          $scope.busy = true;
          $scope.feedbackTypeList = [];
          $http({
            method: 'POST',
            url: '/api/feedback_type/all',
          }).then(
            function (response) {
              $scope.busy = false;
              $scope.feedbackTypeList = response.data;
            },
            function (err) {
              $scope.busy = false;
              $scope.error = err;
            }
          );
        };
        $scope.showModal = function (comment) {
          $scope.comment = comment;
          site.showModal('#reportCommentModal_' + $scope.id2);
        };
        $scope.hideReportModal = function (params) {
          site.hideModal('#reportCommentModal_' + $scope.id2);
        };


        $scope.getCommentsTypesList = function (where) {
          $scope.busy = true;
          $scope.commentsTypesList = [];
          $http({
            method: 'POST',
            url: '/api/comments_types/all',
            data: {
              where: { active: true },
            },
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done && response.data.list.length > 0) {
                $scope.commentsTypesList = response.data.list;
              }
            },
            function (err) {
              $scope.busy = false;
              $scope.error = err;
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
              select: { id: 1, name_ar: 1, name_en: 1 }
            },
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                $scope.reportsTypesList = response.data.report_ad_list;
              }
            },
            function (err) {
              $scope.busy = false;
              $scope.error = err;
            }
          );
        };

        $scope.getContentStatusList = function () {
          $scope.error = '';
          $scope.busy = true;
          $scope.contentStatusList = [];
          $http({
            method: 'POST',
            url: '/api/content_status/all',
          }).then(
            function (response) {
              $scope.busy = false;
              $scope.contentStatusList = response.data;
            },
            function (err) {
              $scope.busy = false;
              $scope.error = err;
            }
          );
        };

        $scope.addFeedback = function () {
          $scope.error = '';
          $scope.ngModel.feedback_list = $scope.ngModel.feedback_list || [];
          $scope.ngModel.feedback_list.push({ date: new Date() });
        };

        $scope.getContentStatusList();
        $scope.getCommentsTypesList();
        $scope.getReportsTypesList();
        $scope.getFeedbackTypeList();
      },
      template: `/*##0/i-feedback.html*/`,
    };
  },
]);

app.directive('iAddress', [
  '$http',
  '$interval',
  '$timeout',
  'isite',
  function ($http, $interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        ngModel: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        if (!$scope.id2) {
          $scope.id2 = Math.random().toString().replace('.', '_');
        }
        $scope.getCountriesList = function (where) {
          $scope.busy = true;
          $http({
            method: 'POST',
            url: '/api/countries/all',
            data: {
              where: {
                active: true,
              },
              select: {
                id: 1,
                name_ar: 1,
                name_en: 1,
                code: 1,
                country_code: 1,
              },
            },
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done && response.data.list.length > 0) {
                $scope.countriesList = response.data.list;
              }
            },
            function (err) {
              $scope.busy = false;
              $scope.error = err;
            }
          );
        };

        $scope.getGovesList = function (country) {
          $scope.busy = true;
          $scope.govesList = [];
          $scope.cityList = [];
          $scope.areaList = [];
          $http({
            method: 'POST',
            url: '/api/goves/all',
            data: {
              where: {
                'country.id': country.id,
                active: true,
              },
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
              if (response.data.done && response.data.list.length > 0) {
                $scope.govesList = response.data.list;
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
          $scope.cityList = [];
          $scope.areaList = [];
          $http({
            method: 'POST',
            url: '/api/city/all',
            data: {
              where: {
                'gov.id': gov.id,
                active: true,
              },
              select: { id: 1, name_ar: 1, name_en: 1 },
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
          $scope.areaList = [];
          $http({
            method: 'POST',
            url: '/api/area/all',
            data: {
              where: {
                'city.id': city.id,
                active: true,
              },
              select: { id: 1, name_ar: 1, name_en: 1 },
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
        $scope.getCountriesList();
      },
      template: `/*##0/i-address.html*/`,
    };
  },
]);

app.directive('iCategoryRequire', [
  '$http',
  '$interval',
  '$timeout',
  'isite',
  function ($http, $interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        ngModel: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        if (!$scope.id2) {
          $scope.id2 = Math.random().toString().replace('.', '_');
        }

        $scope.getTypesCategoryRequireList = function () {
          $scope.error = '';
          $scope.busy = true;
          $scope.typesCategoryRequireList = [];
          $http({
            method: 'POST',
            url: '/api/types_category_require/all',
          }).then(
            function (response) {
              $scope.busy = false;
              $scope.typesCategoryRequireList = response.data;
            },
            function (err) {
              $scope.busy = false;
              $scope.error = err;
            }
          );
        };

        $scope.getTypesCategoryRequireList();
      },
      template: `/*##0/i-category-require.html*/`,
    };
  },
]);

app.directive('iAdRequire', [
  '$http',
  '$interval',
  '$timeout',
  'isite',
  function ($http, $interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        ngModel: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        if (!$scope.id2) {
          $scope.id2 = Math.random().toString().replace('.', '_');
        }
      },
      template: `/*##0/i-ad-require.html*/`,
    };
  },
]);

app.directive('iSubCategory', [
  '$http',
  '$interval',
  '$timeout',
  'isite',
  function ($http, $interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        ngModel: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        if (!$scope.id2) {
          $scope.id2 = Math.random().toString().replace('.', '_');
        }
        $scope.showModal = function (ngModel) {
          site.showModal('#sub_category_' + $scope.id2);
        };
        $scope.hideModal = function (params) {
          site.hideModal('#sub_category_' + $scope.id2);
        };
        $scope.addSubCategoryList = function (ngModel) {
          ngModel.sub_category_list = ngModel.sub_category_list || [{ sub_category_list: [] }];
          ngModel.sub_category_list.push({ sub_category_list: [] });
        };
        $scope.loadUsers = function (ev, search_user) {
          $scope.users_list = [];
          if (ev.which === 13) {
            $scope.busy = true;
            $http({
              method: 'POST',
              url: '/api/users/all',
              data: {
                where: {
                  search: search_user,
                },
                select: { id: 1, email: 1, mobile: 1, profile: 1 },
              },
            }).then(
              function (response) {
                $scope.busy = false;

                if (response.data.done) {
                  $scope.users_list = response.data.users;
                } else {
                }
              },
              function (err) {
                $scope.busy = false;
                $scope.error = err;
              }
            );
          }
        };
      },
      template: `/*##0/i-sub-category.html*/`,
    };
  },
]);
app.directive('iCountry', [
  '$interval',
  '$timeout',
  'isite',
  function ($interval, $timeout, isite) {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        v: '@',
        label: '@',
        display: '@',
        display2: '@',
        disabled: '@',
        css: '@',
        space: '@',
        primary: '@',
        ngValue: '@',
        ngModel: '=',
        ngSearch: '=',
        ngChange: '&',
        ngAdd: '&',
        items: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        $scope.display = attrs.display = attrs.display || 'name';
        $scope.primary = attrs.primary = attrs.primary || 'id';
        attrs.space = attrs.space || ' ';
        attrs.ngValue = attrs.ngValue || '';

        $scope.searchElement = $(element).find('.dropdown .search');
        $scope.popupElement = $(element).find('.dropdown .dropdown-content');

        if (typeof attrs.disabled !== 'undefined') {
          attrs.disabled = 'disabled';
        } else {
          attrs.disabled = '';
        }

        if (typeof attrs.ngAdd == 'undefined') {
          $scope.fa_add = 'fa-search';
        } else {
          $scope.fa_add = 'fa-plus';
        }

        if (typeof attrs.ngSearch == 'undefined') {
          $scope.showSearch = !1;
        } else {
          $scope.showSearch = !0;
        }

        let input = $(element).find('input');
        $(element).hover(
          () => {
            $scope.popupElement.css('display', 'block');
          },
          () => {
            $scope.popupElement.css('display', 'none');
          }
        );
        $scope.focus = function () {
          $('.i-list .dropdown-content').css('display', 'none');
          $scope.popupElement.css('display', 'block');
          $scope.searchElement.focus();
        };
        $scope.hide = function () {
          $scope.popupElement.css('display', 'none');
        };

        $scope.getValue = function (item) {
          let v = isite.getValue(item, $scope.display);
          return v || '';
        };

        $scope.getValue2 = function (item) {
          if ($scope.display2) {
            return isite.getValue(item, $scope.display2) || '';
          }
          return '';
        };

        $scope.getNgModelValue = function (ngModel) {
          if (ngModel && $scope.display && $scope.ngValue) {
            return isite.getValue(ngModel, $scope.display.replace($scope.ngValue + '.', '')) || '';
          } else if (ngModel && $scope.display) {
            return isite.getValue(ngModel, $scope.display) || '';
          }
          return '';
        };

        $scope.getNgModelValue2 = function (ngModel) {
          if (ngModel && $scope.display2 && $scope.ngValue) {
            return isite.getValue(ngModel, $scope.display2.replace($scope.ngValue + '.', '')) || '';
          } else if (ngModel && $scope.display2) {
            return isite.getValue(ngModel, $scope.display2) || '';
          }
          return '';
        };

        $scope.getNgValue = function (item) {
          if (item && $scope.ngValue) {
            return isite.getValue(item, $scope.ngValue);
          }
          return item;
        };

        $scope.$watch('items', (items) => {
          input.val('');

          if (items) {
            items.forEach((item) => {
              item.$display = item.country_code + ' + ' + ' ' + $scope.getValue(item);
            });
          }

          if (items && $scope.ngModel) {
            items.forEach((item) => {
              if (isite.getValue(item, $scope.primary) == isite.getValue($scope.ngModel, $scope.primary)) {
                $scope.ngModel = item;
                item.$display = item.country_code + ' + ' + ' ' + $scope.getValue(item);
                input.val(item.$display);
              }
            });
          }
        });

        $scope.$watch('ngModel', (ngModel) => {
          input.val('');

          $scope.ngModel = ngModel;

          if (ngModel) {
            input.val(ngModel.country_code + ' + ' + ' ' + $scope.getNgModelValue(ngModel));
          }
        });

        $scope.updateModel = function (item) {
          $scope.ngModel = $scope.getNgValue(item, $scope.ngValue);
          input.val($scope.getNgModelValue($scope.ngModel) + attrs.space + $scope.getNgModelValue2($scope.ngModel));
          $timeout(() => {
            $scope.ngChange();
          });
          $scope.hide();
        };
      },
      template: `/*##0/i-country.html*/`,
    };
  },
]);
