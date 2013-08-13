$.widget("jws.log",{
    
	_init:function(){
		w.log               = this;
		w.log.logVisible    = true;
		w.log.eLog          = w.log.element.find("#log_box_content");
		w.log.eBtnHide      = w.log.element.find('#show_hide_log');
		this.registerEvents();
	},
    
	registerEvents: function(){
		//adding click functions
		w.log.eBtnHide.click(w.log.showHide);
		w.log.element.find('#clear_log').click(w.log.clearLog);
		w.log.eLog.scroll( function( aEvent ){
//			condition to avoid scrolling
		});
	},
    
	showHide: function(){
		//if it's shown we have to hide it
		if(w.log.logVisible){
			w.log.eBtnHide.removeClass("hide").addClass("show").text("Show Log");
			w.log.eLog.slideUp(500, function(){
				$(this).removeClass("log_box_visible").addClass("log_box_hidden").slideDown(100).hide();
			});
			w.log.logVisible = false;
		}
		else{
			w.log.eBtnHide.removeClass("show").addClass("hide").text("Hide Log");
			w.log.eLog.fadeOut(100, function(){
				$(this).removeClass("log_box_hidden").addClass("log_box_visible").slideDown(500, function(){
					w.log.eLog.scrollTop(w.log.eLog.get(0).scrollHeight - w.log.eLog.get(0).clientHeight);
				});
				
			});
			
			w.log.logVisible = true;
		}
	},
	clearLog: function(){
		w.log.eLog.text("");
	}
});

function log( aString ) {
	w.log.eLog.append(aString + "<br>");
	
	var lLineHeight = 20; // This should match the line-height in the CSS
	var lScrollHeight = w.log.eLog.get(0).scrollHeight;
	w.log.eLog.get(0).style.height = lScrollHeight;
	var numberOfLines = Math.floor(lScrollHeight/lLineHeight);
	if(numberOfLines >= w.log.options.maxLogLines) {
		var lSplitted = w.log.eLog.html().split("<br>");
		
		var lHtml = "";
		$(lSplitted).each(function(aIndex, aElement){
			var lLines = 10;
			if(w.log.options.linesToDelete){
				lLines = w.log.options.linesToDelete;
			}
			if(aIndex > lLines){
				lHtml += aElement+"<br>";
			}
		});
		w.log.eLog.html(lHtml);
	}
	w.log.eLog.scrollTop(w.log.eLog.get(0).scrollHeight - w.log.eLog.get(0).clientHeight);
}