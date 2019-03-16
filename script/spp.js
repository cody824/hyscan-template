(function(window) {
    var __bluetooth;
    var spp;

    var __sppUtil = {};

    __sppUtil.initAndDo = function(callback){
        spp = api.require('spputil');
        __sppUtil.init(function (bt) {
            if (bt.status == "poweredOn") {
                if (typeof callback === "function") {
                    callback();
                }
            } else {
                api.alert({
                    title : i18n.t('error', '错误'),
                    msg: blut.show.status,
                    buttons : [i18n.t('ok','确定')]
                });
            }
        })
    }

    __sppUtil.init = function(opts, callback) {
        spp = api.require('spputil');
        if (typeof opts == "function") {
            callback = opts;
        }

        __bluetooth = {};
        spp.init(function(ret) {
            __bluetooth.status = ret.status;
            __bluetooth.show = {};
            console.log("spp init: " + ret.status);
            switch (ret.status) {
                case 'poweredOn':
                    __bluetooth.show.status = i18n.t('bluetooth.status.poweredOn','蓝牙设备已开启');
                    break;
                case 'poweredOff':
                    __bluetooth.show.status = i18n.t('bluetooth.status.poweredOff','蓝牙设备未打开');
                    break;
                case 'resetting':
                    __bluetooth.show.status = i18n.t('bluetooth.status.resetting','正在重置');
                    break;
                case 'unauthorized':
                    __bluetooth.show.status = i18n.t('bluetooth.status.unauthorized','设备未授权');
                    break;
                case 'unknown':
                    __bluetooth.show.status = i18n.t('bluetooth.status.unknown','初始化中');
                    break;
                case 'unsupported':
                    __bluetooth.show.status = i18n.t('bluetooth.status.unsupported','没有可用蓝牙设备');
                    break;
                default:
                    break;
            }
            if (typeof callback === "function") {
                callback(__bluetooth);
            }
        });
    }

    /**
     * 扫描设备
     * @param autoStop 自动停止扫描时间 单位second
     */
    __sppUtil.scanDevice = function(autoStop, foundFunc) {
        console.log("Prepare to scan bluetooth");
        spp = api.require('spputil');
        spp.scan({}, function(ret, err) {
            if (ret.status == "BLUTTOOTH_DISABLED") {
                api.alert({
                    title : i18n.t('error','错误'),
                    msg : i18n.t('alert.msg.bluetoothDisabled','蓝牙未启用，请启用蓝牙设备'),
          					buttons : [i18n.t('ok','确定')]
                });
            } else if (ret.status == "FOUND") {
                console.log("Found device: " + ret.device);
                var device = JSON.parse(ret.device);
                if (typeof foundFunc == "function")
                    foundFunc(device);
            } else if (ret.status == "DISCOVERY_FINISHED") {
                console.log("Scan complete, found " + ret.devicesNum);
            } else if (ret.status == "DISCOVERY_STARTED") {
                console.log("Begin to scan");
            }
        });
        if (autoStop > 0)
            setTimeout(__sppUtil.stopScanDevice, 1000 * autoStop);
    }

    /**
     *停止扫描设备
     */
    __sppUtil.stopScanDevice = function() {
        console.log("Stop scan bluetooth");
        spp = api.require('spputil');
        spp.stopScan();
    }

    /**
     * 断开连接
     * @param address 设备地址
     * @param callback 回调
     */
    __sppUtil.disconnectDevice = function(address, callback) {
        spp = api.require('spputil');
        spp.disconnect({
            address: address
        }, function(ret) {
            if (typeof callback === "function") {
                callback(ret);
            }
        });
    }

    /**
     *连接设备
     * @param address 设备地址
     * @param callback 回调
     */
    __sppUtil.connectDevice = function(address, callback) {
        spp = api.require('spputil');
        spp.connect({
            address: address
        }, function(ret, err) {
            if (typeof callback == "function") {
                callback(ret, err);
            }
        });
    }

    /**
     * 设备是否连接
     * @param address 设备地址
     * @param callback 回调
     */
    __sppUtil.isConnected = function(address, callback) {
        spp = api.require('spputil');
        spp.isConnected({
            address: address
        }, function(ret, err) {
            if (typeof callback == "function") {
                callback(ret, err);
            }
        });
    }

    window.sppUtil = __sppUtil;
    window.spp = spp;
})(window);
