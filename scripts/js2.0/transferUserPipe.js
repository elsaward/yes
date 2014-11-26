require.config({
    baseUrl: '/scripts/lib'
});
require(['jquery', 'common', 'verify'], function ($, common, Verify) {
    var batchModSelect = document.querySelector("#batchModSelect"),
        sourceChannel = document.querySelector("#sourceChannel"),
        newChannel = document.querySelector("#newChannel"),
        hidPipeUserCount = document.querySelector("#hidPipeUserCount"),
        $ydPipe = $("#ydPipe"),
        $ltPipe = $("#ltPipe"),
        $dxPipe = $("#dxPipe");
    var pipes = [[],[],[]];
    var pipe;
    $ydPipe.children().each(function () {
        pipe = {
            id: $(this).val(),
            name: $(this).html()
        };
        pipes[0].push(pipe);
    });
    $ltPipe.children().each(function () {
        pipe = {
            id: $(this).val(),
            name: $(this).html()
        };
        pipes[1].push(pipe);
    });
    $dxPipe.children().each(function () {
        pipe = {
            id: $(this).val(),
            name: $(this).html()
        };
        pipes[2].push(pipe);
    });

    $(batchModSelect).on("change", loadModPipes);
    loadModPipes();

    function loadModPipes() {
        var sourceOption = {
            selectObj: sourceChannel,
            presentData: pipes[batchModSelect.value],
            htmlName: "name",
            valueName: "id"
        };
        var newOption = {
            selectObj: newChannel,
            presentData: pipes[batchModSelect.value],
            htmlName: "name",
            valueName: "id"
        };
        $.selectListLoad(sourceOption);
        $.selectListLoad(newOption);
    }

    var srsUsers = $("#refectUsers");
    var selUsers = $("#selUsers");

    var selUsersIdArr = [];
    var selUsersNameArr = [];

    function insertToArr(data, arr) {
        if ($.inArray(data, arr) == -1) {
            arr.push(data);
        }
    }

    function renderSelector() {
        var i, len;
        $.clearDomElement(selUsers[0]);
        if (selUsersIdArr.length != selUsersNameArr.length) {
            return false;
        }
        for (i = 0, len = selUsersIdArr.length; i < len; i++) {
            selUsers.append($("<option>").val(selUsersIdArr[i]).html(selUsersNameArr[i]));
        }
    }

    /*$("#searchPipeBtn").on("click", function (e) {
        var option = {
            selectObj: srsUsers[0],
            url: "/system/searchbasepipe",
            data: {
                basePipeNameLike: $("#searchPipe").val(),
                selectedPipeIds: selUsers.val()
            },
            valueName: "Id",
            htmlName: "PipeName"
        };
        $.selectListLoad(option);
        common.stopDefault(e);
    });*/

    $("#selPipeAll").on("click", function (e) {
        var i, len, item;
        for (i = 0, len = srsUsers.children().length; i < len; i++) {
            item = srsUsers.children().eq(i);
            insertToArr(item.val(), selUsersIdArr);
            insertToArr(item.text(), selUsersNameArr);
        }
        renderSelector();
        countSelUsers();
        common.stopDefault(e);
    });
    $("#clrPipeAll").on("click", function (e) {
        $.clearDomElement(selUsers[0]);
        selUsersIdArr = [];
        selUsersNameArr = [];
        countSelUsers();
        common.stopDefault(e);
    });
    $("#selPipe").on("click", function (e) {
        srsUsers.children(":selected").each(function () {
            insertToArr($(this).val(), selUsersIdArr);
            insertToArr($(this).text(), selUsersNameArr);
        });
        renderSelector();
        countSelUsers();
        common.stopDefault(e);
    });
    $("#clrPipe").on("click", function (e) {
        selUsers.children(":selected").each(function () {
            selUsersIdArr.splice($(this).index(), 1);
            selUsersNameArr.splice($(this).index(), 1);
            $(this).remove();
        });
        countSelUsers();
        common.stopDefault(e);
    });

    function countSelUsers() {
        $("#selUsersNum").html(selUsers.children().length);
    }

    $(sourceChannel).on("click", function () {
        $("#getListId").val($(this).val());
        var num = document.querySelector("#refectUsersNum"),
            users = document.querySelector("#refectUsers");
        var option = {
            url: "/System/GetUserInfoInPipe",
            data: {
                pipeId: $(this).val()
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                res = res["Result"];
                if (res["UserInfoInPipeCount"] == "0") {
                    num.innerHTML = "0";
                    hidPipeUserCount.value = "0";
                } else {
                    num.innerHTML = res["UserInfoInPipeCount"];
                    hidPipeUserCount.value = res["UserInfoInPipeCount"];
                }
                var selOption = {
                    selectObj: users,
                    htmlName: "Text",
                    valueName: "Value",
                    presentData: res["UserInfoInPipe"]
                };
                $.selectListLoad(selOption);
            }
        };
        $.ajax(option);
    });

    $("#getUsersList").on("click", function () {
        $("#getListForm").submit();
        return false;
    });

    $("#btnConditionSubmit").on("click", function () {
        if (sourceChannel.value == "") {
            alert("请选择原通道！");
            return false;
        }
        if (newChannel.value == "") {
            alert("请选择新通道！");
            return false;
        }
        if (sourceChannel.value == newChannel.value) {
            alert("请选择不同的通道！");
            return false;
        }
        if (!confirm("原通道：" +
            sourceChannel.options[sourceChannel.selectedIndex].innerHTML +
            "\n新通道：" +
            newChannel.options[newChannel.selectedIndex].innerHTML +
            "\n确认修改？")) {
            return false;
        }
        if (hidPipeUserCount.value == 0) {
            alert("使用该通道的用户数为0，无需转换！");
            return false;
        }
        selUsers.children().each(function () {
            this.selected = true;
        });
        return true;
    });

    $("#btnSubmit").on("click", function () {
        //通道验证
        var pipeArr = [];
        if(!confirm("确定要转换通道吗？")) return false;
        $(".rdo-pipe:checked").each(function() {
            pipeArr.push(this.value);
        });
        if(pipeArr.length == 0) {
            alert("请选择通道！");
            return false;
        }
        $("#pipe").val(pipeArr.join(","));
        $("#pipeSaveForm").submit();
    });
});