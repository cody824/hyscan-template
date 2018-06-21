(function(window) {

    window.gotoMain = function() {
        api.openDrawerLayout({
            name: 'main',
            url: 'widget://template/html/main.html',
            animation: {
                type: "curl", //动画类型（详见动画类型常量）
                subType: "from_left", //动画子类型（详见动画子类型常量）
                duration: 300 //动画过渡时间，默认300毫秒
            },
            progress: {
                title : i18n.t('loading','加载中'),
                text: "……",
            },
            leftPane: {
                edge: api.winWidth * 0.4,
                name: 'slider',
                url: 'widget://template/html/slider.html'
            }
        });
    }

    window.gotoMe = function(){
      api.openWin({
        reload : true,
          name: 'me',
          url: 'widget://template/html/selfinfo.html'
      });
    }

    window.gotoTask = function(tasks){
        api.openWin({
            bounces : true,
            allowEdit : true,
            reload : true,
            name: 'tasks',
            url: 'widget://template/html/tasks.html',
            pageParam: {
                tasks : tasks
            }
        });
    }

    window.beginCollect = function(){
        api.openWin({
            reload : true,
            name: 'collect',
            url: 'widget://template/html/collect.html'
        });
    }

    window.gotoScanDevice = function(){
        api.openWin({
            name: 'connect',
            url: 'widget://template/html/connect.html'
        });
    }

    window.gotoRevise = function(){
        prepareCollect(function () {
            api.openWin({
                reload : true,
                name: 'revise',
                url: 'widget://template/html/revise.html'
            });
        });
    }

    window.gotoResult = function(finallyData, datas, labels) {
        api.openWin({
            reload : true,
            name: "result",
            url: 'widget://template/html/result.html',
            pageParam: {
                finallyData : finallyData,
                datas: datas,
                labels: labels
            }
        });

  	}

    window.gotoTaskInfo = function(task, back) {
  		api.openWin({
            reload : true,
  			name: 'taskInfo',
  			url: 'widget://template/html/taskInfo.html',
  			pageParam: {
  				task: task,
                back : back
  			}
  		});
  	}

    window.gotoBack = function(){
        api.historyBack(function(ret, err) {
            if (!ret.status) {
                if (appConfig.device) {
                    sppUtil.disconnectDevice(appConfig.device.address);
                }
                api.closeWin();
            }
        });
    }

})(window);
