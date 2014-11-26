require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'common'], function($, common) {
    //弹窗绑定
    $(".gs-mail-text>a").click(function () {
        common.showModal($(this).html(), 1);
    });
});