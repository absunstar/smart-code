module.exports = function init(site) {
  let collection_name = "shipping_company";

  let source = {
    en: "Shipping Companies System",
    ar: "نظام شركات الشحن",
  };

  let image_url = "/images/shipping_company.png";
  let add_message = {
    en: "New Shipping Company Added",
    ar: "تم إضافة شركة شحن جديدة",
  };
  let update_message = {
    en: "Shipping Company Updated",
    ar: "تم تعديل شركة شحن",
  };
  let delete_message = {
    en: "Shipping Company Deleted",
    ar: "تم حذف شركة شحن ",
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
