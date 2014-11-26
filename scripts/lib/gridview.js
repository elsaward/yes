/**
 * topMenu: 顶部工具栏 数组（可选）
 * titleUrl: 读取表头 数组（可选）
 * titles: 表头字段 数组（可选）
 * params: 查询条件 数组（可选）
 * exportURL: 导出URL（可选）
 * searchURL: 查询URL（可选）
 * deleteURL: 删除URL（可选）
 * gridList: 表格内容区域ID，预定义（可选）
 * page: 页码栏ID，预定义（可选）
 * drawPageContent: 自定义渲染内容区域回调方法（可选）
 * pageOption: 分页参数，详见分页模块（必须）
 */

define(['jquery', 'page', 'common', 'jswindow', 'userSelector', 'timeSelector'],
    function($, Page, common, jsw, userSelector, timeSelector) {
    var jsBox = jsw.init();
    var _titleCodes = [];   //表头字段名
    var _id = "";           //序号列的字段名
    var _pageBar;
    var count = 0;          //列表数量
    var defaultOption= {    //初始默认值
        pageOption: {       //详见page.js
            infoListName: "InfoList",
            amountName: "Amount",
            pageName: "pn"
        },
        topMenu: [],        //顶端菜单
        titles: [],         //表头数组
        gridList: "defaultList" + count,    //列表容器
        page: "defaultPage" + count         //页码容器
    };

    function loadPage(option) {
        var titles = [], titleNames = [], titleCodes = [], i, len;
        if(option["titleUrl"]) {        //读取表头
            $.ajax({
                url: option["titleUrl"],
                async: false,
                success: function(res) {
                    if(!common.chkResponse(res)) return false;
                    titles = res["InfoList"];   //保存表头
                }
            });
        } else if (option["titles"]) {  //手动设置表头
            titles = option["titles"];  //保存表头
        }
        for(i = 0, len = titles.length; i < len; i++) {     //分析表头
            if(titles[i]["FieldName"] == "" && _id == "") {
                _id = titles[i]["FieldCode"];   //默认第一列为序号列
                continue;
            }
            titleCodes.push(titles[i]["FieldCode"]);    //加入字段名数组
            titleNames.push(titles[i]["FieldName"]);    //加入表头显示名数组
        }
        option["titles"] = titleCodes;
        option["titleNames"] = titleNames;
        drawGird(option);
    }

    function drawGird(option) {
        _titleCodes = option["titles"];     //保存表头字段名
        count++;        //列表数量增加

        option = $.extend(true, {}, defaultOption, option);     //拼合设置

        //容器
        var $grid = $("#main");
        var $topMenu, $searchForm, $gridTitle, $gridList, $gridTable, $bottomBar;

        var pageCallback = option["drawPageContent"] || drawPageContent;        //分页渲染方法

        //表头设置
        if(option["titleNames"] && option["titleNames"] instanceof Array) {
            $gridTitle = drawTitle(option["titleNames"]);
        }

        //顶部功能键设置
        if(option["topMenu"] && option["topMenu"] instanceof Array) {
            $topMenu = drawTopMenu(option["topMenu"]);
        }

        //搜索栏设置
        if(option["params"] && option["params"] instanceof Array && option["params"].length > 0) {
            $searchForm = drawSearchForm(option["params"]);
        }

        //底部功能键设置
        $bottomBar = drawBottomBar(option);

        //将各功能区域插入容器
        if($topMenu) {
            $grid.append($topMenu);
        }
        if($searchForm) {
            $grid.append($searchForm);
        }
        $gridTable = $("<table></table>");
        $gridList = $("<tbody></tbody>").attr("id", option["gridList"]);
        if($gridTitle) {
            $gridTable.append($gridTitle);
        }
        $gridTable.append($gridList);
        $grid.append($("<div class='gs-data-list'></div>").append($gridTable));
        if($bottomBar) {
            $grid.append($bottomBar);
        }

        return drawList(option["page"], option["gridList"], pageCallback, option["pageOption"]);
    }

    //绘制
        //表头
    function drawTitle(data) {
        var i, len, tpl = "";
        var $title = $("<thead></thead>");
        tpl += "<th><input type='checkbox' id='selAll' name='selAll'></th>";
        for(i = 0,len = data.length; i < len; i++) {
            tpl += "<th>" + data[i] + "</th>";
        }
        $title.append("<tr>" + tpl + "</tr>");
        return $title;
    }

        //顶部功能键
    function drawTopMenu(menuArr) {
        var $menubar = $("<div class='gs-tool-bar'></div>");
        var i, len, tpl = "";
        if(menuArr instanceof Array) {
            for(i = 0, len = menuArr.length; i < len; i++) {
                tpl += "<a href='" + menuArr[i]["href"] + "' class='gs-button'>" + menuArr[i]["text"] + "</a> ";
            }
        }
        $menubar.append("<div class='gs-tool-item'>" + tpl + "</div>");
        return $menubar
    }

        //搜索栏
    function drawSearchForm(params) {
        var $formbar = $("<form class='gs-tool-bar'></form>");
        var i, j, len, len2, item, tpl = "", options, module, getValue, value, text;
        if(params instanceof Array) {
            for(i = 0, len = params.length; i < len; i++) {
                item = params[i];
                options = item["value"];
                module = item["module"];
                if(module && typeof module == "string") {       //特殊模块
                    switch (module) {
                        case "userCode":        //用户选择模块
                            getValue = [common.getUrlParameter("userCode"), common.getUrlParameter("hidUserId")];
                            $formbar.append(userSelector(item["url"], getValue));
                            break;
                        case "times":           //起始时间模块
                            getValue = [common.getUrlParameter("StartT"), common.getUrlParameter("EndT")];
                            $formbar.append(timeSelector(getValue));
                            break;
                        case "month":           //月份选择固定模块
                            getValue = common.getUrlParameter("month");
                            $formbar.append(timeSelector(getValue, 3));
                            break;
                    }
                } else {    //一般搜索条件，分为下拉框与文本框两种
                    getValue = common.getUrlParameter(item["name"]);    //获取每个参数的值
                    tpl += "<div class='gs-tool-item'>" + item["showName"];
                    if(options && options instanceof Array) {           //下拉框
                        tpl += " <select name='" + item["name"] + "'>";
                        for(j = 0, len2 = options.length; j < len2; j++) {
                            value = options[j]["val"] || options[j];
                            text = options[j]["text"] || options[j];
                            tpl += "<option value='" + value + "'";
                            if(value == getValue) {
                                tpl += " selected='selected'";
                            }
                            tpl += ">" + text + "</option>";
                        }
                        tpl += "</select>";
                    } else {                                            //文本框
                        tpl += " <input type='text' name='" + item["name"] + "' value='" + getValue + "'>";
                    }
                    tpl += "</div>";
                }
            }
            tpl += "<div class='gs-tool-item'><input type='submit' value='查询'></div>"
        }
        $formbar.append(tpl);
        return $formbar
    }

        //分页列表
    function drawList(page, list, callback, options) {
        _pageBar = new Page(page, list, callback);
        _pageBar.load(options);
        return _pageBar;
    }

        //底部功能键
    function drawBottomBar(option) {
        var $bottomBar = $("<div class='gs-tool-bar'></div>"),
            $gridPage, $export, $exportBtn, $delete, $deleteBtn;
        if(option["page"]) {        //页码
            $gridPage = $("<div class='gs-page gs-right'></div>").attr("id", option["page"]);
        }
        if(option["exportURL"]) {   //导出功能键
            $exportBtn = $("<a href='#' class='gs-button'>导出</a>");
            $exportBtn.on("click", function(e) {
                var form = $("form");
                if(form.length == 0) {
                    form = $("<form></form>");
                    $("body").append(form);
                }
                form.attr("action", option["exportURL"]);
                form.attr("method", "post");
                form.attr("target", "_blank");
                form.submit();
                form.attr("action", "");
                form.attr("method", "get");
                form.removeAttr("target");
                common.stopDefault(e);
            });
            $export = $("<div class='gs-tool-item'></div>").append($exportBtn);
        }
        if(option["deleteURL"]) {   //删除功能键
            $deleteBtn = $("<a href='#' class='gs-button'>删除</a>");
            $deleteBtn.on("click", function(e) {
                var idArr = [];
                $("input[name='sel']:checked").each(function() {
                    idArr.push(this.value);
                });
                if(idArr.length) {
                    $.ajax({
                        url: option["deleteURL"],
                        data: {
                            sel: idArr.join(",")
                        },
                        success: function(res) {
                            if (!common.chkResponse(res)) return false;
                            $("#selAll")[0].checked = false;
                            _pageBar.reloadThisPage();
                        }
                    });
                }
                common.stopDefault(e);
            });
            $delete = $("<div class='gs-tool-item'></div>").append($deleteBtn);
        }
        if($export) {
            $bottomBar.append($export);
        }
        if($delete) {
            $bottomBar.append($delete);
        }
        if($gridPage) {
            $bottomBar.append($gridPage);
        }
        return $bottomBar;
    }

        //页码
    function drawPageContent(data, contain) {
        if(typeof data != "object") {
            data = $.parseJSON(data);
        }
        var i, j, len1, len2, item, tpl = "", id;
        for(i = 0, len1 = data.length; i < len1; i++) {
            item = data[i];
            id = item["id"] || item["Id"] || item[_id];
            tpl += "<tr>";
            tpl += "<td><input type='checkbox' name='sel' value='" + id + "'></td>";
            for(j = 0, len2 = _titleCodes.length; j < len2; j++) {
                tpl += "<td>" + item[_titleCodes[j]] + "</td>";
            }
            tpl += "</tr>";
        }
        $(contain).append(tpl);
        $("#selAll").selAll("sel");
    }

    return loadPage;
});