/**
 * 0920: this.content_stack 제거 this.content_tree 에서 자원관리
 */
var AXNavigation = (function() {

	function get_event_target(target, cond) {
		var _target = target;
		if (_target) {
			while ((function() {
				var result = true;
				if (cond) {
					result = cond(_target);
				}
				return !result;
			})())
			{
				if (_target.parentNode) {
					_target = _target.parentNode;
				}
				else {
					_target = false;
					break;
				}
			}
		}
		return _target;
	}

	var e_click = ('ontouchstart' in window) ? "touchstart" : "click";

	function klass() {

		(function() {
			this.config = {
				animateTime: 300,
				addon_back: {
					html: '<i class="icon-dp-back"></i>'
				},
				toolbar_previous_title_show: false
			};
			this.isCordova = (window.cordova) ? true : false;
		}).apply(this, arguments);

		var _this = this;
		var cfg = this.config;
		this.position = 0;

		/// content_stack 변경 작업 시작
		this.active_content_main = ""; // 현재 활성화 된 메인 form
		this.content_tree = {}; // form 트리

		this.animating = false;
		this.aside_opend = false;
		this.toolbar_status = "";

		this.set_config = function(cfg, call_init) {
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

			this.device_width = $(document.body).width();
			return this;
		};

		this.open_header = function(form, target, option, content, last_content) {
			var header_jdom;

			if (!cfg.tool_bar.find('#axn-navigation-' + form.objectName).get(0)) {
				var po = [];
				po.push('<div class="bar-wrapper" id="axn-navigation-' + form.objectName + '">');

				if (form.header.title) {
					po.push('<div class="bar-title">' + form.header.title + '</div>');
				}

				if (target == "_right") {
					po.push('<div class="bar-addon left" data-header-btn="back">' + cfg.addon_back.html);
					if (cfg.toolbar_previous_title_show)
						po.push('<span class="label">' + last_content.form.header.title + '</span>');
					po.push('</div>');
				}

				if (form.header.addon) {
					for (var i = 0, l = form.header.addon.length, addon; i < l; i++) {
						addon = form.header.addon[i];
						po.push('<div class="bar-addon ' + addon.type + '" data-header-btn="' + i + '">' + addon.html + '</div>');
					}
				}
				po.push('<div style="clear: both;"></div>');
				po.push('</div>');

				cfg.tool_bar.append(po.join(''));

				header_jdom = cfg.tool_bar.find('#axn-navigation-' + form.objectName);
				content.header_jdom = header_jdom;
				content.header_jdom
					.find('[data-header-btn]')
					.bind(e_click, function(e) {
						var target = get_event_target(e.target, function(el) {
							return (el.getAttribute("data-header-btn") != null);
						});
						if (target && !_this.aside_opend) {
							var addon_index = target.getAttribute("data-header-btn");
							if (addon_index == "back") {
								var that = {
									form: form
								}
								if (cfg.addon_back.onclick) cfg.addon_back.onclick.call(that, that);
								else {
									_this.close(form);
								}
							}
							else {
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
			}
			else {
				header_jdom = cfg.tool_bar.find('#axn-navigation-' + form.objectName);
			}

			header_jdom.attr("class", "bar-wrapper");
			if (target == "_main") {
				header_jdom.addClass("fade-in");
			}
			else if (target == "_right") {
				header_jdom.addClass("slide-in-right");
			}
			else {
				header_jdom.addClass("slide-in-" + option);
			}

			if (last_content) {
				last_content.header_jdom.attr("class", "bar-wrapper");
				last_content.header_jdom.addClass("slide-out-" + (option || "left"));
			}
		};

		this.check_tool_tab_bar = function(form) {
			if (typeof form.toolBar != "undefined") {
				if (form.toolBar) {
					cfg.tool_bar.addClass("show");
					if (this.toolbar_status == "slide-up") {
						cfg.tool_bar
							.removeClass("slide-out-up")
							.addClass("slide-in-down");
						this.toolbar_status = "";
					}
					if (cfg.on_event) {
						var that = {
							action: "show_toolBar",
							form: form
						};
						cfg.on_event.call(that, that);
					}
				}
				else {
					cfg.tool_bar.removeClass("show");
					if (cfg.on_event) {
						var that = {
							action: "unshow_toolBar",
							form: form
						};
						cfg.on_event.call(that, that);
					}
				}
			}
			if (typeof form.tabBar != "undefined") {
				if (form.tabBar) {
					cfg.tab_bar.addClass("show");
				}
				else {
					cfg.tab_bar.removeClass("show");
				}
			}
		};

		this.slide_up_toolbar = function() {
			if (this.toolbar_up_timer) clearTimeout(this.toolbar_up_timer);
			if (this.toolbar_down_timer) clearTimeout(this.toolbar_down_timer);
			if (this.toolbar_status != "slide-up") {
				this.toolbar_up_timer = setTimeout(function() {
					cfg.tool_bar
						.removeClass("slide-in-down")
						.addClass("slide-out-up");
				}, cfg.animateTime);
				this.toolbar_status = "slide-up";
			}
		};

		this.slide_down_toolbar = function() {
			if (this.toolbar_up_timer) clearTimeout(this.toolbar_up_timer);
			if (this.toolbar_down_timer) clearTimeout(this.toolbar_down_timer);

			if (this.toolbar_status != "slide-down") {
				cfg.tool_bar
					.removeClass("slide-out-up")
					.addClass("slide-in-down");
				this.toolbar_status = "slide-down";
			}

			/*
			 this.toolbar_down_timer = setTimeout(function(){
			 cfg.tool_bar
			 .removeClass("slide-out-up")
			 .addClass("slide-in-down");
			 }, cfg.animateTime);
			 */
		};

		//
		this.open = function(form, target, option) {
			if (this.animating) return this;
			if (this.aside_opend) return this;

			var last_content, last_content_out_effect, content;

			// 페이지가 2중으로 호출되는 상황 방지
			if (target == "_main" && this.active_content_main == form.objectName) return this;
			else if (target == "_right") {
				last_content = this.content_tree[this.active_content_main][this.content_tree[this.active_content_main].length - 1];
				if (last_content.objectName == form.objectName) return this;
			}

			this.check_tool_tab_bar(form);

			this.animating = true;
			var transitioning = false;

			//style="width:' + this.device_width + 'px;"
			var div, jdom;

			if (this.active_content_main == "" && target != "_main") target = "_main"; // 예외 오류 방지

			// 컨텐츠 로드
			if (target == "_main") {

				if (this.active_content_main != "" && this.content_tree[this.active_content_main].length > 0) {
					last_content = this.content_tree[this.active_content_main][this.content_tree[this.active_content_main].length - 1];
					last_content_out_effect = "";

					if (option == "fade") {
						last_content_out_effect = "fade-out";
					}
					else {
						last_content_out_effect = "slide-out-" + (option || "left");
					}
					last_content.jdom.attr("class", cfg.content_wrapper_class_name + (function() {
							return (last_content.form.className) ? " " + last_content.form.className : "";
						})());
					last_content.jdom.addClass(last_content_out_effect);
					if (last_content.header_jdom) {
						last_content.header_jdom.addClass(last_content_out_effect);
					}

					transitioning = true;
				}

				if (typeof this.content_tree[form.objectName] === "undefined") {

					div = '<div class="' + cfg.content_wrapper_class_name + ' ' + (form.className || "") + '" id="axn-content-' + form.objectName + '" data-content-target="' + target + '"></div>';
					cfg.content_container.prepend(div);

					jdom = cfg.content_container.find("#axn-content-" + form.objectName);
					if (transitioning) {
						jdom.addClass("fade-in");
					}

					content = {
						form: form,
						jdom: jdom
					};

					// make tool_bar
					if (form.header) {
						// after push content_stack
						this.open_header(form, target, option, content, last_content);
					}

					$.get(form.url, function(data) {
						jdom.append(data);
						if (window[form.objectName]) {
							window[form.objectName][form.startFunction]();
						}
					});

					jdom.bind("scroll", function(e) {
						//console.log(e);
						if (cfg.on_scroll) {
							var that = {
								form: form,
								scroll_top: e.target.scrollTop
							};
							cfg.on_scroll.call(that, that);
						}
					});
				}
				else {

					content = this.content_tree[form.objectName][0];
					content.jdom.attr("class", cfg.content_wrapper_class_name + (function() {
							return (form.className) ? " " + form.className : "";
						})());
					if (transitioning) {
						content.jdom.addClass("fade-in");
					}

					if (form.header) {
						// after push content_stack
						this.open_header(form, target, option, content, last_content);
					}

					if (window[form.objectName] && window[form.objectName].focus) {
						window[form.objectName].focus();
					}
				}

				///
			}
			else if (target == "_right") {

				div = '<div class="' + cfg.content_wrapper_class_name + ' ' + (form.className || "") + '" id="axn-content-' + form.objectName + '" data-content-target="' + target + '"></div>';
				cfg.content_container.append(div);
				jdom = cfg.content_container.find("#axn-content-" + form.objectName);

				content = {
					form: form,
					jdom: jdom
				};

				jdom.addClass("slide-in-right");

				// 직전 컨텐츠 이펙트 처리
				last_content = this.content_tree[this.active_content_main][this.content_tree[this.active_content_main].length - 1];
				last_content.jdom.attr("class", cfg.content_wrapper_class_name + (function() {
						return (last_content.form.className) ? " " + last_content.form.className : "";
					})());
				last_content.jdom.addClass("slide-out-left");
				if (last_content.header_jdom) {
					last_content.header_jdom.addClass("slide-out-left");
				}

				// make tool_bar
				if (form.header) {
					// after push content_stack
					this.open_header(form, target, false, content, last_content);
				}

				$.get(form.url, function(data) {
					jdom.append(data);
					if (window[form.objectName]) {
						window[form.objectName][form.startFunction]();
					}
				});
			}

			/// content_tree 정리
			setTimeout((function() {
				this.animating = false;
				if (target == "_main") {
					// this.active_content_main 에 속한 자식 아이템을 메인을 제외 하고 모두 정리

					var content_root = this.content_tree[this.active_content_main];
					if (content_root && content_root[0]) {
						content_root[0].jdom.removeClass("fade-in");
						for (var i = 1, l = content_root.length; i < l; i++) {
							content_root[i].jdom.remove();
							if (content_root[i].header_jdom) content_root[i].header_jdom.remove();
							if (window[content_root[i].form.objectName]) {
								delete window[content_root[i].form.objectName];
							}
						}
					}

					this.content_tree[form.objectName] = [content];
					this.active_content_main = form.objectName;
				}
				else if (target == "_right") {
					content.jdom.removeClass("slide-in-right");
					this.content_tree[this.active_content_main].push(content);
				}

			}).bind(this), cfg.animateTime);

			if (cfg.on_event) {
				var that = {
					action: "open",
					form: form
				};
				cfg.on_event.call(that, that);
			}
		};

		this.close = function(form) {
			if (this.animating) return this;
			if (this.active_content_main == "") return this;
			this.animating = true;

			var content_root = this.content_tree[this.active_content_main];
			var _form = content_root[content_root.length - 2].form;
			this.check_tool_tab_bar(_form);

			//this.content_stack[this.content_stack.length - 2].jdom.show().removeClass("slide-out-left").addClass("slide-in-left");
			content_root[content_root.length - 2].jdom.removeClass("slide-out-left").addClass("slide-in-left");
			content_root[content_root.length - 1].jdom.removeClass("slide-in-right").addClass("slide-out-right");
			if (form.header) {
				content_root[content_root.length - 2].header_jdom.removeClass("slide-out-left").addClass("slide-in-left");
				content_root[content_root.length - 1].header_jdom.removeClass("slide-in-right").addClass("slide-out-right");
			}

			setTimeout((function() {
				content_root[content_root.length - 2].jdom.removeClass("slide-in-left");
				content_root[content_root.length - 1].jdom.remove();
				if (form.header) {
					content_root[content_root.length - 2].header_jdom.removeClass("slide-in-left");
					content_root[content_root.length - 1].header_jdom.remove();
				}
				content_root.pop();

				if (window[form.objectName]) {
					delete window[form.objectName];
				}
				this.animating = false;
			}).bind(this), cfg.animateTime);
		};

		// 유지할 필요가 없는 컨텐츠를 정리
		this.remove_tree = function(names) {
			for (var ii = 0, ll = names.length; ii < ll; ii++) {
				var content_root = this.content_tree[names[ii]];
				console.log(content_root);
				if (content_root) {
					for (var i = 0, l = content_root.length; i < l; i++) {
						content_root[i].jdom.remove();
						if (content_root[i].header_jdom) content_root[i].header_jdom.remove();
						if (window[content_root[i].form.objectName]) {
							delete window[content_root[i].form.objectName];
						}
					}
				}
			}
		};

		this.scroll_top = function(top) {
			if (this.animating) return this;
			if (this.active_content_main == "") return this;
			_this.animating = true;

			var content_root = this.content_tree[this.active_content_main];
			var content = content_root[content_root - 1].jdom;
			content.css({"-webkit-overflow-scrolling": "none", "overflow": "hidden"});
			content.stop().animate({scrollTop: top}, cfg.animateTime, 'swing', function() {
				_this.animating = false;
				content.css({"-webkit-overflow-scrolling": "touch", "overflow": "auto"});
			});
		};

		this.open_aside = function(type) {
			this.aside_opend = true;
			this.app_mask = $('<div class="app-content-mask"></div>')
			if (type == "aside_left") {
				cfg.aside_left.show();
				cfg.tool_bar.addClass("open-aside-left");
				cfg.content_container.addClass("open-aside-left");
				$(document.body).append(this.app_mask);
				this.app_mask.addClass("open-aside-left");
				this.app_mask.bind(e_click, function(e) {
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
				this.app_mask.bind(e_click, function(e) {
					_this.close_aside("aside_right");
					e.preventDefault();
					e.stopPropagation();
					return false;
				});
			}

			cfg.tab_bar.addClass("slide-out-down");

			if (cfg.on_event) {
				var that = {
					action: "open_aside",
					type: type
				};
				cfg.on_event.call(that, that);
			}
		};

		this.close_aside = function(type) {

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

			setTimeout((function() {
				cfg.aside_left.hide();
				cfg.aside_right.hide();
				this.app_mask.remove();
				cfg.tool_bar.removeClass("close-aside-left").removeClass("close-aside-right");
				cfg.content_container.removeClass("close-aside-left").removeClass("close-aside-right");
				cfg.tab_bar.removeClass("slide-in-up");
				this.aside_opend = false;
			}).bind(this), cfg.animateTime);

			if (cfg.on_event) {
				var that = {
					action: "close_aside",
					type: type
				};
				cfg.on_event.call(that, that);
			}
		};

		this.reload = function() {
			if (this.active_content_main == "") return this;
			var content_root = this.content_tree[this.active_content_main];
			// todo : 지우기 전에 초기화
			var i = content_root.length - 1;
			var form = content_root[i].form;
			//this.content_stack[i].jdom.remove();
			if (window[content_root[i].form.objectName]) {
				delete window[content_root[i].form.objectName];
			}

			jdom = cfg.content_container.find("#axn-content-" + form.objectName);
			jdom.empty();
			$.get(form.url, function(data) {
				jdom.append(data);
				if (window[form.objectName]) {
					window[form.objectName][form.startFunction]();
				}
			});
		}

	}

	return klass;
})();