package com.example.study.application;

import com.example.study.application.dto.ApplicationRequest;
import com.example.study.application.dto.ApplicationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 신청 표현 계층.
 *
 * 대상 모집글에 종속된 주소와 신청 자체를 가리키는 주소가 섞여 있어
 * 묶음 주소를 클래스에 두지 않음.
 */
@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    /*
     * TODO 33 · 신청과 취소 주소
     */

    @PostMapping("/api/studies/{studyId}/applications")
    public ResponseEntity<ApplicationResponse> apply(
            @PathVariable Long studyId,
            @Valid @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal Long memberId) {

        // request.getMessage() -> request.message() 로 수정
        ApplicationResponse response = applicationService.apply(studyId, request.message(), memberId);
        return ResponseEntity.status(201).body(response);
    }

    @DeleteMapping("/api/applications/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal Long memberId) {

        applicationService.cancel(id, memberId);
        return ResponseEntity.noContent().build();
    }


    /*
     * TODO 46 · 신청 처리 주소 셋
     *
     * 기능        GET /api/studies/{studyId}/applications
     *             PATCH /api/applications/{id}/accept
     *             PATCH /api/applications/{id}/reject 를 만듦
     * 활용메소드  ApplicationService.findByStudy()   TODO 42 · 같은 담당
     *             ApplicationService.accept()       TODO 43 · 같은 담당
     *             ApplicationService.reject()       TODO 44 · 같은 담당
     * 반환형태    List<ApplicationResponse> · ApplicationResponse
     * 동작결과    EP-09 · EP-10 · EP-11
     */
}
