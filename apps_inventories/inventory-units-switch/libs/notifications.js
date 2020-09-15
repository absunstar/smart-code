module.exports = function init(site) {

  let collection_name = 'unit_switch'

 let source = {
    name : 'Stores System' ,
    ar : 'نظام المخازن'
  }

  let image_url = '/images/store_assemble.png'
  let add_message = {name : 'New Unit Switch Added' , ar : 'تم إضافة تحويل وحدة جديد'}
  let update_message =  {name : ' Unit Switch updated' , ar : 'تم تعديل تحويل وحدة' }
  let delete_message =  {name : ' Unit Switch dleteted' , ar : 'تم حذف تحويل وحدة'}


  site.on('mongodb after insert', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          company : result.doc.company,
          branch :  result.doc.branch,
          icon: image_url,
          source: source,
          message: add_message ,
          value: { name : result.doc.number , ar : result.doc.number},
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
          value: {name : result.old_doc.number , ar : result.old_doc.number},
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
          value: {name : result.doc.number , ar : result.doc.number},
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}