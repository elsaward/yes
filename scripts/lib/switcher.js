define(['jquery'], function($) {
    var Switcher = function(element, options) {
        var $this = this,
            $element = $(element);
        this.options = $.extend({}, Switcher.defaults, options);
        this.element = $element.on("click", this.options.toggle, function(e) {
            e.preventDefault();
            $this.show(this);
        });
        if (this.options.connect) {
            this.connect = $(this.options.connect).find(".gs-active").removeClass("gs-active").end();
            var toggles = this.element.find(this.options.toggle),
                active  = toggles.filter(".gs-active");
            if (active.length) {
                this.show(active);
            } else {
                active = toggles.eq(this.options.active);
                this.show(active.length ? active : toggles.eq(0));
            }
        }
    };
    $.extend(Switcher.prototype, {
        show: function(tab) {
            tab = isNaN(tab) ? $(tab) : this.element.find(this.options.toggle).eq(tab);
            var active = tab;
            this.element.find(this.options.toggle).filter(".gs-active").removeClass("gs-active");
            active.addClass("gs-active");
            if (this.options.connect && this.connect.length) {
                var index = this.element.find(this.options.toggle).index(active);
                this.connect.children().removeClass("gs-active").eq(index).addClass("gs-active");
            }
        }
    });

    Switcher.defaults = {
        toggle : ">*",
        active  : 0
    };

    $("[data-switcher]").each(function() {
        var switcher = $(this);
        var obj = new Switcher(switcher, eval("("+switcher.data("switcher")+")"));
    });
});