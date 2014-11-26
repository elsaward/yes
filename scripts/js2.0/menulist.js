require.config({
    baseUrl: '/scripts/lib',
    shim: {
        'form': ['jquery']
    }
});

require(['jquery', 'common', 'menuTree', 'verify'], function($, common, menu, Verify) {

    var hidId = document.querySelector("#menuId");
    var iptMenuName = document.querySelector("#menuName");
    var iptUrl = document.querySelector("#url");
    var iptParent = document.querySelector("#parent");
    var iptOrder = document.querySelector("#order");
    var items = menu.build("menuTree", data, buildSelector);
    var i, len, item;

    var verify = new Verify();
    verify.init({
        form: "#menuForm"
    });

    for(i = 0, len = items.length; i < len; i++) {
        item = items[i];
        (function(){
            var t = item;
            item.element.onclick = function(e) {
                e = e || window.event;
                menu.curr = t;
                hidId.value = t["id"];
                iptMenuName.value = t["name"];
                iptUrl.value = t["url"];
                iptParent.value = t["parent"];
                iptOrder.value = t["order"];
                $("#menuOption").show();
                e.stopPropagation();
            };
        })();
    }

    $("#addMenu").on("click", function(e) {
        if(!verify.chkForm()) return false;
        var option = {
            url: "/System/SaveMenu",
            data: {
                menuId: 0,
                menuName: iptMenuName.value,
                menuUrl: iptUrl.value,
                parentId: iptParent.value,
                orderVal: iptOrder.value
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                if(res["Result"]["Success"]) {
                    var newItem = menu.add({
                        id: res["Result"]["Id"],
                        name: iptMenuName.value,
                        url: iptUrl.value,
                        parent: iptParent.value,
                        order: iptOrder.value
                    });
                    newItem.element.onclick = function(e) {
                        e = e || window.event;
                        menu.curr = newItem;
                        hidId.value = newItem["id"];
                        iptMenuName.value = newItem["name"];
                        iptUrl.value = newItem["url"];
                        iptParent.value = newItem["parent"];
                        iptOrder.value = newItem["order"];
                        $("#menuOption").show();
                        e.stopPropagation();
                    };
                    clearForm();
                } else {
                    alert("新增失败");
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    $("#modMenu").on("click", function(e) {
        if(!verify.chkForm()) return false;
        var option = {
            url: "/System/SaveMenu",
            data: {
                menuId: hidId.value,
                menuName: iptMenuName.value,
                menuUrl: iptUrl.value,
                parentId: iptParent.value,
                orderVal: iptOrder.value
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                if(res["Result"]["Success"]) {
                    menu.mod({
                        name: iptMenuName.value,
                        url: iptUrl.value,
                        parent: iptParent.value,
                        order: iptOrder.value
                    });
                    clearForm();
                } else {
                    alert("修改失败");
                }
            }
        };
        $.ajax(option);
        common.stopDefault(e);
    });

    $("#delMenu").on("click", function(e) {
        if(!menu.chkSub() && iptParent != 0) return false;
        var option = {
            url: "/System/DeleteMenu",
            data: {
                menuId: hidId.value
            },
            success: function(res) {
                if (!common.chkResponse(res)) return false;
                if(res["Result"]) {
                    menu.del();
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

    function clearForm() {
        menu.clear();
        $("#menuForm")[0].reset();
        hidId.value = "";
        $("#menuOption").hide();
    }

    function buildSelector(items) {
        var i, len, option;
        $.clearDomElement(iptParent);
        option = document.createElement("option");
        option.innerHTML = "无";
        option.setAttribute("value", "0");
        iptParent.appendChild(option);
        for(i = 0, len = items.length; i < len; i++) {
            if(items[i].parent != 0) break;
            option = document.createElement("option");
            option.innerHTML = items[i]["name"];
            option.setAttribute("value", items[i]["id"]);
            iptParent.appendChild(option);
        }
    }

});