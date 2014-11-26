require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});
require(['jquery', 'common', 'jswindow', 'verify', 'form'], function ($, common, jsw, Verify, form) {
    var jsBox = jsw.init();
    $("#allPipes").selAll("selPipe");

    $("#changeStatus").on("click", function () {
        $("#statusHid").val($("#statusSel").val());
        var option = {
            beforeSubmit: function () {
                if ($("[name='selPipe']:checked").length == 0) return false;
            },
            success: function (res) {
                if(!chkResponse(res)) return false;
                location.reload();
            }
        };
        $("#changeStatusForm").ajaxSubmit(option);
    });

    (function (box) {
        var detailVerify = new Verify();
        detailVerify.init({
            form: "#pipeDetailForm",
            setting: {
                auto: false,
                trim: true
            }
        });

        var formOptions = {
            beforeSubmit: function () {
                if (detailVerify.chkForm()) {
                    return true;
                } else {
                    box.submitObj.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function (res, statusText, xhr, $form) {
                if(!chkResponse(res)) return false;
                var status = ["无效状态", "有效状态"];
                box.submitObj.removeClass("gs-disabled-button");
                if (box.sourceObj.data("type") == 0 && res["Result"] == true) {
                    location.reload();
                    return false;
                }
                alert(res["Result"] ? "操作成功" : "操作失败");
                var line = box.sourceObj.parents("tr").eq(0).children(),
                    form = $form[0];
                line.eq(2).text(form["detailPipeName"].value);
                line.eq(3).text(status[form["detailStatus"].value]);
                box.submitObj.removeClass("gs-disabled-button");
                box.close();
            }
        };

        box.beforeOpen = function () {
            var title = ["确定增加", "确定修改"],
                action = ["/pipeinfo/createormodifypipe", "/pipeinfo/createormodifypipe"];
            var type = this.sourceObj.data("type"),
                id = this.sourceObj.data("id");
            $("#idMod").val(id || "");
            $("#pipeDetailTitle").html(this.sourceObj.text());
            this.submitObj.html(title[type]);
            $("#pipeDetailForm").attr("action", action[type]);
            if (id) {
                loadPipeInfo(id);
            }
        };

        box.submit = function () {
            box.submitObj.addClass("gs-disabled-button");
            box.autoClose = false;
            $("#pipeDetailForm").ajaxSubmit(formOptions)
        };

        box.reset = function () {
            detailVerify.hideTips();
        };

        function loadPipeInfo(id) {
            var option = {
                url: "/PipeInfo/PipeInfoDetails",
                type: "post",
                data: {
                    id: id
                },
                success: function (res) {
                    if(!chkResponse(res)) return false;
                    res = res["Result"];
                    $("#detailPipeName").val(res["PipeName"]);
                    $("#detailStatus").val(res["StatusInt"]);
                    $("#detailPipeType").val(res["PipeType"]);
                    $("#detailStandCount").val(res["StandCount"]);
                    $("#detailLongCount").val(res["LongCount"]);
                    $("#detailCheckSign").val(res["CheckSign"]);
                    $("#detailSignLen").val(res["SignLen"]);
                    $("#detailPipeNote").val(res["PipeNote"]);
                    $("#detailUnitPrice").val(res["UnitPrice"]);
                }
            };
            $.ajax(option);
        }
    })(jsBox["pipeDetail"]);
});

$(function () {



    /*(function(box){
     $("#allArea").selAll("idAreas");
     box.submit = function() {
     var pipes = this.boxObj.find("[name='idAreas']:checked");
     var pipesArr = [], i, len;
     for (i = 0, len = pipes.length; i < len; i++) {
     pipesArr.push(pipes.eq(i).val());
     }
     this.sourceObj.val(pipesArr.join(","));
     };
     })(jsBox["sendArea"]);*/

    /*(function (box) {
     var keywordVerify = new Verify();
     keywordVerify.init({
     form: "#keywordForm",
     setting: {
     auto: false,
     trim: true
     },
     customChk: function () {
     var $keyword = $("#keywordContent");
     var keywords = $keyword.val();
     if (keywords != "" && (keywords[0] == "|" || keywords[keywords.length - 1] == "|")) {
     keywordVerify.showTips($keyword, "格式不正确！");
     return false;
     }
     return true;
     }
     });
     var formOptions = {
     beforeSubmit: function () {
     if (keywordVerify.chkForm()) {
     return true;
     } else {
     box.submitObj.removeClass("gs-disabled-button");
     return false;
     }
     },
     success: function (res, statusText, xhr, $form) {
     box.submitObj.removeClass("gs-disabled-button");
     box.close();
     }
     };
     box.beforeOpen = function () {
     $("#idKeyword").val(this.sourceObj.data("id"));
     loadKeywords(this.sourceObj.data("id"));
     };

     box.submit = function () {
     this.autoClose = false;
     box.submitObj.addClass("gs-disabled-button");
     $("#keywordForm").ajaxSubmit(formOptions);
     };

     box.reset = function () {
     keywordVerify.hideTips();
     };

     function loadKeywords(id) {
     if (!id) {
     return false;
     }
     var option = {
     url: "pipemanager.php?param=3",
     type: "post",
     data: {
     id: id
     },
     success: function (res) {
     var $inputs = box.boxObj.find(":input");
     $inputs.each(function () {
     $(this).val(res);
     });
     }
     };
     $.ajax(option);
     }
     })(jsBox["keyword"]);*/
});