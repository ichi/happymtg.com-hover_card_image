// ==UserScript==
// @name           happymtg.com hover_card_image
// @namespace      happymtg_com_hover_card_image
// @version        0.2.5
// @include        http://www.happymtg.com/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js
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
var $card_links = $('span.cardLink > a');
var cached = {};

var show_popup = function($link){
    var data = $link.data();
    if(!data.hover) return;
    var $popup = data.card_popup;
    if($popup){
        $popup.show();
    }
};

var hide_popup = function($link){
    var data = $link.data();
    var $popup = data.card_popup;
    if($popup){
        $popup.hide();
    }
};

var set_text_pos = function($text, $img){
    $img
        .load(function(ev){
            $text.css('left', this.naturalWidth + 10);
        });
};

var set_popup = function($link, $img, $text, clone){
    clone = clone || false;
    
    var href = $link.attr('href');
    var offset = $link.offset();
    var width = $link.width(),
        height = $link.height();
    
    if(clone){
        $img = $img.clone();
        $text = $text.clone();
    }
    
    var $popup = $('<div />')
        .css({
            position: 'absolute'
            , display: 'none'
            , top: offset.top + height + 5
            , left: offset.left + width / 2
        })
        .append($img)
        .append($text);
    
    set_text_pos($text, $img);
    
    $body
        .append($popup);
    
    $link.data('card_popup', $popup);
};

//ajax on_success
var on_success = function(data, status, xhr){
    var $link = $(this);
    var $data = $(data);
    var href = $link.attr('href');
    
    var $card_detail = $data.find('#carddetail');
    var text_ja = $card_detail.find('tr.jpnItem:eq(1) > td').text().replace(/\n/g, '<br />');
    var text_en = $card_detail.find('tr.engItem:eq(1) > td').text().replace(/\n/g, '<br />');
    var $text = $('<div />')
        .css({
            position: 'absolute'
            , top: 0
            , left: 0
            , width: 200
            , padding: '5px'
            , background: '#ffffee'
            , border: '1px solid #000000'
            , color: '#000000'
        });
    var $hr = $('<hr />')
        .css({
            height: 0
            , margin: '5px 0'
            , border: 'none'
            , 'border-bottom': '1px solid #000000'
        });
    $text
        .append('<div>' + text_ja + '</div>')
        .append($hr)
        .append('<div>' + text_en + '</div>');
    
    var $img = $data.find('img.jpnItem')
        .css({
            position: 'absolute'
            , top: 0
            , left: 0
        });
    
    cached[href] = {img:$img, text:$text};
    
    set_popup($link, $img, $text);
    show_popup($link);
};

//attach
$card_links
    .live('mouseenter', function(ev){
        var $link = $(this);
        $link.data('hover', true);
        var data = $link.data();
        if(data.card_popup){
            show_popup($link);
        }else{
            var href = $link.attr('href');
            if(cached[href]){
                set_popup($link, cached[href].img, cached[href].text, true);
                show_popup($link);
            }else{
                $.ajax({
                    url: href
                    , context: $link[0]
                    , type: 'GET'
                    , success: on_success
                });
            }
        }
    })
    .live('mouseleave', function(ev){
        var $link = $(this);
        $link.data('hover', false);
        hide_popup($link);
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
