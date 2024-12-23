module.exports = function init(site) {

    let collection_name = 'militaries_status'
  
   let source = {
      En : 'General Setting System' ,
      Ar : 'نظام اعدادات عامة'
    }
  
    let image_url = '/images/military_state.png'
    let add_message = {En : 'New Military_state Added' , Ar : 'تم إضافة موقف تجنيد جديدة'}
    let update_message =  {En : ' Military_state updated' , Ar : 'تم تعديل موقف تجنيد'}
    let delete_message =  {En : ' Military_state dleteted' , Ar : 'تم حذف موقف تجنيد '}
  
  
    site.on('mongodb after insert', function (result) {
        if (result.collection === collection_name) {
          site.call('please monitor action' , { obj : {
            icon: image_url,
            source: source,
            message: add_message ,
            value: { 
              code: result.doc.code,
              name_En: result.doc.name_En,
              name_Ar: result.doc.name_Ar},
            add: result.doc,
            action: 'add'
          }, result : result })
        }
    })
  
    site.on('mongodb after update', function (result) {
        if (result.collection === collection_name) {
          site.call('please monitor action' , { obj : {
            icon: image_url,
            source : source,
            message: update_message ,
            value: {
              code: result.old_doc.code,
              name_En: result.old_doc.name_En,
              name_Ar: result.old_doc.name_Ar},
            update: site.objectDiff(result.update.$set, result.old_doc),
            action: 'update'
          }, result : result })
        }
    })
  
  
    site.on('mongodb after delete', function (result) {
        if (result.collection === collection_name) {
          site.call('please monitor action' , { obj : {
            icon: image_url,
            source: source ,
            message: delete_message ,
            value: {
            code: result.doc.code,
            name_En: result.doc.name_En,
            name_Ar: result.doc.name_Ar},
            delete: result.doc,
            action: 'delete'
          }, result : result })
        }
    })
  
  }