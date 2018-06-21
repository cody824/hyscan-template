(function(window) {
    
    window.initChartOption = function (showConfig, datas) {
        return  {
            grid: {
                left: 45,
                top: 40,
                right: 0,
                bottom: 40,
                borderWidth: 1
            },
            title: {

                text: showConfig.title, //i18n.t('term.dn', 'DN值'),
                textStyle: {
                    color: chartCss.title.textStyle.color,//title
                    align: 'left',
                },
                padding: 5,
                itemGap: 0
            },
            tooltip: {
                trigger: 'axis',
                formatter: showConfig.formatter,
            },
            xAxis: {
                data: DPTool.getXAxis(),
                name: i18n.t('term.wavelength', '波长') + '(nm)',
                nameLocation: 'middle',
                nameGap: '30',
                nameTextStyle: {
                    color: chartCss.xAxis.nameTextStyle.color
                },
                axisTick: {
                    lineStyle: {
                        color: chartCss.xAxis.axisTick.lineStyle.color
                    }
                },
                axisLine: {
                    show: false
                },
                axisLabel: {
                    color: chartCss.xAxis.axisLabel.color
                }
            },
            yAxis: {
                formatter: '{value}',
                axisLine: {
                    show: false
                },
                axisTick: false,
                axisLabel: {
                    color: chartCss.yAxis.axisLabel.color
                }
            },
            series: [{
                name: showConfig.title,
                type: 'line',
                lineStyle: {
                    normal: {
                        color: chartCss.series.lineStyle.normal.color
                    }
                },
                smooth: true,
                showSymbol: false,
                data: datas
            }]
        };
    }

})(window);
