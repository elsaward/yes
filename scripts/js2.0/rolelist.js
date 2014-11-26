require.config({
    baseUrl: '/scripts/lib'
});

require(['jquery', 'common', 'verify'], function($, common, Verify) {

    var hidId = document.querySelector("#roleId");
    var oldId = document.querySelector("#oldRoldId");
    var iptName = document.querySelector("#roleName");
    var i, len, item;
    var roleList = $("#roleList"), li;

    var verify = new Verify();
    verify.init({
        form: "#roleForm"
    });

    for(i = 0, len = data.length; i < len; i++) {
        item = data[i];
        li = $("<li></li>").html(item["name"] + "[" + item["id"] + "]");
        item["element"] = li;
        (function(){
            var t = item;
            li.on("click", function(e){
                e = e || window.event;
                roleControl.curr = t;
                hidId.value = t["id"];
                oldId.value = t["id"];
                iptName.value = t["name"];
                renderMenu(t["menu"]);
                renderDefault(t["defaultMenu"]);
                $("#roleOption").show();
                common.stopDefault(e);
            });
        })();
        roleList.append(li);
    }

    function renderMenu(arr) {
        var menuList = $("[name='menuId']");
        if(arr instanceof Array) {
            menuList.each(function() {
                this.checked = false;
                var id = parseInt(this.value);
                var index = $.inArray(id, arr);
                if(index != -1) {
                    this.checked = true;
                    $(this).parent().addClass("checked");
                } else {
                    this.checked = false;
                    $(this).parent().removeClass("checked");
                }
            })
        }
    }

    function renderDefault(arr) {
        var defaultMenu = $("[name='defaultMenu']");
        if(arr instanceof Array) {
            defaultMenu.each(function() {
                this.checked = false;
                var id = parseInt(this.value);
                var index = $.inArray(id, arr);
                if(index != -1) {
                    this.checked = true;
                    $(this).parent().addClass("checked");
                } else {
                    this.checked = false;
                    $(this).parent().removeClass("checked");
                }
            })
        }
    }

    var roleControl = {
        curr: null,
        add: function(item) {
            li = $("<li></li>").html(item["name"] + "[" + item["id"] + "]");
            item["element"] = li;
            roleList.append(li);
            data.push(item);
            return item;
        },
        mod: function(item) {
            if(!this.curr) return false;
            $.extend(this.curr, item);
            this.curr.element.html(this.curr["name"] + "[" + this.curr["id"] + "]");
            this.curr = null;
        },
        del: function() {
            if(!this.curr) return false;
            var i, len;
            for(i = 0, len = data.length; i < len; i++) {
                if(data[i] === this.curr) {
                    data[i].element.remove();
                    data.splice(i, 1);
                    break;
                }
            }
            this.curr = null;
        },
        clear: function() {
            this.curr = null;
        }
    };

    $("#addRole").on("click", function(e) {
        if(!verify.chkForm()) return false;
        var menuId = [];
        var defaultMenu = [];
        $("[name='menuId']:checked").each(function() {
            menuId.push(parseInt(this.value));
        });
        $("[name='defaultMenu']:checked").each(function() {
            defaultMenu.push(parseInt(this.value));
        });
        var option = {
            url: "/system/addrole",
            data: {
                roleId: hidId.value,
                roleName: iptName.value,
                menuIdsStr: menuId.join(","),
                defaultMenu: defaultMenu.join(",")
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                if(res["Result"]["Success"]) {
                    var newItem = roleControl.add({
                        id: hidId.value,
                        name: iptName.value,
                        menu: menuId,
                        defaultMenu: defaultMenu
                    });
                    newItem.element.on("click", function(e){
                        e = e || window.event;
                        roleControl.curr = newItem;
                        hidId.value = newItem["id"];
                        oldId.value = newItem["id"];
                        iptName.value = newItem["name"];
                        renderMenu(newItem["menu"]);
                        renderDefault(newItem["defaultMenu"]);
                        $("#roleOption").show();
                        common.stopDefault(e);
                    });
                    clearForm();
                } else {
                    alert("新增失败");
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    $("#modRole").on("click", function(e) {
        if(!verify.chkForm()) return false;
        var menuId = [];
        var defaultMenu = [];
        $("[name='menuId']:checked").each(function() {
            menuId.push(parseInt(this.value));
        });
        $("[name='defaultMenu']:checked").each(function() {
            defaultMenu.push(parseInt(this.value));
        });
        var option = {
            url: "/system/updaterole",
            data: {
                roleId: hidId.value,
                oldRoleId: oldId.value,
                roleName: iptName.value,
                menuIdsStr: menuId.join(","),
                defaultMenu: defaultMenu.join(",")
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                if(res["Result"]["Success"]) {
                    roleControl.mod({
                        id: hidId.value,
                        name: iptName.value,
                        menu: menuId,
                        defaultMenu: defaultMenu
                    });
                    clearForm();
                    alert("修改成功");
                } else {
                    alert("修改失败");
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    $("#delRole").on("click", function(e) {
        var option = {
            url: "/system/deleterole",
            data: {
                roleId: oldId.value
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                if(res["Result"]) {
                    roleControl.del();
                    clearForm();
                } else {
                    alert("删除失败");
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    $("#clearForm").on("click", function(e) {
        clearForm();
        common.stopDefault(e);
    });

    $("[data-parent]").each(function() {
        $(this).selLeast($(this).data("parent"), "data");
    });

    function clearForm() {
        roleControl.clear();
        $("#roleForm")[0].reset();
        oldId.value = "";
        $("#roleOption").hide();
        $(".check-box").removeClass("checked");
    }
});