# 작업 규칙

Backend 작업은 먼저 해당 저장소에 이슈를 만들고 다음 형식의 브랜치에서 진행합니다.

```text
feat/#<이슈번호>-<영문-작업-요약>
```

예: `feat/#1-independent-container-deployment`. 작업 브랜치를 푸시하고 main 대상 PR로 검토합니다.
실행·검사 명령은 [Install](INSTALL.md)을 참고하세요.
main 병합 후 검증이 통과하면 이 컴포넌트의 이미지 게시와 자동 배포 요청이 실행됩니다.
