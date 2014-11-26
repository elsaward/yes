require.config({
    baseUrl: '/scripts/lib'
});

require(['jquery', 'common', 'verify'], function($, common, Verify) {
    var loginVerify = new Verify();
    var txtUserName = document.querySelector("#txtUserName");
    var txtPassword = document.querySelector("#txtPassword");
    var imgcode = document.querySelector("#identycode");
    var txtCode = document.querySelector("#txtIdentycode");
    var redirectUrl = $("#redirectUrl").val();
    loginVerify.init({
        form: "#loginForm"
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
        if(!loginVerify.chkForm()) {
            return false;
        }
        var option = {
            url: "/User/Login",
            data: {
                txtUserName: username,
                txtPassword: password,
                imgcode: code
            },
            success: function(res){
                if (res["Code"] != 10) {
                    alert('登录失败！' + res["Description"]);
                    location.reload(true);
                    return false;
                }
                res = res["Result"];

                switch (res) {
                    case "0":
                        alert('登录IP地址与开启的指定IP登录地址不一致!');
                        break;
                    case "1":
                        alert('输入的手机短信验证码不对!');
                        $("#showSms").show();
                        break;
                    case "2":
                    case "3":
                        alert('用户名或密码输入错误!');
                        break;
                    case "4":
                        alert('输入的登陆验证码错误!');
                        break;
                    case "5":
                        common.showModal("登录成功，页面跳转中...",1);
                        if (redirectUrl != "") {
                            window.location.href = redirectUrl;
                        } else {
                            window.location.href = "/HSTA/Index";
                        }
                        break;
                    case "6":
                        alert('用户有效期已过!');
                        break;
                    default:
                        alert("登录错误！");
                        break;
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    function changeCode() {
        imgcode.src = "/validatecode.aspx?" + Math.random();
    }
});