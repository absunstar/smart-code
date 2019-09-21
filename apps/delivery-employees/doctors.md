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
    var doctor ={
        id: 'int required auto',
        name: 'string required ', 
        specialty:{
            id:'int required',
            name:'string required'
        }, 
        phone:'required string',
        mobile:'string',
        email:'string', 
        whatsapp:'string', 
        active:'boolean',
        image_url:'string',
        hospital:{
            id:'int reuqired',
            name:'string required'
        }
    

    }

# API
    -Add (POST),'/api/doctor/add','required {} (parameter)'
    -Update (POST),'/api/doctor/update' , 'required where (parameter)'
    -Delete(POST),'/api/doctor/delete' , 'required where (parameter)'
    -Search (POST),'/api/doctor/all', 'required where (parameter)'
    -view (POST),'/api/doctor/view', 'required where (parameter)'


# Describtion
    - This is service app serve other apps
    - The aim from this app is define doctor to use it in other apps
 