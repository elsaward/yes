require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'upload': ['jquery']
    }
});

require(['jquery', 'common', 'jswindow', 'verify', 'numberDeal', 'upload', 'switcher', 'calendar', 'page'],
function ($, common, jsw, Verify, number, upload, switcher, calendar, Page) {
    var jsBox = jsw.init();

    var verify = new Verify();
    verify.init();

    var btnListUpload = document.querySelector("#btnListUpload"),
        btnSendSms = document.querySelector("#btnSendSms"),
        selUserPipe = document.querySelector("#selUserPipe"),
        DDLGroups = document.querySelector("#DDLGroups"),
        hidSendType = document.querySelector("#hidSendType"),
        txtDesNo = document.querySelector("#txtDesNo"),
        txtSmsContent = document.querySelector("#txtSmsContent"),
        txtPreTime = document.querySelector("#txtPreTime"),
        hidGroupName = document.querySelector("#HiddenGroupName"),
        saveFile = document.querySelector("#SavaFile"),
        fileDesNoFile = document.querySelector("#fileDesNoFile");

    //选择发送方式
    $("#selSendType").children().on("click", function() {
        hidSendType.value = parseInt($(this).index()) + 1;
    });

    $("[data-date]").on("click", function (e) {
        calendar.target(e, 2, "later");
    });

    $("#btnClearContent").on("click", function(e) {
        txtSmsContent.value = "";
        countSmsContent();
        if(txtSmsContent.disabled) txtSmsContent.value = "请选择通道";
        common.stopDefault(e);
    });

    (function (box) {
        //常用短信功能
        var pageBar = [
            new Page("customListPage", "customList", getSMSList),
            new Page("commonListPage", "commonList", getSMSList)
        ];

        box.beforeOpen = function () {
            var customCat = document.querySelector("#customCat");
            var commonCat = document.querySelector("#commonCat");
            if(txtSmsContent.disabled) {
                alert("请先选择通道");
                return false;
            }
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
                    SelectSMS($(this).data("con"));
                    box.close();
                    return false;
                });
                cell3.append(btnSelector);
                line.append(cell1).append(cell2).append(cell3);
                $contain.append(line);
            }
        }
        //获得选择短信
        function SelectSMS(content) {
            txtSmsContent.value = content;
            countSmsContent();
        }
    })(jsBox["smsLibrarys"]);

    (function (box) {
        var ifr = $("#preFrame");
        box.beforeOpen = function () {
            var cont = $.trim(txtSmsContent.value);
            var userPipe = $.trim(selUserPipe.value);
            if(txtSmsContent.disabled) {
                alert("请先选择通道");
                return false;
            }
            ifr.width(350);
            ifr.height(200);
            ifr.attr("src", "/user/preViewSms.aspx?Cont=" + encodeURIComponent(cont) + "&Pipe=" + userPipe);
        };
        box.reset = function () {
            ifr.attr("src", "");
        }
    })(jsBox["preSms"]);

    //号码文件上传
    btnListUpload.onclick = toUpload;
    function toUpload() {
        if (fileDesNoFile.value == "") {
            verify.showTips($(fileDesNoFile), "没有选择要上传的号码文件!");
        }else{
            ajaxFileUpload();
        }
    }
    function ajaxFileUpload() {
        var uploadInfo = document.getElementById("upInfo");
        btnListUpload.disabled = true;
        btnSendSms.disabled = true;
        uploadInfo.innerHTML = "<img src='/content/images/load.gif'>&nbsp;<span class='gs-text-gray'>正在上传处理.....</span>";
        $.ajaxFileUpload({
            url: "doUpLoadFile.aspx",
            secureuri: false,
            fileElementId: "fileDesNoFile",
            dataType: "utf-8",
            success: function (data) {
                var stringArray = data.split("|");
                if (stringArray[0] == "1") {
                    //stringArray[成功状态(1为成功，0为失败),上传成功的文件名,消息提示]
                    uploadInfo.innerHTML = stringArray[2];
                    saveFile.value = document.getElementById("txtSavaFile").value;
                } else {
                    uploadInfo.innerHTML = "<span class='gs-text-gray'>文件上传处理失败," + data + "</span>";
                }
                btnListUpload.disabled = false;
                btnSendSms.disabled = false;
            },
            error: function (data) {
                uploadInfo.innerHTML = "<span class='gs-text-gray'>文件上传处理失败," + data + "</span>";
                btnListUpload.disabled = false;
                btnSendSms.disabled = false;
            }
        });
        return false;
    }

    //选择发送通道
    selUserPipe.onchange = selPipe;
    function selPipe() {
        var pipeId = selUserPipe.value,
            pipeDescribe = document.getElementById("pipeDescribe"),
            infoArray = document.getElementById("HidInfoName").value.split(";"),
            minStandCount = document.getElementById("minStandCount"),
            minLongCount = document.getElementById("minLongCount");
        var i,info,val,str;
        if (pipeId == "0") {
            txtSmsContent.value = txtSmsContent.value || "请选择通道";
            txtSmsContent.disabled = true;
            return false;
        }
        //显示通道描述
        if (pipeId == "")
            str = "--";
        else {
            for (i = 0; i < infoArray.length; i++) {
                info = infoArray[i];
                if (info.indexOf("|") > 0) {
                    val = info.split('|');
                    if (pipeId == val[0]) {
                        str = val[1];
                        break;
                    }
                }
            }
            if ($.trim(str).length == 0) str = "无";
        }
        pipeDescribe.innerHTML = str;
        //获取通道短信长度
        $.ajax({
            url: "/Ajax/Ajax_PipeContentLengthStandard.ashx",
            data: { "pipeId": pipeId },
            success: function (data) {
                data = $.parseJSON(data);
                minStandCount.value = data["minStandCount"];
                minLongCount.value = data["minLongCount"];
                document.querySelector("#countInPipe").innerHTML = data["itemCount"];
                if (data["minStandCount"] == 0) {
                    alert("该通道不可用！");
                    txtSmsContent.value = txtSmsContent.value || "请选择通道";
                    txtSmsContent.disabled = true;
                } else {
                    //解除对文本框的限制
                    if (txtSmsContent.value == "请选择通道") {
                        txtSmsContent.value = "";
                    }
                    txtSmsContent.disabled = false;
                    //更新短信内容长度
                    textCounterOld(txtSmsContent, "Word_Length", "Sms_Count");
                }
            },
            error: function () {
                alert("服务出错，请联系管理员！");
            }
        });
    }

    //计算短信字数
    txtSmsContent.onkeyup = countSmsContent;
    txtSmsContent.onpaste = function() {
        setTimeout(countSmsContent,100);
    };
    function countSmsContent() {
        textCounterOld(txtSmsContent,"Word_Length","Sms_Count");
    }
    function textCounterOld(obj, wordLabID, smsLabID) {
        var len = strLen(obj.value);
        var wordLab = document.getElementById(wordLabID),
            smsLab = document.getElementById(smsLabID),
            minStandCount = document.getElementById("minStandCount"),
            minLongCount = document.getElementById("minLongCount");
        wordLab.innerHTML = "【"+len+"】字";
        if (len > minStandCount.value) {
            if (minLongCount.value != "0") {
                smsLab.innerHTML = "【" + Math.ceil(len / minLongCount.value) + "】条短信费";
            } else {
                smsLab.innerHTML = "不支持长短信"
            }
        } else if (len > 0) {
            smsLab.innerHTML = "【1】条短信费";
        } else {
            smsLab.innerHTML = "【0】条短信费";
        }
    }
    //统计字符长度
    function strLen(str) {
        var charset = document.charset;
        var len = 0, i, strLength;
        for (i = 0,strLength = str.length; i < strLength; i++) {
            len += str.charCodeAt(i) < 0 || str.charCodeAt(i) > 255 ? (charset == "utf-8" ? 1 : 1) : 1;
        }
        return len;
    }

    //发送时间 选择
    $("[name=selPre]").on("click", function () {
        if (this.value == "1") {
            $("#timingSetting").show();
            txtPreTime.value = "";
        } else {
            $("#timingSetting").hide();
        }
    });

    //发送验证
    btnSendSms.onclick = chkForm;

    function chkForm() {
        return chkSend() && chkData();
    }

    function chkSend() {
        if (!confirm("确定要发送吗?")) {
            return false;
        }
        number.send();
        var sendType = hidSendType.value; //发送方式 1-号码  2-联系人组
        if (sendType == "1" && $.trim(txtDesNo.value) == "") {
            verify.showTips($(txtDesNo), "对不起，接收号码不能为空");
            return false;
        }else if (sendType == "2") {
            if(DDLGroups.value == "") {
                verify.showTips($(DDLGroups), "对不起，请选择联系人组");
                return false;
            }
            var group = [];
            var groupOption = DDLGroups.getElementsByTagName("option");
            var i, len = groupOption.length;
            for(i = 0; i < len; i++) {
                if(groupOption[i].selected) group.push(groupOption[i].value);
            }
            //获取联系人组
            hidGroupName.value = group.join(",");
        }else if (sendType == "3") {
            if(saveFile.value == "") {
                verify.showTips($(fileDesNoFile), "没有上传文件");
                return false;
            }
        }
        if (parseInt(selUserPipe.value, 10) < 1) {
            verify.showTips($(selUserPipe), "没有选择发送通道");
            return false;
        }
        if (txtSmsContent.value == "") {
            verify.showTips($(txtSmsContent), "短信内容不能为空");
            return false;
        }
        if (document.querySelector("#selPre_1").checked && txtPreTime.value == "") {
            verify.showTips($(txtPreTime), "没有选择定时发送时间");
            return false;
        }
        return true;
    }

    function chkData() {
        var lblNotice = document.getElementById("lblNotice");
        lblNotice.innerHTML = "<img src='/content/images/load.gif'>&nbsp;<span class='gs-text-danger'>请勿离开页面，正在进行数据验证处理.....</span>";
        if (strLen(txtSmsContent.value) > 70) {
            if (!confirm("注意：短信字数多余70个字,计费条数将超过1条,确定继续吗?")) {
                return false;
            }
        }
        var rt = "";
        $.ajax({
            async: false,
            url: "../Api/AjaxRequestHandle.ashx",
            timeout: 10000,
            dataType: "text",
            error: function () {
                lblNotice.innerHTML = "服务器请求超时";
                rt = "";
            },
            data: {
                op: "CheckSend",
                sendTp: hidSendType.value,
                desGp: hidGroupName.value,
                pipeSet: selUserPipe.value,
                desNo: $.trim(txtDesNo.value),
                content: $.trim(txtSmsContent.value),
                selPre: document.querySelector("#selPre_0").checked ? 0 : 1,
                preTime: txtPreTime.value,
                useType: 1
            },
            success: function (res) {
                if (res == "1") {
                    rt = "1";
                }
                else {
                    switch (res) {
                        case "0":
                            rt = "对不起，没有输入定时时间";
                            break;
                        case "-1":
                            rt = "对不起，没有可用通道";
                            break;
                        case "-2":
                            rt = "对不起，短信内容未签名";
                            break;
                        case "-3":
                            rt = "对不起，签名符里没有签名内容";
                            break;
                        case "-4":
                            rt = "对不起，短信内容含有关键字";
                            break;
                        case "-5":
                            rt = "对不起，还没有选择联系组";
                            break;
                        case "-6":
                            rt = "对不起，该联系组里没有联系人";
                            break;
                        case "-7":
                            rt = "对不起，您的余额不足";
                            break;
                        case "-8":
                            rt = "对不起，总账户余额不足，请与上级管理员联系。";
                            break;
                        case "-10":
                            rt = "对不起，定时时间需大于当前时间";
                            break;
                        case "-11":
                            rt = "对不起，未知的时间设置";
                            break;
                        case "-12":
                            rt = "对不起，您提交的号码多于最大范围，请分批提交。";
                            break;
                        case "-13":
                            rt = "对不起，您提交的号码少于最低限度，请增加号码。";
                            break;
                        default:
                            rt = "对不起，服务器请求异常";
                            break;
                    }
                    lblNotice.innerHTML = rt;
                }
            }
        });
        return rt == "1";
    }
    /*********
     *  0   定时没有输入
     * -1   没有可用通道
     * -2   短信内容未签名
     * -3   签名符里没有签名内容
     * -4   短信内容含有关键字
     * -5   联系组为空(还没有选择联系组)
     * -6   该联系组里没有联系人
     * -7   余额不足
     * -8   上级账户余额不足
     * -10  定时时间需大于当前时间
     * -11  未知的时间设置
     * -12  号码多于最大范围
     * -13  号码少于最低限度
     * -100 服务器请求异常
     ***********/

});