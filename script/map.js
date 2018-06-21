(function(window) {
    var annotations = []; //标注列表
    var annotationId = 0; //标注ID
    var updateInterval = null; //更新间隔
    var inUpdate = false; //是否在更新
    var lastZoomLevel = $api.getStorage("lastZoomLevel") || 13;
    //比例尺，单位米(21级到3级)
    var SCALE = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 25000, 50000, 100000, 200000, 500000, 1000000, 2000000];

    window.updateTaskView = function(map, zoomLevel, tasks, force) {
        if (updateInterval != null) {
            clearInterval(updateInterval);
        }
        updateInterval = setInterval(function() {
            if (inUpdate)
                return;
            inUpdate = true;
            clearInterval(updateInterval);
            updateInterval = null;
            if (force || Math.abs(parseInt(lastZoomLevel) - parseInt(zoomLevel)) > 1) { //缩放大小变化超过1比例尺才有变化
                if (tasks != null)
                    updateAnnotations(map, zoomLevel, tasks);
            }
            lastZoomLevel = zoomLevel;
            inUpdate = false;
        }, 1000);
    }

    function updateAnnotations(map, zoomLevel, tasks) {
        var ids = [];
        for (var i = 0; i < annotations.length; i++) {
            ids.push(annotations[i].id);
        }
        map.removeAnnotations({
            ids: ids
        });
        lonLatTask = {};
        annotations = [];
        var annotationId = 0;
        tasks = tasks || [];
        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            if (!task.position)
                continue;
            var an = getAnnotation(task.position, zoomLevel);
            an.tasks.push(task);
        }
        for (var i = 0; i < annotations.length; i++) {
            var length = annotations[i].tasks.length;
            if (length < 10) {
                annotations[i].icon = 'widget://template/img/annotation/' + length + '.png';
            } else if (length >= 10 && length < 50) {
                annotations[i].icon = 'widget://template/img/annotation/10+.png';
            } else if (length >= 50 && length < 100) {
                annotations[i].icon = 'widget://template/img/annotation/50+.png';
            } else if (length >= 100) {
                annotations[i].icon = 'widget://template/img/annotation/100+.png';
            }
        }
        map.addAnnotations({
            annotations: annotations,
        }, function(ret) {
            if (ret.eventType == "click"){
                var annotation = getAnnotationById(ret.id);
                if (annotation.tasks.length == 1) {
                    console.log("mapTaskInfo");
                    api.openFrame({
                        name: 'mapTaskInfo',
                        url: 'widget://template/html/map/taskInfo.html',
                        rect: {
                            x: api.winWidth / 10,
                            y: api.frameHeight / 2 - 80,
                            w: api.winWidth/5 * 4,
                            h: 160
                        },
                        pageParam : {
                                annotation : annotation
                        },
                        bounces: false,
                        vScrollBarEnabled: false,
                        hScrollBarEnabled: false
                    });
                } else {
                    api.openFrame({
                        name: 'mapTaskList',
                        url: 'widget://template/html/map/taskList.html',
                        rect: {
                            x: api.winWidth / 10,
                            y: api.frameHeight / 2 - 80,
                            w: api.winWidth/5 * 4,
                            h: 100
                        },
                        pageParam : {
                                annotation : annotation
                        },
                        bounces: false,
                        vScrollBarEnabled: false,
                        hScrollBarEnabled: false
                    });
                }
            }
        });
        //updateBubble(map);
    };

    function updateBubble(map) {
        for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            var content = {};
            if (annotation.tasks.length == 1) {
                var task = annotation.tasks[0];
                //TODO
                content.title = "未检测结果";
                content.subTitle = "点我进行检测";
                if (task.result){
                    content.title = "检测结果";
                    content.subTitle = "<html>asdsd<br>asdasd</html>"
                }
                content.illus = task.imagePath;
            } else {
                var task = annotation.tasks[0];
                content.title = "此处共有" + annotation.tasks.length + "个数据";
                content.subTitle = "点我查看详情";
            }
            map.setBubble({
                id: annotation.id,
                content: content,
                styles: {
                    titleColor: '#000',
                    titleSize: 16,
                    subTitleColor: '#999',
                    subTitleSize: 12,
                    illusAlign: 'left'
                }
            }, function(ret) {
                if (ret) {
                    if (ret.eventType == "clickContent") {
                        var an = getAnnotationById(ret.id);
                        if (an.tasks.length > 1) {
                            gotoTask(an.tasks)
                        } else {
                            stTask.getTask(an.tasks[0].id, true, function(ret) {
                                console.log(JSON.stringify(task));
                                if (ret.status)
                                    gotoTaskInfo(ret.task, "main");
                            });
                        }
                    }
                }
            });
        }
    }

    function getAnnotation(point, zoomLevel) {
        var annotation = null;
        var minDis = 10000000;
        for (var i = 0; i < annotations.length; i++) {
            var an = annotations[i];
            var dis = getDistance(point, an);
            if (dis < minDis) {
                minDis = dis;
                annotation = an;
            }
        }
        var scale = SCALE[21 - parseInt(zoomLevel)];
        if (minDis > scale * 0.5) {
            annotation = null;
        }
        if (annotation == null) { //没找到标注点，新建标注点
            annotation = {
                id: annotationId++,
                lon: point.lon,
                lat: point.lat,
                tasks: []
            }
            annotations.push(annotation);
        }
        return annotation;
    }

    function isCloseEnough(point1, point2, zoomLevel){
        var dis = getDistance(point1, point2);
        console.log(dis);
        var scale = SCALE[21 - parseInt(zoomLevel)];
        if (dis < scale * 0.25) {
            return true;
        } else {
            return false;
        }
    }

    function getAnnotationById(id) {
        var annotation = null;
        for (var i = 0; i < annotations.length; i++) {
            var an = annotations[i];
            if (an.id == id) {
                annotation = an;
                break;
            }
        }
        return annotation;
    };


    /**
     * 地球半径
     */
    var EARTHRADIUS = 6370996.81;

    /**
     * 计算两点之间的距离,两点坐标必须为经纬度
     * @param {point1} Point 点对象
     * @param {point2} Point 点对象
     * @returns {Number} 两点之间距离，单位为米
     */
    function getDistance(point1, point2) {
        if (!point1 || !point2)
            return 0;
        point1.lon = _getLoop(point1.lon, -180, 180);
        point1.lat = _getRange(point1.lat, -74, 74);
        point2.lon = _getLoop(point2.lon, -180, 180);
        point2.lat = _getRange(point2.lat, -74, 74);
        var x1, x2, y1, y2;
        x1 = degreeToRad(point1.lon);
        y1 = degreeToRad(point1.lat);
        x2 = degreeToRad(point2.lon);
        y2 = degreeToRad(point2.lat);
        return EARTHRADIUS * Math.acos((Math.sin(y1) * Math.sin(y2) + Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1)));;
    };

    /**
     * 将度转化为弧度
     * @param {degree} Number 度
     * @returns {Number} 弧度
     */
    function degreeToRad(degree) {
        return Math.PI * degree / 180;
    }

    /**
     * 将v值限定在a,b之间，纬度使用
     */
    function _getRange(v, a, b) {
        if (a != null) {
            v = Math.max(v, a);
        }
        if (b != null) {
            v = Math.min(v, b);
        }
        return v;
    }


    /**
     * 将v值限定在a,b之间，经度使用
     */
    function _getLoop(v, a, b) {
        while (v > b) {
            v -= b - a
        }
        while (v < a) {
            v += b - a
        }
        return v;
    }

})(window);
