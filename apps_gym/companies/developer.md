# Backend
    - Data Access Layer (connect to Db)
    - Security Layer (check permissions for users)
    - Validation Layer (check required fields and field size and data type)
    - Integration Layer (check if app need to integrate with anothe app or more)
    - http API Layer (cloud API)
    - Busniess Layer (check that bussniess workflow is right)
    - Testing 

# FrontEnd
    - ui Layer (interface (add - update - delete - details))
    - Validation (check required fields and field size and data type)
    - http Layer (ajax)
    - Busniess Layer (check that bussniess workflow is right )
    - Testing

# object structure
```js 
    var company ={
        code: 'int',
        name_ar: 'string required',
        name_en: 'string',
        activity:{
            id:'int',
            name:'string',
            $where :{
                active:true
            }
        },
        calender_type:'gregorian' || 'hijri',
        filter_date:date,
        active:'boolean',
        image_url:'string',
        branch_list:[{
            code:'int',
            name:'string required',
            notes:'string',
            gov:{
                id:'int',
                name:'string',
                $where:{
                    active:true
                }
            },
              city:{
                gov:{
                id:'int',
                name:'string',
                $where:{
                    active:true
                }       
                 },
                id:'int',
                name:'string'  
                },             
                address:'string',
                phone:'string',
                mobile:'string',
                fax:'string',
                email:'string',
                charge :[{
                    name:'string required',
                    job:'string',
                    phone:'string',
                    internal_number:'string',
                    mobile:'string',
                    email:'string',                    
                }]
        }],
        bank_list:[{
            id:'int',
            country:{
                id:'int',
                name_ar:'string',
                name_en:'string',
                $where:{
                    active:true
                }
            }
            name_ar:'string required',
            name_en:'string',
            swift_code:'string',
            iban_number:'string',
            customer_service:'string',
            address:'string'
        }],
        account_number:'string'
        
    }

# API
    -Add (POST),'/api/banks/add','required {} (parameter)'
    -Update (POST),'/api/banks/update' , 'required where (parameter)'
    -Delete(POST),'/api/banks/delete' , 'required where (parameter)'
    -Search (POST),'/api/banks/all', 'required where (parameter)'
    -view (POST),'/api/banks/view', 'required where (parameter)'
    

# Describtion
    - This is service app serve other apps
    - The aim from this app is define cities in gov to use it in other apps
    