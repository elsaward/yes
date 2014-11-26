require.config({
    baseUrl: '/scripts/lib'
});
require(['jquery', 'common', 'verify'], function ($, common, Verify) {
    var verify = new Verify();
    verify.init({
        form: "#chargeForm",
        customChk: function() {
            var userCode = $("#txtRechargeUserCode");
            var exist = true;
            var option = {
                async: false,
                url: "/User/UserExist",
                data: { UserCode: $.trim(userCode.val()) },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    exist = res["Result"] != "0";
                }
            };
            $.ajax(option);
            if(!exist) {
                verify.showTips(userCode, "用户不存在");
                return false;
            }
            return true;
        }
    });

    $("#userList").on("click", function(e) {
        if(e.target.tagName == "A") {
            loadUserInfo(e.target.innerHTML);
        }
        common.stopDefault(e);
    });

    $("#searchBtn").on("click", function (e) {
        var option = {
            url: "/User/GetCurrentChildUserList",
            data: { UserCode: $.trim($("#txtSearchUserCode").val()) },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                renderUserList(res["InfoList"]);
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    $("#txtRechargeUserCode").on("blur", function(e) {
        if(this.value == "") return false;
        loadUserInfo(this.value);
    });

    function renderUserList(data) {
        var list = document.querySelector("#userList");
        $.clearDomElement(list);
        var i, len = data.length, htmlStr = "";
        var tpl = function(item) {
            return '<li>' +
                '<a href="#" data-id="'+ item["Id"] +'">' + item["UserCode"] + '</a>' +
                '</li>';
        };
        if(len != undefined && len > 0) {
            for(i = 0; i < len; i++) {
                htmlStr += tpl(data[i]);
            }
        }
        $(list).append(htmlStr);
    }

    function loadUserInfo(userCode) {
        var option = {
            url: "/User/GetUserInfo",
            data: { 'UserCode': userCode },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                res = res["Result"];
                if(res["Id"] == "0") {
                    alert("用户不存在");
                }
                $('#txtRechargeUserCode').val(res["UserCode"]);
                $('#balance').html(res["Balance"] + "条");
                $('#hidUserId').val(res["Id"]);
            }
        };
        $.ajax(option);
    }
});