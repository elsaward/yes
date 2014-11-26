require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'upload': ['jquery']
    }
});

require(['jquery', 'common', 'verify', 'voicemsgcmd', 'numberDeal', 'upload', 'switcher', 'calendar'],
    function ($, common, Verify, voicemsg, number, upload, switcher, calendar) {
        var verify = new Verify();
        verify.init({
            form: "#form1",
            setting: {
                auto: false,
                trim: true
            }
        });

        $("[data-date]").on("click", function (e) {
            calendar.target(e, 2, "later");
        });

        //选择发送方式
        $("#selSendType").children().on("click", function () {
            $("#hidSendType").val(parseInt($(this).index()) + 1);
        });

        $("#btnSendSms").click(function () {
            if (!confirm("确定要发送吗?")) {
                return false;
            }
            number.send();
            if (!chkSend()) {
                return false;
            }
            if (!voicemsg.check()) {
                return false;
            }
            var baseVerify = verify.chkForm();
            if (!baseVerify) {
                return false;
            }
        });

        function chkSend() {
            var groupIds = $("#DDLGroups");
            var sendType = $("#hidSendType"); //发送方式 1-号码  2-联系人组
            var txtDesNo = $("#txtDesNo");
            var txtPreTime = $("#txtPreTime");
            var callOverChannel = $("#callOverChannel");
            var callOverCalltime = $("#callOverCalltime");
            var callOverMsg = $("#callOverMsg");
            if (sendType.val() == "1") {
                if ($.trim(txtDesNo.val()) == "") {
                    verify.showTips(txtDesNo, "对不起，接收号码不能为空");
                    return false;
                }
            }
            else if (sendType.val() == "2") {
                if (groupIds.val() == null) {
                    verify.showTips(groupIds, "对不起，请选择联系人组");
                    return false;
                }
                var group = [];
                groupIds.children(":selected").each(function () {
                    group.push($(this).val());
                });
                //获取联系人组
                $("#HiddenGroupName").val(group.join(","));
            } else if (sendType.val() == "3") {
                if ($("#SavaFile").val() == "") {
                    verify.showTips($("#fileDesNoFile"), "请上传号码文件");
                    return false;
                }
            }
            if ($("#selPre_1")[0].checked && txtPreTime.val() == "") {
                verify.showTips(txtPreTime, "没有选择定时发送时间");
                return false;
            }
            if($("[name='callover']").eq(1)[0].checked) {
                if(callOverChannel.val() == "") {
                    verify.showTips(callOverChannel, "请选择通道");
                    return false;
                }
                if(callOverCalltime.val() == ""){
                    verify.showTips(callOverCalltime, "请设置通话秒数");
                    return false;
                }
                if(callOverMsg.val() == ""){
                    verify.showTips(callOverMsg, "请填写短信内容");
                    return false;
                }
            }
            return true;
        }

        //上传事件绑定
        $("#btnUploadDes").click(function (e) {
            toUpload();
            common.stopDefault(e);
        });

        //文件上传
        function toUpload() {
            if (document.getElementById("fileDesNoFile").value == "")
                alert("没有选择要上传的号码文件!");
            else
                ajaxFileUpload();
        }

        function ajaxFileUpload() {
            document.getElementById("btnUploadDes").disabled = true;
            document.getElementById("btnSendSms").disabled = true;
            $("#upInfo").html("<img src='/content/images/load.gif'>&nbsp;<span style='font-size:12px; color:Black;'>正在上传处理.....</span><input style='display:none' value='' id='txtUpNo' type='text' />");
            $.ajaxFileUpload({
                url: '/user/doUpLoadFile.aspx',
                secureuri: false,
                fileElementId: 'fileDesNoFile',
                dataType: 'utf-8',
                success: function (data) {
                    var stringArray = data.split("|");
                    if (stringArray[0] == "1") {
                        //stringArray[成功状态(1为成功，0为失败),上传成功的文件名,消息提示]
                        $("#upInfo").html(stringArray[2]);
                        $("#SavaFile").val(document.getElementById("txtSavaFile").value);
                        //导入多少个号码
                        $("#desCount").html(stringArray[3]);
                    }
                    else {
                        $("#upInfo").html("<span class='gs-text-gray'>文件上传处理失败," + data + "</span><input style='display:none' value='' id='txtUpNo' type='text' />");
                    }
                },
                error: function (data) {
                    $("#upInfo").html("<span class='gs-text-gray'>文件上传处理失败," + data + "</span><input style='display:none' value='' id='txtUpNo' type='text' />");
                }
            });
            document.getElementById("btnUploadDes").disabled = false;
            document.getElementById("btnSendSms").disabled = false;
            return false;
        }

        //发送时间 选择
        $("[name=selPre]").on("click", function () {
            if ($(this).val() == "1") {
                $("#divPreTime").show();
                $("#txtPreTime").val("");
            } else {
                $("#divPreTime").hide();
            }
        });

        $("[name='callover']").on("click", function() {
            if ($(this).val() == "1") {
                $(".call-over-rows").show();
            } else {
                $(".call-over-rows").hide();
            }
        });
    });