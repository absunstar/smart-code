module.exports = function init(site) {
  let collectionName = "reportsTypes";

  let source = {
    en: "Reports types System",
    ar: "نظام أنواع البلاغات",
  };

  let imageUrl = "/images/reportsTypes.png";
  let addMessage = {
    en: "New Reports type Added",
    ar: "تم إضافة نوع بلاغ جديد",
  };
  let updateMessage = {
    en: " Reports type Updated",
    ar: "تم تعديل نوع بلاغ",
  };
  let deleteMessage = {
    en: " Reports type Deleted",
    ar: "تم حذف نوع بلاغ ",
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
