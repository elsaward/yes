define(['jquery'], function ($) {
    //菜单类
    function Item(data) {
        this.id = data["id"];           //id
        this.name = data["name"];       //菜单名
        this.url = data["url"];         //对应url
        this.parent = data["parent"];   //父级菜单
        this.order = data["order"];     //排序
        this.element = document.createElement("li");        //页面元素
        this.subElement = document.createElement("ul");     //子集元素
        this.init();
    }

    Item.prototype = {
        init: function() {
            this.element.innerHTML = this.name;
            this.element.setAttribute("data-id", this.id);
            this.element.appendChild(this.subElement);
            this.subElement.className = "gs-tree-sub-show menu-" + this.id;
        }
    };

    var menuData;       //数据
    var container;      //容器

    var items = [];     //菜单数组

    var menuControl = {
        curr: null,     //当前操作对象
        subFlag: {},    //子集存在标记
        add: function(data) {   //增加菜单
            var newItem = new Item(data);
            items.push(newItem);
            drawMenu(this.callback);    //重绘
            return newItem;
        },
        del: function() {       //删除菜单
            if(!this.curr) return false;    //当前操作对象不存在则停止执行
            var i, len, parentNode;
            for(i = 0, len = items.length; i < len; i++) {
                if(items[i] === this.curr) {
                    parentNode = document.querySelector(".menu-"+items[i].parent) || container;
                    if(parentNode) {
                        parentNode.removeChild(items[i].element);   //从页面删除当前项元素
                    }
                    items.splice(i, 1);     //从菜单数组中删除当前项
                    break;
                }
            }
            this.curr = null;           //清空当前操作对象
            drawMenu(this.callback);    //重绘
        },
        mod: function(data) {   //修改菜单
            if(!this.curr) return false;
            $.extend(this.curr, data);      //将修改数据拼入当前对象
            this.curr = null;               //清空当前操作对象
            drawMenu(this.callback);        //重绘
        },
        build: function(id, data, callback) {
            this.callback = callback;
            if(data instanceof Array) {
                menuData = data;
            }
            container = document.querySelector("#"+id);
            createItems();
            drawMenu(this.callback);
            return items;
        },
        clear: function() {
            this.curr = null;
        },
        chkSub: function() {        //检查子集存在标记
            if(this.subFlag["menu-" + this.curr.id]) {
                alert("还有子菜单！");
                return false;
            }
            return true;
        }
    };

    function sort() {               //按父级id、order、id，重新排序菜单数组
        var i, len, j, curr, prev;
        for(i = 0, len = items.length; i < len - 1; i++) {
            for(j = 0; j < len - 1 - i; j++) {
                curr = items[j + 1];
                prev = items[j];
                if(curr["parent"] < prev["parent"]
                    || (curr["parent"] == prev["parent"] && curr["order"] < prev["order"])
                    || (curr["parent"] == prev["parent"] && curr["order"] == prev["order"] && curr["id"] < prev["id"])) {
                    items[j + 1] = prev;
                    items[j] = curr;
                }
            }
        }
    }

    function createItems() {        //封装菜单对象
        var i, len;
        for(i = 0, len = menuData.length; i < len; i++) {
            items.push(new Item(menuData[i]));
        }
    }

    function drawMenu(callback) {   //绘制菜单列表
        sort();
        var i, len, parentNode, item;
        for(i = 0, len = items.length; i < len; i++) {
            item = items[i];
            item.element.childNodes[0].textContent = item.name + "[" + item.id + "]";
            menuControl.subFlag["menu-" + item.id] = false;
            if(item.parent == 0) {      //顶级菜单
                container.appendChild(item.element);
            } else {                    //有父级菜单
                parentNode = document.querySelector(".menu-"+item.parent);
                if(parentNode) {
                    menuControl.subFlag["menu-" + item.parent] = true;      //给父级菜单登记子集存在标记
                    parentNode.appendChild(item.element);
                }
            }
        }
        if(typeof callback == "function") {
            callback(items);
        }
    }

    return menuControl;
});