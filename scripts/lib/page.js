define(['jquery', 'common'], function($, common) {
    var Page = function(element, contain, callback) {
        this.bar = document.getElementById(element);
        this.contain = document.getElementById(contain);
        this.options = {
            infoListName: "InfoList",       //默认数据列表属性名
            amountName: "Amount",           //默认总页数属性名
            pageName: "pn"                  //默认页码属性名
        };
        this.index = 1;                     //初始值第一页
        this.callback = callback;
    };
    $.extend(Page.prototype, {
        draw    :   function(index, count) {        //绘制页码栏
            var $this = this;
            var $bar = $($this.bar);
            $this.clear();
            if(index > count) {
                index = count;
            }
            $this.index = index;
            var i,minPage,maxPage,midPage = index,pageNum;
            if(count > 5){
                if(index < 3) {
                    midPage = 3
                }else if(index > count - 2) {
                    midPage = count - 2;
                }
                minPage = midPage - 2;
                maxPage = midPage + 2;
            }else if(count > 0){
                minPage = 1;
                maxPage = count;
            }
            for(i = minPage; i <= maxPage; i++ ) {
                if(index == i) {
                    pageNum = $("<span></span>").addClass("gs-page-current");
                }else{
                    pageNum = $("<a></a>").addClass("gs-page-num");
                }
                pageNum.html(i);
                pageNum.click(function(){
                    $this.goto(parseInt($(this).html()));
                });
                $bar.append(pageNum);
            }
            if(index!=1 && index!=0) {
                var prevNum = $("<a></a>").addClass("gs-page-nav").html("&lt;");
                prevNum.click(function(){
                    $this.goto(index - 1);
                });
                $bar.prepend(prevNum);
                var firstNum = $("<a></a>").addClass("gs-page-nav").html("&lt;&lt;");
                firstNum.click(function(){
                    $this.goto(1);
                });
                $bar.prepend(firstNum);
            }
            if(index!=count && count!=0) {
                var nextNum = $("<a></a>").addClass("gs-page-nav").html("&gt;");
                nextNum.click(function(){
                    $this.goto(index + 1);
                });
                $bar.append(nextNum);
                var lastNum = $("<a></a>").addClass("gs-page-nav").html("&gt;&gt;");
                lastNum.click(function(){
                    $this.goto(count);
                });
                $bar.append(lastNum);
            }
            $bar.append("共"+count+"页");
        },
        load  :   function(options) {
            var $this = this;
            $.extend($this.options, options);
            this.goto(1);
        },
        goto    :   function(index) {
            var $this = this;
            var pageOption = {};
            pageOption[$this.options["pageName"]] = index || 1;
            var option = {
                url     :   $this.options["url"],
                data    :   $.extend($this.options["data"], pageOption),    //搜索属性+分页属性
                success :   function(res) {
                    if(!common.chkResponse(res)) return false;
                    if(typeof(res) == "string")res=$.parseJSON(res);
                    if(!isNaN(res[$this.options["amountName"]])) {
                        $this.draw(index, res[$this.options["amountName"]]);
                    }
                    if(res[$this.options["infoListName"]] != null || res[$this.options["infoListName"]] != undefined) {
                        $this.callback(res[$this.options["infoListName"]], $this.contain);
                    }
                }
            };
            $.ajax(option);
        },
        reloadThisPage  :   function() {        //刷新当前页
            this.goto(this.index);
        },
        clear   :   function() {                //清空数据
            $("*",this.bar).each(function() {
                $.event.remove(this);
                $.removeData(this);
            });
            $(this.bar).html("");
            $("*",this.contain).each(function() {
                $.event.remove(this);
                $.removeData(this);
            });
            $(this.contain).html("");
        }
    });

    return Page;
});