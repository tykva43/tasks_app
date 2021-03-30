var is_menu_opened = 0;
/*var left_menu_width = 300;
var left_menu_margin = 0;
var left_min_menu_width = 50;
var slider_width = 160;
var outer_width = 140;
var content_padding_width = 25;*/
//var random_colors = ['#FFB6B9', '#BBDED6', '#29F087', '#A73DE3', '#E33927', ];
//var content_left_margin = left_min_menu_width;

function div(val, by){
    return (val - val % by) / by;
}

$(document).ready(function() {

    changeContentWidth();

    $('.expander').on('click', function() {
        $(this).toggleClass('rotated');
        $('.groups_list').toggleClass('invisible');
    });

    $('.menu_item').on('click', menuItemClicked);

    $(window).on( "resize", changeContentWidth);

    $("[data-tooltip]").mousemove(function(event) {
        $data_tooltip = $(this).attr("data-tooltip");
        if ($(".left_min_menu").is(':hidden')) {
             $(".tooltip").text($data_tooltip)
            .css({"top": event.pageY + 5,
                  "left": event.pageX + 5})
            .show();
        }
        else {
            $(".tooltip").text($data_tooltip)
            .css({"top": event.pageY + 5,
                  "left": event.pageX -75 })
            .show();
        }

    }).mouseout(function() {
        $(".tooltip").hide()
                     .text("")
                     .css({
                        "top": 0,
                        "left": 0
                     });
    });

});

function changeContentWidth() {
    console.log('***** changeContentWidth *****')

    var left_min_menu_width = $('.left_min_menu').width();
    var content_outer_width = $('.content').innerWidth() - $('.content').width();
    var left_menu_width = is_menu_opened * $('.left_menu').width();
//    var content_left_margin = left_menu_width + left_min_menu_width + ($('.content').outerWidth(true) - $('.content').outerWidth())/2;
    var content_left_margin = left_menu_width;

    console.log('content_outer_width = ' + content_outer_width.toString())
    console.log('left_menu_width 9= ' + left_menu_width.toString())
    console.log('content_left_margin = ' + content_left_margin.toString())

    $(".content").css("width", ( $(window).width() - content_outer_width - left_menu_width - left_min_menu_width).toString()+ "px");
    // $('.left_menu').addClass('pop_up_menu');
    // $('.left_menu.pop_up_menu').css('margin-left', left_menu_margin.toString() + 'px');
    // $('.left_menu.pop_up_menu').css('margin-left', left_menu_margin.toString() + 'px');
    $('.content').css('margin-left', content_left_margin.toString() + 'px');

}

function menuItemClicked() {

    $('#flip_toggle').toggleClass('flip');
    $('.left_menu').toggleClass('pop_up_menu');



    var left_min_menu_width = $('.left_min_menu').width();
    var left_menu_width = $('.left_menu').width();

    if ($('.left_menu').css('margin-left') == $('.left_min_menu').width().toString() + "px") { // если левое меню выдвинуто
        // задвинуть левое меню
        is_menu_opened = 0;
        $('.left_menu').css('margin-left', (-left_menu_width).toString() + 'px');

//        // изменить ширину для уменьшения контента
//        width_of_others += left_menu_width
//        // изменить маргин контента
//        content_left_margin -= left_menu_width
        changeContentWidth();
    }
    else {
        // вытащить левое меню
        is_menu_opened = 1;
//        $('.left_menu').css('margin-left', left_min_menu_width.toString() + "px");
        $('.left_menu').css('margin-left', left_min_menu_width.toString() + "px");
        changeContentWidth();
/*
            // изменить ширину для уменьшения контента
            width_of_others = left_menu_width;
            // изменить маргин контента
            content_left_margin += left_menu_width;
            changeContentWidth();*/
        }

        console.log('***** menuItemClicked *****')
//    var left_min_menu_width = $('.left_min_menu').width();
//    var content_outer_width = $('.content').outerWidth(true) - $('.content').width();
//    var left_menu_width = is_menu_opened * $('.left_menu').width();
////    var content_left_margin = left_menu_width + left_min_menu_width + ($('.content').outerWidth(true) - $('.content').outerWidth())/2;
//    var content_left_margin = left_menu_width + left_min_menu_width + ($('.content').outerWidth(true) - $('.content').outerWidth())/2;
//
//    console.log('left_min_menu_width = ' + left_min_menu_width.toString())
//    console.log('content_outer_width = ' + content_outer_width.toString())
//    console.log('left_menu_width = ' + left_menu_width.toString())
//    console.log('content_left_margin = ' + content_left_margin.toString())
/*
        if ($('.left_menu').css('margin-left') == '50px') {
            left_menu_margin += 300;
            console.log(left_menu_margin);
            }
        else {
            left_menu_margin -= 300;
            console.log(left_menu_margin);
            }*/
    }