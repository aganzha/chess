var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "chess/interfaces", "chess/utils"], function(require, exports, __interfaces__, __utils__) {
    var interfaces = __interfaces__;

    var utils = __utils__;

    var BaseCell = (function () {
        function BaseCell(record, application) {
            this.record = record;
            this.application = application;
            this.args = [];
            this.tag = 'div';
            this.html = '';
            this.children = [];
            this.delayedChildren = [];
            this.delayed = false;
            this.init();
        }
        BaseCell.prototype.init = function () {
        };
        BaseCell.prototype.forceDelayed = function (filler) {
            for(var i = 0, l = this.delayedChildren.length; i < l; i++) {
                var delayedCell = this.delayedChildren[i];
                var klass = this.application.getCellClass(delayedCell.record);
                if(klass == null) {
                    klass = BaseCell;
                }
                var clone = new klass(delayedCell.record, this.application);
                clone.html = delayedCell.html;
                clone.args = delayedCell.args;
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
            var el = document.createElement(this.tag);
            el.innerHTML = this.html;
            return el;
        };
        BaseCell.prototype.prepareEl = function () {
            if(!this.el) {
                this.el = this.createEl();
                this.fillElAttrs();
            }
        };
        BaseCell.prototype.updateEl = function (html) {
            this.html = html;
            $(this.el).html(html);
        };
        BaseCell.prototype.afterResolve = function () {
        };
        BaseCell.prototype.afterAppend = function () {
        };
        BaseCell.prototype.afterRender = function () {
        };
        BaseCell.prototype.bubbleDown = function (callable) {
            callable(this);
            for(var i = 0, l = this.children.length; i < l; i++) {
                this.children[i].bubbleDown(callable);
            }
        };
        BaseCell.prototype.append = function (cell) {
            this.prepareEl();
            cell.parent = this;
            this.children.push(cell);
            var ne = cell.render();
            this.appendDomMethod(ne);
            cell.afterAppend();
        };
        BaseCell.prototype.appendDomMethod = function (el) {
            this.el.appendChild(el);
        };
        BaseCell.prototype.appendDelayed = function (cell) {
            this.delayedChildren.push(cell);
        };
        BaseCell.prototype.render = function () {
            this.prepareEl();
            return this.el;
        };
        BaseCell.prototype.destroy = function () {
            $(this.el).remove();
            this.el = null;
            this.children = [];
        };
        BaseCell.prototype.domFromString = function (s) {
            return utils.Utils.DomFromString(s);
        };
        BaseCell.prototype.searchDown = function (collected, cons, className, id) {
            for(var i = 0, l = this.children.length; i < l; i++) {
                var cell = this.children[i];
                var rec = cell.record;
                var pushed = false;
                if(!pushed && cons && rec.cons == cons) {
                    collected.push(cell);
                    pushed = true;
                }
                if(!pushed && className) {
                    for(var j = 0, m = rec.classes.length; j < m; j++) {
                        if(rec.classes[j] == className) {
                            pushed = true;
                            collected.push(cell);
                            break;
                        }
                    }
                }
                if(!pushed && id && rec.id == id) {
                    collected.push(cell);
                    pushed = true;
                }
                cell.searchDown(collected, cons, className, id);
            }
        };
        BaseCell.prototype.searchPieces = function (cons, className, id) {
            var answer = [];
            this.searchDown(answer, cons, className, id);
            return answer;
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
        BaseScreen.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.resolved = false;
        };
        return BaseScreen;
    })(BaseCell);
    exports.BaseScreen = BaseScreen;    
    var ViewPort = (function (_super) {
        __extends(ViewPort, _super);
        function ViewPort(el) {
            this.el = el;
                _super.call(this, {
        cons: '',
        id: '',
        classes: []
    }, null);
        }
        ViewPort.prototype.createEl = function () {
            return this.el;
        };
        return ViewPort;
    })(BaseCell);
    exports.ViewPort = ViewPort;    
    var Image = (function (_super) {
        __extends(Image, _super);
        function Image() {
            _super.apply(this, arguments);

        }
        Image.prototype.draw = function (src) {
            this.args[0] = src;
            if(this.el.tagName.toLowerCase() == 'canvas') {
                var i = document.createElement('img');
                this.drawImage(this.el, i);
            } else {
                (this.el).src = src;
            }
        };
        Image.prototype.drawImage = function (canvas, img) {
            canvas.width = this.args[1];
            canvas.height = this.args[2];
            $(img).on('load', function () {
                var context = canvas.getContext('2d');
                var getcha = false;
                var height = canvas.height, width = canvas.width;
                var ratio = img.width / img.height;
                var destWidth = canvas.width;
                var destHeight = canvas.height;
                if(height < img.height && width < img.width) {
                    while(!getcha) {
                        height += 1;
                        width += 1;
                        if(true) {
                            if(height == img.height) {
                                getcha = true;
                                width = height * ratio;
                                destWidth = destHeight * ratio;
                            }
                            if(width == img.width) {
                                getcha = true;
                                height = width / ratio;
                                destHeight = destWidth / ratio;
                            }
                        }
                    }
                    context.drawImage(img, 0, 0, width, height, 0, 0, destWidth, destHeight);
                } else {
                    context.drawImage(img, 0, 0, width, height);
                }
            });
            img.src = this.args[0];
        };
        Image.prototype.createEl = function () {
            var answer = null;
            var img = document.createElement('img');
            if(this.html.length > 0) {
                img.src = this.html;
                answer = img;
            } else {
                if(this.args.length > 0) {
                    if(this.args[1] && this.args[2]) {
                        var canvas = document.createElement('canvas');
                        this.drawImage(canvas, img);
                        answer = canvas;
                    } else {
                        img.src = this.args[0];
                        answer = img;
                    }
                }
            }
            return answer;
        };
        return Image;
    })(BaseCell);
    exports.Image = Image;    
    var Uploader = (function (_super) {
        __extends(Uploader, _super);
        function Uploader() {
            _super.apply(this, arguments);

        }
        Uploader.prototype.loadFile = function (file) {
            this.fileName = file.name;
            this.fileSize = file.size;
            this.fileType = file.type;
            var me = this;
            var reader = new FileReader();
            reader.onload = function (ev) {
                me.file = ev.target.result;
                me.loadDone();
            };
            reader.readAsDataURL(file);
        };
        Uploader.prototype.afterRender = function () {
            var me = this;
            var stop = function (e) {
                e.stopPropagation();
                e.preventDefault();
            };
            $(this.getFileInput()).on('change', function (e) {
                stop(e);
                var files = e.target.files;
                me.loadFile(files[0]);
            });
            $(this.getDropArea()).on('drop', function (e) {
                stop(e);
                var dt = e.dataTransfer;
                var files = dt.files;
                me.loadFile(files[0]);
            }).on('dragover', stop).on('dragenter', stop);
        };
        Uploader.prototype.getFileInput = function () {
            return this.el;
        };
        Uploader.prototype.getDropArea = function () {
            return this.el;
        };
        Uploader.prototype.loadDone = function () {
        };
        return Uploader;
    })(BaseCell);
    exports.Uploader = Uploader;    
})
