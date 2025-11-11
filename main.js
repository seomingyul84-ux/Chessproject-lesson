// main.js 파일 전체 코드

// 1. 초기 설정 및 DOM 요소 캐시
var board = null;
var game = new Chess(); 
var $feedbackPanel = $('#feedback-panel');
var $status = $('#feedback-message');
var $lessonDesc = $('#lesson-description');
var $hintText = $('#hint-text');
var $contentPanel = $('#content-panel');

// === 추가 변수 ===
// 현재 클릭하여 하이라이트된 기물의 칸을 저장합니다.
var squareToHighlight = null; 

// 2. 체스보드 초기화 옵션
var config = {
    draggable: true, 
    position: 'start', 
    onDrop: onDrop,            // 기물을 드래그 앤 드롭했을 때
    onSnapEnd: onSnapEnd,
    onDragStart: onDragStart,  // 기물 드래그 시작 시
    // onMouseoverSquare, onMouseoutSquare 제거됨
    pieceTheme: 'img/{piece}.png' 
};

// =========================================================
// === 3. 이벤트 핸들러 함수 (클릭 기반 이동 및 해제 로직) ===
// =========================================================

// 현재 턴의 기물만 드래그 가능하도록 설정 (드래그 앤 드롭 사용 시 대비)
function onDragStart (source, piece, position, orientation) {
    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search('w') === -1) ||
        (game.turn() === 'b' && piece.search('b') === -1)) {
        return false;
    }
}

// 칸에 하이라이트 및 클릭 이벤트를 추가 (점으로 표시하는 CSS가 있다면 더 좋습니다.)
function highlightSquare (square, isTarget = false) {
    var $square = $('#board .square-' + square);
    
    // 타겟 칸 (합법적인 수)은 점으로 표시되도록 CSS 클래스를 사용합니다.
    // CSS에 .highlight-target 클래스가 '점' 스타일을 가지도록 정의해야 합니다.
    if (isTarget) {
        $square.addClass('highlight-target');
    } 
    // 선택된 기물이 있는 칸은 강조합니다.
    else {
        $square.addClass('highlight-source');
    }
}

// 모든 하이라이트 및 클래스를 제거
function removeHighlights () {
    $('#board .square').removeClass('highlight-source highlight-target');
}

// 칸 클릭을 처리하여 행마를 시도하는 핵심 함수
function handleSquareClick(square) {
    // 1. 현재 선택된 기물이 없음 (새로운 기물 선택 시도)
    if (squareToHighlight === null) {
        // 클릭한 칸에 현재 턴의 기물이 있는지 확인
        if (game.get(square) && game.get(square).color === game.turn()) {
            // 기물 선택: 하이라이트 및 이동 가능 칸 표시
            squareToHighlight = square;
            highlightSquare(square);
            
            var moves = game.moves({ square: square, verbose: true });
            for (var i = 0; i < moves.length; i++) {
                highlightSquare(moves[i].to, true);
            }
        } else {
            // 빈 칸 또는 상대 기물 클릭: 무시
        }
    } 
    
    // 2. 이미 선택된 기물이 있음 (이동 또는 선택 해제 시도)
    else {
        // a) 선택된 기물을 다시 클릭 (선택 해제)
        if (squareToHighlight === square) {
            removeHighlights();
            squareToHighlight = null;
            return;
        }

        // b) 이동 시도
        var source = squareToHighlight;
        var target = square;
        
        // 퍼즐 모드인 경우 onDrop 로직 재활용
        if (currentStep && currentStep.expectedMove) {
            const result = onDrop(source, target);
            
            if (result !== 'snapback') {
                // 행마가 유효하고 정답인 경우
                board.move(source + '-' + target); 
                squareToHighlight = null; 
            }
            removeHighlights();
            return;
        }
        
        // 일반 모드 이동
        var move = game.move({ from: source, to: target, promotion: 'q' });

        if (move === null) {
            // 유효하지 않은 이동인 경우 (하이라이트만 해제하고, 새로운 기물 선택으로 간주 가능)
            
            // 유효하지 않지만, 현재 턴의 기물이라면 선택 변경
            if (game.get(square) && game.get(square).color === game.turn()) {
                removeHighlights();
                squareToHighlight = null; // 초기화 후 재귀 호출로 선택 변경
                handleSquareClick(square);
            } else {
                // 유효하지 않은 이동 + 기물이 아닌 곳 클릭: 무시하고 하이라이트 유지
            }
            return;
        }

        // 유효한 이동인 경우
        board.move(source + '-' + target);
        removeHighlights();
        squareToHighlight = null; 
        
        $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
        $status.html(`성공적으로 수를 두었습니다: ${move.san}. 다른 행마도 테스트해보세요.`);
    }
}


// 4. 기물 이동 시 (onDrop 함수 - 드래그 앤 드롭 전용)
function onDrop (source, target) {
    // 이 함수는 드래그 앤 드롭으로만 호출되어야 하며, 퍼즐 정답 확인 로직을 담습니다.
    if (currentStep && currentStep.expectedMove) {
        const expected = currentStep.expectedMove;
        
        if (source === expected.from && target === expected.to) {
            const move = game.move({ from: source, to: target, promotion: 'q' });
            if (move === null) return 'snapback'; 

            $feedbackPanel.removeClass('feedback-incorrect').addClass('feedback-correct');
            $status.html('정답입니다! 다음 단계로 이동 버튼을 눌러주세요.');
            $('#next-step-btn').show(); 
            
            return; 

        } else {
            $feedbackPanel.addClass('feedback-incorrect').removeClass('feedback-correct');
            $status.html('아닙니다. 다른 행마를 시도하여 정답을 찾아보세요.');
            
            return 'snapback'; 
        }
    }

    // 일반 이론 모드 (드래그 앤 드롭)
    var move = game.move({ from: source, to: target, promotion: 'q' }); 
    if (move === null) return 'snapback'; 
    
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $status.html(`성공적으로 수를 두었습니다: ${move.san}. 다른 행마도 테스트해보세요.`);
    return; 
}


// 5. 다음 단계/레슨 로드 함수
function loadNextStep() {
    currentStepIndex++;
    
    if (currentStepIndex < currentLesson.steps.length) {
        removeHighlights(); // 하이라이트 제거
        squareToHighlight = null; // 선택 초기화
        updateStepContent(); 
    } else {
        alert('레슨 1의 모든 단계를 완료했습니다! 감사합니다.');
        currentStepIndex = 0; 
        updateStepContent();
    }
}

// 6. 힌트 보기 기능
function toggleHint() {
    $hintText.slideToggle();
}

// 7. 기물 스냅백 방지
function onSnapEnd () {
    board.position(game.fen());
}

// =========================================================
// === 8. 화면 업데이트 (updateStepContent) 함수 ===
// =========================================================

function updateStepContent() {
    currentStep = currentLesson.steps[currentStepIndex];

    $('.chessboard-area h2').text(`[${currentStepIndex + 1}/${currentLesson.steps.length}] ${currentStep.title} - ${currentStep.title}`);
    
    $lessonDesc.html(currentStep.description); 
    $hintText.html(currentStep.hint);
    
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $hintText.slideUp();
    
    config.position = currentStep.fen;
    config.draggable = true; 
    
    if (board) {
        board.destroy();
    }
    board = Chessboard('board', config);
    game = new Chess(currentStep.fen); 
    
    $('#next-step-btn').remove(); 
    $contentPanel.append('<button id="next-step-btn" onclick="loadNextStep()">다음 단계로 이동</button>');
    
    let defaultStatusMessage = '체스보드에서 행마를 테스트하고 다음 단계로 이동하세요.';
    
    if (currentStep.expectedMove) {
        $('#next-step-btn').hide(); 
        defaultStatusMessage = '정확한 행마를 찾아 정답을 맞혀야 다음 단계로 넘어갈 수 있습니다.';
    } else {
        $('#next-step-btn').show(); 
    }
    
    $status.html(defaultStatusMessage);

    // ⭐⭐ 앙파상 시연 로직 (Step ID: '2.2' - 15단계) ⭐⭐
    if (currentStep.stepId === '2.2') {
        $('#next-step-btn').hide(); 
        
        setTimeout(function() {
            board.move('c7-c5');
            
            const enPassantFen = '8/8/8/2pP4/8/8/8/K7 w - c6 0 2'; 
            game.load(enPassantFen); 

            $status.html('흑이 C7에서 C5로 움직였습니다! 이제 D5 폰으로 앙파상을 시도하세요.');
        }, 1000); 
    }
    // ⭐⭐ 앙파상 시연 로직 끝 ⭐⭐
    
    // ⭐⭐ 핵심 수정 부분: 클릭 이벤트 리스너 재부착 ⭐⭐
    // 모든 .square-55d63 (체스 칸)에 클릭 이벤트를 바인딩
    $('#board').off('click', '.square-55d63').on('click', '.square-55d63', function() {
        var square = Chessboard.getSquare(this);
        handleSquareClick(square);
    });
}


// 9. 초기화 및 이벤트 리스너 설정
$(document).ready(function() {
    if ($('.chessboard-area h2').length === 0) {
        $('.chessboard-area').prepend('<h2></h2>');
    }
    updateStepContent(); 
    $(window).on('resize', board.resize);
});
