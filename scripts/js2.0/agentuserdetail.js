require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'jswindow', 'common', 'verify', 'form', 'calendar'],
function($, jsw, common, Verify, form, calendar) {
    var jsBox = jsw.init();
    var baseInfoVerify = new Verify();
    var settingVerify = new Verify();
    var pipeVerify = new Verify();
    var mainVerify = new Verify();

    clearForm();

    //表单提交

    //验证配置
    baseInfoVerify.init({
        form: "#infoForm",
        customChk: function() {
            var userName = $("#UserName");
            var email = $("#Email");
            if (/\s/g.exec(userName.val()) != null) {
                baseInfoVerify.showTips(userName, "用户名不可有空格");
                return false;
            }
            if (/\s/g.exec(email.val()) != null) {
                baseInfoVerify.showTips(email, "邮箱不可有空格");
                return false;
            }
            return true;
        }
    });

    settingVerify.init({
        form: "#settingForm",
        customChk: function() {
            var mustNumber = $("#MustNumber");
            var pushRepUrl = $("#PushRepUrl");
            if($("#IsMust").val() == "1" && mustNumber.val() == "") {
                settingVerify.showTips(mustNumber, "没有设置记录基数");
                return false;
            }
            if($("#IsStatus").val() == "1" && pushRepUrl.val() == "") {
                settingVerify.showTips(pushRepUrl, "没有设置推送地址");
                return false;
            }
            return true;
        }
    });

    pipeVerify.init({
        form: "#pipeModForm",
        customChk: function() {
            var unitPrice = $("#unitPrice");
            if (parseFloat(unitPrice.val()) == 0) {
                pipeVerify.showTips(unitPrice, "单价不能为0");
                return false;
            }
            return true;
        }
    });

    mainVerify.init({
        form: "#mainForm",
        customChk: function() {
            return baseInfoVerify.customChk() && settingVerify.customChk();
        }
    });

    //保存信息
    $("#btnSaveInfo").on("click", function(e) {
        if (!baseInfoVerify.chkForm()) return false;
        var data = {
            UserID: $("#UserID").val(),
            UserName: $("#UserName").val(),
            UserCode: $("#UserCode").val(),
            Mobile: $("#Mobile").val(),
            Email: $("#Email").val(),
            BelongToSales: $("#BelongToSales").val(),
            BelongToSupport: $("#BelongToSupport").val(),
            Industry: getCheckBoxItems("Industry"),
            UserPayType: $("#UserPayType").val(),
            IsSuccCharge: $("#IsSuccCharge").val(),
            Valid: $("#Valid").val(),
            Expiration: $("#Expiration").val()
        };
        var option = {
            url: "/User/SaveUserBaseAttribute",
            data: data,
            success: function(res) {
                if(!common.chkResponse(res)) return false;
                if(res["Result"].toLowerCase() == "true") {
                    alert("保存成功");
                } else {
                    alert("保存失败");
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    //保存设置
    $("#btnSaveSetting").on("click", function(e) {
        if(!settingVerify.chkForm()) return false;
        var isStatus = $("#IsStatus").val();
        var data = {
            UserID: $("#UserID").val(),
            IsMust: $("#IsMust").val(),
            MustNumber: $("#MustNumber").val(),
            IsAuto: $("#IsAuto").val(),
            CutBase: $("#CutBase").val(),
            OrderLevel: $("#OrderLevel").val(),
            CutPercent: $("#CutPercent").val(),
            UserExt: $("#UserExt").val(),
            UserExtDX: $("#UserExtDX").val(),
            UserExtLT: $("#UserExtLT").val(),
            IsStatus: isStatus,
            PushRepUrl: isStatus == 1 ? $("#PushRepUrl").val() : "",
            PushMOUrl: $("#PushMOUrl").val()
        };
        var option = {
            url: "/User/SaveUserConfigAttribute",
            data: data,
            success: function(res) {
                if(!common.chkResponse(res)) return false;
                if(res["Result"].toLowerCase() == "true") {
                    alert("保存成功");
                } else {
                    alert("保存失败");
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    //保存权限
    $("#btnSaveMenu").on("click", function(e) {
        var id = $("#UserID").val();
        if(!id) return false;
        var option = {
            url: "/User/BindUserMenu",
            data: {
                UserID: id,
                UserType: $("#UserType").val(),
                UserMenuIds: getCheckBoxItems("UserMenuIds")
            },
            success: function(res) {
                if(!common.chkResponse(res)) return false;
                if(res["Result"].toLowerCase() == "true") {
                    alert("保存成功");
                } else {
                    alert("保存失败");
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    //保存全部
    var btnSaveAll = $("#btnSaveAll");

    var mainFormOption = {
        beforeSubmit: function () {
            if (mainVerify.chkForm()) {
                return true;
            } else {
                btnSaveAll.removeClass("gs-disabled-button");
                return false;
            }
        },
        success: function (res) {
            if (!common.chkResponse(res)) return false;
            btnSaveAll.removeClass("gs-disabled-button");
            if(res["Result"]) {
                alert(res["Result"]);
                return false;
            }
            $("#btnSaveAll").html("修改用户");
            getUserAllInfoById(res["UserId"]);
            openPWBox(res, "1");
        },
        error: function (req) {
            alert("连接超时");
            btnSaveAll.removeClass("gs-disabled-button");
        }
    };
    btnSaveAll.on("click", function(e) {
        if(btnSaveAll.hasClass("gs-disabled-button")) return false;
        btnSaveAll.addClass("gs-disabled-button");
        $("#mainForm").ajaxSubmit(mainFormOption);
        common.stopDefault(e);
    });

    function getCheckBoxItems(name) {
        var items = [];
        $("[name='"+name+"']:checked").each(function(){
            items.push(this.value);
        });
        return items.join(",");
    }

    //页面跳转
    //账户明细
    $("#btnUserDetail").on("click", function(e) {
        var id = $("#UserID").val();
        if(!id) return false;
        location.href = "/User/CheckUserAccountInfo?UserID=" + id;
        common.stopDefault(e);
    });

    //进入用户
    $("#btnLoginUser").on("click", function(e) {
        var id = $("#UserID").val();
        if(!id) return false;
        location.href = "/User/EnterUserAcctount?UserID=" + id;
        common.stopDefault(e);
    });

    //新建用户
    $("#createUserBtn").on("click", function(e) {
        clearForm();
        common.stopDefault(e);
    });

    //按字母
    $(".search-letter").on("click", function(e) {
        var option = {
            url: "/User/SearchUserInfoByInitial",
            type: "get",
            data: {
                Initial: this.innerHTML
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                renderUserList(res["UserTreeList"]);
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    //搜索用户
    $("#searchBtn").on("click", function(e) {
        var searchTxt = $("#searchTxt").val();
        if(searchTxt == "") {
            return false;
        }
        var option = {
            url: "/User/SearchUserInfoByCodeOrName",
            data: {
                CodeOrName: searchTxt
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                renderUserList(res["UserTreeList"]);
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    //用户树
    $("#userList").on("click", function(e) {
        var $target = $(e.target);
        var option;
        if($target.hasClass("gs-tree-parent")) {
            if($target.hasClass("open")) {
                $target.removeClass("open");
                return false;
            }
            option = {
                url: "/User/SearchChildUserInfoByUserId",
                type: "get",
                data: {
                    UserID: $target.data("id")
                },
                success: function(res) {
                    if (!common.chkResponse(res)) return false;
                    var data = res["UserTreeList"];
                    if(data.length == 0) {
                        $target.removeClass("gs-tree-parent");
                        return false;
                    }
                    var list = $target.find(".gs-tree-sub");
                    if(list.length == 0) {
                        list = $("<ul></ul>").addClass("gs-tree-sub");
                        $target.append(list);
                    }
                    $target.addClass("open");
                    renderSubUserList(data, list);
                }
            };
            $.ajax(option);
        } else if(e.target.tagName == "A") {
            $("#btnSaveAll").html("修改用户");
            getUserAllInfoById($target.data("id"));
        }
        common.stopDefault(e);
    });

    function renderUserList(data) {
        var list = $("#userList");
        $.clearDomElement(list[0]);
        var i, j, len, subArr = [], item, str = "", userParent, sub, parent;
        var tpl = function(item) {
            var id = item["ID"];
            var userName = item["UserName"];
            var userCode = item["UserCode"];
            var userType = item["UserTypeText"].charAt(0);
            var userClass = item["Valid"] == 1 ? "gs-text-success" : "gs-text-danger";
            return '<li class="gs-tree-parent" data-id="'+ id +'" data-code="'+ userCode +'">' +
                '<a class="'+ userClass +'" href="#" data-id="'+ id +'">' +
                '['+ userType +']'+ userName +':'+ userCode +'</a></li>';
        };
        var subTpl = function(item) {
            var id = item["ID"];
            var userName = item["UserName"];
            var userCode = item["UserCode"];
            var userType = item["UserTypeText"].charAt(0);
            var userClass = item["Valid"] == 1 ? "gs-text-success" : "gs-text-danger";
            return '<li><a class="'+ userClass +'" data-id="'+ id +'" href="#">' +
                '['+ userType +']'+ userName +':'+ userCode +'</a></li>';
        };
        for(i = 0, len = data.length; i < len; i++) {
            item = data[i];
            if(item["UserParent"] == "") {
                str += tpl(item);
            } else {
                subArr.push(item);
            }
        }
        list.append(str);
        for(j = 0, len = subArr.length; j < len; j++) {
            item = subArr[j];
            userParent = item["UserParent"];
            parent = list.find("[data-code='"+userParent+"']");
            sub = parent.find(".gs-tree-sub");
            if(sub.length == 0) {
                sub = $("<ul></ul>").addClass("gs-tree-sub");
                parent.append(sub);
            }
            sub.append(subTpl(item));
            parent.addClass("open");
        }
    }

    function renderSubUserList(data, list) {
        $.clearDomElement(list[0]);
        var i, len = data.length, str = "";
        var tpl = function(item) {
            var userClass = item["Valid"] == 1 ? "gs-text-success" : "gs-text-danger";
            return '<li><a class="'+ userClass +'" data-id="'+ item["ID"] +'" href="#">' +
                '['+ item["UserTypeText"].charAt(0) +']'+ item["UserName"] +':'+ item["UserCode"] +'</a></li>';
        };
        for(i = 0; i < len; i++) {
            str += tpl(data[i]);
        }
        list.append(str);
    }

    //绑定日期控件
    $("#Expiration").on("click", function(e) {
        calendar.target(e);
    });

    //密码重置
    $("#resetPWBtn").on("click", function(e) {
        var id = $("#UserID").val();
        if(!id) return false;
        var option = {
            url: "/User/ResetUserPassword",
            type: "get",
            data: {
                UserID: id
            },
            success: function(res) {
                if(!common.chkResponse(res)) return false;
                if(res["Result"]) {
                    alert(res["Result"]);
                } else {
                    openPWBox(res, "2");
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    //密码发送
    (function(box){
        box.beforeOpen = function() {
            var $title = $("#pwSendTitle");
            if(box.sourceObj.html() == "重置") {
                $title.html("密码重置成功");
            } else {
                $title.html("添加成功");
            }
        };
        box.submit = function() {
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            var option = {
                url: "/User/SendUserInfo",
                data: {
                    Mobile: $("#pwMobile").val(),
                    Message: $("#pwMsg").val()
                },
                success: function(res) {
                    box.submitObj.removeClass("gs-disabled-button");
                    if(!common.chkResponse(res)) return false;
                    if(res["Result"].toLowerCase() == "true") {
                        alert("发送成功");
                        box.close();
                    }
                },
                error: function(req) {
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };
            $.ajax(option);
        };

        box.reset = function() {
            $("#pwMobile").val("");
            $("#pwMsg").val("");
            $("#pwSendMsg").html("");
        };
    })(jsBox["pwSend"]);

    function openPWBox(data, type) {
        var tpl = "";
        var msg = "";
        if(type == "1") {
            tpl += "您好，您的云信已开通，账号：<span class='gs-text-success'>"
                + data["UserCode"]
                + "</span>，密码：<span class='gs-text-success'>"
                + data["Password"]
                + "</span>，网址：yes.itissm.com 请及时登陆【云信留客】";
            msg += "您好，您的云信已开通，账号："
                + data["UserCode"]
                + "密码："
                + data["Password"]
                + "，网址：yes.itissm.com 请及时登陆【云信留客】";
        } else if(type == "2") {
            tpl += "您的云信密码已重置，新密码：<span class='gs-text-success'>"
                + data["Password"]
                + "</span>，请及时修改密码【云信留客】";
            msg += "您的云信密码已重置，新密码："
                + data["Password"]
                + "，请及时修改密码【云信留客】";
        }
        jsBox["main"].openSub("pwSend", $("#resetPWBtn"));
        $("#pwSendMsg").html(tpl);
        $("#pwMsg").val(msg);
        $("#pwMobile").val(data["Mobile"]);
    }

    //用户属性
    $("#IsStatus").on("change", function(e) {
        var input = document.querySelector("#PushRepUrl");
        this.value == 1 ? input.disabled = false : input.disabled = true;
    });

    //基础组合通道信息
    var baseSets = [];

    function getPipeInfo(index) {
        var i, len = baseSets.length, item;
        for(i = 0; i < len; i++) {
            item = baseSets[i];
            if(item["ID"] == index) {
                return item;
            }
        }
        return null;
    }

    //价格处理
    function priceProcess(unit, sales) {
        unit = parseFloat(unit);
        sales = parseFloat(sales);
        return {
            unit: unit.toFixed(3),
            sales: sales.toFixed(3),
            realUnit: (unit - sales).toFixed(3),
            referRate: ((1 - (unit - sales) / 0.055) * 100).toFixed(0)
        }
    }

    //通道设置
    $("#baseSets").on("change", function() {
        var index = this.value;
        if(index == "") {
            $(".base-set-info").html("");
        } else {
            $(".base-set-info").each(function() {
                this.innerHTML = getPipeInfo(index)[this.getAttribute("data-for")];
            });
        }
    });

    //删除通道
    $("#selAll").on("click", function(e) {
        var self = this;
        $("[name='pipes']").each(function() {
            this.checked = self.checked;
        })
    });

    $("#delPipes").on("click", function(e) {
        var idArr = [];
        var lines = [];
        $("input[name='pipes']:checked").each(function() {
            idArr.push(this.value);
            lines.push($(this).parents("tr").eq(0));
        });
        if(idArr.length != 0) {
            var option = {
                url: "/User/DeleteUserPipeSet",
                data: {
                    UserPipeSetId: idArr.join(",")
                },
                success: function(res) {
                    if(!common.chkResponse(res)) return false;
                    if(res["Result"].toLowerCase() == "true") {
                        alert("删除成功");
                        var i, len = lines.length;
                        for(i = 0; i < len; i++) {
                            $.clearDomElement(lines[i][0]);
                            lines[i].remove();
                        }
                    } else {
                        alert("删除失败");
                        return false;
                    }
                    $("#selAll")[0].checked = false;
                }
            };
            $.ajax(option);
        }
        common.stopDefault(e);
    });

    $("#pipeList").on("click", function(e) {
        var $target = $(e.target);
        var pipeIds = $("[name='pipes']");
        if($target.attr("data-mod") != undefined) {
            jsBox["main"].openSub("pipeMod", $target);
            common.stopDefault(e);
        } else if($target.attr("data-info") != undefined) {
            jsBox["main"].openSub("pipeDetail", $target);
            common.stopDefault(e);
        } else if($target.attr("name") == "pipes") {
            if (!$target.is(":checked")) {
                $("#selAll")[0].checked = false;
            } else {
                for (var i = 0; i < pipeIds.length; i++) {
                    if (pipeIds.eq(i).is(":checked")) {
                        continue;
                    }
                    return;
                }
                $("#selAll")[0].checked = true;
            }
        }
    });

    //增加/修改通道
    (function(box) {
        var pipeModFormOptions = {
            beforeSubmit: function () {
                if (pipeVerify.chkForm()) {
                    return true;
                } else {
                    box.submitObj.removeClass("gs-disabled-button");
                    return false;
                }
            },
            success: function (res, statusText, xhr, $form) {
                if (!common.chkResponse(res)) return false;
                box.submitObj.removeClass("gs-disabled-button");
                var id, form = $form[0];
                if(res["Result"].toLowerCase() == "false") {
                    alert("操作失败");
                    return false;
                } else {
                    id = res["Result"];
                    alert("操作成功");
                }
                renderPipe(form, box.tmpLine, id || 0);
                box.close();
            },
            error: function () {
                alert("连接超时");
                box.submitObj.removeClass("gs-disabled-button");
            }
        };

        box.beforeOpen = function() {
            var $title = $("#pipeModTitle");
            var info = box.sourceObj.attr("data-mod");
            var data = eval("("+info+")");
            $("#setUserId").val($("#UserID").val());
            if(box.sourceObj.html() == "添加") {
                $title.html("添加通道");
                getBasePipes();
            } else {
                box.tmpLine = box.sourceObj.parents("tr").eq(0);
                $title.html("修改通道");
                loadPipeInfo(data);
                getBasePipes(data["pipeSet"]);
            }
        };

        box.submit = function() {
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            $("#pipeModForm").ajaxSubmit(pipeModFormOptions);
        };

        box.reset = function() {
            box.tmpLine = null;
            $(".base-set-info").html("");
        };

        function getBasePipes(id) {
            var selector = $("#baseSets");
            var option = {
                url: "/User/BindUserPipeSet",
                success: function(res) {
                    if (!common.chkResponse(res)) return false;
                    baseSets = res["UserPipeSetInfoList"];
                    $.selectListLoad({
                        selectObj: selector[0],
                        presentData: baseSets,
                        titleName: "请选择",
                        htmlName: "SetName",
                        valueName: "ID",
                        initialValue: id
                    });
                    selector.change();
                }
            };
            $.ajax(option);
        }

    })(jsBox["pipeMod"]);

    //渲染通道
    function renderPipe(form, line, id) {
        var pipeSet = {
            id: id || form["setId"].value,
            name: form["setName"].value,
            baseSet: getPipeInfo(form["baseSets"].value),
            price: priceProcess(parseFloat(form["unitPrice"].value), parseFloat(form["salesFee"].value))
        };
        var info = "{" +
            "id:"+pipeSet["id"]+"," +
            "name:'"+pipeSet["name"]+"'," +
            "pipeSet:"+pipeSet["baseSet"]["ID"]+"," +
            "unit:"+pipeSet["price"]["unit"]+"," +
            "sales:"+pipeSet["price"]["sales"]+
            "}";
        var tpl = '<tr>' +
                '<td><input type="checkbox" name="pipes" value="'+ pipeSet["id"] +'"></td>' +
                '<td>'+ pipeSet["id"] +'</td><td>'+ pipeSet["baseSet"]["UseTypeText"] +'</td>' +
                '<td data-mod="'+ info +'" class="gs-text-danger gs-cursor-pointer">'+
                pipeSet["name"] +'</td>' +
                '<td>'+ pipeSet["baseSet"]["SetName"] +'</td>' +
                '<td data-info="'+ pipeSet["baseSet"]["ID"] +'" class="gs-text-danger gs-cursor-pointer">'+
                pipeSet["baseSet"]["BasePipeName"] +'</td>' +
                '<td>'+ pipeSet["baseSet"]["UserOpenTime"] +' - '+ pipeSet["baseSet"]["UserCloseTime"] +'</td>' +
                '<td>'+ pipeSet["price"]["unit"] +'</td><td>'+ pipeSet["price"]["sales"] +'</td><td>'+
                pipeSet["price"]["realUnit"] +'</td><td>'+ pipeSet["price"]["referRate"] +'%</td>' +
                '</tr>';
        if(line == null) {
            line = $(tpl);
            $("#pipeList").append(line);
        } else {
            var cells = line.children();
            cells.eq(2).html(pipeSet["baseSet"]["UseTypeText"]);
            cells.eq(3).html(pipeSet["name"]).attr("data-mod", info);
            cells.eq(4).html(pipeSet["baseSet"]["SetName"]);
            cells.eq(5).html(pipeSet["baseSet"]["BasePipeName"]).attr("data-info", pipeSet["baseSet"]["ID"]);
            cells.eq(6).html(pipeSet["baseSet"]["UserOpenTime"] +' - '+ pipeSet["baseSet"]["UserCloseTime"]);
            cells.eq(7).html(pipeSet["price"]["unit"]);
            cells.eq(8).html(pipeSet["price"]["sales"]);
            cells.eq(9).html(pipeSet["price"]["realUnit"]);
            cells.eq(10).html(pipeSet["price"]["referRate"]+"%");
        }
    }

    function renderPipeList(data) {
        var list = $("#pipeList");
        $.clearDomElement(list[0]);
        var tpl = function(pipeSet, index) {
            var info = "{" +
                "id:"+pipeSet["id"]+"," +
                "name:'"+pipeSet["alias"]+"'," +
                "pipeSet:"+pipeSet["pipeSetId"]+"," +
                "unit:"+pipeSet["price"]["unit"]+"," +
                "sales:"+pipeSet["price"]["sales"]+
                "}";
            var notFirstCheckbox = "";
            if(index != 0) notFirstCheckbox = '<input type="checkbox" name="pipes" value="'+ pipeSet["id"] +'">';
            return '<tr>' +
                '<td>'+ notFirstCheckbox +'</td>' +
                '<td>'+ pipeSet["id"] +'</td><td>'+ pipeSet["type"] +'</td>' +
                '<td data-mod="'+ info +'" class="gs-text-danger gs-cursor-pointer">'+
                pipeSet["alias"] +'</td>' +
                '<td>'+ pipeSet["name"] +'</td>' +
                '<td data-info="'+ pipeSet["pipeSetId"] +'" class="gs-text-danger gs-cursor-pointer">'+
                pipeSet["basePipeName"] +'</td>' +
                '<td>'+ pipeSet["openTime"] +' - '+ pipeSet["closeTime"] +'</td>' +
                '<td>'+ pipeSet["price"]["unit"] +'</td><td>'+ pipeSet["price"]["sales"] +'</td><td>'+
                pipeSet["price"]["realUnit"] +'</td><td>'+ pipeSet["price"]["referRate"] +'%</td>' +
                '</tr>';
        };
        var i, len = data.length, htmlStr = "", item, pipeSet;
        for(i = 0; i < len; i++) {
            item = data[i];
            pipeSet = {
                id: item["UserPipeID"],
                pipeSetId: item["PipeSetID"],
                alias: item["Alias"],
                name: item["SetName"],
                basePipeName: item["BasePipeName"],
                type: item["UseTypeText"],
                closeTime: item["UserCloseTime"],
                openTime: item["UserOpenTime"],
                price: priceProcess((item["UnitPrice"] || 0), (item["PRFee"] || 0))
            };
            htmlStr += tpl(pipeSet, i);
        }
        list.append(htmlStr);
    }

    //修改通道加载
    function loadPipeInfo(data) {
        //{id:1,name:'通知应用',pipeSet:'1',unit:0.065,sales:0.005}
        $("#setUserCode").val($("#UserCode").val());
        $("#setName").val(data["name"]);
        $("#setId").val(data["id"]);
        $("#unitPrice").val(data["unit"]);
        $("#salesFee").val(data["sales"]);
    }

    //通道详情
    (function(box){
        box.beforeOpen = function() {
            box.tmpSetId = box.sourceObj.data("info");
            var option = {
                url: "/User/GetPipeBackupList",
                data: {
                    PipeSetId: box.tmpSetId
                },
                success: function(res) {
                    if(!common.chkResponse(res)) return false;
                    if(res["PipeBackList"].length == 0) {
                        $("#pipeInfoMsg").html("无备用设置");
                    } else {
                        renderPipeBackup(res["PipeBackList"]);
                    }
                }
            };
            $.ajax(option);
        };

        box.reset = function() {
            box.tmpSetId = null;
            $("#pipeInfoMsg").html("");
            $.clearDomElement($("#pipeInfoList")[0]);
        };

        $("#pipeInfoList").on("click", function(e) {
            if(e.target.tagName == "A") {
                var option = {
                    url: "/User/TestBackupPipe",
                    data: {
                        PipeSetId: box.tmpSetId,
                        TeleComName: $(e.target).data("tel")
                    },
                    success: function(res) {
                        if(!common.chkResponse(res)) return false;
                        $("#pipeInfoMsg").html(res["Result"]);
                    }
                };
                $.ajax(option);
            }
            common.stopDefault(e);
        });

        function renderPipeBackup(data) {
            var list = $("#pipeInfoList");
            $.clearDomElement(list[0]);
            var pipe = [[],[],[]];
            var tpl = function(item) {
                if(item["PipeName"] != "主通道") {
                    item["TeleComName"] = "";
                } else {
                    item["TeleComName"] = item["TeleComName"] +
                        '（<a data-tel="'+item["TeleComName"]+'" href="#">查看说明</a>）';
                }
                switch (item["IsMorethan"]) {
                    case 1:
                        item["IsMorethan"] = "大于";
                        break;
                    case 0:
                        item["IsMorethan"] = "小于";
                        break;
                    default :
                        item["IsMorethan"] = "不限制";
                        item["MessageSum"] = "";
                        break;
                }
                return '<tr>' +
                    '<td>'+item["TeleComName"]+'</td>' +
                    '<td>'+item["PipeName"]+'</td>' +
                    '<td>'+item["IsMorethan"]+item["MessageSum"]+'</td>' +
                    '<td>'+item["Messagearea"]+'</td>' +
                    '<td>'+item["MesLength"]+'</td>' +
                    '</tr>';
            };
            var i, j, len, len2, item, htmlStr = "";
            for(i = 0, len = data.length; i < len; i++) {
                item = data[i];
                switch (item["TeleComName"]) {
                    case "移动":
                        pipe[0].push(item);
                        break;
                    case "联通":
                        pipe[1].push(item);
                        break;
                    case "电信":
                        pipe[2].push(item);
                        break;
                }
            }
            for(i = 0, len = pipe.length; i < len; i++) {
                for(j = 0, len2 = pipe[i].length; j < len2; j++) {
                    htmlStr += tpl(pipe[i][j]);
                }
            }
            list.append(htmlStr);
        }
    })(jsBox["pipeDetail"]);

    //权限设置
    //加载权限
    $("#UserType").on("change", function() {
        loadMenuByRole(this.value);
    });

    function loadMenuByRole(RoleId) {
        var option = {
            url: "/User/ChangeRoleMenu",
            data: {
                RoleID: RoleId
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                var data = res["UserManagerAjax"]["RoleUserMenu"];
                renderMenu(data["SmsWebMenu"], data["DefaultIds"]);
            }
        };
        $.ajax(option);
    }

    function renderMenu(menuData, defaultData) {
        var list = $("#menuList");
        var i, len, item;
        var tpl = function(item) {
            var isChecked = $.inArray(item["Id"], defaultData) == -1 ? "" : "checked";
            return '<tr><td>' +
                '<label><input name="UserMenuIds" type="checkbox" '+ isChecked +' value="' +
                item["Id"] +'" data-parent="menu-'+ item["Id"] +'">' +
                item["MenuName"] +'</label>' +
                '</td><td data-menu="'+ item["Id"] +'"></td></tr>';
        };
        var subTpl = function(item) {
            var isChecked = $.inArray(item["Id"], defaultData) == -1 ? "" : "checked";
            return '<label>' +
                '<input name="UserMenuIds" type="checkbox" '+ isChecked +' value="'+ item["Id"] +'" data-sel="menu-'+
                item["ParentId"] +'">'+ item["MenuName"] +
                '</label> ';
        };
        $.clearDomElement(list[0]);
        sort(menuData);
        for(i = 0, len = menuData.length; i < len; i++) {
            item = menuData[i];
            if(item["ParentId"] == 0) {
                list.append(tpl(item));
            } else {
                list.find("[data-menu='"+item["ParentId"]+"']").append(subTpl(item));
            }
        }
        $("[data-parent]").each(function() {
            $(this).selLeast($(this).data("parent"), "data");
        });
    }

    function sort(items) {
        var i, len, j, curr, prev;
        for(i = 0, len = items.length; i < len - 1; i++) {
            for(j = 0; j < len - 1 - i; j++) {
                curr = items[j + 1];
                prev = items[j];
                if(curr["ParentId"] < prev["ParentId"]
                    || (curr["ParentId"] == prev["ParentId"] && curr["OrderByVal"] < prev["OrderByVal"])
                    || (curr["ParentId"] == prev["ParentId"] && curr["OrderByVal"] == prev["OrderByVal"] && curr["Id"] < prev["Id"])) {
                    items[j + 1] = prev;
                    items[j] = curr;
                }
            }
        }
    }

    function renderInfo(data) {
        var iptStatusAdd = document.querySelector("#PushRepUrl");
        var isIdentify = document.querySelector("#IsIdentify");
        var restrictIdentifyPhone = document.querySelector("#RestrictIdentifyPhone");
        var industry = document.getElementsByName("Industry");
        if(!data["Industry"]) {
            data["Industry"] = "";
        }
        var industryArr = data["Industry"].split(",");
        var i, len, item;
        $("#UserName").val(data["UserName"]);
        $("#UserID").val(data["id"]);
        $("#UserCode").val(data["UserCode"]);
        $("#UserPayType").val(data["UserPayType"]);
        $("#Mobile").val(data["Mobile"]);
        $("#Email").val(data["Email"]);
        $("#isSuccCharge").val(data["isSuccCharge"]);
        $("#BelongToSales").val(data["userBelongTo"]);
        $("#Valid").val(data["Valid"]);
        $("#BelongToSupport").val(data["BelongToSupport"]);
        $("#Expiration").val(data["ExpiryString"]);
        $("#IsMust").val(data["isMust"]);
        $("#MustNumber").val(data["mustNumber"]);
        $("#IsAuto").val(data["isAuto"]);
        $("#CutBase").val(data["cutBase"]);
        $("#CutPercent").val(data["cutPercent"]);
        $("#OrderLevel").val(data["OrderLevel"]);
        $("#UserExt").val(data["userExt"]);
        $("#UserExtLT").val(data["userExtLT"]);
        $("#UserExtDX").val(data["userExtDX"]);
        $("#IsStatus").val(data["isStatus"]);
        $("#PushMOUrl").val(data["PushMOUrl"]);
        $("#UserType").val(data["UserType"]);
        if(data["isStatus"] == 1) {
            iptStatusAdd.disabled = false;
            iptStatusAdd.value = data["PushRepUrl"];
        } else {
            iptStatusAdd.disabled = true;
            iptStatusAdd.value = "";
        }
        if(data["IsIdentify"] == 1) {
            isIdentify.checked = true;
            restrictIdentifyPhone.disabled = false;
            restrictIdentifyPhone.value = data["RestrictIdentifyPhone"];
        } else {
            isIdentify.checked = false;
            restrictIdentifyPhone.disabled = true;
            restrictIdentifyPhone.value = "";
        }
        for(i = 0, len = industry.length; i < len; i++) {
            item = industry[i];
            item.checked = $.inArray(item.value, industryArr) != -1;
        }
    }

    function renderForm(data) {
        $("#UserCode")[0].readOnly = true;
        $(".edit-btn").show();
        $("#pipeTable").show();
        $("#defaultSet").hide();
        renderInfo(data["UserInfo"]);
        renderMenu(data["RoleUserMenu"]["SmsWebMenu"], data["RoleUserMenu"]["DefaultIds"]);
        renderPipeList(data["UserPipeSetInfoList"]);
    }

    function getUserAllInfoById(id) {
        var option = {
            url: "/User/UserInfoDetails",
            type: "get",
            data: {
                UserID: id
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                renderForm(res["UserManagerAjax"]);
            }
        };
        $.ajax(option);
    }

    //页面重置
    function clearForm(){
        $("#btnSaveAll").html("新增用户");
        clearMainForm();
        clearMenuList();
        resetButtons();
        clearPipeList();
    }

    function clearMainForm() {
        var mainForm = $("#mainForm");
        mainForm[0].reset();
        mainForm.find("input[type='hidden']").val("");
    }

    function clearMenuList() {
        $("#UserType").val(1);
        loadMenuByRole(1);
    }

    function resetButtons() {
        $("#UserCode")[0].readOnly = false;
        $("#PushRepUrl")[0].disabled = true;
        $(".edit-btn").hide();
    }

    function clearPipeList() {
        $("#pipeTable").hide();
        $("#defaultSet").show();
        $.clearDomElement($("#pipeList")[0]);
    }
});