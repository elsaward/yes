define(['jquery'], function($) {
    function WinBox(boxObj,index) {
        this.targetObj = null;      //上一层窗体
        this.boxObj = boxObj;       //自身窗体
        this.index = index;         //层级
        this.submitObj = this.boxObj.find("[jsW-submit]");  //提交按钮对象
        this.cancelObj = this.boxObj.find("[jsW-cancel]");  //取消按钮对象
        this.resetObj = this.boxObj.find("[jsW-reset]");    //重置按钮对象
        this.submit = null;         //提交方法
        this.reset = null;          //重置方法
        this.sourceObj = null;      //打开窗体的源元素
        this.beforeOpen = null;     //打开前方法
        this.autoClose = true;      //是否自动关闭
        this.init();
    }

    WinBox.prototype = {
        init: function() {
            var _this = this;
            _this.boxObj.css({zIndex: this.index*10});      //根据层级设置z-index
            _this.submitObj.click(function(e) {             //提交按钮绑定提交方法
                e = e || window.event;
                if($(this).hasClass("gs-disabled-button")) {    //禁用状态不执行提交方法
                    return false;
                }
                if(_this.submit && typeof(_this.submit) == "function") {
                    _this.submit(e);
                    if(_this.autoClose) {
                        _this.close();
                    }
                }
                return false;
            });
            _this.cancelObj.click(function(e) {     //取消按钮绑定取消方法
                e = e || window.event;
                _this.close(e);
                return false;
            });
            _this.resetObj.click(function(e) {      //重置按钮绑定重置方法
                e = e || window.event;
                _this.recover(e);
                return false;
            });
            _this.boxObj.find("[jsW-open]").each(function() {       //打开下一级窗体的源元素
                $(this).click(function() {
                    _this.openSub($(this).attr("jsW-open"),$(this));
                    return false;
                });
            });
            var title = _this.boxObj.find(".gs-modal-title");       //窗体标题
            if(title.length) {
                title[0].onmousedown = function(e) {                //窗体拖曳
                    var dialogObj = _this.boxObj.children(".gs-modal-dialog")[0];
                    _this.drag(dialogObj, e);
                }
            }
        },
        open: function(target, source) {
            this.targetObj = target;
            this.sourceObj = source;
            if(this.beforeOpen && typeof(this.beforeOpen == "function")) {
                //如果打开前方法返回false，则终止窗体打开
                if(this.beforeOpen() === false) return false;
            }
            var dialogObj = this.boxObj.children(".gs-modal-dialog");
            var t = 10*this.index;
            var l = ($(document).width() - dialogObj.width()) / 2;
            this.boxObj.addClass("gs-box-mask");
            dialogObj.css({marginLeft: l, marginTop: t});
            this.boxObj.addClass("gs-open");
        },
        close: function() {
            this.recover();
            this.boxObj.removeClass("gs-open");
        },
        openSub: function(boxId,source) {
            var box = jswindow.boxes[boxId];
            if(box.index == this.index) {
                this.close();
                jswindow.boxes[boxId].open(this.targetObj,source);
            }else{
                jswindow.boxes[boxId].open(this.boxObj,source);
            }
        },
        recover: function() {
            var form = this.boxObj.find("form");
            var hid = this.boxObj.find("[type='hidden']");
            form.each(function() {      //窗体内所有form reset
                $(this)[0].reset();
            });
            hid.each(function() {       //窗体内所有hidden元素清空
                $(this).val("");
            });
            if(this.reset && typeof(this.reset) == "function") {    //自定义重置方法
                this.reset();
            }
        },
        drag: function(obj, e) {        //拖曳方法
            e = e || window.event;
            var _x = e.offsetX || e.layerX;
            var _y = e.offsetY || e.layerY;
            var maxLeft = document.body.clientWidth - obj.clientWidth;
            document.onmousemove = function(e){
                e = e || window.event;
                var left = e.clientX - _x,
                    top = e.clientY - _y;
                if(left < 0) {
                    left = 0;
                } else if (left > maxLeft) {
                    left = maxLeft;
                }
                if(top < 0) {
                    top = 0;
                }
                obj.style.marginLeft = left + 'px';
                obj.style.marginTop = top + 'px';
                obj.style.cursor="move";
            };
            document.onmouseup = function(e){
                document.onmousemove = null;
                obj.style.cursor="default";
            };
        }
    };

    var jswindow = {
        currentIndex: [],       //当前已打开的窗体层级（同一层级不同时开两个）
        init: function(){       //初始化页面上所有窗体
            var boxes = {};
            var boxObj = $("[jsW-index]");
            boxObj.each(function(){
                boxes[$(this).attr("id")] = new WinBox($(this), $(this).attr("jsW-index"));
            });
            this.boxes = boxes;
            return this.boxes;
        },
        open: function(box, targetId){
            box.open($(targetId));
        },
        close: function(box) {
            box.close();
        },
        push: function(boxId) { //手动增加一个窗体
            var box = $("#"+boxId);
            if(box.length != 0) {
                this.boxes[boxId] = new WinBox(box, box.attr("jsW-index"));
            }
            return this.boxes[boxId];
        }
    };

    return jswindow;
});