module.exports = function init(site) {
  let collection_name = "hr_employees_degrees";

  let source = {
    en: "Jobs And Employees System",
    ar: "نظام الوظائف والموظفين",
  };

  let image_url = "/images/employee_degree.png";
  let add_message = {
    en: "New Employee_degree Added",
    ar: "تم إضافة درجة وظيفية جديدة",
  };
  let update_message = {
    en: " Employee_degree updated",
    ar: "تم تعديل درجة وظيفية",
  };
  let delete_message = {
    en: " Employee_degree dleteted",
    ar: "تم حذف درجة وظيفية ",
  };

  site.on("mongodb after insert", function (result) {
    if (result.collection === collection_name) {
      site.call("please monitor action", {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            code: result.doc.code,
            name_en: result.doc.name_en,
            name_ar: result.doc.name_ar,
          },
          add: result.doc,
          action: "add",
        },
        result: result,
      });
    }
  });

  site.on("mongodb after update", function (result) {
    if (result.collection === collection_name) {
      site.call("please monitor action", {
        obj: {
          icon: image_url,
          source: source,
          message: update_message,
          value: {
            code: result.old_doc.code,
            name_en: result.old_doc.name_en,
            name_ar: result.old_doc.name_ar,
          },
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: "update",
        },
        result: result,
      });
    }
  });

  site.on("mongodb after delete", function (result) {
    if (result.collection === collection_name) {
      site.call("please monitor action", {
        obj: {
          icon: image_url,
          source: source,
          message: delete_message,
          value: {
            code: result.doc.code,
            name_en: result.doc.name_en,
            name_ar: result.doc.name_ar,
          },
          delete: result.doc,
          action: "delete",
        },
        result: result,
      });
    }
  });
};
