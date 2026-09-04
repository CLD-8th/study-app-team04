/*
 * 후기 구획 · 담당 5
 *
 * 마감된 뒤에 참여자만 작성 가능하며 한 번 쓰면 입력란을 두지 않음.
 * 참여자는 모집자와 수락된 신청자를 가리킴.
 */

StudyPage.register(async function renderReviews() {
    const panel = document.querySelector('#review-panel');
    if (!panel) return;

    const studyId = StudyPage.id || StudyPage.study?.id;

    // ──────────────────────────────────────────────
    // TODO 57 · 후기 목록과 입력란 구성
    // ──────────────────────────────────────────────

    // 1. 후기 목록 조회 (손님도 볼 수 있음)
    let reviews = [];
    try {
        reviews = await api.get(`/api/studies/${studyId}/reviews`);
    } catch (e) {
        reviews = [];
    }

    // 2. 입력란 노출 조건 검사 (로그인 · 마감 · 참여자 · 미작성)
    const isLoggedIn = Boolean(auth.memberId);

    // 마감 여부 (StudyPage 메서드 또는 속성 확인)
    const isClosed = typeof StudyPage.isClosed === 'function'
        ? StudyPage.isClosed()
        : (StudyPage.study?.status === 'CLOSED' || StudyPage.status === 'CLOSED');

    // 참여자 여부: 모집자이거나 신청이 수락된(ACCEPTED) 경우
    const isParticipant = StudyPage.isOwner() || StudyPage.myApplication?.status === 'ACCEPTED';

    // 미작성 여부: 이미 내가 작성한 후기가 없는지 확인
    const hasReviewed = reviews.some(r => r.writerId === auth.memberId);

    // 4가지 조건을 모두 만족할 때만 입력란 노출
    const canWrite = isLoggedIn && isClosed && isParticipant && !hasReviewed;

    // 3. HTML 생성 (parts.html 참고 구조)
    let html = '';

    // [입력란] 작성 가능한 경우에만 폼 렌더링
    if (canWrite) {
        html += `
            <form id="write-review" class="mb-4">
                <div id="review-error" class="text-danger mb-2"></div>
                <div class="mb-2">
                    <label for="review-rating" class="form-label">평점</label>
                    <select id="review-rating" name="rating" class="form-select" style="width: auto;">
                        <option value="5">⭐⭐⭐⭐⭐ (5점)</option>
                        <option value="4">⭐⭐⭐⭐ (4점)</option>
                        <option value="3">⭐⭐⭐ (3점)</option>
                        <option value="2">⭐⭐ (2점)</option>
                        <option value="1">⭐ (1점)</option>
                    </select>
                </div>
                <div class="mb-2">
                    <textarea name="content" class="form-control" rows="3" placeholder="스터디 후기를 남겨주세요." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-sm">후기 등록</button>
            </form>
        `;
    }

    // [목록] 후기 항목들 렌더링
    if (reviews.length === 0) {
        html += `<div class="text-muted text-center py-3">작성된 후기가 없습니다.</div>`;
    } else {
        html += `<div class="review-list list-group">`;
        reviews.forEach(review => {
            // 본인 후기일 때만 삭제 버튼 표시
            const isMyReview = isLoggedIn && review.writerId === auth.memberId;
            const deleteButtonHtml = isMyReview
                ? `<button type="button" class="btn btn-outline-danger btn-sm delete-review-btn">삭제</button>`
                : '';

            html += `
                <div class="list-group-item" data-review="${review.id}">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <div>
                            <strong>${escapeHtml(review.writerNickname || review.writerName || '익명')}</strong>
                            <span class="text-warning ms-2">★ ${review.rating}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <small class="text-muted">${dateTime(review.createdAt)}</small>
                            ${deleteButtonHtml}
                        </div>
                    </div>
                    <p class="mb-1 text-break">${escapeHtml(review.content)}</p>
                </div>
            `;
        });
        html += `</div>`;
    }

    panel.innerHTML = html;

    // ──────────────────────────────────────────────
    // TODO 58 · 후기 등록과 삭제 이벤트 연결
    // ──────────────────────────────────────────────

    // 1. 등록 이벤트
    const form = panel.querySelector('#write-review');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorBox = form.querySelector('#review-error');
            if (errorBox) errorBox.innerHTML = '';

            const payload = {
                rating: Number(form.rating.value),
                content: form.content.value.trim()
            };

            try {
                await api.post(`/api/studies/${studyId}/reviews`, payload);
                StudyPage.reload(); // 성공 시 페이지 리로드하여 갱신
            } catch (err) {
                // 유효성 검사 에러나 비즈니스 예외 처리
                if (typeof showFieldErrors === 'function' && err.fieldErrors) {
                    showFieldErrors(err, form);
                } else if (typeof showError === 'function') {
                    showError(err, errorBox || form);
                } else {
                    alert(err.message || '후기 등록에 실패했습니다.');
                }
            }
        });
    }

    // 2. 삭제 이벤트 (확인 창 후 삭제)
    panel.querySelectorAll('[data-review]').forEach(item => {
        const deleteBtn = item.querySelector('.delete-review-btn');
        if (!deleteBtn) return;

        const reviewId = item.dataset.review;
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('후기를 삭제하시겠습니까?')) {
                return;
            }

            try {
                await api.del(`/api/reviews/${reviewId}`);
                StudyPage.reload(); // 성공 시 리로드
            } catch (err) {
                if (typeof showError === 'function') {
                    showError(err);
                } else {
                    alert(err.message || '후기 삭제에 실패했습니다.');
                }
            }
        });
    });
});