define(['jquery'], function ($) {
    $.ajaxSetup({
        type: "post",
        timeout: 240000,
        beforeSend: function () {
            showLoading();
        },
        complete: function () {
            closeLoading();
        },
        error: function (req) {
            alert("连接超时");
        }
    });

    $.fn.extend({
        //定义鼠标右键方法，接收一个函数参数
        "rightclick": function (func) {
            //调用这个方法后将禁止系统的右键菜单
            $(this).on('contextmenu', function (e) {
                return false;
            });
            //为这个对象绑定鼠标释放事件
            $(this).mouseup(function (e) {
                //如果按下的是右键，则执行函数
                if (3 == e.which) {
                    func(e, $(this));
                }
            });
        }
    });

    //checbox同组全选
    $.fn.selAll = function (name, selector) {
        var self = $(this);
        var selectStr = "";
        var flag = true;
        switch (selector) {
            case "class":
                selectStr = '.' + name;
                break;
            case "data":
                selectStr = '[data-sel=' + name + ']';
                break;
            case "name":
            case undefined:
            default :
                selectStr = '[name=' + name + ']';
                break;
        }
        var targets = $(selectStr);
        self.on("change", function () {
            if(!flag) {
                flag = true;
                return false;
            }
            flag = false;
            var i, len = targets.length;
            if (self.is(':checked')) {
                for (i = 0; i < len; i++) {
                    targets.eq(i)[0].checked = true;
                    targets.eq(i).change();
                }
            } else {
                for (i = 0; i < len; i++) {
                    targets.eq(i)[0].checked = false;
                    targets.eq(i).change();
                }
            }
            flag = true;
        });

        targets.on("change", function () {
            if(!flag) {
                flag = true;
                return false;
            }
            flag = false;
            if (!$(this).is(":checked")) {
                self[0].checked = false;
                self.change();
            } else {
                for (var i = 0; i < targets.length; i++) {
                    if (targets.eq(i).is(":checked")) {
                        continue;
                    }
                    flag = true;
                    return;
                }
                self[0].checked = true;
                self.change();
            }
            flag = true;
        });
    };

    //同组全选，只要有一个选中就勾选
    $.fn.selLeast = function (name, selector) {
        var self = $(this);
        var selectStr = "";
        var flag = true;
        switch (selector) {
            case "class":
                selectStr = '.' + name;
                break;
            case "data":
                selectStr = '[data-sel=' + name + ']';
                break;
            case "name":
            case undefined:
            default :
                selectStr = '[name=' + name + ']';
                break;
        }
        var targets = $(selectStr);
        self.on("change", function () {
            if(!flag) {
                flag = true;
                return false;
            }
            flag = false;
            var i, len = targets.length;
            if (self.is(':checked')) {
                for (i = 0; i < len; i++) {
                    targets.eq(i)[0].checked = true;
                    targets.eq(i).change();
                }
            } else {
                for (i = 0; i < len; i++) {
                    targets.eq(i)[0].checked = false;
                    targets.eq(i).change();
                }
            }
            flag = true;
        });

        targets.on("change", function () {
            if(!flag) {
                flag = true;
                return false;
            }
            flag = false;
            if ($(this).is(":checked")) {
                self[0].checked = true;
                self.change();
            } else {
                for (var i = 0; i < targets.length; i++) {
                    if (!targets.eq(i).is(":checked")) {
                        continue;
                    }
                    flag = true;
                    return;
                }
                self[0].checked = false;
                self.change();
            }
            flag = true;
        });

    };

    $.fn.setTimeInput = function() {
        var _self = this;
        _self.on("focus", function(e) {
            _self.attr("data-code", "0");
            if(_self.val() == "") {
                _self.val("--:--");
            }
        }).on("keydown", function(e) {
            if(e.keyCode == 8) {
                setInput();
                stopDefault(e);
            }
        }).on("keypress", function(e) {
            var arr = _self.val().split("");
            var index = _self.attr("data-code");
            var char = parseInt(String.fromCharCode(e.which));
            if(!isNaN(char) && index < 5) {
                arr[index++] = char;
                if(index == "2") {
                    index++;
                    if(parseInt(arr[0] + arr[1]) > 23) {
                        arr[0] = "2";
                        arr[1] = "3";
                    }
                } else if(index == "5") {
                    if(parseInt(arr[3] + arr[4]) > 59) {
                        arr[3] = "5";
                        arr[4] = "9";
                    }
                }
                _self.val(arr.join(""));
                if(index > 2) {
                    _self[0].selectionStart = 3;
                    _self[0].selectionEnd = 5;
                } else {
                    _self[0].selectionStart = 0;
                    _self[0].selectionEnd = 2;
                }
                _self.attr("data-code", index);
            }
            stopDefault(e);
        });

        function setInput() {
            _self.val("--:--");
            _self.attr("data-code", "0");
        }
    };

    //加载下拉框
    $.selectListLoad = function (option) {
        /*
         * selectObj     下拉框
         * url           ajax参数
         * type          post/get
         * data          ajax参数
         * htmlName      html的字段名
         * valueName     value的字段名
         * initialValue   初始默认选择
         * presentData   现成数据
         * callback      回调方法
         * titleName     列表第一项
         *
         * */
        var obj = option["selectObj"], str, item, i, len;
        $.clearDomElement(obj);     //清空下拉框

        var firstItem = option["titleName"];

        if (firstItem != undefined) {
            if(firstItem instanceof Array && firstItem.length == 2) {
                $(obj).append("<option value='" + firstItem[0] + "'>" + firstItem[1] + "</option>");
            } else if(typeof firstItem == "string") {
                $(obj).append("<option value=''>" + firstItem + "</option>");
            }
        }

        if (option["presentData"] == undefined) {       //现有数据
            var searchOption = {
                url: option["url"],
                type: option["type"] || "post",
                data: option["data"],
                success: function (data, textStatus) {
                    if (!chkResponse(data)) return false;
                    var item, i, len;
                    str = "";
                    if(!data["InfoList"]) return false;
                    for (i = 0, len = data["InfoList"].length; i < len; i++) {
                        item = data["InfoList"][i];
                        str += "<option";
                        if (option["valueName"]) {
                            str += " value=" + item[option["valueName"]];
                        }
                        if (typeof (option["htmlName"]) == "function") {
                            str += ">" + option["htmlName"](item) + "</option>";
                        } else if (option["htmlName"] == undefined) {
                            str += "></option>";
                        } else {
                            str += ">" + item[option["htmlName"]] + "</option>";
                        }
                    }
                    $(obj).append(str);
                    if (option["initialValue"]) {
                        $(obj).val(option["initialValue"]);
                    }
                    if (typeof option["callback"] == "function") {
                        option["callback"](data["InfoList"], option["selectObj"]);
                    }
                }
            };
            $.ajax(searchOption);
        } else {        //请求数据
            str = "";
            for (i = 0, len = option["presentData"].length; i < len; i++) {
                item = option["presentData"][i];
                str += "<option";
                if (option["valueName"]) {
                    str += " value=" + item[option["valueName"]];
                }
                if (typeof (option["htmlName"]) == "function") {
                    str += ">" + option["htmlName"](item) + "</option>";
                } else if (option["htmlName"] == undefined) {
                    str += "></option>";
                } else {
                    str += ">" + item[option["htmlName"]] + "</option>";
                }
            }
            $(obj).append(str);
            if (option["initialValue"]) {
                $(obj).val(option["initialValue"]);
            }
        }

    };

    //清空DOM
    $.clearDomElement = function (obj) {
        $("*", obj).each(function () {
            $.event.remove(this);
            $.removeData(this);
        });
        $(obj).html("");
    };

    //即时编辑
    $.fn.ajaxEdit = function (options, callback) {
        var elements = this;
        var settings = {
            width: 0,
            height: 0,
            tagName: "<input>",
            url: ""
        };

        if (options) {
            $.extend(settings, options);
        }

        elements.each(function () {
            var $this = $(this);
            var $input = $(settings.tagName).attr("name", $this.data("edit")).data("id", $this.data("id"));
            if (settings.tagName == "textarea") {
                $input.html($this.html());
            } else {
                $input.val($this.html());
            }
            if (settings.width) {
                $input.width(settings.width);
            }
            if (settings.height) {
                $input.height(settings.height);
            }
            $this.after($input);
            $input.hide();
            $this.click(function () {
                $input.show().focus();
                $input.attr("data-original", $input[0].value);
                $this.hide();
            });
            $input.blur(function () {
                if (settings.pattern && !settings.pattern.test($input.val())) {
                    alert("格式不匹配");
                    $input.focus();
                    return false;
                }
                if (settings.url) {
                    $input.ajaxEditSubmit(settings.url, callback);
                }
            });
            $input.keydown(function (e) {
                if (e.which == 13) {
                    $input.blur();
                }
            })
        });
        return this;
    };
    $.fn.ajaxEditSubmit = function (url, callback) {
        var $this = this;
        var data = {};
        var param = $this.attr("name");
        var $text = $this.prev();
        data[param] = $this.val() || $this.html();
        var idData = eval("(" + $this.data("id") + ")");
        if(typeof idData == "object") {
            $.extend(data, idData);
        } else {
            $.extend(data, {id: idData});
        }
        $.extend(data, eval("(" + $this.data("id") + ")"));
        var ajaxOption = {
            url: url,
            data: data,
            success: function (res) {
                if (!chkResponse(res)) return false;
                if (res["Result"]) {
                    $text.addClass("gs-text-danger").addClass("gs-text-bold");
                    if (typeof callback == "function") {
                        callback($text);
                    }
                    $text.html($this[0].value);
                }
            },
            error: function (req) {
                alert("连接超时");
                $this[0].value = $this.data("original");
            }
        };
        if (data[param] != this.attr("data-original")) {
            $.ajax(ajaxOption);
        }
        $this.hide();
        $text.show();
        return this;
    };

    // init code
    $("[data-init]").each(function () {
        if ($(this).data("init") != undefined) $(this).val($(this).data("init"));
    });

    $("[data-selAll]").each(function () {
        $(this).selAll($(this).data("selAll"));
    });

    $("[data-type='timerSetter']").each(function () {
        $(this).setTimeInput();
    });

    $(".check-box").each(function(i) {
        var item = $(this);
        var name = item.data("name");
        var checkbox = item.find("input");
        checkbox.attr("name", name).attr("id", "check-"+i);
        if(checkbox[0].checked) {
            item.addClass("checked");
        } else {
            item.removeClass("checked");
        }
        checkbox.on("change", function() {
            if(this.checked) {
                item.addClass("checked");
            } else {
                item.removeClass("checked");
            }
        });
        item.attr("for", "check-"+i);
        item.append(checkbox);
    });

    //向父框架发送数据
    $(".get-top-note").on("click", function(e) {
        var userCode = this.innerHTML || this.value;
        if(!userCode) return false;
        window.top.postMessage("note,"+userCode, '*');
        stopDefault(e);
    });

    //本地存储
    var UserData = {
        userData : null,
        name : location.hostname,
        isIE : !window.localStorage,
        init : function(){
            if (UserData.isIE && !UserData.userData) {
                try {
                    UserData.userData = document.createElement('INPUT');
                    UserData.userData.type = "hidden";
                    UserData.userData.style.display = "none";
                    UserData.userData.addBehavior ("#default#userData");
                    document.body.appendChild(UserData.userData);
                    var expires = new Date();
                    expires.setDate(expires.getDate()+365);
                    UserData.userData.expires = expires.toUTCString();
                } catch(e) {
                    return false;
                }
            }
            return true;
        },
        setItem : function(key, value) {
            if(UserData.init()){
                if(UserData.isIE) {
                    UserData.userData.load(UserData.name);
                    UserData.userData.setAttribute(key, value);
                    UserData.userData.save(UserData.name);
                } else {
                    localStorage.setItem(key, value);
                }
            }
        },
        getItem : function(key) {
            if(UserData.init()){
                if(UserData.isIE) {
                    UserData.userData.load(UserData.name);
                    return UserData.userData.getAttribute(key);
                } else {
                    return localStorage.getItem(key);
                }
            }
            return null;
        },
        existItem : function(key) {
            if(UserData.init()) {
                return !(UserData.getItem(key) == undefined || UserData.getItem(key) == null);
            }
            return false;
        },
        removeItem : function(key) {
            if(UserData.init()){
                if(UserData.isIE) {
                    UserData.userData.load(UserData.name);
                    UserData.userData.removeAttribute(key);
                    UserData.userData.save(UserData.name);
                } else {
                    localStorage.removeItem(key);
                }

            }
        }
    };

    //权限验证
    function chkResponse(res) {
        if (res == "") {
            return false;
        }
        if (typeof res != "object") {
            try{
                res = $.parseJSON(res);
            } catch (e) {
                return false;
            }
        }
        switch (res["Code"]) {
            case 10:
                return true;
                break;
            default:
                alert(res["Description"]);
                if(res["RedirectUrl"]) {
                    top.location.href = res["RedirectUrl"];
                }
                return false;
                break;
        }
    }

    function stopDefault(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            window.event.returnValue = false;
        }
    }

    //获取URL参数值
    function getUrlParameter(name, url) {
        var tempUrl = url != null ? url : location.href;
        tempUrl = tempUrl.replace("#", "");
        var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
        if (reg.test(tempUrl)) return decodeURIComponent(RegExp.$2.replace(/\+/g, " "));
        return "";
    }

    //设置URL参数
    function setUrlParameter(name, value, url) {
        var tempUrl = url != null ? url : location.href, tempParam;
        tempUrl = tempUrl.replace("#", "");
        var reg = new RegExp("(^|\\?|&)(" + name + "=[^&]*)(\\s|&|$)", "i");
        if (reg.test(tempUrl)) tempParam = RegExp.$2.replace(/\+/g, " ");
        tempUrl = tempUrl.replace(tempParam, name + "=" + value);
        return tempUrl;
    }

    function url2Obj(url) {
        var obj = {};
        var tmpUrl = url || location.href;
        var reg = new RegExp("[\\?|&]([^#&]*)=([^#&]*)", "g");
        var execArr = [], results, i, len, param;
        while (true) {
            results = reg.exec(tmpUrl);
            if (results == null) break;
            execArr.push(results);
        }
        if (execArr.length == 0) {
            return false;
        }
        for (i = 0, len = execArr.length; i < len; i++) {
            param = execArr[i];
            obj[param[1]] = decodeURIComponent(param[2]);
        }
        return obj;
    }

    function url2Arr(url) {
        var arr = [[], []];
        var tmpUrl = url || location.href;
        var reg = new RegExp("[\\?|&]([^#&]*)=([^#&]*)", "g");
        var execArr = [], results, i, len, param;
        while (true) {
            results = reg.exec(tmpUrl);
            if (results == null) break;
            execArr.push(results);
        }
        if (execArr.length == 0) {
            return false;
        }
        for (i = 0, len = execArr.length; i < len; i++) {
            param = execArr[i];
            arr[0].push(param[1]);
            arr[1].push(param[2]);
        }
        return arr;
    }

    //弹窗
    function showModal(dialogStr, pattern, type) {
        if (type == "1") {
            dialogStr.replace(/(\r\n)|\n/g, "<br>");
        }
        var modalObj = $("#gs-modal", top.document);
        if (modalObj.length == 0) {
            var modalTpl = '<div id="gs-modal" class="gs-modal">' +
                '<div class="gs-modal-dialog">' +
                '<div class="gs-close">×</div>' +
                '<div class="gs-modal-title"><h3>提示：</h3></div>' +
                '<div class="gs-modal-content"></div></div></div>';
            modalObj = $(modalTpl);
            modalObj.find(".gs-close").one("click", function() {
                modalObj.removeClass("gs-open");
            });
            $(top.document.body).append(modalObj);
        }
        var dialogObj = modalObj.children(".gs-modal-dialog");
        var containerObj = modalObj.find(".gs-modal-content");
        modalObj.removeClass("gs-open").removeClass("gs-modal-mask").removeClass("gs-modal-nomask").removeAttr("style");
        dialogObj.removeAttr("style");
        containerObj.html("");
        var t = ($(top.window).height() - dialogObj.height()) / 3;
        var l = ($(top.window).width() - dialogObj.width()) / 2;
        containerObj.html(dialogStr);
        switch (pattern) {
            case 1:
                modalObj.addClass("gs-modal-mask");
                dialogObj.css({ marginLeft: l, marginTop: t });
                break;
            case 2:
                modalObj.addClass("gs-modal-nomask");
                modalObj.css({ left: l, top: t });
                break;
        }
        modalObj.addClass("gs-open");
    }

    //关闭弹窗
    function closeModal() {
        var modalObj = $("#gs-modal", top.document);
        var containerObj = modalObj.find(".gs-modal-content");
        modalObj.removeClass("gs-open");
        containerObj.html("");
    }

    //加载
    function showLoading() {
        var modalObj = $("#gs-loading", top.document);
        if (modalObj.length == 0) {
            var modalTpl = '<div id="gs-loading" class="gs-modal">' +
                '<div class="gs-modal-dialog">' +
                '<div class="gs-close">×</div>' +
                '<div class="gs-modal-title"><h3>提示：</h3></div>' +
                '<div class="gs-modal-content"><img src="/content/images/load.gif" width="22" height="22"> 操作中...</div>' +
                '</div></div>';
            modalObj = $(modalTpl);
            $(top.document.body).append(modalObj);
        }
        var dialogObj = modalObj.children(".gs-modal-dialog");
        modalObj.removeClass("gs-open").removeClass("gs-modal-mask");
        dialogObj.removeAttr("style");
        var t = ($(top.window).height() - dialogObj.height()) / 3;
        var l = ($(top.window).width() - dialogObj.width()) / 2;
        modalObj.addClass("gs-modal-mask");
        dialogObj.css({ marginLeft: l, marginTop: t });
        modalObj.addClass("gs-open");
    }

    //关闭加载
    function closeLoading() {
        var modalObj = $("#gs-loading", top.document);
        modalObj.removeClass("gs-open");
    }

    return {
        chkResponse: chkResponse,       //检验请求权限
        stopDefault: stopDefault,       //阻止浏览器默认动作
        getUrlParameter: getUrlParameter,   //获取url参数
        setUrlParameter: setUrlParameter,   //设置url参数
        url2Obj: url2Obj,                   //url转对象
        url2Arr: url2Arr,                   //url转数组
        showModal: showModal,               //弹窗
        closeModal: closeModal,             //关闭弹窗
        showLoading: showLoading,           //加载
        closeLoading: closeLoading,         //关闭加载
        userData: UserData                  //本地存储
    }
});