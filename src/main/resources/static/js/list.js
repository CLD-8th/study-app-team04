/*
 * 모집글 목록 · 담당 1
 *
 * SC-01 모집글 목록 화면을 그림.
 */

let listPage = 0;

function renderList(data) {
    function renderList(data) {
        document.getElementById('total').textContent = data.totalElements;
        if (data.content.length === 0) {
            document.getElementById('list').innerHTML = '<div class="empty">등록된 모집글이 없습니다</div>';
        } else {
            document.getElementById('list').innerHTML = data.content.map(study => `<div class="item${study.status === 'CLOSED' ? ' closed' : ''}">
  <div>
    <div class="item-title"><a href="/study.html?id=${study.id}">${escapeHtml(study.title)}</a></div>
    <div class="item-meta"><span>${escapeHtml(study.writerNickname)}</span><span>${study.acceptedCount} / ${study.capacity}명</span></div>
  </div>
  <div class="item-meta">${badge(study.status)}<span>~ ${shortDate(study.deadline)}</span></div>
</div>`).join('');
        }
    }
}

function renderPager(data) {
    document.getElementById('pager').innerHTML = '';
    for (let i = 0; i < data.totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i + 1;
        if (i === data.page) {
            button.classList.add('current');
        }
        document.getElementById('pager').appendChild(button);
        button.addEventListener('click', () => {
            listPage = i;
            loadList();
        });
    }
}

async function loadList() {
    /*
     * TODO 15 · 목록 조회
     *
     * 기능        검색어와 상태가 비어 있으면 질의 값에서 뺌
     *             실패하면 안내를 보이고 목록과 쪽 이동을 비움
     * 활용메소드  api.get()            api.js · 제공됨
     *             renderList()         같은 파일 · TODO 13
     *             URLSearchParams()    질의 문자열을 만듦
     *             GET /api/studies     TODO 12 · 같은 담당
     * 받는자료    PageResponse<StudyListResponse>
     * 그릴위치    SC-01 · #load-error 에 실패 안내
     *             조각은 parts.html 의 "실패 안내 · 다시 시도 포함"
     * 동작결과    검색어를 넣으면 제목에 포함된 것만 나옴
     */
}

    document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search').addEventListener('click', () => { listPage = 0; loadList(); });
    document.getElementById('retry').addEventListener('click', loadList);
    document.getElementById('create').addEventListener('click', () => location.href = '/form.html');

    // 등록 단추는 로그인한 경우에만 보임.
    if (auth.loggedIn) {
        document.getElementById('create').classList.remove('hidden');
    }
    loadList();
});
