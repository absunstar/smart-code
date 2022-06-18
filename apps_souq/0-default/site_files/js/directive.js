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
          $scope.id2 = Math.random().toString().replace('.','_');
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
                select: { id: 1, email: 1, profile: 1 },
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
      template: `/*##0-default/i-user.html*/`,
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
          $scope.id2 = Math.random().toString().replace('.','_');
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
                select: { id: 1, code: 1, name_ar: 1, name_en: 1, user: 1 },
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
      template: `/*##0-default/i-store.html*/`,
    };
  },
]);
