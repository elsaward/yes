require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'jswindow', 'common', 'verify', 'form', 'userSelector'],
function($, jsw, common, Verify, form, userSelector) {
    var jsBox = jsw.init();

    //保留搜索痕迹
    var defaultUserCode = common.getUrlParameter("UserCode");
    var defaultLevel = common.getUrlParameter("Level");
    $("#searchBar").prepend(userSelector("/AdminManager/SearchUserInfoList",[defaultUserCode, ""], "get"));
    $("#searchLevel").val(defaultLevel);

    //全选设置
    $("#selAll").selAll("MemoId");

    //客户记录
    (function(box){
        var addNoteVerify = new Verify();
        addNoteVerify.init({
            form: "#addNoteForm"
        });

        var addNoteFormOption = {
            beforeSubmit: function() {
                if(addNoteVerify.chkForm()) {
                    return true;
                } else {
                    box.submitObj.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function(res) {
                if(!common.chkResponse(res)) return false;
                box.submitObj.removeClass("gs-disabled-button");
                if(res["Result"].toLowerCase() == "true") {
                    alert("操作成功");
                    location.reload();
                } else {
                    alert("操作失败");
                }
            },
            error: function (req) {
                alert("连接超时");
                box.submitObj.removeClass("gs-disabled-button");
            }
        };

        var sel = document.querySelector("#anUserSelector");

        box.beforeOpen = function() {
            var data = box.sourceObj.attr("data-info");
            var $title = $("#addNoteTitle");
            if(data != undefined) {
                $title.html("修改记录");
                data = eval("("+data+")");
                $("#noteId").val(data["id"]);
                $("#noteType").val(data["category"]);
                $("#noteLevel").val(data["level"]);
                $("#anUserCode").val(data["usercode"]);
                $("#noteContent").val(box.sourceObj.html());
                var option = {
                    selectObj: sel,
                    htmlName: "usercode",
                    valueName: "usercode",
                    presentData: [
                        {usercode: data["usercode"]}
                    ],
                    initialValue: data["usercode"]
                };
                $.selectListLoad(option);
                sel.disabled = true;
                $("#anUserSearch").addClass("gs-disabled-button");
            } else {
                $title.html("新建记录");
            }
        };

        box.submit = function() {
            box.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            $("#addNoteForm").ajaxSubmit(addNoteFormOption);
        };

        box.reset = function() {
            sel.disabled = false;
            $("#anUserSearch").removeClass("gs-disabled-button");
            $.clearDomElement(document.querySelector("#anUserSelector"));
        };
    })(jsBox["addNote"]);

    (function(box) {
        var modMemoVerify = new Verify();
        modMemoVerify.init({
            form: "#modMemoForm"
        });
        var modMemoFormOption = {
            beforeSubmit: function() {
                if(modMemoVerify.chkForm()) {
                    return true;
                } else {
                    box.submitObj.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function(res) {
                if(!common.chkResponse(res)) return false;
                box.submitObj.removeClass("gs-disabled-button");
                if(res["Result"].toLowerCase() == "true") {
                    alert("操作成功");
                    location.reload();
                } else {
                    alert("操作失败");
                }
            },
            error: function (req) {
                alert("连接超时");
                box.submitObj.removeClass("gs-disabled-button");
            }
        };

        box.beforeOpen = function() {
            var data = box.sourceObj.attr("data-info");
            var $title = $("#addNoteTitle");
            if(data != undefined) {
                $title.html("修改备忘录");
                data = eval("("+data+")");
                $("#memoHidId").val(data["id"]);
                $("#memoLevel").val(data["level"]);
                $("#memoContent").val(box.sourceObj.html());
            } else {
                $title.html("新建备忘录");
            }
        };

        box.submit = function() {
            box.autoClose = false;
            box.submitObj.addClass("gs-disabled-button");
            $("#modMemoForm").ajaxSubmit(modMemoFormOption);
        };
    })(jsBox["modMemo"]);

    //开启编辑窗
    $(".gs-mail-text>a").on("click", function(e){
        var data = $(this).attr("data-info");
        if(data != undefined) {
            try{
                data = eval("("+data+")");
                if(data["type"] == 0) {
                    jsBox["main"].openSub("addNote", $(e.target));
                } else if(data["type"] == 1) {
                    jsBox["main"].openSub("modMemo", $(e.target));
                }
            } catch (e) {
                return false;
            }
        }

        common.stopDefault(e);
    });

    //编辑窗用户搜索
    $("#anUserSearch").on("click", function(e){
        if($(this).hasClass("gs-disabled-button")) return false;
        var option = {
            selectObj: document.querySelector("#anUserSelector"),
            url: "/AdminManager/SearchUserInfoList",
            type: "get",
            data: {
                UserCode: $("#anUserCode").val()
            },
            htmlName: function (data) {
                return data["UserCode"] + " [" + data["UserName"] + "] "
            },
            valueName: "UserCode"
        };
        $.selectListLoad(option);
        common.stopDefault(e);
    });

    //删除
    $("#delBtn").on("click", function(e) {
        if($("[name='MemoId']:checked").length == 0) {
            alert("未选择条目");
            return false;
        }
        $("#listForm").submit();
        common.stopDefault(e);
    });
});