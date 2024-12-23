module.exports = function init(site) {

  let collection_name = 'in_out_names'

  let source = {
    En: 'Accounting System',
    Ar: 'نظام الحسابات'
  }

  let image_url = '/images/in_out_name.png'
  let add_message = { En: 'New IN/Out Added', Ar: ' تم إضافة مسمى جديد' }
  let update_message = { En: 'IN/Out updated', Ar: 'تم تعديل المسمى' }
  let delete_message = { En: 'IN/Out deleted', Ar: 'تم حذف المسمى ' }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: { name: result.doc.name, 
             code: result.doc.code,
            En: result.doc.name_En,
            Ar: result.doc.name_Ar },
          add: result.doc,
          action: 'add'
        }, result: result
      })
    }
  })

  site.on('mongodb after update', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: update_message,
          value: { name: result.old_doc.name,  code: result.old_doc.code,
            En: result.old_doc.name_En,
            Ar: result.old_doc.name_Ar },
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: 'update'
        }, result: result
      })
    }
  })


  site.on('mongodb after delete', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: delete_message,
          value: { name: result.doc.name,  code: result.doc.code,
            En: result.doc.name_En,
            Ar: result.doc.name_Ar },
          delete: result.doc,
          action: 'delete'
        }, result: result
      })
    }
  })

}