// ax5.ui.menu
(function(root, ax_super) {
	/**
	 * @class ax5.ui.menu
	 * @classdesc
	 * @version v0.0.1
	 * @author tom@axisj.com
	 * @logs
	 * 2014-04-21 tom : 시작
	 * @example
	 * ```
	 * var my_menu = new ax5.ui.menu();
	 * ```
	 */
	var U = ax5.util, axd = ax5.dom;

	//== UI Class
	var ax_class = function(){
		// 클래스 생성자
		this.main = (function(){
			if (ax_super) ax_super.call(this); // 부모호출
			this.config = {
				keys: {
					value:"value",
					text:"text",
					shortcut:"shortcut",
					data:"data",
					menu:"menu"
				}
			};

		}).apply(this, arguments);

		this.target = null;
		var cfg = this.config;
		/**
		 * Preferences of Menu UI
		 * @method ax5.ui.menu.set_config
		 * @param {Object} config - 클래스 속성값
		 * @returns {ax5.ui.menu}
		 * @example
		 * ```
		 * set_config({
		 *      target : {Element|AX5 nodelist}, // 메뉴 UI를 출력할 대상
		 *      keys : { // keys 는 menu ui 내부에서 사용되는 키값을 사용자가 변경 할 수 있는 환경설정값 이다. 개발환경에 맞게 커스트마이징 할 수 있다.
		 *          value: {String} ['value'] 메뉴의 값
		 *          text: {String} ['text'] 메뉴의 텍스트 라벨
		 *          shotcut: {String} ['shotcut'] 메뉴의 단축키
		 *          data: {String} ['data'],
		 *          menu: {String} ['menu'] 메뉴키 - 자식아이템도 이 키 값으로 인식한다.
		 *      },
		 *      menu : {Array} menu item
		 *      onclick: {Function} [onclick] - 메뉴 아이템 클릭이벤트 처리자
		 * });
		 * ```
		 */
			//== class body start
		this.init = function(){
			// after set_config();
			//console.log(this.config);
			if(!cfg.target || !cfg.menu){
				U.error("aui_menu_400", "[ax5.ui.menu] config.target, config.menu is required");
			}
			this.target = ax5.dom(cfg.target);
			this.print_list();
		};

		this.print_list = function(){
			var
				po = [],
				get_child_menu_html = function(_po_, _menu_, _depth_){
					_po_.push('<ul class="ax-item-group ax-item-group-depth-' + _depth_ + '">');
					for(var i= 0,l=_menu_.length;i<l;i++){
						_po_.push('<a class="ax-item" data-menu-item-index="'+ i +'">');
						_po_.push(_menu_[i][cfg.keys.text]);
						_po_.push('</a>');
						if(_menu_[i][cfg.keys.menu] && _menu_[i][cfg.keys.menu].length > 0){
							get_child_menu_html(_po_, _menu_[i][cfg.keys.menu], _depth_+1);
						}
					}
					_po_.push('</ul>');
				};

			get_child_menu_html(po, cfg[cfg.keys.menu], 0);

			this.target.html( po.join('') );
			this.target.find('[data-menu-item-index]').on("click", (function(e){
				this.onclick(e||window.event);
			}).bind(this));
		};

		this.onclick = function(e, target, index){
			target = axd.parent(e.target, function(target){
				if(ax5.dom.attr(target, "data-menu-item-index")){
					return true;
				}
			});
			if(target){
				index = axd.attr(target, "data-menu-item-index");
				if(this.config.onclick){
					this.config.onclick.call({
						menu: this.config[cfg.keys.menu],
						item: this.config[cfg.keys.menu][index],
						target: this.target.elements[0],
						item_target: target
					});
				}
			}
		};
	};
	//== UI Class

	//== ui class 공통 처리 구문
	if (U.is_function(ax_super)) ax_class.prototype = new ax_super(); // 상속
	root.menu = ax_class; // ax5.ui에 연결

	if (typeof define === "function" && define.amd) {
		define("_ax5_ui_menu", [], function () { return ax_class; }); // for requireJS
	}
	//== ui class 공통 처리 구문

})(ax5.ui, ax5.ui.root);