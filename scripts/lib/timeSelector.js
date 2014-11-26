define(['jquery', 'calendar'], function($, calendar) {
    function buildTimer(value, type) {
        switch (type) {
            case 3:
                return buildMonthSelector(value);
                break;
            default:
                return buildTimeSelector(value);
                break;
        }
    }

    function buildTimeSelector(value) {         //生成日期控件
        var tpl = "<div class='gs-tool-item'>选择时间：" +
            "<input name='StartT' readonly type='text'> " +
            "-<input name='EndT' readonly type='text'>";
        var $timer = $(tpl);
        var input = $timer.find("input");
        if(value instanceof Array) {
            input.eq(0).val(value[0] || "");
            input.eq(1).val(value[1] || "");
        }
        input.on("click", function(e) {
            calendar.target(e);
        });
        return $timer;
    }

    function buildMonthSelector(value) {        //生成月份控件
        var tpl = "<div class='gs-tool-item'>选择时间：" +
            "<input name='month' readonly type='text'>";
        var $timer = $(tpl);
        var input = $timer.find("input");
        if(value instanceof Array) {
            input.eq(0).val(value || "");
        }
        input.on("click", function(e) {
            calendar.target(e, 3);
        });
        return $timer;
    }

    return buildTimer;
});