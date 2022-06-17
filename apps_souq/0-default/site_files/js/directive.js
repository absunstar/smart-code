app.directive('iUser', [
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
                item.$display = $scope.getValue(item) + attrs.space + $scope.getValue2(item);
              });
            }
  
            if (items && $scope.ngModel) {
              items.forEach((item) => {
                if (isite.getValue(item, $scope.primary) == isite.getValue($scope.ngModel, $scope.primary)) {
                  $scope.ngModel = item;
                  item.$display = $scope.getValue(item) + attrs.space + $scope.getValue2(item);
                  input.val(item.$display);
                }
              });
            }
          });
  
          $scope.$watch('ngModel', (ngModel) => {
            input.val('');
  
            $scope.ngModel = ngModel;
  
            if (ngModel) {
              input.val(' ' + $scope.getNgModelValue(ngModel) + attrs.space + $scope.getNgModelValue2(ngModel));
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
        template: `/*##0-default/i-user.html*/`,
      };
    },
  ]);