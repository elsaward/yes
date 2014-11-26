require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'common', 'verify', 'form', 'enter'], function($, common, Verify, form, enter) {
    $("#searchForCustom").click(function (e) {
        var option = {
            selectObj: document.querySelector("#customList"),
            url: "/Recharge/SearchUserInfo",
            data: {
                keywords: $(this).prev().val()
            },
            htmlName: function (data) {
                return data["UserName"] + "[" + data["UserCode"] + "]";
            },
            valueName: "id"
        };
        $.selectListLoad(option);
        common.stopDefault(e);
    });
    $("#customList").change(function () {
        loadCustomInfo($(this).val());
    });
    var rechargeSubmitBtn = $("#rechargeSubmit");
    var recentRecord = $("#recentRecord");
    var chargeDuanxin = $("#chargeDuanxin");
    var chargeCaixin = $("#chargeCaixin");
    var verify = new Verify();
    verify.init({
        form: "#rechargeForm",
        setting: {
            auto: false,
            trim: true
        }
    });
    var rechargeFormOptions = {
        beforeSubmit: function () {
            if (verify.chkForm()) {
                return true;
            } else {
                rechargeSubmitBtn.removeClass("gs-disabled-button");
                return false;
            }
        },
        success: function (res, statusText, xhr, $form) {
            if (!common.chkResponse(res)) return false;
            rechargeSubmitBtn.removeClass("gs-disabled-button");
            res = res["InfoList"];
            var msg = [
                "充值金额不可为0",
                "充值单号不可为空",
                "请选择充值类型",
                "请选择用户",
                "充值失败"
            ];
            var tpl = function (data) {
                return '<tr><td>' + data["Charge_Item"] + '</td>' +
                    '<td>' + data["Charge_Date"] + '</td>' +
                    '<td>' + data["Charger"] + '</td>' +
                    '<td>' + data["Recharge_Status_String"] + '</td>' +
                    '<td>' + data["ChargeTypeString"] + '</td>' +
                    '<td>' + data["Charge"] + '</td></tr>';
            };
            var i, len, str = "";
            if (res) {
                $.clearDomElement(recentRecord[0]);
                for (i = 0, len = res.length; i < len; i++) {
                    str += tpl(res[i]);
                }
                recentRecord.append($(str));
                $form[0]["Charge_Item"].value = "";
                $form[0]["Charge_remark"].value = "";
                $form[0]["charge"].value = "";
                alert("充值成功");
            } else {
                alert(msg[res["Result"]]);
            }
        },
        error: function (req) {
            alert("连接超时");
            rechargeSubmitBtn.removeClass("gs-disabled-button");
        }
    };

    rechargeSubmitBtn.click(function (e) {
        if (!$(this).hasClass("gs-disabled-button")) {
            $(this).addClass("gs-disabled-button");
            $("#rechargeForm").ajaxSubmit(rechargeFormOptions);
        }
        common.stopDefault(e);
    });

    function loadCustomInfo(id) {
        var pipeInfo = $("#pipeInfo");
        var recentRecord = $("#recentRecord");
        $.clearDomElement(pipeInfo[0]);
        $.clearDomElement(recentRecord[0]);
        var option = {
            url: "/Recharge/GetUserInfo",
            data: {
                uid: id
            },
            success: function (data, textStatus) {
                if (!common.chkResponse(data)) return false;
                data = data["Result"];
                var i, len, dataPipe, dataRecharge, pipeStr = "", rechargeStr = "";
                var pipeTpl = function (data) {
                    var prFee = 0, price;
                    if (data["PRFee"] != "" && !isNaN(data["PRFee"])) {
                        prFee = parseFloat(data["PRFee"]);
                    }
                    price = data["UnitPrice"] - prFee;
                    return '<tr><td>' + data["PipeSetID"] + '</td>' +
                        '<td>' + data["PipeSetName"] + '</td>' +
                        '<td>' + data["UnitPrice"] + '</td>' +
                        '<td>' + prFee + '</td>' +
                        '<td>' + Math.round(price * 1000) / 1000 + '</td></tr>';
                };
                var rechargeTpl = function (data) {
                    return '<tr><td>' + data["Charge_Item"] + '</td>' +
                        '<td>' + data["Charge_Date"] + '</td>' +
                        '<td>' + data["Charger"] + '</td>' +
                        '<td>' + data["Recharge_Status_String"] + '</td>' +
                        '<td>' + data["ChargeTypeString"] + '</td>' +
                        '<td>' + data["Charge"] + '</td></tr>';
                };
                $("#chargeDuanxin").html(data["ChargeDuanxin"]);
                $("#chargeCaixin").html(data["ChargeCaixin"]);
                dataPipe = data["UserPipeInfo"];
                dataRecharge = data["UserRecentRecharge"];
                for (i = 0, len = dataPipe.length; i < len; i++) {
                    pipeStr += pipeTpl(dataPipe[i]);
                }
                pipeInfo.append($(pipeStr));
                for (i = 0, len = dataRecharge.length; i < len; i++) {
                    rechargeStr += rechargeTpl(dataRecharge[i]);
                }
                recentRecord.append($(rechargeStr));
            }
        };
        $.ajax(option);
    }
});