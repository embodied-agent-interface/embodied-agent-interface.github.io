document.addEventListener('DOMContentLoaded', function() {
    Promise.all([
        fetch('website/data/virtualhome_data.json').then(response => response.json()),
        fetch('website/data/behavior_data.json').then(response => response.json()),
    ])
    .then(([
        virtualhome_data,
        behavior_data
    ]) => {
        const data = virtualhome_data.data;
        const container = document.querySelector('#demo-table-container.virtualhome-data');
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        
        const sceneSelect = createSearchDropdown('scene_str', Object.keys(data));
        const taskSelect = createSearchDropdown('task_name', getAllTaskNames(data));
        
        searchContainer.appendChild(sceneSelect);
        searchContainer.appendChild(taskSelect);
        container.appendChild(searchContainer);

        const taskWrappers = [];
        Object.keys(data).forEach(scene_str => {
            Object.keys(data[scene_str]).forEach(fileId => {
                const task = data[scene_str][fileId];
                const taskWrapper = createTaskWrapper(task, scene_str, fileId);
                taskWrappers.push(taskWrapper);
                container.appendChild(taskWrapper);
            });
        });

        let currentIndex = 0;
        let filteredWrappers = taskWrappers;

        function updateDisplay() {
            taskWrappers.forEach(wrapper => wrapper.style.display = 'none');
            if (filteredWrappers.length > 0) {
                filteredWrappers[currentIndex].style.display = 'block';
            }
            updateNavButtons();
        }

        function updateNavButtons() {
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex === filteredWrappers.length - 1;
        }

        function filterTasks() {
            const selectedScene = sceneSelect.value;
            const selectedTask = taskSelect.value;

            filteredWrappers = taskWrappers.filter(wrapper => {
                const sceneMatch = !selectedScene || wrapper.dataset.sceneStr === selectedScene;
                const taskMatch = !selectedTask || wrapper.dataset.taskName === selectedTask;
                return sceneMatch && taskMatch;
            });

            currentIndex = 0;
            updateDisplay();
        }

        filterTasks();

        sceneSelect.addEventListener('change', filterTasks);
        taskSelect.addEventListener('change', filterTasks);

        document.getElementById('prev-btn').addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateDisplay();
            }
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            if (currentIndex < filteredWrappers.length - 1) {
                currentIndex++;
                updateDisplay();
            }
        });
    });
});

function createSearchDropdown(name, options) {
    const select = document.createElement('select');
    select.id = name + '-select';
    select.name = name;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Select ${name.replace('_', ' ')}`;
    select.appendChild(defaultOption);

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });

    return select;
}

function getAllTaskNames(data) {
    const taskNames = new Set();
    Object.values(data).forEach(scene => {
        Object.values(scene).forEach(task => taskNames.add(task.task_name));
    });
    return Array.from(taskNames);
}

function createTaskWrapper(task, scene_str, fileId) {
    const taskWrapper = document.createElement('div');
    taskWrapper.className = 'task-wrapper';
    taskWrapper.dataset.sceneStr = scene_str;
    taskWrapper.dataset.taskName = task.task_name;
    taskWrapper.dataset.fileId = fileId;

    const fields = [
        {title: "File ID", field: "fileId", size: "small"},
        {title: "Task Name", field: "task_name", size: "small"},
        {title: "Natural Description", field: "natural_language_description", size: "medium"},
        {title: "Raw VH Goal", field: "vh_goal", size: "large"},
        {title: "LTL Goal", field: "tl_goal", size: "large"},
        {title: "Action Trajectory", field: "action_trajectory", size: "large"},
        {title: "Transition Model", field: "transition_model", size: "extra-large"}
    ];

    fields.forEach((field, index) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = `field-container ${field.size}`;
        fieldDiv.style.backgroundColor = getBackgroundColor(index);

        const titleP = document.createElement('p');
        titleP.className = 'field-title';
        titleP.textContent = field.title + ':';
        fieldDiv.appendChild(titleP);

        const contentP = document.createElement('p');
        contentP.className = 'field-content';
        contentP.textContent = field.field === 'fileId' ? fileId : task[field.field];
        fieldDiv.appendChild(contentP);

        taskWrapper.appendChild(fieldDiv);
    });

    return taskWrapper;
}

function filterTasks() {
    const selectedScene = document.getElementById('scene_str-select').value;
    const selectedTask = document.getElementById('task_name-select').value;

    const taskWrappers = document.querySelectorAll('.task-wrapper');
    taskWrappers.forEach(wrapper => {
        const sceneMatch = !selectedScene || wrapper.dataset.sceneStr === selectedScene;
        const taskMatch = !selectedTask || wrapper.dataset.taskName === selectedTask;
        wrapper.style.display = sceneMatch && taskMatch ? 'block' : 'none';
    });
}

function getBackgroundColor(index) {
    const colors = [
        '#f0f0f0', '#e6f3ff', '#fff0e6', '#e6ffe6', '#ffe6e6', '#e6e6ff'
    ];
    return colors[index % colors.length];
}