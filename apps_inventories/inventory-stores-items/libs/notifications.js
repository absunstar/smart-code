module.exports = function init(site) {
  let collection_name = "stores_items";

  let source = {
    en: "Stores System",
    ar: "نظام المخازن",
  };

  let image_url = "/images/store_item.png";
  let add_message = { en: "New Item Added", ar: "تم إضافة صنف جديد" };
  let update_message = { en: " Item  updated", ar: "تم تعديل   صنف" };
  let delete_message = { en: " Item  dleteted", ar: "تم حذف  صنف  " };

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

  // site.on('mongodb after update', function (result) {
  //     if (result.collection === collection_name) {
  //       site.call('please monitor action' , { obj : {
  //         company : result.doc.company,
  //         branch :  result.doc.branch,
  //         icon: image_url,
  //         source : source,
  //         message: update_message ,
  //         value: {
  // code: result.old_doc.code,
  //            name_en: result.old_doc.name_en,
  //            name_ar: result.old_doc.name_ar},
  //         update: site.objectDiff(result.update.$set, result.old_doc),
  //         action: 'update'
  //       }, result : result })

  //         result.doc.sizes.forEach(ziiii => {
  //           ziiii.branches_list.forEach(bbbbbb => {
  //             bbbbbb.stores_list.forEach(ssssssss => {
  //               ssssssss.size_units_list.forEach(element => {
  //                 console.log("new Doc", element, result.doc.id);
  //               });
  //             });
  //           });
  //         });

  //     }
  // })

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
