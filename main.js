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
var squareToHighlight = null; // 클릭한 기물이 있는 칸
var highlightedSquares = []; // 합법적인 수가 표시된 칸 목록

// 2. 체스보드 초기화 옵션 (함수 추가)
var config = {
    draggable: true, 
    position: 'start', 
    onDrop: onDrop,            // 기물을 드래그 앤 드롭했을 때
    onSnapEnd: onSnapEnd,
    // === 추가된 이벤트 핸들러 ===
    onDragStart: onDragStart,  // 기물 드래그 시작 시
    onMouseoverSquare: onMouseoverSquare, // 마우스가 칸 위에 있을 때 (합법적 수 표시)
    onMouseoutSquare: onMouseoutSquare,   // 마우스가 칸에서 벗어났을 때
    // ===========================
    pieceTheme: 'img/{piece}.png' 
};

// =========================================================
// === 3. 이벤트 핸들러 함수 (합법적 수 표시 및 클릭 행마 관련) ===
// =========================================================

// 현재 턴의 기물만 드래그 가능하도록 설정
function onDragStart (source, piece, position, orientation) {
    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search('w') === -1) ||
        (game.turn() === 'b' && piece.search('b') === -1)) {
        return false;
    }
}

// 마우스가 칸 위에 있을 때 (합법적인 수 표시)
function onMouseoverSquare (square, piece) {
    // 1. 현재 선택한 기물의 합법적인 수 가져오기
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    // 2. 현재 기물이 있는 칸을 하이라이트
    greySquare(square);

    // 3. 이동 가능한 모든 칸을 하이라이트
    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
}

// 마우스가 칸에서 벗어났을 때 (하이라이트 제거)
function onMouseoutSquare () {
    removeGreySquares();
}

// 칸에 회색 점(합법적인 수 표시)을 추가
function greySquare (square) {
    var $square = $('#board .square-' + square);
    
    // 점 스타일로 변경 (CSS에서 .highlight-dot 스타일을 미리 정의해야 함)
    // 여기서는 간단하게 배경색만 변경
    var highlightColor = 'rgba(100, 100, 100, 0.4)'; 
    if ($square.hasClass('black-3c85d') === true) {
        highlightColor = 'rgba(100, 100, 100, 0.3)';
    }

    // 만약 이동 가능한 칸이라면 (점 대신 배경색 변경으로 구현)
    if (game.get(square) === null || game.get(square).color !== game.turn()) {
        $square.css('background', highlightColor);
    } 
    // 기물이 있는 칸 (시작점)
    else {
        $square.css('box-shadow', 'inset 0 0 10px #f68b37'); // 클릭한 기물 강조
    }
    
    // 클릭 이벤트를 바인딩하여 해당 칸으로 이동하도록 설정
    // 이 부분이 '점을 누르면 행마' 기능을 구현합니다.
    $square.off('click').on('click', function() {
        // 이미 기물이 선택된 상태라면 해당 칸으로 이동 시도
        if (squareToHighlight) {
            handleSquareClick(squareToHighlight, square);
        }
    });
}

// 모든 회색 점(하이라이트)을 제거
function removeGreySquares () {
    $('#board .square').css('background', '');
    $('#board .square').css('box-shadow', '');
    
    // 클릭 이벤트 바인딩 해제
    $('#board .square').off('click');
}

// 칸 클릭을 처리하여 행마를 시도하는 함수
function handleSquareClick(source, target) {
    // 1. 퍼즐 모드인 경우 onDrop 로직 재활용
    if (currentStep && currentStep.expectedMove) {
        // onDrop 함수의 로직을 그대로 사용하고, 'snapback'이 반환되면 아무것도 하지 않음.
        // chessboard.js가 아닌 수동으로 행마를 실행하므로, onDrop은 단순 검증용으로만 사용.
        const result = onDrop(source, target);
        
        if (result !== 'snapback') {
            // 행마가 유효하고 정답인 경우, 보드를 업데이트합니다.
            board.move(source + '-' + target); 
            // squareToHighlight는 다음 턴을 위해 초기화합니다.
            squareToHighlight = null; 
        }
        removeGreySquares();
        return;
    }
    
    // 2. 일반 모드인 경우
    var move = game.move({ from: source, to: target, promotion: 'q' });

    if (move === null) {
        // 유효하지 않은 이동인 경우
        removeGreySquares();
        squareToHighlight = null;
        return;
    }

    // 유효한 이동인 경우
    board.move(source + '-' + target);
    removeGreySquares();
    squareToHighlight = null; // 이동 완료 후 초기화
    
    // 피드백 메시지 업데이트
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $status.html(`성공적으로 수를 두었습니다: ${move.san}. 다른 행마도 테스트해보세요.`);
}

// =========================================================
// === 4. 기존 함수들 (onDrop은 이제 드래그앤드롭 시에만 사용) ===
// =========================================================

// 기물 이동 시 (onDrop 함수 - 드래그 앤 드롭 전용)
function onDrop (source, target) {
    // 1. 현재 단계가 정답을 요구하는 퍼즐 모드인지 확인
    if (currentStep && currentStep.expectedMove) {
        const expected = currentStep.expectedMove;
        
        if (source === expected.from && target === expected.to) {
            // 정답인 경우: move를 시도
            const move = game.move({ from: source, to: target, promotion: 'q' });
            
            if (move === null) return 'snapback'; 

            $feedbackPanel.removeClass('feedback-incorrect').addClass('feedback-correct');
            $status.html('정답입니다! 다음 단계로 이동 버튼을 눌러주세요.');
            $('#next-step-btn').show(); 
            
            return; 

        } else {
            // 정답이 아닌 경우
            $feedbackPanel.addClass('feedback-incorrect').removeClass('feedback-correct');
            $status.html('아닙니다. 다른 행마를 시도하여 정답을 찾아보세요.');
            
            return 'snapback'; 
        }
    }

    // 2. 일반 이론 모드 (expectedMove가 없는 경우)
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
        // 다음 세부 단계가 남아있다면 로드
        removeGreySquares(); // 다음 단계 로드 전 하이라이트 제거
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
// === 8. 화면 업데이트 (updateStepContent) 함수 - 앙파상 시연 포함 ===
// =========================================================

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
    $hintText.slideUp();
    
    // 체스보드 설정 및 로드
    config.position = currentStep.fen;
    config.draggable = true; 
    
    if (board) {
        board.destroy();
    }
    board = Chessboard('board', config);
    game = new Chess(currentStep.fen); 
    
    // '다음 단계로 이동' 버튼 추가/업데이트
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

    // ⭐⭐ 앙파상 시연 로직 (Step ID: '2.2') ⭐⭐
    if (currentStep.stepId === '2.2') {
        $('#next-step-btn').hide(); 
        
        setTimeout(function() {
            // 1. 시각적으로 폰 이동 애니메이션 실행 (c7->c5)
            board.move('c7-c5');
            
            // 2. 움직인 후, 게임 객체(chess.js)의 상태를 앙파상 가능 상태로 업데이트
            const enPassantFen = '8/8/8/2pP4/8/8/8/K7 w - c6 0 2'; 
            game.load(enPassantFen); 

            $status.html('흑이 C7에서 C5로 움직였습니다! 이제 D5 폰으로 앙파상을 시도하세요.');
        }, 1000); 
    }
    // ⭐⭐ 앙파상 시연 로직 끝 ⭐⭐
    
    // 기물 클릭을 처리하여 합법적인 수 표시를 위한 이벤트 바인딩
    $('#board').off('click', '.square-55d63').on('click', '.square-55d63', function() {
        var square = Chessboard.getSquare(this);
        
        // 현재 턴의 기물 클릭 시: 합법적인 수 표시
        if (game.get(square) && game.get(square).color === game.turn()) {
            removeGreySquares(); // 기존 하이라이트 제거
            squareToHighlight = square; // 현재 클릭한 기물의 칸 저장
            
            var moves = game.moves({ square: square, verbose: true });
            
            // 이동 가능한 칸 하이라이트
            for (var i = 0; i < moves.length; i++) {
                greySquare(moves[i].to);
            }
            // 기물이 있는 칸 강조
            greySquare(square); 
        } 
        // 하이라이트된 빈칸 또는 상대 기물 클릭 시: 행마 시도
        else if (squareToHighlight) {
            handleSquareClick(squareToHighlight, square);
        }
    });
}


// 9. 초기화 및 이벤트 리스너 설정
$(document).ready(function() {
    // <h2> 태그가 index.html에 없으면 추가합니다.
    if ($('.chessboard-area h2').length === 0) {
        $('.chessboard-area').prepend('<h2></h2>');
    }
    updateStepContent(); // 첫 단계 로드
    $(window).on('resize', board.resize);
});
