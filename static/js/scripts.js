var is_menu_opened = 0;

function div(val, by){
    return (val - val % by) / by;
}
    // Changes task marker status and statuses of related subtasks
    function taskMarkerClicked(obj) {
        obj.toggleClass('fa-square-o fa-check-square-o');
        var is_task_completed = obj.hasClass('fa-check-square-o');
        var subtasks = obj.parents('.tasklist_block').find('.subtask_marker');
        obj.parents('.tasklist_block').find('.subtask_marker').each(function() {
           var is_subtask_completed = $(this).hasClass('fa-check-square-o');
           if (is_subtask_completed != is_task_completed)
               $(this).toggleClass('fa-square-o fa-check-square-o');
        });
    };

    // Changes subtask status
    function subtaskMarkerClicked(obj, is_task_toggled) {
        if (is_task_toggled)
            obj.parents('.task_marker').toggleClass('fa-square-o fa-check-square-o');
        obj.toggleClass('fa-square-o fa-check-square-o');
    };

    function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
    };

$(document).ready(function() {

    changeContentWidth();

    $('.expander').on('click', function() {
        $(this).toggleClass('rotated');
        $(this).parents('.expander_wrapper').eq(0).find('.drop_down_list').toggleClass('invisible');
    });

    $('.drop_down_menu').on('click', function() { $(this).children('.drop_down_menu_content').toggleClass('invisible') });

    // Toggle class for tasks and subtasks markers
    //$('.fa-check-square-o').on('click', function() { $(this).toggleClass('fa-square-o fa-check-square-o') });
    //$('.fa-square-o').on('click', function() { $(this).toggleClass('fa-square-o fa-check-square-o') });



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

    var left_min_menu_width = $('.left_min_menu').width();
    var content_outer_width = $('.content').innerWidth() - $('.content').width();
    var left_menu_width = is_menu_opened * $('.left_menu').width();
    var content_left_margin = left_menu_width;

    $(".content").css("width", ( $(window).width() - content_outer_width - left_menu_width - left_min_menu_width).toString()+ "px");
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
        changeContentWidth();
    }
    else {
        // вытащить левое меню
        is_menu_opened = 1;
        $('.left_menu').css('margin-left', left_min_menu_width.toString() + "px");
        changeContentWidth();
        }
    }