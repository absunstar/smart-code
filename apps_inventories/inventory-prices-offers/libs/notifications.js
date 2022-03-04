module.exports = function init(site) {
  let collection_name = "prices_offers";

  let source = {
    en: "Prices Offers System",
    ar: "نظام عروض الأسعار",
  };

  let image_url = "/images/prices_offers.png";
  let add_message = { en: "New Prices Offers Added", ar: "تم إضافة عرض سعر جديد" };
  let update_message = { en: "Prices Offers updated", ar: "تم تعديل عرض سعر" };
  let delete_message = { en: "Prices Offers dleteted", ar: "تم حذف عرض سعر" };

  site.on("mongodb after insert", function (result) {
    if (result.collection === collection_name) {
      site.call("please monitor action", {
        obj: {
          company: result.doc.company,
          branch: result.doc.branch,
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
          company: result.doc.company,
          branch: result.doc.branch,
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
          company: result.doc.company,
          branch: result.doc.branch,
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
