import interfaces = module("chess/interfaces")
declare var $;

export class Transition implements interfaces.Transition{
    constructor(public going:interfaces.Screen,
		public coming:interfaces.Screen,
		public success:Function,
		public error:Function){
    }
    // success(){
    // }
    // error(){
    // }
    redraw(){
	$(this.going.el).hide()
	this.coming.render()
	this.success()
    }
    pop(){
	var me = this
	this.coming.render()
	var itemBox = this.going.getBox();
	$(me.coming.el).css({
	    width:'0px',
	    height:'0px',
	    'margin-top':itemBox.height/2+'px',
	    'margin-left':itemBox.width/2+'px',
	    position:'absolute',
	});
	$(me.going.el).css('position','absolute')
	var me = this;
	setTimeout(function(){
	    me.going.el.className+=' pop'
	    me.coming.el.className+= ' pop'
	}, 50)
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
		    'margin-top':'0px',
		    'margin-left':'0px'
		});
		me.success();
	    },200);
	},100);
    }
    fade(){
	var me = this;
	me.coming.render();
	$(me.going.el).css({
	    position:'absolute',
	    opacity:'1.0'
	});
	$(me.coming.el).css({
	    position:'absolute',
	    opacity:'0.0'
	});
	$(me.going.el).addClass('fade');
	$(me.coming.el).addClass('fade');
	var me = this;
	setTimeout(function(){
	    $(me.going.el).css({
		opacity:'0.0'
	    });
	    $(me.coming.el).css({
		opacity:'1.0'
	    });
	    me.success();
	},100);
    }

    cover(leftOrTop:string,
	  positive:bool){
	var widthOrHeight = 'height'
	if(leftOrTop=='left'){
	    widthOrHeight = 'width'
	}
	var me = this;
	var itemBox = this.going.getBox();
	var background = $(this.going.el).css('background-color') ||
	    $(this.going.el).css('background-image');
	if(!background || background=='rgba(0, 0, 0, 0)'){
	    $(this.coming.el).css('background-color','white');
	}
	me.coming.render();
	$(me.going.el).css({
	    position:'absolute',
	    'z-index':9,
	});
	var targetCss = {
	    position:'absolute',
	    'z-index':999
	};
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
	    me.success();
	},100);
    }


    reveal(leftOrTop:string,
	   positive:bool)
    {
	var me = this;
	var widthOrHeight = 'height'
	if(leftOrTop=='left'){
	    widthOrHeight = 'width'
	}
	var itemBox = this.going.getBox();
	var background = $(this.going.el).css('background-color') ||
	    $(this.going.el).css('background-image');
	if(!background || background=='rgba(0, 0, 0, 0)'){
	    $(this.going.el).css('background-color','white');
	}

	me.coming.render();
	$(me.going.el).css({
	    position:'absolute',
	    'z-index':999,
	});
	$(me.coming.el).css({
	    position:'absolute',
	    'z-index':9
	});
	var me = this;
	setTimeout(function(){
	    me.going.el.className+= ' reveal';	    
	}, 50);
	setTimeout(function(){
	    var elCss = {};
	    elCss[leftOrTop] = positive ? itemBox[widthOrHeight]+'px':0-itemBox[widthOrHeight]+'px'
	    $(me.going.el).css(elCss);
	    me.success();
	},100);
    }

    slideLeft(){
	var me = this;
	me.coming.render();
	var itemBox = this.going.getBox()

	var old = me.coming.parent.getBox().width;
	if(old && !(old+'').match('px')){
	    old+='px'
	}
	$(me.coming.parent.el).css('width',itemBox.width*2+'px')
	$(me.coming.el).css({
	    width:itemBox.width+'px',
	    height:itemBox.height+'px',
	    float:'left'
	})
	$(me.going.el).css({
	    width:itemBox.width+'px',
	    height:itemBox.height+'px',
	    float:'left'
	});
	//??? timeout will be really ok here
	$(me.going.el).addClass('slideLeft')
	setTimeout(function(){
	    $(me.going.el).css({
		'margin-left':0-itemBox.width+'px',
	    })
	},100)
	setTimeout(function(){
	    $(me.coming.parent.el).css('width',old+'px')
	    me.success();
	}, 400)

    }
    slideRight(){
	var me = this;
	var itemBox = this.going.getBox();
	// $(me.going.el).css({'width':itemBox.width*2+'px'});

	var old = me.coming.parent.getBox().width;
	if(old && !(old+'').match('px')){
	    old+='px'
	}
	$(me.coming.parent.el).css('width',itemBox.width*2+'px')

	me.coming.render();
	$(me.coming.el).css({
	    'margin-left':0-itemBox.width+'px',
	    width:itemBox.width+'px',
	    height:itemBox.height+'px',
	    float:'left'
	})
	$(me.going.el).css({
	    width:itemBox.width+'px',
	    height:itemBox.height+'px',
	    float:'left'
	});
	$(me.going.el).before($(me.coming.el));
	$(me.coming.el).addClass('slideRight');
	setTimeout(function(){
	    $(me.coming.el).css({
		'margin-left':'0px'
	    });
	}, 100)

	setTimeout(function(){
	    $(me.coming.parent.el).css('width',old)
	    me.success();
	},400);
    }
    slideUp(){
	var me = this;
	me.coming.render();
	var itemBox = this.going.getBox();
	var old = $(me.going.parent.el).css('height')
	if(old && !(old+'').match('px')){
	    old+='px'
	}

	$(me.going.el).addClass('slideUp')

	setTimeout(function(){
	    $(me.going.el).css({
		'margin-top':0-itemBox.height+'px'
	    });
	}, 100)
	
	setTimeout(function(){
	    $(me.coming.parent.el).css('height',old)
	    me.success();
	},400);
    }

    slideDown(){

	var me = this;
	var itemBox = this.going.getBox();

	var old = $(me.going.parent.el).css('height')
	if(old && !(old+'').match('px')){
	    old+='px'
	}
	var oldMargin = $(me.coming.el).css('margin-top')
	me.coming.render()


	$(me.coming.el).css({
	    'margin-top':0-itemBox.height+'px'
	});
	$(me.going.el).before($(me.coming.el));
	
	$(me.coming.el).addClass('slideDown');

	setTimeout(function(){
	    $(me.coming.el).css({
		'margin-top':oldMargin
	    });
	}, 100)

	setTimeout(function(){
	    $(me.coming.parent.el).css('height',old)
	    me.success();
	},400);
    }
}