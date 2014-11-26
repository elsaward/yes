require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'common', 'verify', 'jswindow', 'form'], function($, common, Verify, jsw, form) {
    var jsBox = jsw.init();

    var createVerify = new Verify();
    createVerify.init({
        form: "#createForm"
    });

    $("#selAll").selAll("id");

    $(".gs-mail-text>a").on("click", function() {
        common.showModal($(this).html(), 1);
    });

    //createModal
    (function(box) {
        var createFormOptions = {
            beforeSubmit: function () {
                if (createVerify.chkForm()) {
                    return true;
                } else {
                    box.submitObj.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                box.submitObj.removeClass("gs-disabled-button");
                if (res["Result"].toLowerCase() == "true") {
                    alert("操作成功");
                    location.reload();
                }
                else {
                    alert("操作失败");
                }
            },
            error: function () {
                alert("连接超时");
                box.submitObj.removeClass("gs-disabled-button");
            }
        };
        box.beforeOpen = function() {
            var id = box.sourceObj.data("id");
            if(id) {
                $("#modalId").val(id);
                $("#modalPhoneNO").val(box.sourceObj.data("no"));
                $("#modalAddNote").val(box.sourceObj.data("info"));
            }
        };
        box.submit = function() {
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            $("#createForm").ajaxSubmit(createFormOptions);
        };
    })(jsBox["createModal"]);

    //删除
    $("#delBtn").on("click", function(e) {
        $("#listForm").submit();
        common.stopDefault(e);
    });
});