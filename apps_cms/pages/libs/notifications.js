module.exports = function init(site) {
  let collectionName = "pages";

  let source = {
    en: "Page Implement System",
    ar: "نظام تنفيذ الصفحات",
  };

  let imageUrl = "/images/pages.png";
  let addMessage = {
    en: "New Page Implement Added",
    ar: "تم إضافة تنفيذ صفحة جديدة",
  };
  let updateMessage = {
    en: " Page Implement Updated",
    ar: "تم تعديل  تنفيذ صفحة",
  };
  let deleteMessage = {
    en: " Page Implement Deleted",
    ar: "تم حذف  تنفيذ صفحة ",
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
