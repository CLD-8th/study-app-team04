/*
 * 신청 구획 · 담당 3
 *
 * StudyPage.study 와 StudyPage.myApplication 을 읽어 표시함.
 * 자료를 직접 조회하지 않음. 이미 읽어 둔 것을 씀.
 */

   /*
   * TODO 34 · 구획 표시 조건과 신청 전 화면
   */

StudyPage.register(async function renderApply() {

    const applyPanel = document.querySelector('#apply-panel');
    if (!applyPanel) return;

    const study = StudyPage.study;
    const myApplication = StudyPage.myApplication;

    if (!auth.loggedIn() || StudyPage.isOwner() || study.status === 'CLOSED' || study.status === 'COMPLETED') {
        applyPanel.innerHTML = '';
        return;
    }

    if (!myApplication) {
        applyPanel.innerHTML = `
            <div class="apply-form">
                <textarea id="apply-message" placeholder="신청 메시지를 입력하세요 (300자 이하)" maxlength="300"></textarea>
                <button type="button" id="btn-apply">신청하기</button>
            </div>
        `;

        const applyBtn = applyPanel.querySelector('#btn-apply');
        const messageInput = applyPanel.querySelector('#apply-message');

        if (applyBtn) {
            applyBtn.addEventListener('click', async () => {
                const message = messageInput ? messageInput.value.trim() : '';

                try {
                    await api.post(`/api/studies/${study.id}/applications`, { message });

                    await StudyPage.reload();
                } catch (error) {
                    showError(error);
                }
            });
        }
        return;
    }


    /*
     * TODO 35 · 신청 후 화면
     */

    const cancelBtnHtml = myApplication.status === 'PENDING'
        ? `<button type="button" id="btn-cancel-apply" class="btn-cancel">신청 취소</button>`
        : '';

    applyPanel.innerHTML = `
        <div class="apply-info-box">
            <div class="apply-header">
                <span class="status-badge">${badge(myApplication.status)}</span>
                <span class="apply-date">신청일: ${shortDate(myApplication.createdAt)}</span>
            </div>
            <div class="apply-body">
                <p class="apply-message">${myApplication.message || '작성한 메시지가 없습니다.'}</p>
            </div>
            <div class="apply-actions">
                ${cancelBtnHtml}
            </div>
        </div>
    `;

    const cancelBtn = applyPanel.querySelector('#btn-cancel-apply');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', async () => {
            if (!confirm('신청을 취소하시겠습니까?')) return;

            try {
                await api.del(`/api/applications/${myApplication.id}`);

                await StudyPage.reload();
            } catch (error) {
                showError(error);
            }
        });
    }
});
