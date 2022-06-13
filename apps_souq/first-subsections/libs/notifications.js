module.exports = function init(site) {
  let collection_name = "first_subsections";

  let source = {
    en: "First subsection System",
    ar: "نظام الأقسام الفرعية الأول",
  };

  let image_url = "/images/first_subsections.png";
  let add_message = {
    en: "New First subsection Added",
    ar: "تم إضافة قسم فرعي أول جديد",
  };
  let update_message = {
    en: " First subsection Updated",
    ar: "تم تعديل قسم فرعي أول",
  };
  let delete_message = {
    en: " First subsection Deleted",
    ar: "تم حذف قسم فرعي أول ",
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
