var AXNavigation = (function () {

	function get_event_target(target, cond) {
		var _target = target;
		if (_target) {
			while ((function () {
				var result = true;
				if (cond) {
					result = cond(_target);
				}
				return !result;
			})()) {
				if (_target.parentNode) {
					_target = _target.parentNode;
				} else {
					_target = false;
					break;
				}
			}
		}
		return _target;
	}

	var e_click = ('ontouchstart' in window) ? "touchstart" : "click";

	function klass() {

		(function () {
			this.config = {
				animateTime: 300,
				addon_back: {
					html: '<i class="icon-dp-back"></i>'
				}
			};
			this.isCordova = (window.cordova) ? true : false;
		}).apply(this, arguments);

		var _this = this;
		var cfg = this.config;
		this.position = 0;
		this.content_stack = [];
		this.animating = false;
		this.aside_opend = false;

		this.set_config = function (cfg, call_init) {
			$.extend(this.config, cfg, true);
			/**
			 * this.config.
			 * content_wrapper_class_name : "content-wrapper"
			 * tool_bar: $("#app-tool-bar")
			 * aside_left: $("#app-aside-left")
			 * aside_right: $("#app-aside-right")
			 * content_container: $("#app-container")
			 */

			/*
			 this.config.tool_bar.bind("touchstart.axnavigation", function(){
			 _this.scroll_top(0);
			 });
			 */

			return this;
		};

		this.open_header = function (form) {
			var header_jdom;
			var po = [];
			po.push('<div class="bar-wrapper" id="axn-navigation-' + form.objectName + '">');

			if (form.header.title) {
				po.push('<div class="bar-title">' + form.header.title + '</div>');
			}

			if(this.content_stack.length > 1) {
				po.push('<div class="bar-addon left" data-header-btn="back">' + cfg.addon_back.html
					+ '<span class="label">' + this.content_stack[this.content_stack.length-2].form.header.title + '</span>'
					+ '</div>');
			}

			if (form.header.addon) {
				for (var i = 0, l = form.header.addon.length, addon; i < l; i++) {
					addon = form.header.addon[i];
					po.push('<div class="bar-addon ' + addon.type + '" data-header-btn="' + i + '">' + addon.html + '</div>');
				}
			}
			po.push('<div style="clear: both;"></div>');
			po.push('</div>');

			if(this.content_stack.length < 2) {
				//cfg.tool_bar.find(".bar-wrapper").addClass("fadeOut");
				cfg.tool_bar.html(po.join(''));
				header_jdom = cfg.tool_bar.find('#axn-navigation-' + form.objectName);
			}else{
				this.content_stack[this.content_stack.length-2].header_jdom.removeClass("slide-in-right").addClass("slide-out-left");
				cfg.tool_bar.append(po.join(''));
				header_jdom = cfg.tool_bar.find('#axn-navigation-' + form.objectName);
				header_jdom.addClass("slide-in-right")
			}

			var stack = this.content_stack[this.content_stack.length-1];
			stack.header_jdom = header_jdom;
			stack.header_jdom
				.find('[data-header-btn]')
				.bind(e_click, function (e) {
				var target = get_event_target(e.target, function (el) {
					return (el.getAttribute("data-header-btn") != null);
				});
				if (target && !_this.aside_opend) {
					var addon_index = target.getAttribute("data-header-btn");
					if(addon_index == "back"){
						var that = {
							form: form
						}
						if(cfg.addon_back.onclick) cfg.addon_back.onclick.call(that,  that);
						else {
							_this.close(form);
						}
					}
					else{
						if (form.header.addon[addon_index].onclick) {
							var that = {
								form: form,
								item: form.header.addon[addon_index]
							};
							form.header.addon[addon_index].onclick.call(that, that);
						}
					}
					return false;
				}
			});

		};

		//
		this.open = function (form, target, option) {
			if (this.animating) return this;
			if (this.aside_opend) return this;

			this.animating = true;
			var position = this.position;
			if (target == "right") {
				position++;
			}
			var div = '<div class="' + cfg.content_wrapper_class_name + '" id="axn-content-' + form.objectName + '" data-content-target="' + target + '" data-content-position="' + position + '"></div>', jdom;

			// 컨텐츠 로드

			if (target == "_main") {

				cfg.content_container.empty();
				cfg.content_container.append(div);
				jdom = cfg.content_container.find("#axn-content-" + form.objectName);

				// todo : 지우기 전에 초기화
				for (var i = 0, l = this.content_stack.length; i < l; i++) {
					this.content_stack[i].jdom.remove();
					if (window[this.content_stack[i].form.objectName]) {
						delete window[this.content_stack[i].form.objectName];
					}
				}

				this.content_stack = [];
				this.content_stack.push({
					form: form,
					jdom: jdom
				});
				// make tool_bar
				if (form.header) {
					// after push content_stack
					this.open_header(form);
				}

				$.get(form.url, function (data) {
					jdom.append(data);
					if (window[form.objectName]) {
						window[form.objectName][form.startFunction]();
					}
				});

			}
			else if (target == "_right") {
				cfg.content_container.append(div);
				jdom = cfg.content_container.find("#axn-content-" + form.objectName);

				this.content_stack.push({
					form: form,
					jdom: jdom
				});
				this.content_stack[this.content_stack.length - 2].jdom.addClass("slide-out-left");
				this.content_stack[this.content_stack.length - 1].jdom.addClass("slide-in-right");

				this.position = position;

				// make tool_bar
				if (form.header) {
					// after push content_stack
					this.open_header(form);
				}

				$.get(form.url, function (data) {
					jdom.append(data);
					if (window[form.objectName]) {
						window[form.objectName][form.startFunction]();
					}
				});
			}

			setTimeout((function () {
				this.animating = false;
				if (target == "_right") {
					this.content_stack[this.content_stack.length - 2].jdom.hide();
					this.content_stack[this.content_stack.length - 1].jdom.removeClass("slide-in-right");
				}
			}).bind(this), cfg.animateTime);
		};

		this.close = function (form) {
			if (this.animating) return this;
			this.animating = true;
			this.content_stack[this.content_stack.length - 2].jdom.show().removeClass("slide-out-left").addClass("slide-in-left");
			this.content_stack[this.content_stack.length - 1].jdom.removeClass("slide-in-right").addClass("slide-out-right");

			this.content_stack[this.content_stack.length - 2].header_jdom.show().removeClass("slide-out-left").addClass("slide-in-left");
			this.content_stack[this.content_stack.length - 1].header_jdom.removeClass("slide-in-right").addClass("slide-out-right");

			setTimeout((function () {
				this.content_stack[this.content_stack.length - 2].jdom.removeClass("slide-in-left");
				this.content_stack[this.content_stack.length - 1].jdom.remove();
				this.content_stack[this.content_stack.length - 2].header_jdom.removeClass("slide-in-left");
				this.content_stack[this.content_stack.length - 1].header_jdom.remove();
				this.content_stack.pop();

				if (window[form.objectName]) {
					delete window[form.objectName];
				}
				this.animating = false;
			}).bind(this), cfg.animateTime);
		};

		this.scroll_top = function (top) {
			if (this.animating) return this;
			_this.animating = true;

			var content = this.content_stack[this.content_stack.length - 1].jdom;
			content.css({"-webkit-overflow-scrolling": "none", "overflow": "hidden"});
			content.stop().animate({scrollTop: top}, cfg.animateTime, 'swing', function () {
				_this.animating = false;
				content.css({"-webkit-overflow-scrolling": "touch", "overflow": "auto"});
			});
		};

		this.open_aside = function (type) {
			this.aside_opend = true;
			this.app_mask = $('<div class="app-content-mask"></div>')
			if (type == "aside_left") {
				cfg.aside_left.show();
				cfg.tool_bar.addClass("open-aside-left");
				cfg.content_container.addClass("open-aside-left");
				$(document.body).append(this.app_mask);
				this.app_mask.addClass("open-aside-left");
				this.app_mask.bind(e_click, function (e) {
					_this.close_aside("aside_left");
					e.preventDefault();
					e.stopPropagation();
					return false;
				});
			}
			else if (type == "aside_right") {
				cfg.aside_right.show();
				cfg.tool_bar.addClass("open-aside-right");
				cfg.content_container.addClass("open-aside-right");

				$(document.body).append(this.app_mask);
				this.app_mask.addClass("open-aside-right");
				this.app_mask.bind(e_click, function (e) {
					_this.close_aside("aside_right");
					e.preventDefault();
					e.stopPropagation();
					return false;
				});
			}

			cfg.tab_bar.addClass("slide-out-down");

			if(cfg.on_event){
				var that = {
					action: "open_aside",
					type: type
				};
				cfg.on_event.call(that, that);
			}
		};

		this.close_aside = function (type) {

			cfg.tool_bar.removeClass("open-aside-left").removeClass("open-aside-right");
			cfg.content_container.removeClass("open-aside-left").removeClass("open-aside-right");

			if (type == "aside_left") {
				cfg.tool_bar.addClass("close-aside-left");
				cfg.content_container.addClass("close-aside-left");
				this.app_mask.removeClass("open-aside-left").addClass("close-aside-left");
			}
			else if (type == "aside_right") {
				cfg.tool_bar.addClass("close-aside-right");
				cfg.content_container.addClass("close-aside-right");
				this.app_mask.removeClass("open-aside-right").addClass("close-aside-right");
			}

			cfg.tab_bar.removeClass("slide-out-down").addClass("slide-in-up");

			setTimeout((function () {
				cfg.aside_left.hide();
				cfg.aside_right.hide();
				this.app_mask.remove();
				cfg.tool_bar.removeClass("close-aside-left").removeClass("close-aside-right");
				cfg.content_container.removeClass("close-aside-left").removeClass("close-aside-right");
				cfg.tab_bar.removeClass("slide-in-up");
				this.aside_opend = false;
			}).bind(this), cfg.animateTime);

			if(cfg.on_event){
				var that = {
					action: "close_aside",
					type: type
				};
				cfg.on_event.call(that, that);
			}
		}
	}

	return klass;
})();