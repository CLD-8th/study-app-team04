/*
 * 상세 화면 조율 · 제공
 *
 * 상세와 내 신청을 한 번만 조회해 네 구획이 함께 씀.
 * 각 담당은 자기 파일에서 register 로 표시 함수를 등록하기만 하면 됨.
 *
 * 한 구획에서 자료가 바뀌면 StudyPage.reload() 를 부름.
 * 그러면 네 구획이 각자 다시 그리므로 서로의 함수를 알 필요가 없음.
 */
const StudyPage = {

    /** 주소의 id 값. */
    id: Number(param('id')),

    /** 상세 응답. StudyDetailResponse */
    study: null,

    /** 내 신청. 없으면 null. ApplicationResponse */
    myApplication: null,

    renderers: [],

    /** 표시 함수를 등록함. 등록한 순서대로 불림. */
    register(renderer) {
        this.renderers.push(renderer);
    },

    /** 모집자 본인인지. 네 구획이 모두 이 값으로 판단함. */
    isOwner() {
        return auth.loggedIn && this.study !== null && this.study.writerId === auth.memberId;
    },

    /** 자료를 다시 읽고 네 구획을 다시 그림. */
    async reload() {
        try {
            this.study = await api.get('/api/studies/' + this.id);
        } catch (error) {
            const box = document.getElementById('page-error');
            box.textContent = '모집글을 찾을 수 없습니다';
            box.classList.remove('hidden');
            return;
        }


        this.myApplication = null;
        if (auth.loggedIn && !this.isOwner()) {
            const mine = await api.get('/api/members/me/applications');
            this.myApplication = mine.find(item => item.studyPostId === this.id) || null;
        }

        for (const renderer of this.renderers) {
            await renderer();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => StudyPage.reload());
