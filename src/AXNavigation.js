var AXNavigation = (function(){
	function klass(){


		(function(){
			this.config = {
				animateTime: 300
			};
			this.isCordova = (window.cordova) ? true : false;
		}).apply(this, arguments);

		var _this = this;
		var cfg = this.config;
		this.position = 0;
		this.content_stack = [];
		this.animating = false;

		this.set_config = function (cfg, call_init) {
			$.extend(this.config, cfg, true);
			/**
			 * this.config.
			 * content_wrapper_class_name : "content-wrapper"
			 * navigation_bar: $("#app-navagation-bar")
			 * aside_left: $("#app-aside-left")
			 * aside_right: $("#app-aside-right")
			 * content_container: $("#app-container")
			 */

			this.config.navigation_bar.bind("touchstart.axnavigation", function(){
				_this.scroll_top(0);
			});

			return this;
		};

		//
		this.open = function(form, target, option){
			if(this.animating) return this;
			this.animating = true;
			var position = this.position;
			if(target == "right"){
				position++;
			}
			var div = $('<div class="' + cfg.content_wrapper_class_name + '" id="axn-content-'+form.objectName+'" data-content-target="' + target + '" data-content-position="' + position + '"></div>');

			// 컨텐츠 로드

			if(target == "_main"){
				cfg.content_container.empty();
				cfg.content_container.append(div);

				this.content_stack = [];
				this.content_stack.push(cfg.content_container.find("#axn-content-" + form.objectName));

				$.get(form.url, function (data) {
					div.append(data);
					if(window[form.objectName]){
						window[form.objectName][form.startFunction]();
					}
				});

			}
			else if(target == "_right")
			{
				cfg.content_container.append(div);
				this.content_stack.push(cfg.content_container.find("#axn-content-" + form.objectName));
				this.content_stack[this.content_stack.length-2].addClass("slide-out-left");
				this.content_stack[this.content_stack.length-1].addClass("slide-in-right");

				this.position = position;
				$.get(form.url, function (data) {
					div.append(data);
					if(window[form.objectName]){
						window[form.objectName][form.startFunction]();
					}
				});
			}

			setTimeout((function(){
				this.animating = false;

				this.content_stack[this.content_stack.length-1].removeClass("slide-in-right");
			}).bind(this), cfg.animateTime);
		};

		this.close = function(form){
			if(this.animating) return this;
			this.animating = true;
			this.content_stack[this.content_stack.length-2].removeClass("slide-out-left").addClass("slide-in-left");
			this.content_stack[this.content_stack.length-1].removeClass("slide-in-right").addClass("slide-out-right");

			setTimeout((function () {
				this.content_stack[this.content_stack.length-2].removeClass("slide-in-left");
				this.content_stack[this.content_stack.length-1].remove();
				this.content_stack.pop();

				if(window[form.objectName]){
					delete window[form.objectName];
				}
				this.animating = false;
			}).bind(this), cfg.animateTime);
		};

		this.scroll_top = function(top){
			if(this.animating) return this;
			_this.animating = true;

			var content = this.content_stack[this.content_stack.length-1];
			content.css({"-webkit-overflow-scrolling":"none", "overflow":"hidden"});
			content.stop().animate({scrollTop: top}, cfg.animateTime, 'swing', function () {
				_this.animating = false;
				content.css({"-webkit-overflow-scrolling":"touch", "overflow":"auto"});
			});
		};
	}

	return klass;
})();