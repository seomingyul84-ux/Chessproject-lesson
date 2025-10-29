// main.js 시작

// 1. 초기 설정 및 DOM 요소 캐시
var board = null;
var game = new Chess(currentLesson.fen); // lessons.js에서 정의된 FEN 사용
var $feedbackPanel = $('#feedback-panel');
var $status = $('#feedback-message');
var $lessonDesc = $('#lesson-description');
var $hintText = $('#hint-text');

// 2. 체스보드 초기화 옵션
var config = {
    draggable: true,
    position: currentLesson.fen,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    // ***** 핵심 수정 부분: 기물 이미지 경로 설정 *****
    pieceTheme: 'img/{piece}.png' 
    // 기물 파일을 'img/wK.png', 'img/bP.png' 등으로 찾게 됩니다.
};

// 3. 화면 업데이트 (레슨 내용 표시)
function updateLessonContent() {
    $lessonDesc.html(currentLesson.description);
    $hintText.html(currentLesson.hint);
}

// 4. 기물 이동 시 (사용자가 수를 두었을 때)
function onDrop (source, target) {
    // 사용자 이동 시도
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // 프로모션은 일단 퀸으로 가정
    });

    // 유효하지 않은 수인 경우
    if (move === null) return 'snapback';

    // 유효한 수인 경우 피드백 확인 및 업데이트
    updateFeedback(move.san);
}

// 5. 피드백 업데이트 로직
function updateFeedback (san) {
    // 모든 클래스 초기화
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    
    // 힌트 숨기기
    $hintText.slideUp(); 

    if (san === currentLesson.solution) {
        // 정답인 경우
        $feedbackPanel.addClass('feedback-correct');
        $status.html('🎉 **정답입니다!**');
        // 다음 레슨 로드 로직 추가 필요
    } else {
        // 오답인 경우: 수를 되돌리고 메시지 출력
        game.undo();
        board.position(game.fen()); // 보드 상태 되돌리기
        $feedbackPanel.addClass('feedback-incorrect');
        $status.html('❌ **오답입니다.** 다시 생각해 보세요.');
    }
}

// 6. 기물 스냅백 방지
function onSnapEnd () {
    board.position(game.fen());
}

// 7. 힌트 보기 기능
function toggleHint() {
    $hintText.slideToggle();
}

// 8. 초기화 및 이벤트 리스너 설정
$(document).ready(function() {
    board = Chessboard('board', config);
    updateLessonContent();
    
    // 창 크기 변경 시 보드 크기 조정
    $(window).on('resize', board.resize);
});
