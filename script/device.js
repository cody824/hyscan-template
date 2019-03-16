(function(window) {

    window.stDevice = {
        /**
         *  ret
         {
              status://【0：设备OK， 1：需要更新设备信息 ，2：需要定标, -2:设备连接失败 -1：没有设备】
            }

         */
        isDeviceOk: function(callback) {
            callback = callback || function(ret) {
                console.log(JSON.stringify(ret));
            };
            if (!isLoad) {
                loadAppConfig();
            }
            var ret = {};
            ret.status = 0;
            if (appConfig.device) {
                ret.device = appConfig.device;
                sppUtil.connectDevice(appConfig.device.address, function(connectRet, err) {
                    if (connectRet.status) {
                        if (!ret.device.model) {
                            ret.status = 1;
                        } else if (!ret.device.darkCurrent || !ret.device.whiteboardData) {
                            ret.status = 2;
                        }
                    } else {
                        console.log(err.msg);
                        ret.status = -2;
                        ret.err = err.msg
                    }
                    callback(ret);
                });
            } else {
                ret.status = -1;
                callback(ret);
            }
        },

        readDeviceInfo: function(address, callback) {
            hyCmd.receive(address, {
                batteryInfo: function(data) {
                    if (typeof callback == "function")
                        callback(data);
                },
                deviceInfo: function(data) {
                    var model = data.substr(0, 4);
                    var serial = data.substr(4, 8);
                    var firmware = data.substr(12, 4);
                    if (appConfig.device) {
                        appConfig.device.model = model;
                        appConfig.device.serial = serial;
                        appConfig.device.firmware = firmware;
                        getDCRecord(address, function(ret) {
                            if (ret.status && ret.dc && ret.dc.length == 2) {
                                appConfig.device.darkCurrent = ret.dc[0];
                                appConfig.device.whiteboardData = ret.dc[1];
                            }
                            saveAppConfig();
                            loadAppConfig(); //读取全局配置信息
                            hyCmd.batteryInfo(address);
                        });
                    }
                }
            });
            hyCmd.deviceInfo(address);
        }
    }

    function getDCRecord(address, callback) {
        api.readFile({
            path: 'fs://dc/' + address
        }, function(ret, err) {
            var funcRet = {};
            if (ret.status) {
                var dc = JSON.parse(ret.data);
                funcRet.status = true;
                funcRet.dc = dc;
                if (typeof callback == "function")
                    callback(funcRet);
            } else {
                funcRet.status = true;
                funcRet.err = err;
                if (typeof callback == "function")
                    callback(funcRet);
            }
        });

    }

    var __hyCmd = {

        collect: function(address, callback) {
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: '55CC090010013B0000',
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        collectOne: function(address, callback) {
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: '55CC090010023C0000',
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        stopCollect: function(address, callback) {
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: '55CC090010003A0000',
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        periodSetup: function(address, data, callback) {
            if (data > 255) data = 255;
            if (data < 1) data = 1;
            var period = data.toString(16);
            var base = 315 //13B 55 + cc + 9 + 11;
            var crc = (base + data).toString(16);
            if (crc.length > 2) {
                crc = crc.substring(crc.length - 2);
            }
            var sendData = "55CC090011" + period + crc + "0000";
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: sendData.toUpperCase(),
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        period2Setup: function(address, data1, data2, callback) {
            if (data1 > 255) data1 = 255;
            if (data1 < 1) data1 = 1;
            if (data2 > 65535) data2 = 65535;
            if (data2 < 1) data2 = 1;
            var period1 = get16LH(data1)
            var period2 = get16LH(data2)
            if (period2.length == 2){
                period2 += "00";
            }
            var sendData = "55CC0B0011" + period1 + period2;
            var crc = getCrc(sendData);
            sendData = sendData + crc + "0000";
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: sendData.toUpperCase(),
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        lightOn: function(address, callback) {
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: '55CC090012114D0000',
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        lightOff: function(address, callback) {
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: '55CC090012104C0000',
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        deviceInfo: function(address, callback) {
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: '55CC090020004A0000',
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        batteryInfo: function(address, callback) {
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: '55CC090021004B0000',
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        setGainValue1: function(address, callback) {
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: '55CC0A0014D007160000',
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        },

        setVoltage: function(address, voltage, callback) {
            var value = voltage * 10

            if (value > 255) value = 255;
            if (value < 1) value = 1;
            var voltageData = value.toString(16);
            var base = 332 //13B 55 + cc + 9 + 22;
            var crc = (base + value).toString(16);
            if (crc.length > 2) {
                crc = crc.substring(crc.length - 2);
            }
            var sendData = "55CC090022" + voltageData + crc + "0000";
            var spp = api.require("spputil");
            spp.send({
                address: address,
                isHex: true,
                sendData: sendData,
            }, function(ret, err) {
                if (typeof callback == "function") {
                    callback(ret, err);
                }
            })
        }

    }

    __hyCmd.receive = function(address, handler) {
        var spp = api.require("spputil");
        var remainData = "";
        spp.receive({
            address: address,
            isHex: true
        }, function(ret, err) {
            if (ret.status) {
                var data = remainData + ret.data.toLocaleUpperCase();
                var cmds = parseCmd(data);
                if (cmds.length == 2) {
                    cmdHandler(cmds[0], handler);
                    remainData = cmds[1];
                } else {
                    remainData = cmds[0];
                }
            } else {
                console.log(JSON.stringify(err));
            }

        });
    }

    function parseCmd(data) {
        var cmds = [];
        var beginIndex = data.indexOf('55CC');
        if (beginIndex < 0) {
            cmds.push(data);
        } else {
            var lengthL = data.substr(beginIndex + 4, 2);
            var lengthH = data.substr(beginIndex + 6, 2);
            var dataLength = parseInt(lengthH + lengthL, 16);
            var beforeCmd = data.substring(0, data.indexOf('55CC') - 1);
            var afterCmd = data.substring(data.indexOf('55CC'));
            var leftStr = null;
            var cmd = null;
            if (afterCmd.length >= dataLength * 2) {
                cmd = afterCmd.substr(0, dataLength * 2);
                if (appConfig.sppDebug) {
                    console.log("cmd return start:" + cmd.substr(0, 8));
                    console.log("cmd return length:" + beginIndex + ":" + lengthH + ":" + lengthL + ":" + dataLength);
                    console.log("cmd return end:" + cmd.substr(cmd.length - 4));
                }
                var reg = /(^55CC)[0123456789ABCDEF]+(0000$)/i;
                leftStr = afterCmd.substr(dataLength * 2);
                if (reg.test(cmd)) {
                    cmds.push(cmd);
                    cmds.push(leftStr);
                } else {
                    console.log("=====cmd return invalid======");
                    cmds.push(leftStr);
                }
            } else {
                cmds.push(afterCmd);
            }
        }
        return cmds;
    }

    function cmdHandler(cmd, handler) {
        handler = handler || {};
        var remain = "";
        if (cmd.length < 18) {
            remain = cmd;
        } else if (cmd.indexOf('55CC') == 0 && cmd.substring(cmd.length - 4) == "0000") {
            var lengthL = cmd.substr(4, 2);
            var lengthH = cmd.substr(6, 2);
            var dataLength = parseInt(lengthH + lengthL, 16);
            var cmdType = null;
            var data = null;
            if (cmd.length != dataLength * 2) {
                console.log("Date length error :need[" + dataLength + "],actual[" + cmd.length + "]");
                remain = cmd;
            } else {
                cmdType = cmd.substr(8, 2);
                data = cmd.substr(10, cmd.length - 16);
                if (cmdType == "10") {
                    doWithCollect(data, handler.collect, handler.stopCollect);
                } else if (cmdType == "70") {
                    doWithCollect(data, handler.collectOne, handler.stopCollect);
                } else if (cmdType == "11") {
                    returnFormPeriodSetup(data, handler.periodSetup);
                } else if (cmdType == "12") {
                    returnLightSwitch(data, handler.lightSwitch);
                } else if (cmdType == "20") {
                    returnModelInfo(data, handler.deviceInfo);
                } else if (cmdType == "21") {
                    returnBatteryInfo(data, handler.batteryInfo);
                } else if (cmdType == "22") {
                    returnSetVoltage(data, handler.batteryInfo);
                } else {
                    console.log("Unsupported cmd return:" + cmd);
                }
            }
        } else {
            remain = cmd;
            console.log("Invalid data return:" + cmd);
        }
        return remain;
    }

    function doWithCollect(data, handler, stopHandler) {
        handler = handler || function() {};
        stopHandler = stopHandler || function() {};
        if (data.length == 2) {
            stopHandler();
            return;
        }
        var labels = [],
            datas = [],
            hexData = [];
        var index = 0;
        for (var i = 0; i < data.length; i++) {
            var pos = i % 4;
            if (pos == 0) {
                var numStr = data[i + 2] + data[i + 3] + data[i] + data[i + 1];
                hexData[index++] = parseInt(numStr, 16);
            }
        }
        if (appConfig.device.vnir && appConfig.device.vnirRange
            && appConfig.device.vnirRange.length == 2 && appConfig.device.vnirRange[1] < data.length){
            var vnirModel = spDeivceConfig.vnir[appConfig.device.vnir];
            if (vnirModel){
                for (var i = appConfig.device.vnirRange[0]; i <= appConfig.device.vnirRange[1]; i++) {
                    labels.push(vnirModel.toW(i));
                    datas.push(hexData[i]);
                }
            }
        }
        if (appConfig.device.swir && appConfig.device.swirRange
            && appConfig.device.swirRange.length == 2 && appConfig.device.swirRange[1] < data.length){
            var swirModel = spDeivceConfig.swir[appConfig.device.swir];
            if (swirModel){
                for (var i = appConfig.device.swirRange[0]; i <= appConfig.device.swirRange[1]; i++) {
                    labels.push(swirModel.toW(i));
                    datas.push(hexData[i]);
                }
            }
        }
        if (datas.length == 0 && appConfig.device.spectralRange){
            var range = appConfig.device.spectralRange;
            for (var i = range[0]; i <= range[1]; i++) {
                labels.push(1.9799 * i - 934.5831);
                datas.push(hexData[i]);
            }
        }
        handler(datas, labels);
    }

    function returnFormPeriodSetup(data, handler) {
        console.log("Exposure period:" + data);
        handler = handler || function() {};
        handler(data);
    }

    function returnLightSwitch(data, handler) {
        console.log("Light switch:" + data);
        handler = handler || function() {};
        handler(data);
    }

    function returnModelInfo(data, handler) {
        console.log("Model info:" + data);
        handler = handler || function() {};
        handler(data);
    }

    function returnBatteryInfo(data, handler) {
        console.log("Battery info:" + data);
        handler = handler || function() {};
        var d = parseInt(data, 16);
        if (appConfig.device){
            appConfig.device.batteryInfo = d;
        }
        saveAppConfig();
        handler(data);
    }

    function returnSetVoltage(data, handler) {
        console.log("Set Voltage return:" + data);
        handler = handler || function() {};
        handler(data);
    }

    window.spDeivceConfig = {

        vnir: {
            VNIR1: {
                "name": "VNIR1",
                "range": [674, 976],
                "toW": function (index) {
                    var a = 0.000004, b = 1.9726, c = -931.4841;
                    var wavelength = (a * index * index + b * index + c).toFixed(2)
                    return wavelength
                }
            }
        },

        swir: {
            SWIR1: {
                "name": "SWIR1",
                "range": [2071, 2156],
                "toW": function (index) {
                    var a = -0.000511, b = 10.39, c = -18320;
                    var wavelength = (a * index * index + b * index + c).toFixed(2)
                    return wavelength
                }
            }
        },
        
        getLabel: function (device) {
            var labels = [];
            if (device.vnir && device.vnirRange){
                var vnirConfig = spDeivceConfig.vnir[device.vnir];
                if (vnirConfig){
                    for (var i = device.vnirRange[0]; i < device.vnirRange[1]; i++){
                        var label = vnirConfig.toW(i);
                        labels.push(label)
                    }
                }
            }
            if (device.swir && device.swirRange){
                var swirConfig = spDeivceConfig.swir[device.swir];
                if (swirConfig){
                    for (var i = device.swirRange[0]; i < device.swirRange[1]; i++){
                        var label = swirConfig.toW(i);
                        labels.push(label)
                    }
                }
            }
            if (labels.length == 0){
                if (device.spectralRange){
                    for (var i = device.spectralRange[0]; i < device.spectralRange[1]; i++) {
                        labels.push(1.9799 * i - 934.5831);
                    }
                }
            }
            return labels;
        }
    };
    window.hyCmd = __hyCmd;

    function get16LH(num) {
        var str = num.toString(16);
        var arr = [];
        var sarr = [];
        for (var i = str.length-1, n = 0; i >= 0; i--, n++){
            if (n % 2 == 0){
                sarr[0] = "0"
                sarr[1] = str.charAt(i);
            } else {
                sarr[0] = str.charAt(i);
            }
            if ((n == str.length - 1) || (n & 2 != 0)){
                arr.push(sarr[0] + sarr[1]);
            }
        }
        return arr.join("").toUpperCase();
    }

    function getCrc(str) {
        var crc = 0;
        for (var n = 0; n < str.length; n = n + 2){
           if ((n + 1) < str.length){
               var num = parseInt(str.charAt(n) + str.charAt(n+1), 16);
               crc += num;
           }
        }
        var crcStr = crc.toString(16);
        if (crcStr.length > 2) {
            crcStr = crcStr.substring(crcStr.length - 2);
        }
        return crcStr;
    }

})(window);
