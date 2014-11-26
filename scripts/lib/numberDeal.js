define(['jquery', 'common'], function ($, common) {
    //号码处理
    var arr, newArr;

    var btnShowAll = document.getElementById("btnShowAll"),             //显示全部按钮
        progressPer = document.getElementById("progressPer"),           //进度
        progressWarning = document.getElementById("progressWarning"),   //操作提示
        delResult = document.getElementById("delResult"),               //操作结果
        numberList = document.getElementById("txtDesNo"),               //号码框
        numberTotal = document.getElementById("desCount");              //号码总数
    var i = 0, j = 0, k = 0, t, originalLength, newLength, v, pv, isInProcess = false;
    var reg = /^1(3[0123456789]|4[57]|5[012356789]|8[127856039])\d{8}$/;    //验证手机号

    //向号码列表框中粘贴
    numberList.onpaste = function (e) {
        var clipboardData = window.clipboardData || e.clipboardData;        //从剪贴板获取数据
        var str = numberList.value + clipboardData.getData("Text");
        str = str.replace(/(\r\n|\r|\n){1,}/g, "\n").replace(/^\n+/, "").replace(/\n+$/, "");   //处理开头结尾和多个回车
        var tmp = str.split('\n');  //临时数组
        var length = tmp.length;
        if (length > 500000) {      //限制最大号码数
            alert("号码数量请小于50万");
            numberList.value = "";
        } else if (length <= 500000 && length > 1000) {     //大于1000时转为锁定号码框模式
            numberList.readOnly = true;
            numberTotal.innerHTML = length;
            btnShowAll.disabled = false;
            arr = tmp.concat();             //号码数组存入变量
            numberList.value = tmp.slice(0, 999).join('\n') + "......";
        } else {                                            //小于1000时直接存入号码框
            numberTotal.innerHTML = length;
            numberList.value = str;
            btnShowAll.disabled = true;
        }
        tmp.length = 0;     //清空临时数组
        tmp = null;
        return false;
    };
    numberList.onpropertychange = countNumber;
    numberList.oninput = countNumber;


    $("#btnClr").on("click", clearNumberList);                  //清空按钮
    $(btnShowAll).on("click", showAllList);                     //显示全部按钮

    //号码处理按钮
    $("#btnChongFu").on("click", startDelRepeat);
    $("#btnCuoHao").on("click", startDelWrong);
    $(".del-sec").on("click", function (e) {
        startDelSection($(this).attr("data-id"));
        common.stopDefault(e);
    });

    //清空号码
    function clearNumberList() {
        numberList.value = "";
        numberTotal.innerHTML = 0;
        numberList.readOnly = false;
        btnShowAll.disabled = true;
        if (arr instanceof Array) {
            arr.length = 0;
        }
        arr = null;
        return false;
    }

    //去重
    function startDelRepeat(e) {
        if (!isInProcess) {         //判断前一个操作是否结束
            newArr = [];
            progressWarning.innerHTML = "";
            delResult.innerHTML = "计算中...";
            isInProcess = true;     //锁定操作状态
            if (arr == null || !(arr instanceof Array)) {
                arr = numberList.value.replace(/\r\n/g, "\n").split('\n');
            }
            arr.sort();
            originalLength = arr.length;
            delRepeat();
        } else {
            progressWarning.innerHTML = "另一个操作正在进行中";
        }
        common.stopDefault(e);
    }
    function delRepeat() {
        clearTimeout(t);
        if (j < originalLength) {
            k = i++ * 1000 + 1000;
            k = k > originalLength ? originalLength : k;
            for (; j < k; j++) {
                v = arr[j];
                if (j != 0) {
                    pv = arr[j - 1];
                }
                if (v != "" && v != "undfined") {
                    if (v != pv) {
                        newArr.push(v);
                    }
                }
            }
            progressPer.innerHTML = Math.floor((j) / originalLength * 100) + "%";
            t = setTimeout(delRepeat, 5);
        } else {
            newLength = newArr.length;
            if (newLength > 1000) {
                arr.length = 0;
                arr = newArr;
                numberList.value = newArr.slice(0, 999).join('\n') + "......";
            } else {
                arr.length = 0;
                arr = null;
                numberList.value = newArr.join('\n');
                numberList.readOnly = false;
                btnShowAll.disabled = true;
            }

            delResult.innerHTML = "去除" + (originalLength - newLength) + "行";
            numberTotal.innerHTML = newLength;
            i = 0;
            j = 0;
            k = 0;
            t = null;
            originalLength = null;
            newLength = null;
            v = null;
            pv = null;
            newArr = null;
            isInProcess = false;        //解锁
        }
    }

    //去错
    function startDelWrong(e) {
        if (!isInProcess) {
            newArr = [];
            progressWarning.innerHTML = "";
            delResult.innerHTML = "计算中...";
            isInProcess = true;
            if (arr == null || !(arr instanceof Array)) {
                arr = numberList.value.replace(/\r\n/g, "\n").split('\n');
            }
            originalLength = arr.length;
            delWrong();
        } else {
            progressWarning.innerHTML = "另一个操作正在进行中";
        }
        common.stopDefault(e);
    }
    function delWrong() {
        clearTimeout(t);
        if (j < originalLength) {
            k = i++ * 1000 + 1000;
            k = k > originalLength ? originalLength : k;
            for (; j < k; j++) {
                v = arr[j];
                if (!isNaN(v) && v.length == 11) {
                    if (reg.test(v)) {
                        newArr.push(v);
                    }
                }
            }
            progressPer.innerHTML = Math.floor((j) / originalLength * 100) + "%";
            t = setTimeout(delWrong, 5);
        } else {
            newLength = newArr.length;
            if (newLength > 1000) {
                arr.length = 0;
                arr = newArr;
                numberList.value = newArr.slice(0, 999).join('\n') + "......";
            } else {
                arr.length = 0;
                arr = null;
                numberList.value = newArr.join('\n');
                numberList.readOnly = false;
                btnShowAll.disabled = true;
            }

            delResult.innerHTML = "去除" + (originalLength - newLength) + "行";
            numberTotal.innerHTML = newLength;
            i = 0;
            j = 0;
            k = 0;
            t = null;
            originalLength = null;
            newLength = null;
            v = null;
            pv = null;
            newArr = null;
            isInProcess = false;
        }
    }

    //去除号段
    function startDelSection(sec) {
        if (!isInProcess) {
            newArr = [];
            progressWarning.innerHTML = "";
            delResult.innerHTML = "计算中...";
            isInProcess = true;
            if (arr == null || !(arr instanceof Array)) {
                arr = numberList.value.replace(/\r\n/g, "\n").split('\n');
            }
            originalLength = arr.length;
            delSection(sec);
        } else {
            progressWarning.innerHTML = "另一个操作正在进行中";
        }
    }
    function delSection(sec) {
        clearTimeout(t);

        //三个运营商的号段
        var secReg = [
            /^(134|135|136|137|138|139|147|150|151|152|157|158|159|182|183|184|187|188)\d{8}$/,
            /^(133|153|170|177|180|181|189)\d{8}$/,
            /^(130|131|132|145|155|156|176|185|186)\d{8}$/
        ];
        if (j < originalLength) {
            k = i++ * 1000 + 1000;
            k = k > originalLength ? originalLength : k;
            for (; j < k; j++) {
                v = arr[j];
                if (!isNaN(v) && v.length == 11) {
                    if (!secReg[sec].test(v)) {
                        newArr.push(v);
                    }
                }
            }
            progressPer.innerHTML = Math.floor((j) / originalLength * 100) + "%";
            t = setTimeout(function () {
                delSection(sec);
            }, 5);
        } else {
            newLength = newArr.length;
            if (newLength > 1000) {
                arr.length = 0;
                arr = newArr;
                numberList.value = newArr.slice(0, 999).join('\n') + "......";
            } else {
                arr.length = 0;
                arr = null;
                numberList.value = newArr.join('\n');
                numberList.readOnly = false;
                btnShowAll.disabled = true;
            }

            delResult.innerHTML = "去除" + (originalLength - newLength) + "行";
            numberTotal.innerHTML = newLength;
            i = 0;
            j = 0;
            k = 0;
            t = null;
            originalLength = null;
            newLength = null;
            v = null;
            pv = null;
            newArr = null;
            isInProcess = false;
        }
    }

    //计算号码数
    function countNumber() {
        if (arr instanceof Array) {
            numberTotal.innerHTML = arr.length;
        } else {                                    //处理头尾及多行回车
            var str = numberList.value.replace(/(\r\n|\r|\n){1,}/g, "\n").replace(/^\n+/, "").replace(/\n+$/, "");
            if (str == "") {
                numberTotal.innerHTML = 0;
            } else {
                var tmpArr = str.split("\n");
                numberTotal.innerHTML = tmpArr.length;
            }
        }
    }

    //显示完整列表
    function showAllList() {
        if (arr instanceof Array) {
            numberList.value = arr.join("\n");
            numberList.readOnly = false;
        }
        return false;
    }

    return {
        send: showAllList
    }
});