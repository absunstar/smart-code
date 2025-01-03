app.controller("class_schedule", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.class_schedule = {};

  $scope.displayAddClassSchedule = function () {
    $scope.get_open_shift((shift) => {
      if (shift) {

        $scope._search = {};
        $scope.error = '';
        $scope.class_schedule = {
          image_url: '/images/class_schedule.png',
          shift: shift,
          sunday: true,
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          max_school_class: 0,
          active: true
        };
        if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.school_grade) {

          $scope.class_schedule.school_grade = $scope.schoolGradesList.find(_schoolGrade => { return _schoolGrade.id === $scope.defaultSettings.general_Settings.school_grade.id });
          if ($scope.class_schedule.school_grade && $scope.class_schedule.school_grade.id) {

            $scope.getStudentsYearsList($scope.class_schedule.school_grade);
          }

        }

        site.showModal('#classScheduleAddModal');

      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addClassSchedule = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#classScheduleAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/class_schedule/add",
      data: $scope.class_schedule
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#classScheduleAddModal');
          $scope.getClassScheduleList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          } else if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateClassSchedule = function (class_schedule, update) {

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope._search = {};

        $scope.error = '';
        $scope.detailsClassSchedule(class_schedule, update);
        $scope.class_schedule = {};
        site.showModal('#classScheduleUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateClassSchedule = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#classScheduleUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/class_schedule/update",
      data: $scope.class_schedule
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#classScheduleUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsClassSchedule = function (class_schedule, view) {
    $scope.error = '';
    $scope.detailsClassSchedule(class_schedule, view);

    $scope.class_schedule = {};
    site.showModal('#classScheduleDetailsModal');
  };

  $scope.detailsClassSchedule = function (class_schedule, view) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/class_schedule/view",
      data: {
        id: class_schedule.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.class_schedule = response.data.doc;
          if (view == 'update') {
            $scope.getSubjects($scope.class_schedule.students_years)
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteClassSchedule = function (class_schedule) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.detailsClassSchedule(class_schedule);
        $scope.class_schedule = {};
        site.showModal('#classScheduleDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteClassSchedule = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/class_schedule/delete",
      data: {
        id: $scope.class_schedule.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#classScheduleDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getClassScheduleList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/class_schedule/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getClassScheduleList($scope.search);
    site.hideModal('#classScheduleSearchModal');
    $scope.search = {}

  };

  $scope.getTrainersList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/trainer/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.trainersList = response.data.list;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };
  $scope.createSchedule = function () {

    $scope.class_schedule.schedules_list = [];

    if ($scope.class_schedule.saturday) $scope.class_schedule.schedules_list.push({ day: { name: 'saturday', Ar: 'السبت', En: 'Saturday' }, schedules_count_list: [] });
    if ($scope.class_schedule.sunday) $scope.class_schedule.schedules_list.push({ day: { name: 'sunday', Ar: 'الأحد', En: 'Sunday' }, schedules_count_list: [] });
    if ($scope.class_schedule.monday) $scope.class_schedule.schedules_list.push({ day: { name: 'monday', Ar: 'الإثنين', En: 'Monday' }, schedules_count_list: [] });
    if ($scope.class_schedule.tuesday) $scope.class_schedule.schedules_list.push({ day: { name: 'tuesday', Ar: 'الثلاثاء', En: 'Tuesday' }, schedules_count_list: [] });
    if ($scope.class_schedule.wednesday) $scope.class_schedule.schedules_list.push({ day: { name: 'wednesday', Ar: 'الأربعاء', En: 'Wednesday' }, schedules_count_list: [] });
    if ($scope.class_schedule.thursday) $scope.class_schedule.schedules_list.push({ day: { name: 'thursday', Ar: 'الخميس', En: 'Thursday' }, schedules_count_list: [] });
    if ($scope.class_schedule.friday) $scope.class_schedule.schedules_list.push({ day: { name: 'friday', Ar: 'الجمعة', En: 'Friday' }, schedules_count_list: [] });

    $scope.class_schedule.schedules_list.forEach(_sl => {
      _sl.count_school_class = $scope.class_schedule.max_school_class;
      for (let i = 0; i < $scope.class_schedule.max_school_class; i++) {
        _sl.schedules_count_list.push({});
      };
    });
  };

  $scope.getSubjects = function (c) {
    $scope.subjectsList = [];

    c.subjects_list.forEach(_s => {
      $scope.subjectsList.push({
        name: _s.subject.name,
        code: _s.subject.code,
        id: _s.subject.id
      })
    });
  };


  $scope.addClass = function (c) {
    $scope.error = '';

    let count_school_class_length = c.schedules_count_list.length + 1;

    if (count_school_class_length > $scope.class_schedule.max_school_class) {
      $scope.error = '##word.err_class_bigger##';

    } else {
      c.schedules_count_list.push({});
    }



    /*   if (c.count_school_class !== c.schedules_count_list.length) {
  
        c.schedules_count_list = [];
  
        for (let i = 0; i < c.count_school_class; i++) {
  
          c.schedules_count_list.push({});
  
        };
      } */
  };

  $scope.getSchoolGradesList = function () {
    $http({
      method: "POST",
      url: "/api/school_grades/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.schoolGradesList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getStudentsYearsList = function (school_grade) {
    $http({
      method: "POST",
      url: "/api/students_years/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1
        },
        where: {
          active: true,
          'school_grade.id': school_grade.id
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.studentsYearsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };


  $scope.getHalls = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.hallsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getDefaultSettings = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;

        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.shift = response.data.doc;
          callback(response.data.doc);
        } else {
          callback(null);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
        callback(null);
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "class_schedules"
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

  $scope.getNumberingAuto();
  $scope.getTrainersList();
  $scope.getSchoolGradesList();
  $scope.getDefaultSettings();
  $scope.getHalls();
  $scope.getClassScheduleList();

});