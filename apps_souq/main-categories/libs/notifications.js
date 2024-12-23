module.exports = function init(site) {
  let collection_name = "main_categories";

  let source = {
    En: "Main Categories System",
    Ar: "نظام الأقسام الرئيسية ",
  };

  let image_url = "/images/main_categories.png";
  let add_message = {
    En: "New Main Categories Added",
    Ar: "تم إضافة قسم رئيسي جديدة",
  };
  let update_message = {
    En: " Main Categories Updated",
    Ar: "تم تعديل قسم رئيسي",
  };
  let delete_message = {
    En: " Main Categories Deleted",
    Ar: "تم حذف قسم رئيسي ",
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
