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
     *
     * 기능        내 신청이 있으면 상태와 신청일을 보임
     *             대기 상태일 때만 취소 단추를 둠
     *             취소에 성공하면 다시 그려 신청 전 화면으로 돌아감
     * 활용메소드  StudyPage.myApplication   제공됨 · 없으면 null
     *             badge() · shortDate()     common.js · 제공됨
     *             api.del()                 api.js · 제공됨
     *             DELETE /api/applications/{id}   TODO 33 · 같은 담당
     * 받는자료    ApplicationResponse · status 는 PENDING · ACCEPTED · REJECTED
     * 그릴위치    SC-02 · #apply-panel
     *             조각은 parts.html 의 "신청 후 · 대기" 와 "신청 후 · 수락됨"
     * 동작결과    대기 건은 취소 단추가 보이고 수락된 건은 보이지 않음
     */
});
