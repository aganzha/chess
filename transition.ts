import interfaces = require("./interfaces")
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
    // pausecomp(millis)
    // {
    // 	var date = new Date();
    // 	var curDate = null;
    // 	do { curDate = new Date(); }
    // 	while(curDate-date < millis);
    // }
    renderNewScreen(){
	this.app.resolve(this.selector)
	//this.coming.forceRender()
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
		    me.releasePosition()
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

	$(me.coming.el).addClass('fade');
	$(me.going.el).addClass('fade');
	setTimeout(function(){
	    $(me.going.el).css({
		opacity:'0.0'
	    })},this.classDelay)
	setTimeout(function(){
	    $(me.coming.el).css({
	    	opacity:'1.0',
		display:'block'
	    })
	    setTimeout(function(){
		me.releasePosition()
		me.success()
	    },me.cssDelay)
	},me.cssDelay)
    }

    cover(leftOrTop:string,
	  positive:boolean){
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
		me.releasePosition()
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

    reveal(leftOrTop:string,positive:boolean)
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
		me.releasePosition()
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
    getTransitionParams(){
	return 	    {
	    '-webkit-transition': '-webkit-transform 0.3s ease-in',
	    '-moz-transition': '-webkit-transform 0.3s ease-in',
	    '-o-transition': '-webkit-transform 0.3s ease-in',
	    'transition': '-webkit-transform 0.3s ease-in'
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
	$(me.coming.parent.el).css('width',itemBox.width*2+'px')
	$(me.coming.el).css({
	    width:itemBox.width+'px',
	    height:itemBox.height+'px',
	    float:'right'
	})
	$(me.going.el).css({
	    width:itemBox.width+'px',
	    height:itemBox.height+'px',
	    float:'left'
	});
	var trParams = me.joinParams(me.getTransformParams(0-itemBox.width,0,0),
				     me.getTransitionParams())
	$(me.going.parent.el).css(trParams)
	me.cleanUpTransform()
    }
    slideRight(){
	var me = this;
	//var itemBox = this.going.getBox()
	var itemBox = me.fixPosition(me.going)
	var trParams = me.joinParams(me.getTransformParams(0-itemBox.width,0,0),
				     {
					 width:itemBox.width*2
				     })
	
	$(me.going.parent.el).css(trParams)
	$(me.going.el).css({
	    width:itemBox.width,
	    height:itemBox.height,
	    float:'right'
	});

	me.renderNewScreen()
	$(me.coming.el).css({
	    width:itemBox.width+'px',
	    height:itemBox.height+'px',
	    float:'left'
	})
	$(me.going.el).before($(me.coming.el));

	setTimeout(()=>{
	    $(me.going.parent.el).css(me.getTransitionParams())
	    trParams = me.joinParams(me.getTransformParams(0,0,0),
				     {
					 width:itemBox.width*2
				     })
	    $(me.going.parent.el).css(trParams)
	    me.cleanUpTransform()
	},100)
    }
    cleanUpTransform(){
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
	    me.success()
	},500)
    }

    slideUp(){
	var me = this;
	me.renderNewScreen()
	var itemBox = me.fixPosition(me.going)
	//var itemBox = this.going.getBox()
	$(me.coming.parent.el).css('min-height',itemBox.height*2+'px')
	var trParams = me.joinParams(me.getTransformParams(0,0-itemBox.height,0),
				     me.getTransitionParams())
	$(me.going.parent.el).css(trParams)
	me.cleanUpTransform()
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
	    $(me.going.parent.el).css(me.getTransitionParams())
	    var trParams = me.getTransformParams(0,0,0)
	    $(me.going.parent.el).css(trParams)
	    me.cleanUpTransform()
	},100)	
    }

    fixBackground(cell:interfaces.Cell, css:{}){
	var background = $(cell.el).css('background-color') ||
	    $(cell.el).css('background-image');
	if(!background || background=='rgba(0, 0, 0, 0)'){
	    css['background-color'] = 'white'
	}
    }

    fixPosition(cell:interfaces.Cell){
	var box = cell.parent.getBox()
	$(cell.el).css({
	    width:box.width,
	    height:box.height,
	    overflow:'hidden'
	})
	return box
    }
    releasePosition(){
	$(this.coming.el).css({
	    width:'',
	    height:''
	})
    }
    resetParent(){
	// $(this.coming.parent.el)
	//     .css({width:this.parentBox.width+'px',height:this.parentBox.height+'px'})
	$(this.coming.parent.el)
	    .css({width:null,height:null})
    }
}