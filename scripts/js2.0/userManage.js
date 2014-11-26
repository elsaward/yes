require.config({
    baseUrl: '/scripts/lib'
});
require(['jquery', 'common', 'verify', 'calendar'], function ($, common, Verify, calendar) {
    var verify = new Verify();
    verify.init({
        form: "#infoForm",
        customChk: function () {
            var txtUserName = $("#txtUserName");
            var txtUserCode = $("#txtUserCode");
            var txtPwd = $("#txtPwd");
            var userType = $("#userType");
            var isModify = $('#isModify').val() == 1;
            if (/\s/g.exec(txtUserName.val()) != null) {
                verify.showTips(txtUserName, "不能有符号及空格");
                return false;
            }
            if (/\s/g.exec(txtUserCode.val()) != null) {
                verify.showTips(txtUserCode, "不能有符号及空格");
                return false;
            }
            if (!isModify && $.trim(txtPwd.val()) == "") {
                verify.showTips(txtPwd, "密码不能为空");
                return false;
            }
            if (!userType.val() > 0) {
                verify.showTips(userType, "请选择用户类型");
                return false;
            }

            if ((isModify && $('#txtOldUserCode').val() != txtUserCode.val()) || !isModify) {
                /*========== 用户是否存在验证 ==========*/
                var exist = true;
                $.ajax({
                    async: false,
                    url: '/User/UserExist',
                    data: { UserCode: $.trim(txtUserCode.val()) },
                    success: function (res) {
                        if (!common.chkResponse(res)) return false;
                        exist = res["Result"] != '0';
                    },
                    error: function () {
                        exist = true;
                        alert('系统错误，请联系管理员');
                    }
                });
                if (exist) {
                    verify.showTips(txtUserCode, "该用户已存在");
                    return false;
                }
            }
            return true;
        }
    });

    $("[data-date]").on("click", function (e) {
        calendar.target(e, 2);
    });

    $("#addBtn").on("click", function (e) {
        resetForm();
        common.stopDefault(e);
    });

    $("#letterList").on("click", function (e) {
        var option;
        if (e.target.tagName == "A") {
            option = {
                url: "/User/GetUserListByInitial",
                data: { initial: e.target.innerHTML },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    renderUserList(res["InfoList"]);
                }
            };
            $.ajax(option);
        }
        common.stopDefault(e);
    });

    $("#userList").on("click", function (e) {
        var $target = $(e.target);
        var option;
        if (e.target.tagName == "A") {
            $("#isModify").val(1);
            $("#txtUserCode")[0].readOnly = true;
            $("#btnSubmit").val("修改信息");
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
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                renderUserList(res["InfoList"]);
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    //进入用户
    $("#btnBecomeUser").on("click", function (e) {
        var userId = $(this).attr("userId");
        if (userId > 0) {
            top.window.location = "/user/becomeuser?uid=" + userId;
        } else {
            alert("未选择用户！");
        }
        common.stopDefault(e);
    });

    function renderUserList(data) {
        var list = document.querySelector("#userList");
        $.clearDomElement(list);
        var i, len = data.length, htmlStr = "";
        var tpl = function (item) {
            var classStr = "";
            if (item["ParentId"] == "" || item["ParentId"] == 0 || item["ParentId"] == null) {
                classStr = ' class="gs-tree-parent"';
            }
            return '<li' +
                classStr +
                ' data-id="' + item["Id"] + '">' +
                '<a href="#" data-id="' + item["Id"] + '">' + item["UserCode"] + '</a>' +
                '</li>';
        };
        if (len != undefined && len > 0) {
            for (i = 0; i < len; i++) {
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
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                res = res["Result"];
                if (res["Id"] == "0") {
                    alert("用户不存在");
                    return false;
                }
                var position, i, len, menus = [];
                $('#balance').html(res["Balance"]);
                $('#txtUserName').val(res["UserName"]);
                $('#txtUserCode').val(res["UserCode"]);
                $('#txtOldUserCode').val(res["UserCode"]);
                $('#userType').val(res["Type"]);
                $('#txtMobile').val(res["Mobile"]);
                $('#txtEmail').val(res["Email"]);
                $('#txtExpires').val(res["Expires"]);
                $("#txtBelongSales").val(res["BelongSales"]);
                $("#txtUnitPrice").val(res["UnitPrice"]);
                $("#txtUserPayType").val(res["UserPayType"]);
                $("#txtPushRepUrl").val(res["PushRepUrl"]);
                $("#txtPushMOUrl").val(res["PushMOUrl"]);
                position = res["SignPosition"];
                document.getElementsByName("txtSignPosition")[position].checked = true;
                $("#txtExtNum").val(res["ExtNum"]); //用户自定义扩展号
                $("#ParentUserCode").val(res["ParentUserCode"] || "");
                $("#txtUserSign").val(res["UserSign"]);
                $("#txtSubmitErrorSpan").val(res["SubmitErrorSpan"]);
                $("#txtSubmitErrorCount").val(res["SubmitErrorCount"]);
                $("#txtTestTimeSpan").val(res["TestTimeSpan"]);
                $("#txtMaxSendRate").val(res["MaxSendRate"]);
                $('#txtRemark').html(res["Remark"]);
                $('.chkPipe').removeAttr('checked');
                for (i = 0, len = res["UserPipeInfoList"].length; i < len; i++) {
                    $('.chkPipe[value="' + res["UserPipeInfoList"][i]["PipeId"] + '"]')[0].checked = true;
                }
                for (i = 0, len = res["UserMenuList"].length; i < len; i++) {
                    if ($.inArray(res["UserMenuList"][i]["ParentId"], menus) == -1) {
                        menus.push(res["UserMenuList"][i]["ParentId"]);
                    }
                    menus.push(res["UserMenuList"][i]["Id"]);
                }
                loadMenuByRole(res["Type"], menus);
                if ($("#btnBecomeUser").length > 0) $('#btnBecomeUser').attr("userId", res["Id"]);
            }
        };
        $.ajax(option);
    }

    //重置表单
    function resetForm() {
        var infoForm = $("#infoForm");
        infoForm[0].reset();
        infoForm.find("input[type='hidden']").val("");
        $("#isModify").val(0);
        $('#balance').html("0");
        $("#txtUserCode")[0].readOnly = false;
        $("#btnBecomeUser").attr("userId", "0");
        $("#userType").change();
        $("#btnSubmit").val("添加用户");
    }

    //根据用户类型计算用户有效期
    $("#userType").change(function () {
        $("#txtExpires").val(changeExpires(this.value));
        loadMenuByRole(this.value);
    });

    function changeExpires(type) {
        var now = new Date();
        switch (type) {
            case "1":
                //短信用户为12个月
                now.setYear(now.getYear() < 1900 ? 1900 + now.getYear() + 1 : now.getYear() + 1);
                return now.format("yyyy-MM-dd HH:mm:ss");
                break;
            case "2":
                //代理商为12个月
                now.setYear(now.getYear() < 1900 ? 1900 + now.getYear() + 1 : now.getYear() + 1);
                return now.format("yyyy-MM-dd HH:mm:ss");
                break;
            case "3":
                //管理员无限
                now.setYear(now.getYear() < 1900 ? 1900 + now.getYear() + 1000 : now.getYear() + 1000);
                return now.format("yyyy-MM-dd HH:mm:ss");
                break;
            case "4":
                //默认测试用户为2个月
                now.setMonth(now.getMonth() + 2);
                return now.format("yyyy-MM-dd HH:mm:ss");
                break;
            default:
                return "";
                break;
        }
    }

    function loadMenuByRole(id, menus) {
        var option = {
            url: "/System/GetRoleMenuList",
            data: {
                roleId: id
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                var data = res["InfoList"];
                renderMenu(data, menus);
            }
        };

        $.ajax(option);
    }

    function renderMenu(menuData, defaultData) {
        var chkAll = defaultData === undefined;
        var menuBox = $("#menuList");
        var i, j, len, len2, item, group;
        var tpl = function (item) {
            var isChecked = "";
            if (chkAll) {
                isChecked = "checked";
            } else {
                isChecked = $.inArray(parseInt(item["MenuId"]), defaultData) == -1 ? "" : "checked";
            }
            return '<tr><td>' +
                '<label><input name="menuId" type="checkbox" ' + isChecked + ' value="' +
                item["MenuId"] + '" data-parent="menu-' + item["MenuId"] + '">' +
                item["MenuName"] + '</label>' +
                '</td><td data-menu="' + item["MenuId"] + '"></td></tr>';
        };
        var subTpl = function (pid, item) {
            var isChecked = "";
            if (chkAll) {
                isChecked = "checked";
            } else {
                isChecked = $.inArray(parseInt(item["MenuId"]), defaultData) == -1 ? "" : "checked";
            }
            return '<label>' +
                '<input name="menuId" type="checkbox" ' + isChecked + ' value="' + item["MenuId"] + '" data-sel="menu-' +
                pid + '">' + item["MenuName"] +
                '</label> ';
        };
        $.clearDomElement(menuBox[0]);
        if (defaultData) {

        }
        for (i = 0, len = menuData.length; i < len; i++) {
            item = menuData[i];
            group = $(tpl(item));
            for (j = 0, len2 = item["ChildMenuList"].length; j < len2; j++) {
                group.find("td").eq(1).append(subTpl(item["MenuId"], item["ChildMenuList"][j]));
            }
            menuBox.append(group);
        }
        $("[data-parent]").each(function () {
            $(this).selLeast($(this).data("parent"), "data");
        });
    }


    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "H+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    }
});