define(['jquery'], function($) {
    function Verify() {
        this.tip = null;        //提示标记
        this.inner = null;      //
        this.msg = "";          //提示信息
        this.formObj = null;    //表单元素
        this.cells = [];        //需要验证的元素
        this.setting = {};
        this.timerTip = null;   //标记计时器
        this.delay = 1000;
        this.showSuccess = true;
        this.customChk = null;  //自定义验证方法
    }

    Verify.prototype = {
        showTips: function(obj, msg) {
            obj.focus();
            if(!this.tip){      //如果提示元素不存在则创建并插入页面
                this.tip = $("<div></div>").addClass("ver-tooltip");
                this.inner = $("<div></div>").addClass("ver-tooltip-inner");
                this.tip.append(this.inner);
                $("body").prepend(this.tip);
            }
            clearTimeout(this.timerTip);
            var self = this;
            var t = obj.offset().top - 30;
            var l = obj.offset().left + obj.width() - 20;
            this.tip.css({top:t,left:l});
            this.inner.html(msg || this.msg);
            this.tip.show();
            this.msg = "";
            this.timerTip = setTimeout(function(){self.hideTips()}, self.delay);
        },
        hideTips: function() {
            clearTimeout(this.timerTip);
            if(this.tip){
                this.tip.fadeOut();
            }
        },
        init: function(option) {
            option = option || {};
            this.cells = [];
            var _this = this;
            var setting = null;
            if(!this.tip){
                this.tip = $("<div></div>").addClass("ver-tooltip");
                this.inner = $("<div></div>").addClass("ver-tooltip-inner");
                this.tip.append(this.inner);
                $("body").prepend(this.tip);
            }
            if(option.form) {
                this.formObj = $(option.form);
                var inputs = this.formObj.find(":input");
                var settingAttr = this.formObj.attr("ver-mode");
                if(settingAttr) {
                    settingAttr = eval("("+settingAttr+")");
                }
                if(option.delay) {
                    this.delay = option.delay;
                }
                if(option.setting || settingAttr) {
                    setting = option.setting ? option.setting : settingAttr;
                }
                if(setting){
                    this.setting = setting;
                }
                if(this.setting.auto === undefined) {
                    this.setting.auto = false;
                }
                if(this.setting.trim === undefined) {
                    this.setting.trim = true;
                }
                for(var i = 0; i < inputs.length; i++) {
                    var mode = inputs.eq(i).attr("ver-mode");
                    if(mode || mode == "") {
                        var inputName = inputs.eq(i).attr("name");
                        var inputSettingAttr = null;
                        var inputSetting = null;
                        if(mode) {
                            inputSettingAttr = eval("("+mode+")");
                        }
                        if(option[inputName] || inputSettingAttr) {
                            inputSetting = option[inputName] ? option[inputName] : inputSettingAttr;
                        }
                        if(inputSetting) {
                            if(inputSetting.auto === undefined) {
                                inputSetting.auto = this.setting.auto;
                            }
                            if(inputSetting.trim === undefined) {
                                inputSetting.trim = this.setting.trim;
                            }
                            var cell = new Cell(inputs.eq(i), inputSetting, this);
                            this.cells.push(cell);
                        }
                    }
                }
                this.formObj.submit(function() {
                    return(_this.chkForm());
                });
            }
            if(option.customChk) {
                this.customChk = option.customChk;
            }
        },
        chkForm: function(){
            var cells = this.cells;
            this.showSuccess = false;
            for(var i = 0; i<cells.length; i++) {
                var cell = cells[i];
                if(!cell.check()) {
                    this.showSuccess = true;
                    return false;
                }
            }
            if(typeof (this.customChk) == "function" && (!this.customChk())) {
                return false;
            }
            this.showSuccess = true;
            return true;
        }
    };

    function Cell(obj, setting, parent) {
        this.parentObj = parent;
        this.cellObj = obj;
        this.cellName = obj.attr("name");
        this.setting = setting;
        if(this.setting.auto) {
            var self = this;
            this.cellObj.bind(this.setting.auto, function() {
                self.check();
            })
        }
        this.minLength = function(num) {
            var numOfChar = this.cellObj.val().length;
            if(numOfChar !=0 && numOfChar < num) {
                return "内容长度必须大于"+num;
            }
            return "";
        };
        this.maxLength = function(num) {
            var numOfChar = this.cellObj.val().length;
            if(numOfChar !=0 && numOfChar > num) {
                return "内容长度必须小于"+num;
            }
            return "";
        };
        this.chkLength = function(num) {
            var numOfChar = this.cellObj.val().length;
            if(numOfChar !=0 && numOfChar != num) {
                return "内容长度必须为"+num;
            }
            return "";
        };
        this.match = function(regex){
            if(this.cellObj.val() != "" && (!regex.test(this.cellObj.val()))){
                return "格式不匹配！";
            }
            return "";
        };
        this.isNum = function() {
            var regex = /^[0-9]+$/;
            var num = this.cellObj.val();
            if(num != "" && (!regex.test(num) || (num.length > 1 && num.charAt(0) == "0"))){
                return "必须为数字！";
            }
            return "";
        };
        this.matchTarget = function(targetName){
            var targetCell;
            for(var i = 0; i < this.parentObj.cells.length; i++) {
                var cell = this.parentObj.cells[i];
                if(cell.cellName == targetName) {
                    targetCell = cell;
                    break;
                }
            }
            if(targetCell&&(this.cellObj.val() != targetCell.cellObj.val())) {
                return "两次输入不一致！";
            }
            return "";
        };
    }

    Cell.prototype = {
        check: function() {
            var setting = this.setting;
            var chkFlag = true;
            var msg,num,value;
            if(setting.trim) {
                value = $.trim(this.cellObj.val());
                this.cellObj.val(value);
            }
            if(setting.notEmpty&&chkFlag) {
                msg = this.notEmpty(this.cellName);
                if(msg){
                    this.showTips(msg);
                    chkFlag = false;
                }
            }
            if(this.cellObj.val() != "") {
                if(setting.pattern&&chkFlag) {
                    var regex = eval(setting.pattern);
                    msg = this.match(regex);
                    if(msg){
                        this.showTips(msg);
                        chkFlag = false;
                    }
                }
                if(setting.isNum&&chkFlag) {
                    msg = this.isNum();
                    if(msg){
                        this.showTips(msg);
                        chkFlag = false;
                    }
                }
                if(setting.numOfChar&&chkFlag) {
                    num = setting.numOfChar;
                    msg = this.chkLength(num);
                    if(msg){
                        this.showTips(msg);
                        chkFlag = false;
                    }
                }
                if(setting.minLength&&chkFlag) {
                    num = setting.minLength;
                    msg = this.minLength(num);
                    if(msg){
                        this.showTips(msg);
                        chkFlag = false;
                    }
                }
                if(setting.maxLength&&chkFlag) {
                    num = setting.maxLength;
                    msg = this.maxLength(num);
                    if(msg){
                        this.showTips(msg);
                        chkFlag = false;
                    }
                }
                if(setting.repeatFor&&chkFlag) {
                    var targetName = setting.repeatFor;
                    msg = this.matchTarget(targetName);
                    if(msg){
                        this.showTips(msg);
                        chkFlag = false;
                    }
                }
            }
            return chkFlag;
        },
        showTips: function(msg){
            this.parentObj.msg = msg;
            this.parentObj.showTips(this.cellObj);
        },
        notEmpty: function(cellName){
            if(this.cellObj.attr("type") == "checkbox" || this.cellObj.attr("type") == "radio") {
                var val = $("input[name="+cellName+"]:checked").val();
                if(!val) {
                    return "至少选择一项";
                }
            }else{
                if(this.cellObj[0].value == ""){
                    return "不可为空！";
                }
            }
            return "";
        }
    };

    return Verify;
});