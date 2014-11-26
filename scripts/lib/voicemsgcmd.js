define(['jquery', 'common', 'verify', 'voicemsgsource', 'ninekeyboard'],
function ($, common, Verify, source, key) {

    var verify = new Verify();

    key.numBox.on("click", function (e) {
        if (!$(this).hasClass("disabled") && cmdPool.activeCmd) {
            var num = parseInt($(this).text());
            if ($.inArray(num, cmdPool.numArr) == -1) {     //如果指令键已被占用，终止
                return false;
            }
            cmdPool.putNum(cmdPool.activeCmd.num);      //释放指令
            cmdPool.activeCmd.num = $(this).text();
            cmdPool.activeCmd.numObj.val($(this).text());
            cmdPool.takeNum($(this).text());            //占用指令
        }
        common.stopDefault(e);
    });

    source.csListSel.on("dblclick", function (e) {      //待选客服列表
        e = e || window.event;
        var selCs, selCSText;
        var pCs = cmdPool.activeCmd.cs;
        if (e.target.tagName == "OPTION") {
            selCs = $(this).val();
            if ($.inArray(selCs, pCs) == -1 && pCs.length < 10) {
                cmdPool.activeCmd.cs.push(selCs);
                cmdPool.activeCmd.csObj.append($(e.target).clone());
            }
        } else if (e.target.tagName == "SELECT" && $(this).children(":selected").length > 0) {
            selCs = $(this).children(":selected").eq(0).val();
            selCSText = $(this).children(":selected").eq(0).text();
            if ($.inArray(selCs, pCs) == -1 && pCs.length < 10) {
                cmdPool.activeCmd.cs.push(selCs);
                cmdPool.activeCmd.csObj.append("<option value='" + selCs + "'>" + selCSText + "</option>");
            }
        }
        common.stopDefault(e);
    });

    //指令类
    var Command = function (option) {
        var tpl = '<div class="gs-tool-bar">' +
            '<div class="gs-tool-item"><a href="#" class="gs-button">移除</a></div>' +
            '<div class="gs-tool-item">数字指令：<input type="text" class="keyboard-target" readonly></div>' +
            '<div class="gs-tool-item"><select><option value="1">人工客服</option><option value="0">语音文件</option></select></div>' +
            '<div class="gs-tool-item"></div>' +
            '<div class="gs-tool-item"></div>' +
            '</div>';       //指令界面模板
        this.line = $(tpl);     //指令配置行
        this.numObj = this.line.find("input").eq(0);        //指令键，文本框
        this.typeObj = this.line.find("select").eq(0);      //类型，下拉框
        this.type1SelObj = this.line.find("div").eq(3);     //语音文件对应界面
        this.type2SelObj = this.line.find("div").eq(4);     //客服对应界面
        this.csObj = $("<select size='5' class='cs-list-target'><option class='gs-text-danger'>点击此处选择客服</option></select>");
        this.fileObj = $("<select class='gs-form-medium'></select>");
        this.loopObj = $("<select class='gs-form-small'><option>1</option><option>2</option></select>");
        this.type1SelObj.append(this.csObj).append("（双击删除）");
        this.type2SelObj.append(this.fileObj).append("　播放次数：").append(this.loopObj);
        return this.init(option);
    };

    Command.prototype = {
        //初始化，可导入已有配置
        init: function (option) {
            var _this = this;
            var defaultOption = {
                num: cmdPool.numArr[0],
                type: 1,
                cs: [],
                file: "",
                loopTimes: "1"
            };
            var i, item, delCSCount = 0, len, len2, sourceFiles = [], sourceCS = [], tmpCS = [], index;
            var titleName;
            if (option != undefined) {
                //调整数据格式
                if (option["cs"].length == 1 && option["cs"][0] == "0") {
                    option["cs"] = [];
                }
                if (option["loopTimes"] <= "0" || option["loopTimes"] >= 3) {
                    option["loopTimes"] = "1";
                }
                $.extend(defaultOption, option);
            }
            if (defaultOption.file != "") {
                //查找语音文件是否存在
                len = source._fileSel.length;
                for (i = 0; i < len; i++) {
                    sourceFiles.push(source._fileSel[i]["Id"]);
                }
                if ($.inArray(parseInt(defaultOption.file), sourceFiles) == -1) {
                    defaultOption.file = "";
                    titleName = "文件已删除，请重新选择";
                }
            } else {
                titleName = "请选择语音文件";
            }
            $.selectListLoad({
                selectObj: _this.fileObj[0],
                presentData: source._fileSel,
                htmlName: "FileName",
                valueName: "Id",
                titleName: titleName
            });     //加载已有语音文件列表
            if (defaultOption.cs.length != 0) {
                //判断客服是否存在
                len = source._phoneSel.length;
                len2 = defaultOption.cs.length;
                for (i = 0; i < len; i++) {
                    sourceCS.push(source._phoneSel[i]["Id"]);
                }
                for (i = 0; i < len2; i++) {
                    index = $.inArray(parseInt(defaultOption.cs[i]), sourceCS);
                    if (index == -1) {
                        delCSCount++;
                    } else {
                        item = source._phoneSel[index];
                        tmpCS.push(defaultOption.cs[i]);
                        _this.csObj.append("<option value='" + item["Id"] + "'>" + item["Tel"] + " [" + item["Contact"] + "]" + "</option>");
                    }
                }
                defaultOption.cs = tmpCS;
                if (delCSCount != 0) {
                    _this.csObj.append("<option class='gs-text-danger'>原配置中有" + delCSCount + "名客服已被删除</option>");
                }
            }
            _this.num = defaultOption.num;          //指令键
            cmdPool.takeNum(defaultOption.num);     //占用指令键
            _this.type = defaultOption.type;        //0，语音文件；1，客服
            _this.cs = defaultOption.cs;            //客服数组
            _this.file = defaultOption.file;        //语音文件
            _this.loopTimes = defaultOption.loopTimes;  //循环次数
            _this.line.on("click", function (e) {  //操作事件绑定
                e = e || window.event;
                var target = e.target,
                    input, t, l;
                if (target.className == "keyboard-target") {    //点击指令键文本框
                    input = $(target);
                    t = input.offset().top - 30;
                    l = input.offset().left + input.width();
                    key.open(t, l);
                    cmdPool.activeCmd = _this;

                } else if (target.className == "cs-list-target" || target.parentNode.className == "cs-list-target") {
                    //点击客服电话
                    if (target.className == "cs-list-target") {
                        input = $(target);
                    } else {
                        input = $(target.parentNode);
                    }
                    if (input.find(".gs-text-danger").length != 0) {
                        input.find(".gs-text-danger").remove();
                        e.target = e.target.parentNode;
                    }
                    t = input.offset().top - 30;
                    l = input.offset().left + input.width();
                    openCSSource(t, l);
                    cmdPool.activeCmd = _this;
                } else if (target.innerHTML == "移除") {  //点击移除按钮
                    cmdPool.delCmd(_this);
                }
                common.stopDefault(e);
            });
            _this.typeObj.on("change", function () {    //改变模式
                _this.type = _this.typeObj.val();
                _this.renderType(_this.type);       //变换语音文件/客服对应界面
            });
            _this.fileObj.on("change", function () {    //更换文件
                _this.file = _this.fileObj.val();
            });
            _this.loopObj.on("change", function () {    //修改循环次数
                var loop = _this.loopObj.val();
                if (loop && loop > 0 && loop < 3) {
                    _this.loopTimes = loop;
                } else {
                    _this.loopTimes = "1";
                }
            });
            _this.csObj.on("dblclick", function (e) {   //修改客服
                e = e || window.event;
                var selCs, index;
                var pCs = _this.cs;
                if (e.target.tagName == "OPTION") {
                    selCs = $(this).val();
                    index = $.inArray(selCs, pCs);
                    if (index != -1) {
                        _this.cs.splice(index, 1);
                        $(e.target).remove();
                    }
                } else if (e.target.tagName == "SELECT" && $(this).children(":selected").length > 0) {
                    selCs = $(this).children(":selected").eq(0).val();
                    index = $.inArray(selCs, pCs);
                    if (index != -1) {
                        _this.cs.splice(index, 1);
                        $(this).children(":selected").eq(0).remove();
                    }
                }
                common.stopDefault(e);
            });
            _this.render();
            _this.renderType(_this.type);
            return this;
        },
        //渲染指令配置行
        render: function () {
            this.numObj.val(this.num);
            this.typeObj.val(this.type);
            $("#cmdRowBox").append(this.line);
        },
        //渲染回拨模式
        renderType: function (type) {
            if (type == 1) {
                this.type1SelObj.show();
                this.type2SelObj.hide();
            } else if (type == 0) {
                this.fileObj.val(parseInt(this.file));
                this.loopObj.val(parseInt(this.loopTimes));
                this.type1SelObj.hide();
                this.type2SelObj.show();
            }
        },
        //生成后端接收字符串，验证配置参数
        toString: function () {
            var str = this.num + "," + this.type;
            if (!/[0-9]/.test(this.num)) {
                verify.showTips(this.numObj, "指令号码有误");
                return false;
            }
            if (!/[0,1]/.test(this.type)) {
                verify.showTips(this.typeObj, "模式选择有误");
                return false;
            }
            if (this.type == 0) {
                if (!this.file) {
                    verify.showTips(this.fileObj, "请选择语音文件");
                    return false;
                }
                if (!/^[1,2]$/.test(this.loopTimes)) {
                    verify.showTips(this.loopObj, "播放次数有误");
                    return false;
                }
                str += "," + this.file;
                str += "," + this.loopTimes;
            } else if (this.type == 1) {
                if (this.cs.length == 0) {
                    verify.showTips(this.csObj, "请选择客服");
                    return false;
                }
                if (this.cs.length > 10) {
                    verify.showTips(this.csObj, "客服选择有误");
                    return false;
                }
                str += "," + this.cs.join(",");
            }
            return str;
        },
        //销毁对象
        destroy: function () {
            $.clearDomElement(this.line[0]);
            this.line.remove();
            cmdPool.putNum(this.num);
        }
    };

    //指令控制器
    var cmdPool = {
        //号码数组
        numArr: key.key,
        //指令对象数组
        cmd: [],
        //单独一组客服
        singleCs: [],
        //当前激活指令
        activeCmd: null,
        //占用指令号码
        takeNum: function (num) {
            num = parseInt(num);
            var index = $.inArray(num, this.numArr);
            if (index != -1) {
                this.numArr.splice(index, 1);
            } else {
                return false;
            }
            if (num == 0) {
                key.numBox.eq(9).addClass("disabled");
            } else {
                key.numBox.eq(num - 1).addClass("disabled");
            }
        },
        //释放指令号码
        putNum: function (num) {
            num = parseInt(num);
            var index = $.inArray(num, this.numArr);
            if (index == -1) {
                this.numArr.push(num);
                this.numArr.sort();
            } else {
                return false;
            }
            if (num == 0) {
                key.numBox.eq(9).removeClass("disabled");
            } else {
                key.numBox.eq(num - 1).removeClass("disabled");
            }
        },
        //新增指令
        addCmd: function () {
            if (this.numArr.length > 0) {
                this.cmd.push(new Command());
                if (this.numArr.length == 0) {
                    $("#addCmd")[0].disabled = true;
                }
            }
        },
        //删除指令
        delCmd: function (cmd) {
            var index = $.inArray(cmd, this.cmd);
            if (index != -1) {
                this.cmd.splice(index, 1);
            }
            cmd.destroy();
        },
        //加载指令配置
        getCmds: function (data) {
            var i, len = data.length, item, cmdOption;
            for (i = 0; i < len; i++) {
                item = data[i];
                cmdOption = {
                    num: item["Command"],
                    type: item["CallMode"],
                    cs: item["CallbackNumsId"],
                    file: item["VMFileId"] == "0" ? "" : item["VMFileId"],
                    loopTimes: item["PlayTimes"]
                };
                this.cmd.push(new Command(cmdOption));
            }
        },
        //清空指令对象
        clearCmds: function () {
            while (this.cmd.length) {
                this.delCmd(this.cmd[0]);
            }
        },
        clearSingle: function () {
            this.singleCs = [];
        }
    };

    var csList = $("#csList");

    //打开客服选择窗
    function openCSSource(t, l) {
        csList.css({ top: t, left: l });
        csList.show();
        $(document).on("click", closeCSSource);
    }

    //关闭客服选择窗
    function closeCSSource(e) {
        e = e || window.event;
        var target = e.target;
        if (target == source.csListSel[0] ||
            target.parentNode == source.csListSel[0] ||
            target.className == "gs-text-danger" ||
            target.className == "cs-list-target" ||
            target.parentNode.className == "cs-list-target") {
            return false;
        }
        csList.hide();
        $(document).off("click", closeCSSource);
    }

    var modRadio = $("[name='call_back_mode']");

    modRadio.on("click", function () {      //回拨模式
        var addCmdBtn = document.querySelector("#addCmd");
        var $singleCS = $("#singleCS");
        var $singleCSSel = $("#singleCSSel");
        $("#settingString").val("");
        switch ($(this).val()) {
            case "1":
                //指定按键回拨或放音
                if (cmdPool.numArr.length > 0) {
                    addCmdBtn.disabled = false;
                }
                $singleCSSel.children().remove();
                cmdPool.clearSingle();
                $singleCS.hide();
                break;
            case "2":
            case "3":
                cmdPool.clearCmds();
                $singleCS.show();
                addCmdBtn.disabled = true;
                break;
            default:
                cmdPool.clearCmds();
                cmdPool.clearSingle();
                $singleCSSel.children().remove();
                $singleCS.hide();
                addCmdBtn.disabled = true;
                break;
            }
        });

    $("#addCmd").on("click", function () {
        cmdPool.addCmd();
    });

    $("#selConfigId").on("change", function () {    //选择现有配置
        var cid = $(this).val();
        renderSettings(cid);        //渲染全套配置
    });

    $("#singleCSSource").on("dblclick", function (e) {      //单组客服选择，源
        e = e || window.event;
        var selCs, selCSText;
        var pCs = cmdPool.singleCs;
        var $sel = $("#singleCSSel");
        if ($sel.find(".gs-text-danger").length != 0) {
            $sel.find(".gs-text-danger").remove();
        }
        if (e.target.tagName == "OPTION") {
            selCs = $(this).val();
            if ($.inArray(selCs, pCs) == -1 && pCs.length < 10) {
                cmdPool.singleCs.push(selCs);
                $sel.append($(e.target).clone());
            }
        } else if (e.target.tagName == "SELECT" && $(this).children(":selected").length > 0) {
            selCs = $(this).children(":selected").eq(0).val();
            selCSText = $(this).children(":selected").eq(0).text();
            if ($.inArray(selCs, pCs) == -1 && pCs.length < 10) {
                cmdPool.singleCs.push(selCs);
                $sel.append("<option value='" + selCs + "'>" + selCSText + "</option>");
            }
        }
        common.stopDefault(e);
    });

    $("#singleCSSel").on("dblclick", function (e) {     //单组客服选择，已选
        e = e || window.event;
        var selCs, index;
        var pCs = cmdPool.singleCs;
        if (e.target.tagName == "OPTION") {
            selCs = $(this).val();
            index = $.inArray(selCs, pCs);
            if (index != -1) {
                cmdPool.singleCs.splice(index, 1);
                $(e.target).remove();
            }
        } else if (e.target.tagName == "SELECT" && $(this).children(":selected").length > 0) {
            selCs = $(this).children(":selected").eq(0).val();
            index = $.inArray(selCs, pCs);
            if (index != -1) {
                cmdPool.singleCs.splice(index, 1);
                $(this).children(":selected").eq(0).remove();
            }
        }
        common.stopDefault(e);
    });

    //渲染配置方法
    function renderSettings(cid) {
        cmdPool.clearCmds();
        cmdPool.clearSingle();
        $("#singleCSSel").children().remove();
        if (cid > 0) {
            //动态加载配置信息
            $.ajax({
                async: false,
                url: '/Ajax/Ajax_GetConfigInfo.ashx',
                data: { configId: cid },
                success: function (data) {
                    data = $.parseJSON(data);
                    $("#selMainPhoneNum").val(data["MainNumId"]);
                    $("#selFile").val(data["VMFileId"]);
                    $("[name='play_times']").val(data["PlayTimes"]);
                    switch (data["CallBackMode"]) {
                        case "1":
                            //指定按键回拨或放音
                            modRadio.eq(1).click();
                            RenderCommandList(cid); //动态渲染指令列表
                            break;
                        case "2":
                        case "3":
                            //播放完语音短信自动回拨
                            modRadio.eq(data["CallBackMode"]).click();
                            var cs = data["SerPhoneIdStr"].split(",");
                            var i, item, len = cs.length, len2 = source._phoneSel.length, index,
                                sourceCS = [], delCSCount = 0;
                            var $sel = $("#singleCSSel");
                            for (i = 0; i < len2; i++) {
                                sourceCS.push(source._phoneSel[i]["Id"]);
                            }
                            for (i = 0; i < len; i++) {
                                index = $.inArray(parseInt(cs[i]), sourceCS);
                                if (index == -1) {
                                    delCSCount++;
                                } else {
                                    item = source._phoneSel[index];
                                    cmdPool.singleCs.push(cs[i]);
                                    $sel.append("<option value='" + item["Id"] + "'>" + item["Tel"] + " [" + item["Contact"] + "]" + "</option>");
                                }
                            }
                            if (delCSCount != 0) {
                                $sel.append("<option class='gs-text-danger'>原配置中有" + delCSCount + "名客服已被删除</option>");
                            }
                            break;
                        case "0":
                        default:
                            //默认选中不回拨
                            modRadio.eq(0).click();
                            break;
                    }
                }
            });
        } else {
            //自定义配置，重置配置信息
            $("#selMainPhoneNum").val(0);
            $("#selFile").val(0);
            $("input[name='play_times']").val(1);
            $("input[name='call_back_mode']").eq(0).click();
        }
    }

    //动态渲染指令列表
    function RenderCommandList(cid) {
        $.ajax({
            cache: false,
            async: false,
            type: "post",
            url: "/Ajax/Ajax_GetCommandList.ashx",
            data: { configId: cid },
            success: function (data) {
                data = $.parseJSON(data);
                cmdPool.getCmds(data);
            }
        });
    }

    //表单验证
    function check() {
        var singleCSSel = $("#singleCSSel");
        var i, len = cmdPool.cmd.length, cmd, tmpStr, cmdStr = [], chkNum = [];
        var mode = modRadio.filter(":checked").val();
        if (mode == 1) {
            if (len == 0) {
                verify.showTips($("#addCmd"), "未添加指令");
                return false;
            }
            for (i = 0; i < len; i++) {
                cmd = cmdPool.cmd[i];
                if ($.inArray(cmd.num, chkNum) != -1) {
                    verify.showTips(cmd.numObj, "指令号码重复！");
                    return false;
                } else {
                    chkNum.push(cmd.num);
                }
                tmpStr = cmd.toString();
                if (!tmpStr) {
                    return false;
                }
                cmdStr.push(tmpStr);
            }
            $("#settingString").val(cmdStr.join("|"));
        } else if (mode == 2 || mode == 3) {
            if (cmdPool.singleCs.length == 0 || cmdPool.singleCs.length > 10) {
                verify.showTips(singleCSSel, "请选择1-10个客服电话");
                return false;
            }
            $("#settingString").val(cmdPool.singleCs.join(","));
        }
        return true;
    }

    return {
        check: check,
        renderSettings: renderSettings
    };
});