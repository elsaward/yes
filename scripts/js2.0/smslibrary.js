require.config({
    baseUrl: "/scripts/lib"
});

require(["jquery", "common", "jswindow", "page", "switcher"], function ($, common, jsw, Page, switcher) {
    var jsBox = jsw.init();
    var mode = 0;  //0 自定义 1 常用
    var type = 0;  //类型
    var custType = [];  //自定义类型
    var commType = [];  //常用类型
    var typeArr = [custType, commType];
    var pageBar = [
        new Page("customListPage", "customList", renderSMSList),
        new Page("commonListPage", "commonList", renderSMSList)
    ];

    getSMSTypeList(0);
    getSMSTypeList(1);

    //选择发送方式
    $("#selSMSType").children().on("click", function (e) {
        mode = $(this).index();
        common.stopDefault(e);
    });

    $(".gs-tree").on("click", "a", function(e) {
        type = $(this).data("type");
        getSMSList(type, mode);
        common.stopDefault(e)
    });

    $(".add-type-btn").on("click", function(e) {
        var list = $(".gs-tree").eq(mode);
        var name = $(this).prev();
        if(!name.val()) return false;
        var option = {
            url: "",
            data: {
                name: name.val()
            },
            success: function(res) {
                //if(!common.chkResponse(res)) return false;
                list.append("<li><input type='checkbox'> <a href='#' data-type='0'>"+name.val()+"</a></li>");
                typeArr[mode].push({
                    SLGid: 0,
                    GName: name.val()
                });
                name.val("");
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    $("[data-all]").on("click", function(e) {
        var self = this;
        var type = $(this).data("all");
        $("[data-sel="+type+"]").each(function() {
            this.checked = self.checked;
        });
    });

    $(".sms-list").on("click", function(e) {
        var $target = $(e.target);
        var type = "type-" + $(this).data("type");
        var pipeIds = $("[data-sel="+type+"]");
        if($target.attr("name") == "smsIds") {
            if (!$target.is(":checked")) {
                $("[data-all="+type+"]")[0].checked = false;
            } else {
                for (var i = 0; i < pipeIds.length; i++) {
                    if (pipeIds.eq(i).is(":checked")) {
                        continue;
                    }
                    return;
                }
                $("[data-all="+type+"]")[0].checked = true;
            }
        }
    });

    (function(box){
        box.beforeOpen = function() {
            if(box.sourceObj.html() == "新增") {
                $("#smsTitle").html("新增短信");
            } else {
                $("#smsTitle").html("修改短信");
            }
            var option = {
                selectObj: document.querySelector("#smsType"),
                presentData: typeArr[mode],
                initialValue: box.sourceObj.data("type") || type,
                htmlName: "GName",
                valueName: "SLGid"
            };
            $.selectListLoad(option);
        };
        box.submit = function() {
            pageBar[mode].goto(1);
        };
    })(jsBox["smsModal"]);

    (function(box){
        box.beforeOpen = function() {
            var inputs = $(pageBar[mode]["contain"]).find("[name='smsIds']:checked");
            if(inputs.length == 0) return false;
            var i, len = inputs.length, ids = [];
            for(i = 0; i < len; i++) {
                ids.push(inputs.eq(i).val());
            }
            $("#delIds").val(ids.join(","));
        };
        box.submit = function() {
            var option = {
                url: "",
                data: {
                    id: $("#delIds").val()
                },
                success: function(res) {
                    pageBar[mode].reloadThisPage();
                }
            }
        };
    })(jsBox["delModal"]);

    function getSMSTypeList(mode) {
        var option = {
            url: "/sms/getcommonsms",
            data: {sLType: mode},
            success: function(res) {
                if(!common.chkResponse(res)) return false;
                typeArr[mode] = res["InfoList"];
                getSMSList(typeArr[mode][0]["SLGid"], mode);
                renderTypeList(typeArr[mode], mode);
            }
        };
        $.ajax(option);
    }

    function renderTypeList(data, mode) {
        var list = $(".gs-tree").eq(mode);
        $.clearDomElement(list[0]);
        var tpl = function(item) {
            return "<li><input type='checkbox'> <a href='#' data-type='"+item["SLGid"]+"'>"+item["GName"]+"</a></li>";
        };
        var i, len = data.length, htmlStr = "";
        for(i = 0; i < len; i++) {
            htmlStr += tpl(data[i]);
        }
        list.append(htmlStr);
    }

    function getSMSList(type, mode) {
        var options = {
            url: "/ajax/ajax_getsmslibraryinfolist.ashx",
            data: {
                typeId: type,
                isCommon: mode, //是否为常用短信 0否 1是
                ps: 5
            },
            amountName: "Amount",
            infoListName: "SmsInfoList",
            pageName: "pn"
        };
        //pageBar[mode].load(options);
        var data = [
            {
                id: 1,
                content: "内容内容内容1" + type
            },
            {
                id: 2,
                content: "内容内容内容2" + type
            },
            {
                id: 3,
                content: "内容内容内容3" + type
            }
        ];
        var contain = mode == 0 ? document.querySelector("#customList") : document.querySelector("#commonList");
        $.clearDomElement(contain);
        renderSMSList(data, contain);
    }

    function renderSMSList(data, contain) {
        var type = "type-" + $(contain).data("type");
        var tpl = function(item) {
            return '<tr>' +
                '<td><input type="checkbox" data-sel="' + type + '" name="smsIds" value="' + item["id"] + '"></td>' +
                '<td class="gs-align-left">' + item["content"] +
                '</td>' +
                '</tr>';
        };
        var i, len = data.length, htmlStr = "";
        for(i = 0; i < len; i++) {
            htmlStr += tpl(data[i]);
        }
        $("[data-all="+type+"]")[0].checked = false;
        $(contain).append(htmlStr);
    }
});