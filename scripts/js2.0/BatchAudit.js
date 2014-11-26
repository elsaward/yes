require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'jswindow', 'common', 'verify', 'form'], function($, jsw, common, Verify, form) {
    var jsBox = jsw.init();
    var editIds = [];

    //基数 参考率 初始化
    var userCutBase = document.querySelector("#userCutBase");
    var userCutPercent = document.querySelector("#userCutPercent");
    var userPipe = document.querySelector("#userPipe");
    var user = $("#userList").data("init");
    if (user == "") {
        userCutBase.disabled = true;
        userCutPercent.disabled = true;
    }

    $("#userInfoModBtn").on("click", function (e) {
        if (user == "") {
            alert("请选择用户并查询！");
            return false;
        }
        if (userCutBase.value == "" || userCutPercent.value == "") {
            alert("基数或失败率不可为空！");
            return false;
        }
        var option = {
            url: "/batchaudit/batchmodifycutbyuser",
            data: {
                SendUser: user,
                CutBase: userCutBase.value,
                CutPercent: userCutPercent.value
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                location.reload();
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    $("#pipeModBtn").on("click", function(e) {
        var ids = [];
        var chkbox = $("[name='chk_list']:checked");
        var i, len = chkbox.length;
        for(i = 0; i < len; i++) {
            ids.push(chkbox.eq(i).val());
        }
        var option = {
            url: "/batchaudit/batchswitchpipeset",
            data: {
                chk_list: ids.join(","),
                changeUsePipe: userPipe.value
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                location.reload();
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    //全选
    $("#selAll").selAll("chk_list");
    $("[data-edit]").each(function () {
        var $this = $(this);
        var id = $this.parents("tr").eq(0).find("[name='chk_list']").val();
        $this.attr("data-id", "{InterSeqId:'" + id + "'}");
        $this.ajaxEdit({
            width: 26,
            url: "/BatchAudit/Update",
            pattern: /^\d+$/
        }, function (obj) {
            var line = obj.parents("tr");
            line.css({ "background": "#ffdddd" });
            if ($.inArray(obj.data("sn"), editIds) == -1) {
                editIds.push(obj.data("sn"));
            }
        });
    });
    $(".open-verify").on("click", function () {
        if ($("[name='chk_list']:checked").length != 0) {
            jsBox["main"].openSub("verifyConfirm", $(this));
        }
        return false;
    });
    $(".must-type").each(function () {
        if ($(this).data("value") == 2) {
            $(this)[0].checked = true;
        }
        $(this).click(function () {
            var $this = $(this);
            var mustType = "";
            if ($this[0].checked) {
                mustType = 2;
            }
            var option = {
                url: "/BatchAudit/SetMustType",
                data: {
                    id: $this.data("id"),
                    mustType: mustType
                },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    if (res["Result"].toLowerCase() == "false") {
                        alert("修改失败");
                        $this[0].checked = !$this[0].checked;
                    }
                },
                error: function (res) {
                    alert("连接超时");
                    $this[0].checked = !$this[0].checked;
                }
            };
            $.ajax(option);
        })
    });

    (function (box) {
        var verifyOptions = {
            form: "#verifyForm",
            customChk: function () {
                if ($.trim(idList.value) == "") {
                    return false;
                }
                if (isSendMessage.checked && $.trim(message.value) == "") {
                    verify.showTips($(message), "短信内容不可为空");
                    return false;
                }
                return true;
            }
        };
        var verify = new Verify();
        verify.init(verifyOptions);
        var InterSeqId = document.querySelector("#InterSeqId"),
            isSendMessage = document.querySelector("#isSendMessage"),
            idsConfirm = document.querySelector("#idsConfirm"),
            message = document.querySelector("#message"),
            appendMobile = document.querySelector("#appendMobile"),
            idList = document.querySelector("#idList");
        box.beforeOpen = function () {
            var verifyMsg = document.querySelector("#verifyMsg"),
                sendMessage = document.querySelector("#sendMessage"),
                verifyForm = document.querySelector("#verifyForm");
            var cPercent = $(".c-percent");
            var rPercent = $(".r-percent");
            var diff = [], i, len, item1, item2;
            for (i = 0, len = cPercent.length; i < len; i++) {
                item1 = cPercent.eq(i);
                item2 = rPercent.eq(i);
                if (item1.html() != item2.html()) diff.push(item1.data("sn"));
            }
            var verifyOption = this.sourceObj.attr("data-verify");
            var listData = getChkList();
            $(idList).val(listData[0]);
            $(appendMobile).val(listData[1]);
            idsConfirm.innerHTML = "记录【" + (editIds.sort().join(",") || "0条") + "】已被修改<br>" +
                "记录【" + (diff.join(",") || "0条") + "】的失败率与参考率数值不同";
            if (verifyOption == "pass") {
                verifyMsg.innerHTML = "审核通过";
                verifyForm.setAttribute("action", "/BatchAudit/BatchFileDeal?isDone=0");
                sendMessage.style.display = "none";
                this.boxObj.addClass("gs-mask-success");
                this.boxObj.removeClass("gs-mask-danger");
            } else {
                verifyMsg.innerHTML = "拒绝发送";
                verifyForm.setAttribute("action", "/BatchAudit/BatchFileDeal?isDone=-3");
                sendMessage.style.display = "block";
                this.boxObj.addClass("gs-mask-danger");
                this.boxObj.removeClass("gs-mask-success");
            }
            message.value = InterSeqId.value;
        };
        box.submit = function () {
            this.autoClose = false;
            if (!confirm(idsConfirm.innerHTML.replace(/<br>|<BR>/, "\n"))) {
                return false;
            }
            if (verify.chkForm()) {
                idsConfirm.innerHTML = "提交中...";
                $("#verifyForm").submit();
            }
        };
        box.reset = function () {
            isSendMessage.checked = false;
            InterSeqId.disabled = true;
            message.disabled = true;
            appendMobile.disabled = true;
            verify.hideTips();
        };
        //加载短信模板
        $(InterSeqId).on('change', function () {
            message.value = InterSeqId.value;
        });
        $(isSendMessage).on('click', function () {
            var isChecked = $(this)[0].checked;
            message.disabled = !isChecked;
            InterSeqId.disabled = !isChecked;
            document.querySelector("#appendMobile").disabled = !isChecked;
        });

        function getChkList() {
            var ids = [];
            var phones = [], phone;
            $("[name='chk_list']:checked").each(function () {
                ids.push($(this).val());
                phone = $(this).data("phone");
                if ($.inArray(phone, phones) == -1) {
                    phones.push(phone);
                }
            });
            return [ids.join(","), phones.join("\n")];
        }
    })(jsBox["verifyConfirm"]);

    (function (box) {
        var $ids = $("#idSeed");
        box.beforeOpen = function () {
            if ($("[name='chk_list']:checked").length == 0) {
                return false;
            }
            $ids.val(getChkList);
        };
        box.submit = function () {
            if ($ids.val() == "") {
                return false;
            }
            $("#seedForm").submit();
        };
        box.reset = function () {
            $ids.val("");
        };
        function getChkList() {
            var ids = [];
            $("[name='chk_list']:checked").each(function () {
                ids.push($(this).val());
            });
            return ids.join(",");
        }
    })(jsBox["getSeed"]);

    (function (box) {
        var $ids = $("#idWhiteList"),
            $whiteListForm = $("#whiteListForm");
        box.beforeOpen = function () {
            if ($("[name='chk_list']:checked").length == 0) {
                return false;
            }
            $ids.val(getChkList);
        };
        box.submit = function (e) {
            e = e || window.event;
            if ($ids.val() == "") {
                return false;
            }
            if (e.target.innerHTML == "开启") {
                $whiteListForm.attr("action", "/BatchAudit/BatchSetMustType");
            } else if (e.target.innerHTML == "禁止") {
                $whiteListForm.attr("action", "/BatchAudit/BatchSetMustType?mustType=2");
            }
            $whiteListForm.submit();
        };
        box.reset = function () {
            $ids.val("");
        };
        function getChkList() {
            var ids = [];
            $("[name='chk_list']:checked").each(function () {
                ids.push($(this).val());
            });
            return ids.join(",");
        }
    })(jsBox["whiteList"]);

    (function (box) {
        var txtContent = $("#txtEditContent");

        txtContent.on("keyup", function() {
            $("#countSmsContent").html(getStringLength(this.value));
        });

        box.beforeOpen = function () {
            var inddSmsContainer = $("#smsContentDiv");
            var editSmsContainer = $("#editContainer");
            var content = this.sourceObj.text();
            if(content == "语音短信") return false;
            if(content == "个性化短信") {
                inddSmsContainer.show();
                editSmsContainer.hide();
                if(this.sourceObj.data("load") == undefined) {
                    var option = {
                        url: "/BatchAudit/PreviewIndividuationSms",
                        data: {
                            InterSeqId: this.sourceObj.data("id")
                        },
                        success: function(res) {
                            if(!common.chkResponse(res)) return false;
                            box.sourceObj.attr("data-load",res["Result"]);
                            inddSmsContainer.html(res["Result"]);
                        }
                    };
                    $.ajax(option);
                } else {
                    inddSmsContainer.html(this.sourceObj.data("load"));
                }
            } else {
                inddSmsContainer.hide();
                editSmsContainer.show();
                txtContent.val(this.sourceObj.html());
                $("#countSmsContent").html(getStringLength(this.sourceObj.html()));
            }
            $("#txtEditId").val(this.sourceObj.data("id"));
            $("#testPipe").val(this.sourceObj.data("pipe-id"));
        };

        box.reset = function () {
            $("#smsContentDiv").html("");
            $("#testPipe").val("");
            $("#testNum").val("");
        };

        box.submit = function () {
            var mobile = $("#testNum").val();
            if(mobile == "") {
                alert("未填写号码！");
                return false;
            }
            var option = {
                url: "/BatchAudit/SendTestSms",
                data: {
                    UsePipe: $("#testPipe").val(),
                    SmsContent: $("#smsContentDiv").val(),
                    Mobile: mobile
                },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    box.close();
                    if (res["Result"] == "0")
                        alert("发送成功");
                    else {
                        alert("发送失败");
                    }
                }
            };
            $.ajax(option);
        };

        $("#btnEdit").on("click", function() {
            var option = {
                url: "/BatchAudit/ModifySmsContent",
                data: {
                    InterSeqId: $("#txtEditId").val(),
                    SmsContent: txtContent.val()
                },
                success: function(res) {
                    if(!common.chkResponse(res)) return false;
                    if(res["Result"].toLowerCase() == "true") {
                        box.sourceObj.html(txtContent.val());
                        box.close();
                    } else {
                        alert("修改失败");
                    }
                }
            };
            $.ajax(option);
        });

        //统计字符长度
        function getStringLength(str) {
            var charset = document.charset;
            var len = 0, i, strLength;
            for (i = 0,strLength = str.length; i < strLength; i++) {
                len += str.charCodeAt(i) < 0 || str.charCodeAt(i) > 255 ? (charset == "utf-8" ? 1 : 1) : 1;
            }
            return len;
        }
    })(jsBox["smsContent"]);
});