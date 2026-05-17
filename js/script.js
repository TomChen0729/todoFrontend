// 請根據你 Laravel 啟動的網址進行修改
const API_URL = 'http://localhost:8000/api';

/**
 * 1. 讀取 (Read)
 */
async function fetchTodos() {
    try {
        const res = await fetch(`${API_URL}/getAllTodos`);
        const result = await res.json();
        if (result.success) {
            console.log("取得資料", result.data);
            renderTodos(result.data);
        }
    } catch (err) {
        console.error("無法取得資料", err);
    }
}

/**
 * 2. 新增 (Create)
 */
async function createTodo() {
    const title = document.getElementById('todo-title').value;
    const desc = document.getElementById('todo-desc').value;

    if (!title.trim() || !desc.trim()) return alert("標題和描述都不能為空");

    try {
        const res = await fetch(`${API_URL}/createTodo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: desc,
                is_completed: false
            })
        });
        const result = await res.json();
        if (result.success) {
            document.getElementById('todo-title').value = '';
            document.getElementById('todo-desc').value = '';
            fetchTodos();
        }
    } catch (err) {
        alert("新增失敗");
    }
}

/**
 * 3. 修改 - 切換完成狀態 (Update Status)
 */
async function toggleStatus(id, currentStatus) {
    await fetch(`${API_URL}/updateTodo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_completed: !currentStatus })
    });
    fetchTodos();
}

/**
 * 4. 修改 - 彈窗編輯內容 (Update Content)
 */
function openEditModal(id, title, desc) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-desc').value = desc || '';
    document.getElementById('edit-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
}

async function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value;
    const description = document.getElementById('edit-desc').value;

    try {
        const res = await fetch(`${API_URL}/updateTodo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, title, description })
        });
        if (res.ok) {
            closeModal();
            fetchTodos();
        }
    } catch (err) {
        alert("儲存失敗");
    }
}

/**
 * 5. 刪除 (Delete)
 */
async function deleteTodo(id) {
    if (!confirm("確定要刪除這項事項嗎？")) return;
    
    try {
        const res = await fetch(`${API_URL}/deleteTodo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (res.ok) fetchTodos();
    } catch (err) {
        alert("刪除失敗");
    }
}

/**
 * 渲染清單
 */
function renderTodos(todos) {
    const list = document.getElementById('todo-list');
    list.innerHTML = '';

    if (todos.length === 0) {
        list.innerHTML = '<li style="text-align:center; padding:20px; color:#ccc;">目前沒有事項</li>';
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.is_completed ? 'completed' : ''}`;
        
        // 轉義特殊字元，避免 JavaScript 注入錯誤
        const safeTitle = todo.title.replace(/'/g, "\\'");
        const safeDesc = (todo.description || "").replace(/'/g, "\\'");

        li.innerHTML = `
            <input type="checkbox" ${todo.is_completed ? 'checked' : ''} 
                onchange="toggleStatus(${todo.id}, ${todo.is_completed})">
            
            <div class="content">
                <div class="title">${todo.title}</div>
                <div class="desc">${todo.description || '無描述'}</div>
            </div>

            <div class="actions">
                <button class="btn-edit" onclick="openEditModal(${todo.id}, '${safeTitle}', '${safeDesc}')">編輯</button>
                <button class="btn-delete" onclick="deleteTodo(${todo.id})">刪除</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// 綁定事件與初次讀取
document.getElementById('add-btn').addEventListener('click', createTodo);
fetchTodos();