(function(window) {
    var fs;
    var __task = {

        init: function() {
            fs = fs || api.require("fs");
        },

        addTask: function(data, datas, result, position, name, imagePath, appDevice, callback) {
            var targetType = appConfig.globalConfig.targetType || $api.getStorage("defaultTarget");
            var now = new Date();
            var device = deepCopy(appDevice);
            var id = device.model + device.serial + dateFormat("yyyyMMddhhmmssS", now);
            var dc = [];
            dc[0] = appDevice.darkCurrent;
            dc[1] = appDevice.whiteboardData;
            delete device.darkCurrent;
            delete device.whiteboardData;

            var saveData = {
                dn: data,
                dnList: datas
            }

            if (data.length != appDevice.darkCurrent.length || data.length != appDevice.whiteboardData.length){
                var errorRet = {
                    status : false,
                    err: {
                        msg: i18n.t('"action.return.dataLengthNotMatch"', "数据长度与定标数据不匹配，请重新进行光谱定标")
                    }
                };
                if (typeof callback == "function")
                    callback(errorRet);
                return;
            }
            var st = {
                result: result,
                position: position,
                name: name,
                imagePath: imagePath,
                device: device,
                isUpload: false,
                timestamp: now.getTime(),
                targetType : targetType,
                id: id
            };
            api.writeFile({
                path: 'fs://task/info/' + id,
                data: JSON.stringify(st)
            }, function(ret, err) {
                var funcRet = {};
                if (ret.status) {
                    api.writeFile({
                        path: 'fs://task/data/' + id,
                        data: JSON.stringify(saveData)
                    }, function(ret, err) {
                        if (ret.status) {
                            api.writeFile({
                                path: 'fs://task/dc/' + id,
                                data: JSON.stringify(dc)
                            }, function(ret, err) {
                                if (ret.status) {
                                    funcRet.status = true;
                                    st.data = {
                                        dn: data,
                                        dnList: datas,
                                        darkCurrent: dc[0],
                                        whiteboardData: dc[1]
                                    }
                                    funcRet.task = st;
                                    var taskList = $api.getStorage('taskList') || [];
                                    taskList.push(st.id);
                                    $api.setStorage('taskList', taskList);


                                    if (typeof callback == "function")
                                        callback(funcRet);
                                } else {
                                    console.log(JSON.stringify(err));
                                    funcRet.status = false;
                                    funcRet.err = err;
                                    if (typeof callback == "function")
                                        callback(funcRet);
                                }
                            });
                        } else {
                            console.log(JSON.stringify(err));
                            funcRet.status = false;
                            funcRet.err = err;
                            if (typeof callback == "function")
                                callback(funcRet);
                        }
                    });
                } else {
                    console.log(JSON.stringify(err));
                    funcRet.status = false;
                    funcRet.err = err;
                    if (typeof callback == "function")
                        callback(funcRet);
                }
            });
        },

        updateTaskInfo: function(task, callback) {
            delete task.dc; //不保存dc和data信息
            delete task.data;
            api.writeFile({
                path: 'fs://task/info/' + task.id,
                data: JSON.stringify(task)
            }, function(ret, err) {
                var funcRet = {};
                if (ret.status) {
                    funcRet = ret;
                } else {
                    console.log(JSON.stringify(err));
                    funcRet.status = false;
                    funcRet.err = err;
                }
                if (typeof callback == "function")
                    callback(funcRet);
            });
        },

        getTask: function(id, containData, callback) {
            api.readFile({
                path: "fs://task/info/" + id
            }, function(ret, err) {
                var funcRet = {};
                if (ret.status) {
                    var data = ret.data;
                    var task = JSON.parse(data);
                    if (containData) {
                        api.readFile({
                            path: "fs://task/data/" + id
                        }, function(ret, err) {
                            if (ret.status) {
                                var data = ret.data;
                                task.data = JSON.parse(data);
                                api.readFile({
                                    path: "fs://task/dc/" + id
                                }, function(ret, err) {
                                    if (ret.status) {
                                        var dc = ret.data;
                                        task.dc = JSON.parse(dc);
                                        if (typeof callback == "function") {
                                            callback({
                                                status: true,
                                                task: task
                                            });
                                        }
                                    } else {
                                        if (typeof callback == "function") {
                                            callback({
                                                status: false,
                                                err: err
                                            });
                                        }
                                    }
                                })
                            } else {
                                if (typeof callback == "function") {
                                    callback({
                                        status: false,
                                        err: err
                                    });
                                }
                            }
                        })
                    } else {
                        if (typeof callback == "function") {
                            callback({
                                status: true,
                                task: task
                            });
                        }
                    }
                } else {
                    if (typeof callback == "function") {
                        callback({
                            status: false,
                            err: err
                        });
                    }
                }
            })
        },

        deleteTaskImage: function(task) {
            stTask.init();
            if (task.imagePath) {
                fs.remove({
                    path: task.imagePath
                });
            }
        },

        deleteTask: function(task, callback) {
            stTask.init();
            var files = $api.getStorage('taskList') || [];
            var index = -1;
            for (var i = 0; i < files.length; i++) {
                if (files[i] = task.id) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                files.splice(index, 1);
                $api.setStorage('taskList', files);
            }
            callback({
                status: true
            })
            fs.remove({
                path: 'fs://task/data/' + task.id
            });
            fs.remove({
                path: 'fs://task/dc/' + task.id
            });
            fs.remove({
                path: 'fs://task/info/' + task.id
            });
            if (task.imagePath) {
                fs.remove({
                    path: task.imagePath
                })
            }
        },

        sendTaskImgToRemote: function(imagePath, taskId, callback) {
            api.ajax({
                url: globalConfig.serverUrl + "app/scanTask/img",
                method: 'post',
                headers: {
                    hytoken: 'hyscan' + appConfig.token,
                    Accept: 'application/json'
                },
                method: 'post',
                data: {
                    values: {
                        taskId: taskId
                    },
                    files: {
                        file: imagePath
                    }
                }
            }, callback);
        },

        sendTaskToRemote: function(task, callback) {
            console.log("Send task to server");
            task.appId = appId;
            api.ajax({
                url: globalConfig.serverUrl + "app/scanTask/",
                method: 'post',
                headers: {
                    hytoken: 'hyscan' + appConfig.token,
                    "Content-Type": 'application/json',
                    Accept: 'application/json'
                },
                data: {
                    body: task
                }
            }, callback);
        },

        sendTaskToRemoteById: function(taskId, callback) {
            callback = callback || function() {};
            stTask.getTask(taskId, true, function(ret) {
                if (ret.status) {
                    var task = ret.task;
                    var appTask = deepCopy(ret.task);
                    appTask.data = {
                        dn: task.data.dn,
                        dnList: task.data.dnList,
                        darkCurrent: task.dc[0],
                        whiteboardData: task.dc[1]
                    }
                    stTask.sendTaskToRemote(appTask, function(ret, err) {
                        if (ret.id) {
                            task.isUpload = true;
                            stTask.updateTaskInfo(task, function(ret) {});
                            api.toast({
                                msg : i18n.t('toast.msg.saveSuccess','保存成功'),
                                duration: 2000,
                                location: 'top'
                            });
                            callback({
                                status: true
                            });
                            if (task.imagePath) {
                                stTask.sendTaskImgToRemote(task.imagePath, task.id, function(ret, err) {
                                    console.log(JSON.stringify(ret));
                                    console.log(JSON.stringify(err));
                                });
                            }
                        } else {
                            var msg;
                            try {
                                var retMsg = JSON.parse(err.msg);
                                msg = retMsg.errorMsg || retMsg.systemError;
                            } catch (e) {
                                msg = err.msg;
                            }
                            callback({
                                status: false,
                            }, {
                                msg : i18n.t('ret.msg.saveRemoteFailed','保存到服务器失败') + ":"+ msg
                            });
                        }
                    });
                } else {
                    callback({
                        status: false,
                    }, {
                        msg : i18n.t('ret.msg.readTaskInfoFailed','任务信息读取失败') + ":"+ ret.err.msg
                    })
                }
            })
        },

        getTestResult: function(data, model, callback) {
            var url = globalConfig.serverUrl + "app/analysis/" + appId + "?model=" + model;
            var targetType = appConfig.globalConfig.targetType || $api.getStorage("defaultTarget");
            if (targetType) {
                url += "&target=" + targetType
            }
            api.ajax({
                url: url,
                method: 'post',
                headers: {
                    hytoken: 'hyscan' + appConfig.token,
                    "Content-Type": 'application/json',
                    Accept: 'application/json'
                },
                data: {
                    body: data
                }
            }, function(ret, err) {
                if (!ret) {
                    var errorMsg = {};
                    if (isJSON(err.msg)){
                        errorMsg = JSON.parse(err.msg);
                    } else {
                        errorMsg.errorMsg = err.msg;
                    }
                    ret = {
                        err: errorMsg
                    };
                }
                if (typeof callback == "function") {
                    callback(ret);
                }

            });
        },

        findTask: function(callback, start, limit) {
            stTask.init();
            start = start || 0;
            limit = limit || 500;
            var files = $api.getStorage('taskList');
            if (files && files.length > 0 && start <= files.length - 1) {
                var tasks = [];
                var beginIndex = files.length - 1 - start;
                if (beginIndex < 0) {
                    callback([]);
                }
                var endIndex = beginIndex - limit + 1;
                endIndex = endIndex < 0 ? 0 : endIndex;
                var fileNum = beginIndex - endIndex + 1;
                for (var i = beginIndex; i >= endIndex; i--) {
                    var path = files[i];
                    stTask.getTask(path, false, function(ret) {
                        fileNum--;
                        if (ret.status) {
                            tasks.push(ret.task);
                        }
                        if (fileNum == 0 && typeof callback == "function") {
                            callback(tasks);
                        }
                    });
                }
            } else {
                callback([]);
            }
        },

        findRemoteTask: function(callback, start, limit) {
            start = start || 0;
            limit = limit || 500;
            var url = globalConfig.serverUrl + "app/user/task/?appId=" + appId;
            api.ajax({
                url: url,
                method: 'get',
                headers: {
                    hytoken: 'hyscan' + appConfig.token,
                    "Content-Type": 'application/json',
                    Accept: 'application/json'
                }
            }, function(ret, err) {
                if (!ret) {
                    var errorMsg = {};
                    if (isJSON(err.msg)){
                        errorMsg = JSON.parse(err.msg);
                    } else {
                        errorMsg.errorMsg = err.msg;
                    }
                    api.alert({
                        title: '错误',
                        msg: errorMsg.errorMsg,
                    }, function (ret, err) {

                    });
                    return;
                }
                if (typeof callback == "function") {
                    callback(ret);
                }

            });
        },

        getTaskFromRemote : function(taskId, containData, callback){
            var url = globalConfig.serverUrl + "app/scanTask/appData/" + taskId + "?containData=" + containData;
            api.ajax({
                url: url,
                method: 'get',
                headers: {
                    hytoken: 'hyscan' + appConfig.token,
                    "Content-Type": 'application/json',
                    Accept: 'application/json'
                }
            }, function(ret, err) {
                if (!ret) {
                    var errorMsg = {};
                    if (isJSON(err.msg)){
                        errorMsg = JSON.parse(err.msg);
                    } else {
                        errorMsg.errorMsg = err.msg;
                    }
                    api.alert({
                        title: '错误',
                        msg: errorMsg.errorMsg,
                    }, function (ret, err) {

                    });
                    return;
                }
                ret.dc = [];
                ret.dc[0] = ret.data.darkCurrent;
                ret.dc[1] = ret.data.whiteboardData;
                if (typeof callback == "function") {
                    callback(ret);
                }

            });
        },

        dateFormat: dateFormat
    }

    function dateFormat(fmt, date) {
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    function isJSON(str) {
        if (typeof str == 'string') {
            try {
                var obj = JSON.parse(str);
                if (str.indexOf('{') > -1) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    window.stTask = __task;
})(window);
