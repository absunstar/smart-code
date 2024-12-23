module.exports = function init(site) {

  let collection_name = 'employees_report'

 let source = {
    En : 'Accounting System' ,
    Ar : 'نظام الحسابات'
  }

  let image_url = '/images/emp_debt.png'
  let add_message = {En : 'New Employee Salary Added' , Ar : ' تم سداد راتب لموظف  '}


  site.on('mongodb after insert', function (result) {
      if (result.collection === collection_name) {
        site.call('please monitor action' , { obj : {
          icon: image_url,
          source: source,
          message: add_message ,
          value: { name : result.doc.total_salary , 
            code: result.doc.code,
            En: result.doc.name_En,
            Ar: result.doc.name_Ar},
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })




}