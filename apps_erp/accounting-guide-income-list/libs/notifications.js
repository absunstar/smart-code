module.exports = function init(site) {
  let collection_name = "accounting_guide_income_list";

  let source = {
    En: "Guide Income List System",
    Ar: "نظام دليل تصنيفات قائمة الدخل ",
  };

  let image_url = "/images/accounting_guide_income_list.png";
  let add_message = {
    En: "New Guide Income List Added",
    Ar: "تم إضافة دليل تصنيفات قائمة الدخل جديدة",
  };
  let update_message = {
    En: " Guide Income List Updated",
    Ar: "تم تعديل دليل تصنيفات قائمة الدخل",
  };
  let delete_message = {
    En: " Guide Income List Deleted",
    Ar: "تم حذف دليل تصنيفات قائمة الدخل ",
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
            name_En: result.doc.name_En,
            name_Ar: result.doc.name_Ar,
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
            name_En: result.old_doc.name_En,
            name_Ar: result.old_doc.name_Ar,
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
            name_En: result.doc.name_En,
            name_Ar: result.doc.name_Ar,
          },
          delete: result.doc,
          action: "delete",
        },
        result: result,
      });
    }
  });
};
