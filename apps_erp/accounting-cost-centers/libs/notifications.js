module.exports = function init(site) {

  let collection_name = 'accounting_cost_centers'

  let source = {
    en: 'Cost Centers System',
    ar: 'نظام مراكز التكلفة '
  }

  let image_url = '/images/accounting_cost_centers.png'
  let add_message = {
    en: 'New Cost Centers Added',
    ar: 'تم أضافة مراكز التكلفة جديدة'
  }
  let update_message = {
    en: ' Cost Centers Updated',
    ar: 'تم تعديل مراكز التكلفة'
  }
  let delete_message = {
    en: ' Cost Centers Deleted',
    ar: 'تم حذف مراكز التكلفة '
  }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            name: result.doc.name_ar,
              code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar
          },
          add: result.doc,
          action: 'add'
        },
        result: result
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
          value: {
            name: result.old_doc.name_ar,
            code: result.old_doc.code,
            en: result.old_doc.name_en,
            ar: result.old_doc.name_ar
          },
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: 'update'
        },
        result: result
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
          value: {
            name: result.doc.name_ar,
              code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}