require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'jswindow', 'common', 'verify', 'form'], function($, jsw, common, Verify, form) {
    var jsBox = jsw.init();

    (function(box){
        box.confirmBtn = $("#confirmRecharge");
        box.refuseBtn = $("#refuseRecharge");
        box.confirmBtn.click(function (e) {
            box.submit("confirm");
            common.stopDefault(e);
        });
        box.refuseBtn.click(function (e) {
            box.submit("refuse");
            common.stopDefault(e);
        });

        var verify = new Verify();
        verify.init({
            form: "#verifyForm",
            setting: {
                auto: false,
                trim: true
            }
        });

        var verifyFormOptions = {
            beforeSubmit: function () {
                if (verify.chkForm()) {
                    return true;
                } else {
                    box.confirmBtn.removeClass("gs-disabled-button");
                    box.refuseBtn.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function (res, statusText, xhr, $form) {
                if(!common.chkResponse(res)) return false;
                box.confirmBtn.removeClass("gs-disabled-button");
                box.refuseBtn.removeClass("gs-disabled-button");
                if (res["Result"].toLowerCase() == "true") {
                    alert("审核成功！");
                    box.sourceObj.parents("tr").eq(0).remove();
                    box.close();
                }
            },
            error: function (req) {
                alert("连接超时");
                box.confirmBtn.removeClass("gs-disabled-button");
                box.refuseBtn.removeClass("gs-disabled-button");
            }
        };
        //窗体设置
        box.beforeOpen = function () {
            var infoId = this.sourceObj.data("id");
            var userCode = this.sourceObj.data("custom");
            $("#recordId").val(infoId);
            $("#radio1")[0].checked = true;
            loadRechargeInfo(infoId);
            loadRecentRecord(userCode);
        };
        box.submit = function (command) {
            this.confirmBtn.addClass("gs-disabled-button");
            this.refuseBtn.addClass("gs-disabled-button");
            var rechargeType = $("#rechargeType");
            switch (command) {
                case "confirm":
                    rechargeType.val(0);
                    break;
                case "refuse":
                    rechargeType.val(-1);
                    break;
            }
            $("#verifyForm").ajaxSubmit(verifyFormOptions);
        };
        box.reset = function() {
            verify.hideTips();
        };
    })(jsBox["verifyConfirm"]);

    var Charge = document.getElementById("Charge"),
        Charge_Incoming = document.getElementById("Charge_Incoming");
    $("#radio1").click(function () {
        Charge_Incoming.value = Charge.value;
    });
    $("#radio2").click(function () {
        Charge_Incoming.value = Charge.value;
    });
    $("#radio3").click(function () {
        Charge_Incoming.value = 0;
    });

    //读取充值记录信息
    function loadRechargeInfo(id) {
        var option = {
            url: "/Recharge/Details",
            data: {
                rechargeId: id
            },
            success: function (data, textStatus) {
                if(!common.chkResponse(data)) return false;
                data = data["Result"];
                $("#label1").html(data["UserBelongTo"]);
                $("#label2").html(data["UserName"]);
                $("#label3").html(data["Charge_Item"]);
                $("#Charge_Incoming").val(data["Charge"]);
                $("#Charge").val(data["Charge"]);
                $("#Charge_remark").html(data["Charge_remark"]);
            }
        };
        $.ajax(option);
    }

    //读取最近充值记录
    function loadRecentRecord(userCode) {
        var list = $("#recentRecord");
        list.html("数据加载中...");
        var option = {
            url: "/Recharge/RecentRecharge",
            data: {
                userCode: userCode
            },
            success: function (data, textStatus) {
                if(!common.chkResponse(data)) return false;
                list.empty();
                var tpl = function(item) {
                    return "<tr>" +
                        "<td>" + item["Charge_Item"] + "</td>" +
                        "<td>" + item["Charge_Date"] + "</td>" +
                        "<td>" + item["Charge"] + "</td>" +
                        "<td>" + item["Charger"] + "</td>" +
                        "<td>" + item["CheckUser"] + "</td>" +
                        "<td>" + item["Recharge_Status_String"] + "</td>" +
                        "</tr>";
                };
                var str = "", item, j, len;
                data = data["InfoList"];
                for (j = 0, len = data.length; j < len; j++) {
                    item = data[j];
                    str += tpl(item);

                }
                list.append($(str));
            }
        };
        $.ajax(option);
    }
});