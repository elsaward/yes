require.config({
    baseUrl: '/scripts/lib'
});

require(['jquery', 'jswindow', 'common', 'verify'], function($, jsw, common, Verify) {
    var jsBox = jsw.init();
    var loginVerify = new Verify();
    var modVerify = new Verify();
    var txtUserName = document.querySelector("#txtUserName");
    var txtPassword = document.querySelector("#txtPassword");
    var imgcode = document.querySelector("#identycode");
    var txtCode = document.querySelector("#txtIdentycode");
    var modCode = document.querySelector("#userCode");
    var oldPwd = document.querySelector("#oldPwd");
    var newPwd = document.querySelector("#newPwd");
    var renewPwd = document.querySelector("#renewPwd");
    var modifyType = document.querySelector("#modifyType");
    loginVerify.init({
        form: "#loginForm"
    });

    modVerify.init({
        form: "#modPassword"
    });

    $("#loginForm").on("keydown", function(e) {
        var key = e.keyCode || e.which;
        if(key == 13) {
            $("#loginSubmit").click();
        }
    });

    $(imgcode).on("click", function(e) {
        changeCode();
        common.stopDefault(e);
    });

    $("#changeCode").on("click", function(e) {
        changeCode();
        common.stopDefault(e);
    });

    $("#loginSubmit").on("click", function(e) {
        var username = txtUserName.value;
        var password = txtPassword.value;
        var code = txtCode.value;
        var $msg = $("#modMsg");
        var $modType = $("#modifyType");
        if(!loginVerify.chkForm()) {
            return false;
        }
        var option = {
            url: "/user/loginpost",
            data: {
                userCode: username,
                password: password,
                validateCode: code
            },
            success: function(res){
                switch (res["Code"]) {
                    case 17:
                        $msg.html("您是第一次登录的新用户，请您更改密码，保护账号安全");
                        $modType.val(0);
                        jsBox["main"].openSub("changePW", $(txtUserName));
                        break;
                    case 18:
                        $msg.html("您的密码已过期，请更换密码");
                        $modType.val(1);
                        jsBox["main"].openSub("changePW", $(txtUserName));
                        break;
                    case 1:
                        common.showModal("登录成功，页面跳转中...",1);
                        if(res["RedirectUrl"]) {
                            location.href = res["RedirectUrl"];
                        }
                        break;
                    default:
                        alert(res["Description"]);
                        if(res["RedirectUrl"]) {
                            location.href = res["RedirectUrl"];
                        }
                        break;
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    (function(box) {
        $("#modPassword").on("submit", function() {
            box.submit();
            return false;
        });
        box.beforeOpen = function() {
            $("#userCode").val(box.sourceObj.val());
        };
        box.submit = function() {
            box.autoClose = false;
            if(!modVerify.chkForm()) return false;
            var option = {
                url: "/user/modifypwd",
                data: {
                    userCode: modCode.value,
                    oldPwd: oldPwd.value,
                    newPwd: newPwd.value,
                    modifyType: modifyType.value,
                    againNewPwd: renewPwd.value
                },
                success: function(res) {
                    switch (res["Code"]) {
                        case 13:
                            alert(res["Description"] + "，请重新登录");
                            box.close();
                            break;
                        default:
                            alert(res["Description"]);
                            if(res["RedirectUrl"]) {
                                location.href = res["RedirectUrl"];
                            }
                            break;
                    }
                }
            };
            $.ajax(option);
        };

    }(jsBox["changePW"]));

    function changeCode() {
        imgcode.src = "/identifyingcode.aspx?" + Math.random();
    }
});