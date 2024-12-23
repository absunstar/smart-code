module.exports = function init(site) {
  let collection_name = "stores_items";

  let source = {
    En: "Stores System",
    Ar: "نظام المخازن",
  };

  let image_url = "/images/store_item.png";
  let add_message = { En: "New Item Added", Ar: "تم إضافة صنف جديد" };
  let update_message = { En: " Item  updated", Ar: "تم تعديل   صنف" };
  let delete_message = { En: " Item  dleteted", Ar: "تم حذف  صنف  " };

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
  //     if (result.collection === collection_name) {
  //       site.call('please monitor action' , { obj : {
  //         company : result.doc.company,
  //         branch :  result.doc.branch,
  //         icon: image_url,
  //         source : source,
  //         message: update_message ,
  //         value: {
  // code: result.old_doc.code,
  //            name_En: result.old_doc.name_En,
  //            name_Ar: result.old_doc.name_Ar},
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
