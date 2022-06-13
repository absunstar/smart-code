module.exports = function init(site) {
  let collection_name = "third_subsections";

  let source = {
    en: "Third subsection System",
    ar: "نظام الأقسام الفرعية الثالث",
  };

  let image_url = "/images/third_subsections.png";
  let add_message = {
    en: "New Third subsection Added",
    ar: "تم إضافة قسم فرعي ثالث جديد",
  };
  let update_message = {
    en: " Third subsection Updated",
    ar: "تم تعديل قسم فرعي ثالث",
  };
  let delete_message = {
    en: " Third subsection Deleted",
    ar: "تم حذف قسم فرعي ثالث ",
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
