// main.js 파일 내용

// 1. 초기 설정 및 DOM 요소 캐시
var board = null;
var game = new Chess(); 
var $feedbackPanel = $('#feedback-panel');
var $status = $('#feedback-message');
var $lessonTitle = $('.chessboard-area h2'); 
var $lessonDesc = $('#lesson-description');
var $hintText = $('#hint-text');
var $contentPanel = $('#content-panel');

// 2. 체스보드 초기화 옵션
var config = {
    draggable: true, 
    position: 'start', 
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    // ***** 기물 이미지 경로 설정: img 폴더 사용 *****
    pieceTheme: 'img/{piece}.png' 
};

// 3. 화면 업데이트 (현재 단계의 내용 표시)
function updateStepContent() {
    // 현재 단계 정의
    currentStep = currentLesson.steps[currentStepIndex];

    // 레슨 제목/단계 제목 설정
    $('.chessboard-area h2').text(`[${currentStepIndex + 1}/${currentLesson.steps.length}] ${currentLesson.title} - ${currentStep.title}`);
    
    // HTML 내용을 innerHTML로 설정
    $lessonDesc.html(currentStep.description); 
    $hintText.html(currentStep.hint);
    
    // 피드백 패널 초기화
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $status.html('체스보드에서 행마를 테스트하고 다음 단계로 이동하세요.');
    
    // 힌트 버튼 초기 상태
    $hintText.slideUp();
    
    // 체스보드 설정 및 로드
    config.position = currentStep.fen;
    config.draggable = true; 
    
    if (board) {
        board.destroy();
    }
    board = Chessboard('board', config);
    game = new Chess(currentStep.fen); // 현재 단계 FEN으로 게임 초기화
    
    // '다음 단계로 이동' 버튼 추가/업데이트
    $('#next-step-btn').remove(); 
    $contentPanel.append('<button id="next-step-btn" onclick="loadNextStep()">다음 단계로 이동</button>');
}


// 4. 기물 이동 시 (onDrop 함수)
function onDrop (source, target) {
    // 1. 현재 단계가 정답을 요구하는 퍼즐 모드인지 확인
    if (currentStep && currentStep.expectedMove) {
        const expected = currentStep.expectedMove;
        
        // 정답 확인: source와 target이 모두 일치해야 함
        if (source === expected.from && target === expected.to) {
            // 정답인 경우: move를 시도
            const move = game.move({ from: source, to: target, promotion: 'q' });
            
            if (move === null) return 'snapback'; 

            // 정답 피드백 및 다음 단계로 이동
            $feedbackPanel.removeClass('feedback-incorrect').addClass('feedback-correct');
            $status.html('정답입니다! 다음 단계로 이동하세요.');
            
            // 0.5초 후 다음 단계로 자동 이동
            setTimeout(loadNextStep, 500); 
            
            return; 

        } else {
            // 정답이 아닌 경우: 다른 유효한 수라도 오답 처리
            $feedbackPanel.addClass('feedback-incorrect').removeClass('feedback-correct');
            $status.html('아닙니다. 다른 행마를 시도하여 체크메이트를 찾아보세요.');
            
            // 유효성 검사 없이 무조건 snapback (다시 시도하게 함)
            return 'snapback';
        }
    }

    // 2. 일반 이론 모드 (expectedMove가 없는 경우)
    // promotion: 'q'를 기본으로 설정하여 프로모션을 퀸으로 자동 처리
    var move = game.move({ from: source, to: target, promotion: 'q' }); 
    if (move === null) return 'snapback'; // 유효하지 않으면 되돌리기
    
    // 유효한 수일 경우 (앙파상, 캐슬링 포함) 피드백 메시지 업데이트
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $status.html(`성공적으로 수를 두었습니다: ${move.san}. 다른 행마도 테스트해보세요.`);
    return; 
}


// 5. 다음 단계/레슨 로드 함수
function loadNextStep() {
    currentStepIndex++;
    
    if (currentStepIndex < currentLesson.steps.length) {
        // 다음 세부 단계가 남아있다면 로드
        updateStepContent(); 
    } else {
        // 모든 세부 단계를 완료했다면
        alert('레슨 1의 모든 단계를 완료했습니다! 감사합니다.');
        // 완료 후 처음으로 돌아가기
        currentStepIndex = 0; 
        updateStepContent();
    }
}

// 6. 힌트 보기 기능
function toggleHint() {
    $hintText.slideToggle();
}

// 7. 기물 스냅백 방지 (유효하지 않은 수일 경우 onDrop에서 처리)
function onSnapEnd () {
    board.position(game.fen());
}

// 8. 초기화 및 이벤트 리스너 설정
$(document).ready(function() {
    // <h2> 태그가 index.html에 없으면 추가합니다.
    if ($('.chessboard-area h2').length === 0) {
        $('.chessboard-area').prepend('<h2></h2>');
        $lessonTitle = $('.chessboard-area h2');
    }
    updateStepContent(); // 첫 단계 로드
    $(window).on('resize', board.resize);
});
