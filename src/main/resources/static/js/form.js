/*
 * 모집글 등록 · 수정 · 담당 1
 *
 * SC-03 화면. 주소에 id 가 없으면 등록, 있으면 수정임.
 */

const formId = param('id');

function defaultDeadline() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().substring(0, 10);
}

async function initForm() {
    /*
     * TODO 16 · 등록 · 수정 화면 준비
     */

    if (!requireLogin()) {
        return;
    }

    // 수정 화면
    if (formId) {
        try {
            const study = await api.get('/api/studies/' + formId);

            document.getElementById('page-title').textContent = '모집글 수정';
            document.getElementById('title').value = study.title;
            document.getElementById('content').value = study.content;
            document.getElementById('capacity').value = study.capacity;
            document.getElementById('deadline').value = study.deadline;
        } catch (error) {
            const errorBox = document.getElementById('save-error');
            showError(errorBox, error);
        }

        return;
    }

    // 등록 화면
    document.getElementById('deadline').value = defaultDeadline();
}

async function saveForm() {
    /*
     * TODO 17 · 저장
     */

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const capacity = Number(document.getElementById('capacity').value);
    const deadline = document.getElementById('deadline').value;

    const body = {
        title,
        content,
        capacity,
        deadline
    };

    try {
        let response;

        // 수정
        if (formId) {
            response = await api.put(
                '/api/studies/' + formId,
                body
            );
        }

        // 등록
        else {
            response = await api.post(
                '/api/studies',
                body
            );
        }

        location.href = '/study.html?id=' + response.id;

    } catch (error) {
        const errorBox = document.getElementById('save-error');

        if (!showFieldErrors(error)) {
            showError(errorBox, error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('save').addEventListener('click', saveForm);
    document.getElementById('cancel').addEventListener('click', () => history.back());
    initForm();
});