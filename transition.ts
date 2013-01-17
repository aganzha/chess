import interfaces = module("chess/interfaces")
declare var $;

class Transition{
    constructor(public going:interfaces.Screen, public coming:interfaces.Screen){
    }
    // delay(f:Function, tm){

    // }
    success(){
    }
    error(){
    }
    redraw(){
	try{
	    this.going.destroy()
	    this.coming.render()
	    this.success()
	}
	catch(x){
	    this.error()
	}
    }    
    pop(){
	me.coming.render();
	var itemBox = this.going.getBox();
	$(me.coming.el).css({
	    width:'0px',
	    height:'0px',
	    'margin-top':itemBox.height/2+'px',
	    'margin-left':itemBox.width/2+'px',
	    position:'absolute',
	});
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
	var framePos = this.getFrameSizeAndOffset();
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
	var containerCss = {}
	containerCss[widthOrHeight] = itemBox[widthOrHeight]*2+'px';
	this.el.css(containerCss);
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
	    me.coming.el.className+= ' reveal';
	    setTimeout(function(){
		var elCss = {};
		elCss[leftOrTop] = sign(itemBox[widthOrHeight])+'px';
		$(me.going.el).css(elCss);
		me.success();
	    },50);
	}, 50);
    }

    slideLeft(){
	var me = this;
	me.coming.render();
	var itemBox = this.going.getBox()
	$(this.going.el).css({'width':itemBox.width*2+'px'})
	$(me.going.el).css({
	    'margin-left':0-itemBox.width+'px'
	});
	$(me.going.el).addClass('slideLeft')
	me.success();
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