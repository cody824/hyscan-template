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
        }
    }
    window.hyUser = __user;
})(window);
