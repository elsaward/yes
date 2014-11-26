require.config({
    baseUrl: '/scripts/lib'
});

require(['jquery', 'jswindow', 'common', 'verify', 'form', 'page', 'enter', 'calendar'],
    function ($, jsw, common, Verify, form, Page, enter, calendar) {
    var jsBox = jsw.init();

    var pageBar = new Page("dataListPage", "dataList", renderData);

    var searchVerify = new Verify();
    searchVerify.init({
        form: "#searchForm",
        setting: {
            auto: false,
            trim: true
        },
        customChk: function () {
            var $start = $("#txtStart"),
                $end = $("#txtEnd"),
                $user = $("#txtSelectUser");
            if (historyChk[0].checked && $.trim($start.val()) == "") {
                searchVerify.showTips($start, "查历史库必须选择查询时间！");
                return false;
            }
            if ($("#selectedPipes").children().length == 0) {
                if ($.trim($user.val()) == "") {
                    searchVerify.showTips($user, "请选择用户！");
                    return false;
                }
                if ($.trim($start.val()) == "") {
                    searchVerify.showTips($start, "请选择起始时间！");
                    return false;
                }
                if (historyChk[0].checked != true && $.trim($end.val()) == "") {
                    searchVerify.showTips($end, "请选择结束时间！");
                    return false;
                }
            }
            return true;
        }
    });

    var redeliverVerify = new Verify();
    redeliverVerify.init({
        customChk: function () {
            var $start = $("#txtStart"),
                $pipe = $("#selectedPipes"),
                $user = $("#txtSelectUser"),
                $userIds = $("#hidSelectUser");
            if ($pipe.children().length != 1) {
                redeliverVerify.showTips($pipe, "必须且只能选择一个通道！");
                return false;
            }
            if ($userIds.val() == "" || $userIds.val().indexOf(",") != -1) {
                redeliverVerify.showTips($user, "必须且只能选择一个用户！");
                return false;
            }
            if ($.trim($start.val()) == "") {
                searchVerify.showTips($start, "请选择起始时间！");
                return false;
            }
            return true;
        }
    });

    var historyChk = $("#checkBoxHistory"),
        endTimeBlock = $("#txtEndSpan");

    historyChk.click(function () {
        if ($(this)[0].checked) {  //需要批次数量限制
            endTimeBlock.hide();
        } else {
            endTimeBlock.show();
        }
    });

    //加载时 消费提醒
    if (historyChk[0].checked) {
        endTimeBlock.hide();
    } else {
        endTimeBlock.show();
    }

    var srsPipes = $("#baseDropDown");
    var selPipes = $("#selectedPipes");

    var selPipesIdArr = [];
    var selPipesNameArr = [];

    function insertToArr(data, arr) {
        if ($.inArray(data, arr) == -1) {
            arr.push(data);
        }
    }

    function renderSelector() {
        var i, len;
        $.clearDomElement(selPipes[0]);
        if (selPipesIdArr.length != selPipesNameArr.length) {
            return false;
        }
        for (i = 0, len = selPipesIdArr.length; i < len; i++) {
            selPipes.append($("<option>").val(selPipesIdArr[i]).html(selPipesNameArr[i]));
        }
    }

    $("#searchPipeBtn").on("click", function (e) {
        var option = {
            selectObj: srsPipes[0],
            url: "/system/searchbasepipe",
            data: {
                basePipeNameLike: $("#searchPipe").val(),
                selectedPipeIds: selPipes.val()
            },
            valueName: "Id",
            htmlName: "PipeName"
        };
        $.selectListLoad(option);
        common.stopDefault(e);
    });

    $("#selPipeAll").on("click", function (e) {
        var i, len, item;
        for (i = 0, len = srsPipes.children().length; i < len; i++) {
            item = srsPipes.children().eq(i);
            insertToArr(item.val(), selPipesIdArr);
            insertToArr(item.text(), selPipesNameArr);
        }
        renderSelector();
        common.stopDefault(e);
    });
    $("#clrPipeAll").on("click", function (e) {
        $.clearDomElement(selPipes[0]);
        selPipesIdArr = [];
        selPipesNameArr = [];
        common.stopDefault(e);
    });
    $("#selPipe").on("click", function (e) {
        srsPipes.children(":selected").each(function () {
            insertToArr($(this).val(), selPipesIdArr);
            insertToArr($(this).text(), selPipesNameArr);
        });
        renderSelector();
        common.stopDefault(e);
    });
    $("#clrPipe").on("click", function (e) {
        selPipes.children(":selected").each(function () {
            selPipesIdArr.splice($(this).index(), 1);
            selPipesNameArr.splice($(this).index(), 1);
            $(this).remove();
        });
        common.stopDefault(e);
    });

    $("#clearUser").on("click", function (e) {
        $("#txtSelectUser").val("");
        $("#hidSelectUser").val("");
        common.stopDefault(e);
    });

    (function (box) {
        $("#searchUsers").on("click", function (e) {
            var userList = document.querySelector("#userList");
            var option = {
                selectObj: userList,
                url: "/User/GetUserList",
                data: { UserCode: $.trim($("#likeUserCode").val()) },
                valueName: "Id",
                htmlName: function (data) {
                    return data["UserCode"] + " [" + data["UserName"] + "] "
                }
            };
            $.selectListLoad(option);
            common.stopDefault(e);
        });
        box.beforeOpen = function () {
            this.tmpDataFor = this.sourceObj.attr("data-for");
        };
        box.submit = function () {
            var user = $("#userList");
            var target = $(this.tmpDataFor);
            target.val(user.find("option:selected").text().replace(/\]\s/g, '];'));
            target.next().val(user.val());
        };
        box.reset = function () {
            delete this.tmpDataFor;
        };
    })(jsBox["userSelector"]);

    (function (box) {
        box.beforeOpen = function () {
            if (!redeliverVerify.chkForm()) {
                return false;
            }
            var option = {
                begin: $("#txtStart").val(),
                end: $("#txtEnd").val(),
                smsContent: $("#conetent").val(),
                selectedPipeIds: $("#selectedPipes").children().eq(0).val(),
                seqNo: $("#interSeq").val(),
                destinationNo: $("#numberNo").val(),
                hidUserIds: $("#hidSelectUser").val(),
                checkBoxHistory: $("#checkBoxHistory")[0].checked ? 1 : 0,
                sendStatus: $("#statusDropDown").val(),
                realStatus: $("#reachDropDown").val(),
                failureControl: $("#failureControl").val()
            };
            var ajaxOption = {
                url: "/system/conditionresend",
                data: option,
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    if (res["Result"] != "") {
                        $("#resendFrame").attr("src", "/sysmanager/" + res["Result"]);
                    }
                }
            };
            $.ajax(ajaxOption);
        };
        box.reset = function () {
            $("#resendFrame").attr("src", "");
        };
    })(jsBox["reSendBox"]);

    $("#searchBtn").on("click", function (e) {
        if (searchVerify.chkForm()) {
            var selectedPipeIds = [];
            $("#selectedPipes").children().each(function () {
                selectedPipeIds.push($(this).val());
            });

            var option = {
                begin: $("#txtStart").val(),
                end: $("#txtEnd").val(),
                smsContent: $("#conetent").val(),
                selectedPipeIds: selectedPipeIds.join(","),
                seqNo: $("#interSeq").val(),
                destinationNo: $("#numberNo").val(),
                hidUserIds: $("#hidSelectUser").val(),
                checkBoxHistory: $("#checkBoxHistory")[0].checked ? 1 : 0,
                sendStatus: $("#statusDropDown").val(),
                realStatus: $("#reachDropDown").val(),
                failureControl: $("#failureControl").val()
            };
            loadDataList(option);
        }
        common.stopDefault(e);
    });

    $("#countBtn").on("click", function (e) {
        if (searchVerify.chkForm()) {
            var selectedPipeIds = [];
            $("#selectedPipes").children().each(function () {
                selectedPipeIds.push($(this).val());
            });
            var option = {
                begin: $("#txtStart").val(),
                end: $("#txtEnd").val(),
                smsContent: $("#conetent").val(),
                selectedPipeIds: selectedPipeIds.join(","),
                seqNo: $("#interSeq").val(),
                destinationNo: $("#numberNo").val(),
                hidUserIds: $("#hidSelectUser").val(),
                checkBoxHistory: $("#checkBoxHistory")[0].checked ? 1 : 0,
                sendStatus: $("#statusDropDown").val(),
                realStatus: $("#reachDropDown").val(),
                failureControl: $("#failureControl").val()
            };
            var ajaxOption = {
                url: "/system/pipesearchcountpost",
                data: option,
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    if (!isNaN(res["Result"])) {
                        $("#countForResult").html(res["Result"]);
                    }
                }
            };
            $.ajax(ajaxOption);
        }
        common.stopDefault(e);
    });

    $("#exportBtn").on("click", function (e) {
        if (searchVerify.chkForm()) {
            var selectedPipeIds = [];
            $("#selectedPipes").children().each(function () {
                selectedPipeIds.push($(this).val());
            });
            $("#hidPipes").val(selectedPipeIds.join(","));
            $("#searchForm").submit();
        }
        common.stopDefault(e);
    });

    //加载查询结果
    function loadDataList(option) {
        var options = {
            url: "/system/pipesearchpost",
            data: option,
            infoListName: "InfoList",
            amountName: "Amount",
            pageName: "pn"
        };
        pageBar.load(options);
    }

    //渲染查询结果
    function renderData(data, contain) {
        var tpl = function (i, item) {
            return '<tr><td>' + (i + 1) + '</td>' +
                '<td><a href="#" class="get-top-note"> ' + item["SendUser"] + '</a></td>' +
                '<td>' + item["SendPipe"] + '</td>' +
                '<td>' + item["SeqNo"] + '</td>' +
                '<td class="gs-align-left">' +
                '<div class="gs-mail-text">' +
                '<a>' + item["SmsContent"] + '</a>' +
                '</div></td>' +
                '<td>' + item["PhoneNum"] + '</td>' +
                '<td>' + item["OperateTime"] + '</td>' +
                '<td>' + item["SendTime"] + '</td>' +
                '<td>' + item["SendStatus"] + '</td>' +
                '<td>' + item["RealStatus"] + '</td>' +
                '<td>' + item["FailureRate"] + '</td></tr>'
        };
        var i, len = data.length, item, tmp = "";
        for (i = 0; i < len; i++) {
            item = data[i];
            tmp += tpl(i, item);
        }
        $(contain).append($(tmp));
        $(".gs-mail-text>a").click(function () {
            common.showModal($(this).html(), 1);
        });
        $(".get-top-note").on("click", function(e) {
            var userCode = this.innerHTML || this.value;
            if(!userCode) return false;
            window.top.postMessage("note,"+userCode, '*');
            common.stopDefault(e);
        });
    }
});