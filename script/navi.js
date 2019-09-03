(function(window) {

    window.gotoMain = function() {
        api.closeToWin({
            name: 'main'
        });
    }

    window.backToTask = function(tasks, isCloud){
        api.closeToWin({
            name: 'tasks'
        });
    }

    window.gotoMe = function(){
      api.openWin({
          name: 'me',
          url: 'widget://template/html/selfinfo.html'
      });
    }

    window.gotoTask = function(tasks, isCloud){
        api.openWin({
            bounces : true,
            allowEdit : true,
            reload : true,
            name: 'tasks',
            url: 'widget://template/html/tasks.html',
            pageParam: {
                tasks : tasks,
                isCloud : isCloud
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

    window.gotoInputResult = function(task){
        api.openWin({
            name: 'inputResult',
            url: 'widget://template/html/custom-result.html',
            pageParam: {
                task : task,
            }
        });
    }

    window.gotoRevise = function(){
        api.openWin({
            name: 'revise',
            url: 'widget://template/html/revise.html'
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

    window.gotoTaskInfo = function(task, back, isCloud, tasks) {
        api.openWin({
            reload : true,
            name: 'taskInfo',
            url: 'widget://template/html/taskInfo.html',
            pageParam: {
                task: task,
                back : back,
                isCloud : isCloud,
                tasks : tasks
            }
        });
    }

    window.gotoModifyPassword = function() {
        api.openWin({
            reload : true,
            name: 'modifyPsd',
            url: 'widget://template/html/modifyPsd.html'
        });
    }

    window.gotoBack = function(){
        api.historyBack(function(ret, err) {
            if (!ret.status) {
                api.closeWin();
            }
        });
    }

})(window);
