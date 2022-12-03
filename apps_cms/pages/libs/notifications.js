module.exports = function init(site) {
  let collection_name = "pages";

  let source = {
    en: "Page Implement System",
    ar: "نظام تنفيذ الصفحات",
  };

  let image_url = "/images/pages.png";
  let add_message = {
    en: "New Page Implement Added",
    ar: "تم إضافة تنفيذ صفحة جديدة",
  };
  let update_message = {
    en: " Page Implement Updated",
    ar: "تم تعديل  تنفيذ صفحة",
  };
  let delete_message = {
    en: " Page Implement Deleted",
    ar: "تم حذف  تنفيذ صفحة ",
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
