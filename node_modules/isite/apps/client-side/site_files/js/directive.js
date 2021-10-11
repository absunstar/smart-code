var app = app || angular.module('myApp', []);
window.$ = window.jQuery;

app.filter('xdate', function () {
  return function (item) {
    if (item) {
      if (item.day2) {
        return `${item.day} - ${item.month + 1} - ${item.year} -- ${item.day2} - ${item.month2 + 1} - ${item.year2}`;
      } else {
        return `${item.day} - ${item.month + 1} - ${item.year}`;
      }
    }
  };
});

app.service('isite', [
  '$http',
  function ($http) {
    this.getValue = function (obj, property) {
      if (!obj || !property) {
        return null;
      }

      if (property == '_') {
        return obj;
      }

      let arr = property.split('.');

      if (arr.length === 1) {
        return obj[arr[0]];
      }

      if (arr.length === 2) {
        return obj[arr[0]][arr[1]];
      }

      if (arr.length === 3) {
        return obj[arr[0]][arr[1]][arr[2]];
      }

      return null;
    };

    this.uploadImage = function (files, options, callback) {
      options = Object.assign(
        {
          category: 'default',
        },
        options,
      );
      callback = callback || function () {};

      var fd = new FormData();
      fd.append('fileToUpload', files[0]);
      $http
        .post('/api/upload/image/' + options.category, fd, {
          withCredentials: !0,
          headers: {
            'Content-Type': undefined,
          },
          uploadEventHandlers: {
            progress: function (e) {
              callback(null, null, e);
            },
          },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data && res.data.done) {
              callback(null, res.data.image_url);
            }
          },
          function (error) {
            callback(error, null, null);
          },
        );
    };

    this.uploadFile = function (files, options, callback) {
      options = Object.assign(
        {
          category: 'default',
        },
        options,
      );
      callback = callback || function () {};

      var fd = new FormData();
      fd.append('fileToUpload', files[0]);
      $http
        .post('/api/upload/file/' + options.category, fd, {
          withCredentials: !0,
          headers: {
            'Content-Type': undefined,
          },
          uploadEventHandlers: {
            progress: function (e) {
              callback(null, null, e);
            },
          },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data && res.data.done && res.data.file) {
              callback(null, {
                name: res.data.file.name,
                url: res.data.file.url,
              });
            }
          },
          function (error) {
            callback(error, null, null);
          },
        );
    };

    this.deleteFile = function (file, callback) {
      callback = callback || function () {};
      callback();
    };

    this.upload = function (files, options, callback) {
      options = Object.assign(
        {
          api: '/api/upload/file',
        },
        options,
      );
      callback = callback || function () {};

      var fd = new FormData();
      fd.append('fileToUpload', files[0]);
      $http
        .post(options.api, fd, {
          withCredentials: !0,
          headers: {
            'Content-Type': undefined,
          },
          uploadEventHandlers: {
            progress: function (e) {
              callback(null, null, e);
            },
          },
          transformRequest: angular.identity,
        })
        .then(
          function (res) {
            if (res.data && res.data.done && res.data.file) {
              callback(null, {
                name: res.data.file.name,
                url: res.data.file.url,
              });
            }
          },
          function (error) {
            callback(error, null, null);
          },
        );
    };
  },
]);

app.directive('iDate', function () {
  return {
    link: function (scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $(element)
        .find('select')
        .focus(() => {
          $('.popup').hide();
        });

      scope.days1 = [];
      for (let i = 1; i < 32; i++) {
        scope.days1.push(i);
      }
      scope.years1 = [];
      for (let i = 1900; i < 2100; i++) {
        scope.years1.push(i);
      }
      scope.monthes1 = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];
    },
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      label: '@',
      disabled: '@',
      ngModel: '=',
    },
    template: `
      <div class="row i-date">
  
        <div class=" control">
          <label> {{label}} </label>
          <div class="row">
            <div class="col3 day"> 
              <select ng-disabled="disabled" v="{{v}}" ng-model="ngModel.day" class="appearance-none no-border-left no-border-radius" >
              <option ng-repeat="d1 in days1" ng-value="d1"> {{d1}} </option>
              </select>
            </div>
            <div class="col5 month"> 
              <select ng-disabled="disabled" v="{{v}}" ng-model="ngModel.month" class="appearance-none no-border-left no-border-right no-border-radius" >
              <option ng-repeat="m1 in monthes1" ng-value="$index"> {{m1}} </option>
              </select>
            </div>
            <div class="col4 year"> 
              <select ng-disabled="disabled" v="{{v}}" ng-model="ngModel.year" class="appearance-none no-border-right no-border-radius" >
              <option ng-repeat="y1 in years1" ng-value="y1"> {{y1}} </option>
              </select>
            </div>
          </div>
        </div>
    
  
      </div>
      `,
  };
});

app.directive('iDate2', function () {
  return {
    link: function ($scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $scope.days1 = [];
      for (let i = 1; i < 32; i++) {
        $scope.days1.push(i);
      }
      $scope.years1 = [];
      for (let i = 1900; i < 2100; i++) {
        $scope.years1.push(i);
      }
      $scope.monthes1 = [
        'يناير / Jan',
        'فبراير / Feb',
        'مارس / Mar',
        'ابريل / Aper',
        'مايو / May',
        'يونيو / June',
        'يوليو / Jule',
        'اغسطس / Aug',
        'سبتمبر / Sep',
        'اكتوبر / Oct',
        'نوفمبر / Nov',
        'ديسمبر / Des',
      ];
      $scope.monthes0 = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

      $scope.model = null;

      $(element)
        .find('select')
        .focus(() => {
          $('.popup').hide();
        });

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel = new Date(ngModel);
          $scope.model = $scope.model || {};
          $scope.model.day = ngModel.getDate();
          $scope.model.month = ngModel.getMonth();
          $scope.model.year = ngModel.getFullYear();
        } else {
          $scope.model = $scope.model || {};
          $scope.model.day = 0;
          $scope.model.month = -1;
          $scope.model.year = 0;
        }
      });

      $scope.updateDate = function () {
        if ($scope.model && $scope.model.year && $scope.model.day) {
          $scope.ngModel = new Date($scope.model.year, $scope.model.month, $scope.model.day, 0, 0, 0);
        } else {
          delete $scope.ngModel;
        }
      };
    },
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      disabled: '@',
      label: '@',
      ngModel: '=',
    },
    template: `
      <div class="row i-date2">
  
        <div class=" control">
          <label> {{label}}  </label>
          <div class="row">
            <div class="col3 day"> 
              <select  v="{{v}}" ng-disabled="disabled" ng-model="model.day" ng-change="updateDate()" class="appearance-none no-border-left no-border-radius" >
              <option ng-repeat="d1 in days1" ng-value="d1"> {{d1}} </option>
              </select>
            </div>
            <div class="col5 month"> 
              <select  v="{{v}}" ng-disabled="disabled" ng-model="model.month" ng-change="updateDate()" class="appearance-none no-border-left no-border-right no-border-radius" >
              <option ng-repeat="m1 in monthes1" ng-value="$index"> {{m1}} </option>
              </select>
            </div>
            <div class="col4 year"> 
              <select  v="{{v}}" ng-disabled="disabled" ng-model="model.year" ng-change="updateDate()" class="appearance-none no-border-right no-border-radius" >
              <option ng-repeat="y1 in years1" ng-value="y1"> {{y1}} </option>
              </select>
            </div>
          </div>
        </div>
    
  
      </div>
      `,
  };
});

app.directive('iTime', function () {
  return {
    link: function ($scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $scope.model = {};

      $scope.hours = [];
      for (let i = 1; i < 25; i++) {
        $scope.hours.push(i);
      }

      $scope.minutes = [];
      for (let i = 0; i < 60; i++) {
        $scope.minutes.push(i);
      }

      $(element)
        .find('select')
        .focus(() => {
          $('.popup').hide();
        });

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel.date = new Date(ngModel.date);
          $scope.model = $scope.model || {};
          $scope.model.hour = ngModel.hour;
          $scope.model.minute = ngModel.minute;
        } else {
          $scope.model = $scope.model || {};
          $scope.model.hour = 0;
          $scope.model.minute = 0;
        }
      });

      $scope.updateTime = function () {
        if ($scope.model) {
          $scope.ngModel = $scope.ngModel || {};
          $scope.ngModel.hour = $scope.model.hour;
          $scope.ngModel.minute = $scope.model.minute;
          $scope.ngModel.date = new Date(null, null, null, $scope.model.hour, $scope.model.minute, null);
        } else {
          delete $scope.ngModel;
        }
      };
    },
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      disabled: '@',
      label: '@',
      ngModel: '=',
    },
    template: `
      <div class="row i-time">
        <div class=" control ">
          <label class="text-center"> {{label}}  </label>
        <div class="row">
            <div class="col6 right">
            <div class="row">
            <div class="col2"></div>
            <div class="col8">
            <select ng-disabled="disabled" ng-model="model.minute" ng-change="updateTime()" class="small appearance-none no-border-left no-border-radius" >
                    <option ng-repeat="m in minutes" ng-value="m"> {{m}}</option>
                </select>
            </div>
            <div class="col2"></div>
            </div>
                
            </div>
            <div class="col6">
            <div class="row">
            <div class="col2 space right">
            <span> : </span>
            </div>
            <div class="col8">
                <select ng-disabled="disabled" ng-model="model.hour" ng-change="updateTime()" class="large blue appearance-none no-border-left no-border-radius" >
                    <option ng-repeat="h in hours" ng-value="h"> {{h}} </option>
                </select>
            </div>
           
            </div>
           
            </div>
        </div>
      </div>
      `,
  };
});

app.directive('iDatetime2', function () {
  return {
    link: function ($scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $scope.hour1 = [];
      for (let i = 1; i < 25; i++) {
        $scope.hour1.push(i);
      }

      $scope.minute_list = [];
      for (let i = 1; i < 60; i++) {
        $scope.minute_list.push({
          name: i,
        });
      }

      $scope.days1 = [];
      for (let i = 1; i < 32; i++) {
        $scope.days1.push(i);
      }
      $scope.years1 = [];
      for (let i = 1900; i < 2100; i++) {
        $scope.years1.push(i);
      }
      $scope.monthes1 = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

      $scope.model = null;

      $(element)
        .find('select')
        .focus(() => {
          $('.popup').hide();
        });

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel = new Date(ngModel);
          $scope.model = $scope.model || {};
          $scope.model.hour = ngModel.getHours();
          $scope.model.minute = ngModel.getMinutes();
          $scope.model.day = ngModel.getDate();
          $scope.model.month = ngModel.getMonth();
          $scope.model.year = ngModel.getFullYear();
        } else {
          $scope.model = $scope.model || {};
          $scope.model.hour = 0;
          $scope.model.minute = 0;
          $scope.model.day = 0;
          $scope.model.month = -1;
          $scope.model.year = 0;
        }
      });

      $scope.updateDate = function () {
        if ($scope.model && $scope.model.year && $scope.model.day) {
          $scope.ngModel = new Date($scope.model.year, $scope.model.month, $scope.model.day, $scope.model.hour, $scope.model.minute);
        } else {
          delete $scope.ngModel;
        }
      };
    },
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      disabled: '@',
      label: '@',
      ngModel: '=',
    },
    template: `
      <div class="row i-datetime2">
  
        <div class=" control">
          <label> {{label}}  </label>
          <div class="row">

            <div class="col2 day"> 
              <select v="{{v}}" ng-disabled="disabled" ng-model="model.day" ng-change="updateDate()" class="appearance-none no-border-left no-border-radius" >
              <option ng-repeat="d1 in days1" ng-value="d1"> {{d1}} </option>
              </select>
            </div>
            <div class="col5 month"> 
              <select v="{{v}}" ng-disabled="disabled" ng-model="model.month" ng-change="updateDate()" class="appearance-none no-border-left no-border-right no-border-radius" >
              <option ng-repeat="m1 in monthes1" ng-value="$index"> {{m1}} </option>
              </select>
            </div>
            <div class="col3 year"> 
              <select v="{{v}}" ng-disabled="disabled" ng-model="model.year" ng-change="updateDate()" class="appearance-none no-border-right no-border-radius" >
              <option ng-repeat="y1 in years1" ng-value="y1"> {{y1}} </option>
              </select>
            </div>

            <div class="col1 hour"> 
                <select v="{{v}}" ng-disabled="disabled" ng-model="model.hour" ng-change="updateDate()" class="appearance-none  no-border-radius" >
                <option ng-repeat="h1 in hour1" ng-value="h1"> {{h1}} </option>
             </select>
            </div>
            <div class="col1 minute"> 
                <select v="{{v}}" ng-disabled="disabled" ng-model="model.minute" ng-change="updateDate()" class="green appearance-none no-border-right no-border-radius" >
                <option ng-repeat="m1 in minute_list" ng-value="m1.name" class="green"> {{m1.name}} </option>
              </select>
            </div>

          </div>
        </div>
    
  
      </div>
      `,
  };
});

app.directive('iMonth2', function () {
  return {
    link: function ($scope, element, attrs) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $scope.years = [];
      for (let i = 1900; i < 2100; i++) {
        $scope.years.push(i);
      }
      $scope.monthes = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

      $scope.model = null;

      $(element)
        .find('select')
        .focus(() => {
          $('.popup').hide();
        });

      $scope.$watch('ngModel', function (ngModel) {
        if (ngModel) {
          ngModel = new Date(ngModel);
          $scope.model = $scope.model || {};
          $scope.model.day = 1;
          $scope.model.month = ngModel.getMonth();
          $scope.model.year = ngModel.getFullYear();
        } else {
          $scope.model = $scope.model || {};
          $scope.model.day = 0;
          $scope.model.month = -1;
          $scope.model.year = 0;
        }
      });

      $scope.updateDate = function () {
        if ($scope.model && $scope.model.year) {
          $scope.ngModel = new Date($scope.model.year, $scope.model.month, 1);
        } else {
          delete $scope.ngModel;
        }
      };
    },
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      label: '@',
      disabled: '@',
      ngModel: '=',
    },
    template: `
      <div class="row i-date2">
  
        <div class=" control">
          <label> {{label}} </label>
          <div class="row">
           
            <div class="col7 month"> 
              <select ng-disabled="disabled" v="{{v}}" ng-model="model.month" ng-change="updateDate()" class="appearance-none no-border-left  no-border-radius" >
              <option ng-repeat="m1 in monthes" ng-value="$index"> {{m1}} </option>
              </select>
            </div>

            <div class="col5 year"> 
              <select ng-disabled="disabled" v="{{v}}" ng-model="model.year" ng-change="updateDate()" class="appearance-none no-border-right no-border-radius" >
              <option ng-repeat="y1 in years" ng-value="y1"> {{y1}} </option>
              </select>
            </div>

          </div>
        </div>
    
  
      </div>
      `,
  };
});

app.directive('iFulldate', [
  '$http',
  function ($http) {
    return {
      link: function ($scope, element, attrs, ngModel) {
        let _busy = !1;

        if (typeof attrs.disabled !== 'undefined') {
          attrs.disabled = 'disabled';
        } else {
          attrs.disabled = '';
        }

        $(element)
          .find('select')
          .focus(() => {
            $('.popup').hide();
          });

        $scope.days1 = [];
        for (let i = 1; i < 32; i++) {
          $scope.days1.push(i);
        }
        $scope.years1 = [];
        for (let i = 1950; i < 2030; i++) {
          $scope.years1.push(i);
        }

        $scope.monthes1 = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

        $scope.days2 = [];
        for (let i = 1; i < 31; i++) {
          $scope.days2.push(i);
        }
        $scope.years2 = [];
        for (let i = 1370; i < 1450; i++) {
          $scope.years2.push(i);
        }
        $scope.monthes2 = ['محرم', 'صفر', 'ربيع اول', 'ربيع ثان', 'جمادى اول', 'جمادى ثان', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذى القعدة', 'ذى الحجة'];

        $scope.model = {};

        $scope.$watch('ngModel', function (ngModel) {
          if (ngModel) {
            $scope.model = ngModel;
          } else {
            $scope.model = {};
          }
        });

        $scope.$watch('ngModel.date', function (date) {
          if (date) {
            if (typeof date == 'string') {
              date = new Date(date);
            }
            $scope.model = $scope.model || {};
            $scope.model.date = date;
            $scope.model.day = date.getDate();
            $scope.model.month = date.getMonth();
            $scope.model.year = date.getFullYear();
            $scope.get_hijri_date();
          }
        });

        $scope.get_hijri_date = function () {
          if ($scope.model && $scope.model.year && $scope.model.day) {
            ngModel.$setViewValue($scope.model);
            if (_busy) {
              return;
            }
            _busy = !0;
            $scope.model.date = new Date($scope.model.year, $scope.model.month, $scope.model.day);
            $http({
              method: 'POST',
              url: '/api/get_hijri_date',
              data: {
                date: $scope.model.year + '/' + ($scope.model.month + 1) + '/' + $scope.model.day,
              },
            })
              .then((response) => {
                if (response.data.done) {
                  $scope.model.hijri = response.data.hijri;
                  $scope.model.day2 = parseInt($scope.model.hijri.split('/')[2]);
                  $scope.model.month2 = parseInt($scope.model.hijri.split('/')[1]) - 1;
                  $scope.model.year2 = parseInt($scope.model.hijri.split('/')[0]);
                  ngModel.$setViewValue($scope.model);
                  _busy = !1;
                }
              })
              .catch(() => {
                _busy = !1;
              });
          }
        };

        $scope.get_normal_date = function () {
          if ($scope.model && $scope.model.year2 && $scope.model.day2) {
            ngModel.$setViewValue($scope.model);
            if (_busy) {
              return;
            }
            _busy = !0;
            $http({
              method: 'POST',
              url: '/api/get_normal_date',
              data: {
                hijri: $scope.model.year2 + '/' + ($scope.model.month2 + 1) + '/' + $scope.model.day2,
              },
            })
              .then((response) => {
                if (response.data.done) {
                  $scope.model.date = new Date(response.data.date);
                  $scope.model.day = parseInt(response.data.date.split('/')[2]);
                  $scope.model.month = parseInt(response.data.date.split('/')[1]) - 1;
                  $scope.model.year = parseInt(response.data.date.split('/')[0]);
                  ngModel.$setViewValue($scope.model);
                  _busy = !1;
                }
              })
              .catch(() => {
                _busy = !1;
              });
          }
        };
      },
      restrict: 'E',
      require: 'ngModel',
      scope: {
        v: '@',
        label1: '@',
        label2: '@',
        disabled: '@',
        ngModel: '=',
        ngChange: '&',
      },
      template: `
      <div class="row i-date">
  
        <div class="col6 control">
          <label> {{label1}} </label>
          <div class="row">
            <div class="col3 day"> 
              <select ng-change="get_hijri_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.day" class="appearance-none no-border-left no-border-radius">
              <option ng-repeat="d1 in days1" ng-value="d1"> {{d1}} </option>
              </select>
            </div>
            <div class="col5 month"> 
              <select ng-change="get_hijri_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.month" class="appearance-none no-border-left no-border-right no-border-radius">
              <option ng-repeat="m1 in monthes1" ng-value="$index"> {{m1}} </option>
              </select>
            </div>
            <div class="col4 year"> 
              <select ng-change="get_hijri_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.year" class="appearance-none no-border-right no-border-radius">
              <option ng-repeat="y1 in years1" ng-value="y1"> {{y1}} </option>
              </select>
            </div>
          </div>
        </div>
     
        <div class="col6 control">
          <label> {{label2}} </label>
          <div class="row">
            <div class="col3 day"> 
              <select ng-change="get_normal_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.day2" class="appearance-none no-border-left no-border-radius">
              <option ng-repeat="d2 in days2" ng-value="d2"> {{d2}} </option>
              </select>
            </div>
            <div class="col5 month"> 
              <select ng-change="get_normal_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.month2" class="appearance-none no-border-left no-border-right no-border-radius">
              <option ng-repeat="m2 in monthes2" ng-value="$index"> {{m2}} </option>
              </select>
            </div>
            <div class="col4 year"> 
              <select ng-change="get_normal_date()" ng-disabled="disabled" v="{{v}}" ng-model="model.year2" class="appearance-none no-border-right no-border-radius">
              <option ng-repeat="y2 in years2" ng-value="y2"> {{y2}} </option>
              </select>
            </div>
          </div>
        </div>
  
      </div>
      `,
    };
  },
]);

app.directive('iControl', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      id2: '@',
      label: '@',
      type: '@',
      disabled: '@',
      ngModel: '=',
      ngChange: '&',
      ngKeydown: '&',
    },
    link: function (scope, element, attrs, ctrl) {
      attrs.type = attrs.type || 'text';

      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      $(element)
        .find('input')
        .focus(() => {
          $('.popup').hide();
        });

      scope.$watch(attrs.ngModel, function (v) {});
    },
    template: `
        <div class="control">
            <label> {{label}} </label>
            <input id="{{id2}}" ng-disabled="disabled" autofocus v="{{v}}"  type="{{type}}" ng-model="ngModel" ng-change="ngChange()" ngKeydown="ngKeydown()">
        </div>
        `,
  };
});

app.directive('iTextarea', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      v: '@',
      label: '@',
      disabled: '@',
      rows: '@',
      ngModel: '=',
      ngChange: '&',
    },
    link: function (scope, element, attrs, ctrl) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }
      scope.rows = scope.rows || 4;

      $(element)
        .find('textarea')
        .focus(() => {
          $('.popup').hide();
        });
    },
    template: `
        <div class="control">
            <label> {{label}} </label>
            <textarea ng-disabled="disabled" rows="{{rows}}" v="{{v}}" ng-model="ngModel" ng-change="ngChange()"></textarea>
        </div>
        `,
  };
});

app.directive('iCheckbox', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      label: '@',
      ngModel: '=',
      ngChange: '&',
    },
    link: function (scope, element, attrs, ctrl) {
      if (typeof attrs.disabled !== 'undefined') {
        attrs.disabled = 'disabled';
      } else {
        attrs.disabled = '';
      }

      scope.updateModal = function (ngModel) {
        if (attrs.disabled == 'disabled') {
          return !1;
        } else {
          scope.ngModel = !ngModel;
          return !0;
        }
      };
    },
    template: `
        <div class="selector" ng-class="{'selected' : ngModel , 'un-selected' : !ngModel  }" ng-click="updateModal(ngModel);ngChange($event , ngModel)">
          <i ng-show="!ngModel" class="fa fa-square"></i>  <i ng-show="ngModel" class="fa fa-check"></i> {{label}}
        </div>
        `,
  };
});

app.directive('iCheckbox2', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      label: '@',
      ngModel: '=',
    },
    link: function (scope, element, attrs, ctrl) {},
    template: `
        <div class="control">
            <label class="checkbox">
                <span class="title"> {{label}} </span>
                <input type="checkbox" ng-model="ngModel" >
                <span class="checkmark"></span>
            </label>
        </div>
        `,
  };
});

app.directive('iRadio', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      label: '@',
      ngValue: '@',
      group: '@',
      ngModel: '=',
    },
    link: function ($scope, element, attrs, ctrl) {
      if (!attrs.group) {
        attrs.group = attrs.ngModel;
      }

      $scope.changeModal = function (ngValue) {
        $scope.ngModel = ngValue;
      };

      $scope.$watch('ngModel', (ngModel) => {
        if (ngModel) {
          if (ngModel == $scope.ngValue) {
          }
        }
      });

      $scope.$watch('ngValue', (ngValue) => {
        if (ngValue) {
          if (ngValue == $scope.ngModel) {
          }
        }
      });
    },
    template: `
        <div group="{{group}}" class="selector" ng-class="{'selected' : ngModel == ngValue , 'un-selected' : ngModel != ngValue  }" ng-click="changeModal(ngValue);ngChange($event , ngModel , ngValue)">
          <i ng-show="ngModel != ngValue" class="fa fa-circle"></i>  <i ng-show="ngModel == ngValue" class="fa fa-circle"></i> {{label}}
        </div>
        `,
  };
});

app.directive('iRadio2', function () {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      label: '@',
      ngValue: '@',
      group: '@',
      ngModel: '=',
    },
    link: function (scope, element, attrs, ctrl) {
      if (!attrs.group) {
        attrs.group = attrs.ngModel;
      }

      let input = $(element).find('input');

      scope.$watch('ngModel', (ngModel) => {
        if (ngModel) {
          scope.ngModel = ngModel;
          if (ngModel == scope.ngValue) {
            input.prop('checked', !0);
          }
        }
      });

      scope.$watch('ngValue', (ngValue) => {
        if (ngValue) {
          if (ngValue == scope.ngModel) {
            input.prop('checked', !0);
          }
        }
      });
    },
    template: `
        <div class="control">
            <label class="radio">
                <span > {{label}} </span>
                <input name="{{group}}" ng-value="ngValue" type="radio" ng-model="ngModel" >
                <span class="checkmark"></span>
            </label>
        </div>
        `,
  };
});

app.directive('iButton', function () {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      type: '@',
      click: '@',
      fa: '@',
    },
    link: function (scope, element, attrs, ctrl) {
      if (!attrs.fa && attrs.type) {
        if (attrs.type.like('*exit*') || attrs.type.like('*close*')) {
          attrs.fa = 'times';
        } else if (attrs.type.like('*view*') || attrs.type.like('*details*')) {
          attrs.fa = 'file';
        } else if (attrs.type.like('*add*') || attrs.type.like('*new*')) {
          attrs.fa = 'plus-circle';
        } else if (attrs.type.like('*update*') || attrs.type.like('*edit*')) {
          attrs.fa = 'pencil';
        } else if (attrs.type.like('*save*')) {
          attrs.fa = 'save';
        } else if (attrs.type.like('*delete*') || attrs.type.like('*remove*')) {
          attrs.fa = 'trash';
        } else if (attrs.type.like('*print*')) {
          attrs.fa = 'print';
        } else if (attrs.type.like('*search*')) {
          attrs.fa = 'search';
        } else if (attrs.type.like('*export*') || attrs.type.like('*excel*')) {
          attrs.fa = 'table';
        }
      }
    },
    template: `
        <a class="btn {{type}}">
        {{label}}
        <i ng-show="fa" class="fa fa-{{fa}}" aria-hidden="true"></i> </a>
        `,
  };
});

app.directive('iList', [
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
        let popup = $(element).find('.popup');
        let search = $(element).find('.search');

        function handlePosition() {
          let $modal_body = $(popup).closest('.modal-body');
          let $icontrol = $(popup).parent();
          let $ilist = $icontrol.parent();
          let width = $icontrol.width();
          let offset = $ilist.offset();
          let m_r = parseFloat($('body').css('margin-right').replace('px', ''));
          let m_l = parseFloat($('body').css('margin-left').replace('px', ''));
          let rigth = $(document).width() - offset.left - width + m_r + m_l;

          $(popup).css('width', width);
          $(popup).css('right', rigth);

          let top = 0;
          let parent_top = $icontrol.offset().top;
          let body_scroll = 0;
          let window_scroll = $(window).scrollTop();

          if ($modal_body.length > 0) {
            body_scroll = $modal_body.scrollTop();
          }

          if (window_scroll) {
            top = parent_top - window_scroll + 80;
          } else if (parent_top) {
            top = parent_top + 80;
          }

          $(popup).css('top', top);
        }

        $(window).scroll(function () {
          handlePosition();
        });

        $('.modal-body').scroll(function () {
          handlePosition();
        });

        $('.modal').scroll(function () {
          handlePosition();
        });

        $(popup)
          .closest('table')
          .closest('div')
          .scroll(function () {
            handlePosition();
          });

        $(popup).hide();

        $(input).focus(() => {
          $('.popup').hide();
          $(popup).show();
          handlePosition();
          $(popup).focus();
        });

        $scope.hide = function () {
          $(popup).hide();
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
          $(popup).hide();
          $(input).show();
          $timeout(() => {
            $scope.ngChange();
          });
        };
      },
      template: `
        <div class="control">
            <label> {{label}} </label>
            <input class="full-width text {{css}}" ng-disabled="disabled" v="{{v}}"  readonly>
            <input type="hidden" ng-model="ngModel.$display">
            <div class="popup">
            <div ng-show="showSearch" class="row search-box">
                <div class="col2 center pointer" ng-click="hide()">
                    <i class="fa fa-times center"></i>
                </div>
                <div class="col8">
                    <input ng-disabled="disabled" class="full-width search" ng-model="ngSearch" >
                </div>
                <div class="col2 center pointer" ng-click="ngAdd()">
                    <i class="fa {{fa_add}} center"></i>
                </div>
            </div>
                <item  ng-repeat="item in items | filter:{ $display : ngSearch}" ng-click="updateModel(item)">
                    {{getValue(item)}} <small class="left"> {{getValue2(item)}} </small>
                </item>
                <br>
                <div ng-show="items.length > 0" class="row">
                <div class="col4"></div>
                    <div class="col4 center bg-red padding pointer" ng-click="updateModel({})">
                            <i class="fa fa-trash white" aria-hidden="true"></i>
                    </div>
                    <div class="col4"></div>
                </div>
                
            </div>
        </div>
        `,
    };
  },
]);

app.directive('iChecklist', [
  '$interval',
  function ($interval) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        primary: '@',
        display: '@',
        ngModel: '=',
        items: '=',
        like: '&',
      },
      link: function ($scope, element, attrs, ctrl) {
        attrs.primary = attrs.primary || 'id';

        $scope.selectedItems = [];

        $scope.$watch('ngModel', (ngModel) => {
          $scope.reload();
        });

        $scope.reload = function () {
          $scope.selectedItems = [];

          if ($scope.ngModel) {
            $scope.ngModel.forEach((mitem) => {
              $scope.selectedItems.push(mitem);
            });

            if ($scope.items) {
              $scope.items.forEach((mitem) => {
                let exist = !1;
                $scope.selectedItems.forEach((sitem) => {
                  if (mitem[$scope.primary] === sitem[$scope.primary]) {
                    exist = !0;
                  }
                });
                if (exist) {
                  mitem.$selected = !0;
                } else {
                  mitem.$selected = !1;
                }
              });
            }
          }
          if (!$scope.ngModel) {
            $scope.selectedItems = [];
            if ($scope.items) {
              $scope.items.forEach((mitem) => {
                mitem.$selected = !1;
              });
            }
          }
        };

        $scope.change = function (item) {
          item.$selected = !item.$selected;

          if (item.$selected) {
            let exsits = !1;
            $scope.selectedItems.forEach((sitem) => {
              if (sitem[$scope.primary] === item[$scope.primary]) {
                exsits = !0;
              }
            });
            if (!exsits) {
              $scope.selectedItems.push(item);
            }
          } else {
            $scope.selectedItems.forEach((sitem, index) => {
              if (sitem[$scope.primary] === item[$scope.primary]) {
                $scope.selectedItems.splice(index, 1);
              }
            });
          }

          $scope.ngModel = $scope.selectedItems;
        };
      },
      template: `
       <div class="row padding check-list">
            <label class="title"> {{label}} </label>
                <div ng-repeat="item in items" ng-click="change(item);ngChange($event , item);" class="selector" ng-class="{'selected' : item.$selected , 'un-selected' : !item.$selected  }" >
                    <i ng-show="!item.$selected" class="fa fa-square"></i>  <i ng-show="item.$selected" class="fa fa-check"></i> {{item[display]}}
                </div>
        </div>
        `,
    };
  },
]);

app.directive('iChecklist2', [
  '$interval',
  function ($interval) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        primary: '@',
        display: '@',
        ngModel: '=',
        items: '=',
        like: '&',
      },
      link: function ($scope, element, attrs, ctrl) {
        attrs.primary = attrs.primary || 'id';

        $scope.selectedItems = [];

        $scope.$watch('ngModel', (ngModel) => {
          $scope.reload();
        });

        $scope.reload = function () {
          $scope.selectedItems = [];

          if ($scope.ngModel) {
            $scope.ngModel.forEach((mitem) => {
              $scope.selectedItems.push(mitem);
            });

            if ($scope.items) {
              $scope.items.forEach((mitem) => {
                let exist = !1;
                $scope.selectedItems.forEach((sitem) => {
                  if (mitem[$scope.primary] === sitem[$scope.primary]) {
                    exist = !0;
                  }
                });
                if (exist) {
                  mitem.$selected = !0;
                } else {
                  mitem.$selected = !1;
                }
              });
            }
          }
          if (!$scope.ngModel) {
            $scope.selectedItems = [];
            if ($scope.items) {
              $scope.items.forEach((mitem) => {
                mitem.$selected = !1;
              });
            }
          }
        };

        $scope.change = function (item) {
          if (item.$selected) {
            let exsits = !1;
            $scope.selectedItems.forEach((sitem) => {
              if (sitem[$scope.primary] === item[$scope.primary]) {
                exsits = !0;
              }
            });
            if (!exsits) {
              $scope.selectedItems.push(item);
            }
          } else {
            $scope.selectedItems.forEach((sitem, index) => {
              if (sitem[$scope.primary] === item[$scope.primary]) {
                $scope.selectedItems.splice(index, 1);
              }
            });
          }

          $scope.ngModel = $scope.selectedItems;
        };
      },
      template: `
       <div class="row padding check-list">
            <label class="title"> {{label}} </label>
            <div class="control" ng-repeat="item in items">
                <label class="checkbox" >
                    <span > {{item[display]}} </span>
                    <input type="checkbox" ng-model="item.$selected" ng-change="change(item)" >
                    <span class="checkmark"></span>
                </label>
            </div>
        </div>
        `,
    };
  },
]);

app.directive('iRadiolist', [
  '$interval',
  function ($interval) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        display: '@',
        ngModel: '=',
        items: '=',
      },
      link: function (scope, element, attrs) {
        scope.model = scope.ngModel;

        scope.code = 'radio_' + Math.random();

        scope.change = function (item) {
          scope.ngModel = item;
        };

        scope.isChecked = function (item) {
          if (item && scope.ngModel && scope.ngModel.id === item.id) {
            return !0;
          }
          return !1;
        };
      },
      template: `
       <div class="row padding radio-list">
            <label class="title"> {{label}} </label>
            <div class="control" ng-repeat="item in items">
                <label class="radio" >
                    <span > {{item[display]}} </span>
                    <input name="{{code}}" type="radio" ng-model="model"  ng-checked="isChecked(item)" ng-click="change(item)" ng-change="change(item)" >
                    <span class="checkmark"></span>
                </label>
            </div>
        </div>
        `,
    };
  },
]);

app.directive('iFile', [
  '$interval',
  'isite',
  function ($interval, isite) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        type: '@',
        ngModel: '=',
        ngClick: '&',
        onSelected: '&',
      },
      link: function (scope, element, attrs, ctrl) {
        scope.type = scope.type || 'bg-green';

        let input = $(element).find('input')[0];
        let a = $(element).find('a')[0];

        if (attrs.view !== '') {
          a.addEventListener('click', function () {
            input.click();
          });
        }

        input.addEventListener('change', function () {
          scope.ngModel = this.files[0].path;
          scope.onSelected(this.files[0].path);
          scope.$applyAsync();
        });

        scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            a.setAttribute('url', ngModel);
          }
        });
      },
      template: `
        <form class="form text-center pointer">
            <input  class="hidden" type="file" name="file" />
            <a class="btn {{type}}" ngClick="ngClick()" url="{{ngModel}}"> {{label}} </a>
        </form>
        `,
    };
  },
]);

app.directive('iImage', [
  '$interval',
  'isite',
  function ($interval, isite) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        category: '@',
        ngModel: '=',
        ngClick: '&',
      },
      link: function (scope, element, attrs, ctrl) {
        scope.category = scope.category || 'default';

        let input = $(element).find('input')[0];
        let img = $(element).find('img')[0];
        let progress = $(element).find('progress')[0];
        $(progress).hide();

        if (attrs.view !== '') {
          img.addEventListener('click', function () {
            input.click();
          });
        }

        input.addEventListener('change', function () {
          isite.uploadImage(
            this.files,
            {
              category: scope.category,
            },
            (err, image_url, e) => {
              if (e) {
                $(progress).show();
                progress.value = e.loaded;
                progress.max = e.total;
              }

              if (image_url) {
                scope.ngModel = image_url;
              }
            },
          );
        });

        scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            img.setAttribute('src', ngModel);
          }
        });
      },
      template: `
        <form class="form text-center pointer">
            <input  class="hidden" type="file" name="file" />
            <img class="bg-white"  ng-src="{{ngModel}}" ngClick="ngClick()" onerror="this.src='/images/no.jpg'" />
            <progress class="row"></progress>
        </form>
        `,
    };
  },
]);

app.directive('iUpload', [
  '$interval',
  'isite',
  function ($interval, isite) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        label: '@',
        api: '@',
        type: '@',
        ngModel: '=',
        ngClick: '&',
        onUploaded: '&',
      },
      link: function (scope, element, attrs, ctrl) {
        scope.type = scope.type || 'bg-green';

        let input = $(element).find('input')[0];
        let a = $(element).find('a')[0];
        let progress = $(element).find('progress')[0];
        $(progress).hide();

        if (attrs.view !== '') {
          a.addEventListener('click', function () {
            input.click();
          });
        }

        input.addEventListener('change', function () {
          isite.upload(
            this.files,
            {
              api: scope.api,
            },
            (err, file, e) => {
              if (e) {
                $(progress).show();
                progress.value = e.loaded;
                progress.max = e.total;
              }

              if (file) {
                scope.ngModel = file;
                scope.onUploaded();
              }
            },
          );
        });

        scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            a.setAttribute('url', ngModel);
          }
        });
      },
      template: `
        <form class="form text-center pointer">
            <input  class="hidden" type="file" name="file" />
            <a class="btn {{type}}" ngClick="ngClick()" url="{{ngModel}}"> {{label}} </a>
            <progress class="row"></progress>
        </form>
        `,
    };
  },
]);

app.directive('iFiles', [
  '$interval',
  'isite',
  function ($interval, isite) {
    return {
      restrict: 'E',
      required: 'ngModel',
      scope: {
        category: '@',
        label: '@',
        ngModel: '=',
      },
      link: function (scope, element, attrs, ctrl) {
        if (attrs.view === '') {
          scope.viewOnly = !0;
        }

        let progress = $(element).find('progress')[0];

        scope.category = scope.category || 'default';
        scope.id = Math.random().toString().replace('.', '_');
        scope.deleteFile = function (file) {
          isite.deleteFile(file, () => {
            for (let i = 0; i < scope.ngModel.length; i++) {
              let f = scope.ngModel[i];
              if (f.url === file.url) {
                scope.ngModel.splice(i, 1);
                return;
              }
            }
          });
        };

        let setEvent = !1;
        $interval(() => {
          if (setEvent) {
            return;
          }

          if (attrs.view !== '') {
            let btn = document.querySelector('#btn_' + scope.id);
            if (btn) {
              setEvent = !0;
              btn.addEventListener('click', function () {
                document.querySelector('#input_' + scope.id).click();
              });
            }

            let input = document.querySelector('#input_' + scope.id);
            if (input) {
              input.addEventListener('change', function () {
                isite.uploadFile(
                  this.files,
                  {
                    category: scope.category,
                  },
                  (err, file, e) => {
                    if (e) {
                      $(progress).show();
                      progress.value = e.loaded;
                      progress.max = e.total;
                    }

                    if (file) {
                      if (typeof scope.ngModel === 'undefined') {
                        scope.ngModel = [];
                      }
                      scope.ngModel.push(file);
                    }
                  },
                );
              });
            }
          } else {
            setEvent = !0;
          }
        }, 500);
      },
      template: `
            <div class="files">
                <label> {{label}} </label>
                <form ng-if="viewOnly !== !0" id="img_{{id}}" class="form text-center pointer">
                    <input id="input_{{id}}" class="hidden" type="file" name="file" />
                    <a id="btn_{{id}}" class="btn bg-green"> <i class="fa fa-upload white"></i> </a>
                </form>
                <progress class="row"></progress>
                <div class="padding">
                    
                    <div class="row padding" ng-repeat="f in ngModel">
                         <h2> 
                            <a class="btn default bg-blue" href="{{f.url}}"> <i class="fa fa-2x fa-download white"></i> </a>
                            <a ng-if="viewOnly !== !0" class="btn default bg-red" ng-click="deleteFile(f)"> <i class="fa fa-trash white"></i> </a>
                            <span>  {{f.name}} </span>
                         </h2>  
                    </div>
                </div>
            </div>
            
        `,
    };
  },
]);

app.directive('iDrag', [
  '$document',
  function ($document) {
    return function (scope, element, attr) {
      var startX = 0,
        startY = 0,
        x = 0,
        y = 0;

      element.css({
        position: 'relative',
      });

      element.on('mousedown', function (event) {
        event.preventDefault();
        startX = event.screenX - x;
        startY = event.screenY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.screenY - startY;
        x = event.screenX - startX;
        element.css({
          top: y + 'px',
          left: x + 'px',
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    };
  },
]);

app.directive('iTreeview', [
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
        space: '@',
        primary: '@',
        ngValue: '@',
        ngModel: '=',
        ngSearch: '=',
        ngChange: '&',
        ngClick: '&',
        ngAdd: '&',
        ngNode: '&',
        ngEdit: '&',
        ngDelete: '&',
        nodes: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        attrs.display = attrs.display || 'name';
        attrs.primary = attrs.primary || 'id';
        attrs.space = attrs.space || ' ';
        attrs.ngValue = attrs.ngValue || '';

        $scope.source = {};

        $scope.setNodes = function (v_node) {
          v_node.nodes.forEach((v_node2) => {
            v_node2.nodes = v_node2.nodes || [];
            $scope.nodes.forEach((node) => {
              if (node.$parent_id == v_node2.id) {
                node.v_display = node.v_display || '';
                node.v_display += node[attrs.display];

                let exist = !1;
                v_node2.nodes.forEach((n) => {
                  if (n.id == node.id) {
                    exist = !0;
                  }
                });
                if (!exist) {
                  v_node2.nodes.push(node);
                }
              }
            });
            $scope.setNodes(v_node2);
          });
        };

        $scope.v_nodes = [];

        $scope.$watch('ngModel', (ngModel) => {
          if (ngModel) {
            $scope.ngModel = ngModel;
            $scope.ngModel.v_display = $scope.ngModel.v_display || ngModel[attrs.display];
          }
        });

        $scope.$watch('nodes', (nodes) => {
          $scope.v_nodes = [];
          if (nodes) {
            nodes.forEach((node) => {
              node.$parent_id = node.parent_id || 0;
              node.v_display = node.v_display || '';
              node.v_display += node[attrs.display];
              if (node.$parent_id == 0) {
                let exist = !1;
                $scope.v_nodes.forEach((n) => {
                  if (n.id == node.id) {
                    exist = !0;
                  }
                });
                if (!exist) {
                  $scope.v_nodes.push(node);
                }
              }
            });

            $scope.v_nodes.forEach((v_node) => {
              v_node.nodes = v_node.nodes || [];

              nodes.forEach((node) => {
                node.$parent_id = node.parent_id || 0;
                if (node.$parent_id == v_node.id) {
                  node.v_display = node.v_display || '';
                  node.v_display += node[attrs.display];

                  let exist = !1;
                  v_node.nodes.forEach((n) => {
                    if (n.id == node.id) {
                      exist = !0;
                    }
                  });
                  if (!exist) {
                    v_node.nodes.push(node);
                  }
                }
              });

              $scope.setNodes(v_node);
            });
          }
        });
      },
      template: `
        <div class="treeview">
        <ul >
            <li ng-dblclick="$event.preventDefault();$event.stopPropagation();source.$actions = !0" ng-mouseleave="source.$actions = !1">
           
            <i ng-hide="openTree" class="fa fa-folder"></i>  <i ng-show="openTree" class="fa fa-folder"></i> 
           

            <span ng-click="openTree = !openTree" class="title"> {{label}} <small class="display"> [ {{ngModel.v_display}} ] </small>  </span>
                <div class="actions" ng-show="source.$actions === !0">
                    <i-button type="add default" ng-click="ngClick($event , ngModel);ngNode($event , ngModel)"></i-button>
                </div>
                <i-treenode display="{{display}}" ng-click="ngClick($event)" ng-add="ngAdd()" ng-edit="ngEdit()" ng-delete="ngDelete()" ng-show="openTree" ng-model="ngModel" nodes="v_nodes" ></i-treenode>
            </li>
        </ul>
        </div>
        `,
    };
  },
]);

app.directive('iTreenode', [
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
        space: '@',
        primary: '@',
        ngValue: '@',
        ngChange: '&',
        ngClick: '&',
        ngAdd: '&',
        ngEdit: '&',
        ngDelete: '&',
        ngModel: '=',
        ngSearch: '=',
        nodes: '=',
        nodes: '=',
      },
      link: function ($scope, element, attrs, ctrl) {
        attrs.display = attrs.display || 'name';
        attrs.primary = attrs.primary || 'id';
        attrs.space = attrs.space || ' ';
        attrs.ngValue = attrs.ngValue || '';
        $scope.nodes = $scope.nodes || [];

        $scope.v_nodes = [];

        $scope.$watch('nodes', (nodes) => {
          $scope.v_nodes = [];
          if (nodes) {
            nodes.forEach((node, i) => {
              if (node.nodes) {
                node.nodes.forEach((node2, i) => {
                  node2.$parent_id = node2.parent_id || node.id;
                  node2.v_display = node.v_display || ' ';
                  node2.v_display += ' - ' + node2[attrs.display];
                });
              }
            });
          }
        });

        $scope.updateParentModal = function (parent, node) {
          if (parent) {
            parent.ngModel = node;
            if (parent.$parent) {
              $scope.updateParentModal(parent.$parent, node);
            }
          }
        };

        $scope.unSelectParent = function (parent) {
          if (parent && parent.nodes) {
            parent.nodes.forEach((node) => {
              node.$selected = !1;
            });
            if (parent.$parent) {
              $scope.unSelectParent(parent.$parent);
            }
          }
        };

        $scope.unSelectNodes = function (nodes) {
          if (nodes) {
            nodes.forEach((node) => {
              node.$selected = !1;
              if (node.nodes) {
                $scope.unSelectNodes(node.nodes);
              }
            });
          }
        };

        $scope.updateModal = function (node) {
          $scope.ngModel = node;
          $scope.updateParentModal($scope.$parent, node);
        };

        $scope.selected = function (node) {
          $scope.unSelectParent($scope.$parent);
          $scope.unSelectNodes($scope.nodes);

          if (node.nodes) {
            node.nodes.forEach((itm) => {
              itm.$selected = !1;
            });
          }

          node.$selected = !0;
        };
      },
      template: `
        <div class="treenode"> 
        <ul >
            <li  ng-repeat="node in nodes" >
            <div class="row" ng-dblclick="$event.preventDefault();$event.stopPropagation();node.$actions = !0;source.$actions = !1" ng-mouseleave="node.$actions = !1">
            <span ng-show="node.nodes.length > 0" ng-click="node.$expand = !node.$expand;">
                    <i ng-hide="node.$expand" class="fa fa-caret-left"></i>  <i ng-show="node.$expand" class="fa fa-caret-down"></i> 
            </span>
            <span ng-hide="node.nodes.length > 0" >
                    <i class="fa fa-file"></i>
            </span>

                <span class="text" ng-class="{'selected' : node.$selected == !0}" ng-click="ngClick($event , node);node.$expand = !node.$expand;selected(node);updateModal(node)"   > {{node[display]}} </span>
                <div class="actions" ng-show="node.$actions === !0">
                    <i-button type="add default" ng-click="ngAdd(node)"></i-button>
                    <i-button type="edit default" ng-click="ngEdit(node)"></i-button>
                    <i-button type="delete default" ng-click="ngDelete(node)"></i-button>
                </div>
            </div>   
                <i-treenode display="{{display}}" ng-click="ngClick($event)" ng-add="ngAdd()" ng-edit="ngEdit()" ng-delete="ngDelete()" ng-show="node.$expand" ng-model="ngModel" nodes="node.nodes" nodes="node.nodes"></i-treenode>
            </li>
        </ul>
        </div>
        `,
    };
  },
]);
