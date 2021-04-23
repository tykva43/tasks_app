var MEDIUM_LVL = '#ffd700',
    LOW_LVL = '#cc0000',
    HIGH_LVL = '#7cfc00';
var taskInfo;
var isCreating = true;
var tasklistChangedFields = {};
var taskChangedFields = {};
var selectedTaskId;

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
    };

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
                        $('<span>').text(' ' + new_task.fields.title).on('dblclick', getTaskInfo)
                    ),
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
        var tasklist_id = `#l${new_task.fields.tasklist}`;
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

// Update the readiness value for all tasklists in the document
function updateAllTasklistsReadiness() {
        var tasklists = $('#tasklists').children('.expander_wrapper');
        tasklists.each(function() {
            updateTasklistReadiness($(this));
        });
    };

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
    };

function onSubmitUpdateForm(isOn) {
    // Call AJAX for task info updating
    if (isOn) {
        $(".update_form").on('submit', updateTask);
        $('.update_form').find('input').on('change', onTaskFormChanged);
        $('.update_form').find('select').on('change', onTaskFormChanged);
        $('.update_form').find('textarea').on('change', onTaskFormChanged);
        taskChangedFields = {};
    }
    else {
        $(".update_form").off('submit', updateTask);
        $('.update_form').find('input').off('change', onTaskFormChanged);
        $('.update_form').find('select').off('change', onTaskFormChanged);
        $('.update_form').find('textarea').off('change', onTaskFormChanged);
    }
};

function onSubmitCreateForm(isOn) {
    // Call AJAX for creating a task
    if (isOn)
        $(".create_form").on('submit', createTask);
    else
        $(".create_form").off('submit', createTask);
};

// Change type (for creating or for updating a task) for task form
function changeTaskFormType(type) {
        switch (type) {
            case "update":
                if (isCreating) {
                    onSubmitCreateForm(false);
                    $('.task_form').find('form').toggleClass('create_form', false).toggleClass('update_form', true);
                    onSubmitUpdateForm(true);
                    isCreating = !isCreating;
                }
                $('.task_form').find('h2').text('Task Info');
                $('.task_form').find('.create_task').text('Update');
                $('.task_form').find('label').css({ 'color': 'white'});
                $('.task_form').css({'background-color': 'rgb(110, 3, 35)'});
                $('.task_form').children('h2').css({'color': 'white'});
                break;
            case "create":
                if (!isCreating) {
                    onSubmitUpdateForm(false);
                    $('.task_form').find('form').toggleClass('create_form', true).toggleClass('update_form', false);
                    onSubmitCreateForm(true);
                    isCreating = !isCreating;
                }
                $('.active_task').toggleClass('active_task', false);
                $('.task_form').find('h2').text('Task creating');
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
    };

// Fill in task form with input task
function fillInTaskForm(task) {
        taskInfo = task;
        var form = $('.task_form').children('form');
        form.find('#id_title').val(taskInfo.fields.title);
        form.find('#id_description').val(taskInfo.fields.description);
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
    };

function onTaskFormChanged() {
    var value;
    if ($(this).is('input') && $(this).attr('type') == 'checkbox')
        value = $(this).prop("checked");
    else if ($(this).is('input') || $(this).is('select') || $(this).is('textarea'))
        value = $(this).val();
    taskChangedFields[$(this).attr('id').substr(3)] = value;
    console.log(taskChangedFields);
};

$(document).ready(function() {

    onSubmitCreateForm(true);

    updateAllTasklistsReadiness();

    $('.task_block').find('span').on('dblclick', getTaskInfo);

    $('.task_marker').on('click', taskMarkerChecked);

    $('.fa-trash-alt').on('click', deleteTask);

    $('.fa-star').on('click', onFavoriteClicked);

    $('.tasklist_title').on('input', function () {
        tasklistChangedFields['title'] = $(this).text();
    })

    $('.tasklist_title').on('dblclick', function() {
        tasklistChangedFields = {};
        $(this).attr('contenteditable', true);
        $(this).toggleClass('is-active', true);
        $(document).on('click', isEditingReady);
    });


    $('.create_task_btn').on('click', function() {
        changeTaskFormType('create');
    });

    // Auto vertical centering for task form
    $(window).scroll(function() {
        var scrollTop = $(this).scrollTop();
        var taskFormHeight = $('.task_form').outerHeight();
        var windowHeight = $(window).height();
        var tasklistsTop = $('#tasklists').offset().top;
        if (windowHeight - tasklistsTop + scrollTop >= taskFormHeight) {
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

});