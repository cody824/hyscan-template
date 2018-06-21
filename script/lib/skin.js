(function(window){

    var skinConfig = {
        supportSkin : [],
        cssFiles : ["skin"], //文件名列表，该列表下的css会载入
        jsFiles : ['theme']
    };

    var loadCss = function(basic, skin, file){
        var cssTag = document.getElementById('skin-' + file);
        var head = document.getElementsByTagName('head').item(0);
        if(cssTag) head.removeChild(cssTag);
        var css = document.createElement('link');
        css.href = basic + "/skin/" + skin + "/css/" + file + ".css";
        css.rel = 'stylesheet';
        css.type = 'text/css';
        css.id = 'skin-' + file;
        head.appendChild(css);
    };

    var loadJs = function(basic, skin, file) {
        var jsTag = document.getElementById('skin-js-' + file);
        var head = document.getElementsByTagName('head').item(0);
        if (jsTag) head.removeChild(cssTag);
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = basic + "/skin/" + skin + "/js/" + file + ".js";
        script.id = 'skin-js-' + file;
        head.appendChild(script);
    };

    window.skinUtil = {

        loadSkin : function (cssFiles, jsFiles, skin, basic) {
            cssFiles = cssFiles || skinConfig.cssFiles;
            jsFiles = jsFiles || skinConfig.jsFiles;
            skin = skin || skinUtil.getSkin();
            basic = basic || "../.."
            for (var i = 0; i < cssFiles.length; i++){
                loadCss(basic, skin, cssFiles[i]);
            }
            for (var i = 0; i < jsFiles.length; i++){
                loadJs(basic, skin, jsFiles[i]);
            }
        },

        getSkin : function () {
            var skin = localStorage.getItem("skin");
            if (skin == null || skin.length == 0) {
                skin = "default";
            }
            return skin;
        }
    }

})(window);

