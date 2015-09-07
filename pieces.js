var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./utils"], function (require, exports, utils) {
    var TestEl = (function () {
        function TestEl() {
            this.className = 'testElClass';
            this.childNodes = [];
        }
        TestEl.prototype.appendChild = function (el) {
        };
        TestEl.prototype.createDocumentFragment = function () {
            return new TestEl();
        };
        return TestEl;
    })();
    exports.TestEl = TestEl;
    var registered_elements = [];
    var BaseCell = (function () {
        function BaseCell(record, application) {
            this.record = record;
            this.application = application;
            this.tag = 'div';
            this.html = '';
            this.exceptTags = ['input'];
            this.children = [];
            this.delayedChildren = [];
            this.delayed = false;
            this.args = [];
            this.guid = utils.guid();
            this._handlers = [];
            this.init();
        }
        BaseCell.prototype.map = function (callable) {
            for (var i = 0; i < this.children.length; i++) {
                callable(this.children[i], i);
            }
        };
        BaseCell.prototype.init = function () {
        };
        BaseCell.prototype.log = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            console.log(arguments);
        };
        BaseCell.prototype.forceDelayed = function (filler, selector) {
            // по умолчанию форсится все подряд. За исключением вложенных delayed ячеек
            // (см каменты в app.ts->resolveCells
            var bubbleRender = false;
            if (!selector) {
                selector = function (cell) { return true; };
                bubbleRender = true;
            }
            for (var i = 0, l = this.delayedChildren.length; i < l; i++) {
                var delayedCell = this.delayedChildren[i];
                if (!selector(delayedCell)) {
                    continue;
                }
                var klass = this.application.getCellClass(delayedCell.record);
                if (klass == null) {
                    klass = BaseCell;
                }
                var clone = new klass(JSON.parse(JSON.stringify(delayedCell.record)), this.application);
                clone.screen = delayedCell.screen;
                clone.html = delayedCell.html;
                clone.args = [];
                for (var j = 0; j < delayedCell.args.length; j++) {
                    clone.args.push(delayedCell.args[j]);
                }
                clone.delayedChildren = delayedCell.delayedChildren;
                // вот тут важно, что на следующе уровни selector не передается
                // это позволяет использовать его для отбора ячеек только самого верхнего уровня
                // т.е. передается уже совсем другой селектор (см камент вначале ф-ии)
                clone.forceDelayed(filler, function (cell) { return !cell.delayed; });
                filler(clone);
                this.append(clone);
            }
            var newDelayedCells = [];
            for (var i = 0, l = this.delayedChildren.length; i < l; i++) {
                var dc = this.delayedChildren[i];
                if (dc.delayed) {
                    newDelayedCells.push(dc);
                }
            }
            this.delayedChildren = newDelayedCells;
            if (bubbleRender) {
                this.bubbleDown(function (cell) {
                    cell._safeAfterRender();
                });
            }
        };
        BaseCell.prototype.on = function (event, hook) {
            if (this.el) {
                $(this.el).on(event, function (e) {
                    hook(e);
                });
            }
            else {
                this._handlers.push({ event: event, hook: hook });
            }
        };
        BaseCell.prototype.trigger = function (event, params) {
            $(this.el).trigger(event, params);
        };
        BaseCell.prototype.getBox = function () {
            var answer = $(this.el).offset();
            if (!answer.width || !answer.height) {
                var obj = this.el.getBoundingClientRect();
                answer['width'] = Math.round(obj.width);
                answer['height'] = Math.round(obj.height);
            }
            return answer;
        };
        BaseCell.prototype.fillElAttrs = function () {
            var el = this.el;
            // hack used to reseting element to its original
            $(el).removeAttr('class');
            $(el).removeAttr('style');
            var classes = this.record.classes;
            for (var i = 0, l = classes.length; i < l; i++) {
                if (i != 0)
                    el.className += " ";
                el.className += classes[i];
            }
            if (this.record.id) {
                el.id = this.record.id;
            }
            this.fillExtraAttrs(el);
        };
        BaseCell.prototype.fillExtraAttrs = function (el) {
        };
        BaseCell.prototype.createEl = function () {
            if (this.tag.match('-') && registered_elements.indexOf(this.tag) < 0) {
                var d = document;
                if (d['registerElement']) {
                    d.registerElement(this.tag);
                }
                registered_elements.push(this.tag);
            }
            var el = document.createElement(this.tag);
            if (this.exceptTags.indexOf(this.tag) < 0) {
                el.innerHTML = this.html;
            }
            // Оппа! на третьем айфоне упало!
            // try{
            //     // этот try для node, в котором гоняются тесты
            //     var el = document.createElement(this.tag)
            //     el.innerHTML = this.html
            // }
            // catch(x){
            //     var tl = <any>new TestEl()
            //     el = <HTMLElement> tl
            // }
            return el;
        };
        BaseCell.prototype.prepareEl = function () {
            if (!this.el) {
                this.el = this.createEl();
                this.fillElAttrs();
            }
        };
        BaseCell.prototype.updateEl = function (html) {
            this.html = html;
            $(this.el).html(html);
            return this;
        };
        BaseCell.prototype._safeAfterRender = function () {
            if (this._renderred) {
                return;
            }
            this._renderred = true;
            this.afterRender();
        };
        BaseCell.prototype.afterResolve = function () {
        };
        BaseCell.prototype.beforeAppend = function () {
        };
        BaseCell.prototype.afterAppend = function () {
        };
        BaseCell.prototype.afterRender = function () {
        };
        BaseCell.prototype.bubbleDown = function (callable) {
            callable(this);
            for (var i = 0, l = this.children.length; i < l; i++) {
                this.children[i].bubbleDown(callable);
            }
        };
        BaseCell.prototype.append = function (cell) {
            cell.beforeAppend();
            this.prepareEl();
            cell.parent = this;
            this.children.push(cell);
            var ne = cell.render();
            this.appendDomMethod(ne);
            cell._handlers.forEach(function (eh) {
                cell.on(eh.event, eh.hook);
            });
            cell.afterAppend();
        };
        BaseCell.prototype.appendDomMethod = function (el) {
            this.el.appendChild(el);
        };
        BaseCell.prototype.appendDelayed = function (cell) {
            this.delayedChildren.push(cell);
        };
        BaseCell.prototype.render = function () {
            // $(this.el).remove()
            // this.el = null
            this.prepareEl();
            return this.el;
        };
        BaseCell.prototype.destroy = function () {
            $(this.el).remove();
            this.el = null;
            this.children = [];
            this.delayedChildren = [];
            var newParentsChildren = [];
            for (var i = 0; i < this.parent.children.length; i++) {
                var cel = this.parent.children[i];
                if (cel !== this) {
                    newParentsChildren.push(cel);
                }
            }
            this.parent.children = newParentsChildren;
        };
        BaseCell.prototype.domFromString = function (s) {
            return utils.Utils.DomFromString(s);
        };
        BaseCell.prototype.searchDown = function (collected, cons, className, id, once) {
            var classMatch = function (rec) {
                if (className) {
                    return rec.classes.indexOf(className) >= 0;
                }
                return true;
            };
            var idMatch = function (rec) {
                if (id) {
                    return rec.id == id;
                }
                return true;
            };
            var consMatch = function (rec) {
                if (cons) {
                    return rec.cons == cons;
                }
                return true;
            };
            for (var i = 0, l = this.children.length; i < l; i++) {
                var cell = this.children[i];
                if (consMatch(cell.record) && classMatch(cell.record) && idMatch(cell.record)) {
                    collected.push(cell);
                    if (once) {
                        break;
                    }
                }
                cell.searchDown(collected, cons, className, id, once);
            }
        };
        BaseCell.prototype.query = function (cons, className, id) {
            var answer = [];
            this.searchDown(answer, cons, className, id);
            return answer;
        };
        BaseCell.prototype.find = function (cons, className, id) {
            var answer = null;
            var acc = [];
            this.searchDown(acc, cons, className, id, true);
            if (acc.length > 0) {
                answer = acc[0];
            }
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
        BaseScreen.prototype.forceRender = function () {
            var _this = this;
            $(this.el).children().first().before('<div>Force render!</div>');
            setTimeout(function () {
                $(_this.el).children().first().remove();
            }, 80);
        };
        return BaseScreen;
    })(BaseCell);
    exports.BaseScreen = BaseScreen;
    var ViewPort = (function (_super) {
        __extends(ViewPort, _super);
        function ViewPort(el) {
            this.el = el;
            _super.call(this, { cons: '', id: '', classes: [] }, null);
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
        Image.prototype.onload = function () {
        };
        Image.prototype.draw = function (src, effect) {
            this.args[0] = src;
            if (this.el.tagName.toLowerCase() == 'canvas') {
                var i = document.createElement('img');
                this.drawImageInCanvas(this.el, i, effect);
            }
            else {
                var me = this;
                var img = this.el;
                img.onload = function () { me.onload(); };
                img.src = src;
            }
        };
        Image.prototype.getSourceBoxForCompleteCanvas = function (imgWidth, imgHeight, canvasWidth, canvasHeight) {
            // https://developer.mozilla.org/en-US/docs/HTML/Canvas/Tutorial/Using_images?redirectlocale=en-US&redirectslug=Canvas_tutorial%2FUsing_images
            var ratio = imgWidth / imgHeight;
            var sX = 0, sY = 0;
            var sWidth = imgWidth, sHeight = imgHeight;
            var wrat = imgWidth / canvasWidth;
            var hrat = imgHeight / canvasHeight;
            var cropHeight = function () {
                var resultWidth = canvasWidth;
                var resultHeight = canvasWidth / ratio;
                var croppedFromHeight = (resultHeight - canvasHeight);
                sY = croppedFromHeight / 2 * wrat;
                sHeight = sHeight - (2 * sY);
            };
            var cropWidth = function () {
                var resultHeight = canvasHeight;
                var resultWidth = canvasHeight * ratio;
                var croppedFromWidth = (resultWidth - canvasWidth);
                sX = (croppedFromWidth / 2) * hrat;
                sWidth = sWidth - (2 * sX);
            };
            if (wrat < 1 && hrat < 1) {
                if (wrat <= hrat) {
                    //tez(1,5,10,10)
                    // нужно подтягивать ширину картинки к ширине канваса
                    cropHeight();
                }
                else {
                    ////tez(1,5,10,10)
                    // нужно подтягивать высоту картинки к высоте канваса
                    cropWidth();
                }
            }
            else if (wrat < 1 && hrat >= 1) {
                // нужно подтягивать ширину картинки к ширине канваса
                //tez(5,20,10,10)
                cropHeight();
            }
            else if (hrat < 1 && wrat >= 1) {
                ////tez(20,5,10,10)
                // нужно подтягивать высоту картинки к высоте канваса
                cropWidth();
            }
            else {
                if (wrat > hrat) {
                    //tez(100,50,10,10) нужно жать высоту картинки до высоты
                    // канваса
                    cropWidth();
                }
                else {
                    // tez(50,100,10,10)
                    // нужно жать ширину картинки до ширины канваса
                    cropHeight();
                }
            }
            //return {left:sX, top:sY, width:canvasWidth, height:canvasHeight}
            return { left: sX, top: sY, width: sWidth, height: sHeight };
        };
        Image.prototype.getDestBoxForCompleteImage = function (imgWidth, imgHeight, canvasWidth, canvasHeight) {
            var ratio = imgWidth / imgHeight;
            var dX = 0, dY = 0;
            var dWidth = imgWidth, dHeight = imgHeight;
            var dWidth = canvasWidth, dHeight = canvasHeight;
            var wrat = imgWidth / canvasWidth;
            var hrat = imgHeight / canvasHeight;
            var scaleWidth = function () {
                var resultWidth = canvasWidth;
                var resultHeight = canvasWidth / ratio;
                var restInHeight = (canvasHeight - resultHeight);
                dY = restInHeight / 2;
                dHeight = resultHeight;
            };
            var scaleHeight = function () {
                // this case not tested yet
                var resultHeight = canvasHeight;
                var resultWidth = canvasHeight * ratio;
                var restInWidth = (canvasWidth - resultWidth);
                dX = restInWidth / 2;
                dWidth = resultWidth;
            };
            if (wrat < 1 && hrat < 1) {
                //console.log(1)
                if (wrat <= hrat) {
                    //console.log(111)
                    //tez(1,5,10,10)
                    // нужно подтягивать высоту картинки к высоте канваса
                    scaleHeight();
                }
                else {
                    // console.log(112)
                    ////tez(5,1,10,10)
                    // нужно подтягивать ширину картинки к ширине канваса
                    scaleWidth();
                }
            }
            else if (wrat < 1 && hrat >= 1) {
                // console.log(12)//PASSED
                // нужно подтягивать ширину картинки к ширине канваса
                //tez(5,20,10,10)
                scaleHeight();
            }
            else if (hrat < 1 && wrat >= 1) {
                // console.log(13)
                ////tez(20,5,10,10)
                // нужно подтягивать высоту картинки к высоте канваса
                scaleWidth();
            }
            else {
                //console.log(14)//PASSED
                if (wrat > hrat) {
                    //console.log(141)//PASSED
                    //tez(100,50,10,10)
                    // нужно жать ширину картинки до ширины канваса
                    scaleWidth();
                }
                else {
                    //console.log(142)//PASSED
                    // tez(50,100,10,10)
                    // нужно жать высоту картинки до высоты канваса
                    scaleHeight();
                }
            }
            //return {left:sX, top:sY, width:canvasWidth, height:canvasHeight}
            return { left: dX, top: dY, width: dWidth, height: dHeight };
        };
        Image.prototype.drawImageInCanvas = function (canvas, img, effect) {
            var me = this;
            var errBack = function () {
                if (me.args[3]) {
                    me.draw(me.args[3]);
                }
            };
            if (!this.args[0]) {
                errBack();
            }
            if (!this.drawed) {
                canvas.width = this.args[1];
                canvas.height = this.args[2];
            }
            $(img).on('load', function () {
                var ratio = img.width / img.height;
                var context = canvas.getContext('2d');
                var sourceBox = { top: 0, left: 0, width: img.width, height: img.height };
                var destBox = { top: 0, left: 0, width: canvas.width, height: canvas.height };
                if (me.args[4]) {
                    if (me.args[4] == 'completeImage') {
                        destBox = me.getDestBoxForCompleteImage(img.width, img.height, canvas.width, canvas.height);
                    }
                    else if (me.args[4] == 'completeCanvas') {
                        sourceBox = me.getSourceBoxForCompleteCanvas(img.width, img.height, canvas.width, canvas.height);
                    }
                }
                else {
                    // complete canvas by default
                    sourceBox = me.getSourceBoxForCompleteCanvas(img.width, img.height, canvas.width, canvas.height);
                }
                var _draw = function () {
                    context.drawImage(img, sourceBox.left, sourceBox.top, sourceBox.width, sourceBox.height, destBox.left, destBox.top, destBox.width, destBox.height);
                    me.imageBox = destBox;
                };
                switch (effect) {
                    case 'fade':
                        $(canvas).css(utils.getTransitionParamsFor('opacity'));
                        setTimeout(function () {
                            $(canvas).css('opacity', '0.2');
                            setTimeout(function () {
                                _draw();
                                $(canvas).css('opacity', '1.0');
                            }, 300);
                        }, 50);
                        // me.alpha  =0
                        // me.fadeLoop(canvas,me.args[0],_draw)
                        break;
                    default:
                        _draw();
                        me.onload();
                        break;
                }
                me.drawed = me.args[0];
            }).on('error', function (e) {
                if (img.src != me.args[3]) {
                    errBack();
                }
            });
            img.src = this.args[0];
        };
        Image.prototype.clear = function () {
            if (this.el.tagName.toLowerCase() == 'canvas') {
                var canvas = this.el;
                canvas.width = canvas.width;
            }
            else {
                $(this.el).attr('scr', '');
            }
        };
        Image.prototype.createEl = function () {
            var img = document.createElement('img');
            var answer = img;
            if (this.html.length > 0) {
                img.src = this.html;
            }
            else {
                if (this.args.length > 0) {
                    if (this.args[1] && this.args[2]) {
                        var canvas = document.createElement('canvas');
                        if (this.args[0] != null) {
                            this.drawImageInCanvas(canvas, img);
                        }
                        else {
                            canvas.width = this.args[1];
                            canvas.height = this.args[2];
                        }
                        answer = canvas;
                    }
                    else {
                        img.src = this.args[0];
                        answer = img;
                    }
                }
            }
            return answer;
        };
        // initialSourceBox:interfaces.Box;
        Image.prototype.scale = function (factor, shift) {
            this.clear();
            var img = document.createElement('img');
            var canvas = this.el;
            var context = canvas.getContext('2d');
            var me = this;
            img.onload = function () {
                // refactoreeeeeeeeeeeee
                // var destBox = {top:0,left:0,width:canvas.width,height:canvas.height}
                // var sourceBox= me.getSourceBoxForCompleteCanvas(img.width, img.height,
                //                                              canvas.width, canvas.height)
                // refactoreeeeeeeeeeeee
                var sourceBox = { top: 0, left: 0, width: img.width, height: img.height };
                var destBox = { top: 0, left: 0, width: canvas.width, height: canvas.height };
                if (me.args[4]) {
                    if (me.args[4] == 'completeImage') {
                        destBox = me.getDestBoxForCompleteImage(img.width, img.height, canvas.width, canvas.height);
                    }
                    else if (me.args[4] == 'completeCanvas') {
                        sourceBox = me.getSourceBoxForCompleteCanvas(img.width, img.height, canvas.width, canvas.height);
                    }
                }
                else {
                    // complete canvas by default
                    sourceBox = me.getSourceBoxForCompleteCanvas(img.width, img.height, canvas.width, canvas.height);
                }
                // sourceBox уже соответствует размеру canvas
                // его просто нужно умножить на factor
                // зумаут мы не можем делать. мы и так показали картинку полностью. делать
                // ее меньше канваса нет смысла. т.е. фактор будет точно больше 1
                // скажем если фактор = 2, то исходную ширину(и высоту тоже) нужно РАЗДЕЛИТЬ на 2
                // т.е. в том же канвасе показать исходник меньшего размера. соотв он растянется тогда!
                sourceBox.left = sourceBox.left + (sourceBox.width - sourceBox.width / factor) / 2;
                sourceBox.top = sourceBox.top + (sourceBox.height - sourceBox.height / factor) / 2;
                var croppedWidth = sourceBox.width - sourceBox.width / factor;
                var croppedHeight = sourceBox.height - sourceBox.height / factor;
                sourceBox.width = sourceBox.width / factor;
                sourceBox.height = sourceBox.height / factor;
                if (shift) {
                    var le = shift.left - canvas.width / 2;
                    var ratio = sourceBox.width / canvas.width;
                    var leftOffsetRequired = le * ratio;
                    // if(Math.abs(leftOffsetRequired)>croppedWidth){
                    //     if(leftOffsetRequired<0){
                    //         leftOffsetRequired = 0 - Math.abs(croppedWidth)
                    //     }
                    //     else{
                    //         leftOffsetRequired = Math.abs(croppedWidth)
                    //     }
                    // }
                    var to = shift.top - canvas.height / 2;
                    var ratio = sourceBox.height / canvas.height;
                    var topOffsetRequired = to * ratio;
                    // if(Math.abs(topOffsetRequired)>croppedHeight){
                    //     if(topOffsetRequired<0){
                    //         topOffsetRequired = 0- Math.abs(croppedHeight)
                    //     }
                    //     else{
                    //         topOffsetRequired = Math.abs(croppedHeight)
                    //     }
                    // }
                    console.log(le, leftOffsetRequired, croppedWidth);
                    sourceBox.left = +leftOffsetRequired;
                    sourceBox.top = +topOffsetRequired;
                }
                me.clear();
                context.drawImage(img, sourceBox.left, sourceBox.top, sourceBox.width, sourceBox.height, destBox.left, destBox.top, destBox.width, destBox.height);
            };
            img.src = this.args[0];
        };
        return Image;
    })(BaseCell);
    exports.Image = Image;
    var Uploader = (function (_super) {
        __extends(Uploader, _super);
        function Uploader() {
            _super.apply(this, arguments);
        }
        Uploader.prototype.needLoad = function (fname) {
            return true;
        };
        Uploader.prototype.fileChoosen = function () {
        };
        Uploader.prototype.loadFile = function (file) {
            // var files = e.target.files
            // var file = files[0]
            this.fileName = file.name;
            this.fileSize = file.size;
            this.fileType = file.type;
            this.rawFile = file;
            this.fileChoosen();
            if (!this.needLoad(this.fileName)) {
                return;
            }
            var me = this;
            var reader = new FileReader();
            reader.onload = function (ev) {
                me.file = ev.target.result;
                me.loadDone();
            };
            if (this.binary) {
                reader.readAsArrayBuffer(file);
            }
            else {
                reader.readAsDataURL(file);
            }
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
            })
                .on('dragover', stop)
                .on('dragenter', stop);
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
});
