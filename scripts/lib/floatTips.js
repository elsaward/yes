define(['jquery'], function ($) {
    var tips;

    //距离鼠标的偏移量
    var _xOffset = 10;
    var _yOffset = 5;

    var floatTips = {
        show: function(event, content) {
            event = event || window.event;
            tips.innerHTML = content;
            setPosition(event);
            tips.style.visibility = "visible";
        },
        hide: function() {
            tips.innerHTML = "";
            tips.style.visibility = "hidden";
            tips.style.top = null;
            tips.style.left = null;
        }
    };

    //创建元素
    function initTips() {
        tips = document.getElementById("floatTips");
        if(tips == null) {
            tips = document.createElement("div");
            tips.id = "floatTips";
            tips.className = "float-tips";
            document.body.appendChild(tips);
        }
    }

    //根据鼠标位置设置位置
    function setPosition(event) {
        event = event || window.event;
        var _x = event.clientX || event.offsetX || event.layerX;
        var _y = event.clientY || event.offsetY || event.layerY;
        var clientWidth = window.innerWidth;
        var clientHeight = window.innerHeight;
        var tipsWidth = tips.clientWidth;
        var tipsHeight = tips.clientHeight;
        var xOffset = _x;
        var yOffset = _y;
        if(xOffset + tipsWidth < clientWidth) tips.style.left = xOffset + _xOffset + "px";
        else tips.style.left = xOffset - _xOffset - tipsWidth + "px";
        if(yOffset + tipsHeight < clientHeight) tips.style.top = yOffset + _yOffset + "px";
        else tips.style.top = yOffset - _yOffset - tipsHeight + "px";
    }

    initTips();

    //绑定事件
    $("[data-tips]").on("mouseover", function(e) {
        floatTips.show(e, $(this).data("tips"));
    }).on("mouseout", function(e) {
        floatTips.hide();
    });

    return floatTips;
});