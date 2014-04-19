import interfaces = module("./interfaces")
declare var $;


export class Transition implements interfaces.Transition{
    going:interfaces.Screen;
    coming:interfaces.Screen;
    parentBox:interfaces.Box;
    success:Function;
    fail:Function;
    constructor(public app:interfaces.Application,
                public selector:interfaces.ScreenSelector,
                callbacks:interfaces.CallBacks){
        this.going = app.currentScreen
        this.coming = selector(app.screens)
        this.success = callbacks.success
        this.fail = callbacks.fail
        this.parentBox = this.going.parent.getBox()

    }

    renderNewScreen(){
        this.app.resolve(this.selector)
    }
    union(){
        this.renderNewScreen()
        this.success()
    }
    redraw(){
        //this.fixPosition(this.going)
        $(this.going.el).hide()
        this.renderNewScreen()
        this.success()
    }
    pop(){
        var me = this
        this.fixPosition(this.going)

        this.renderNewScreen()

        var itemBox = this.fixPosition(me.coming)
        $(me.coming.el).css({
            position:'absolute',
            opacity:'0',
            width:'0px',
            height:'0px',
            'margin-top':itemBox.height/2+'px',
            'margin-left':itemBox.width/2+'px',
        });

        $(this.going.el).css('position','absolute')

        setTimeout(function(){
            me.going.el.className+=' pop'
            me.coming.el.className+= ' pop'
        }, this.classDelay/2)
        setTimeout(function(){
            $(me.going.el).css({
                width:'0px',
                height:'0px',
                'margin-top':itemBox.height/2+'px',
                'margin-left':itemBox.width/2+'px',
            });
            setTimeout(function(){
                $(me.coming.el).css({
                    width:itemBox.width+'px',
                    height:itemBox.height+'px',
                    opacity:'1.0',
                    'margin-top':'0px',
                    'margin-left':'0px'
                });
                setTimeout(function(){
                    me.releasePosition(me.coming)
                    me.success()
                },250)
            },250);
        },this.classDelay);
    }
    fade(){
        var me = this;
        me.fixPosition(me.going)
        $(me.going.el).css({
            position:'absolute',
            opacity:'1.0'
        });
        me.renderNewScreen()
        me.fixPosition(me.coming)
        $(me.coming.el).css({
            position:'absolute',
            opacity:'0.0'
        }).hide();

        // $(me.coming.el).addClass('fade');
        // $(me.going.el).addClass('fade');
        var params = me.joinParams(me.getTransformParams(0,0,0),
                                   me.getTransitionParamsFor('opacity'))
	var zero = {'opacity':'0.0'}
	$(me.going.el).css(params).css(zero)	

        setTimeout(()=>{
            $(me.going.el).hide()	    
	    $(me.coming.el).css({display:'block'})
	    $(me.coming.el).css(params)
	    setTimeout(()=>{
		$(me.coming.el).css({'opacity':'1.0'})
		me.cleanUpTransform(()=>{})		
	    },100)
        },300)
    }

    cover(leftOrTop:string,
          positive:bool){
        var widthOrHeight = 'height'
        if(leftOrTop=='left'){
            widthOrHeight = 'width'
        }
        var me = this;
        var itemBox = this.fixPosition(this.going);

        $(me.going.el).css({
            position:'absolute',
            'z-index':9,
        });

        me.renderNewScreen()

        var targetCss = {
            position:'absolute',
            'z-index':999
        };

        this.fixBackground(this.coming,targetCss)

        this.fixPosition(me.coming)

        targetCss[leftOrTop] = positive?itemBox[widthOrHeight]:0-itemBox[widthOrHeight]+'px';
        $(me.coming.el).css(targetCss);


        var me = this;
        setTimeout(function(){
            $(me.coming.el).addClass('cover');
        }, 50);

        setTimeout(function(){
            var elCss = {};
            elCss[leftOrTop] = '0px';
            $(me.coming.el).css(elCss);
            setTimeout(function(){
                me.releasePosition(me.coming)
                me.success();
            },400)
        },this.classDelay);
    }

    coverLeft(){
        this.cover('left',true)
    }
    coverRight(){
        this.cover('left',false)
    }
    coverUp(){
        this.cover('top',true)
    }
    coverDown(){
        this.cover('top',false)
    }

    reveal(leftOrTop:string,positive:bool)
    {
        var me = this;
        var widthOrHeight = 'height'
        if(leftOrTop=='left'){
            widthOrHeight = 'width'
        }

        var itemBox = this.fixPosition(this.going)
        $(me.going.el).css({
            position:'absolute',
            'z-index':999,
        });

        me.renderNewScreen()

        var targetCss = {
            position:'absolute',
            'z-index':999
        };

        this.fixBackground(this.going, targetCss)
        $(this.going.el).css(targetCss)

        $(me.coming.el).css({
            position:'absolute',
            'z-index':9
        });

        this.fixPosition(me.coming)

        setTimeout(function(){
            me.going.el.className+= ' reveal';
        }, 50);
        setTimeout(function(){

            targetCss[leftOrTop] = positive ? itemBox[widthOrHeight]+'px':0-itemBox[widthOrHeight]+'px'
            $(me.going.el).css(targetCss);
            setTimeout(function(){
                me.releasePosition(me.coming)
                me.resetParent()
                me.success()
            },400)
        },this.classDelay);
    }

    revealLeft(){
        this.reveal('left',true)
    }
    revealRight(){
        this.reveal('left',false)
    }
    revealUp(){
        this.reveal('top',false)
    }
    revealDown(){
        this.reveal('top',true)
    }
    classDelay=200;
    cssDelay = 600;


    getTransformParams(x,y,z){
        return {
            '-webkit-transform':'translate3d('+x+'px, '+y+'px, '+z+'px)',
            '-moz-transform': 'translate3d('+x+'px, '+y+'px, '+z+'px)',
            '-ms-transform': 'translate3d('+x+'px, '+y+'px, '+z+'px)',
            '-o-transform': 'translate3d('+x+'px, '+y+'px, '+z+'px)',
            'transform': 'translate3d('+x+'px, '+y+'px, '+z+'px)'
        }
    }
    // getTransitionParams(){
    //  return      {
    //      '-webkit-transition': '-webkit-transform 0.3s ease-in',
    //      '-moz-transition': '-webkit-transform 0.3s ease-in',
    //      '-o-transition': '-webkit-transform 0.3s ease-in',
    //      'transition': '-webkit-transform 0.3s ease-in'
    //  }
    // }

    getTransitionParamsFor(property){
        return      {
            '-webkit-transition': property+' 0.3s ease-in',
            '-moz-transition': property+' 0.3s ease-in',
            '-o-transition': property+' 0.3s ease-in',
            'transition': property+' 0.3s ease-in'
        }
    }


    joinParams(p1,p2){
        var res = {}
        for(var k in p1){
            res[k]= p1[k]
        }
        for(var k in p2){
            res[k]= p2[k]
        }
        return res
    }
    removeTransformParams(){
        return {
            '-webkit-transform':"",
            '-moz-transform': "",
            '-ms-transform': "",
            '-o-transform': "",
            'transform': "",//was null for zepto
        }
    }
    removeTransitionParams(){
        return {
            '-webkit-transition': "",
            '-moz-transition': "",
            '-o-transition': "",
            'transition': "" //was null for zepto
        }
    }
    // this is a hack. somehow it worked, but it is not required now
    removeIphoneFlash(el){
        $(el).css({
            '-webkit-transition': '0ms cubic-bezier(0.1, 0.57, 0.1, 1)',
            'transition': '0ms cubic-bezier(0.1, 0.57, 0.1, 1)',
            '-webkit-transform': 'translate(0px, 0px) translateZ(0px)'
        })
    }
    slideLeft(){
        var me = this;
        me.renderNewScreen()
        //var itemBox = this.going.getBox()
        var itemBox = me.fixPosition(me.going)
        $(me.coming.parent.el).css('width',itemBox.width*3+'px')
        $(me.coming.el).css({
            width:itemBox.width+'px',
            float:'left'
        })
        $(me.going.el).css({
            width:itemBox.width+'px',
            float:'left'
        });
        var trParams = me.joinParams(me.getTransformParams(0-itemBox.width,0,0),
                                     me.getTransitionParamsFor('-webkit-transform'))
        $(me.going.parent.el).css(trParams)
        me.cleanUpTransform(()=>{})
    }
    slideRight(){
        var me = this;
        var itemBox = me.fixPosition(me.going)
        var trParams = me.joinParams(me.getTransformParams(0-itemBox.width,0,0),
                                     {
                                         width:itemBox.width*3+'px'
                                     })

        $(me.going.parent.el).css(trParams)
        $(me.going.el).css({
            width:itemBox.width+'px',
            float:'left'
        });

        me.renderNewScreen()
        $(me.coming.el).css({
            width:itemBox.width+'px',
            float:'left'
        })

        $(me.going.el).before($(me.coming.el));
        setTimeout(()=>{
            $(me.going.parent.el).css(me.getTransitionParamsFor('-webkit-transform'))
            trParams = me.getTransformParams(0,0,0)
            $(me.going.parent.el).css(trParams)
            me.cleanUpTransform(()=>{})
        },100)
    }

    cleanUpTransform(hook:()=>any){
        var me = this
        setTimeout(()=>{
            var bx = me.coming.getBox()
            var trParams = me.joinParams(me.joinParams(me.removeTransitionParams(),
                                                       me.removeTransformParams()),
                                         {
                                             width:null,
                                             height:null
                                         })
            $(me.coming.parent.el).css(trParams)
            $(me.coming.parent.el).css({
                'width':"",
                'height':"",
                'min-height':"",//it was null! for zepto
                'min-width':""
            })
            me.removeIphoneFlash(me.coming.el)
            hook()
            me.success()
        },500)
    }

    slideUp(){
        var me = this;
        var itemBox = me.fixPosition(me.going)
        me.renderNewScreen()

        // me.fixPosition(me.coming)

        $(me.coming.parent.el).css('min-height',itemBox.height*2+'px')
        var trParams = me.joinParams(me.getTransformParams(0,0-itemBox.height,0),
                                     me.getTransitionParamsFor('-webkit-transform'))
        $(me.going.parent.el).css(trParams)
        // me.releasePosition(me.coming)
        me.cleanUpTransform(()=>{})
    }

    slideDown(){
        var me = this;
        var itemBox = this.fixPosition(me.going)
        me.renderNewScreen()
        this.fixPosition(me.coming)
        var trParams = me.joinParams(me.getTransformParams(0,0-itemBox.height,0),
                                     {
                                         'min-height':itemBox.height*2
                                     })
        $(me.going.el).before($(me.coming.el));
        $(me.going.parent.el).css(trParams)
        var me = this
         setTimeout(()=>{
            $(me.going.parent.el).css(me.getTransitionParamsFor('-webkit-transform'))
            var trParams = me.getTransformParams(0,0,0)
            $(me.going.parent.el).css(trParams)
            me.cleanUpTransform(()=>{})
         },0)
    }

    fixBackground(cell:interfaces.Cell, css:{}){
        var background = $(cell.el).css('background-color') ||
            $(cell.el).css('background-image');
        if(!background || background=='rgba(0, 0, 0, 0)'){
            css['background-color'] = 'white'
        }
    }

    fixPosition(cell:interfaces.Cell){

        var minheight= 2400;
        var minwidth = 2400;
        var tag = cell.parent.el.tagName.toLowerCase()
        if(tag=='body'){
            // the phone!
            if(screen.width<minwidth){
                minwidth = screen.width
            }
            if(window.innerWidth<minwidth){
                minwidth = window.innerWidth
            }
            if(window.outerWidth<minwidth){
                minwidth = window.outerWidth
            }

            if(screen.height<minheight){
                minwidth = screen.height
            }

            if(window.innerWidth<minheight){
                minwidth = window.innerWidth
            }
            if(window.outerHeight<minheight){
                minheight = window.outerHeight
            }
        }
        else{
            // this is not the phone. we are working inside other div!
            bx = cell.parent.getBox()
            minheight = bx.height
            minwidth = bx.width
        }

        $(cell.el).css({
            width:minwidth,
            'min-width':minwidth,
            'max-width':minwidth,
            height:minheight,
            'min-height':minheight,
            'max-height':minheight,
            overflow:'hidden'
        })
        var bx = cell.getBox()
        return bx//box TODO! ??? why cell box?
    }

    releasePosition(cell:interfaces.Cell){
        $(cell.el).css({
            'width':'',
            'min-width':'',
            'max-width':'',
            'height':'',
            'min-height':'',
            'max-height':'',
            overflow:''
        })
    }
    resetParent(){
        // $(this.coming.parent.el)
        //     .css({width:this.parentBox.width+'px',height:this.parentBox.height+'px'})
        $(this.coming.parent.el)
            .css({width:null,height:null})
    }
}