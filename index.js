/*
 * pullRefresh - v1.0 - 2015-05-05
 * 
 * 简易版下拉刷新插件
 * https://github.com/qiangspecial/mobile.ui
 *
 * Copyright (c) 2015 Jinbo 
 *
 * Mail: qiangspecial@qq.com
 */


var PullRefresh = (function($) {
	var _option = {
		pullWrap: null,
		pullContent: '#pullRefreshContent',
		txt: {
			refreshing: "加载中...",
			refreshTips: "下拉刷新",
			canRefresh: "释放即可刷新",
			refreshError: "加载出错，请重试！"
		},
		callback: null
	}

	// 下拉刷新
	function PullRefresh(o) {
		this.o = $.extend(_option, o);

		this.init();
	}
	
	PullRefresh.prototype = {
		constructor: PullRefresh,

		// 更新 pullBar 的状态
		updatePullBar: function(status) {
			var txts = this.o.txt,
				txt;

			switch(status) {
				case 1:
					txt = txts.refreshTips;
					break;
				case 2:
					txt = txts.canRefresh;
					break;
				case 3:
					txt = txts.refreshing
					this.$pullContent.addClass("transition").css("transform", "translateY(" + 50 + "px)");
					break;
				case 4:
					txt = txts.refreshError;
			}
			
			this.pull.status = status;
			this.$pullBar.html(txt);
		},

		// 隐藏pullBar
		hidePullBar: function() {

			this.$pullContent.addClass("transition").css("transform", "translateY(0)");
		},

		// 停止 pullBar 运动, 更新 pull.translateY
		stopPullBar: function() {
			var translateY = +getComputedStyle(this.$pullContent[0]).transform.match(/((\d*\.)?\d*)\)/)[1];
			// TODO 
			this.$pullContent.css("transform", "translateY(" + translateY + "px)").removeClass("transition");
			this.pull.translateY = translateY;
			// console.log(this.pull.translateY);
			// console.log(this.$pullContent.css("transform"))
			// console.log(getComputedStyle(this.$pullContent[0]).transform);
		},


		// 更新视图
		// pullBar translate 数值为 touchmove 的一半
		updatePullView: function(e) {
			var pull = this.pull,
				moveY = e.changedTouches[0].clientY - pull.startY,
				translateY = moveY/2 + pull.translateY;

			// pullDowning 
			// 禁止默认事件
			if (translateY > 0) {
				e.preventDefault();
				pull.isPulling = true;
				this.$pullContent.css("transform", "translateY(" + translateY + "px)");
			} else {
				this.$pullContent.css("transform", "translateY(" + 0 + "px)");
			}

			this.updatePullStatus(translateY);
		},

		updatePullStatus: function(translateY) {
			var status = 0;

			if (translateY > 0 && translateY < 50) {
				status = 1;
			} else if (translateY >= 50) {
				status = 2;
			}

			if (this.pull.status != status) {
				this.updatePullBar(status);
			}
		},

		// pull的状态
		pull: {
			// touchstart时的clientY
			startY: 0,
			// 是否pulling
			isPulling: false,
			translateY: 0,
			// status 表示pullBar当前处于的状态
			// 1: refreshTips: "下拉刷新",
			// 2: canRefresh: "释放即可刷新",
			// 3: refreshing: "加载中...",
			// 4: refreshError: "加载出错，请重试！"
			status: 0
		},
 
		// 绑定事件
		onEvent: function() {
			var _this = this,
				pull = _this.pull;

			this.$pullWrap.on("touchstart", function(e) {

				// 更新startY
				// pulling 则停止pullBar
				pull.startY = e.touches[0].clientY;
				if (pull.isPulling) {
					_this.stopPullBar();
				}
			}).on("touchmove", function(e) {

				// 是否满足 pullRefresh 条件
				if (_this.$pullWrap.scrollTop() === 0) {
					_this.updatePullView(e);
				}
			}).on("touchend", function(e) {

				if (pull.status == 2) {
					_this.updatePullBar(3);
					_this.o.callback();
					// _this.hidePullBar();
				} else if (pull.status != 3) {
					_this.hidePullBar();
				}
				// 隐藏pullBar
			});

			// pull状态结束, 初始化pull
			this.$pullContent.on("webkitTransitionEnd", function() {
				console.log("webkitTransitionEnd");

				if (pull.status < 3) {
					pull.isPulling = false;
					pull.translateY = 0;
				}
				_this.$pullContent.removeClass("transition");
			});
		},

		// 初始化
		init: function() {
			var o = this.o;

			this.$pullWrap = $(o.pullWrap);
			this.$pullContent = $(o.pullContent).prepend('<div class="refreshBar">下拉刷新</div>');
			this.$pullBar = this.$pullContent.find(".refreshBar");
			this.onEvent();
		}
	}

	return PullRefresh;
}(Zepto));


var pull = new PullRefresh({
	pullWrap: "#wrapper",
	pullContent: '#container',
	txt: {
		refreshing: "加载中...",
		refreshTips: "下拉刷新",
		canRefresh: "释放即可刷新",
		refreshError: "加载出错，请重试！"
	},
	callback: function() {
		console.log("ajax");
		setTimeout(function() {
			// pull.hidePullBar();	
		}, 3000);
	}
});