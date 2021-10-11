isite now integrated with Social Browser https://social-browser.com
so your site work on Social Browser by default

## Create [ Node Js Web Site ] Supporting Many Development features

- More Secure
- Multi Language
- Custom Apps [Modules]
- Best Performance
- Less Time
- Less Cost
- Fast Development

# Features

- Auto Routes [Simple & Advanced & Custom]
- Auto Handle File Types Encoding [Fonts - Images - ...]
- Merge Multi Files Contents in One Route
- Auto Handle Request & Response Headers [Cookies - Parameters - params]
- Auto Detect & Configer User Session
- Built-in Security System [Users , Roles, Permissions]
- Easy Creating Master Pages
- Auto Caching All Routes & Management Site Files in Memory
- Fast Read Files Content [Site Folder Structure]
- [ Upload / Download ] Files
- Custom Html Attributes [Server side Tags]
- MongoDB Full Integration
- Client libraries [jquery - bootstrap - font-awesome - angular]
- Local Multi Charts Apps
- Development Helper Functions
- Site Dynamic Events Callback
- Auto WebSocket Handle

## Fast Startup

- Download Startup Template

```sh
    git clone https://github.com/absunstar/isite-template
    cd isite-template
    npm i
    npm start
```

## Installation

`npm install isite`

- Works Stand-Alone or With Other Libs
- updated every 1 month at least ( npm i isite ) for production apps

## Using

- Fast Startup Web Server.

```js
var isite = require('isite');
var site = isite({ port: 8080 });

site.loadLocalApp('client-side');
site.loadLocalApp('security');

site.run();
```

- Multi port opens

```js
var isite = require('isite');
var site = isite();

site.loadLocalApp('client-side');
site.loadLocalApp('security');

site.run([8080, 5555, 9090, 12345]);
```

- Default Options.

```js
var isite = require('isite');
site = isite({
  port: process.env.port || 80,
  cwd: process.cwd(),
  dir: process.cwd() + '/site_files',
  upload_dir: process.cwd() + '/../uploads',
  download_dir: process.cwd() + '/../downloads',
  apps: !0,
  apps_dir: process.cwd() + '/apps',
  name: 'Your Site',
  dynamic: false, // (auto set )dynamic db & prot based on folder name [ smart-pos-3000 ]
  saving_time: 60,
  log: !0,
  lang: 'ar',
  theme: 'default',
  help: !0,
  stdin: !0,
  https: {
    enabled: false,
    port: null,
    ports: [],
    key: null,
    cert: null,
  },
  mongodb: {
    enabled: !0,
    host: '127.0.0.1',
    port: '27017',
    userName: null,
    password: null,
    db: 'default_db',
    collection: 'default_collection',
    limit: 10,
    prefix: {
      db: '',
      collection: '',
    },
    identity: {
      enabled: !0,
      start: 1,
      step: 1,
    },
  },
  session: {
    timeout: 60 * 24 * 30,
    enabled: !0,
    storage: 'mongodb',
    db: null,
    collection: 'users_sessions',
  },
  security: {
    enabled: !0,
    db: null,
    users_collection: 'users_info',
    roles_collection: 'users_roles',
    admin: {
      email: 'admin@isite',
      password: 'P@$$w0rd',
    },
    users: [],
  },
  cache: {
    enabled: !0,
    html: 0,
    txt: 60 * 24 * 30,
    js: 60 * 24 * 30,
    css: 60 * 24 * 30,
    fonts: 60 * 24 * 30,
    images: 60 * 24 * 30,
    json: 60 * 24 * 30,
    xml: 60 * 24 * 30,
  },
  proto: {
    object: !0,
  },
});

site.run();
```

## Site Folder Structure

- site stucture help you to manage you site easy and fast

```html
- server.js - package.json - README.md -- apps -- site_files --- css - bootstrap.css - custom.css --- js - jquery.js - bootstrap.js - custom.js --- html - index.html --- fonts --- images - logo.png
--- json - items.json - words.json - roles.json - permissions.json --- xml - rss.xml
```

- Create Folder Name "site_files"
- inside it create these Sub folders [
  html , css , js , json , fonts , images , xml , ...
  ]

## Routes

- Auto Convert All Routes URL & Parameters to Lower Case
- Auto Manage Reponse Headers and Files Types
- Support Multi Files in One Route
- Save Route Response in Memory to Reuse for Fast Response
- Auto Handle URL parametes
- Auto Handle Body Parameters in not get header [post , put , delete , ...]
- Auto Handle URL params [custom parameters from url structure]
- Auto cache Files Content in memory
- support compress to remove unwanted spaces and tabs and empty lines ...etc
- support parser to handle custom html server side tags
- Call Route From Other Route [ Server Side ]

Easy and Auto Site Routing

```js
/* site.dir = process.cwd() +  "/site_files"
    You Can Change This Default Value when define isite
    or set site.dir = new path
*/

site.get({ name: ['/', '/home', '/index'], path: site.dir + '/html/index.html' });
site.get({ name: '/css/bootstrap.css', path: site.dir + '/css/bootstrap.min.css' });
site.get({ name: '/js/jquery.js', path: site.dir + '/js/jquery.js' });
site.get({ name: '/js/bootstrap.js', path: site.dir + '/js/bootstrap.js' });
site.get({ name: '/favicon.png', path: site.dir + '/images/logo.png' });
site.post({ name: '/api', path: site.dir + '/json/employees.json' });
```

Merge Multi Files in one route

```js
site.get({
  name: '/css/style.css',
  path: [site.dir + '/css/bootstrap.css', site.dir + '/css/custom.css'],
});
site.get({
  name: '/js/script.js',
  path: [site.dir + '/js/jquery.js', site.dir + '/js/bootstrap.js', site.dir + '/js/custom.js'],
});
```

Advanced Site Routing

```js

site.onGET('/home2' , (req , res)=>{
  site.callRoute('/home' , req , res)
})

site.get('/', (req, res) => {
  site.readFile(site.dir + '/html/index.html', function (err, content, file) {
    res.set('Content-type', 'text/html');
    res.set('Content-size', file.stat.size);
    res.status(200).end(content);
  });
});

site.get('/', (req, res) => {
  site.html('index', function (err, content) {
    res.set('Content-type', 'text/html');
    res.status(200).end(content);
  });
});

site.get({
  // can use [get , post , put , delete , all]
  name: '/',
  path: site.dir + '/html/index.html', //Required
  parser: 'html', // default static [not paresed]
  compress: !0, // default false
  cache: false, // default !0
});

site.get({
  name: '/',
  callback: function (req, res) {
    res.set('Content-type', 'text/html');
    site.html('index', function (err, content) {
      res.status(200).end(content);
    });
  },
});
```

Auto Route All Files in Folder

```js
site.get({ name: '/js', path: site.dir + '/js' });
site.get({ name: '/css', path: site.dir + '/css' });
```

Custom Route - Using \* [any letters]

```js
site.get('/post/*', function (req, res) {
  res.end('Any Route like /post/11212154545 ');
});
site.get('*', function (req, res) {
  res.end('Any Route Requested Not Handled Before This Code');
});
```

Request Parameters [GET , POST | PUT | Delete] Restful API

```js
// read query parameter lower case
site.get('/api', function (req, res) {
  res.end('GET | name : ' + req.query.name);
});
// read query parameter default case as requested
site.get('/api', function (req, res) {
  res.end('GET | name : ' + req.queryRaw.name);
});

site.post('/api', function (req, res) {
  res.end('POST | id : ' + req.body.id + ' , Name : ' + req.body.name);
});
site.put('/api', function (req, res) {
  res.end('PUT | id : ' + req.body.id + ' , Name : ' + req.body.name);
});
site.delete('/api', function (req, res) {
  res.end('Delete | id : ' + req.body.id);
});
site.all('/api', function (req, res) {
  res.end('Any Request Routing Type Not Handled Yet : ' + req.method);
});
```

Dynamic Parameters

```js
// read params lower case
site.get('/post/:id/category/:cat_id', function (req, res) {
  res.end('GET | Id : ' + req.params.id + ', catId : ' + req.params.cat_id);
});
// read params default case as requested
site.get('/post/:id/category/:cat_id', function (req, res) {
  res.end('GET | Id : ' + req.paramsRaw.id + ', catId : ' + req.paramsRaw.cat_id);
});
//example : /post/AbCdEf/category/DDDDD
```

MVC Custom Route

```js
site.get('/:controller/:Action/:Arg1', function (req, res) {
  res.end(
    'GET | Controller : ' +
      req.params.controller +
      ', Action : ' +
      req.params.Action /* Normal case*/ +
      ', action : ' +
      req.params.action /* lower case*/ +
      ', Arg 1 : ' +
      req.params.Arg1 /* Normal case*/ +
      ', arg 1 : ' +
      req.params.arg1 /* lower case*/,
  );
});
//example : /facebook/post/xxxxxxxxxx
```

- To Easy Read File Contents From "site_files" Folder

```js
site.html('index', function (err, content) {
  site.log(content);
});
site.css('bootstrap', function (err, content) {
  site.log(content);
});
site.js('jquery', function (err, content) {
  site.log(content);
});
site.json('items', function (err, content) {
  site.log(content);
});
site.xml('rss', function (err, content) {
  site.log(content);
});
```

- Custom Read Files

  - Read From Local File in First Time and save in memory
  - next time Read Will be From Memory

```js
//read file with custom header
site.get("/rss", function(req, res) {
    site.readFile(__dirname + "/site_files/xml/rss.xml", function(err, content , file) {
        res.set("content-type" , "text/xml")
        res.set("content-size" , file.stat.size)
        res.status(200).end(content) // or res.end(content)
    })
})
// or [ if file in site_files/xml folder]
site.get("/rss", function(req, res) {
    site.xml("rss", function(err, content , file) {
        res.set("content-type" , "text/xml")
        res.set("content-size" , file.stat.size)
        res.status(200).end(content)
    })
})

// Read and Merge multi files with custom header
site.get("/", function(req, res) {
    site.readFiles(
        [
            __dirname + "/site_files/html/head.html",
            __dirname + "/site_files/html/content.html",
            __dirname + "/site_files/html/footer.html"
        ],
        function(err, content) {
            res.writeHead(200, { "content-type": "text/html" });
            res.end(content);
        })
})

// Check if File Exits
site.isFileExists(path , (yes)=>{
    if(yes){
        // ...
    }
})
// or
let yes = site.isFileExistsSync(path)
if(yes){
    // ...
}

// Get File Info
site.fileStat(path , (err , stats)=>{
    console.log(stats)
})
// or
let stats = site.fileStatSync(path)

// Write Data to File
site.writeFile(path , data , err =>{

}
// Delete File
site.removeFile(path , err =>{

}) // or site.deleteFile


// Create New Dir
site.createDir(path , (err , path)=>{
    if(!err){
        // ...
    }
}) // or site.makeDir

```

## WebSocket

- Server Side

```js
site.onWS('/chat', (client) => {
  client.onMessage = function (message) {
    console.log(message);
    if (message.type === 'connected') {
      client.send({ type: 'ready' });
    }
  };
  console.log('New Client ...' + client.ip);
});
```

- Client Side

```html
<script src="/x-js/all.js"></script>
```

```js
site.ws('ws://127.0.0.1/chat', (server) => {
  window.server = server;
  server.onOpen = () => {
    server.send({ type: 'accessToken', content: '##session.accessToken##' });
  };
  server.onMessage = (msg) => {
    console.log(msg);
  };
});

// or

var ws = new WebSocket('ws://127.0.0.1/chat');

ws.onerror = function (error) {};
ws.onclose = function () {};

ws.onopen = function () {
  ws.send(JSON.stringify({ type: 'connect' }));
};

ws.onmessage = function (msg) {
  msg = JSON.parse(msg.data);
  if (msg.type === 'ready') {
    ws.send(JSON.stringify({ type: 'ready' }));
  }
};
```

## Cookies

- Cookie is Client Side Data Per User
- Cookie is Enabled by Default
- Support Multi Keys

```js
site.get('/testSetCookie', function (req, res) {
  res.cookie('name', req.query.name);
  res.cookie('ip', req.ip);
  res.cookie('more', 'any data');
  res.end('cookie set');
}); //example : /testSetCookie?name=amr

site.get('/testGetCookie', function (req, res) {
  res.end('name from cookie : ' + req.cookie('name'));
}); //example : /testGetCookie
```

## Sessions

- Session is Server Side Data Per User
- Every User has Unique Access Token
- Session Management Automatic
- Session Store in Database by Default

```js
site.get('/testSetSession', function (req, res) {
  req.session('user_name', req.query.user_name);
  res.session('ip', req.ip);
  res.session('more', 'any data');
  res.end('Session Set ok !! ');
}); //example : /testSetSession?user_name=absunstar

site.get('/testGetSession', function (req, res) {
  res.end('User Name from session : ' + req.session('user_name'));
}); //example : /testGetSession
```

## Custom App

- Custom App Help you to Easy Management Site Life-Cycle
- Easy Register & Integrated
- Best Solution when work with Team

### How to make it

- Create your app folder in global apps folder
- Add app.js file with this code

```js
module.exports = function (site) {
  // write here your custom code
};
```

- App Will Be Auto Register And Integerated With Your Site

### add App From github

- Add Apps from github to Your Site

```sh
   cd apps
   git clone https://github.com/absunstar/isite-client
   git clone https://github.com/absunstar/isite-security
```

### add App From Local Path

```js
site.importApp(FOLDER_PATH);
```

## Master Pages

- Master Page put content between header and footer
- Master Page help you to not repate you code
- Master Page make site layout look good with less code
- Master Page has tow parts header and footer

```js
site.addMasterPage({
  name: 'masterPage1',
  header: site.dir + '/html/header.html',
  footer: site.dir + '/html/footer.html',
});

site.addMasterPage({
  name: 'masterPage2',
  header: site.dir + '/html/header2.html',
  footer: site.dir + '/html/footer2.html',
});

site.get({
  name: '/ContactUs',
  masterPage: 'masterPage1',
  path: site.dir + '/html/contact.html',
  parser: 'html',
});
```

## HTML Server Tags & Attributes

- html server tags is html tags run in server side
- html server tags make html structure easy management
- html server tags is the next generation of html

Add Custom Html Content

```js
site.get({ name: '/', path: site.dir + '/html/index.html', parser: 'html' });
```

```html
<style x-import="page2.css"></style>
<div x-import="navbar.html"></div>
<div class="container">
  <h2>Page Heading 2</h2>
  <p x-import="info.html"></p>
</div>
<script x-import="custom.js"></script>
```

- Pages "navbar.html" & "info.html" Must Be In HTML Site Folder ['/site_files/html/']
- Style "page2.css" Must Be In HTML Site Folder ['/site_files/css/']
- Script "custom.js" Must Be In HTML Site Folder ['/site_files/js/']

Dynamic Varibles Sets

```js
site.var('siteName', 'First Site With Isite Library ');
site.var('siteBrand', 'XSite');
```

```html
<title>##var.siteName##</title>
<h2>##var.siteBrand##</h2>
<h2>Lang : ##session.lang## , Theme : ##session.theme##</h2>
<h2>query name : ##query.name## , query age : ##query.age##</h2>
<h2>data name : ##data.name## , data age : ##data.age##</h2>
<h2>param category : ##params.category## , param post : ##params.post##</h2>

<div x-lang="ar">Show if Site Language is Arabic</div>
<div x-lang="en">Show if Site Language is English</div>
// auto detect user session language

<div x-permission="admin">Only Admi Users Can Show This Content</div>
<div x-permission="accounting">Only Accounting Users Can Show This Content</div>

<div x-feature="login">Only Login Users Can Show This Content</div>
<div x-feature="!login">Only Not Login Users Can Show This Content</div>
// auto detect user login status

<div x-features="os.mobile || os.android">Only Users From Mobile or Android Can Show This Content</div>
<div x-features="os.mobile && os.android">Only Users From Mobile and Android Can Show This Content</div>
// Using || , && to Multi Features

<div x-feature="os.mobile">Only Users From Mobile Can Show This Content</div>
<div x-feature="os.desktop">Only Users From Mobile Can Show This Content</div>

<div x-feature="os.windows">Only Users From Windows Can Show This Content</div>
<div x-feature="!os.windows">Only Users From Not Windows Can Show This Content</div>
<div x-feature="os.windowsxp">Only Users From Windows XP Can Show This Content</div>
<div x-feature="os.windows7">Only Users From Windows 7 Can Show This Content</div>
<div x-feature="os.windows8">Only Users From Windows 8 Can Show This Content</div>
<div x-feature="os.windows10">Only Users From Windows 10 Can Show This Content</div>

<div x-feature="os.linux">Only Users From Linux Systems Can Show This Content</div>
<div x-feature="os.mac">Only Users From Mac Systems Can Show This Content</div>
<div x-feature="os.android">Only Users From Android Systems Can Show This Content</div>
<div x-feature="os.unknown">Only Users From unknown Systems Can Show This Content</div>

<div x-feature="browser.edge">Only Users From Edge Browser Can Show This Content</div>
<div x-feature="browser.firefox">Only Users From FireFox Browser Can Show This Content</div>
<div x-feature="browser.chrome">Only Users From Chrome Browser Can Show This Content</div>
<div x-feature="browser.opera">Only Users From Opera Browser Can Show This Content</div>
<div x-feature="browser.unknown">Only Users From unknown Browser Can Show This Content</div>

<div x-feature="ip.xxx.xxx.xxx.xxx">Only Users From IP xxx.xxx.xxx.xxx Can Show This Content</div>

//auto detect user browser
```

## MongoDB Integration

    - Auto Add [ id ] as auto increment number [Like SQL]
    - Handle [ _id ] Data Type
    - Manage Closed Connections and Timeout
    - Manage Multi Connections
    - Manage Bulk [ Inserts & Updates & Deletes ]
    - Global Database Events
    - User Friendly Coding

```js

// use connect collection [ Best Way For Security ]

$employees = site.connectCollection("employees")

// with database
$employees = site.connectCollection("employees" ,  "company")
//or
$employees = site.connectCollection({collection : "employees" , db : "company")


// insert one doc [ can use also [add , addOne , insert , insertOne]]
$employees.insertOne({name : 'amr' , salary : 50000} , (err , doc)=>{
    site.log(doc) // doc after inserted
})

// insert Many Docs [ can use also [ addMany , addAll , insertMany , insertAll]]
$employee.insertMany([{name : 'a'} , {name : 'b'}] , (err , docs)=>{
    site.log(docs , 'docs')
})

// select one doc [ can use also [ get , getOne , find , findOne , select , selectOne ]]
$employees.findOne({where:{id : 5} , select:{salary:1}} , (err , doc)=>{
    site.log(doc)
})
//or
$employees.findOne({ id : 5 } , (err , doc)=>{
    site.log(doc)
})


// select Multi docs [ can use also  [getAll , getMany , findAll , findMany , selectAll , selectMany ]]
$employees.findMany({
    where:{name : /a/i} ,
    select:{name: 1 , salary:1} ,
    limit : 50 ,
    skip : 10 ,
    sort:{salary : -1}
    } , (err , docs , count)=>{
        site.log(docs)
    }
)

// Update One Doc [ can use [ updateOne , update , editOne , edit]]
$employees.updateOne({
    where:{_id : 'df54fdt8h3n48ykd136vg'} ,
    set:{salary: 30000}} , (err , result)=>{
    site.log(result)
})
// or [ auto update by _id ]
$employees.updateOne({_id : 'df54fdt8h3n48ykd136vg' , salary : 5000} , (err , result)=>{
    site.log(result)
})

// Update Many Docs [ can use [ updateAll , updateMany , editAll , editMany]]
$employees.updateMany({
    where:{name : /a/i} ,
    set:{salary: 30000}} , (err , result)=>{
    site.log(result)
})

// Delete One Doc [ can use [ deleteOne , delete , removeOne , remove]]
$employees.deleteOne({where:{ _id : 'df54fdt8h3n48ykd136vg'}} , (err , result)=>{
    site.log(result)
})
// or [ auto delete by _id]
$employees.deleteOne('df54fdt8h3n48ykd136vg', (err , result)=>{
    site.log(result)
})
// or
$employees.deleteOne({name : /a/i} , (err , result)=>{
    site.log(result)
})

// Delete Many Docs [ can use [ deleteAll , deleteManye , removeAll , removeMany ]]
$employees.deleteMany({where:{name : /a/i}} , (err , result)=>{
    site.log(result)
})
// or
$employees.deleteMany({name : /a/i} , (err , result)=>{
    site.log(result)
})

// Import Object Data From Json File
$employees.import(FILE_PATH , (result)=>{

})

// Import Array Data From Json File
$employees.import(FILE_PATH , (result)=>{

})

// Export Object Data From Json File
$employees.export( OPTONS , FILE_PATH , (err , docs)=>{

})
// Export 10 employees that salary more than 1000
$employees.export({limit : 10 , where : {salary : {$gt : 1000}}} , FILE_PATH , (err , docs)=>{

})

// Remove duplicate data [ can use [deleteDuplicate , removeDuplicate]]
$employees.deleteDuplicate('name' , (err , result)=>{

})
// Remove Duplicate [ name and mobile ] Employee
$employees.deleteDuplicate({name : 1 , mobile : 1} , (err , result)=>{

})
// Remove Duplicate [ profile.name ] Employee
$employees.deleteDuplicate({'profile.name' : 1 } , (err , result)=>{

})

// Create Index Field
 $employees.createIndex({name : 1} , (err , result)=>{

 }

// Create Unique Field
 $employees.createUnique({name : 1} , (err , result)=>{

 }
 // Create Unique Fields
 $employees.createUnique({user_name : 1 , user_password : 1} , (err , result)=>{

 }


//==================================================================
// Global Database Events
// from here you can catch all transactions

site.on('mongodb after insert' , (result)=>{

})
site.on('mongodb after insert many' , (result)=>{

})
site.on('mongodb after find' , (result)=>{

})
site.on('mongodb after find many' , (result)=>{

})
site.on('mongodb after update' , (result)=>{

})
site.on('mongodb after update many' , (result)=>{

})
site.on('mongodb after delete' , (result)=>{

})
site.on('mongodb after delete many' , (result)=>{

})


// ==================================================================
// Low Level Access Database Functions [ For Advanced Work ]

// Insert One Doc
   site.mongodb.insertOne({
            dbName: 'company',
            collectionName: 'employess',
            doc:{name:'amr',salary:35000}
        }, function (err, docInserted) {
            if (err) {
                site.log(err.message)
            } else {
                site.log(docInserted)
            }
        } , /* default waiting Sync or !0 for Async*/)

// Insert Many Docs
   site.mongodb.insertMany({
            dbName: 'company',
            collectionName: 'employess',
            docs:[
                    {name:'amr',salary:35000} ,
                    {name:'Gomana',salary:9000} ,
                    {name:'Maryem',salary:7000}
                ]
        }, function (err, result) {
            if (err) {
                site.log(err.message)
            } else {
                site.log(result)
            }
        }/* default waiting Sync or !0 for Async*/)

// Find One Doc
 site.mongodb.findOne({
            dbName: 'company',
            collectionName: 'employees',
            where:{},
            select : {}
        }, function (err, doc) {
            if (err) {
                site.log(err.message)
            } else {
                site.log(doc)
            }
        }/* default waiting Sync or !0 for Async*/)

// Find Many Docs
 site.mongodb.findMany({
            dbName: 'company',
            collectionName: 'employees',
            where:{},
            select : {}
        }, function (err, docs , count) {
            if (err) {
                site.log(err.message)
            } else {
                site.log(docs)
            }
        }/* default waiting Sync or !0 for Async*/)

//Update One Doc
           site.mongodb.updateOne({
            dbName: 'company',
            collectionName: 'employees',
            where:{salary:7000},
            set : {name:'New MARYEM'}
        }, function (err, result) {
            if (err) {
                site.log(err.message)
            } else {
                site.log(result)
            }
        }/* default waiting Sync or !0 for Async*/)

// Update Many Docs
           site.mongodb.updateMany({
            dbName: 'company',
            collectionName: 'employees',
            where:{salary:9000},
            set : {salary:9000 * .10}
        }, function (err, result) {
            if (err) {
                site.log(err.message)
            } else {
                site.log(result)
            }
        }/* default waiting Sync or !0 for Async*/)

// Delete One Doc
          site.mongodb.deleteOne({
            dbName: 'company',
            collectionName: 'employess',
            where:{_id: new site.mongodb.ObjectID('df54fdt8h3n48ykd136vg')}
        }, function (err, result) {
            if (err) {
                site.log(err.message)
            } else {
                site.log(result)
            }
        }/* default waiting Sync or !0 for Async*/)
// Delete Many Docs
          site.mongodb.deleteMany({
            dbName: 'company',
            collectionName: 'employess',
            where:{name : /a/}
        }, function (err, result) {
            if (err) {
                site.log(err.message)
            } else {
                site.log(result)
            }
        }/* default waiting Sync or !0 for Async*/)

// ==================================================================
// Mongodb Native Client Provider

site.mongodb.client // = require("mongodb").MongoClient

// Create a database called "mydb":

var url = "mongodb://localhost:27017/mydb";

site.mongodb.client.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

// all code can be found in offical mongodb site or w3schools

```

## Upload File

- upload File using HTML

```html
<form action="uploadFile" method="post" enctype="multipart/form-data">
  <input type="file" name="fileToUpload" /><br />
  <input type="submit" />
</form>
```

- Upload File Using Angular js

```html
<form class="form">
  <label>Select File To Upload</label>
  <input type="file" name="fileToUpload" onchange="angular.element(this).scope().uploadFile(this.files)" />
  <p>{{uploadStatus}}</p>
</form>
```

```js
$scope.uploadFile = function (files) {
  var fd = new FormData();
  fd.append('fileToUpload', files[0]);
  $http
    .post('/uploadFile', fd, {
      withCredentials: !0,
      headers: {
        'Content-Type': undefined,
      },
      uploadEventHandlers: {
        progress: function (e) {
          $scope.uploadStatus = 'Uploading : ' + Math.round((e.loaded * 100) / e.total) + ' %';
          if (e.loaded == e.total) {
            $scope.uploadStatus = '100%';
          }
        },
      },
      transformRequest: angular.identity,
    })
    .then(
      function (res) {
        if (res.data && res.data.done) {
          $scope.uploadStatus = 'File Uploaded';
        }
      },
      function (error) {
        $scope.uploadStatus = error;
      },
    );
};
```

- Recive Uploading File from [html , angular , jquery , ...]

```js
site.post('uploadFile', (req, res) => {
  var response = { done: !0 };
  var file = req.files.fileToUpload;
  var newpath = site.dir + '/../../uploads/' + file.name;
  site.mv(file.path, newpath, function (err) {
    if (err) {
      response.error = err;
      response.done = false;
    }
    res.end(JSON.stringify(response));
  });
});
```

## Download File

- download any file from server
- auto handle file content and size
- force client browser to download file

```js
// download any file
site.get('/files/file1.zip', (req, res) => {
  res.download(site.dir + '/downloads/file1.zip');
});
//download and change file name
site.get('/files/file1.zip', (req, res) => {
  res.download(site.dir + '/downloads/file1.zip', 'info.zip');
});
```

## Multi Languages

- Can Add Any Custom Language You Want
- Can Change Default Language on Site Options
- Stores Words in Diffrent Language in words json file
- Auto Detect Words.json
- Folder Structure Like This

```html
- apps - server.js - package.json - README.md -- site_files --- json - words.json
```

- Words Json File Structure Like This

```json
[
  { "name": "user_name", "en": "User Name", "ar": "أسم المستخدم" },
  { "name": "user_email", "en": "Email", "ar": "البريد الالكترونى" },
  { "name": "user_password", "en": "Password", "ar": "كلمة المرور" }
]
```

- Use in html Like This

```html
<form>
  <label> ##word.user_name## </label>
  <input />
  <br />

  <label> ##word.user_email## </label>
  <input />
  <br />

  <label> ##word.user_password## </label>
  <input />
  <br />
</form>
```

- Cahnge Site Language

```js
$scope.changeLang = function (lang) {
  $http({
    method: 'POST',
    url: '/@language/change',
    data: { name: lang },
  }).then(function (response) {
    if (response.data.done) {
      window.location.reload(!0);
    }
  });
};
```

```html
<a ng-click="changeLang('ar')"> Change To Arabic </a> <a ng-click="changeLang('en')"> Change To English </a>
```

- Show Content Depended on Language

```html
<div x-lang="ar">This Content Will Display When Site Language is Arabic</div>
<div x-lang="en">This Content Will Display When Site Language is English</div>
```

## Client libraries

- install Custom App From https://github.com/absunstar/isite-client

```sh
    cd apps
    git clone https://github.com/absunstar/isite-client
```

    - no need to install any client library
    - no need to install any fonts
    - no need to manage library routes
    - just use it

```html
<link rel="stylesheet" href="/x-css/bootstrap3.css" />
<link rel="stylesheet" href="/x-css/font-awesome.css" />

<script src="/x-js/jquery.js"></script>
<script src="/x-js/bootstrap3.js"></script>
<script src="/x-js/angular.js"></script>
```

## Charts

- Server Side

```js
site.loadLocalApp('charts');
```

- Client Site

```html
<div id="chart1"></div>
<script src="/js/charts.js"></script>
```

```js
var data = [
  {
    item: 'item 1',
    count: 500,
  },
  {
    item: 'item 2',
    count: 200,
  },
  {
    item: 'item 3',
    count: 700,
  },
  {
    item: 'item 4',
    count: 300,
  },
  {
    item: 'item 5',
    count: 800,
  },
  {
    item: 'item 6',
    count: 60,
  },
];

site.create_chart({
  type: 'xy',
  x: 'item',
  y: 'count',
  data: data,
  selector: '#chart1',
});
```

## Security

- Bulit-in Users Management System
- Auto Detect Users Sessions & Permissions
- install Custom Security App From https://github.com/absunstar/isite-security

```sh
    cd apps
    git clone https://github.com/absunstar/isite-security
```

- Manage users From This Route [ /security ]

## Helper Functions

```js
site.get('/', (req, res) => {
  res.render('index.html', { name: 'amr', age: '36' }, { compress: !0, cache: false, parser: 'html css js' });
  res.render('custom.css', { 'font-size': '18px' }, { parser: 'css' });
  res.render('custom.js', { 'allow-ads': !0 }, { parser: 'js' });
  res.code = 301; // set response code to 301
  res.status(301); // set response code if not set to 301 and return response object
  res.set('Content-Type', 'text/plain'); // add response header
  res.remove('Content-Type'); // remove response header
  res.delete('Content-Type'); // remove response header
  res.redirect('/URL'); // Any URL
  res.send('HTML CONTENT'); // Any HTML Content or object
  res.send(obj); // Any HTML Content or object
  res.htmlContent('HTML CONTENT'); // Any HTML Content
  res.html('index'); // like res.render
  res.css('bootstrap'); // css file name
  res.js('jquery'); // js file name
  res.json('items'); // json file name or object
  res.json(obj); // json file name or object

  if (req.hasFeature('browser.chrome')) {
  }
  if (req.hasFeature('browser.firefox')) {
  }
  if (req.hasFeature('browser.edge')) {
  }
  if (req.hasFeature('browser.opera')) {
  }
  if (req.hasFeature('browser.ucbrowser')) {
  }
  if (req.hasFeature('browser.baidu')) {
  }
  if (req.hasFeature('browser.chromium')) {
  }
  if (req.hasFeature('browser.unknown')) {
  }

  if (req.hasFeature('os.windows')) {
  }
  if (req.hasFeature('os.linux')) {
  }
  if (req.hasFeature('os.mac')) {
  }
  if (req.hasFeature('os.android')) {
  }
  if (req.hasFeature('os.unknown')) {
  }

  req.ip; // user ip
  req.port; // user port
  req.ip2; // server ip
  req.port2; // server port
  req.features; // array of user info [os , browser]
});

var person = { name: 'amr', email: 'absunstar' };
var person2 = site.copy(person);
person2.name = 'Abd Allah';
site.log(person);
site.log(person2);

var hash = site.md5('this content will be hashed as md5');
var base64 = site.toBase64('this content will be encript as base64 string');
var normal = site.fromBase64(base64);
var jsonString = site.toJson(person);
var jsonObj = site.fromJson(jsonString);
site.log(hash);
site.log(base64);
site.log(normal);
site.log(jsonString);
site.log(jsonObj);

var name = 'absunstar';
if (name.like('*sun*')) {
  site.log('yes');
}
```

## Events

- Events Are Global Actions Across Site

```js
site.on('event name', function (obj) {
  console.log('name : ' + obj.name);
});

site.on('event name 2', function (list) {
  console.log('name : ' + list[0].name);
  console.log('name : ' + list[1].name);
});

site.on('event name 3', function (obj, callback) {
  console.log('try long code : ' + obj.name);
  setTimeout(function () {
    callback();
  }, 3000);
});

site.on('sync event name 1', function (obj, callback, next) {
  console.log('name : ' + obj.name);
  next(); // to run next event
});
site.on('sync event name 2', function (obj, callback, next) {
  console.log('name : ' + obj.name);
  next(); // to run next event
});
site.call('event name', { name: 'x1' });
site.call('event name 2', [{ name: 'n1' }, { name: 'n2' }]);
site.call('event name 3', { name: 'some long code' }, () => {
  console.log('after excute some long code');
});

site.quee('sync event name 1', { name: 'x1' });
site.quee('sync event name 2', { name: 'x2' });
```

## Must Update

- You Must Update This Lib Every Month ( npm i isite )

## Hints

- This Framework Make Security and Safty in the First Place
- This Framework From Developer to Developers
- This Framework Free for Education and Supported For Ever
- This Framework Upgraded Arround the Clock
- This Framework Development by One Developer
- For Producation Contract what's up (+201090061266)

# Contact Me

- Patreon : https://www.patreon.com/next_corporation
- Email : Absunstar@gmail.com
- Linkedin : https://www.linkedin.com/in/absunstar
- Github : https://github.com/absunstar
- Paypal : https://paypal.me/absunstar
- What's up: +201090061266
