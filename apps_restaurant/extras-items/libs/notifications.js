module.exports = function init(site) {
  let collection_name = "extras_items";

  let source = {
    En: "Extras items System",
    Ar: " نظام إضافات الأصناف",
  };

  let image_url = "/images/extras_items.png";
  let add_message = {
    En: "New Extras items Added",
    Ar: "تم إضافة إضافة أصناف جديدة",
  };
  let update_message = {
    En: " Extras items Updated",
    Ar: "تم تعديل إضافة أصناف",
  };
  let delete_message = {
    En: " Extras items Deleted",
    Ar: "تم حذف إضافة أصناف ",
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
            En: result.doc.En,
            Ar: result.doc.Ar,
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
            En: result.old_doc.En,
            Ar: result.old_doc.Ar,
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
            En: result.doc.En,
            Ar: result.doc.Ar,
          },
          delete: result.doc,
          action: "delete",
        },
        result: result,
      });
    }
  });
};
