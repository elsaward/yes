require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'jswindow', 'common', 'verify', 'form'], function ($, jsw, common, Verify, form) {
    var jsBox = jsw.init();

    //载入数据（暂用）
    var urlObj = common.url2Obj();
    if (urlObj["add"] == 1) {
        jsBox["main"].openSub("record", null);
        $("#recordUser").val(urlObj["userCode"]);
        $("#recordUserId").val(urlObj["userId"]);
        $("#recordPipe").val(urlObj["pipeName"]);
        $("#recordPipeId").val(urlObj["pipeId"]);
        var urlSmsContent = urlObj["SmsContent"];
        urlSmsContent = "\\A" + urlSmsContent.replace(/(\s*)$/, "") + "\\Z";
        $("#patternContent").val(urlSmsContent);
        jsBox["record"].close = function () {
            open(location, '_self').close();
        }
    }

    var patterMode = 1;  //1,normalMode 2,keywordMode

    $("#normalMode").on("click", function () {
        patterMode = 1;
        $("#normalTable").show();
        $("#keywordTable").hide();
        $("#patternContent").val("");
    });
    $("#keywordMode").on("click", function () {
        patterMode = 2;
        $("#normalTable").hide();
        $("#keywordTable").show();
        $("#patternContent").val("");
    });

    //弹窗绑定
    $(".gs-mail-text>a").click(function () {
        common.showModal($(this).html(), 1);
    });

    $(".clearUserSelector").click(function () {
        var boxId = $(this).attr("data-for");
        $(boxId).val("").next().val("");
        return false;
    });

    $("[name='isAllPipe']").click(function () {
        var $form = $(this).parents("form");
        $form.find(".selectPipeRow")[0].style.display = this.checked ? "none" : "block";
        $form.find("[name='hidChannelId']")[0].disabled = this.checked;
        $form.find("[name='channel']")[0].disabled = this.checked;
    });

    $("[name='isAllUser']").click(function () {
        var $form = $(this).parents("form");
        $form.find(".selectUserRow")[0].style.display = this.checked ? "none" : "block";
        $form.find("[name='hidUserId']")[0].disabled = this.checked;
        $form.find("[name='user']")[0].disabled = this.checked;
        $form.find("[name='isChildValid']")[0].disabled = this.checked;
    });

    $("#exportPattern").click(function () {
        var $form = $("#searchForm");
        $form.attr("action", "/System/SmsPatternRecordsExportToCsv");
        $form.submit();
        $form.attr("action", "/System/SmsPatternRecords");
    });

    $("#searchUsers").on("click", function () {
        var userList = document.getElementById("userList");
        var option = {
            selectObj: userList,
            url: "/User/GetUserList",
            data: { UserCode: $.trim($("#likeUserCode").val()) },
            valueName: "Id",
            htmlName: function (data) {
                return data["UserCode"] + " [" + data["UserName"] + "] "
            }
        };
        $.selectListLoad(option);
    });

    $("#searchUsersOne").on("click", function () {
        var userList = document.getElementById("userListOne");
        var option = {
            selectObj: userList,
            url: "/User/GetUserList",
            data: { UserCode: $.trim($("#likeUserCodeOne").val()) },
            valueName: "Id",
            htmlName: function (data) {
                return data["UserCode"] + " [" + data["UserName"] + "] "
            }
        };
        $.selectListLoad(option);
    });

    $("#uploadBtn").on("click", function () {
        if ($("#patternFile").val() == "") {
            $("#uploadNotifi").html("未选择文件");
            return false;
        } else {
            $("#uploadNotifi").html($("<img/>").attr("src", "/content/images/load.gif"));
        }
    });

    (function (box) {
        box.beforeOpen = function () {
            this.tmpDataFor = this.sourceObj.attr("data-for");
        };
        box.submit = function () {
            var user = $("#userList");
            var target = $(this.tmpDataFor);
            target.val(user.find("option:selected").text().replace(/\]\s/g, '];'));
            target.next().val(user.val());
        };
        box.reset = function () {
            delete this.tmpDataFor;
        };
    })(jsBox["userSelector"]);

    (function (box) {
        box.beforeOpen = function () {
            this.tmpDataFor = this.sourceObj.attr("data-for");
        };
        box.submit = function () {
            var user = $("#userListOne");
            var target = $(this.tmpDataFor);
            var uid = user.val();
            if (uid) {
                target.val(user.find("option:selected").text());
                target.next().val(uid);
                if (box.targetObj[0].id == "templateMod") {
                    loadPipeByUser(uid);
                }
            }
        };
        box.reset = function () {
            delete this.tmpDataFor;
        };
    })(jsBox["userSelectorOne"]);

    (function (box) {
        box.beforeOpen = function () {
            var id = this.targetObj.find("[name='hidUserId']").val();
            var pipe = document.getElementById("basePipeId");
            if (id == "") return false;
            var option = {
                selectObj: pipe,
                url: "/system/getpipelist",
                data: {
                    uid: id
                },
                htmlName: function (data) {
                    return data["PipeId"] + " " + data["PipeName"]
                },
                valueName: "PipeId"
            };
            $.selectListLoad(option);
            this.tmpDataFor = this.sourceObj.attr("data-for");
        };
        box.submit = function () {
            var pipe = $("#basePipeId");
            var target = $(this.tmpDataFor);
            var pipes = pipe.find("option:selected");
            var pipeStr = "";
            for (var i = 0, len = pipes.length; i < len; i++) {
                pipeStr += pipes.eq(i).text() + ";";
            }
            target.val(pipeStr);
            target.next().val(pipe.val());
        };
        box.reset = function () {
            delete this.tmpDataFor;
        };
    })(jsBox["channelSelector"]);

    (function (box) {
        var patternContent = document.querySelector("#patternContent");
        var addRecordVerify = new Verify();
        addRecordVerify.init({
            form: "#addRecordForm",
            setting: {
                auto: false,
                trim: true
            },
            customChk: function () {
                var userInput = $("#recordUser"),
                    pipeInput = $("#recordPipe");
                var user = userInput.val(),
                    userId = userInput.next().val(),
                    pipe = pipeInput.val(),
                    pipeId = pipeInput.next().val();
                var isAllPipe = $("#addRecordForm").find("[name='isAllPipe']")[0].checked,
                    isAllUser = $("#addRecordForm").find("[name='isAllUser']")[0].checked;
                user = user.replace(/\;/g, "");
                pipe = pipe.replace(/\;/g, "");
                userId = userId.replace(/\,/g, "");
                pipeId = pipeId.replace(/\,/g, "");
                if (!isAllUser && ($.trim(user) == "" || $.trim(userId) == "")) {
                    addRecordVerify.showTips(userInput, "未选择用户！");
                    return false;
                }
                if (!isAllPipe && ($.trim(pipe) == "" || $.trim(pipeId) == "")) {
                    addRecordVerify.showTips(pipeInput, "未选择通道！");
                    return false;
                }
                var content = $.trim(patternContent.value);
                if (/^(\\A)*(\\Z)*$/.test(content) && patterMode == 1) {
                    addRecordVerify.showTips($(patternContent), "格式不正确！");
                    return false;
                }
                return true;
            }
        });
        box.submit = function () {
            this.autoClose = false;
            var content = $.trim(patternContent.value);
            var keywords = [], i, len;
            if (!/^\\A/.test(content) && patterMode == 1) {
                content = "\\A" + content;
            }
            if (!/\\Z$/.test(content) && patterMode == 1) {
                content = content + "\\Z";
            }
            if (!addRecordVerify.chkForm()) {
                return false;
            }
            if (!/^[^|]{1,}(\|[^|]{1,})*$/.test(content) && patterMode == 2) {
                addRecordVerify.showTips($(patternContent), "格式不正确！");
                return false;
            } else if (patterMode == 2) {
                keywords = content.split("|");
                for (i = 0, len = keywords.length; i < len; i++) {
                    keywords[i] = ".*" + keywords[i];
                }
                content = "(?!" +
                    keywords.join("|") +
                    ")^.*$";
            }
            patternContent.value = content;
            var addRecordFormOption = {
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    switch (parseInt(res["Result"])) {
                        case 0:
                            alert("添加成功！");
                            document.location.reload();
                            break;
                        case 1:
                            alert("未选择用户！");
                            break;
                        case 2:
                            alert("未选择通道！");
                            break;
                        case 3:
                            alert("未填写模板内容！");
                            break;
                        case 4:
                            alert("用户选择出错，请联系管理员！");
                            break;
                        case 5:
                            alert("功能异常，添加失败，请联系管理员！");
                            break;
                        case 6:
                            alert("移动扩展号码必须是数字！");
                            break;
                        case 7:
                            alert("联通扩展号码必须是数字！");
                            break;
                        case 8:
                            alert("电信扩展号码必须是数字！");
                            break;
                        default:
                            alert("程序异常！请联系管理员！");
                            break;
                    }
                    box.submitObj.removeClass("gs-disabled-button");
                    box.close();
                },
                error: function (req) {
                    alert("连接超时");
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };
            this.submitObj.addClass("gs-disabled-button");
            $("#addRecordForm").ajaxSubmit(addRecordFormOption);
        };
        box.reset = function () {
            addRecordVerify.hideTips();
            var row1 = this.boxObj.find(".selectPipeRow");
            var row2 = this.boxObj.find(".selectUserRow");
            var txt1 = this.boxObj.find("[name='channel']");
            var txt2 = this.boxObj.find("[name='user']");
            var hid1 = this.boxObj.find("[name='hidChannelId']");
            var hid2 = this.boxObj.find("[name='hidUserId']");
            var sub = this.boxObj.find("[name='isChildValid']");
            row1.show();
            row2.show();
            txt1[0].disabled = false;
            txt2[0].disabled = false;
            hid1[0].disabled = false;
            hid2[0].disabled = false;
            sub[0].disabled = false;
        };
        $(".input-reg").on("click", function () {
            if (patternContent.value == "") {
                insertAtCursor(patternContent, "\\A");
            }
            var reg = $(this).data("reg"),
                content, n;
            if (reg == "\\A") {
                content = patternContent.value;
                if (/^\\A/.test(content)) return false;
                patternContent.value = "\\A" + content;
            } else if (reg == ".{1,n}") {
                n = prompt("请长度n的值", "0");
                if (n != null) {
                    insertAtCursor(patternContent, ".{1," + n + "}");
                }
            } else if (reg == "\\Z") {
                content = patternContent.value;
                if (/\\Z$/.test(content)) return false;
                patternContent.value = content + "\\Z";
            } else {
                insertAtCursor(patternContent, $(this).data("reg"));
            }
        });
        $(patternContent).on("keydown", function (e) {
            e = e || window.event;
            if (e.which == 13 && patterMode == 1) {
                insertAtCursor(patternContent, "(\\r\\n|\\n)");
                common.stopDefault(e);
            }
        }).on("focus", function () {
            if ($(this).val() == "" && patterMode == 1) {
                insertAtCursor(patternContent, "\\A");
            }
        });
    })(jsBox["record"]);

    (function (box) {
        var batchRecordVerify = new Verify();
        batchRecordVerify.init({
            form: "#batchRecordForm",
            setting: {
                auto: false,
                trim: true
            },
            customChk: function () {
                var userInput = $("#batchRecordUser"),
                    pipeInput = $("#batchRecordPipe"),
                    file = $("#filePath"),
                    fileUpload = $("#patternFile");
                var user = userInput.val(),
                    userId = userInput.next().val(),
                    pipe = pipeInput.val(),
                    pipeId = pipeInput.next().val();
                var isAllPipe = $("#batchRecordForm").find("[name='isAllPipe']")[0].checked,
                    isAllUser = $("#batchRecordForm").find("[name='isAllUser']")[0].checked;
                user = user.replace(/\;/g, "");
                pipe = pipe.replace(/\;/g, "");
                userId = userId.replace(/\,/g, "");
                pipeId = pipeId.replace(/\,/g, "");
                if ($.trim(file.val()) == "") {
                    batchRecordVerify.showTips(fileUpload, "未上传模板文件！");
                    return false;
                }
                if (!isAllUser && ($.trim(user) == "" || $.trim(userId) == "")) {
                    batchRecordVerify.showTips(userInput, "未选择用户！");
                    return false;
                }
                if (!isAllPipe && ($.trim(pipe) == "" || $.trim(pipeId) == "")) {
                    batchRecordVerify.showTips(pipeInput, "未选择通道！");
                    return false;
                }
                return true;
            }
        });
        box.submit = function () {
            var batchRecordFormOption = {
                beforeSubmit: function () {
                    if (batchRecordVerify.chkForm()) {
                        return true;
                    } else {
                        box.submitObj.removeClass("gs-disabled-button");
                        return false;
                    }
                },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    switch (parseInt(res["Result"])) {
                        case 0:
                            alert("添加成功！");
                            document.location.reload();
                            break;
                        case 1:
                            alert("未选择用户！");
                            break;
                        case 2:
                            alert("未选择通道！");
                            break;
                        case 3:
                            alert("未上传模板文件！");
                            break;
                        case 4:
                            alert("用户选择出错，请联系管理员！");
                            break;
                        case 5:
                            alert("功能异常，添加失败，请联系管理员！");
                            break;
                        case 6:
                            alert("模板文件内容不能为空！");
                            break;
                        default:
                            alert("程序异常！请联系管理员！");
                            break;
                    }
                    box.submitObj.removeClass("gs-disabled-button");
                    box.close();
                },
                error: function (req) {
                    alert("连接超时");
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            $("#batchRecordForm").ajaxSubmit(batchRecordFormOption);
        };
        box.reset = function () {
            batchRecordVerify.hideTips();
            var row1 = this.boxObj.find(".selectPipeRow");
            var row2 = this.boxObj.find(".selectUserRow");
            var txt1 = this.boxObj.find("[name='channel']");
            var txt2 = this.boxObj.find("[name='user']");
            var hid1 = this.boxObj.find("[name='hidChannelId']");
            var hid2 = this.boxObj.find("[name='hidUserId']");
            var sub = this.boxObj.find("[name='isChildValid']");
            row1.show();
            row2.show();
            txt1[0].disabled = false;
            txt2[0].disabled = false;
            hid1[0].disabled = false;
            hid2[0].disabled = false;
            sub[0].disabled = false;
            $.clearDomElement(document.getElementById("previewFile"));
        };
    })(jsBox["batchRecord"]);

    (function (box) {
        var templateModVerify = new Verify();
        templateModVerify.init({
            form: "#templateModForm",
            setting: {
                auto: false,
                trim: true
            }
        });

        //窗体设置
        box.beforeOpen = function () {
            var id = this.sourceObj.attr("data-id");
            loadTemplateInfo(id);
        };
        box.submit = function () {
            var templateModFormOptions = {
                beforeSubmit: function () {
                    if (templateModVerify.chkForm()) {
                        return true;
                    } else {
                        box.submitObj.removeClass("gs-disabled-button");
                        return false;
                    }
                },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    switch (parseInt(res["Result"])) {
                        case 0:
                            alert("修改失败！");
                            break;
                        case 1:
                            alert("修改成功！");
                            window.location.reload();
                            break;
                        case 2:
                            alert("必须选择用户！");
                            break;
                        case 3:
                            alert("选择用户出错，请联系管理员！");
                            break;
                        case 4:
                            alert("模板内容不能为空！");
                            break;
                        case 5:
                            alert("参数错误，请联系管理员！");
                            break;
                        case 6:
                            alert("移动扩展号必须为数字！");
                            break;
                        case 7:
                            alert("联通扩展号必须为数字！");
                            break;
                        case 8:
                            alert("电信扩展号必须为数字！");
                            break;
                        default:
                            alert("未知错误！");
                            break;
                    }
                    box.submitObj.removeClass("gs-disabled-button");
                },
                error: function (req) {
                    alert("连接超时");
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            var form = $("#templateModForm");
            form.ajaxSubmit(templateModFormOptions);
        };
        box.reset = function () {
            templateModVerify.hideTips();
        };
    })(jsBox["templateMod"]);

    //删除模板
    $(".delBtn").click(function () {
        if (!confirm("是否确认要删除？")) {
            return false;
        }

        var option = {
            url: '/System/DeletePattern',
            data: { patternId: $(this).attr("patternId") },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                if (res["Result"] == "1") {
                    alert("删除成功！");
                    reload(1);
                } else {
                    alert("删除失败！");
                }
            }
        };

        $.ajax(option);
    });

    //删除本页
    $(".batchDelete").click(function () {
        if (!confirm("确定要删除本页？")) {
            return false;
        }

        $.ajax({
            url: '/System/BatchDeletePattern',
            data: { patternIds: $('#patternIds').val() },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                if (res["Result"] == "1") {
                    alert("删除成功！");
                    reload(0);
                } else {
                    alert("删除失败！");
                }
            }
        });
    });

    //模板修改信息载入
    function loadTemplateInfo(id) {
        var option = {
            url: "/System/LoadPattern",
            data: {
                patternId: id
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                var dataJSON = res["Result"];
                var pattern = dataJSON["Pattern"];
                var userId = dataJSON["User"]["id"];
                loadPipeByUser(userId, pattern["PipeID"].toString());
                $("#tmpModId").val(pattern["Id"]);
                $("#modIsChildValid")[0].checked = !!pattern["isForceSubAccount"];
                $("#tplModUser").val(pattern["UserCode"]);
                $("#tplModUserId").val(userId);
                $("#tplModContent").text(pattern["pattern"]);
                $("#tplModUserExt").val(pattern["userExt"]);
                $("#tplModUserExtLT").val(pattern["userExtLT"]);
                $("#tplModUserExtDX").val(pattern["userExtDX"]);
            }
        };
        $.ajax(option);
    }

    //模板修改通道载入
    function loadPipeByUser(uid, initValue) {
        var pipe = document.getElementById("modPipeId");
        var option = {
            selectObj: pipe,
            url: "/system/getpipelist",
            data: {
                uid: uid
            },
            titleName: ["0", "全部通道"],
            htmlName: function (data) {
                return data["PipeId"] + " " + data["PipeName"]
            },
            valueName: "PipeId",
            initialValue: initValue
        };
        $.selectListLoad(option);
    }

    //重新加载 0:直接前一页 1:判断是否还有数据再决定是否前一页
    function reload(delNum) {
        var url, patternIds = $("#patternIds").val();
        if (delNum == 0) {
            url = common.setUrlParameter("pn", (common.getUrlParameter("pn") > 1 ? common.getUrlParameter("pn") - 1 : common.getUrlParameter("pn")));
            location.href = url;
        } else if (delNum > 0) {
            if (patternIds.length > 0
                && patternIds.split(',').length == delNum
                && common.getUrlParameter("pn") > 1) {
                url = common.setUrlParameter("pn", common.getUrlParameter("pn") - 1);
                location.href = url;
            } else {
                location.reload();
            }
        }
    }

    function insertAtCursor(myField, myValue, sel) {
        //ie
        if (document.selection) {
            myField.focus();
            sel = sel || document.selection.createRange();
            sel.text = myValue;
            sel.select();
        }
        //标准
        else if (myField.selectionStart || myField.selectionStart == '0') {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;
            var restoreTop = myField.scrollTop;
            myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
            if (restoreTop > 0) {
                myField.scrollTop = restoreTop;
            }
            myField.focus();
            myField.selectionStart = startPos + myValue.length;
            myField.selectionEnd = startPos + myValue.length;
        } else {
            myField.value += myValue;
            myField.focus();
        }
    }

    window.addEventListener("message", function(e) {
        if(e.data == "preview") previewFileContent();
    });

    function previewFileContent() {
        var tpl = function (data) {
            return '<tr>' +
                '<td>' + data["Content"] + '</td>' +
                '<td>' + data["YDExtNo"] + '</td>' +
                '<td>' + data["LTExtNo"] + '</td>' +
                '<td>' + data["DXExtNo"] + '</td>' +
                '</tr>';
        };
        var list = document.querySelector("#previewFile");
        var option = {
            url: "/System/PreviewFileContent",
            data: {
                filePath: $("#filePath").val()
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                $.clearDomElement(list);
                var data = res["InfoList"];
                var i, len, item;
                var htmlStr = "<tr>" +
                    "<td>内容</td>" +
                    "<td>移动</td>" +
                    "<td>联通</td>" +
                    "<td>电信</td>" +
                    "</tr>";
                if (data != null && data.length > 0) {
                    for (i = 0, len = data.length; i < len; i++) {
                        item = data[i];
                        htmlStr += tpl(item);
                    }
                    $(list).append(htmlStr);
                }
            }
        };
        $.ajax(option);
    }
});