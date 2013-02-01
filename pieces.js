var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
define(["require", "exports", "chess/interfaces", "chess/utils"], function(require, exports, __interfaces__, __utils__) {
    var interfaces = __interfaces__;

    var utils = __utils__;

    var BaseCell = (function () {
        function BaseCell(record, application) {
            this.record = record;
            this.application = application;
            this.children = [];
            this.delayedChildren = [];
            this.delayed = false;
        }
        BaseCell.prototype.forceDelayed = function (filler) {
            for(var i = 0, l = this.delayedChildren.length; i < l; i++) {
                var delayedCell = this.delayedChildren[i];
                var klass = this.application.getCellClass(delayedCell.record);
                var clone = new klass(delayedCell.record, this.application);
                clone.delayedChildren = delayedCell.delayedChildren;
                this.append(clone);
                filler(clone);
                clone.forceDelayed(filler);
            }
        };
        BaseCell.prototype.getBox = function () {
            return $(this.el).offset();
        };
        BaseCell.prototype.fillElAttrs = function () {
            var el = this.el;
            $(el).removeAttr('class');
            $(el).removeAttr('style');
            var classes = this.record.classes;
            for(var i = 0, l = classes.length; i < l; i++) {
                if(i != 0) {
                    el.className += " ";
                }
                el.className += classes[i];
            }
            if(this.record.id) {
                el.id = this.record.id;
            }
            this.fillExtraAttrs();
        };
        BaseCell.prototype.fillExtraAttrs = function () {
        };
        BaseCell.prototype.createEl = function () {
            var div = document.createElement('div');
            return div;
        };
        BaseCell.prototype.prepareEl = function () {
            if(!this.el) {
                this.el = this.createEl();
                this.fillElAttrs();
            }
        };
        BaseCell.prototype.beforeRender = function () {
        };
        BaseCell.prototype.afterRender = function () {
        };
        BaseCell.prototype.append = function (cell) {
            if(!this.delayed) {
                this.prepareEl();
                cell.beforeRender();
                cell.parent = this;
                this.children.push(cell);
                var ne = cell.render();
                this.el.appendChild(ne);
                cell.afterRender();
            } else {
                this.appendDelayed(cell);
            }
        };
        BaseCell.prototype.appendDelayed = function (cell) {
            this.delayedChildren.push(cell);
            cell.delayed = true;
        };
        BaseCell.prototype.render = function () {
            $(this.el).remove();
            this.el = null;
            this.prepareEl();
            return this.el;
        };
        BaseCell.prototype.destroy = function () {
            $(this.el).remove();
            this.children = [];
        };
        BaseCell.prototype.domFromString = function (s) {
            return utils.Utils.DomFromString(s);
        };
        return BaseCell;
    })();
    exports.BaseCell = BaseCell;    
    var BaseScreen = (function (_super) {
        __extends(BaseScreen, _super);
        function BaseScreen() {
            _super.apply(this, arguments);

        }
        BaseScreen.prototype.beforeSelfReplace = function (other, callBacks) {
            callBacks.success();
        };
        BaseScreen.prototype.beforeSelfApear = function (other, callBacks) {
            callBacks.success();
        };
        BaseScreen.prototype.afterSelfReplace = function (other) {
        };
        BaseScreen.prototype.afterSelfApear = function (other) {
        };
        BaseScreen.prototype.replaceBy = function (other) {
        };
        return BaseScreen;
    })(BaseCell);
    exports.BaseScreen = BaseScreen;    
    var ViewPort = (function (_super) {
        __extends(ViewPort, _super);
        function ViewPort() {
            _super.apply(this, arguments);

        }
        ViewPort.prototype.createEl = function () {
            return document.getElementsByTagName('body')[0];
        };
        return ViewPort;
    })(BaseCell);
    exports.ViewPort = ViewPort;    
})

