module.exports = function init(site) {

  let collection_name = 'employees_report'

 let source = {
    en : 'Accounting System' ,
    ar : 'نظام الحسابات'
  }

  let image_url = '/images/emp_debt.png'
  let add_message = {en : 'New Employee Salary Added' , ar : ' تم سداد راتب لموظف  '}


  site.on('mongodb after insert', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          icon: image_url,
          source: source,
          message: add_message ,
          value: { name : result.doc.total_salary , 
            code: result.doc.code,
            en: result.doc.name_en,
            ar: result.doc.name_ar},
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })




}