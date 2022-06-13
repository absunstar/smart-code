module.exports = function init(site) {
  let collection_name = "second_subsections";

  let source = {
    en: "Second subsection System",
    ar: "نظام الأقسام الفرعية الثانى",
  };

  let image_url = "/images/second_subsections.png";
  let add_message = {
    en: "New Second subsection Added",
    ar: "تم إضافة قسم فرعي ثاني جديد",
  };
  let update_message = {
    en: " Second subsection Updated",
    ar: "تم تعديل قسم فرعي ثاني",
  };
  let delete_message = {
    en: " Second subsection Deleted",
    ar: "تم حذف قسم فرعي ثاني ",
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
