import interfaces = module("chess/interfaces")
declare var $;

export class Transition{
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

    cover(widthOrHeight:string,
	  leftOrTop:string,
	  sign:(n:number)=>number){
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
	targetCss[leftOrTop] = sign(itemBox[widthOrHeight])+'px';

	$(me.coming.el).css(targetCss);
	var me = this;
	setTimeout(function(){
	    $(me.coming.el).addClass('cover');
	    setTimeout(function(){
		var elCss = {};
		elCss[leftOrTop] = '0px';
		$(me.coming.el).css(elCss);
		me.success();
	    },50);
	}, 50);
    }

    // TODO! refactor cover
    // just 1 function for them from switch!
    reveal(widthOrHeight:string,
	   leftOrTop:string,
	   sign:(n:number)=>number){	
	var me = this;
	var itemBox = this.going.getBox();
	var background = $(this.going.el).css('background-color') || 
	    $(this.going.el).css('background-image');
	if(!background || background=='rgba(0, 0, 0, 0)'){	    
	    $(this.going.el).css('background-color','white');
	}
	var containerCss = {}
	containerCss[widthOrHeight] = itemBox[widthOrHeight]*2+'px';
	$(this.coming.el).css(containerCss);
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
	    setTimeout(function(){
		var elCss = {};
		elCss[leftOrTop] = sign(itemBox[widthOrHeight])+'px';
		console.log(elCss);
		$(me.going.el).css(elCss);
		me.success();
	    },50);
	}, 50);
    }

    slideLeft(){
	var me = this;
	me.coming.render();
	var itemBox = this.going.getBox()
	// $(this.going.el).css({'width':itemBox.width*2+'px'})
	var old = me.coming.parent.getBox().width;
	$(me.coming.parent.el).css('width',itemBox.width*2+'px')
	$(me.coming.el).css({
	    width:itemBox.width+'px',
	    height:itemBox.height+'px',
	    float:'left'
	})
	$(me.going.el).css({
	    'margin-left':0-itemBox.width+'px',
	    width:itemBox.width+'px',
	    height:itemBox.height+'px',
	    float:'left'
	});
	$(me.going.el).addClass('slideLeft')
	setTimeout(function(){
	    $(me.coming.parent.el).css('width',itemBox.width*2+'px')
	    me.success();
	}, 200)
	
    }
    slideRight(){
	var me = this;
	var itemBox = this.going.getBox();	
	$(me.going.el).css({'width':itemBox.width*2+'px'});
	me.coming.render();
	$(me.coming.el).css({
	    'margin-left':0-itemBox.width+'px'
	});
	$(me.going.el).before($(me.coming.el));
	$(me.coming.el).addClass('slideRight');
	setTimeout(function(){
	    $(me.coming.el).css({
		'margin-left':'0px'
	    });
	    me.success();
	},100);
    }
    slideUp(){
	var me = this;
	me.coming.render();
	var itemBox = this.going.getBox();
	$(me.going.el).css({'height':itemBox.height*2+'px'});
	$(me.going.el).css({
	    'margin-top':0-itemBox.height+'px'
	});
	$(me.going.el).addClass('slideUp')
	me.success();
    }
    slideDown(){
	var me = this;
	var itemBox = this.going.getBox();
	$(me.going.el).css({'height':itemBox.height*2+'px'});
	me.coming.render();
	$(me.coming.el).css({
	    'margin-top':0-itemBox.height+'px'
	});
	$(me.going.el).before($(me.coming.el));
	$(me.coming.el).addClass('slideDown');
	setTimeout(function(){
	    $(me.coming.el).css({
		'margin-top':'0px'
	    });
	    me.success();
	},100);
    }
}