require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'common', 'gridview'], function($, common, gridview) {
    var gridOption = {
        contain: $("#main"),
        topMenu: [
            {
                text: "返回",
                href: "javascript:history.back(-1);"
            }
        ],
        titleUrl: "/voicemsg/calloutrecordsfieldajax",
        pageOption: {
            url: "/voicemsg/CallOutRecordsAjax",
            data: {
                userCode: common.getUrlParameter("userCode"),
                seqNo: common.getUrlParameter("seqNo")
            }
        }
    };
    gridview(gridOption);
});