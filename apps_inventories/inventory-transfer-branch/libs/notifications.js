module.exports = function init(site) {
  let collection_name = "transfer_branch";

  let source = {
    en: "Stores System",
    ar: "نظام المخازن",
  };

  let image_url = "/images/transfer_branch.png";
  let add_message = {
    en: "New Transfer Branch Items Added",
    ar: "تم إضافة تحويل أصناف للفروع جديد",
  };
  let update_message = {
    en: " Transfer Branch Items updated",
    ar: "تم تعديل تحويل أصناف للفروع",
  };
  let delete_message = {
    en: " Transfer Branch Items dleteted",
    ar: "تم حذف تحويل أصناف للفروع ",
  };

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
