define(['jquery', 'common'], function($, common) {

    //回车控制
    function EnterControl(obj,option) {
        /*
            option
                targetBtn: 回车替代的按钮
                func: 回车替代的方法
         */
        this.obj = obj;
        if(option){
            this.option = eval("("+option+")");
        }
        this.init();
    }

    EnterControl.prototype = {
        init: function() {  //初始化
            var _this = this;
            _this.obj.keydown(function(e){
                if(e.which == 13) {
                    common.stopDefault(e);
                    _this.operate();
                    return false;
                }
            });
        },
        operate: function() {
            var self = this;
            if(!self.option) {
                self.obj.parents("form").submit();
            }else{
                if(self.option["targetBtn"]) {
                    $(self.option["targetBtn"]).click();
                }else if(self.option["func"] && typeof(self.option["func"]) == "function") {
                    self.option["func"]();
                }else{
                    self.obj.parents("form").submit();
                }
            }
        }
    };

    $("[enter-control]").each(function() {
        var item = $(this);
        var option = $(this).attr("enter-control");
        if(item.is("form")) {
            item.find(":input").each(function() {
                var input = $(this);
                if(!input.attr("enter-control")) {
                    new EnterControl($(this),option);
                }
            })
        }else{
            new EnterControl(item, option);
        }
    });
});

