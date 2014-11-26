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

    $("#letterList").on("click", function(e) {
        var option;
        if(e.target.tagName == "A") {
            option = {
                url: "/User/GetUserListByInitial",
                data: { initial: e.target.innerHTML },
                success: function(res) {
                    if (!common.chkResponse(res)) return false;
                    renderUserList(res["InfoList"]);
                }
            };
            $.ajax(option);
        }
        common.stopDefault(e);
    });

    $("#userList").on("click", function(e) {
        var $target = $(e.target);
        var option;
        if(e.target.tagName == "A") {
            loadUserInfo(e.target.innerHTML);
        } else if ($target.hasClass("gs-tree-parent")) {
            if ($target.hasClass("open")) {
                $target.removeClass("open");
                return false;
            }
            option = {
                url: "/User/GetChildUserList",
                data: {
                    pid: $target.data("id")
                },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    var data = res["InfoList"];
                    if (data.length == 0) {
                        $target.removeClass("gs-tree-parent");
                        return false;
                    }
                    var list = $target.find(".gs-tree-sub");
                    if (list.length == 0) {
                        list = $("<ul></ul>").addClass("gs-tree-sub");
                        $target.append(list);
                    }
                    $target.addClass("open");
                    renderSubUserList(data, list);
                }
            };
            $.ajax(option);
        }
        common.stopDefault(e);
    });

    $("#searchBtn").on("click", function (e) {
        var option = {
            url: "/User/GetUserList",
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
            var classStr = "";
            if (item["ParentId"] == "" || item["ParentId"] == 0 || item["ParentId"] == null) {
                classStr= ' class="gs-tree-parent"';
            }
            return '<li' +
                classStr +
                ' data-id="'+ item["Id"] +'">' +
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

    function renderSubUserList(data, list) {
        $.clearDomElement(list[0]);
        var i, len = data.length, str = "";
        var tpl = function (item) {
            return '<li>' +
                '<a data-id="' + item["Id"] + '" href="#">' +
                item["UserCode"] + '</a>' +
                '</li>';
        };
        for (i = 0; i < len; i++) {
            str += tpl(data[i]);
        }
        list.append(str);
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