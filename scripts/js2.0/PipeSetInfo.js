require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'jswindow', 'common', 'verify', 'form'], function($, jsw, common, Verify, form) {
    var jsBox = jsw.init();

    $("[data-change-for]").change(function () {
        $("#" + $(this).attr("data-change-for")).val($(this).find("option:selected").text());
        $("#" + $(this).attr("data-change-for") + "Id").val($(this).val());
    });
    $("[data-dropdown]").each(function () {
        var controller = $(this).find("[data-dropdown-control]");
        controller.click(function (e) {
            common.stopDefault(e);
        });
        $(this).click(function () {
            var $this = $(this);
            var pipeList = $this.next().find(".base-pipe-list");
            $this.next().toggle();
            if (pipeList.attr("data-load") == "true") {
                loadBasePipe($this.data("id"), pipeList, 0);
            }
            controller.html() == "展开" ? controller.html("关闭") : controller.html("展开");
        });
    });

    $("[data-del]").click(function (e) {
        var line = $(this).parents("tr").eq(0);
        var id = $(this).attr("data-id") ? $(this).attr("data-id") : line.attr("data-id");
        var num = $(this).attr("data-num");
        var item = $(this).attr("data-del");
        if (confirm("确认删除？")) {
            switch (item) {
                case "combi":
                    delCombi(id, line); //删除组合通道
                    break;
            }
        }
        common.stopDefault(e);
    });

    $("#xianzhi").on("change", function () {
        $(this).next()[0].disabled = $(this).val() == -1;
    });

    $(".base-pipe-list").on("click", function (e) {
        e = e || window.event;
        if (e.target.innerHTML == "修改") {
            jsBox["main"].openSub("channelMod", $(e.target));
        } else if (e.target.innerHTML == "设置") {
            jsBox["main"].openSub("spareChannel", $(e.target));
        }
        common.stopDefault(e);
    });

    (function (box) {
        var combiSelects = [
                document.querySelector("#combiYDSelect"),
                document.querySelector("#combiDXSelect"),
                document.querySelector("#combiLTSelect"),
                document.querySelector("#combiHHSelect")
            ],
            combiNames = [
                document.querySelector("#combiYD"),
                document.querySelector("#combiDX"),
                document.querySelector("#combiLT"),
                document.querySelector("#combiHH")
            ],
            combiIds = [
                document.querySelector("#combiYDId"),
                document.querySelector("#combiDXId"),
                document.querySelector("#combiLTId"),
                document.querySelector("#combiHHId")
            ];
        var hhtd = $("#hhtd"),
            ydltd = $("#ydltd"),
            changeTd = $("#changeTd");

        changeTd.on('click', function () {
            hhtd.toggle();
            ydltd.toggle();
            if (changeTd[0].checked) {
                combiNames[0].value = "";
                combiNames[1].value = "";
                combiNames[2].value = "";
                combiIds[0].value = "";
                combiIds[1].value = "";
                combiIds[2].value = "";
            } else {
                combiNames[3].value = "";
                combiIds[3].value = "";
            }
        });

        var combiVerify = new Verify();
        combiVerify.init({
            form: "#combiSetForm",
            setting: {
                auto: "blur",
                trim: true
            },
            customChk: function () {
                var pipeTarget = combiNames[0],
                    str = "", i, len;
                if (changeTd[0].checked) {
                    pipeTarget = combiNames[3];
                }
                for (i = 0, len = combiIds.length; i < len; i++) {
                    str += combiIds[i].value;
                }
                if (str == "") {
                    combiVerify.showTips($(pipeTarget), "未选择通道");
                    return false;
                }
                return true;
            }
        });

        //窗体设置
        box.beforeOpen = function () {
            var id = this.sourceObj.attr("data-id");
            if (id) {
                combiLoad(id);
                $("#setCombiSave").show();
            } else {
                $("#setCombiSave").hide();
            }
            channelListLoad({
                selectObj: combiSelects[0],
                data: {
                    yunying: "yd",
                    type: 1
                }
            });
            channelListLoad({
                selectObj: combiSelects[1],
                data: {
                    yunying: "dx",
                    type: 2
                }
            });
            channelListLoad({
                selectObj: combiSelects[2],
                data: {
                    yunying: "lt",
                    type: 3
                }
            });
            channelListLoad({
                selectObj: combiSelects[3],
                data: {
                    yunying: "hh",
                    type: 4
                }
            });
        };
        box.submit = function (e) {
            e = e || window.event;
            //新增
            var combiAddFormOptions = {
                beforeSubmit: function () {
                    if (combiVerify.chkForm()) {
                        return true;
                    } else {
                        box.submitObj.removeClass("gs-disabled-button");
                        return false;
                    }
                },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    box.submitObj.removeClass("gs-disabled-button");
                    if (res["Result"].toLowerCase() == "true") {
                        alert("新增成功");
                        location.reload();
                    }
                    else {
                        alert("新增失败");
                    }
                },
                error: function () {
                    alert("连接超时");
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };
            //修改
            var combiModFormOptions = {
                beforeSubmit: function () {
                    if (combiVerify.chkForm()) {
                        return true;
                    } else {
                        box.submitObj.removeClass("gs-disabled-button");
                        return false;
                    }
                },
                success: function (res, statusText, xhr, $form) {
                    if (!common.chkResponse(res)) return false;
                    box.submitObj.removeClass("gs-disabled-button");
                    var form = $form[0];
                    if (res["Result"].toLowerCase() == "true") {
                        alert("修改成功");
                    }
                    else {
                        alert("修改失败");
                        return false;
                    }
                    var line = box.sourceObj.parents("tr");
                    var pipeList = line.next().find(".base-pipe-list");
                    var pipesName = [], i, len, item;
                    for (i = 0, len = combiNames.length; i < len; i++) {
                        item = combiNames[i].value;
                        if (item) pipesName.push(item);
                    }
                    loadBasePipe(line.data("id"), pipeList, 0);
                    line.children().eq(2).html(pipesName.join(','));
                    line.children().eq(1).html(form["combiChannel"].value);
                    line.children().eq(4).html(form["combiTimeStart"].value + " - " + form["combiTimeEnd"].value);
                    line.children().eq(6).html(form["combiStatus"].options[form["combiStatus"].selectedIndex].text);
                    box.close();
                },
                error: function () {
                    alert("连接超时");
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            var form = $("#combiSetForm");
            if (e.target.innerHTML == "新增组合") {
                $("#combiId").val("");
                form.ajaxSubmit(combiAddFormOptions);
            } else if (e.target.innerHTML == "保存修改") {
                form.ajaxSubmit(combiModFormOptions);
            }

        };
        box.reset = function () {
            hhtd.hide();
            ydltd.show();
            combiVerify.hideTips();
        };

        //组合通道修改信息导入
        function combiLoad(id) {
            var option = {
                url: "/PipeSetInfo/GetPipeSetInfo",
                data: {
                    pipeSetInfoId: id
                },
                success: function (data) {
                    if (!common.chkResponse(data)) return false;
                    var dataJSON = data["Result"];
                    $("#combiId").val(dataJSON["id"]);
                    $("#combiChannel").val(dataJSON["SetName"]);
                    $("#combiNote").val(dataJSON["SetNote"]);
                    $("#combiTimeStart").val(dataJSON["UseOpenTime"]);
                    $("#combiTimeEnd").val(dataJSON["UseCloseTime"]);
                    $("#combiStatus").val(dataJSON["isValid"]);
                    $("#combiType").val(dataJSON["UseType"]);
                    $("#combiMin").val(dataJSON["SendMinmum"]);
                    $("#combiMax").val(dataJSON["SendMaxmum"]);
                    $("#combiTem").val(dataJSON["IsForcePattern"]);
                    $("#SmsSign").val(dataJSON["SmsSign"]);
                    if (dataJSON["HhPipeName"] == null) {
                        combiNames[0].value = dataJSON["YdPipeName"];
                        combiIds[0].value = dataJSON["YdpipeId"] == 0 ? "" : dataJSON["YdpipeId"];
                        combiNames[1].value = dataJSON["DxPipeName"];
                        combiIds[1].value = dataJSON["DxpipeId"] == 0 ? "" : dataJSON["DxpipeId"];
                        combiNames[2].value = dataJSON["LtPipeName"];
                        combiIds[2].value = dataJSON["LtpipeId"] == 0 ? "" : dataJSON["LtpipeId"];
                    }
                    else {
                        combiNames[3].value = dataJSON["HhPipeName"];
                        combiIds[3].value = dataJSON["HhpipeId"];
                        changeTd[0].click();
                    }
                }
            };
            $.ajax(option);
        }
    })(jsBox["setCombi"]);

    (function (box) {
        var batchModSelect = document.querySelector("#batchModSelect");
        var batchVerify = new Verify();
        batchVerify.init({
            form: "#batchModForm",
            setting: {
                auto: "blur",
                trim: true
            }
        });
        //修改通道
        var batchModOptions = {
            beforeSubmit: function () {
                if (batchVerify.chkForm()) {
                    return true;
                } else {
                    box.submitObj.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                box.submitObj.removeClass("gs-disabled-button");
                if (res["Result"].toLowerCase() == "true") {
                    alert("修改成功");
                    location.reload();
                }
                else {
                    alert("修改失败");
                    return false;
                }
                box.close();
            },
            error: function () {
                alert("连接超时");
                box.submitObj.removeClass("gs-disabled-button");
            }
        };

        //窗体设置
        box.beforeOpen = function () {
            loadModPipes();
        };
        box.submit = function () {
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            $("#batchModForm").ajaxSubmit(batchModOptions);
        };
        //事件设置
        $(batchModSelect).on("change", loadModPipes);

        function loadModPipes() {
            channelListLoad({
                url: "/PipeSetInfo/GetPipeInfoListInSet",
                selectObj: document.querySelector("#sourceChannel"),
                data: {
                    yunying: batchModSelect.value,
                    type: 1
                }
            });
            channelListLoad({
                selectObj: document.querySelector("#newChannel"),
                data: {
                    yunying: batchModSelect.value,
                    type: 2
                }
            });
        }
    })(jsBox["batchMod"]);

    (function (box) {
        var channelVerify = new Verify();
        channelVerify.init({
            form: "#channelModForm",
            setting: {
                auto: "blur",
                trim: true
            }
        });
        //修改
        var channelModFormOptions = {
            beforeSubmit: function () {
                if (channelVerify.chkForm()) {
                    return true;
                } else {
                    box.submitObj.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function (res, statusText, xhr, $form) {
                if (!common.chkResponse(res)) return false;
                box.submitObj.removeClass("gs-disabled-button");
                if (res["Result"].toLowerCase() == "true") {
                    alert("修改成功");
                } else {
                    alert("修改失败");
                    return false;
                }
                var showText = box.tmp;
                var mainTable = box.mainTable;
                var form = $form[0];
                mainTable.attr("data-num", form["pipeIn"].value);
                showText.html(form["channelModSelect"].options[form["channelModSelect"].selectedIndex].text);
                box.sourceObj.attr("data-id", form["channelModSelect"].value);
                box.submitObj.removeClass("gs-disabled-button");
                var allPipe = mainTable.prev().children().eq(2);
                var pipes = mainTable.find(".pipe-name");
                var pipeArray = [];
                for (var k = 0; k < pipes.length; k++) {
                    pipeArray[k] = pipes.eq(k).html();
                }
                allPipe.html(pipeArray.join(","));
                box.close();
            },
            error: function () {
                alert("连接超时");
                box.submitObj.removeClass("gs-disabled-button");
            }
        };

        //窗体设置
        box.beforeOpen = function () {
            var parent = this.sourceObj.parents("tr").eq(0);
            var mainTable = this.sourceObj.parents("tr").eq(1);
            var thisPipe = this.sourceObj.attr("data-id"); //基础通道原ID
            var pipeIn = mainTable.attr("data-num");
            var showText = parent.children().eq(1);
            var yunying = parent.attr("data-type"); //基础通道类型
            var id = parent.attr("data-id"); //组合通道ID
            this.tmp = showText;
            this.mainTable = mainTable;
            channelListLoad({
                selectObj: document.getElementById("channelModSelect"),
                data: {
                    type: 1,
                    yunying: yunying
                }
            });
            $("#channelModId").val(id);
            $("#pipeIn").val(pipeIn);
            $("#oldPipeId").val(thisPipe);
        };

        box.submit = function () {
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            var form = $("#channelModForm");
            form.ajaxSubmit(channelModFormOptions);
        };
    })(jsBox["channelMod"]);

    (function (box) {
        var pipeStatus = {};
        var spareVerify = new Verify();
        spareVerify.init({
            form: "#spareModForm",
            setting: {
                auto: "blur",
                trim: true
            }
        });
        //新增
        var spareAddFormOptions = {
            beforeSubmit: function () {
                if (spareVerify.chkForm()) {
                    return true;
                } else {
                    box.submitObj.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function (res, statusText, xhr, $form) {
                if (!common.chkResponse(res)) return false;
                box.submitObj.removeClass("gs-disabled-button");
                var form = $form[0], ctlStr = '<a href="#">修改</a>', pipeStr = "<td>主通道</td>",
                    status = box.sourceObj.parent().next(),
                    mainStatus = box.sourceObj.parents("tr").eq(1).prev().children().eq(5),
                    pipeSel = form["tongdao"];
                if (res["Result"].toLowerCase() != "false") {
                    pipeSel.disabled = false;
                    pipeSel.style.display = "inline";
                    alert("新增成功");
                }
                else {
                    alert("新增失败");
                    return false;
                }
                var list = $("#spareList");
                if (list.children().length > 0) {
                    ctlStr += ' | <a href="#">删除</a>';
                    pipeStr = '<td data-id="' + pipeSel.value + '">' +
                        pipeSel.options[pipeSel.selectedIndex].text + '</td>';
                } else {
                    list.empty();
                }
                var lineTpl = '<tr data-id="' + res["Result"] + '"><td>' + res["Result"] + '</td>' +
                    '<td>' + form["zhuangtai"].options[form["zhuangtai"].selectedIndex].text + '</td>' +
                    '<td>' + form["prePriority"].value + '</td>' +
                    pipeStr +
                    '<td>' + form["xianzhi"].options[form["xianzhi"].selectedIndex].text + '</td>' +
                    '<td>' + form["shuliang"].value + '</td>' +
                    '<td>' + form["diqu"].value + '</td>' +
                    '<td>' + form["zishu"].value + '</td>' +
                    '<td>' + ctlStr + '</td></tr>';
                form["prePriority"].value = parseInt(form["prePriority"].value) + 1;
                list.append($(lineTpl));
                pipeStatus[res["Result"]] = form["zhuangtai"].value;
                form.reset();
                status.html(getStatus(1) ? "启用" : "关闭");
                mainStatus.html(getStatus(0) ? "启用" : "关闭");
            },
            error: function () {
                alert("连接超时");
                box.submitObj.removeClass("gs-disabled-button");
            }
        };
        //修改
        var spareModFormOptions = {
            beforeSubmit: function () {
                if (spareVerify.chkForm()) {
                    return true;
                } else {
                    box.submitObj.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function (res, statusText, xhr, $form) {
                if (!common.chkResponse(res)) return false;
                box.submitObj.removeClass("gs-disabled-button");
                var line = box.tmpLine,
                    status = box.sourceObj.parent().next(),
                    parentLine = box.sourceObj.parents("tr[data-type]"),
                    mainStatus = box.sourceObj.parents("tr").eq(1).prev().children().eq(5),
                    form = $form[0];
                if (res["Result"].toLowerCase() == "true") {
                    alert("修改成功");
                }
                else {
                    alert("修改失败");
                    return false;
                }
                line.children().eq(0).html(form["xuhao"].value);
                line.children().eq(1).html(form["zhuangtai"].options[form["zhuangtai"].selectedIndex].text);
                line.children().eq(2).html(form["youxian"].value);
                if (form["youxian"].value == 0) {
                    parentLine.children().eq(4).html(form["zhuangtai"].options[form["zhuangtai"].selectedIndex].text);
                    line.children().eq(3).html("主通道");
                } else {
                    line.children().eq(3).html(form["tongdao"].options[form["tongdao"].selectedIndex].text);
                }
                line.children().eq(4).html(form["xianzhi"].options[form["xianzhi"].selectedIndex].text);
                line.children().eq(5).html(form["shuliang"].value);
                line.children().eq(6).html(form["diqu"].value);
                line.children().eq(7).html(form["zishu"].value);
                pipeStatus[form["xuhao"].value] = form["zhuangtai"].value;
                status.html(getStatus(1) ? "启用" : "关闭");
                mainStatus.html(getStatus(0) ? "启用" : "关闭");
                if ($("#testString").html() != "") {
                    $("#spareModTest").click();
                }
            },
            error: function () {
                alert("连接超时");
                box.submitObj.removeClass("gs-disabled-button");
            }
        };
        //窗体设置
        box.beforeOpen = function () {
            $("#spareList").html("数据加载中....");
            var oId = {
                pipeSetInfoID: this.sourceObj.parents("tr").eq(1).prev().attr("data-id"),
                teleComName: this.sourceObj.attr("data-type"),
                yunying: this.sourceObj.parents("tr").eq(0).attr("data-type")
            };
            spareLoad(oId);
            $('#comName').val(oId.teleComName);
            $('#pipeSetId').val(oId.pipeSetInfoID);
            $("#shuliang")[0].disabled = true;
            channelListLoad({
                selectObj: document.querySelector("#tongdao"),
                data: oId
            });
        };
        box.submit = function () {
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            var form = $("#spareModForm");
            if (this.submitObj.html() == "新增") {
                form.ajaxSubmit(spareAddFormOptions);
            } else if (this.submitObj.html() == "修改") {
                form.ajaxSubmit(spareModFormOptions);
            }
            //如果启用基础通道的备用状态，动态修改对应基础通道的备用状态
            var line = $("#spareList").children();
            var pipeBackup;
            line.each(function () {
                if ($(this).children().eq(1).text() == "启用") {
                    pipeBackup = "启用";
                }
            });
            if (pipeBackup) {
                this.sourceObj.parent().next().html(pipeBackup);
            }
        };
        box.reset = function () {
            pipeStatus = {};
            this.submitObj.html("新增");
            var channel = $("#tongdao");
            var priority = $("#youxian");
            var channelMain = $("#tongdaoMain");
            channel.removeAttr("disabled");
            channel.show();
            priority.removeAttr("readonly");
            channelMain.attr("disabled", "true").attr("type", "hidden");
            spareVerify.hideTips();
            $("#xuhao").val(""); //清空修改的id
            $("#shuliang")[0].disabled = true;
            $("#testString").html("");
            delete box.tmpLine;
        };

        $("#spareModReset").on("click", function (e) {
            $("#spareModForm")[0].reset();
            box.reset();
        });

        $("#spareModTest").on("click", function (e) {
            var option = {
                url: "/pipesetinfo/testbackuppipe",
                data: {
                    PipeSetId: box.sourceObj.parents("tr").eq(1).prev().attr("data-id"),
                    TeleComName: box.sourceObj.attr("data-type")
                },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    $("#testString").html(res["Result"]);
                }
            };
            $.ajax(option);
        });

        $("#spareList").on("click", function (e) {
            e = e || window.event;
            if (e.target.innerHTML == "修改") {
                spareModLeadingIn($(e.target));
                common.stopDefault(e);
            } else if (e.target.innerHTML == "删除") {
                var line = $(e.target).parents("tr").eq(0);
                var id = line.attr("data-id");
                delChannel(id, line);
                common.stopDefault(e);
            }
        });

        function spareLoad(oId) {
            var list = $("#spareList");
            list.html("数据加载中....");
            var option = {
                url: "/PipeSetInfo/GetPipe_BackupList",
                data: oId,
                success: function (data, textStatus) {
                    if (!common.chkResponse(data)) return false;
                    $.clearDomElement(list[0]);
                    var dataJSON = data["InfoList"];
                    var i, len = dataJSON.length, item;
                    var tongdao = document.querySelector("#tongdao"),
                        youxian = document.querySelector("#youxian"),
                        prePriority = document.querySelector("#prePriority");
                    var lineTpl = function (data) {
                        var ctlStr = '<a href="#">修改</a>', pipeStr = "<td>主通道</td>", limit = "不限制";
                        if (data["Pipe_Name"].length != 0) {
                            ctlStr += ' | <a href="#">删除</a>';
                            pipeStr = '<td data-id="' + data["BackupPipeID"] + '">' +
                                data["Pipe_Name"] + '</td>';
                        }
                        if (data["isMorethan"] == 0)
                            limit = "小于";
                        else if (data["isMorethan"] == 1) {
                            limit = "大于";
                        }
                        return '<tr data-id="' + data["id"] + '"><td>' + data["id"] + '</td>' +
                            '<td>' + (data["IsUse"] == 1 ? "启用" : "关闭") + '</td>' +
                            '<td>' + data["Priority"] + '</td>' +
                            pipeStr +
                            '<td>' + limit + '</td>' +
                            '<td>' + (data["MessageSum"] || "") + '</td>' +
                            '<td>' + data["Messagearea"] + '</td>' +
                            '<td>' + data["MesLength"] + '</td>' +
                            '<td>' + ctlStr + '</td></tr>';
                    };
                    if (dataJSON.length == 0) {
                        list.html("未设置备用通道");
                        tongdao.disabled = true;
                        youxian.disabled = true;
                        tongdao.style.display = "none";
                        youxian.value = 0;
                        prePriority.value = 0;
                    } else {
                        prePriority.value = dataJSON[len - 1]["Priority"] + 1;
                        for (i = 0; i < len; i++) {
                            item = dataJSON[i];
                            list.append($(lineTpl(item)));
                            pipeStatus[item["id"]] = item["IsUse"];
                        }
                    }
                }
            };
            $.ajax(option);
        }

        //备用通道修改信息导入
        function spareModLeadingIn(obj) {
            var line = obj.parents("tr");
            box.tmpLine = line;
            var record = [];
            for (var i = 0; i < line.children("td").length - 1; i++) {
                record.push(line.children("td").eq(i).html());
            }
            var channel = $("#tongdao");
            var priority = $("#youxian");
            $("#xuhao").val(record[0]);
            channel.val(line.children("td").eq(3).attr("data-id"));
            var isUse = 0;
            if (record[1] == "启用")
                isUse = 1;
            $("#zhuangtai").val(isUse);
            priority.val(record[2]);
            var moreOrLess = 0;
            if (record[4] == "大于") {
                moreOrLess = 1;
            }
            else if (record[4] == "小于") {
                moreOrLess = 0;
            }
            else {
                moreOrLess = -1;
            }
            $("#xianzhi").val(moreOrLess).change();
            $("#shuliang").val(record[5]);
            $("#zishu").val(record[7]);
            $("#diqu").val(record[6]);
            if (record[2] == 0) {
                channel.attr("disabled", "true");
                channel.hide();
                priority.attr("readonly", "true");
            } else {
                channel.removeAttr("disabled");
                channel.show();
                priority.removeAttr("readonly");
            }
            box.submitObj.html("修改");
        }

        //删除备用通道
        function delChannel(id, line) {
            var option = {
                url: "/PipeSetInfo/DelPipeBackup",
                data: {
                    pipeBackupID: id
                },
                success: function (data) {
                    if (!common.chkResponse(data)) return false;
                    if (data["Result"].toLowerCase() == "true") {
                        alert("删除成功");
                        line.remove();
                    }
                    else {
                        alert("删除失败");
                    }
                }
            };
            $.ajax(option);
        }

        //获得备用状态
        function getStatus(type) {
            var isUse = false, o, status, i, len;
            if (type == 1) {
                for (o in pipeStatus) {
                    if (pipeStatus[o] == 1) {
                        isUse = true;
                        break;
                    }
                }
            } else {
                status = box.sourceObj.parents("table").eq(0).find(".pipe-status");
                for (i = 0, len = status.length; i < len; i++) {
                    if (status.eq(i).html() == "启用") {
                        isUse = true;
                        break;
                    }
                }
            }
            return isUse;
        }
    })(jsBox["spareChannel"]);

    (function (box) {
        //窗体设置
        box.beforeOpen = function () {
            var parent = this.sourceObj.parents("tr").eq(0);
            var id = parent.attr("data-id");
            var title = parent.children().eq(1).html();
            $("#userBoxTitle").html(title);
            usersLoad(id);
        };

        //用户列表载入
        function usersLoad(id) {
            var list = $("#userBoxList");
            $.clearDomElement(list[0]);
            list.html("数据加载中....");
            var option = {
                url: "/PipeSetInfo/GetUserInPipeSet",
                data: {
                    pipeSetId: id
                },
                success: function (data) {
                    if (!common.chkResponse(data)) return false;
                    list.html("");
                    var dataJSON = data["InfoList"];
                    var tpl = "", i, len;
                    var listTpl = function (data) {
                        return '<tr><td>' + data["UserName"] + '</td>' +
                            '<td>' + data["Mobile"] + '</td>' +
                            '<td>' + data["Email"] + '</td>' +
                            '<td>' + data["UserTypeText"] + '</td>' +
                            '<td>' + data["userBelongTo"] + '</td>' +
                            '<td>' + data["UserNote"] + '</td></tr>';
                    };
                    for (i = 0, len = dataJSON.length; i < len; i++) {
                        tpl += listTpl(dataJSON[i]);
                    }
                    list.append($(tpl));
                }
            };
            $.ajax(option);
        }
    })(jsBox["userBox"]);

    (function(box){
        var pipeSetSel = $("#defaultPipeSel");
        var defaultPipeList = $("#defaultPipeList");

        defaultPipeList.on("click", function(e) {
            if(e.target.tagName == "A") {
                var line = $(e.target).parents("tr").eq(0);
                var option = {
                    url: "/PipeSetInfo/DeleteUserDefaultPipeSet",
                    data: {
                        PipeSetID: $(e.target).data("id")
                    },
                    success: function(res) {
                        if(!common.chkResponse(res)) return false;
                        if(res["Result"].toLowerCase() == "true") {
                            $.clearDomElement(line[0]);
                            line.remove();
                        } else {
                            alert("删除失败");
                        }
                    }
                };
                $.ajax(option);
                common.stopDefault(e);
            }
        });

        box.beforeOpen = function() {
            var option = {
                selectObj: pipeSetSel,
                url: "/PipeSetInfo/GetPipeSetInfoListNoUser",
                htmlName: "SetName",
                valueName: "PipeSetId"
            };
            $.selectListLoad(option);
            getDefaultList();
        };

        box.submit = function() {
            box.autoClose = false;
            box.submitObj.addClass("gs-disabled-button");
            var option = {
                url: "/PipeSetInfo/SetUserDefaultPipeSet",
                data: {
                    PipeSetID: pipeSetSel.val()
                },
                success: function(res) {
                    if(!common.chkResponse(res)) return false;
                    box.submitObj.removeClass("gs-disabled-button");
                    if(res["Result"].toLowerCase() == "true") {
                        getDefaultList();
                    } else {
                        alert("添加失败");
                    }
                }
            };
            $.ajax(option);
        };

        function renderDefaultList(data) {
            var tpl = function(item) {
                switch (item["UseType"]) {
                    case "1":
                        item["UseType"] = "短信";
                        break;
                    case "2":
                        item["UseType"] = "彩信";
                        break;
                    case "3":
                        item["UseType"] = "语音";
                        break;
                    default:
                        item["UseType"] = "";
                        break;
                }
                return '<tr>' +
                    '<td>' + item["PipeSetId"] + '</td>' +
                    '<td>' + item["UseType"] + '</td>' +
                    '<td><span class="gs-text-danger" title="' + item["BasePipeName"] + '">' +
                    item["SetName"] + '</span></td>' +
                    '<td>' + item["UseOpenTime"] + ' - ' + item["UserCloseTime"] + '</td>' +
                    '<td><a href="#" data-id="' + item["PipeSetId"] + '">删除</a></td>' +
                    '</tr>';
            };
            var i, len, htmlStr = "";
            $.clearDomElement(defaultPipeList[0]);
            for(i = 0, len = data.length; i < len; i++) {
                htmlStr += tpl(data[i]);
            }
            defaultPipeList.append(htmlStr);
        }

        function getDefaultList() {
            var option = {
                url: "/PipeSetInfo/GetUserDefaultPipeSetList",
                success: function(res) {
                    if(!common.chkResponse(res)) return false;
                    renderDefaultList(res["InfoList"]);
                }
            };
            $.ajax(option);
        }
    })(jsBox["defaultPipeSet"]);

    //加载基础通道
    function loadBasePipe(id, pipeList, type, obj) {
        if (type == 0) {
            obj = {
                url: "/PipeSetInfo/GetPipeInPipeSet",
                data: {
                    pipeSetId: id
                },
                success: renderBasePipeList
            };
            $.ajax(obj);
        } else {
            renderBasePipeList(obj);
        }

        function renderBasePipeList(data) {
            if (!common.chkResponse(data)) return false;
            $.clearDomElement(pipeList[0]);
            pipeList.attr("data-load", "false");
            var tpl = "", i, len, item, yunying;
            var listTpl = function (data) {
                var setStr = '<td><a href="#" data-id="' + data["id"] + '" data-type="' + data["TeleCom"] + '">设置</a></td>';
                if (data["TeleCom"] == "移动") {
                    yunying = "yd";
                } else if (data["TeleCom"] == "电信") {
                    yunying = "dx";
                } else if (data["TeleCom"] == "联通") {
                    yunying = "lt";
                } else {
                    setStr = "<td></td>";
                    yunying = "hh";
                }
                return '<tr data-id="' + data["PipeSetId"] + '" data-type="' + yunying + '">' +
                    '<td>' + data["TeleCom"] + '</td>' +
                    '<td class="pipe-name">' + data["Pipe_Name"] + '</td>' +
                    '<td><a href="#" data-id="' + data["id"] + '">修改</a>' +
                    setStr +
                    '<td class="pipe-status">' + data["BackupStatus"] + '</td>' +
                    '</tr>';
            };
            for (i = 0, len = data["InfoList"].length; i < len; i++) {
                item = data["InfoList"][i];
                tpl += listTpl(item);
            }
            pipeList.append($(tpl));
        }
    }

    //通道信息列表载入select
    function channelListLoad(option) {
        var defaultOption = {
            url: "/pipesetinfo/getpipeinfolist",
            htmlName: "Pipe_Name",
            valueName: "id"
        };
        $.extend(defaultOption, option);
        $.selectListLoad(defaultOption);
    }

    //删除组合通道
    function delCombi(id, line) {
        var option = {
            url: "/PipeSetInfo/Del",
            data: {
                pipeSetInfoID: id
            },
            success: function (data) {
                if (!common.chkResponse(data)) return false;
                if (data["Result"].toLowerCase() == "true") {
                    line.next().remove();
                    line.remove();
                }
            }
        };
        $.ajax(option);
    }
});