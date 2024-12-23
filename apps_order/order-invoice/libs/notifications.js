module.exports = function init(site) {
  let collection_name = "order_invoice";

  let source = {
    En: "Order Invoice System",
    Ar: "نظام شاشة الطلبات",
  };

  let image_url = "/images/order_invoice.png";
  let add_message = {
    En: "New Order Invoice Added",
    Ar: "تم إضافة طلب بيع جديد",
  };
  let update_message = {
    En: " Order Invoice Updated",
    Ar: "تم تعديل طلب بيع",
  };
  let delete_message = {
    En: " Order Invoice Deleted",
    Ar: "تم حذف طلب بيع ",
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
            name_En: result.doc.name_En,
            name_Ar: result.doc.name_Ar,
          },
          add: result.doc,
          action: "add",
        },
        result: result,
      });
    }
  });

  // site.on('mongodb after update', function (result) {
  //   if (result.collection === collection_name) {
  //     site.call('please monitor action', {
  //       obj: {
  //         icon: image_url,
  //         source: source,
  //         message: update_message,
  //         value: {
  //           name: result.old_doc.code,
  //           name_Ar: result.old_doc.code
  //         },
  //         update: site.objectDiff(result.update.$set, result.old_doc),
  //         action: 'update'
  //       },
  //       result: result
  //     })
  //   }
  // })

  site.on("mongodb after delete", function (result) {
    if (result.collection === collection_name) {
      site.call("please monitor action", {
        obj: {
          icon: image_url,
          source: source,
          message: delete_message,
          value: {
            code: result.doc.code,
            name_En: result.doc.name_En,
            name_Ar: result.doc.name_Ar,
          },
          delete: result.doc,
          action: "delete",
        },
        result: result,
      });
    }
  });
};
