package com.example.study.study;

import com.example.study.common.PageResponse;
import com.example.study.study.dto.StudyDetailResponse;
import com.example.study.study.dto.StudyListResponse;
import com.example.study.study.dto.StudyRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

/**
 * 모집글 표현 계층.
 *
 * 예외를 잡지 않음. 전역 처리기가 받아 같은 형태로 변환함.
 * 모집자는 요청 본문이 아니라 토큰에서 확인함.
 */
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
public class StudyController {

    private final StudyService studyService;

    @GetMapping
    public PageResponse<StudyListResponse> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {

        StudyStatus studyStatus = (status != null) ? StudyStatus.valueOf(status) : null;
        Sort sort = Sort.by(Sort.Direction.DESC, "id");
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<StudyListResponse> result = studyService.findAll(keyword, studyStatus, pageable);
        return PageResponse.of(result, item -> item);
    }
    /*
     * TODO 26 · 모집글 주소 다섯
     *
     * 기능        상세 · 등록 · 수정 · 삭제 · 마감 주소를 만듦
     *             작성자를 본문으로 받지 않고 @AuthenticationPrincipal 로 받음
     *             등록은 201 과 Location 머리 · 삭제는 204
     * 활용메소드  StudyService.findById()   TODO 22 · 같은 담당
     *             StudyService.create()     TODO 21 · 같은 담당
     *             StudyService.update()     TODO 23 · 같은 담당
     *             StudyService.delete()     TODO 24 · 같은 담당
     *             StudyService.close()      TODO 25 · 같은 담당
     *             ResponseEntity.created()  Location 머리를 붙임
     *             URI.create()              주소 문자열을 만듦
     * 반환형태    StudyDetailResponse · 삭제만 없음
     * 동작결과    EP-02 ~ EP-06 · 마감은 PATCH /api/studies/{id}/close
     */

    @GetMapping("/{id}")
    public StudyDetailResponse findById(@PathVariable Long id) {
        return studyService.findById(id);
    }

    @PostMapping
    public ResponseEntity<StudyDetailResponse> create(
            @Valid @RequestBody StudyRequest request,
            @AuthenticationPrincipal Long memberId) {

        StudyDetailResponse response = studyService.create(
                request.title(),
                request.content(),
                request.capacity(),
                request.deadline(),
                memberId
        );

        URI location = URI.create("/api/studies/" + response.id());

        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    public StudyDetailResponse update(
            @PathVariable Long id,
            @Valid @RequestBody StudyRequest request,
            @AuthenticationPrincipal Long memberId) {

        return studyService.update(
                id,
                request.title(),
                request.content(),
                request.capacity(),
                request.deadline(),
                memberId
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {

        studyService.delete(id, memberId);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/close")
    public StudyDetailResponse close(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {

        return studyService.close(id, memberId);
    }
}
