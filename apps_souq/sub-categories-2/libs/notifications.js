module.exports = function init(site) {
  let collection_name = "sub_category_1";

  let source = {
    en: "Sub categories 1 System",
    ar: "نظام الأقسام الفرعية 1",
  };

  let image_url = "/images/sub_category_1.png";
  let add_message = {
    en: "New sub category 1 Added",
    ar: "تم إضافة قسم فرعي 1 جديد",
  };
  let update_message = {
    en: " sub category 1 Updated",
    ar: "تم تعديل قسم فرعي 1",
  };
  let delete_message = {
    en: " sub category 1 Deleted",
    ar: "تم حذف قسم فرعي 1 ",
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
