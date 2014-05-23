

define('js/main',['bui/common','bui/module','bui/layout','bui/grid','bui/data','bui/tree','bui/imgview','bui/list','bui/tooltip'],function(r){
  var BUI = r('bui/common'),
    Module = r('bui/module'),
    Layout = r('bui/layout'),
    List = r('bui/list'),
    Imgview = r('bui/imgview'),
    Tooltip = r('bui/tooltip'),
    Tree = r('bui/tree');



  function Main(config){
    Main.superclass.constructor.call(this, config);
  }

  BUI.extend(Main, Module);

  BUI.augment(Main, {
    /**
     * Module执行顺序
     * this._initData();
     * this._initDom();
     * this._initModules();
     * this._initEvent();
     * this.set('hasInit',true);
     */
    _initData: function(){
    },
    _initDom: function(){
      this.__initLayout();
      this.__initViewContent();
      this.__initCenterSize(this);
      this.__initTree();
      this.__initTab();
    },
    _initEvent: function(){
      this.__initResize();
      this.__initKeyMaster();
      this.__initMousewheel();
      this.__initTreeEvent();
    },
    __initLayout: function(){
      var _self = this;
      var layout = new Layout.Viewport({
        elCls: 'ext-border-layout',
        children: [{
          layout: {
            region: 'north',
            height: _self.get('northHeight')
          },
          xclass: 'controller',
          content: $(".north")
        },
        {
          layout: {
            region: 'west',
            fit: 'both',
            collapsable: false,
            width: _self.get('westWidth')
          },
          xclass: 'controller',
          content: $(".west")
        },{
          layout: {
            region: 'center',
            fit: 'both'
          },
          xclass: 'controller',
          content: $(".center")
        }],
        plugins: [Layout.Border],
        autoRender: true
      });
      this.set('layout', layout);
    },
    __initViewContent: function(){
      var _self = this,
        viewContents = _self.get('viewContents'),
        viewContentCfg = _self.get('viewContentCfg'),
        defaultImgs = _self.get('defaultImgs'),
        activeImgView = _self.get('activeImgView'),
        viewWraps = _self.get('viewWraps');
      for(var i = 0 ; i < viewWraps.length ; i ++){

        var viewWrap = viewWraps[i];
        viewContents.push(new Imgview.ViewContent(BUI.mix(viewContentCfg, {
          width: viewWrap.width(),
          height: viewWrap.height(),
          render: viewWrap,
          imgSrc: _self.get('imgSrc' + i),
          autoRender: true
        })))
      }

      _self.set('viewContents', viewContents);
    },
    __initCenterSize: function(_self, wrapModel){
      var imgviewWrap = _self.get('imgviewWrap'),
        viewContents = _self.get('viewContents'),
        wrapModel = typeof wrapModel === "number" ? wrapModel: _self.get('wrapModel'),
        centerWrap = $(_self.get('centerWrap')),
        previewListHeight = _self.get('previewListHeight'),
        centerWdith = centerWrap.width(),
        centerHeight = centerWrap.height(),
        cls = imgviewWrap.attr("class"),
        viewWraps = _self.get('viewWraps');

      imgviewWrap.height(centerHeight - previewListHeight);
      for(var i = 0 ; i < viewWraps.length ; i ++){
        var viewWrap = viewWraps[i];
        var viewContent = viewContents[i];
        if (wrapModel >= i) {
          viewWrap.show();
        } else {
          viewWrap.hide();
        }
        var viewWrapWidth = parseInt(centerWdith / (wrapModel + 1)) - 4;
        var viewWrapHeight = centerHeight - previewListHeight - 4;
        viewWrap.width(viewWrapWidth).height(viewWrapHeight);
        viewContent.set('width', viewWrapWidth);
        viewContent.set('height', viewWrapHeight);
      }

      _self.set('centerWrap', centerWrap);
    },
    __initTree: function(){
      var _self = this,
        nodes = _self.get('nodes');

      var tree = new Tree.TreeList({
        render: '.west',
        nodes: nodes,
        // showLine: true,
        // expandAnimate: true,
        autoRender: true
      });

      _self.set('tree', tree);
    },
    __initSimpleList: function(){
      var _self = this,
        list = new List.SimpleList({
          elCls: _self.get('listCls'),
          render: _self.get('previewListWrap'),
          itemTpl: _self.get('itemTpl'),
          autoRender: true
        });

      list.get('el').find("ul").addClass("clearfix");
      _self.set('list', list);
    },
    __initResize: function(){
      var _self = this,
        centerWrap = _self.get('centerWrap');

      centerWrap.resize(function(){
        _self.__initCenterSize(_self);
      });
      if(screenfull.enabled){
        $(window).resize(function(){
          var centerWrap = $(".x-border-center");
          if (!screenfull.isFullscreen) {
            centerWrap.css({
              zIndex: 0,
              width: "",
              height: "",
              left: 0,
              top: 0
            })
          }else{
            centerWrap.css({
              zIndex: 1000,
              width: screen.width,
              height: screen.height + _self.get('previewListHeight'),
              left: -_self.get('westWidth') - 1,
              top: -_self.get('northHeight')
            })
          }
        })
      }
    },
    // 绑定键盘事件
    __initKeyMaster: function(){
      var _self = this,
        keyCommands = _self.get('keyCommands');

      for(keyName in keyCommands){
        (function(keyName, cmd){
          if (typeof cmd === "function") {
            key(keyName, function(){
              cmd(_self.__getKeyTarget(),_self);
              return false;
            })
          } else {
            key(keyName, function(){
              _self.__getKeyTarget()[cmd]();
              return false;
            })
          }
        })(keyName, keyCommands[keyName])
      }
    },
    __initMousewheel: function(){
      var _self = this,
        viewWraps = _self.get('viewWraps'),
        viewContents = _self.get('viewContents');

      for(var i = 0 ; i < viewWraps.length ; i ++){
        var viewWrap = viewWraps[i];
        (function(index, viewWrap, viewContent){
          viewWrap.mousewheel(function(event, delta){
            if(_self.get('canMove')){
              _self.set('canMove', false);
              setTimeout(function(){
                _self.set('canMove', true);
              },300)
              if (delta > 0) {
                viewContent.zoom(function(){
                  _self.set('canMove', true);
                });
              } else if (delta < 0) {
                viewContent.micrify(function(){
                  _self.set('canMove', true);
                });
              }
            }
            event.stopPropagation();
            event.preventDefault();
          })
        })(i, viewWraps[i], viewContents[i])
      }
      $(document).mousewheel(function(event, delta){
        viewContent = viewContents[_self.get('activeImgView')];
        if(_self.get('canMove')){
          _self.set('canMove', false);
          setTimeout(function(){
            _self.set('canMove', true);
          },300)
          if (delta > 0) {
            viewContent.zoom(function(){
              _self.set('canMove', true);
            });
          } else if (delta < 0) {
            viewContent.micrify(function(){
              _self.set('canMove', true);
            });
          }
        }
      })
    },
    __initTreeEvent: function(){
      var _self = this,
        list = _self.get('list'),
        tree = _self.get('tree');

      tree.on('itemclick',function(ev){
        var item = ev.item,
          treeImgList = _self.get('treeImgList'),
          activeImgView = _self.get('activeImgView'),
          imgList = [];

        if (item.leaf) {
          if (treeImgList === undefined || treeImgList === [] || (treeImgList.indexOf(item) == -1)) {
            treeImgList = [];
            for(var i = 0 ; i < item.parent.children.length ; i ++){
              var it = item.parent.children[i];
              if(it.leaf){
                imgList.push({
                  src: it.src,
                  miniSrc: it.miniSrc
                })
                treeImgList.push(it);
              }
            }
            // treeImgList = item.parent.children;
            _self.set('treeImgList', treeImgList);
            _self.set('imgList', imgList);
          } else {
            imgList = _self.get('imgList');
          }
          var index = treeImgList.indexOf(item);
          _self.set('selected', index);
          _self._previewListScroll(index);
        } else {
          treeImgList = [];
          for(var i = 0 ; i < item.children.length ; i ++){
            var it = item.children[i];
            if(it.leaf){
              imgList.push({
                src: it.src,
                miniSrc: it.miniSrc
              })
              treeImgList.push(it);
            }
          }
          _self.set('selected', 0);
          _self.set('treeImgList', treeImgList);
          imgList.length && _self.set('imgList', imgList);
        }
      });
    },
    __getKeyTarget: function(){
      var activeImgView = this.get('activeImgView');
      return this.get('viewContents')[activeImgView];
    },
    _previewListScroll: function(index){
      $("#preview-list-wrap").scrollLeft(this.get('itemWidth') * (index + 1) + 20 - $("#preview-list-wrap").width());
    },
    _setTreeSelect: function(v){
      var _self = this,
        tree = _self.get('tree'),
        treeImgList = _self.get('treeImgList');

      treeImgList && tree.setSelected(treeImgList[v]);
    },
    _paintPrev: function(){
      var _self = this,
        imgListLength = _self.get('imgList').length,
        index = (_self.get('selected') + imgListLength - 1) % imgListLength;

      _self.set('selected', index);
      _self._previewListScroll(index);
    },
    _paintNext: function(){
      var _self = this,
        index = (_self.get('selected') + 1) % _self.get('imgList').length;

      _self.set('selected', index);
      _self._previewListScroll(index);
    },
    __initTab: function(){
      var _self = this;
      // 初始化tab点击事件
      _self.get('tabs').on('click',function(ev){
        var index = $(this).index();
        _self.set('tabIndex', index);
        _self.set('wrapModel', index);
        _self.set('activeImgView', index);
        return false;
      });

      $(".imgview-content").on('click',function(ev){
        ev.preventDefault();
        var self = $(this);
        _self.set('activeImgView', self.index());
      });

      $(".btn-cmd-group a").on('click',function(ev){
        ev.preventDefault();
        var self = jQuery(this),
          cmd = self.data("cmd");

        if (cmd.substr(0,1) == "_") {
          _self[cmd]();
        } else {
          _self.get('viewContents')[_self.get('activeImgView')][cmd]();
        }
      });

      var tips = new Tooltip.Tips({
        tip: {
          trigger: '.btn-group-item', //出现此样式的元素显示tip
          alignType: 'bottom-left', //默认方向
          elCls: 'tips',
          // titleTpl: '<div class="tips-content">{title}</div>',
          offset: 10 //距离左边的距离
        }
      });
      tips.render();


    },
    _fullScreen: function(){
      screenfull.enabled && screenfull.toggle();
    }

  });

  Main.ATTRS = {
    imgviewWrap: {
      value: $("#imgview-wrap")
    },
    keyCommands: {
      value: {
        "q": "leftHand",
        "e": "rightHand",
        "w": "zoom",
        "s": "micrify",
        "r": "reset",
        "f": "fitToggle",
        "x": function(target, _self){
          _self.set('selected', _self.get('selected'));
        },
        "a,left,up": function(target, _self){
          _self._paintPrev();
        },
        "d,right,down": function(target, _self){
          _self._paintNext();
        },
        "1": function(target, _self){
          _self.get('tabs').eq(0).click();
        },
        "2": function(target, _self){
          _self.get('tabs').eq(1).click();
        },
        "3": function(target, _self){
          _self.get('tabs').eq(2).click();
        },
        "`,tab": function(target, _self){
          _self.set('activeImgView', (_self.get('activeImgView') + 1) % (_self.get('wrapModel') + 1));
        },
        "g": function(target, _self){
          _self._fullScreen();
        }
      }
    },
    centerWrap: {
      value: ".x-border-center"
    },
    tabs: {
      value: $(".btn-group .btn-tabs")
    },
    viewWraps: {
      value: [$("#imgview-content-1"), $("#imgview-content-2"), $("#imgview-content-3")]
    },
    viewContents: {
      value: []
    },
    tabIndex: {
      value: 0,
      setter: function(v){
        var tabs = this.get('tabs');
        tabs.removeClass("btn-group-active");
        tabs.eq(v).addClass("btn-group-active");
        return v;
      }
    },
    cookieReg: {
      value: "FinderCookie"
    },
    wrapModel: {
      value: 0,
      setter: function(v){
        if(this.get('hasInit')){
          this.__initCenterSize(this, v);
        }
        this.set('tabIndex', v);
        $.cookie("wrapModel" + this.get('cookieReg'), v);
        return v;
      }
    },
    activeImgView: {
      value: 0,
      setter: function(v){
        var _self = this,
          viewWraps = _self.get('viewWraps');

        $(".imgview-content-inner").removeClass("imgview-content-active");
        viewWraps[v].addClass("imgview-content-active");
        $.cookie("activeImgView" + this.get('cookieReg'), v);
        return v;
      }
    },
    // 北部的高度
    northHeight: {
      value: 55
    },
    // 左边的宽度
    westWidth: {
      value: 250
    },
    previewListHeight: {
      value: 120,
      setter: function(v){
        $(".preview-list-wrap").height(v);
        return v;
      }
    },
    viewContentCfg: {
      value: {
        // 以下属性全部可以set来修改。
        imgSrc: "https://s.tbcdn.cn/g/fi/act/finder/img/hello.png",
        rotateTime: 300, // 旋转时间,默认300
        scaleTime: 300, // 缩放时间,默认300
        overflowSize: 100, // 边界回弹像素,默认100,实际上是取Math.min(overflowSize,imgNowWidth,imgNowHeight)
        drag: true //是否可以拖动，默认为true
      }
    },
    // 树形结构点击的时候取得的数据。
    imgListSource: {
      value: "imgList.htm"
    },
    previewList: {
      value: $(".previewList")
    },
    // previewList渲染参数
    previewListWrap: {
      value: $("#preview-list-wrap")
    },
    listCls:{
      value: "previewList"
    },
    itemWidth: {
      value: 114
    },
    itemHeight: {
      value: 86
    },
    itemTpl: {
      value: '<li class="preview-item"></li>'
    },
    imgList: {
      value: [],
      setter: function(imgList){
        if(imgList.length){
          var _self = this,
            previewList = _self.get('previewList'),
            activeImgView = _self.get('activeImgView'),
            itemWidth = _self.get('itemWidth'),
            itemHeight = _self.get('itemHeight'),
            selected = _self.get('selected'),
            list = _self.get('list');

          if (!_self.get('hasInit')) {
            _self.__initSimpleList();
            list = _self.get('list');
          }
          list.set('items', imgList);
          list.get('el').find("ul").width(imgList.length * itemWidth)
          list.get('el').find("li").each(function(i){
            $(this).width(itemWidth - 4).height(itemHeight - 4).loadCenterImg(imgList[i].miniSrc);
          }).on('click',function(ev){
            ev.preventDefault();
            _self.set('selected', $(this).index());
          });

          var delayTimeout;
          list.get('el').find("li").hover(function(){
            if(_self.get('previewTrigger') === "hover"){
              var self = $(this);
              clearInterval(delayTimeout);
              delayTimeout = setTimeout(function(){
                var index = self.index();
                _self.set('selected', index);
                _self._previewListScroll(index);
              }, _self.get('hoverDelay'));
            }
          });



          // 初始化进来是读取cookie的信息
          if (!_self.get('hasInit')) {
            list.setSelected(imgList[_self.get('selected')]);
          } else {
            // 渲染之后的imgList切换默认读取第一张图片
            list.setSelected(imgList[0]);
            _self.set('imgSrc' + activeImgView, imgList[0].src);
          }
          $.cookie("imgList" + this.get('cookieReg'), $.stringify(imgList));
        }
        return imgList;
      }
    },
    selected: {
      value: 0,
      setter: function(v){
        if (this.get('hasInit')) {
          var _self = this,
            list = _self.get('list'),
            imgList = _self.get('imgList'),
            activeImgView = _self.get('activeImgView');

          list.setSelected(imgList[v]);
          _self.set('imgSrc' + activeImgView, imgList[v].src);
          _self._setTreeSelect(v);
        }
        $.cookie("selected" + this.get('cookieReg'), v);
        return v;
      }
    },
    canMove: {
      value: true
    },
    // 默认3个imgview显示的图片
    imgSrc0: {
      value: "https://s.tbcdn.cn/g/fi/act/finder/img/hello.png",
      setter: function(v){
        if (this.get('hasInit')) {
          this.get('viewContents')[0].set('imgSrc', v);
        }
        $.cookie("imgSrc0" + this.get('cookieReg'), v);
        return v;
      }
    },
    imgSrc1: {
      value: "https://s.tbcdn.cn/g/fi/act/finder/img/hello.png",
      setter: function(v){
        if (this.get('hasInit')) {
          this.get('viewContents')[1].set('imgSrc', v);
        }
        $.cookie("imgSrc1" + this.get('cookieReg'), v);
        return v;
      }
    },
    imgSrc2: {
      value: "https://s.tbcdn.cn/g/fi/act/finder/img/hello.png",
      setter: function(v){
        if (this.get('hasInit')) {
          this.get('viewContents')[2].set('imgSrc', v);
        }
        $.cookie("imgSrc2" + this.get('cookieReg'), v);
        return v;
      }
    },
    previewTrigger:{
      value: "click"
    },
    hoverDelay: {
      value: 0
    }
  }


  return Main;

})
