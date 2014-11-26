require.config({
    baseUrl: '/scripts/lib'
});

require(['jquery', 'common', 'verify', 'voicemsgcmd'],
    function($, common, Verify, voicemsg) {

    var verify = new Verify();
    verify.init({
        form: "#form1",
        setting: {
            auto: false,
            trim: true
        }
    });

    $(".mod-setting").on("click", function(e) {
        $("#configName").val($(this).data("name"));
        $("#configId").val($(this).data("id"));
        voicemsg.renderSettings($(this).data("id"));
        common.stopDefault(e)
    });

    $("#btnSave").on("click",function () {
        var baseVerify = verify.chkForm();
        if (!baseVerify) {
            return false;
        }
        if(!voicemsg.check()) {
            return false;
        }
    });
});