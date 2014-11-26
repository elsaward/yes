define(['jquery'], function ($) {
    //键盘模板
    var tpl = '<div id="keyboard" class="clearfix">' +
        '<a href="#" class="key">1</a>' +
        '<a href="#" class="key">2</a>' +
        '<a href="#" class="key">3</a>' +
        '<a href="#" class="key">4</a>' +
        '<a href="#" class="key">5</a>' +
        '<a href="#" class="key">6</a>' +
        '<a href="#" class="key">7</a>' +
        '<a href="#" class="key">8</a>' +
        '<a href="#" class="key">9</a>' +
        '<a href="#" class="key key-big">0</a>' +
        '</div>';
    $("body").append($(tpl).hide());

    var key = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];   //键数组

    var keyboard = $("#keyboard");

    var numBox = keyboard.find(".key");         //键元素

    function openKeyboard(t, l) {
        keyboard.css({ top: t, left: l });
        keyboard.show();
        $(document).on("click", closeKeyboard);
    }

    function closeKeyboard(e) {
        e = e || window.event;
        if (e.target.className != "keyboard-target") {
            keyboard.hide();
            $(document).off("click", closeKeyboard);
        }
    }

    return {
        key: key,
        numBox: numBox,
        open: openKeyboard
    };
});