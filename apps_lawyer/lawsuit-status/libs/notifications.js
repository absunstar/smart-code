module.exports = function init(site) {
  let collection_name = "lawsuit_status";

  let source = {
    en: "LawSuit Status System",
    ar: " نظام حالات الدعاوى",
  };

  let image_url = "/images/lawsuit_status.png";

  let add_message = {
    en: "New LawSuit Status Added",
    ar: "تم إضافة حالة دعوى جديدة",
  };
  let update_message = {
    en: " LawSuit Status Updated",
    ar: "تم تعديل حالة دعوى",
  };
  let delete_message = {
    en: " LawSuit Status Deleted",
    ar: "تم حذف حالة دعوى ",
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
