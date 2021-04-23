var isMenuOpened = 0;
var MEDIUM_LVL = '#ffd700',
    LOW_LVL = '#cc0000',
    HIGH_LVL = '#7cfc00'
var taskInfo;
var isCreating = false;
var isTasklistTitleChanged = false;
var tasklistChangedFields = {};


    function div(val, by) {
        return (val - val % by) / by;
    }

    function onExpanderClicked() {
        $(this).toggleClass('rotated');
        $(this).parents('.expander_wrapper').eq(0).find('.drop_down_list').toggleClass('invisible');
    }

    // Changes task marker status and statuses of related subtasks and update tasklist readiness
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

    function updateReadiness(obj, tlReadiness) {
        readinessInPercents = tlReadiness * 100;
        var color;
        if (readinessInPercents <= 25)
            color = LOW_LVL;
        else if (readinessInPercents <= 75)
            color = MEDIUM_LVL;
            else
                color = HIGH_LVL;
        obj.children('.ready').css({'width': readinessInPercents.toString() + '%', 'background-color': color});
    }

    // Changes subtask status
    function subtaskMarkerClicked(obj, is_task_toggled) {
        if (is_task_toggled) {
            obj.parents('.subtask_block').siblings('.task_block').find('.task_marker').eq(0).toggleClass('fa-square-o fa-check-square-o');
        }
        obj.toggleClass('fa-square-o fa-check-square-o');
    };

    // Insert new task
    function insertTask(new_task) {
        var is_favorite = new_task.fields.is_favorite? "fas": "far";
        var subtask_block = $('<div class="subtask_block drop_down_list invisible">')
            .append($('<div class="description">').text('There are no subtasks yet'));
        var expander = $('<div class="expander task_expander rotated">')
                .append($('<i class="fas fa-angle-down">')).on('click', onExpanderClicked);
        var list_elem_wrapper = $('<div class="list_elem_wrapper">')
            .append(
                $('<div class="list_elem task_block pointer flex_div">')
                    .append(
                        $('<i class="fa fa-square-o task_marker" aria-hidden="true">').attr('id', `t${new_task.pk}`)
                            .on('click', taskMarkerChecked),
                        document.createTextNode(' ' + new_task.fields.title)
                    ).on('dblclick', getTaskInfo),
                $('<div class="list_elem_controls">')
                    .append(
                        $('<i class="fa-star">').addClass(is_favorite).attr('id', `f${new_task.pk}`)
                            .on('click', onFavoriteClicked),
                        $('<i class="far fa-trash-alt">').attr('id', `d${new_task.pk}`).on('click', deleteTask)
                    )
                );
        var task_block = $('<div class="expander_wrapper">')
            .append(
                $('<div class="task_block_wrapper">')
                    .append(expander, list_elem_wrapper),
                subtask_block
            )
        var tasklist_id = `#l{new_task.fields.tasklist}`;

        $(tasklist_id).children('.description').remove();    // Remove the description that there are no tasks in this task list
        $(tasklist_id).append(task_block);                   // Append task block in html
    };

    // Update is_favorite field
    function updateFavoriteStatus(obj, url) {
        $.ajax({
	            method: 'post',
                data: {'csrfmiddlewaretoken': getCookie('csrftoken')},
                url: url,
                success: function(data) {
                    if (data.is_successful)
                        obj.toggleClass('far fas');
                }
        });
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

    // Change type (for creating or for updating a task) for task form
    function changeTaskFormType(type) {
        switch (type) {
            case "update":
                if (isCreating) {
                    onSubmitUpdateForm(true);
                    onSubmitCreateForm(false);
                    isCreating = !isCreating;
                }
                $('.task_form').find('h2').text('Task Info');
                $('.task_form').find('form').toggleClass('create_form', false).toggleClass('update_form', true);
                $('.task_form').find('.create_task').text('Update');
                $('.task_form').find('label').css({ 'color': 'white'});
                $('.task_form').css({'background-color': 'rgb(110, 3, 35)'});
                $('.task_form').children('h2').css({'color': 'white'});
                break;
            case "create":
                if (!isCreating) {
                    onSubmitUpdateForm(false);
                    onSubmitCreateForm(true);
                    isCreating = !isCreating;
                }
                $('.task_form').find('h2').text('Task creating');
                $('.task_form').find('form').toggleClass('create_form', true).toggleClass('update_form', false);
                $('.task_form').find('.create_task').text('Create');
                $('.task_form').css({'background-color': '#dfdfdf', 'color': '#480323'});
                $('.task_form').find('label').css({'color': '#480323'});
                $('.task_form').children('h2').css({'color': '#480323'});
                cleanTaskFormFields();
        }
    };

    // Clean all the fields of task form
    function cleanTaskFormFields() {
        var form = $('.task_form').children('form');
        form.find('#id_title').val('');
        form.find('#id_description').text('');
        form.find('#id_deadline').val('');
        form.find('#id_notification').val($(form.find('#id_notification')).children('option').eq(0).val());
        form.find('#id_priority').val($(form.find('#id_priority')).children('option').eq(0).val());
        form.find('#id_is_favorite').prop("checked", false);
        form.find('#id_tasklist').val($(form.find('#id_tasklist')).children('option').eq(0).val());
    }

    // Fill in task form with input task
    function fillInTaskForm(task) {
        taskInfo = task;
        var form = $('.task_form').children('form');
        form.find('#id_title').val(taskInfo.fields.title);
        form.find('#id_description').text(taskInfo.fields.description);
        form.find('#id_deadline').val(taskInfo.fields.deadline);
        form.find('#id_notification').val(taskInfo.fields.notification);
        form.find('#id_priority').val(taskInfo.fields.priority);
        form.find('#id_is_favorite').prop("checked", taskInfo.fields.is_favorite) ;
        form.find('#id_tasklist').val(taskInfo.fields.tasklist);
    };

    // Update the readiness value or a certain tasklist
    function updateTasklistReadiness(tasklist) {
        var tasks = tasklist.find('.tasklist_block').children('.expander_wrapper');
        // If there are no tasks, assign a value of 1 to avoid division by 0
        var tasksCount = tasks.length? tasks.length : 1;
        var completedTasksCount = 0;
        tasks.find('.task_marker').each(function() {
            completedTasksCount += $(this).hasClass('fa-check-square-o')? 1 : 0;
        });
        updateReadiness(tasklist.find('.readiness'), completedTasksCount/tasksCount);
    }

    // Update the readiness value for all tasklists in the document
    function updateAllTasklistsReadiness() {
        var tasklists = $('#tasklists').children('.expander_wrapper');
        tasklists.each(function() {
            updateTasklistReadiness($(this));
        });
    }

    function isEditingReady() {

        if (!$(event.target).hasClass('is-active')) {
            if (Object.keys(tasklistChangedFields).length) {  // If there are changes in tasklist title

                var tasklist_title = $('.is-active');
                var id = tasklist_title.parents('.expander_wrapper').eq(0).find('.tasklist_block').attr('id').substr(1);
                tasklist_title.attr('contenteditable', false);
                tasklist_title.toggleClass('is-active', false);

                // Send request for title updating
                $.post(
                    "tasklist/" + id + '/',         // URL update_tasklist
                    {
                        json_data: JSON.stringify({values: /*tasklistChangedFields*/{'title': tasklist_title.text()}}),
                        "csrfmiddlewaretoken": getCookie('csrftoken'),
                    },
                    function(response) {
                        if (response.is_successful == false) {
                            // todo: show message about failure
                        }
                        $(document).off('click', isEditingReady);
                    },
                    'json'
                );
            }
        }
    }

$(document).ready(function() {

    changeContentWidth();

    onSubmitCreateForm(true);

    updateAllTasklistsReadiness();

    $('.task_block').on('dblclick', getTaskInfo);
    $('.task_marker').on('click', taskMarkerChecked);

    $('.fa-trash-alt').on('click', deleteTask);

    $('.tasklist_title').on('input', function () {
        isTasklistTitleChanged = true;
        tasklistChangedFields['title'] = $(this).text();
    })

    $('.tasklist_title').on('dblclick', function() {
        isTasklistTitleChanged = false;
        tasklistChangedFields = {};
        $(this).attr('contenteditable', true);
        $(this).toggleClass('is-active', true);
        $(document).on('click', isEditingReady);
    });

    $('.fa-ellipsis-h').on('click', function() {
        alert('Someday there will be any action here');
    })     // todo: display tasklist menu

    $('.create_task_btn').on('click', function() {
        changeTaskFormType('create');
    });

    $(window).scroll(function() {
        if ($(this).scrollTop()>=$(window).height())
            $('.up_btn').fadeIn("slow");
        else
            $('.up_btn').fadeOut("slow");
    });

    // Auto vertical centering for task form
    $(window).scroll(function() {
        var scrollTop = $(this).scrollTop();
        var taskFormHeight = $('.task_form').outerHeight();
        var windowHeight = $(window).height();
        var tasklistsTop = $('#tasklists').offset().top;
        if(windowHeight - tasklistsTop + scrollTop >= taskFormHeight) {
        var delta;
            if (scrollTop <= tasklistsTop)
                delta = (windowHeight - (tasklistsTop- scrollTop) - taskFormHeight)/2 ;
            else
                delta = (windowHeight - taskFormHeight)/2 + scrollTop - tasklistsTop ;
            $('.task_form').css({'margin-top': delta.toString() + "px"});
        }
        else
            $('.task_form').css({'margin-top': "0px"});
    });

    $( "#id_deadline" ).datetimepicker({format: 'Y-m-d H:i'});

    $('.expander').on('click', onExpanderClicked);

    $('.drop_down_menu').on('click', function() { $(this).children('.drop_down_menu_content').toggleClass('invisible') });

    $('.menu_item').on('click', menuItemClicked);

    $(window).on( "resize", changeContentWidth);

    // Smooth scrolling when navigating
    $('a[href^="#"], *[data-href^="#"]').on('click', function(e){
        e.preventDefault();
        var t = 1000;
        var d = $(this).attr('data-href') ? $(this).attr('data-href') : $(this).attr('href');
        $('html,body').stop().animate({ scrollTop: $(d).offset().top }, t);
    });
});

function changeContentWidth() {

    var left_min_menu_width = $('.left_min_menu').width();
    var content_outer_width = $('.content').innerWidth() - $('.content').width();
    var left_menu_width = isMenuOpened * $('.left_menu').width();
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
        isMenuOpened = 0;
        $('.left_menu').css('margin-left', (-left_menu_width).toString() + 'px');
        changeContentWidth();
    }
    else {
        // вытащить левое меню
        isMenuOpened = 1;
        $('.left_menu').css('margin-left', left_min_menu_width.toString() + "px");
        changeContentWidth();
        }
    }