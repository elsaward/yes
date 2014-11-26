require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'jswindow', 'common', 'verify', 'form', 'page', 'enter', 'floatTips'],
function($, jsw, common, Verify, form, Page, enter, tips) {
    var jsBox = jsw.init();

    var tipsFlag = true;
    var tipsCount = 0;

    var modalObj = $("#gs-modal");
    modalObj.find(".gs-close").on("click", function () {
        modalObj.removeClass("gs-open");
    });

    $("#tipsList").on("click", function(e) {
        if(e.target.tagName == "A") {
            $.clearDomElement(e.target);
            $(e.target).remove();
            tipsCount--;
            if (tipsCount == 0) {
                $("#mainTips").removeClass("open");
            }
        }
    });

    function chkAudit() {
        if ($("#mainTips").hasClass("open")) {
            return false;
        }
        $.ajax({
            url: "/voicemsg/voicenotifyinfo",
            beforeSend: function () {},
            complete: function () {},
            success: function (res) {
                if(!common.chkResponse(res)) return false;
                tipsCount = 0;
                var tipsList = $("#tipsList");
                $.clearDomElement(tipsList[0]);
                var tpl = function(item) {
                    return '<li><a href="'+item["Link"]+'" target="mainFrame" class="gs-text-danger">'+
                        item["NotifyInfo"]+'</a></li>';
                };
                var i, len, item, htmlStr = "";
                for (i = 0, len = res["InfoList"].length; i < len; i++) {
                    item = res["InfoList"][i];
                    if (item["Amount"] > 0) {
                        htmlStr += tpl(item);
                        tipsCount++;
                    }
                }
                tipsList.append(htmlStr);
                if (tipsCount > 0) {
                    $("#mainTips").addClass("open");
                }
            }
        });
    }

    var menus = $(".gs-parent");
    menus.on("click", function(e){
        if($(e.target).attr("href") == "#") {
            var selfSub = $(this).find(".gs-sub-nav");
            var otherSubs = $(this).siblings().find(".gs-sub-nav");
            if($(this).hasClass("gs-active")){
                selfSub.slideUp();
                $(this).removeClass("gs-active");
            }else{
                selfSub.slideDown();
                otherSubs.slideUp();
                $(this).addClass("gs-active");
                $(this).siblings().removeClass("gs-active");
            }
            common.stopDefault(e);
        } else if ($(e.target).html() == "批量审核" && tipsFlag) {
            tipsFlag = false;
            setInterval(chkAudit, 60 * 1000);
        }
    });

    var subMenus = $(".gs-sub-nav").children("li");
    subMenus.on("click", function(e){
        var li = $(this);
        subMenus.removeClass("gs-active");
        li.addClass("gs-active");
    });

    $(".gs-note-contain").on("mouseover", "[data-tips]", function(e) {
        tips.show(e, $(e.target).data("tips"));
    }).on("mouseout", "[data-tips]", function(e) {
        tips.hide();
    });

    $(".gs-note-tab").on("click", function(e) {
        var note = $(this).data("open");
        if($(this).hasClass("on")) {
            closeNote(note);
        } else {
            openNote(note);
            if(this.innerHTML == "客服备忘录") {
                loadMemo();
            }
        }
        common.stopDefault(e);
    });

    $(".gs-note-close").on("click", function(e) {
        var note = $(this).parent().attr("id");
        closeNote(note);
        common.stopDefault(e);
    });

    function openNote(note) {
        $(".gs-note-tab").removeClass("on");
        $(".gs-note").removeClass("on");
        $("[data-open='"+note+"']").addClass("on");
        $("#"+note).addClass("on");
    }

    function closeNote(note) {
        $("[data-open='"+note+"']").removeClass("on");
        $("#"+note).removeClass("on");
    }

    var cnPage = new Page("cnPage", "cnHistoryList", renderHistoryList);
    var csPage = new Page("csPage", "csMemoList", renderMemoList);

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
                    alert("添加成功");
                    box.close();
                } else {
                    alert("添加失败");
                }
            },
            error: function (req) {
                alert("连接超时");
                box.submitObj.removeClass("gs-disabled-button");
            }
        };
        box.beforeOpen = function() {
            var userCode = sessionStorage.getItem("cnUserCode");
            if(userCode) {
                $("#anUserCode").val(userCode);
                $("#anUserSearch").click();
            }
        };
        box.submit = function() {
            box.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            $("#addNoteForm").ajaxSubmit(addNoteFormOption);
        };

        box.reset = function() {
            $.clearDomElement(document.querySelector("#anUserSelector"));
        };
    })(jsBox["addNote"]);

    $("#anUserSearch").on("click", function(e){
        var code = $("#anUserCode").val();
        if(!code) return false;
        var option = {
            selectObj: document.querySelector("#anUserSelector"),
            url: "/AdminManager/SearchUserInfoList",
            type: "get",
            data: {
                UserCode: code
            },
            htmlName: "UserName",
            valueName: "UserCode",
            callback: function(data, selector) {
                $(selector).val(data[0]["UserCode"]);
                $("#noteContent").focus();
            }
        };
        $.selectListLoad(option);
        common.stopDefault(e);
    });

    $("#cnSearchBtn").on("click", function(e) {
        var userCode = $("#cnUserCode").val();
        if(!userCode) return false;
        loadNote(userCode);
        common.stopDefault(e);
    });

    $("#historySearchBtn").on("click", function(e) {
        var userCode = $("#cnUserCode").val();
        var keyword = $("#historyKeyword").val();
        var type = $("#historyType").val();
        var options = {
            url: "/AdminManager/CustomerMemoInfo",
            infoListName: "MemoInfoList",
            data: {
                UserCode: userCode,
                Category: type,
                Description: keyword
            }
        };
        cnPage.load(options);
        common.stopDefault(e);
    });

    //渲染重要事项列表
    function renderHotList(data) {
        var list = $("#cnHotList");
        $.clearDomElement(list[0]);
        var i, len = data.length;
        for(i = 0; i < len; i++) {
            list.append("<li><a class='text-overflow gs-width-full gs-text-danger' data-tips='" + data[i]["Description"] +
                "' href='#'>"+data[i]["Description"]+"</a></li>");
        }
    }

    function renderHistoryList(data, contain) {
        var tpl = function(item) {
            return '<div class="gs-note-row">' +
                '<div class="gs-note-item">' + item["Category"] + '</div>' +
                '<div class="gs-note-item">' + item["Recorder"] + '</div>' +
                '<div class="gs-note-item">' + item["CreatedString"] + '</div>' +
                '<hr>' +
                '<div class="text-overflow" data-tips="' + item["Description"] + '">' + item["Description"] + '</div>' +
                '</div>'
        };
        var list = $(contain);
        var i, len = data.length;
        for(i = 0; i < len; i++) {
            list.append($(tpl(data[i])));
        }
    }

    //客服备忘录
    (function(box){
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
                    box.close();
                    loadMemo(csPage.index);
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
            var id = box.sourceObj.attr("data-id");
            var level = box.sourceObj.attr("data-level");
            if(id != undefined) {
                $("#memoHidId").val(id);
                $("#memoContent").val(box.sourceObj.html());
                $("#memoLevel").val(level);
            }
            setTimeout(function(){
                $("#memoContent").focus();
            },200);
        };

        box.submit = function() {
            box.autoClose = false;
            box.submitObj.addClass("gs-disabled-button");
            $("#modMemoForm").ajaxSubmit(modMemoFormOption);
        };
    })(jsBox["modMemo"]);

    $(".mod-memo-list").on("click", function(e) {
        if(e.target.tagName == "A") {
            jsBox["serviceNote"].openSub("modMemo", $(e.target));
        }
        common.stopDefault(e);
    });

    $("#csSearchBtn").on("click", function(e) {
        var options = {
            url: "/AdminManager/SupportMemoInfo",
            type: "get",
            data: {
                Description: $("#csKeyword").val()
            },
            infoListName: "MemoInfoList"
        };
        csPage.load(options);
        common.stopDefault(e);
    });

    function loadNote(userCode) {
        var option = {
            url: "/AdminManager/SearchMemoByUserCode",
            type: "get",
            data: {
                UserCode: userCode
            },
            success: function(res) {
                if(!common.chkResponse(res)) return false;
                renderHotList(res["ImportantMemoTop"]);
                $("#cnSales").html(res["BelongToSales"]);
                $("#cnCs").html(res["BelongToSupport"]);
                sessionStorage.setItem("cnUserCode", res["UserCode"] || "");
            }
        };
        $.ajax(option);
        var options = {
            url: "/AdminManager/CustomerMemoInfo",
            type: "get",
            data: {
                userCode: userCode,
                Category: "显示全部"
            },
            infoListName: "MemoInfoList"
        };
        cnPage.load(options);
    }

    function loadMemo(pn) {
        var option = {
            url: "/AdminManager/SupportImportantInfo",
            success: function(res) {
                if(!common.chkResponse(res)) return false;
                renderStarList(res["ImportantMemoTop"]);
            }
        };
        $.ajax(option);

        var options = {
            url: "/AdminManager/SupportMemoInfo",
            infoListName: "MemoInfoList"
        };
        csPage.load(options);
        if(pn != undefined && pn != 1) {
            csPage.goto(pn || 1);
        }
    }

    function renderStarList(data) {
        var tpl = function(item) {
            return '<li>' +
                '<a class="text-overflow gs-width-full gs-text-danger" href="#" data-tips="' +
                item["Description"] + '" data-id="' + item["Id"] + '" data-level="' +
                item["Level"] + '">' + item["Description"] +
                '</a></li>';
        };
        var list = $("#csStarList");
        $.clearDomElement(list[0]);
        var i, len = data.length;
        for(i = 0; i < len; i++) {
            list.append(tpl(data[i]));
        }
    }

    function renderMemoList(data, contain) {
        var tpl = function(item) {
            return '<li>' +
                '<a class="text-overflow gs-width-full" href="#" data-tips="' +
                item["Description"] + '" data-id="' + item["Id"] + '" data-level="' +
                item["Level"] + '">' + item["Description"] +
                '</a></li>';
        };
        var list = $(contain);
        var i, len = data.length;
        for(i = 0; i < len; i++) {
            list.append(tpl(data[i]));
        }
    }

    //接收子框架的数据
    window.addEventListener("message", function(e) {
        var data, comm, userCode;
        if(!e.data) return false;
        data = e.data.split(",");
        if(data.length < 2) return false;
        comm = data[0];
        userCode = data[1];
        if(!userCode) return false;
        if(comm == "note") {
            $("#cnUserCode").val(userCode);
            loadNote(userCode);
            openNote("customNote");
        }
    });
});