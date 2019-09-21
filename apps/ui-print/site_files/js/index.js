;site.print = site.printHTML = function (options) {

    options = options || {};

    if (typeof options === 'string') {
      options = {
        select: options
      };
    }


    let content = '';
    window.document.querySelectorAll('link[rel=stylesheet]').forEach(l => {
      content += l.outerHTML;
    });

    window.document.querySelectorAll('style').forEach(s => {
      content += s.outerHTML;
    });


    if (options.links) {
      options.links.forEach(link => {
        content += '<link rel="stylesheet" href="' + link + '" type="text/css" >';
      });
    }


    if(options.preappends){
      options.preappends.forEach(el => {
        el = window.document.querySelector(el);
        if(el){
            content += el.outerHTML;
        }
      })
    }

    document.querySelectorAll(options.select + ' input').forEach(el=>{
      el.setAttribute('value' , el.value);
    });

    document.querySelectorAll(options.select + ' textarea').forEach(el=>{
      el.innerText =  el.value;
    });

  
    document.querySelectorAll(options.select).forEach(el=>{
      let display = el.style.display;
      el.style.display = 'block';
      content += el.outerHTML;
      el.style.display = display;
    });


   if(options.appends){
      options.appends.forEach(el => {
        el = window.document.querySelector(el);
        if(el){
            content += el.outerHTML;
        }
      });
    }

    site.postData({url : '/api/print' , data : {content : content}} , (response)=>{
        if(response.done){
            window.open(response.url);
        }
    } , (error)=>{
        console.log(error);
    });

    return true;
  };