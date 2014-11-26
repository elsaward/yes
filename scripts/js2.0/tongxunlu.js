require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery'],
        'upload': ['jquery']
    }
});

require(['jquery', 'jswindow', 'common', 'verify', 'form', 'page', 'upload'], function($, jsw, common, Verify, form, Page, upload) {
    var jsBox = jsw.init();
    //自定义字段表单模板
    var fieldTpl = '<div class="gs-form-row">' +
        '字段名：&nbsp;' +
        '<input type="text" class="customName">' +
        '<a class="gs-right" href="#">删除字段</a>' +
        '</div>';

    //联系组删除
    $(".del-group").on("click", function (e) {
        delGroup($(this).attr("data-id"));
        common.stopDefault(e);
    });
    //现有字段删除
    $("#existFieldList").on("click", function (e) {
        var target = e.target;
        if (target.innerHTML == "删除字段") {
            if (confirm("删除字段后，该字段的数据也会被删除，确认要删除字段吗？")) {
                delExistField(target.getAttribute("data-id"), target.parentNode.parentNode);
            }
        }
        common.stopDefault(e);
    });
    //自定义字段添加与删除
    $("#fieldList").on("click", function (e) {
        var target = e.target;
        if (target.innerHTML == "添加字段") {
            $(this).append($(fieldTpl));
        } else if (target.innerHTML == "删除字段") {
            var field = target.parentNode;
            $.clearDomElement(field);
            this.removeChild(field);
        }
        common.stopDefault(e);
    });
    //打开修改联系人窗口
    $("#peopleListContent").on("click", function (e) {
        if (e.target.innerHTML == "修改") {
            jsBox["peopleList"].openSub("createPeople", $(e.target));
            common.stopDefault(e);
        }
    });

    //【联系组新建/修改】窗体设置
    (function (box) {
        $("#createGroupForm").submit(function () {
            box.submit();
            return false;
        });
        var createGroupVerify = new Verify();
        createGroupVerify.init({
            form: "#createGroupForm",
            setting: {
                auto: "blur",
                trim: true
            },
            customChk: function () {
                var i, len, $this, chkStr;
                var nameInput = $(".customName");
                for (i = 0, len = nameInput.length; i < len; i++) {
                    $this = nameInput.eq(i);
                    chkStr = $.trim($this.val());
                    if (chkStr == "") {
                        $this.focus();
                        createGroupVerify.showTips($this, "自定义字段设置必须填写完整！");
                        return false;
                    }
                }
                return true;
            }
        });

        box.beforeOpen = function () {
            var title = $("#createGroupTitle"),
                form = $("#createGroupForm");
            title.html("编辑联系组");
            form.attr("action", "/contact/editgroup");
            loadGroupInfoForEdit(this.sourceObj.data("id"));
        };

        box.submit = function () {
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            var customName = [],
                i, len, item, data, groupFormOption,
                url = $("#createGroupForm").attr("action");
            var customNameObj = this.boxObj.find(".customName");
            if (!createGroupVerify.chkForm()) {
                this.submitObj.removeClass("gs-disabled-button");
                return false;
            }
            for (i = 0, len = customNameObj.length; i < len; i++) {
                item = customNameObj.eq(i).val();
                if (item != "") {
                    customName.push(item);
                }
            }
            data = {
                groupId: this.sourceObj.data("id"),
                groupName: $("#groupName").val(),
                fieldNameArray: customName.join(",")
            };
            groupFormOption = {
                url: url,
                data: data,
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    var resArr = [
                        "操作失败",
                        "操作成功",
                        "联系组名不能为空",
                        "字段名不能为空",
                        "字段标示码不能为空",
                        "参数异常",
                        "字段标示码只允许使用字母、下划线与数字，且以字母开头",
                        "未选择联系组",
                        "字段标示码不能重复",
                        "未提交字段信息"
                    ];
                    alert(resArr[res["Result"]]);
                    box.submitObj.removeClass("gs-disabled-button");
                    if (res["Result"] == 1) location.reload();
                },
                error: function (res) {
                    alert("连接超时");
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };
            $.ajax(groupFormOption);
        };

        box.reset = function () {
            var list = document.querySelector("#fieldList");
            $.clearDomElement(list);
            $.clearDomElement(document.querySelector("#existFieldList"));
            list.innerHTML = '<div class="gs-form-row"><a href="#">添加字段</a></div>';
            createGroupVerify.hideTips();
        };

        //编辑窗口，加载联系组信息
        function loadGroupInfoForEdit(id) {
            var option = {
                url: "/contact/loadgroupinfo",
                data: {
                    id: id
                },
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    var fieldTpl = function (name, code, id) {
                        return '<tr><td>' +
                            name +
                            '</td><td>' +
                            code +
                            '</td><td>' +
                            '<a href="#" data-id="' + id + '">删除字段</a>' +
                            '</td></tr>';
                    };
                    var tpl = "", item;
                    $("[name=groupName]").val(res["GroupName"]);
                    for (var i = 0, len = res["InfoList"].length; i < len; i++) {
                        item = res["InfoList"][i];
                        tpl += fieldTpl(item["FieldName"], item["FieldCode"], item["FieldId"]);
                    }
                    $("#existFieldList").append($(tpl));
                }
            };
            $.ajax(option);
        }
    })(jsBox["createGroup"]);

    //【联系人新建/修改】窗体设置
    (function (box) {
        var createPeopleVerify = new Verify();
        createPeopleVerify.init({
            form: "#createPeopleForm",
            customChk: function () {
                var id = box.sourceObj.attr("data-id");
                var i, len;
                var fieldId = $(".fieldId");
                var fieldIndex = $(".fieldIndex");
                var fieldContent = $(".fieldContent");
                if (id == undefined || id == "") {
                    return false;
                }
                for (i = 0, len = fieldId.length; i < len; i++) {
                    if ($.trim(fieldId.eq(i).val()) == "") {
                        alert("参数异常");
                        return false;
                    }
                    if ($.trim(fieldIndex.eq(i).val()) == "") {
                        alert("参数异常");
                        return false;
                    }
                }
                return true;
            }
        });

        box.beforeOpen = function () {
            var title = $("#createPeopleTitle"),
                form = $("#createPeopleForm"),
                inputStr = "";
            this.tmploadType = 0;
            if (this.sourceObj.html() == "修改") {
                title.html("编辑联系人");
                form.attr("action", "/contact/editcontact");
                inputStr = '<input id="peopleFormChkId" name="peopleId" type="hidden" value="' + this.sourceObj.attr("data-id") + '">';
                this.tmploadType = 1;
            } else {
                form.attr("action", "/contact/addcontact");
                inputStr = '<input id="peopleFormChkId" name="groupId" type="hidden" value="' + this.sourceObj.attr("data-id") + '">';
                title.html("新建联系人");
            }
            form.append(inputStr);
            loadGroupInfoForPeople(this.sourceObj.data("id"), this.tmploadType);
        };

        box.submit = function () {
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            var fieldId = [],
                fieldIndex = [],
                fieldContent = [],
                i, len, item, peopleFormOption, data,
                url = $("#createPeopleForm").attr("action");
            var fieldIdObj = this.boxObj.find(".fieldId");
            var fieldIndexObj = this.boxObj.find(".fieldIndex");
            var fieldContentObj = this.boxObj.find(".fieldContent");
            if (!createPeopleVerify.chkForm()) {
                this.submitObj.removeClass("gs-disabled-button");
                return false;
            }
            for (i = 0, len = fieldIdObj.length; i < len; i++) {
                item = fieldIdObj.eq(i).val();
                if (item != "") {
                    fieldId.push(item);
                }
            }
            for (i = 0, len = fieldIndexObj.length; i < len; i++) {
                item = fieldIndexObj.eq(i).val();
                if (item != "") {
                    fieldIndex.push(item);
                }
            }
            for (i = 0, len = fieldContentObj.length; i < len; i++) {
                item = fieldContentObj.eq(i).val();
                fieldContent.push(item);
            }
            if (fieldId.length != fieldContent.length || fieldId.length != fieldIndex.length || fieldIndex.length != fieldContent.length) {
                alert("参数异常");
                this.submitObj.removeClass("gs-disabled-button");
                return false;
            }
            data = {
                id: this.sourceObj.data("id"),
                fieldIdArray: fieldId.join(","),
                fieldIndexArray: fieldIndex.join(","),
                fieldContentArray: fieldContent.join(",")
            };
            if (box.tmploadType == 1) {
                $.extend(data, { groupId: jsBox["peopleList"].sourceObj.data("id") });
            }
            peopleFormOption = {
                url: url,
                data: data,
                success: function (res) {
                    if (!common.chkResponse(res)) return false;
                    var resArr = [
                        "操作失败", "操作成功", "未选择联系组", "字段编号加载失败", "字段内容不能为空", "参数异常", "字段下标加载失败"
                    ];
                    alert(resArr[res["Result"]]);
                    box.submitObj.removeClass("gs-disabled-button");
                    if (res["Result"] == 1 && box.tmploadType == 0) {
                        location.reload();
                    } else if (box.tmploadType == 1) {
                        loadPeopleList(jsBox["peopleList"].sourceObj.data("id"));
                    }
                    box.close();
                },
                error: function (res) {
                    alert("连接超时");
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };

            $.ajax(peopleFormOption);
        };
        box.reset = function () {
            delete this.tmploadType;
            $.clearDomElement(document.querySelector("#createPeopleForm"));
            createPeopleVerify.hideTips();
        };

        //联系人窗口，加载联系组信息
        function loadGroupInfoForPeople(id, loadType) {
            var data = {
                id: id
            };
            var option = {
                success: renderPeopleInfo
            };
            if (loadType == 0) {
                option["url"] = "/contact/loadgroupinfo";
            } else if (loadType == 1) {
                option["url"] = "/contact/loadcontactinfo";
            }
            option["data"] = data;
            $.ajax(option);
        }

        //联系人窗口，加载联系人信息
        function renderPeopleInfo(res) {
            if (!common.chkResponse(res)) return false;
            var head = jsBox["peopleList"].tmpHeadInfo || res["InfoList"];
            var fieldTpl = function (name, id, fieldIndex, value) {
                return '<div class="gs-form-row">' +
                    '<label>' + name + '</label>' +
                    '<div class="gs-form-control">' +
                    '<input type="hidden" class="fieldId" value="' + id + '">' +
                    '<input type="hidden" class="fieldIndex" value="' + fieldIndex + '">' +
                    '<input type="text" class="fieldContent" value="' + value + '">' +
                    '</div>' +
                    '</div>';
            };
            var tpl = "", item, fieldIndex, fieldValue;
            for (var i = 0, len = head.length; i < len; i++) {
                item = head[i];
                fieldIndex = item["FieldIndex"];
                fieldValue = res["Result"] ? (res["Result"]["Field"+item["FieldIndex"]] || "") : "";
                tpl += fieldTpl(item["FieldName"], item["FieldId"], fieldIndex, fieldValue);
            }
            $("#createPeopleForm").append($(tpl));
        }
    })(jsBox["createPeople"]);

    var pageBarPeopleList = new Page("peopleListPage", "peopleListContent", buildPreviewTable);

    //【联系人列表】窗体设置
    (function (box) {
        //联系人列表ajax分页对象
        box.submit = function () {
            var delPeopleFormOption = {
                beforeSubmit: function () {
                    var id = $("input[name='contactIdStr']:checked").val();
                    if (id) {
                        return true;
                    } else {
                        box.submitObj.removeClass("gs-disabled-button");
                        return false;
                    }
                },
                success: function (res, statusText, xhr, $form) {
                    if (!common.chkResponse(res)) return false;
                    var resArr = ["操作失败", "操作成功", "参数错误"];
                    alert(resArr[res["Result"]]);
                    pageBarPeopleList.reloadThisPage();
                    box.submitObj.removeClass("gs-disabled-button");
                },
                error: function (res) {
                    alert("连接超时");
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            $("#delPeopleForm").ajaxSubmit(delPeopleFormOption);
        };

        box.beforeOpen = function () {
            $("#peopleDialog").width($(document).width() * 0.9);
            loadPeopleList(this.sourceObj.data("id"));
        };

        box.reset = function () {
            $.clearDomElement(document.querySelector("#peopleListHead"));
            pageBarPeopleList.clear();
            if (this.tmpHeadInfo) delete this.tmpHeadInfo;
        };
    })(jsBox["peopleList"]);

    //导入窗体
    (function (box) {
        var $name = $("#importName");
        var $id = $("#importGroupId");

        $("#uploadGroupBtn").on("click", function () {
            if ($(this).hasClass("gs-disabled-button")) {
                return false;
            }
            if ($("#uploadFile").val() == "") {
                importGroupVerify.showTips($("#uploadFile"), "请上传文件");
                return false;
            }
            $(this).addClass("gs-disabled-button");
            var $this = $(this);
            $.ajaxFileUpload({
                type: "POST",
                url: "/contact/uploadcontactgroupfile",
                secureuri: false,
                fileElementId: "uploadFile",
                dataType: "utf-8",
                success: function (res, status) {
                    var stringArray = res.split("|");
                    if (stringArray[0] == "-1") {
                        alert(stringArray[2]);
                        top.location.href = "/";
                        return false;
                    }
                    if (stringArray[0] == "1") {
                        //stringArray[0]    成功状态(1为成功，0为失败)
                        //stringArray[1]    上传成功的文件名
                        //stringArray[2]    消息提示
                        $("#hidFileName").val(stringArray[1]);
                        $("#uploadInfo").html(stringArray[2]);
                    } else {
                        alert("数据有误：" + stringArray[2]);
                    }
                    $this.removeClass("gs-disabled-button");
                },
                error: function (req, status, e) {
                    common.showModal("上传失败", 1);
                    $this.removeClass("gs-disabled-button");
                }
            });
        });

        $("#importGroupForm").submit(function () {
            box.submit();
            return false;
        });
        var importGroupVerify = new Verify();
        importGroupVerify.init({
            form: "#importGroupForm",
            setting: {
                auto: false,
                trim: true
            },
            customChk: function () {
                if ($("#hidFileName").val() == "") {
                    importGroupVerify.showTips($("#uploadFile"), "请上传文件");
                    return false;
                }
                return true;
            }
        });

        box.beforeOpen = function () {
            var groupId = box.sourceObj.data("id");

            if (groupId == undefined) {

            } else {
                $name.val(box.sourceObj.data("name"));
                $name[0].readOnly = true;
                $id.val(groupId);
            }
        };

        box.submit = function () {
            this.autoClose = false;
            this.submitObj.addClass("gs-disabled-button");
            if (!importGroupVerify.chkForm()) {
                this.submitObj.removeClass("gs-disabled-button");
                return false;
            }
            var option = {
                url: "/contact/addcontactgroup",
                data: {
                    groupName: $("#importName").val(),
                    filePath: $("#hidFileName").val(),
                    groupId: $("#importGroupId").val()
                },
                success: function (res, statusText) {
                    if (!common.chkResponse(res)) return false;
                    var resArr = [
                        "导入失败",
                        "导入成功",
                        "文件内没有数据",
                        "字段名和标识码不能为空",
                        "字段标示码不能重复",
                        "字段标示码只允许使用字母、下划线与数字，且以字母开头",
                        "创建联系组失败",
                        "请上传文件",
                        "请输入联系组名",
                        "文件必须包含手机号(Mobile)字段",
                        "上传文件与现有联系组结构不相同"
                    ];
                    alert(resArr[res["Result"]]);
                    box.submitObj.removeClass("gs-disabled-button");
                    if (res["Result"] == 1) location.reload();
                },
                error: function (res) {
                    alert("连接超时");
                    box.submitObj.removeClass("gs-disabled-button");
                }
            };
            $.ajax(option);
        };

        box.reset = function () {
            $id.val("");
            $name.val("");
            $name[0].readOnly = false;
            importGroupVerify.hideTips();
            $("#uploadInfo").html("");
        };
    })(jsBox["importGroup"]);

    //加载联系人名单
    function loadPeopleList(id) {
        var options = {
            url: "/contact/loadcontactinfolist",
            data: {
                groupId: id
            },
            infoListName: "ContactList",
            amountName: "Amount",
            pageName: "pn"
        };
        pageBarPeopleList.load(options);
    }

    function buildPreviewTable(data, contain) {
        var head = data["FieldList"],
            list = data["InfoList"];
        jsBox["peopleList"].tmpHeadInfo = head;
        var peopleListHead = document.querySelector("#peopleListHead"),
            col, cell, item, i, j, len;
        $.clearDomElement(peopleListHead);
        col = document.createElement("tr");
        cell = document.createElement("th");
        cell.innerHTML = '<input type="checkbox" id="peopleAll" value="">';
        col.appendChild(cell);
        for (i = 0, len = head.length; i < len; i++) {
            cell = document.createElement("th");
            //cell.width = 100;
            cell.innerHTML = head[i]["FieldName"];
            col.appendChild(cell);
        }
        cell = document.createElement("th");
        //cell.width = 40;
        cell.innerHTML = '操作';
        col.appendChild(cell);
        peopleListHead.appendChild(col);
        //$(peopleListHead).parents().eq(1).width(len * 100);
        $(peopleListHead).parents().eq(1).css({"white-space":"nowrap"});

        for (i = 0, len = list.length; i < len; i++) {
            item = list[i];
            col = document.createElement("tr");
            cell = document.createElement("td");
            cell.innerHTML = '<input type="checkbox" name="contactIdStr" value="' + item["Id"] + '">';
            col.appendChild(cell);
            for (j = 0; j < head.length; j++) {
                cell = document.createElement("td");
                cell.innerHTML = item["Field"+head[j]["FieldIndex"]] || "";
                col.appendChild(cell);
            }
            cell = document.createElement("td");
            cell.innerHTML = '<a href="#" data-id="' + item["Id"] + '">修改</a>';
            col.appendChild(cell);
            contain.appendChild(col);
        }
        $("#peopleAll").selAll("contactIdStr");
    }

    //删除现有字段
    function delExistField(id, obj) {
        var option = {
            url: "/contact/deletefield",
            data: {
                fieldId: id
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                var resArr = ["操作失败", "操作成功", "参数错误", "不允许删除手机号字段", "字段信息错误"];
                alert(resArr[res["Result"]]);
                if (res["Result"] == 1) {
                    $.clearDomElement(obj);
                    obj.parentNode.removeChild(obj);
                }
            }
        };
        $.ajax(option);
    }

    function delGroup(id) {
        var option = {
            url: "/contact/deletegroup",
            data: {
                groupId: id
            },
            success: function (res) {
                if (!common.chkResponse(res)) return false;
                var resArr = ["操作失败", "操作成功", "参数错误"];
                alert(resArr[res["Result"]]);
                if (res["Result"] == 1) {
                    location.reload();
                }
            }
        };
        if (confirm("确认删除该联系组？")) {
            $.ajax(option);
        }
    }
});