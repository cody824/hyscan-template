(function(window) {
    var fs;

    var __user = {

        init: function() {
            fs = fs || api.require("fs");
        },

        saveAvatar: function(imagePath, callback) {
            api.ajax({
                url: globalConfig.serverUrl + "app/user/avatar",
                method: 'post',
                headers: {
                    hytoken: 'hyscan' + appConfig.token,
                    Accept: 'application/json'
                },
                data: {
                    files: {
                        file: imagePath
                    }
                }
            }, callback);
        },

        saveUser: function(user, callback) {
            api.ajax({
                url: globalConfig.serverUrl + "security/ud/" + user.id,
                method: 'put',
                headers: {
                    hytoken: 'hyscan' + appConfig.token,
                    Accept: 'application/json'
                },
                data: {
                    body: user
                }
            }, callback);
        },
        
        isAdmin: function (callback) {
            api.ajax({
                url: globalConfig.serverUrl + "security/user/role",
                method: 'get',
                headers: {
                    hytoken: 'hyscan' + appConfig.token,
                    Accept: 'application/json'
                }
            }, function (ret, err) {
                var isAdmin = false;
                if (ret){
                    if (ret.length > 0){
                        for (var i = 0; i < ret.length; i++){
                            var auth = ret[i];
                            if (auth.authority == "ROLE_ADMIN"){
                                isAdmin = true;
                                break;
                            }
                        }
                    }
                }
                callback(isAdmin);
            });
        }
    }
    window.hyUser = __user;
})(window);
