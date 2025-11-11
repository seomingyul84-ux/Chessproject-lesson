// main.js 파일 전체 코드 (최종 수정 버전 - DOM 직접 삽입 및 오류 방지)

// 1. 초기 설정 및 DOM 요소 캐시
var board = null;
var game = new Chess(); 
var $feedbackPanel = $('#feedback-panel');
var $status = $('#feedback-message');
var $lessonDesc = $('#lesson-description');
var $hintText = $('#hint-text');
var $contentPanel = $('#content-panel');

var squareToHighlight = null; 

// 2. 체스보드 초기화 옵션
var config = {
    draggable: false, // 드래그 앤 드롭 기능 비활성화
    position: 'start', 
    onDrop: onDrop,           
    onSnapEnd: onSnapEnd,
    onDragStart: onDragStart,  
    pieceTheme: 'img/{piece}.png' 
};

// =========================================================
// === 3. 이벤트 핸들러 함수 (클릭 기반 이동 및 해제 로직) ===
// =========================================================

function onDragStart (source, piece, position, orientation) {
    return false; 
}

// ⭐ 수정: highlightSquare 함수가 클래스 대신 .move-dot을 삽입하도록 변경
function highlightSquare (square, isTarget = false) {
    var $square = $('#board .square-' + square);
    
    if (isTarget) {
        // 이동 가능 칸인 경우 실제 DOM 요소를 삽입합니다.
        if($square.find('.move-dot').length === 0) { // 중복 삽입 방지
             $square.append('<div class="move-dot"></div>');
        }
    } 
    else {
        $square.addClass('highlight-source'); // 선택된 기물 하이라이트
    }
}

// ⭐ 수정: .move-dot을 제거하도록 로직 추가
function removeHighlights () {
    // 하이라이트 클래스 제거
    $('#board .square').removeClass('highlight-source highlight-target'); 
    // 삽입된 점 요소 제거
    $('#board .square .move-dot').remove(); 
}

// 칸 클릭을 처리하여 행마를 시도하는 핵심 함수
function handleSquareClick(square) {
    // 1. 현재 선택된 기물이 없음 (새로운 기물 선택 시도)
    if (squareToHighlight === null) {
        if (game.get(square) && game.get(square).color === game.turn()) {
            // 기물 선택: 하이라이트 및 이동 가능 칸 표시
            squareToHighlight = square;
            highlightSquare(square);
            
            var moves = game.moves({ square: square, verbose: true });
            for (var i = 0; i < moves.length; i++) {
                highlightSquare(moves[i].to, true); // 이동 가능 칸 점 표시
            }
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
                board.move(source + '-' + target); 
                squareToHighlight = null; 
            }
            removeHighlights();
            return;
        }
        
        // 일반 모드 이동
        var move = game.move({ from: source, to: target, promotion: 'q' });

        if (move === null) {
            // 유효하지 않은 이동인 경우, 현재 턴의 기물을 클릭했다면 선택 변경
            if (game.get(square) && game.get(square).color === game.turn()) {
                removeHighlights();
                squareToHighlight = null; 
                handleSquareClick(square); // 선택 변경을 위해 재귀 호출
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

// 4. 기물 이동 시 (onDrop 함수 - 클릭 이벤트에서만 호출됨)
function onDrop (source, target) {
    // 1. 퍼즐 모드 정답 확인
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

    // 2. 일반 이론 모드 
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
        removeHighlights(); 
        squareToHighlight = null; 
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

// 7. 기물 스냅백 방지 (보드와 게임 상태 동기화)
function onSnapEnd () {
    board.position(game.fen());
}

// =========================================================
// === 8. 화면 업데이트 (updateStepContent) 함수 ===
// =========================================================

function updateStepContent() {
    if (typeof currentLesson === 'undefined') {
        console.error("ERROR: lessons.js 파일이 로드되지 않았거나 변수 정의에 문제가 있습니다.");
        $status.html("오류: 레슨 데이터를 찾을 수 없습니다.");
        return;
    }
    
    currentStep = currentLesson.steps[currentStepIndex];

    $('.chessboard-area h2').text(`[${currentStepIndex + 1}/${currentLesson.steps.length}] ${currentLesson.title} - ${currentStep.title}`);
    
    $lessonDesc.html(currentStep.description); 
    $hintText.html(currentStep.hint);
    
    removeHighlights(); // 매 단계 로드 시 기존 하이라이트 제거
    squareToHighlight = null; // 선택 상태 초기화

    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $hintText.slideUp();
    
    // 체스보드 설정 및 로드
    config.position = currentStep.fen;
    config.draggable = false; 
    
    if (board) {
        board.destroy();
    }
    board = Chessboard('board', config);
    game = new Chess(currentStep.fen); 
    
    // 다음 단계 버튼 초기화
    $('#next-step-btn').hide(); 
    
    let defaultStatusMessage = '체스보드에서 행마를 테스트하고 다음 단계로 이동하세요.';
    
    if (currentStep.expectedMove) {
        defaultStatusMessage = '정확한 행마를 찾아 정답을 맞혀야 다음 단계로 넘어갈 수 있습니다.';
    } else {
        $('#next-step-btn').show(); 
    }
    
    $status.html(defaultStatusMessage);

    // 앙파상 시연 로직 (Step ID: '2.2')
    if (currentStep.stepId === '2.2') {
        $('#next-step-btn').hide(); 
        
        setTimeout(function() {
            board.move('c7-c5');
            
            const enPassantFen = '8/8/8/2pP4/8/8/8/K7 w - c6 0 2'; 
            game.load(enPassantFen); 
            board.position(enPassantFen); 

            $status.html('흑이 C7에서 C5로 움직였습니다! 이제 D5 폰으로 앙파상을 시도하세요.');
        }, 1000); 
    }
}


// 9. 초기화 및 이벤트 리스너 설정
$(document).ready(function() {
    
    $('#next-step-btn').on('click', loadNextStep);
    
    updateStepContent(); // 첫 단계 로드
    
    $('#board').off('click', '.square-55d63').on('click', '.square-55d63', function() {
        
        // ⭐ 오류 해결: board.getSquare 대신 Chessboard.getSquare 정적 함수 사용 재시도
        if (typeof Chessboard.getSquare === 'function') {
            var square = Chessboard.getSquare(this);
            handleSquareClick(square);
        } else {
            console.error("Chessboard.getSquare is not available. Check library load.");
        }
    });

    $(window).on('resize', function() {
        if(board) board.resize();
    });
});
