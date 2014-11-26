require.config({
    baseUrl: "/scripts/lib",
    shim: {
        'upload': ['jquery']
    }
});

require(["jquery", "common", "jswindow", "page", "switcher", "upload", "calendar"],
    function ($, common, jsw, Page, switcher, upload, calendar) {
    var jsBox = jsw.init();

    var groupPreview, prewCodeObj;

    var btnSendSms = document.querySelector("#btnSendSms"),
        btnUploadDes = document.querySelector("#btnUploadDes"),
        selUserPipe = document.querySelector("#selUserPipe"),
        DDLGroups = document.querySelector("#DDLGroups"),
        hidSendType = document.querySelector("#hidSendType"),
        txtSmsContent = document.querySelector("#txtSmsContent"),
        timingRadio = document.getElementsByName("selPre"),
        txtPreTime = document.querySelector("#txtPreTime"),
        selInsert = document.querySelector("#selInsert");

    $("[data-date]").on("click", function (e) {
        calendar.target(e, 2, "later");
    });

    (function (box) {
        //选择联系组
        box.beforeOpen = function () {
            var groupList = document.querySelector("#groupList");
            var option = {
                selectObj: groupList,
                url: "/sms/getcontactgrouplist",
                htmlName: "GroupName",
                valueName: "GroupCode"
            };
            $.selectListLoad(option);
        };

        //选中联系组
        box.submit = function () {
            var groupId = document.getElementById("groupList").value;
            $("#groupId").val(groupId);
            var option = {
                url: "/sms/getcontactdatalist",
                data: {
                    groupCode: groupId
                },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    var head = res["Result"]["FieldList"],
                        list = res["Result"]["InfoList"];
                    var selOption = {
                        selectObj: selInsert,
                        presentData: head,
                        htmlName: "FieldName",
                        valueName: "FieldCode",
                        titleName: "请选择"
                    };
                    $.selectListLoad(selOption);
                    buildPreviewTable(head, list);
                }
            };
            $.ajax(option);
        };
        //更新联系组预览表格
        function buildPreviewTable(head, list) {
            prewCodeObj = {};
            groupPreview = list;
            var groupPreviewHead = document.querySelector("#groupPreviewHead"),
                groupPreviewList = document.querySelector("#groupPreviewList"),
                col, cell, item, i, j, len;
            $.clearDomElement(groupPreviewHead);
            $.clearDomElement(groupPreviewList);
            col = document.createElement("tr");
            for (i = 0, len = head.length; i < len; i++) {
                cell = document.createElement("th");
                cell.innerHTML = head[i]["FieldName"];
                col.appendChild(cell);
                prewCodeObj[head[i]["FieldCode"]] = head[i]["FieldIndex"];
            }
            groupPreviewHead.appendChild(col);

            for (i = 0, len = groupPreview.length; i < len; i++) {
                item = groupPreview[i];
                col = document.createElement("tr");
                for (j = 0; j < head.length; j++) {
                    cell = document.createElement("td");
                    cell.innerHTML = item["Field" + head[j]["FieldIndex"]];
                    col.appendChild(cell);
                }
                groupPreviewList.appendChild(col);
            }
        }
    })(jsBox["selectGroup"]);

    (function (box) {
        //常用短信功能
        var pageBar = [
            new Page("customListPage", "customList", getSMSList),
            new Page("commonListPage", "commonList", getSMSList)
        ];

        box.beforeOpen = function () {
            var customCat = document.querySelector("#customCat");
            var commonCat = document.querySelector("#commonCat");
            var option1 = {
                selectObj: customCat,
                url: "/sms/getcommonsms",
                data: { sLType: 0 },
                htmlName: "GName",
                valueName: "SLGid",
                callback: function () {
                    $(customCat).change();
                }
            };
            var option2 = {
                selectObj: commonCat,
                url: "/sms/getcommonsms",
                data: { sLType: 1 },
                htmlName: "GName",
                valueName: "SLGid",
                callback: function () {
                    $(commonCat).change();
                }
            };
            $.selectListLoad(option1);
            $.selectListLoad(option2);
        };

        box.reset = function () {
            pageBar[0].clear();
            pageBar[1].clear();
        };

        $("#customCat").on("change", function () {
            getCatList($(this).val(), 0);
        });
        $("#commonCat").on("change", function () {
            getCatList($(this).val(), 1);
        });

        //获取常用短信列表
        function getCatList(id, isCommon) {
            var options = {
                url: "/ajax/ajax_getsmslibraryinfolist.ashx",
                data: {
                    typeId: id,
                    isCommon: isCommon, //是否为常用短信 0否 1是
                    ps: 5
                },
                amountName: "Amount",
                infoListName: "SmsInfoList",
                pageName: "pn"
            };
            pageBar[isCommon].load(options);
        }

        //渲染列表
        function getSMSList(data, contain) {
            var $contain = $(contain);
            var line, cell1, cell2, cell3, btnSelector;
            var dataJSON = data;
            var item, i, len;
            for (i = 0, len = dataJSON.length; i < len; i++) {
                item = dataJSON[i];
                line = $("<tr></tr>");
                cell1 = $("<td></td>").html(item["Id"]);
                cell2 = $("<td></td>").html(item["Content"]);
                cell3 = $("<td></td>");
                btnSelector = $("<a></a>").html("选择").attr("href", "#").data("id", item["Id"]).data("con", item["Content"]);
                btnSelector.click(function () {
                    SelectSMS($(this).data("id"), $(this).data("con"));
                    box.close();
                    return false;
                });
                cell3.append(btnSelector);
                line.append(cell1).append(cell2).append(cell3);
                $contain.append(line);
            }
        }
        //获得选择短信
        function SelectSMS(id, content) {
            txtSmsContent.value = content;
        }
    })(jsBox["smsLibrarys"]);

    (function (box) {
        //短信预览功能
        box.beforeOpen = function () {
            var preSmsContent = document.querySelector("#preSmsContent");
            $.clearDomElement(preSmsContent);
            var tmpl, fullHTML = "", item, i, len;
            if (hidSendType.value == 0) {
                if (txtSmsContent.value != "" && groupPreview != undefined) {
                    for (i = 0, len = groupPreview.length; i < len; i++) {
                        item = groupPreview[i];
                        tmpl = txtSmsContent.value;
                        tmpl = tmpl.replace(/\{(\w+?)\}/g, function (match, code) {
                            var field = "Field" + prewCodeObj[code];
                            return item[field] == undefined ? match : item[field];
                        });
                        fullHTML += "<tr>";
                        fullHTML += "<td>" + (item["Field" + prewCodeObj["Mobile_"]] || "未设置") + "</td>";
                        fullHTML += "<td align='left'>" + tmpl + "</td>";
                        fullHTML += "</tr>";
                    }
                } else {
                    fullHTML = "<tr><td colspan='2'>您尚未填入内容或选择联系组</td></tr>";
                }
                $(preSmsContent).html(fullHTML);
            } else {
                var option = {
                    url: "/sms/previewindividualsmscontent",
                    data: { fp: $("#txtSavaFile").val() },
                    success: function (res) {
                        if (!common.chkResponse(res)) return false;
                        var item, i, len;
                        if (res["Result"]) alert(res["Result"]);
                        else {
                            for (i = 0, len = res["InfoList"].length; i < len; i++) {
                                item = res["InfoList"][i];
                                fullHTML += "<tr>";
                                fullHTML += "<td>" + item["Mobile"] + "</td>";
                                fullHTML += "<td align='left'>" + item["Content"] + "</td>";
                                fullHTML += "</tr>";
                            }
                            $(preSmsContent).html(fullHTML);
                        }
                    }
                };
                $.ajax(option);
            }
        };

        box.reset = function () {
            var preSmsContent = document.getElementById("preSmsContent");
            $(preSmsContent).html("");
        };
    })(jsBox["preview"]);

    //选择发送方式
    $("#selSendType").children().on("click", function () {
        hidSendType.value = $(this).index();
    });

    //选择发送通道
    selUserPipe.onchange = function () {
        document.querySelector("#pipeDescribe").value = this.options[this.selectedIndex].getAttribute("data-info");
    };

    //定时设置
    timingRadio[0].onclick = function () {
        document.querySelector("#timingSetting").style.display = "none";
        document.querySelector("#txtPreTime").disabled = true;
    };
    timingRadio[1].onclick = function () {
        document.querySelector("#timingSetting").style.display = "inline";
        document.querySelector("#txtPreTime").disabled = false;
    };

    $(selInsert).on("change", function (e) {
        if (this.value != "") {
            insertAtCursor(txtSmsContent, "{" + this.value + "}");
        }
        $(this).val("");
        common.stopDefault(e);
    });

    function insertAtCursor(myField, myValue) {
        //ie
        if (document.selection) {
            myField.focus();
            var sel = document.selection.createRange();
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

    //个性化文件上传
    btnUploadDes.onclick = toUpload;
    function toUpload() {
        if (document.getElementById("fileDesNoFile").value == "")
            alert("没有选择要上传的号码文件!");
        else
            ajaxFileUpload();
    }
    function ajaxFileUpload() {
        var HidPath = document.getElementById("HidPath"),
            uploadInfo = document.getElementById("upInfo");
        btnUploadDes.disabled = true;
        btnSendSms.disabled = true;
        uploadInfo.innerHTML = "正在上传处理.....";
        $.ajaxFileUpload({
            type: "POST",
            url: '/user/doUpLoadFile.aspx',
            data: {
                flag: 1,
                pipeSet: selUserPipe.value,
                selPre: timingRadio.value,
                preTime: txtPreTime.value
            },
            secureuri: false,
            fileElementId: 'fileDesNoFile',
            dataType: 'utf-8',
            success: function (data, status) {
                var stringArray = data.split("|");
                if (stringArray[0] == "1") {
                    //stringArray[0]    成功状态(1为成功，0为失败)
                    //stringArray[1]    上传成功的文件名
                    //stringArray[2]    消息提示
                    HidPath.value = stringArray[1];
                    uploadInfo.innerHTML = stringArray[2];
                } else {
                    uploadInfo.innerHTML = "数据有误：" + stringArray[2];
                }
            },
            error: function (data, status, e) {
                uploadInfo.innerHTML = "数据有误：" + data;
            }
        });
        btnUploadDes.disabled = false;
        btnSendSms.disabled = false;
        return false;
    }

    //发送验证
    btnSendSms.onclick = chkSend;
    function chkSend() {
        var filePath, groupId, selUserPipe, timingTime;
        if (confirm("确定要发送吗?")) {
            filePath = $.trim(document.getElementById("HidPath").value);
            groupId = document.getElementById("groupId").value;
            selUserPipe = document.querySelector("#selUserPipe").value;
        } else {
            return false;
        }
        if (hidSendType.value == 1 && filePath.length == 0) {
            alert("对不起，请先上传文件。");
            return false;
        }
        if (hidSendType.value == 0) {
            if (groupId == "") {
                alert("未选择联系组！");
                return false;
            }
            if (txtSmsContent.value == "") {
                alert("未填写发送内容！");
                return false;
            }
        }
        if (selUserPipe == "" || parseInt(selUserPipe, 10) < 1) {
            alert("对不起，请先选择发送通道!");
            return false;
        }
        if (timingRadio[1].checked) {
            timingTime = txtPreTime.value;
            if (timingTime == "") {
                alert("没有选择定时发送时间!");
                return false;
            } else if (new Date(timingTime).getTime() < new Date().getTime()) {
                alert("定时时间需大于当前时间！");
                return false;
            }
        }
        return true;
    }

    //提交前改变提交action
    $("#sendSmsForm").submit(function () {
        var sendType = hidSendType.value;
        if (sendType == "0") {
            //在线发送
            $(this).attr("action", "/sms/individualsendonlinesave");
        } else {
            //文件发送
            $("#HidPath").val($("#txtSavaFile").val());
            $(this).attr("action", "/sms/individualsendfilesave");
        }
    });
});