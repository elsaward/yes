require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'jswindow', 'common', 'verify'], function($, jsw, common, Verify) {
    var jsBox = jsw.init();

    //表单验证
    var verify = new Verify();
    verify.init({
        form: "#editPatternForm",
        "newPipeId": {
            notEmpty: true
        },
        "oldPipeId": {
            notEmpty: true
        },
        customChk: function() {
            var op = $("#oldPipeId");
            var np = $("#newPipeId");
            if(op.val() == np.val()) {
                verify.showTips(op, "新通道与旧通道不能相同");
                return false;
            }
            return true;
        }
    });

    (function (box) {
        box.submit = function () {
            var user = $("#userList");
            var target = this.sourceObj;
            var uid = user.val();
            if (uid) {
                target.val(user.find("option:selected").text());
                target.next().val(uid);
                loadPipeList(uid);
            }
        };
        box.reset = function () {
            delete this.tmpDataFor;
        };
        $("#searchUsers").click(function () {
            var list = document.getElementById("userList");
            var option = {
                selectObj: list,
                url: "/User/GetUserList",
                data: { UserCode: $.trim($("#likeUserCode").val()) },
                valueName: "Id",
                htmlName: function (data) {
                    return data["UserCode"] + " [" + data["UserName"] + "] "
                }
            };
            $.selectListLoad(option);
        });
    })(jsBox["userSelector"]);

    //加载用户通道列表
    function loadPipeList(userId) {
        var oPipe = document.getElementById("oldPipeId");
        var nPipe = document.getElementById("newPipeId");
        var option = {
            url: "/System/GetPipeList",
            data: { uid: userId },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                var data = res["InfoList"];
                $.selectListLoad({
                    selectObj: oPipe,
                    presentData: data,
                    titleName: "请选择",
                    htmlName: "PipeName",
                    valueName: "PipeId"
                });
                $.selectListLoad({
                    selectObj: nPipe,
                    presentData: data,
                    titleName: "请选择",
                    htmlName: "PipeName",
                    valueName: "PipeId"
                });
            }
        };
        $.ajax(option);
    }
});