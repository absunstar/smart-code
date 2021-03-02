module.exports = function init(site) {

  let collection_name = 'unit_switch'

 let source = {
    en : 'Stores System' ,
    ar : 'نظام المخازن'
  }

  let image_url = '/images/store_assemble.png'
  let add_message = {en : 'New Unit Switch Added' , ar : 'تم إضافة تحويل وحدة جديد'}
  let update_message =  {en : ' Unit Switch updated' , ar : 'تم تعديل تحويل وحدة' }
  let delete_message =  {en : ' Unit Switch dleteted' , ar : 'تم حذف تحويل وحدة'}


  site.on('mongodb after insert', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          company : result.doc.company,
          branch :  result.doc.branch,
          icon: image_url,
          source: source,
          message: add_message ,
          value: { name : result.doc.number , code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar},
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })

  site.on('mongodb after update', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          company : result.doc.company,
          branch :  result.doc.branch,
          icon: image_url,
          source : source,
          message: update_message ,
          value: {name : result.old_doc.number , code: result.old_doc.code,
            en: result.old_doc.name_en,
            ar: result.old_doc.name_ar},
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: 'update'
        }, result : result }
        )
      }
  })


  site.on('mongodb after delete', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          company : result.doc.company,
          branch :  result.doc.branch,
          icon: image_url,
          source: source ,
          message: delete_message ,
          value: {name : result.doc.number , 
            code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar},
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}