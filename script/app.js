(function(window) {

    window.isDev = $api.getStorage("isDev") || false;
    isDev = isDev == "true"? true : false;
    window.appId = $api.getStorage("appId");
    if (!appId){
        console.log("Need appId");
    }

    var __config = {};
    __config.models = {};
    __config.serverUrl = "http://admin.cas-hytech.com/";
    __config.lang = {"zh-CN" : "简体中文", "en-US" : "English"};
    __config.defaultLang = "zh-CN";
    __config.batteryAlarm = 20;
    __config.login = {
        qq : false,
        wechat : true,
        weibo : false
    }
    window.globalConfig = __config;


    var defaultModelConfig = {
        "0105" : {
            radianceParams : [5, 2],
            spectralRange : [674,976],
            vnir : "VNIR1",
            vnirRange : [674,976],
            swir : "",
            dnMaxValue : 52500
        }
    }

    window.initModelConfig = function(fetch){
        var __appConfig = $api.getStorage('appConfig') ||　{globalConfig : {}}
        if (__appConfig.globalConfig && __appConfig.globalConfig.serverIp && isDev)
            globalConfig.serverUrl = "http://" + __appConfig.globalConfig.serverIp + ":9090/";
        if (fetch) {
            api.ajax({
                url: globalConfig.serverUrl + "app/modelConfig/",
                headers : {
                    Accept : 'application/json'
                },
                method: 'get',
            },function(ret, err){

                if (ret && ret.length > 0) {
                    for (var i = 0; i < ret.length; i++){
                        var model = ret[i];
                        console.log("Get remote model:" + model.model);
                        globalConfig.models[model.model] = {
                            radianceParams : model.radianceParams,
                            spectralRange : model.spectralRange,
                            dnMaxValue : model.dnMaxValue
                        };
                        if (model.vnir) {
                            globalConfig.models[model.model].vnir = model.vnir;
                            globalConfig.models[model.model].vnirRange = model.vnirRange;
                        }
                        if (model.swir) {
                            globalConfig.models[model.model].swir = model.swir;
                            globalConfig.models[model.model].swirRange = model.swirRange;
                        }
                    }
                    console.log(JSON.stringify(globalConfig.models));
                    $api.setStorage('supportModels', globalConfig.models);
                } else {
                    console.log("Get remote model failed，use default")
                    globalConfig.models = $api.getStorage('supportModels') || defaultModelConfig;
                }
                isModelInit = true;
            });
        } else {
            globalConfig.models = $api.getStorage('supportModels') || defaultModelConfig;
        }
    }

    window.isLoad = false;

    window.loadAppConfig = function() {
        var __appConfig = $api.getStorage('appConfig');
        if (!__appConfig) {
            __appConfig = {};
            __appConfig.device = null;
            __appConfig.user = null;
            __appConfig.task = [];
            // $api.setStorage('appConfig', __appConfig);
        }

        __appConfig.globalConfig = __appConfig.globalConfig || {};
        __appConfig.globalConfig.lang = __appConfig.globalConfig.lang || "zh-CN";
        __appConfig.globalConfig.collectNum = __appConfig.globalConfig.collectNum || 1;
        if (__appConfig.device && __appConfig.device.model) {
            var modelConfig = window.globalConfig.models[__appConfig.device.model];
            if (modelConfig) {
                var radiances = modelConfig.radianceParams;
                if (radiances && radiances.length == 2) {
                    __appConfig.device.radianceA = radiances[0];
                    __appConfig.device.radianceB = radiances[1];
                } else {
                    console.log(__appConfig.device.model + " error radiance config");
                }
                var spectralRange = modelConfig.spectralRange;
                if (spectralRange) {
                    __appConfig.device.spectralRange = spectralRange;
                }
                if (modelConfig.vnir) {
                    __appConfig.device.vnir = modelConfig.vnir;
                    __appConfig.device.vnirRange = modelConfig.vnirRange;
                }
                if (modelConfig.swir) {
                    __appConfig.device.swir = modelConfig.swir;
                    __appConfig.device.swirRange = modelConfig.swirRange;
                }
                __appConfig.device.dnMaxValue = modelConfig.dnMaxValue? modelConfig.dnMaxValue : 52500;
            } else {
                console.log("Unsupported model：" + __appConfig.device.model);
            }
        }
        window.appConfig = __appConfig;
        window.isLoad = true;
        if (appConfig.globalConfig.serverIp && isDev)
            globalConfig.serverUrl = "http://" + appConfig.globalConfig.serverIp + ":9090/"
    }

    window.saveAppConfig = function(config) {
        appConfig = config || appConfig;
        $api.setStorage('appConfig', appConfig);
    }

    window.login = function(userName, password, callback) {
        var ret = {},
            err = {};
        ret.status = true;
        if (userName.length <= 0 || userName.length > 16) {
            err.msg = i18n.t('input.error.userNameLength0-16', "用户名长度在0-16之间");
            ret.status = false;
            if (typeof callback == "function") {
                callback(ret, err);
            }
        } else {
            api.showProgress({
                title: i18n.t('progress.title.logging','登录中'),
                msg: i18n.t('progress.text.pleaseWait','请耐心等待'),
                modal: true
            });
            api.ajax({
                url: globalConfig.serverUrl + "security/auth/getToken",
                method: 'post',
                headers : {
                    "Content-Type" : 'application/json'
                },
                data: {
                    body : {
                        username : userName,
                        password : password
                    }
                }
            },function(ret, err){
                if (ret) {
                    appConfig.token = ret.token;
                    getUserDetails(ret.token, function(ud, err){
                        api.hideProgress();
                        if (ud) {
                            appConfig.isLogin = true;
                            appConfig.loginName = ud.fullName;
                            appConfig.user = ud;
                            saveAppConfig();
                            if (typeof callback == "function") {
                                ud.status = true;
                                callback(ud);
                            }
                        }  else {
                            console.log(JSON.stringify(err));
                            if (typeof callback == "function") {
                                callback(ret, err);
                            }
                        }

                    })
                } else {
                    console.log(JSON.stringify(err));
                    if (typeof callback == "function") {
                        err.msg = i18n.t('error.userNameOrPasswordError', '用户名或者密码错误');
                        callback(ret, err);
                    }
                    api.hideProgress();
                }
            });
        }
    }

    window.tpaLogin = function(type, userInfo, callback){
        console.log(JSON.stringify(userInfo));
        api.showProgress({
            title: i18n.t('progress.title.logging','登录中'),
            msg: i18n.t('progress.text.pleaseWait','请耐心等待'),
            modal: true
        });
        api.ajax({
            url: globalConfig.serverUrl + "security/auth/getToken/" + type,
            method: 'post',
            headers : {
                "Content-Type" : 'application/json',
                "Accept" : 'application/json'
            },
            data: {
                body : userInfo
            }
        },function(ret, err){
            if (ret) {
                appConfig.token = ret.token;
                getUserDetails(ret.token, function(ud, err){
                    api.hideProgress();
                    if (ud) {
                        appConfig.isLogin = true;
                        appConfig.loginName = ud.fullName;
                        appConfig.user = ud;
                        saveAppConfig();
                        if (typeof callback == "function") {
                            ud.status = true;
                            callback(ud);
                        }
                    }  else {
                        console.log(JSON.stringify(err));
                        if (typeof callback == "function") {
                            callback(ret, err);
                        }
                    }

                })
            } else {
                console.log(JSON.stringify(err));
                if (typeof callback == "function") {
                    callback(ret, err);
                }
                api.hideProgress();
            }
        });
    }

    window.getUserDetails = function(token, callback){
        api.ajax({
            url: globalConfig.serverUrl + "security/ud/loginInfo",
            method: 'get',
            headers : {
                hytoken : 'hyscan' + token,
                Accept : 'application/json'
            }
        },function(ret, err){
            callback(ret, err)
        });

    }

    window.logout = function(callback) {
        var ret = {},
            err = {};
        appConfig.isLogin = false;
        appConfig.loginName = null;
        appConfig.user = null;
        appConfig.token = null;
        saveAppConfig();
        if (typeof callback == "function") {
            callback(ret, err);
        }
        api.ajax({
            url: globalConfig.serverUrl + "security/auth/getToken",
            method: 'delete',
            headers : {
                Accept : 'application/json'
            }
        },function(ret, err){
            //callback(ret, err)
        });
    }
    initModelConfig();
    if (!isLoad) loadAppConfig();

    window.init = function(){
        var backSecond = 0;
        api.addEventListener({
            name: 'keyback'
        }, function(ret, err) {
            var curSecond = new Date().getSeconds();
            if (Math.abs(curSecond - backSecond) > 2) {
                backSecond = curSecond;
                api.toast({
                    msg: i18n.t('toast.msg.doubleClickToExist','连续按两次关闭系统'),
                    duration: 2000,
                    location: 'bottom'
                });
            } else {
                api.closeWidget({
                    id: api.appId,
                    retData: {
                        name: 'closeWidget'
                    },
                    silent: true
                });
            }
        });
    }

    window.dialogStyles = {
        bg: '#fff',
        corner: 10,
        w: 300,
        h: 140,
        title: {
            h: 60,
            alignment: 'center',
            size: 16,
            color: '#00DEFF'
        },
        input: {
            h: 60,
            marginT: 6,
            textSize: 14,
            textColor: '#000'
        },
        dividingLine: {
            width: 0,
            color: '#696969'
        },
        left: {
            bg: 'rgba(0,0,0,0)',
            color: '#00DEFF',
            size: 12
        },
        right: {
            bg: 'rgba(0,0,0,0)',
            color: '#00DEFF',
            size: 12
        },
    };

})(window);
function deepCopy(p, c) {
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object' && p[i] != null) {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
String.prototype.endWith=function(str){
    var reg=new RegExp(str+"$");
    return reg.test(this);
}
