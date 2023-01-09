module.exports = function init(site) {
  let collectionName = "main_categories";

  let source = {
    en: "Main Categories System",
    ar: "نظام الأقسام الرئيسية ",
  };

  let imageUrl = "/images/main_categories.png";
  let addMessage = {
    en: "New Main Categories Added",
    ar: "تم إضافة قسم رئيسي جديدة",
  };
  let updateMessage = {
    en: " Main Categories Updated",
    ar: "تم تعديل قسم رئيسي",
  };
  let deleteMessage = {
    en: " Main Categories Deleted",
    ar: "تم حذف قسم رئيسي ",
  };

  site.on("mongodb after insert", function (result) {
    if (result.collection === collectionName) {
      site.call("please monitor action", {
        obj: {
          icon: imageUrl,
          source: source,
          message: addMessage,
          value: {
            code: result.doc.code,
            name: result.doc.name,
          },
          add: result.doc,
          action: "add",
        },
        result: result,
      });
    }
  });

  site.on("mongodb after update", function (result) {
    if (result.collection === collectionName) {
      site.call("please monitor action", {
        obj: {
          icon: imageUrl,
          source: source,
          message: updateMessage,
          value: {
            code: result.oldDoc.code,
            name: result.oldDoc.name,
          },
          update: site.objectDiff(result.update.$set, result.oldDoc),
          action: "update",
        },
        result: result,
      });
    }
  });

  site.on("mongodb after delete", function (result) {
    if (result.collection === collectionName) {
      site.call("please monitor action", {
        obj: {
          icon: imageUrl,
          source: source,
          message: deleteMessage,
          value: {
            code: result.doc.code,
            name: result.doc.name,
          },
          delete: result.doc,
          action: "delete",
        },
        result: result,
      });
    }
  });
};
