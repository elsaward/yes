define(['jquery', 'common', 'jswindow'], function($, common, jsw) {
    var tpl = '<div id="userSelector" class="gs-modal" jsw-index="2">' +
        '<div class="gs-modal-dialog">' +
        '<div class="gs-close" jsW-cancel>×</div>' +
        '<div class="gs-modal-title">用户选择</div>' +
        '<div class="gs-modal-content">' +
        '<div class="gs-form">' +
        '<div class="gs-form-row">' +
        '<label>登录代码：</label>' +
        '<div class="gs-form-control">' +
        '<input id="likeUserCode" type="text"> ' +
        '<a id="searchUsers" class="gs-button">搜索</a>' +
        '</div></div>' +
        '<div class="gs-form-row">' +
        '<select id="userList" class="gs-width-full" size="10"></select>' +
        '</div>' +
        '<div class="gs-form-row">' +
        '<div class="gs-align-center">' +
        '<a href="#" class="gs-button" jsW-cancel>取消</a> ' +
        '<a href="#" class="gs-button" jsW-submit>确定</a>' +
        '</div></div></div></div></div></div>';
    $("body").append(tpl);

    var userTpl = "<div class='gs-tool-item'>选择用户：" +
        "<input type='text' name='userCode' readonly>" +
        "<input type='hidden' name='hidUserId'>" +
        "</div>";

    function buildUserSelector(url, value, type) {      //生成用户选择窗体
        type = type || "post";
        var userSelector = $(userTpl);
        var userTxt = userSelector.find("input[type='text']");
        if(value instanceof Array) {
            userTxt.val(value[0] || "");
            userTxt.next().val(value[1] || "");
        }
        userTxt.on("click", function() {
            jsw.boxes["main"].openSub("userSelector",$(this));
        });
        var box = jsw.push("userSelector");
        box.beforeOpen = function () {
            var target = box.sourceObj;
            target.val("");
            target.next().val("");
        };
        box.submit = function () {
            var user = $("#userList");
            var target = box.sourceObj;
            target.val(user.find("option:selected").text().split(" ")[0]);
            target.next().val(user.val());
        };
        $("#searchUsers").on("click", function () {
            var userList = document.getElementById("userList");
            var option = {
                selectObj: userList,
                url: url,
                type: type,
                data: { UserCode: $.trim($("#likeUserCode").val()) },
                valueName: "Id",
                htmlName: function (data) {
                    return data["UserCode"] + " [" + data["UserName"] + "] "
                }
            };
            $.selectListLoad(option);
        });
        return userSelector;
    }
    return buildUserSelector;
});