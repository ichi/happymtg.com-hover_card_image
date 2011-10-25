// ==UserScript==
// @name           happymtg.com hover_card_image
// @namespace      happymtg_com_hover_card_image
// @version        0.3.0
// @include        http://www.happymtg.com/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.6/jquery.min.js
// @require        https://github.com/ichi/greasemonkey_console/raw/master/console.js
// ==/UserScript==


var after_loaded_jquery = function($){ // $ = jQuery
    if(!$) return;
    
    //overwrite jQuery.data
    $.__data = $.data;
    $.data = function(elem, name, data){
        elem = elem.wrappedJSObject || elem;
        return $.__data(elem, name, data);
    };
    
    
    //main
    var $body = $('body');
    var $card_links = $('a:contains("《"):contains("》")');
    var cached = {};
    var $popup = $('<div id="happymtg_hover_card_image_popup"></div>')
        .css({
            position: 'absolute'
            , display: 'none'
            , top: 0
            , left: 0
        })
        .appendTo($body);

    $('head').append('<style type="text/css">'
        + '#happymtg_hover_card_image_popup h2{'
        + ' margin:0 0 5px;'
        + ' color:brown;'
        + ' font-weight:bold;'
        + '}'
        + '#happymtg_hover_card_image_popup table,'
        + '#happymtg_hover_card_image_popup table th,'
        + '#happymtg_hover_card_image_popup table td{'
        + ' border:1px solid #999999;'
        + ' font-size:10px;'
        + ' text-align:left;'
        + ' vertical-align:top;'
        + '}'
        + '#happymtg_hover_card_image_popup table{'
        + ' width:250px'
        + '}'
        + '#happymtg_hover_card_image_popup table th,'
        + '#happymtg_hover_card_image_popup table td{'
        + ' padding:2px;'
        + '}'
        + '#happymtg_hover_card_image_popup table th{'
        + ' white-space:nowrap;'
        + '}'
        + '#happymtg_hover_card_image_popup table .engItem,'
        + '.eng#happymtg_hover_card_image_popup table .jpnItem{'
        + ' display:none'
        + '}'
        + '.eng#happymtg_hover_card_image_popup table .engItem,'
        + '#happymtg_hover_card_image_popup table .jpnItem{'
        + ' display:block'
        + '}'
        + '</style>');


    var show_popup = function($link, href){
        if(!href) href = $link.attr('href');
        if(!cached[href] || !cached[href].length){
            $.ajax({
                url: href
                , context: $link[0]
                , type: 'GET'
                , success: on_success
            });
            return;
        }

        var offset = $link.offset();
        var width = $link.width(),
            height = $link.height();
        var body_width = $body.width();
        var css = {
            top: offset.top + height + 5
            , left: offset.left + width / 2
        };

        var threshold = 500;
        var diff = body_width - css.left;
        if(diff < threshold) css.left = css.left - (threshold - diff);

        $popup.css(css).empty().append(cached[href]).show();
    };

    var hide_popup = function(){
        $popup.hide();
    };

    //ajax on_success
    var on_success = function(data, status, xhr){
        var $link = $(this);
        var $data = $(data);
        var href = $link.attr('href');


        var $img = $data.find('img.jpnItem')
            .css({
                position: 'absolute'
                , top: 0
                , left: 0
                , width: 223
                , height: 310
            });

        var $card_detail = $data.find('#carddetail');
        var $card_name = $card_detail.find('h2:first');
        var $card_detail_tbl = $card_detail.find('table:first');
        $card_detail_tbl.find('td.lega')
            .find('div')
                .removeAttr('style')
            .end()
            .find('a')
                .remove();

        var $detail = $('<div></div>')
            .css({
                position: 'absolute'
                , top: 0
                , left: 223 + 10
                , padding: '5px'
                , background: '#ffffee'
                , border: '1px solid #000000'
                , color: '#000000'
            })
            .append($card_name)
            .append($card_detail_tbl);

        cached[href] = $img.add($detail);
        
        show_popup($link, href);
    };

    //live attach
    $card_links
        .live('mouseenter', function(ev){
            show_popup($(this));
        })
        .live('mouseleave', function(ev){
            hide_popup();
        });
};


//init
try{
    after_loaded_jquery(jQuery);
}catch(e){
    var script = document.createElement("script");
    script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "(" + after_loaded_jquery.toString() + ")(jQuery);";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}
