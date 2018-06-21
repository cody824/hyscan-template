(function(window) {

    var defaultOpts = {
        debug: false,
        lng: "zh-CN",
        fallbackLng: 'zh-CN',
        preload: ['zh-CN']
    };

    /**
     * app启动时候调用，检测localStorage中是否包含语言包，不包含加载到localStorage中
     */
    window.initLocale = function(options) {
        options = $.extend({}, defaultOpts, options);
        //回调
        var cb = options.callback || function(ret) {
            console.log(JSON.stringify(ret))
        };
        var preload = options.preload || [];
        if (!Array.isArray(preload)) {
            cb({
                status: false,
                msg: "preload must be array"
            });
            return;
        }
        if (options.fallbackLng) {
          if (!$api.getStorage("Locale_" + options.fallbackLng))
              loadLocaleFile(options.fallbackLng);
        }

        for (var i = 0; i < preload; i++) {
            var locale = $api.getStorage("Locale_" + preload[i]);
            if (!locale) {
                loadLocaleFile(preload[i]);
            }
        }
    }

    window.i18n = {
        messages : {},
        fallbackLng : {},
        t : function(key, defaultValue){
            defaultValue = i18n.messages[key] || i18n.fallbackLng[key] || defaultValue;
            return defaultValue;
        }
    };

    window.loadLocale = function(lang) {
        lang = lang || appConfig.globalConfig.lang;
        var messages = $api.getStorage("Locale_" + lang);
        var fallbackLng = $api.getStorage('fallbackLng');
        var fbMsg = messages;
        if (lang != fallbackLng)
            fbMsg = $api.getStorage("Locale_" + fallbackLng);
        if (!messages) {
            loadLocaleFile(lang, function(status, data) {
                if (status) {
                    messages = data;
                    var fbMsg = data;
                    if (lang != fallbackLng)
                        fbMsg = $api.getStorage("Locale_" + fallbackLng) || {};
                    i18n.messages = messages;
                    i18n.fallbackLng = fbMsg;
                    execute(messages, fbMsg);
                } else {
                    console.log(JSON.stringify(data));
                }
            });
        } else {
            var fbMsg = messages;
            if (lang != fallbackLng)
                fbMsg = $api.getStorage("Locale_" + fallbackLng) || {};
            i18n.messages = messages;
            i18n.fallbackLng = fbMsg;
            execute(messages, fbMsg);
        }
    };

    window.clearLocale = function(locale) {
        $api.rmStorage("Locale_" + locale);
    };

    window.buildLocaleFile = function(){
        var localeObj = {};
        // var fs = api.require("fs");
        var htmls = buildWidthHtml("html");
        var n = htmls.length;
        for (var i = 0; i < htmls.length; i++){
            doWithHtml(htmls[i], localeObj, function(){
                n--;
                if (n == 0) {
                    console.log("buildWidthJs")
                    buildWidthJs(localeObj);
                }
            });
        }
    }

    function buildWidthHtml(path, htmls){
      htmls = htmls || [];
      var fs = api.require("fs");
      var ret = fs.readDirSync({
          path:'widget://' + path
      });
      if(ret.status){
          var i;
          var n = ret.data.length;
          for (i = 0; i < ret.data.length; i++){
              var fullPath = path + "/" + ret.data[i];
              if (fullPath.endWith('html')) {
                 htmls.push(fullPath);
              } else {
                  var dirRet = fs.existSync({
                      path: 'widget://' + fullPath
                  });
                  if (dirRet.directory){
                      buildWidthHtml(fullPath, htmls);
                  }
              }
          }
      }else{
          console.log(JSON.stringify(ret));
      }
      return htmls;
    }

    function buildWidthJs(localeObj){
        localeObj = localeObj || {};
        var fs = api.require("fs");
        fs.readDir({
            path:'widget://script'
        }, function(ret, err){
            if( ret.status ){
                var i;
                var n = ret.data.length;
                for (i = 0; i < ret.data.length; i++){
                    var file = ret.data[i];
                    if (file.endWith('js')) {
                        doWithJs(file, localeObj, function(){
                            n--;
                            if (n == 0) {
                                saveLocalFile(localeObj);
                            }
                        });
                    } else {
                        n--;
                        if (n == 0) {
                            saveLocalFile(localeObj);
                        }
                    }
                }
            }else{
                console.log( JSON.stringify( err ) );
            }
        });
    }

    function saveLocalFile(localeObj){
        // localeObj = objKeySort(localeObj);
        console.log(JSON.stringify(localeObj));
    }

    function doWithHtml(file, localeObj, cb){
        api.readFile({
            path: 'widget://' + file
        }, function(ret, err){
            if( ret ){
                try{
                    $api.append($api.dom('#locale'), ret.data);
                    var list = $api.domAll("[data-i18n]");
                    var i = 0;
                    for (i = 0; i < list.length; i++){
                        localeObj[$api.attr(list[i], 'data-i18n')] =  $api.text(list[i]);
                    }
                    var i18nReg = /i18n.t\(["']([^"']+)["'][\s]*,[\s]*["']([^"']+)["']\)/g;
                    var r = ret.data.match(i18nReg);
                    if (r){
                        for (i = 0; i < r.length; i++){
                            var str = r[i];
                            var i18nReg1 = /i18n.t\(["']([^"']+)["'][\s]*,[\s]*["']([^"']+)["']\)/g;
                            var r1 = i18nReg1.exec("begin" + str + "end");
                            if (r1){
                                localeObj[r1[1]] =   r1[2];
                            } else {
                                console.log(str);
                            }
                        }
                    }
                }catch(e){
                    console.log(e);
                }
            }
            cb();
        });
    }

    function doWithJs(file, localeObj, cb){
        api.readFile({
            path: 'widget://script/' + file
        }, function(ret, err){
            if( ret ){
                try{
                    var i18nReg = /i18n.t\(["']([^"']+)["'][\s]*,[\s]*["']([^"']+)["']\)/g;
                    var r = ret.data.match(i18nReg);
                    if (r){
                        for (i = 0; i < r.length; i++){
                            var str = r[i];
                            var i18nReg1 = /i18n.t\(["']([^"']+)["'][\s]*,[\s]*["']([^"']+)["']\)/g;
                            var r1 = i18nReg1.exec("begin" + str + "end");
                            if (r1){
                                localeObj[r1[1]] =   r1[2];
                            } else {
                                console.log(str);
                            }
                        }
                    }
                }catch(e){
                    console.log(e);
                }
            }
            cb();
        });
    }

    function execute(messages, fbMsg) {
        var textList = $api.domAll('[data-i18n]');
        for (var i = 0; i < textList.length; i++) {
            var key = $api.attr(textList[i], 'data-i18n');
            var value = messages[key] || fbMsg[key];
            if (value) {
                if (key.indexOf('placeholder.') == 0) {
                  $api.attr(textList[i], 'placeholder', value);
                }
                  $api.text(textList[i], value);
            } else {
                console.log("No language param found for this key：" + key);
            }
        }
    }


    function loadLocaleFile(locale, cb) {
        console.log("load language file from file:" + locale);
        api.readFile({
            path: "widget://template/locale/" + locale + ".json"
        }, function(ret, err) {
            if (ret.status) {
                var data = JSON.parse(ret.data);
                api.readFile({
                    path: "widget://locale/" + locale + ".json"
                }, function(ret1, err1) {
                    if (ret1.status) {
                        var data1 = JSON.parse(ret1.data);
                        Object.assign(data, data1);
                    }
                    $api.setStorage("Locale_" + locale, data);
                    if (typeof cb === "function")
                        cb(ret.status, data);
                })
            } else {
                console.log("Load language package failed:" + JSON.stringify(err));
                if (typeof cb === "function")
                    cb(ret.false, err);
            }
        })
    }
})(window);
