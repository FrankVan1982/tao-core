define([
    'jquery',
    'lodash',
    'tpl!tao/ui/contextualPopup/popup'
], function($, _, popupTpl){

    var _ns = '.contextual-popup';
    
    var _defaults = {
        controls : false
    };
    
    /**
     * Create an element selector reltive to the $anchor and contained in the $container
     * 
     * @param {JQuery} $anchor
     * @param {JQuery} $container
     * @param {Object} options
     * @param {JQuery|String} [options.content] - the inital content of the popup
     * @param {Boolean} [options.controls] - add cancel/done button
     * @returns {Object} the new selector instance
     */
    function create($anchor, $container, options){
        
        options = _.defaults(options, _defaults);
        
        //anchor must be positioned in css
        var positions = _computePosition($anchor, $container);
        var $element = $(popupTpl({
            popup : positions.popup,
            arrow : positions.arrow,
            controls : options.controls
        }));

        //only one 
        $anchor.find('.contextual-popup').remove();

        //attach the popup
        $anchor.append($element);
        $element.off(_ns).on('click' + _ns, '.done', function(){
            _done($element);
        }).on('click' + _ns, '.cancel', function(){
            _cancel($element);
        });
        
        if(options.content){
            setContent(options.content);
        }
        
        /**
         * Set the popup content
         * @param {JQuery|String} content
         * @returns {undefined}
         */
        function setContent(content){
            if(content instanceof $ || _.isString(content)){
                $element.find('.popup-content').empty().append(content);
            }
        }

        return {
            getPopup : function(){
                return $element;
            },
            setContent : setContent,
            reposition : function(){
                var pos = _computePosition($anchor, $container);
                $element.css({
                    top : pos.popup.top,
                    left : pos.popup.left
                });
                $element.children('.arrow').css('left', pos.arrow.left);
                $element.children('.arrow-cover').css('left', pos.arrow.leftCover);
            },
            activatePanel : function(groupName){
                activatePanel($element, groupName);
            },
            activateElement : function(qtiClass){
                activateElement($element, qtiClass);
            },
            done : function(){
                _done($element);
            },
            cancel : function(){
                _cancel($element);
            },
            hide : function(){
                _hide($element);
            },
            show : function(){
                $element.show();
                $element.trigger('show' + _ns);
            },
            destroy : function(){
                $element.remove();
                $element.trigger('destroy' + _ns);
            }
        };
    }

    /**
     * Hide
     * 
     * @param {JQuery} $element
     */
    function _hide($element){
        $element.hide();
        $element.trigger('hide' + _ns);
    }
    
    /**
     * Callback when the "done" button is clicked
     * 
     * @param {JQuery} $element
     */
    function _done($element){
        _hide($element);
        $element.trigger('done' + _ns);
    }

    /**
     * Callback when the "cancel" button is clicked
     * 
     * @param {JQuery} $element
     */
    function _cancel($element){
        _hide($element);
        $element.trigger('cancel' + _ns);
    }

    /**
     * Calculate the position of the popup and arrow relative to the anchor and container elements
     * 
     * @param {JQuery} $anchor
     * @param {JQuery} $container
     * @returns {Object} - Object containing the positioning data
     */
    function _computePosition($anchor, $container){

        var popupWidth = 500;
        var arrowWidth = 6;
        var marginTop = 15;
        var marginLeft = 15;
        var _anchor = {top : $anchor.offset().top, left : $anchor.offset().left, w : $anchor.innerWidth(), h : $anchor.innerHeight()};
        var _container = {top : $container.offset().top, left : $container.offset().left, w : $container.innerWidth()};
        var _popup = {
            top : _anchor.h + marginTop,
            left : -popupWidth / 2 + _anchor.w / 2,
            w : popupWidth
        };

        var offset = _anchor.left - _container.left;
        //do we have enough space on the left ?
        if(offset + marginLeft + _anchor.w / 2 < _popup.w / 2){
            _popup.left = -offset + marginLeft;
        }else if(_container.w - (offset + _anchor.w / 2 + marginLeft) < _popup.w / 2){
            _popup.left = -offset + _container.w - marginLeft - _popup.w;
        }

        var _arrow = {
            left : -_popup.left + _anchor.w / 2 - arrowWidth,
            leftCover : -_popup.left + _anchor.w / 2 - arrowWidth - 6
        };

        return {
            popup : _popup,
            arrow : _arrow
        };
    }

    return create;
});