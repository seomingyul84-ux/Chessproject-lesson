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
    draggable: true, // 초기에는 true로 설정
    position: currentLesson.fen,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    // ***** 핵심 설정: 기물 이미지 경로 설정 *****
    pieceTheme: 'img/{piece}.png' 
};

// 3. 화면 업데이트 (레슨 내용 및 상태 표시)
function updateLessonContent() {
    // 레슨 제목 설정
    $lessonTitle.text(currentLesson.title);
    
    // HTML 내용을 innerHTML로 설정하여 마크업(h3, ul, p)이 적용되도록 설정
    $lessonDesc.html(currentLesson.description); 
    $hintText.html(currentLesson.hint);
    
    // 피드백 패널 초기화
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $status.html(currentLesson.solution === null ? '체스보드에서 행마를 테스트해보세요.' : '수를 두어 보세요.');
    
    // 힌트 버튼 초기 상태
    $hintText.slideUp();
    
    // 체스보드 설정 및 로드
    config.position = currentLesson.fen;
    // 이론 레슨이면 드래그 허용, 문제 레슨이면 정답 확인을 위해 드래그 금지
    config.draggable = currentLesson.solution === null; 
    
    // 기존 보드 제거 후 새 설정으로 다시 로드
    if (board) {
        board.destroy();
    }
    board = Chessboard('board', config);
    game = new Chess(currentLesson.fen);
    
    // 다음 레슨 버튼 처리
    $('#next-lesson-btn').remove(); // 기존 버튼 제거
    if (currentLesson.solution === null) {
        // 이론 레슨의 경우, 다음 레슨으로 넘어가는 버튼을 바로 표시
        $contentPanel.append('<button id="next-lesson-btn" onclick="loadNextLesson()">다음 레슨으로 이동</button>');
    }
}

// 4. 기물 이동 시 (onDrop 함수)
function onDrop (source, target) {
    if (currentLesson.solution === null) {
        // 이론 학습 모드: 자유롭게 움직이도록 허용 (규칙에 어긋나지 않는 한)
        var move = game.move({ from: source, to: target, promotion: 'q' });
        if (move === null) return 'snapback'; // 유효하지 않으면 되돌리기
        $status.html('자유롭게 행마를 테스트하고 있습니다.');
        return; 
    }
    
    // 문제 풀이 모드 (현재는 LESSON_DATA에 문제 없음)
    // 이 부분은 문제 레슨이 추가되면 활성화됨
    var move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';

    updateFeedback(move.san);
}

// 5. 피드백 업데이트 로직
function updateFeedback (san) {
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $hintText.slideUp(); 

    if (san === currentLesson.solution) {
        $feedbackPanel.addClass('feedback-correct');
        $status.html('🎉 **정답입니다!**');
        // 정답 시 다음 레슨 버튼 활성화 또는 표시
        $contentPanel.append('<button id="next-lesson-btn" onclick="loadNextLesson()">다음 레슨으로 이동</button>');
    } else {
        game.undo();
        board.position(game.fen());
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

// 8. 레슨 로드 함수
function loadNextLesson() {
    currentLessonIndex++;
    if (currentLessonIndex < LESSON_DATA.length) {
        currentLesson = LESSON_DATA[currentLessonIndex];
        updateLessonContent();
    } else {
        alert('모든 레슨을 완료했습니다!');
    }
}

// 9. 초기화 및 이벤트 리스너 설정
$(document).ready(function() {
    // 레슨 제목 표시를 위해 h2 태그를 index.html에 추가합니다.
    $('.chessboard-area').prepend('<h2></h2>');
    updateLessonContent();
    $(window).on('resize', board.resize);
});
