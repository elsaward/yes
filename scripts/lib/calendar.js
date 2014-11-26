define(['jquery', 'common'],function($, common) {

    var Today = new Date();
    //今日
    var tY = Today.getFullYear();
    var tM = Today.getMonth();
    var tD = Today.getDate();
    //原选定
    var oY, oM, oD;
    //最大最小年份
    var minYear = tY-10;
    var maxYear = tY+10;
    var selector;   //日期选择
    var control;    //时间控制
    var dateSheet;  //日期表
    var target;     //目标文本框
    var mode; //past过去，later未来，normal正常

    //每月天数数组
    var solarMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    //y年m+1月的天数
    function solarDays(y, m) {
        if (m == 1)
            return(((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
        else
            return(solarMonth[m]);
    }

    function fix(n) {
        if(n < 10) n = "0" + n;
        return n;
    }

    //每日元素类
    function CalElement(sYear, sMonth, sDay) {
        this.isToday = false;       //今日日期标记
        this.isSelectDay = false;   //选定原值标记
        this.sYear = sYear;   //公元年4位数字
        this.sMonth = sMonth;  //公元月数字
        this.sDay = sDay;    //公元日数字
        this.toString = function() {
            //输出日期格式
            return this.sYear + "-" + fix(this.sMonth) + "-" + fix(this.sDay);
        }
    }

    //日历类
    function Calendar(y, m, d) {
        var sDObj,lYear,lMonth;

        //上一个月的年月数值
        if(m == 0){
            lYear = y - 1;
            lMonth = 11;
        }else{
            lYear = y;
            lMonth = m - 1;
        }

        sDObj = new Date(y, m, 1);    //当月一日日期
        this.lMonthDays = solarDays(lYear, lMonth);  //上月天数
        this.length = solarDays(y, m);    //当月天数
        this.firstWeek = sDObj.getDay();  //当月1日星期几

        //循环创建每一天
        for (var i = 0; i < this.length; i++) {
            this[i] = new CalElement(y, m + 1, i + 1);
        }
        //判断是否当日
        if(y == tY && m == tM) {
            this[tD-1].isToday = true;
        }
        //是否选定原值日期
        if(y == oY && m == oM) {
            this[oD-1].isSelectDay = true;
        }
        //是否选定焦点日期
        if(d) {
            this[d-1].isFocusDay = true;
        }
    }

    //绘制日历表
    function drawCld(SY, SM, SD) {
        clear();
        SY = parseInt(SY);
        SM = parseInt(SM);
        SD = parseInt(SD);
        var cld = new Calendar(SY, SM, SD);     //日历对象
        var i,sD;
        var cells = $(".date-cell"), cell;      //日期容器
        $("#dateSelector-year").html(SY);       //渲染选择器年份
        $("#dateSelector-month").html(SM + 1);  //渲染选择器月份
        //循环绘制日期
        for (i = 0; i < 42; i++) {
            cell = cells.eq(i);
            sD = i - cld.firstWeek;             //日期元素位置与当月第一天距离差
            if (sD > -1 && sD < cld.length) {   //当月日期内
                cell.html(sD + 1);
                if(cld[sD].isToday) {           //是否今日
                    cell.addClass("today");
                }
                if(cld[sD].isSelectDay) {       //是否选定原值
                    cell.addClass("selected");
                }
                if(cld[sD].isFocusDay) {        //是否选定焦点
                    cell.addClass("gs-date-focus");
                }
                //判断时间限制
                if(mode != "normal" && SY == tY && SM == tM) {
                    if(mode == "past" && sD > tD - 1) {     //限制在过去
                        cell.addClass("gray");
                        continue;
                    }
                    if(mode == "later" && sD < tD - 1) {    //限制在未来
                        cell.addClass("gray");
                        continue;
                    }
                }
                cell.data("date", cld[sD]);
            } else if(sD <= -1) {  //前月日期
                cell.html(sD + cld.lMonthDays + 1);
                cell.addClass("gray").addClass("prev-month");
            } else if(sD >= cld.length) {   //下月日期
                cell.html(sD - cld.length + 1);
                cell.addClass("gray").addClass("next-month");
            }
        }
    }

    function drawTime(SH, SM, SS) {
        //渲染时间数据
        SH = parseInt(SH);
        SM = parseInt(SM);
        SS = parseInt(SS);
        var timer = $(".gs-date-time");
        timer.eq(0).val(fix(SH));
        timer.eq(1).val(fix(SM));
        timer.eq(2).val(fix(SS));
    }

    /*清除数据*/
    function clear() {
        var cells = $(".date-cell");
        cells.removeClass("gray")
            .removeClass("selected")
            .removeClass("today")
            .removeClass("gs-date-focus")
            .removeClass("prev-month")
            .removeClass("next-month");
    }

    /*初始化日期*/
    function initCalendar() {
        var tpl = '<div id="dateSelector" class="gs-date">' +
            '<div class="gs-date-bar clearfix">' +
            '<div class="gs-date-switcher">' +
            '<span id="dateSelector-year">2014</span>年 ' +
            '<span id="dateSelector-month">7</span>月' +
            '<i class="bottom-arrow"></i></div>' +
            '<div class="gs-date-arrow">' +
            '<i class="double-left-arrow"></i><i class="left-arrow"></i>' +
            '<i class="right-arrow"></i><i class="double-right-arrow"></i>' +
            '</div></div>' +
            '<div class="gs-date-control">' +
            '<input type="text" class="gs-width-1-4"> 年<hr>' +
            '<span>1</span><span>2</span><span>3</span><span>4</span>' +
            '<span>5</span><span>6</span><span>7</span><span>8</span>' +
            '<span>9</span><span>10</span><span>11</span><span>12</span>' +
            '</div>' +
            '<div class="gs-date-table"><table>' +
            '<thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead>' +
            '<tbody></tbody>' +
            '</table></div>' +
            '<div class="gs-date-bar">' +
            '<input type="checkbox" id="dateTimerChk">' +
            '<input type="text" class="gs-date-time"><span>:</span>' +
            '<input type="text" class="gs-date-time"><span>:</span>' +
            '<input type="text" class="gs-date-time"> ' +
            '<a href="#" class="gs-date-clear gs-small-button">清空</a> ' +
            '<a href="#" class="gs-date-today gs-date-submit gs-small-button">确定</a>' +
            '</div>' +
            '<div class="gs-date-bar">' +
            '<a href="#" class="gs-date-clear gs-small-button">清空</a> ' +
            '</div></div>';
        selector = $(tpl);
        selector.hide();
        $("body").append(selector);     //将日历插入页面

        var dateBlock = selector.find("tbody");
        var i, j;
        tpl = "";
        for(i = 0; i < 6; i++) {        //日期元素
            tpl += "<tr>";
            for(j = 0; j < 7; j++) {
                tpl += "<td class='date-cell'></td>";
            }
            tpl += "</tr>";
        }
        dateBlock.append(tpl);
        $(".date-cell").on("click", function(e) {   //日期元素事件
            var date = parseInt($(this).html());
            if($(this).hasClass("prev-month")) {
                dateSelection.prevMonth(date);
                return false;
            }
            if($(this).hasClass("next-month")) {
                dateSelection.nextMonth(date);
                return false;
            }
            if($(this).hasClass("gray")) {
                return false;
            }
            $(".gs-date-focus").removeClass("gs-date-focus");
            $(this).addClass("gs-date-focus");
            common.stopDefault(e);
        });
        $(".left-arrow").on("click", function() {   //上一月
            dateSelection.prevMonth();
        });
        $(".right-arrow").on("click", function() {  //下一月
            dateSelection.nextMonth();
        });
        $(".double-left-arrow").on("click", function() {    //上一年
            dateSelection.prevYear();
        });
        $(".double-right-arrow").on("click", function() {   //下一年
            dateSelection.nextYear();
        });
        $(".gs-date-clear").on("click", function(e) {       //清空文本框选定日期值
            target.value = "";
            hideSelector();
            common.stopDefault(e);
        });
        $(".gs-date-submit").on("click", function(e) {      //确定并填充文本框选定日期值
            var value;
            var timer = $(".gs-date-time");
            var focusDat = $(".gs-date-focus");
            if(focusDat.length == 0) return false;
            value = focusDat.data("date");
            if($("#dateTimerChk")[0].checked) {             //是否勾选时间
                value += " " + timer.eq(0).val() + ":" + timer.eq(1).val() + ":" + timer.eq(2).val();
            }
            target.value = value;
            hideSelector();
            common.stopDefault(e);
        });

        control = $(".gs-date-control");
        dateSheet = $(".gs-date-table");
        var yearTxt = control.find("input");
        var monthBtn = control.find("span");
        $(".gs-date-switcher").on("click", function() {
            yearTxt.val(dateSelection.currYear);
            control.show();
        });
        monthBtn.on("click", function() {
            if(dateSelection.type == 3) {
                target.value = yearTxt.val() + "-" + fix($(this).text());
                hideSelector();
            } else {
                dateSelection.changeView(yearTxt.val(), $(this).text() - 1);
                control.hide();
            }
        });
        selector.on("click", function(e) {
            e = e|| window.event;
            if(dateSelection.type != 3 && e.target.className != "gs-date-switcher"
                && $(e.target).parents(".gs-date-switcher").length == 0
                && $(e.target).parents(".gs-date-control").length == 0) {
                control.hide();
            }
        });
    }

    function showSelector() {
        var t, l, h, docH;
        if(dateSelection.type == 3) {
            changeMonthMode();
        } else {
            changeDateSheetMode();
        }
        h = selector.outerHeight();
        docH = $(document).height();
        t = $(target).offset().top + $(target).outerHeight();
        l = $(target).offset().left;
        if(t + h > docH) {
            t = $(target).offset().top - h;
        }
        selector.css({"top": t, "left": l});
        selector.show();
        $(document).on("click", chkHide);
    }

    function changeMonthMode() {
        control.find("input").val(dateSelection.currYear);
        control.css({"position": "static"});
        control.show();
        dateSheet.hide();
        $(".gs-date-bar").eq(1).hide().end().eq(2).show();
        $(".left-arrow").hide();
        $(".right-arrow").hide();
    }

    function changeDateSheetMode() {
        dateSheet.show();
        $(".gs-date-bar").eq(1).show().end().eq(2).hide();
        $(".left-arrow").show();
        $(".right-arrow").show();
        control.css({"position":"absolute"});
        control.hide();
    }

    function chkHide(e) {
        e = e || window.event;
        if(e.target != target && e.target.id != "dateSelector"
            && $(e.target).parents("#dateSelector").length == 0) {
            hideSelector();
        }
    }

    function hideSelector() {
        control.hide();
        selector.hide();
        $(document).off("click", chkHide);
    }

    initCalendar();

    var dateSelection = {
        currYear: tY,
        currMonth: tM,
        initView : function(type) {
            this.type = type || 1;
            var dateArr, timeArr;
            dateArr = chkDateStr();
            this.currYear = dateArr[0];
            this.currMonth = dateArr[1];
            if(this.type != 3) {
                timeArr = chkTimeStr();
                drawCld(dateArr[0], dateArr[1], dateArr[2]);
                drawTime(timeArr[0][0], timeArr[0][1], timeArr[0][2]);
                type = type || (timeArr[1] ? 2 : 1); //1 无时间 2 有时间
                $("#dateTimerChk")[0].checked = type == 2;
            } else {
                $("#dateSelector-year").html(this.currYear);
                $("#dateSelector-month").html(this.currMonth + 1);
            }
        },
        changeView : function(sy, sm, sd) {
            if(sy != undefined) this.currYear = sy;
            if(sm != undefined) this.currMonth = sm;
            drawCld(this.currYear, this.currMonth, sd);
        },
        prevMonth : function(date) {
            if(mode == "later" && this.currMonth == tM && this.currYear == tY) return false;
            var month = this.currMonth - 1;
            if (month == -1) {
                var year = this.currYear - 1;
                if (year >= minYear) {
                    month = 11;
                    this.currYear = year;
                } else {
                    month = 0;
                }
            }
            this.currMonth = month;
            this.changeView(this.currYear, this.currMonth, date);
        },
        nextMonth : function(date) {
            if(mode == "past" && this.currMonth == tM && this.currYear == tY) return false;
            var month = this.currMonth + 1;
            if (month == 12) {
                var year = this.currYear + 1;
                if (year <= maxYear) {
                    month = 0;
                    this.currYear = year;
                } else {
                    month = 11;
                }
            }
            this.currMonth = month;
            this.changeView(this.currYear, this.currMonth, date);
        },
        prevYear : function() {
            if(this.currYear > minYear) this.currYear--;
            if(mode == "later" && this.currYear == tY && this.currMonth < tM) this.currMonth = tM;
            if(this.type == 3) {
                $("#dateSelector-year").html(this.currYear);
                control.find("input").val(this.currYear);
            } else {
                this.changeView();
            }
        },
        nextYear : function() {
            if(this.currYear < maxYear) this.currYear++;
            if(mode == "past" && this.currYear == tY && this.currMonth > tM) this.currMonth = tM;
            if(this.type == 3) {
                $("#dateSelector-year").html(this.currYear);
                control.find("input").val(this.currYear);
            } else {
                this.changeView();
            }
        },
        target : function(e, type, m) {
            e = e || window.event;
            target = e.target;
            mode = m || "normal";   //past 过去;normal 一般;later 将来
            if(mode == "past") maxYear = tY;
            else if(mode == "later") minYear = tY;
            this.initView(type);
            showSelector();
        }
    };

    function chkDateStr() {
        var part, dateStr, dateArr, cY, cM, cD;
        var nowArr = [tY, tM, tD];
        if(target.value == "") {
            return nowArr;
        }
        part = target.value.split(" ");
        dateStr = part[0];
        dateArr = dateStr.split("-");
        if(dateArr.length < 2) {
            return nowArr;
        }
        cY = dateArr[0];
        cM = dateArr[1] - 1;
        cD = dateArr.length == 3 ? dateArr[2] : 1;
        if(isNaN(cY) || cY < minYear || cY > maxYear) {
            return nowArr;
        }
        if(isNaN(cM) || cM < 0 || cM > 11) {
            return nowArr;
        }
        if(isNaN(cD) || cD < 1 || cD > solarMonth[cM]) {
            return nowArr;
        }
        oY = parseInt(cY);
        oM = parseInt(cM);
        oD = parseInt(cD);
        return [parseInt(cY), parseInt(cM), parseInt(cD)];
    }

    function chkTimeStr() {
        var part, timeStr, timeArr, cH, cM, cS;
        var nowTime = new Date();
        var nowArr = [nowTime.getHours(), nowTime.getMinutes(), nowTime.getSeconds()];
        if(target.value == "") {
            return [nowArr, false];
        }
        part = target.value.split(" ");
        if(part.length != 2) {
            return [nowArr, false];
        }
        timeStr = part[1];
        timeArr = timeStr.split(":");
        if(timeArr.length != 3) {
            return [nowArr, false];
        }
        cH = timeArr[0];
        cM = timeArr[1];
        cS = timeArr[2];
        if(isNaN(cH) || cH < 0 || cH > 23) {
            return [nowArr, false];
        }
        if(isNaN(cM) || cM < 0 || cM > 59) {
            return [nowArr, false];
        }
        if(isNaN(cS) || cS < 0 || cS > 59) {
            return [nowArr, false];
        }
        return [[parseInt(cH), parseInt(cM), parseInt(cS)], true];
    }

    $("[data-calendar]").on("click", function(e) {
        dateSelection.target(e);
    });

    return dateSelection;
});