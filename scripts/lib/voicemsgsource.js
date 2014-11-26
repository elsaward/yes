define(['jquery', 'common'], function ($, common) {

    var source = {
        csListSel: $("#csListSel"),
        _phoneSel: [],  //客服号码数据
        _fileSel: []    //语音文件数据
    };

    var flag1 = false, flag2 = false, flag3 = false;

    common.showModal('<img src="/content/images/load.gif" width="22" height="22"> 页面加载中...', 1);

    //客服电话下拉列表
    $.ajax({
        cache: false,
        type: "get",
        data: {
            type: 0
        },
        url: "/ajax/ajax_getphonelist.ashx",
        success: function (data) {
            source._phoneSel = $.parseJSON(data);
            var list3 = $("#singleCSSource");
            $.selectListLoad({
                selectObj: source.csListSel[0],
                presentData: source._phoneSel,
                htmlName: function (item) {
                    return item["Tel"] + " [" + item["Contact"] + "]";
                },
                valueName: "Id"
            });
            $.selectListLoad({
                selectObj: list3[0],
                presentData: source._phoneSel,
                htmlName: function (item) {
                    return item["Tel"] + " [" + item["Contact"] + "]";
                },
                valueName: "Id"
            });
            flag1 = true;
            if(flag1 && flag2 && flag3) {
                common.closeModal();
            }
        }
    });

    //主叫电话下拉列表
    $.ajax({
        cache: false,
        type: "get",
        data: {
            type: 1
        },
        url: "/ajax/ajax_getphonelist.ashx",
        success: function (data) {
            var list1 = $("#selMainPhoneNum");
            var selData = $.parseJSON(data);
            $.selectListLoad({
                selectObj: list1[0],
                presentData: selData,
                htmlName: function (item) {
                    var contact = "";
                    if (item["Tel"] == "") {
                        contact = item["Contact"];
                    } else {
                        contact = " [" + item["Contact"] + "]";
                    }
                    return item["Tel"] + contact;
                },
                valueName: "Id"
            });
            flag2 = true;
            if(flag1 && flag2 && flag3) {
                common.closeModal();
            }
        }
    });

    //语音文件下拉列表
    $.ajax({
        cache: false,
        type: "get",
        url: "/ajax/ajax_getvoicefilelist.ashx",
        success: function (data) {
            source._fileSel = $.parseJSON(data);
            var selFile = $("#selFile");
            $.selectListLoad({
                selectObj: selFile[0],
                presentData: source._fileSel,
                htmlName: "FileName",
                valueName: "Id",
                titleName: "请选择语音文件"
            });
            flag3 = true;
            if(flag1 && flag2 && flag3) {
                common.closeModal();
            }
        }
    });

    return source;
});