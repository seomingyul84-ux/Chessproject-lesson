// main.js 파일 전체 코드 (최종 안정화 버전 - requestAnimationFrame 적용)

// 1. 초기 설정 및 DOM 요소 캐시
var board = null;
var game = new Chess(); 
var $feedbackPanel = $('#feedback-panel');
var $status = $('#feedback-message');
var $lessonDesc = $('#lesson-description');
var $hintText = $('#hint-text');
var $contentPanel = $('#content-panel');

var squareToHighlight = null; 
// var currentLesson; // lessons.js에서 정의됨
var currentStep = null; 
var currentStepIndex = 0; 

// 2. 체스보드 초기화 옵션
var config = {
    draggable: false, 
    position: 'start', 
    onDrop: onDrop,           
    onSnapEnd: onSnapEnd,
    onDragStart: onDragStart,  
    pieceTheme: 'img/{piece}.png',
    
    // ⭐️ 애니메이션 시간을 0ms로 설정 (즉시 이동)
    animationDuration: 0 
};

// =========================================================
// === 3. 이벤트 핸들러 함수 및 유틸리티 ===
// =========================================================

function onDragStart (source, piece, position, orientation) {
    // 퍼즐 모드일 때는 드래그를 막고 클릭으로만 처리
    return false; 
}

// ⭐️ 좌표 추출 함수
function getSquareFromDOM(element) {
    var classList = $(element).attr('class').split(' ');
    for (var i = 0; i < classList.length; i++) {
        var className = classList[i];
        
        if (className.substring(0, 7) === 'square-') {
            var square = className.substring(7); 
            if (square.length === 2 && square.match(/^[a-h][1-8]$/)) { 
                return square; 
            }
        }
    }
    return null; 
}

// highlightSquare 함수: .move-dot을 삽입하여 점 표시
function highlightSquare (square, isTarget = false) {
    var $square = $('#board .square-' + square);
    
    if (isTarget) {
        if($square.find('.move-dot').length === 0) { 
             $square.append('<div class="move-dot"></div>');
        }
    } 
    else {
        $square.addClass('highlight-source'); 
    }
}

// ⭐️ removeHighlights 함수 최종 수정 (requestAnimationFrame 적용)
function removeHighlights () {
    // ⭐️ requestAnimationFrame으로 래핑하여 브라우저의 다음 페인트 직전에 실행되도록 보장
    window.requestAnimationFrame(function() {
        // 클린업 실행
        $('#board .square').removeClass('highlight-source highlight-target'); 
        $('#board .square .move-dot').remove();
        
        // 추가 조치: CSS Transition을 0ms로 강제 설정하여 지연 방지 (안전 장치)
        // 렌더링 지연이 CSS 애니메이션 완료를 기다리는 것으로 오해할 경우를 대비
        $('#board .piece').css('transition', 'none'); 
        
        // ⭐️ 강제 리플로우 유도 (이전 단계의 코드 유지)
        $('#board')[0].offsetHeight; 
        
        // 100ms 후 transition 속성을 다시 원래대로 복구 (추후 이동 애니메이션을 위해)
        setTimeout(function() {
            $('#board .piece').css('transition', ''); // CSS 파일 설정을 따름
        }, 100);
    });
}

// 칸 클릭을 처리하여 행마를 시도하는 핵심 함수
function handleSquareClick(square) {
    // 1. 현재 선택된 기물이 없음 (새로운 기물 선택 시도)
    if (squareToHighlight === null) {
        if (game.get(square) && game.get(square).color === game.turn()) {
            squareToHighlight = square;
            highlightSquare(square);
            
            var moves = game.moves({ square: square, verbose: true });
            for (var i = 0; i < moves.length; i++) {
                highlightSquare(moves[i].to, true); 
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
            } else {
                board.position(game.fen()); 
            }
            
            // ⭐️ 즉시 클린업 (setTimeout 제거)
            removeHighlights(); 
            return; 
        }
        
        // 일반 모드 이동
        var move = game.move({ from: source, to: target, promotion: 'q' });

        if (move === null) {
            board.position(game.fen()); 
            
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
        
        // ⭐️ 즉시 클린업 (setTimeout 제거)
        removeHighlights(); 
        
        squareToHighlight = null; 
        
        $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
        $status.html(`성공적으로 수를 두었습니다: ${move.san}. 다른 행마도 테스트해보세요.`);
    }
}

// 4. 기물 이동 시 (onDrop 함수)
function onDrop (source, target) {
    if (currentStep && currentStep.expectedMove) {
        const expected = currentStep.expectedMove;
        
        if (source === expected.from && target === expected.to) {
            // promotion: 'q'를 통해 폰이 8랭크에 도달하면 퀸으로 자동 승격
            const move = game.move({ from: source, to: target, promotion: 'q' }); 
            if (move === null) return 'snapback'; 

            $feedbackPanel.removeClass('feedback-incorrect').addClass('feedback-correct');
            $status.html('정답입니다! 다음 단계로 이동 버튼을 눌러주세요.');
            $('#next-step-btn').show(); 
            
            return 'correct'; 
        } else {
            $feedbackPanel.addClass('feedback-incorrect').removeClass('feedback-correct');
            $status.html('아닙니다. 다른 행마를 시도하여 정답을 찾아보세요.');
            
            return 'snapback'; 
        }
    }

    var move = game.move({ from: source, to: target, promotion: 'q' }); 
    if (move === null) return 'snapback'; 
    
    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $status.html(`성공적으로 수를 두었습니다: ${move.san}. 다른 행마도 테스트해보세요.`);
    return 'success'; 
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
    // 애니메이션이 0ms이므로 즉시 동기화됩니다.
    board.position(game.fen());
}

// =========================================================
// === 8. 화면 업데이트 (updateStepContent) 함수 ===
// =========================================================

function updateStepContent() {
    // lessons.js에서 정의된 currentLesson 전역 변수를 사용
    if (typeof currentLesson === 'undefined' || !currentLesson.steps) { 
        $status.html("오류: 레슨 데이터를 찾을 수 없거나 형식이 잘못되었습니다.");
        return;
    }
    
    currentStep = currentLesson.steps[currentStepIndex];

    $('.chessboard-area h2').text(`[${currentStepIndex + 1}/${currentLesson.steps.length}] ${currentLesson.title} - ${currentStep.title}`);
    
    $lessonDesc.html(currentStep.description); 
    $hintText.html(currentStep.hint);
    
    removeHighlights(); 
    squareToHighlight = null; 

    $feedbackPanel.removeClass('feedback-correct feedback-incorrect');
    $hintText.slideUp();
    
    config.position = currentStep.fen;
    
    // 퍼즐(expectedMove)이 있을 때만 클릭으로 이동이 가능하게 설정
    config.draggable = !!currentStep.expectedMove; 
    
    // 기존 보드를 파괴하고 새 보드를 생성
    if (board) {
        board.destroy();
    }
    board = Chessboard('board', config);
    game = new Chess(currentStep.fen); 
    
    $('#next-step-btn').hide(); 
    
    let defaultStatusMessage = '체스보드에서 행마를 테스트하고 다음 단계로 이동하세요.';
    
    if (currentStep.expectedMove) {
        defaultStatusMessage = '정확한 행마를 찾아 정답을 맞혀야 다음 단계로 넘어갈 수 있습니다.';
    } else {
        // 이론 단계에서는 바로 다음 단계로 이동 가능
        $('#next-step-btn').show(); 
    }
    
    $status.html(defaultStatusMessage);

    // 앙파상 시연 로직 (Step ID: '2.2')
    if (currentStep.stepId === '2.2') {
        $('#next-step-btn').hide(); 
        
        setTimeout(function() {
            // 흑이 폰을 2칸 전진 (c7-c5)
            board.move('c7-c5');
            
            // FEN 업데이트: 앙파상으로 잡을 수 있는 상태로 변경 (c6에 앙파상 타겟)
            // '8/8/8/2pP4/8/8/8/K7 w - c6 0 2'
            const enPassantFen = game.fen();
            game.load(enPassantFen); 
            board.position(enPassantFen); 

            $status.html('흑이 C7에서 C5로 움직였습니다! 이제 D5 폰으로 앙파상을 시도하세요.');
        }, 1000); 
    }
}


// 9. 초기화 및 이벤트 리스너 설정
$(document).ready(function() {
    
    $('#next-step-btn').on('click', loadNextStep);
    
    // ⭐️ 오류 검증: currentLesson 변수의 존재 유무만 확인합니다.
    if (typeof currentLesson === 'undefined' || !currentLesson.steps) {
        $('#board').html('<p style="text-align: center; color: red;">체스보드 로드 실패: lessons.js 파일에 문제가 있습니다.</p>');
        $status.html("오류: 레슨 데이터를 찾을 수 없거나 형식이 잘못되었습니다.");
        return;
    }

    updateStepContent(); // 첫 단계 로드
    
    // ⭐️ 최종 안정화: document에 이벤트 위임을 사용하여 클릭이 작동하도록 보장
    $(document).off('click', '#board .square-55d63').on('click', '#board .square-55d63', function() {
        
        var square = getSquareFromDOM(this);

        if (square) {
            handleSquareClick(square);
        } else {
            console.error("Critical Error: Failed to determine square from DOM.");
        }
    });
    
    // 힌트 버튼 클릭 이벤트 연결
    $('#toggle-hint-btn').on('click', toggleHint);

    $(window).on('resize', function() {
        if(board) board.resize();
    });
});
